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
import Swal from "sweetalert2";
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
import Footer from "../components/Footer";
import Reveal from "../components/Reveal";
import Header from "../components/Header";

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
    const appliedCoupon = useSelector(
        (state) => state.cartWishlist.appliedCoupon
    );

    // ================================
    // LOCAL STATE
    // ================================
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // 1 = Details, 2 = Review & Pay

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

    useEffect(() => {
        if (errorMessage) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: errorMessage,
                confirmButtonColor: "#000",
                background: "#fff",
                customClass: {
                    popup: "rounded-4 shadow-lg",
                    title: "fw-bold",
                    confirmButton: "rounded-pill px-4 py-2"
                }
            });

            setErrorMessage(""); // clear after showing alert
        }
    }, [errorMessage]);


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
            name: addr.name || info.name,
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

        // 🔥 Save to Firestore
        const docRef = await addDoc(collection(db, "shippingAddresses"), {
            ...newAddress,
            userId: current.uid,
            email: customerInfo.email,
            name: customerInfo.name,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // 🔥 IMPORTANT: Add name + userId + email into local state so UI updates immediately
        const newEntry = {
            id: docRef.id,
            ...newAddress,
            userId: current.uid,
            email: customerInfo.email,
            name: customerInfo.name,
        };

        // Update local list immediately
        setAddresses((prev) => [newEntry, ...prev]);

        // Select newly added address as active
        selectAddress(docRef.id);

        // Close modal
        setShowAddressModal(false);

        // Reset form
        setNewAddress({
            address: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
        });
    };


    // ================================
    // Cart + Discount Calculations
    // ================================
    const {
        subtotal,
        tax,
        totalBeforeDiscount,
        discountAmount,
        totalAfterDiscount,
    } = useMemo(() => {
        const totalBeforeDiscount = cart.reduce((sum, item) => {
            const price = item.discountPrice && item.discountPrice > 0
                ? item.discountPrice
                : item.price;

            return sum + price * item.quantity;
        }, 0);

        let discountAmount = 0;
        if (appliedCoupon) {
            if (appliedCoupon.type === "Percentage") {
                discountAmount = totalBeforeDiscount * (appliedCoupon.value / 100);
            } else if (appliedCoupon.type === "Flat") {
                discountAmount = appliedCoupon.value;
            }
        }

        const subtotal = Math.max(totalBeforeDiscount - discountAmount, 0);

        const tax = subtotal * 0.12;
        const totalAfterDiscount = subtotal + tax;

        return { subtotal, tax, totalBeforeDiscount, discountAmount, totalAfterDiscount };
    }, [cart, appliedCoupon]);

    const shippingBase =
        selectedShippingType === "express"
            ? shippingTypes.express
            : shippingTypes.standard;

    const shippingCharges =
        selectedShippingType === "standard" && totalAfterDiscount > 2500
            ? 0
            : shippingBase;

    const total = totalAfterDiscount + shippingCharges;

    // ================================
    // Order Number Generator
    // ================================
    const getNextOrderNumber = async () => {
        const ref = doc(db, "counters", "orders");

        const next = await runTransaction(db, async (tx) => {
            const docSnap = await tx.get(ref);
            const last = docSnap.data()?.lastOrderNumber || 1000;
            const newNum = last + 1;
            tx.update(ref, { lastOrderNumber: newNum });
            return newNum;
        });

        return `#UA${next}`;
    };

    // ================================
    // Validate Step 1 (Details)
    // ================================
    const validateStepOne = () => {
        if (!customerInfo.email || !customerInfo.name || !customerInfo.phone) {
            setErrorMessage("Please fill your contact details.");
            return false;
        }

        if (!customerInfo.shipping_address) {
            setErrorMessage("Please select a shipping address.");
            return false;
        }

        if (!agreed) {
            setErrorMessage("You must agree to Terms & Conditions.");
            return false;
        }

        setErrorMessage("");
        return true;
    };

    // ================================
    // Step 1 → Step 2
    // ================================
    const handleContinueToPayment = () => {
        if (!validateStepOne()) return;
        setCurrentStep(2);
    };

    // ================================
    // Start Payment
    // ================================
    const startPayment = async () => {
        try {
            const orderNumber = await getNextOrderNumber();

            const response = await axios.post(
                "https://us-central1-ujaas-aroma.cloudfunctions.net/createRazorpayOrder",
                { amount: total, receipt: `receipt_web_${Date.now()}` }
            );

            const order = response.data;

            const options = {
                key: "rzp_test_RPpvui3mN5LNHr",
                amount: order.amount,
                currency: order.currency,
                name: "Ujaas Aroma",
                description: "Payment for your order",
                image:
                    "https://firebasestorage.googleapis.com/v0/b/ujaas-aroma.appspot.com/o/logos%2FPicture1.png?alt=media",
                order_id: order.id,
                prefill: {
                    name: customerInfo.name,
                    email: customerInfo.email,
                    contact: customerInfo.phone,
                },
                theme: { color: "#000000" },

                handler: async function (paymentData) {
                    const safeOrderDetails = {
                        orderNumber,
                        orderDate: new Date().toLocaleDateString(),
                        userId: auth.currentUser?.uid || null,
                        customerInfo,
                        cartItems: cart.map((item) => ({
                            productId: item.id,
                            title: item.title,
                            price: item.discountPrice ? item.discountPrice : item.price,
                            quantity: item.quantity,
                            options: item.options || [],
                            image: item.images?.[0] || null,
                        })),
                        subtotal,
                        shipping: {
                            shippingType: selectedShippingType,
                            shippingCost: shippingCharges,
                        },
                        tax,
                        discountCode: appliedCoupon?.code || null,
                        discountValue: discountAmount,
                        total,
                        payment: {
                            ...paymentData,
                            status: "success",
                        },
                        status: "processing",
                        source: "website",
                        createdAt: serverTimestamp(),
                    };

                    try {
                        await setDoc(doc(db, "successOrders", orderNumber), safeOrderDetails);

                        await updateDoc(doc(db, "shippingAddresses", selectedAddressId), {
                            updatedAt: serverTimestamp(),
                        });

                        const invoiceRes = await axios.post(
                            "https://us-central1-ujaas-aroma.cloudfunctions.net/generateInvoicePDF",
                            { orderDetails: { ...safeOrderDetails, orderNumber } }
                        );

                        const pdfUrl = invoiceRes.data.storagePath;

                        if (pdfUrl) {
                            await updateDoc(doc(db, "successOrders", orderNumber), {
                                invoiceUrl: pdfUrl,
                            });
                        }

                        await axios.post(
                            "https://us-central1-ujaas-aroma.cloudfunctions.net/sendOrderConfirmation",
                            { orderDetails: { ...safeOrderDetails, invoiceUrl: pdfUrl } }
                        );

                        dispatch(clearCart());

                        navigate("/checkout/success", {
                            state: { orderNumber, paymentId: paymentData.razorpay_order_id },
                        });
                    } catch (err) {
                        console.error("Error saving order:", err);
                        alert(
                            "Payment succeeded, but order could not be saved. Please contact support."
                        );
                        setLoading(false);
                    }
                },

                modal: {
                    ondismiss: async () => {
                        const failedOrder = {
                            orderNumber,
                            orderDate: new Date().toLocaleDateString(),
                            userId: auth.currentUser?.uid || null,
                            customerInfo,
                            cartItems: cart.map((item) => ({
                                productId: item.id,
                                title: item.title,
                                price: item.discountPrice ? item.discountPrice : item.price,
                                quantity: item.quantity,
                                options: item.options || [],
                                image: item.images?.[0] || null,
                            })),
                            subtotal,
                            shipping: {
                                shippingType: selectedShippingType,
                                shippingCost: shippingCharges,
                            },
                            tax,
                            discountCode: appliedCoupon?.code || null,
                            discountValue: discountAmount,
                            total,
                            paymentAttempt: {
                                orderId: order.id,
                                status: "failed",
                                error: "User closed the payment window",
                            },
                            status: "failed",
                            createdAt: serverTimestamp(),
                        };

                        await setDoc(doc(db, "failedOrders", orderNumber), failedOrder);
                        alert("Payment Cancelled");
                    },
                },
            };

            // const razorpay = new window.Razorpay(options);
            // razorpay.open();


            setTimeout(async () => {
                const fakePaymentData = {
                    razorpay_payment_id: "test_pay_" + Date.now(),
                    razorpay_order_id: "test_order_" + Date.now(),
                    razorpay_signature: "test_signature"
                };
                console.log("⚠️ Razorpay Bypassed - Simulated successful payment");
                await options.handler(fakePaymentData);
            }, 500);

        } catch (err) {
            console.error("Error starting payment:", err);
            alert("Unable to initiate payment. Please try again later.");
        }
    };



    // ================================
    // Handle Pay (Step 2)
    // ================================
    const handlePayNow = () => {
        setErrorMessage("");
        if (!validateStepOne()) {
            setCurrentStep(1);
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
            <>
                <Header bg="linear-gradient(180deg, #f5f1f0, #fff)" />
                <Container className="checkout-empty-page py-5 text-center">
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
                <Reveal>
                    <Footer />
                </Reveal>
            </>
        );
    }

    // ================================
    // JSX
    // ================================
    return (
        <>
            <Header bg="linear-gradient(180deg, #f5f1f0, #fff)" />

            <Container className="checkout-page py-4">
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
                <Row className="mb-4 text-center">
                    <Col>
                        <h1 className="checkout-title">Checkout</h1>
                        <p className="checkout-subtitle">
                            Complete your candle purchase with a smooth, secure experience.
                        </p>
                    </Col>
                </Row>

                <Row className="gx-4 gy-4 checkout-layout-row">
                    {/* LEFT: 2-STEP PANEL */}
                    <Col lg={7}>
                        <Card className="elegant-card main-step-card">
                            {/* STEP INDICATOR */}
                            <div className="checkout-stepper">
                                <button
                                    type="button"
                                    className={`step-pill ${currentStep === 1 ? "active" : ""}`}
                                    onClick={() => setCurrentStep(1)}
                                >
                                    <span className="step-index">1</span>
                                    <span className="step-label">Details</span>
                                </button>
                                <div className="step-connector" />
                                <button
                                    type="button"
                                    className={`step-pill ${currentStep === 2 ? "active" : ""}`}
                                    disabled={currentStep === 1}
                                >
                                    <span className="step-index">2</span>
                                    <span className="step-label">Review &amp; Pay</span>
                                </button>
                            </div>

                            {/* SLIDING PANELS */}
                            <div
                                className={`step-panels-wrapper step-${currentStep}`}
                            >
                                <div className="step-panels-inner">
                                    {/* STEP 1 PANEL */}
                                    <div className="step-panel">
                                        {/* CONTACT */}
                                        <div className="section-block">
                                            <h4 className="section-title">Contact details</h4>
                                            <Form>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Email address</Form.Label>
                                                    <Form.Control
                                                        value={customerInfo.email}
                                                        readOnly
                                                        className="compact-input"
                                                    />
                                                </Form.Group>

                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Full name</Form.Label>
                                                            <Form.Control
                                                                value={customerInfo.name}
                                                                onChange={(e) =>
                                                                    setCustomerInfo({
                                                                        ...customerInfo,
                                                                        name: e.target.value,
                                                                    })
                                                                }
                                                                className="compact-input"
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Phone number</Form.Label>
                                                            <Form.Control
                                                                value={customerInfo.phone}
                                                                onChange={(e) =>
                                                                    setCustomerInfo({
                                                                        ...customerInfo,
                                                                        phone: e.target.value,
                                                                    })
                                                                }
                                                                className="compact-input"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </Form>
                                        </div>

                                        {/* SHIPPING ADDRESSES */}
                                        <div className="section-block">
                                            <div className="section-header">
                                                <h4 className="section-title">Shipping address</h4>
                                                <Button
                                                    variant="link"
                                                    className="add-link"
                                                    onClick={() => setShowAddressModal(true)}
                                                >
                                                    + Add new
                                                </Button>
                                            </div>

                                            {addresses.length === 0 && (
                                                <p className="text-muted small">
                                                    No saved addresses yet. Add one to continue.
                                                </p>
                                            )}

                                            {addresses.map((addr) => (
                                                <div
                                                    key={addr.id}
                                                    className={`address-item ${selectedAddressId === addr.id ? "active" : ""
                                                        }`}
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
                                                            {addr.address}, {addr.city}, {addr.state},{" "}
                                                            {addr.postalCode}, {addr.country}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* SPECIAL NOTES */}
                                        <div className="section-block">
                                            <h4 className="section-title">Special instructions</h4>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                className="compact-textarea"
                                                placeholder="Any gift message or special request for your order?"
                                                onChange={(e) =>
                                                    setCustomerInfo({
                                                        ...customerInfo,
                                                        notes: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        {/* SHIPPING TYPE */}
                                        <div className="section-block">
                                            <h4 className="section-title">Delivery method</h4>
                                            <div className="shipping-btns d-flex justify-content-between align-items-center">
                                                {["standard", "express"].map((type) => (
                                                    <div
                                                        key={type}
                                                        className={`shipping-option ${selectedShippingType === type ? "active" : ""
                                                            }`}
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
                                                            <div className="fw-semibold text-capitalize">
                                                                {type} delivery
                                                            </div>
                                                            <div className="text-muted small">
                                                                ₹{" "}
                                                                {type === "standard"
                                                                    ? shippingTypes.standard
                                                                    : shippingTypes.express}{" "}
                                                                {type === "standard"
                                                                    ? "· Free over ₹ 2500"
                                                                    : "· Faster delivery"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* TERMS */}
                                        <div className="section-block">
                                            <Form.Check
                                                className="terms-check"
                                                type="checkbox"
                                                label="I agree to the Terms & Conditions and Privacy Policy."
                                                checked={agreed}
                                                onChange={(e) => setAgreed(e.target.checked)}
                                            />
                                        </div>

                                        {/* CONTINUE BTN */}
                                        <div className="step-footer">
                                            <Button
                                                variant="dark"
                                                className="step-primary-btn"
                                                onClick={handleContinueToPayment}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>

                                    {/* STEP 2 PANEL */}
                                    <div className="step-panel">
                                        <div className="section-block">
                                            <h4 className="section-title">Review details</h4>

                                            <div className="review-block">
                                                <div className="review-row">
                                                    <span>Contact</span>
                                                    <span>{customerInfo.email}</span>
                                                </div>
                                                <div className="review-row">
                                                    <span>Name</span>
                                                    <span>{customerInfo.name}</span>
                                                </div>
                                                <div className="review-row">
                                                    <span>Phone</span>
                                                    <span>{customerInfo.phone}</span>
                                                </div>
                                                {customerInfo.shipping_address && (
                                                    <div className="review-row">
                                                        <span>Shipping address</span>
                                                        <span>
                                                            {customerInfo.shipping_address.address},{" "}
                                                            {customerInfo.shipping_address.city},{" "}
                                                            {customerInfo.shipping_address.state},{" "}
                                                            {customerInfo.shipping_address.postalCode},{" "}
                                                            {customerInfo.shipping_address.country}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="review-row">
                                                    <span>Delivery method</span>
                                                    <span className="text-capitalize">
                                                        {selectedShippingType} · ₹
                                                        {shippingCharges.toFixed(2)}
                                                    </span>
                                                </div>
                                                {appliedCoupon && (
                                                    <div className="review-row">
                                                        <span>Coupon</span>
                                                        <span>
                                                            {appliedCoupon.code} · {appliedCoupon.name} (
                                                            {appliedCoupon.type === "Percentage"
                                                                ? `${appliedCoupon.value}%`
                                                                : `₹${appliedCoupon.value}`}{" "}
                                                            off)
                                                        </span>
                                                    </div>
                                                )}
                                                {customerInfo.notes && (
                                                    <div className="review-row">
                                                        <span>Notes</span>
                                                        <span>{customerInfo.notes}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="section-block">
                                            <p className="text-muted small mb-2">
                                                When you tap <strong>Pay now</strong>, you’ll be taken to
                                                Razorpay to securely complete your payment.
                                            </p>
                                        </div>

                                        <div className="step-footer">
                                            <Button
                                                variant="dark"
                                                className="step-primary-btn"
                                                onClick={handlePayNow}
                                            >
                                                Pay ₹ {total.toFixed(2)}
                                            </Button>
                                            <Button
                                                variant="outline-secondary"
                                                className="step-secondary-btn"
                                                onClick={() => setCurrentStep(1)}
                                            >
                                                Back to details
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* RIGHT: ORDER SUMMARY */}
                    <Col lg={5}>
                        <Card className="elegant-card order-summary-card p-4">
                            <h4 className="section-title mb-3">Order Summary</h4>

                            {/* ITEMS */}
                            {cart.map((item) => (
                                <div key={item.id} className="summary-item">
                                    <img
                                        src={item.images?.[0]}
                                        className="summary-img"
                                        alt={item.title}
                                    />
                                    <div className="summary-info">
                                        <div className="fw-semibold">{item.title} x {item.quantity}</div>
                                        <div className="small text-muted">
                                            {item.options
                                                ?.map((o) => `${o.name}: ${o.value}`)
                                                .join(", ")}
                                        </div>
                                        <div className="summary-price">
                                            {item.discountPrice ?
                                                <> ₹ {(item.discountPrice * item.quantity).toFixed(2)}</>
                                                :
                                                <> ₹ {(item.price * item.quantity).toFixed(2)} </>
                                            }

                                        </div>
                                    </div>
                                </div>
                            ))}

                            <hr />

                            {/* COUPON INFO (READ-ONLY FROM REDUX) */}
                            {appliedCoupon ? (
                                <div className="coupon-chip mb-3">
                                    <div className="coupon-code">Coupon Code: {appliedCoupon.code}</div>
                                    <div className="coupon-meta">
                                        {appliedCoupon.name} ·{" "}
                                        {appliedCoupon.type === "Percentage"
                                            ? `${appliedCoupon.value}% off`
                                            : `₹${appliedCoupon.value} off`}
                                    </div>
                                    <div className="coupon-subtext">
                                        Applied from your cart. To change it, go back to cart.
                                    </div>
                                </div>
                            ) : (
                                <div className="coupon-hint mb-3">
                                    No discount applied. You can add a coupon on the cart page.
                                </div>
                            )}

                            <hr />

                            {/* TOTALS */}
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹ {subtotal.toFixed(2)}</span>
                            </div>

                            {discountAmount > 0 && (
                                <div className="summary-row discount-row">
                                    <span>Discount</span>
                                    <span>- ₹{discountAmount.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="summary-row">
                                <span>GST (12%)</span>
                                <span>₹ {tax.toFixed(2)}</span>
                            </div>

                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>₹ {shippingCharges.toFixed(2)}</span>
                            </div>

                            <div className="summary-row total-row">
                                <span>Total</span>
                                <span>₹ {total.toFixed(2)}</span>
                            </div>

                            {/* <Button
                                variant={currentStep === 2 && agreed ? "dark" : "secondary"}
                                className="w-100 rounded-pill mt-4 pay-btn"
                                disabled={!agreed || currentStep !== 2}
                                onClick={handlePayNow}
                            >
                                Pay ₹ {total.toFixed(2)}
                            </Button>

                            <Button
                                variant="outline-dark"
                                className="w-100 rounded-pill mt-3 back-cart-btn"
                                onClick={() => navigate("/cart")}
                            >
                                Back to cart
                            </Button> */}
                        </Card>
                    </Col>
                </Row>

                {/* ADDRESS MODAL */}
                <Modal
                    show={showAddressModal}
                    onHide={() => setShowAddressModal(false)}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Add shipping address</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form>
                            {["address", "city", "state", "postalCode", "country"].map(
                                (f) => (
                                    <Form.Group key={f} className="mb-3">
                                        <Form.Label className="text-uppercase small">
                                            {f}
                                        </Form.Label>
                                        <Form.Control
                                            value={newAddress[f]}
                                            onChange={(e) =>
                                                setNewAddress({ ...newAddress, [f]: e.target.value })
                                            }
                                            className="compact-input"
                                        />
                                    </Form.Group>
                                )
                            )}
                        </Form>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="outline-secondary"
                            onClick={() => setShowAddressModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button variant="dark" onClick={saveNewAddress}>
                            Save address
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>

            <Reveal>
                <Footer />
            </Reveal>
        </>
    );
}
