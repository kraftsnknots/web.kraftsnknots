// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getApp } from "firebase/app";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../features/userSlice";
import "./styles/Profile.css";
import "./styles/ProfileSkeleton.css";
import MyOrders from "./MyOrders";
import CustomerCare from "./CustomerCare";

export default function ProfilePage() {
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
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-envelope" viewBox="0 0 16 16">
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z" />
            </svg>{' '}E-mail: {profile.email}</p>
          {profile.phone && <p className="profile-phone">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-telephone" viewBox="0 0 16 16">
              <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z" />
            </svg>{' '}Phone: {profile.phone}</p>}
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
            <li className={`menu-item ${link === 'ppayments' && 'active'}`} onClick={() => setLink('ppayments')}>
              <i className="bi bi-clock-history"></i> Pending Payments
            </li>
            <li className={`menu-item ${link === 'gcards' && 'active'}`} onClick={() => setLink('gcards')}>
              <i className="bi bi-gift"></i> Gift Cards
            </li>
            <li className="menu-item logout" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Logout
            </li>
          </ul>
        </div>
      </div>
      {link === "my-orders" ? <MyOrders /> : link === "ccare" ? <CustomerCare /> : ''}
    </motion.div>
  );
}
