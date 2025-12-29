import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
    removeFromCart,
    updateCartQuantity,
    setCoupon, clearCoupon
} from "../features/cartWishlistSlice";
import "./styles/CartPage.css";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getApp } from "firebase/app";

import Header from "../components/Header";
import Reveal from "../components/Reveal";
import Footer from "../components/Footer";


const app = getApp();
const db = getFirestore(app);

export default function CartPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cart = useSelector((state) => state.cartWishlist.cart);

    const [couponCode, setCouponCode] = useState("");
    const appliedCoupon = useSelector((state) => state.cartWishlist.appliedCoupon);
    const [couponError, setCouponError] = useState("");


    // 💰 Calculate subtotal (using discountPrice)
    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => {
            const price = item.discountPrice ? item.discountPrice : item.price;
            const qty = item.quantity || 1;
            return sum + price * qty;
        }, 0);
    }, [cart]);

    // 🎁 Very simple coupon logic (you can replace with Firestore/API)
    const discountAmount = useMemo(() => {
        if (!appliedCoupon) return 0;

        if (appliedCoupon.type === "Percentage") {
            return (subtotal * appliedCoupon.value) / 100;
        }

        if (appliedCoupon.type === "Flat") {
            return appliedCoupon.value;
        }

        return 0;
    }, [appliedCoupon, subtotal]);



    const total = subtotal - discountAmount;

    const handleQuantityChange = (id, newQty) => {
        if (newQty < 1) return;
        dispatch(updateCartQuantity({ id, quantity: newQty }));
    };

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        setCouponError("");

        const code = couponCode.trim().toUpperCase();
        if (!code) {
            setCouponError("Please enter a coupon code.");
            return;
        }

        try {
            const q = query(
                collection(db, "discountCodes"),
                where("code", "==", code)
            );

            const snap = await getDocs(q);

            if (snap.empty) {
                setCouponError("Invalid coupon code.");
                dispatch(clearCoupon());
                return;
            }

            const coupon = snap.docs[0].data();

            if (coupon.status !== "Active") {
                setCouponError("This coupon is not active.");
                dispatch(clearCoupon());
                return;
            }

            dispatch(
                setCoupon({
                    code: coupon.code,
                    name: coupon.name,
                    type: coupon.type,
                    value: coupon.value,
                })
            );

            setCouponError("");

        } catch (err) {
            console.error("Coupon Error:", err);
            setCouponError("Unable to validate coupon. Please try again.");
            dispatch(clearCoupon());
        }
    };




    const handleProceedToCheckout = () => {
        if (!cart.length) return;
        navigate("/checkout");
    };

    return (<>
        <Header />
        <div className="cart-page root-bg">
            <div className="cart-container">
                <h2 className="cart-title">Shopping Cart</h2>

                {!cart.length ? (
                    <div className="cart-empty">
                        <p>Your cart is currently empty.</p>
                        <Link to="/shop" className="btn-outline-dark">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* TABLE HEADER */}
                        <div className="cart-header-row">
                            <div className="cart-col-product-header">PRODUCT</div>
                            <div className="cart-col-qty-header">QUANTITY</div>
                            <div className="cart-col-subtotal-header">SUBTOTAL</div>
                            <div className="cart-col-clear-header"></div>
                        </div>

                        {/* CART ITEMS */}
                        <div className="cart-items">
                            {cart.map((item) => {
                                const price = item.discountPrice ? item.discountPrice : item.price;
                                const qty = item.quantity || 1;
                                const lineTotal = price * qty;

                                return (
                                    <div className="cart-item-row" key={item.id}>
                                        {/* PRODUCT COLUMN */}
                                        <div className="cart-col-product">
                                            <div className="cart-product-image-wrapper">
                                                <img
                                                    src={item.images?.[0]}
                                                    alt={item.title}
                                                    className="cart-product-image"
                                                />
                                            </div>
                                            <div className="cart-product-info">
                                                <div className="cart-product-title">{item.title}</div>
                                                <div className="cart-product-price">
                                                    {item.discountPrice ?
                                                        <><small style={{ textDecorationLine: 'line-through' }}>₹ {item.price}</small> ₹ {item.discountPrice.toFixed(2)}</>
                                                        :
                                                        <> ₹ {item.price.toFixed(2)}</>
                                                    }

                                                </div>
                                            </div>
                                        </div>
                                        {/* QUANTITY COLUMN */}
                                        <div className="cart-col-qty">
                                            <div className="qty-control">
                                                <button
                                                    type="button"
                                                    className="qty-btn"
                                                    onClick={() =>
                                                        handleQuantityChange(item.id, qty - 1)
                                                    }
                                                >
                                                    −
                                                </button>
                                                <div className="qty-value">{qty}</div>
                                                <button
                                                    type="button"
                                                    className="qty-btn"
                                                    onClick={() =>
                                                        handleQuantityChange(item.id, qty + 1)
                                                    }
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* SUBTOTAL COLUMN */}
                                        <div className="cart-col-subtotal">
                                            <span>₹ {lineTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="cart-col-clear">
                                            <i class="bi bi-x-lg cart-delete" onClick={() => dispatch(removeFromCart(item.id))}></i>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* COUPON + UPDATE CART */}
                        <div className="cart-coupon-row">
                            <form
                                className="cart-coupon-form "
                                onSubmit={handleApplyCoupon}
                                autoComplete="off"
                            >
                                <input
                                    type="text"
                                    placeholder="Coupon Code"
                                    className="cart-coupon-input"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                />
                                <button type="submit" className="btn-dark">
                                    APPLY
                                </button>
                            </form>
                            {couponError && (
                                <p className="cart-coupon-error">{couponError}</p>
                            )}
                            {appliedCoupon && (
                                <p className="cart-coupon-applied">
                                    Applied <strong>{appliedCoupon.code}</strong> —
                                    {appliedCoupon.name} (
                                    {appliedCoupon.type === "Percentage"
                                        ? `${appliedCoupon.value}% off`
                                        : ` ₹ ${appliedCoupon.value} off`}
                                    )
                                </p>
                            )}

                        </div>

                        {/* CART TOTAL SECTION */}
                        <div className="cart-total-section">
                            <h3 className="cart-total-title">CART TOTAL</h3>

                            <div className="cart-total-table">
                                <div className="cart-total-row">
                                    <div className="cart-total-label">SUBTOTAL</div>
                                    <div className="cart-total-value">
                                        ₹ {subtotal.toFixed(2)}
                                    </div>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="cart-total-row">
                                        <div className="cart-total-label">DISCOUNT ({appliedCoupon.code})</div>
                                        <div className="cart-total-value">− ₹ {discountAmount.toFixed(2)}</div>
                                    </div>
                                )}


                                <div className="cart-total-row">
                                    <div className="cart-total-label">TOTAL</div>
                                    <div className="cart-total-value">
                                        ₹ {total.toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* BOTTOM BUTTONS */}
                            <div className="cart-bottom-buttons">

                                <Link to="/shop" className="btn-outline-dark">
                                    CONTINUE SHOPPING
                                </Link>

                                <button
                                    className="btn-dark"
                                    onClick={handleProceedToCheckout}
                                    disabled={!cart.length}
                                >
                                    PROCEED TO CHECKOUT
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
        <Reveal><Footer /></Reveal>
    </>
    );
}
