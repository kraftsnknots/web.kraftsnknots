// src/pages/Accounts.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getApp } from "firebase/app";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../features/userSlice";
import "./styles/Accounts.css";
import "./styles/AccountSkeleton.css";
import MyOrders from "./MyOrders";
import CustomerCare from "./CustomerCare";
import Wishlist from "./Wishlist";
import ShippingAddresses from "./shippingAddresses";

export default function Accounts() {
  const { user } = useSelector((state) => state.user);
  const db = getFirestore(getApp());
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [link, setLink] = useState('my-orders');

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    photoURL: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!user?.uid) return;
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setProfile(snap.data());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  if (loading) {
    return (
      <div className="profile-skeleton-container">
        {/* Left Profile Card */}
        <div className="profile-skeleton-card">
          <div className="skeleton skeleton-photo" />
          <div className="skeleton skeleton-name" />
          <div className="skeleton skeleton-email" />
          <div className="skeleton skeleton-phone" />

          <div className="skeleton skeleton-btn primary" />
          <div className="skeleton skeleton-btn secondary" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="profile-layout"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* ---- Profile Card ---- */}
      <div className="profile-card">
        <div className="d-flex justify-content-between align-items-center gap-1">
          <div className="profile-image-section">
            <img
              src={
                profile.photoURL ||
                "https://cdn-icons-png.flaticon.com/512/1077/1077012.png"
              }
              alt="Display Picture"
              className="profile-avatar"
            />
          </div>
          <div
            className="d-flex flex-column justify-content-center align-items-start"
            style={{ height: 80, marginBottom: "1rem" }}
          >
            <h3 className="profile-name">{profile.name}</h3>
            <small className="profile-id">{user.uid}</small>
          </div>
        </div>

        <div className="d-flex flex-column justify-content-between align-items-start p-2">
          <p className="profile-email">
            <i className="bi bi-envelope"></i>{' '}E-mail: {profile.email}</p>
          {profile.phone && <p className="profile-phone">
            <i className="bi bi-telephone"></i>{' '}Phone: {profile.phone}</p>}
        </div>

        {/* ---- Sidebar Menu ---- */}
        <div className="profile-sidebar">
          <ul className="profile-menu">
            <li className={`menu-item ${link === 'my-orders' && 'active'}`} onClick={() => setLink('my-orders')}>
              <i className="bi bi-file-earmark-text"></i> My Orders
            </li>
            <li className={`menu-item ${link === 'ccare' && 'active'}`} onClick={() => setLink('ccare')}>
              <i className="bi bi-headset"></i> Customer Care
            </li>
            <li className={`menu-item ${link === 'scards' && 'active'}`} onClick={() => setLink('scards')}>
              <i className="bi bi-credit-card"></i> Saved Cards
            </li>
            <li className={`menu-item ${link === 'saddresses' && 'active'}`} onClick={() => setLink('saddresses')}>
              <i className="bi bi-pin-map"></i> Addresses
            </li>
            {/* <li className={`menu-item ${link === 'gcards' && 'active'}`} onClick={() => setLink('gcards')}>
              <i className="bi bi-gift"></i> Gift Cards
            </li> */}
            <li className={`menu-item ${link === 'wishlist' && 'active'}`} onClick={() => setLink('wishlist')}>
              <i className="bi bi-heart"></i> Wishlist
            </li>
            <li className="menu-item logout" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Logout
            </li>
          </ul>
        </div>
      </div>
      {link === "my-orders" ? <MyOrders /> : link === "ccare" ? <CustomerCare /> : link === "saddresses" ? <ShippingAddresses /> : link === "wishlist" ? <Wishlist /> : ''}
    </motion.div>
  );
}
