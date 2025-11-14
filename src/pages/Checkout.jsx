// src/pages/Checkout.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Modal,
    Spinner,
    Alert,
} from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Firebase
import { getApp } from "firebase/app";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    serverTimestamp,
    getDoc,
    doc,
    updateDoc,
    runTransaction,
    setDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Redux
import { clearCart } from "../features/cartWishlistSlice";

import "./styles/Checkout.css";

const app = getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export default function Checkout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // ================================
    // REDUX DATA
    // ================================
    const cart = useSelector((state) => state.cartWishlist.cart);
    const user = useSelector((state) => state.user.user);
    const [loading, setLoading] = useState(false);

    const [shippingTypes, setShippingTypes] = useState({
        standard: 300,
        express: 1200,
    });
    const [selectedShippingType, setSelectedShippingType] = useState("standard");

    const [customerInfo, setCustomerInfo] = useState({
        email: "",
        name: "",
        phone: "",
        shipping_address: null,
        notes: "",
    });

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    const [showAddressModal, setShowAddressModal] = useState(false);
    const [newAddress, setNewAddress] = useState({
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
    });

    const [discountCode, setDiscountCode] = useState("");
    const [discountValue, setDiscountValue] = useState(0);
    const [appliedCode, setAppliedCode] = useState("");
    const [appliedName, setAppliedName] = useState("");

    const [agreed, setAgreed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // ================================
    // Prefill user profile
    // ================================
    useEffect(() => {
        if (!user) return;

        setCustomerInfo((prev) => ({
            ...prev,
            email: user.email,
            name: user.name,
            phone: user.phone || "",
        }));
    }, [user]);

    // ================================
    // Fetch addresses once we know the user email
    // ================================
    useEffect(() => {
        if (!customerInfo.email) return;

        const fetchAddresses = async () => {
            const q = query(
                collection(db, "shippingAddresses"),
                where("email", "==", customerInfo.email)
            );
            const snap = await getDocs(q);
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

            if (list.length > 0) {
                const sorted = [...list].sort(
                    (a, b) =>
                        (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0)
                );

                setAddresses(sorted);
                setSelectedAddressId(sorted[0].id);

                setCustomerInfo((info) => ({
                    ...info,
                    shipping_address: {
                        address: sorted[0].address,
                        city: sorted[0].city,
                        state: sorted[0].state,
                        postalCode: sorted[0].postalCode,
                        country: sorted[0].country,
                    },
                }));
            }
        };

        fetchAddresses();
    }, [customerInfo.email]);

    // ================================
    // Shipping Types
    // ================================
    useEffect(() => {
        const loadShipping = async () => {
            try {
                const standard = await getDoc(doc(db, "shippingTypes", "standard"));
                const express = await getDoc(doc(db, "shippingTypes", "express"));

                setShippingTypes({
                    standard: standard.exists() ? standard.data().price : 300,
                    express: express.exists() ? express.data().price : 1200,
                });
            } catch {
                setShippingTypes({ standard: 300, express: 1200 });
            }
        };

        loadShipping();
    }, []);

    // ================================
    // Select Address
    // ================================
    const selectAddress = (id) => {
        setSelectedAddressId(id);
        const addr = addresses.find((a) => a.id === id);
        if (!addr) return;

        setCustomerInfo((info) => ({
            ...info,
            name: addr.name,
            shipping_address: {
                address: addr.address,
                city: addr.city,
                state: addr.state,
                postalCode: addr.postalCode,
                country: addr.country,
            },
        }));
    };

    // ================================
    // Save New Address
    // ================================
    const saveNewAddress = async () => {
        const current = auth.currentUser;
        if (!current) {
            setErrorMessage("You must be logged in to save an address.");
            return;
        }

        const { address, city, state, postalCode, country } = newAddress;

        if (!address || !city || !state || !postalCode || !country) {
            setErrorMessage("Fill all address fields.");
            return;
        }

        const docRef = await addDoc(collection(db, "shippingAddresses"), {
            ...newAddress,
            userId: current.uid,
            email: customerInfo.email,
            name: customerInfo.name,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        const newEntry = { id: docRef.id, ...newAddress };
        setAddresses((prev) => [newEntry, ...prev]);
        selectAddress(docRef.id);
        setShowAddressModal(false);

        setNewAddress({
            address: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
        });
    };

    // ================================
    // Cart Calculations
    // ================================
    const { subtotal, tax, totalBeforeDiscount } = useMemo(() => {
        const subtotal = cart.reduce(
            (sum, item) => sum + item.discountPrice * item.quantity,
            0
        );
        const tax = subtotal * 0.12;

        return { subtotal, tax, totalBeforeDiscount: subtotal + tax };
    }, [cart]);

    const ttotal = Math.max(totalBeforeDiscount - discountValue, 0);

    const shipping = selectedShippingType === "express"
        ? shippingTypes.express
        : shippingTypes.standard;

    const shippingCharges =
        selectedShippingType === "standard" && ttotal > 2500
            ? 0
            : shipping;

    const total = ttotal + shippingCharges;

    // ================================
    // Apply Discount Code
    // ================================
    const handleApplyDiscount = async () => {
        const code = discountCode.trim().toUpperCase();
        setErrorMessage("");

        const q = query(
            collection(db, "discountCodes"),
            where("code", "==", code)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
            setErrorMessage("Invalid code.");
            return;
        }

        const data = snap.docs[0].data();
        console.log(data);


        if (data.status !== "Active") {
            setErrorMessage("Code not active.");
            return;
        }

        let value = 0;

        if (data.type === "Percentage") {
            value = totalBeforeDiscount * (data.value / 100);
        } else if (data.type === "Flat") {
            value = data.value;
        }

        setDiscountValue(value);
        setAppliedCode(code);
        setAppliedName(data.name);
    };

    // ================================
    // Order Number Generator
    // ================================
    const getNextOrderNumber = async () => {
        const ref = doc(db, "counters", "orders");

        const next = await runTransaction(db, async (tx) => {
            const docSnap = await tx.get(ref);
            const last = docSnap.data().lastOrderNumber || 1000;
            const newNum = last + 1;
            tx.update(ref, { lastOrderNumber: newNum });
            return newNum;
        });

        return `#UA${next}`;
    };

    // ================================
    // Start Payment
    // ================================
    const startPayment = async () => {
        try {
            const orderNumber = await getNextOrderNumber();

            const razorpayOrder = await axios.post(
                "https://us-central1-ujaas-aroma.cloudfunctions.net/createRazorpayOrder",
                { amount: total * 100, receipt: `receipt_${Date.now()}` }
            );

            const options = {
                key: "rzp_test_RPpvui3mN5LNHr",
                currency: razorpayOrder.data.currency,
                amount: razorpayOrder.data.amount,
                order_id: razorpayOrder.data.id,
                name: "Ujaas Aroma",
                description: "Order Payment",
                prefill: {
                    name: customerInfo.name,
                    email: customerInfo.email,
                    contact: customerInfo.phone,
                },
                image:
                    "https://firebasestorage.googleapis.com/v0/b/ujaas-aroma.appspot.com/o/logos%2FPicture1.png?alt=media",
                handler: async function (paymentData) {
                    // Build Firestore document
                    const safeOrder = {
                        orderNumber,
                        orderDate: new Date().toLocaleDateString(),
                        userId: auth.currentUser.uid,
                        customerInfo,
                        cartItems: cart,
                        subtotal,
                        tax,
                        discountCode: appliedCode,
                        discountValue,
                        shipping: {
                            shippingType: selectedShippingType,
                            shippingCost: shippingCharges,
                        },
                        total,
                        payment: {
                            status: "success",
                            ...paymentData,
                        },
                        createdAt: serverTimestamp(),
                    };

                    // Save order
                    await setDoc(doc(db, "successOrders", orderNumber), safeOrder);

                    // Update address timestamp
                    if (selectedAddressId) {
                        await updateDoc(doc(db, "shippingAddresses", selectedAddressId), {
                            updatedAt: serverTimestamp(),
                        });
                    }

                    // Generate Invoice
                    const invoiceRes = await axios.post(
                        "https://us-central1-ujaas-aroma.cloudfunctions.net/generateInvoicePDF",
                        { orderDetails: safeOrder }
                    );

                    const pdfUrl = invoiceRes.data.storagePath;

                    // Store Invoice URL
                    await updateDoc(doc(db, "successOrders", orderNumber), {
                        invoiceUrl: pdfUrl,
                    });

                    // Send Confirmation Email
                    await axios.post(
                        "https://us-central1-ujaas-aroma.cloudfunctions.net/sendOrderConfirmation",
                        { orderDetails: { ...safeOrder, invoiceUrl: pdfUrl } }
                    );

                    dispatch(clearCart());
                    setLoading(false);

                    navigate("/checkout/success", {
                        state: { orderNumber, paymentId: paymentData.razorpay_payment_id },
                    });
                },

                modal: {
                    ondismiss: async function () {
                        navigate("/checkout/failure", {
                            state: { reason: "Payment cancelled by user." },
                        });
                        setLoading(false);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Payment Error:", err);
            navigate("/checkout/failure", {
                state: { reason: "Payment error occurred." },
            });
        }
    };

    // ================================
    // Handle Proceed
    // ================================
    const handleProceed = () => {
        setErrorMessage("");

        if (!customerInfo.email || !customerInfo.name || !customerInfo.phone) {
            setErrorMessage("Fill contact details.");
            return;
        }

        if (!customerInfo.shipping_address) {
            setErrorMessage("Select a shipping address.");
            return;
        }

        if (!agreed) {
            setErrorMessage("You must agree to Terms & Conditions.");
            return;
        }

        setLoading(true);
        startPayment();
    };

    // ================================
    // If Cart is Empty
    // ================================
    if (cart.length === 0) {
        return (
            <Container className="checkout-page py-5 text-center">
                <Card className="elegant-card p-4">
                    <h4>Your cart is empty</h4>
                    <Button
                        variant="dark"
                        className="rounded-pill mt-3"
                        onClick={() => navigate("/shop")}
                    >
                        Continue Shopping
                    </Button>
                </Card>
            </Container>
        );
    }

    // ================================
    // JSX Returns
    // ================================
    // ================================
    // JSX Returns (Premium Layout)
    // ================================
    return (
        <Container className="checkout-page py-5">

            {/* OVERLAY LOADER */}
            {loading && (
                <div className="checkout-overlay">
                    <div className="checkout-overlay-inner">
                        <Spinner animation="border" variant="dark" />
                        <p className="mt-3 fw-medium">Processing your payment…</p>
                    </div>
                </div>
            )}

            {/* PAGE HEADER */}
            <Row className="mb-5 text-center">
                <Col>
                    <h1 className="checkout-title">Secure Checkout</h1>
                    <p className="checkout-subtitle">
                        Complete your order with confidence ✨
                    </p>
                </Col>
            </Row>

            {/* ERROR MESSAGE */}
            {errorMessage && (
                <Alert variant="danger" onClose={() => setErrorMessage("")} dismissible>
                    {errorMessage}
                </Alert>
            )}

            <Row className="gx-5">

                {/* LEFT SECTION */}
                <Col lg={7}>

                    {/* CONTACT */}
                    <Card className="elegant-card section-card mb-4">
                        <h4 className="section-title">Contact Details</h4>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control value={customerInfo.email} readOnly />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Full Name</Form.Label>
                                        <Form.Control
                                            value={customerInfo.name}
                                            onChange={(e) =>
                                                setCustomerInfo({ ...customerInfo, name: e.target.value })
                                            }
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Phone Number</Form.Label>
                                        <Form.Control
                                            value={customerInfo.phone}
                                            onChange={(e) =>
                                                setCustomerInfo({ ...customerInfo, phone: e.target.value })
                                            }
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </Card>

                    {/* SHIPPING ADDRESSES */}
                    <Card className="elegant-card section-card mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h4 className="section-title">Shipping Address</h4>
                            <Button variant="link" className="add-link" onClick={() => setShowAddressModal(true)}>
                                + Add New
                            </Button>
                        </div>

                        {addresses.length === 0 && (
                            <p className="text-muted small">No saved addresses yet.</p>
                        )}

                        {addresses.map((addr) => (
                            <div
                                key={addr.id}
                                className={`address-item ${selectedAddressId === addr.id ? "active" : ""}`}
                                onClick={() => selectAddress(addr.id)}
                            >
                                <div className="address-radio">
                                    <input
                                        type="radio"
                                        checked={selectedAddressId === addr.id}
                                        onChange={() => selectAddress(addr.id)}
                                    />
                                </div>

                                <div className="address-details">
                                    <div className="fw-semibold">{addr.name}</div>
                                    <div className="address-text">
                                        {addr.address}, {addr.city}, {addr.state}, {addr.postalCode},{" "}
                                        {addr.country}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Card>

                    {/* NOTES */}
                    <Card className="elegant-card section-card mb-4">
                        <h4 className="section-title">Special Instructions</h4>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Add any special request for your order..."
                            onChange={(e) =>
                                setCustomerInfo({ ...customerInfo, notes: e.target.value })
                            }
                        />
                    </Card>

                    {/* SHIPPING TYPE */}
                    <Card className="elegant-card section-card mb-4">
                        <h4 className="section-title">Delivery Method</h4>

                        {["standard", "express"].map((type) => (
                            <div
                                key={type}
                                className={`shipping-option ${selectedShippingType === type ? "active" : ""}`}
                                onClick={() => setSelectedShippingType(type)}
                            >
                                <div className="shipping-radio">
                                    <input
                                        type="radio"
                                        checked={selectedShippingType === type}
                                        onChange={() => setSelectedShippingType(type)}
                                    />
                                </div>
                                <div>
                                    <div className="fw-semibold text-capitalize">{type} Delivery</div>
                                    <div className="text-muted small">
                                        ₹ {type === "standard" ? shippingTypes.standard : shippingTypes.express}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Card>

                    {/* AGREEMENT */}
                    <Card className="elegant-card section-card mb-4">
                        <Form.Check
                            className="terms-check"
                            type="checkbox"
                            label="I agree to the Terms & Conditions and Privacy Policy."
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                        />
                    </Card>
                </Col>

                {/* RIGHT SECTION */}
                <Col lg={5}>
                    <Card className="elegant-card order-summary-card p-4">
                        <h4 className="section-title mb-3">Order Summary</h4>

                        {/* ITEMS */}
                        {cart.map((item) => (
                            <div key={item.id} className="summary-item">
                                <img src={item.images?.[0]} className="summary-img" alt="" />
                                <div className="summary-info">
                                    <div className="fw-semibold">{item.title}</div>
                                    <div className="small text-muted">
                                        {item.options?.map((o) => `${o.name}: ${o.value}`).join(", ")}
                                    </div>
                                    <div className="summary-price">
                                        ₹ {(item.discountPrice * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <hr />

                        {/* DISCOUNT */}
                        <Form className="d-flex gap-2 mb-3">
                            <Form.Control
                                placeholder="Discount Code"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                            />
                            <Button variant="dark" onClick={handleApplyDiscount}>
                                Apply
                            </Button>
                        </Form>

                        {appliedCode && (
                            <div className="text-success small">
                                ✓ {appliedName}: - ₹{discountValue.toFixed(2)}
                            </div>
                        )}

                        <hr />

                        {/* TOTALS */}
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹ {subtotal.toFixed(2)}</span>
                        </div>

                        <div className="summary-row">
                            <span>GST (12%)</span>
                            <span>₹ {tax.toFixed(2)}</span>
                        </div>

                        {discountValue > 0 && (
                            <div className="summary-row discount-row">
                                <span>Discount</span>
                                <span>- ₹{discountValue.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>₹ {shippingCharges.toFixed(2)}</span>
                        </div>

                        <div className="summary-row total-row">
                            <span>Total</span>
                            <span>₹ {total.toFixed(2)}</span>
                        </div>

                        <Button
                            variant={agreed ? "dark" : "secondary"}
                            className="w-100 rounded-pill mt-4 pay-btn"
                            disabled={!agreed}
                            onClick={handleProceed}
                        >
                            Pay ₹ {total.toFixed(2)}
                        </Button>
                    </Card>
                </Col>
            </Row>

            {/* ADDRESS MODAL */}
            <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add Shipping Address</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>
                        {["address", "city", "state", "postalCode", "country"].map((f) => (
                            <Form.Group key={f} className="mb-3">
                                <Form.Label>{f.toUpperCase()}</Form.Label>
                                <Form.Control
                                    value={newAddress[f]}
                                    onChange={(e) => setNewAddress({ ...newAddress, [f]: e.target.value })}
                                />
                            </Form.Group>
                        ))}
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => setShowAddressModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="dark" onClick={saveNewAddress}>
                        Save Address
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );

}
