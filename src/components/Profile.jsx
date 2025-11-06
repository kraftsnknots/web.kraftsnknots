import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getApp } from "firebase/app";
import { logoutUser } from "../features/userSlice";
import "./styles/Profile.css";

export default function Profile() {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const db = getFirestore(getApp());

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    photoURL: "",
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.uid) return;

        // Fetch user info
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfile({
            name: data.name,
            email: data.email,
            phone: data.phone || "",
            photoURL: data.photoURL || "",
          });
        }

        // Fetch user orders
        const ordersRef = collection(db, "successOrders");
        const q = query(ordersRef, where("userId", "==", user.uid));
        const orderSnap = await getDocs(q);
        const orderList = orderSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setOrders(orderList);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleUpdate = async () => {
    if (!profile.name.trim()) return alert("Name cannot be empty");
    try {
      setUpdating(true);
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { name: profile.name });
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner" />
        <p>Loading profile...</p>
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
        <img
          src={
            profile.photoURL ||
            "https://cdn-icons-png.flaticon.com/512/1077/1077012.png"
          }
          alt="Profile"
          className="profile-avatar"
        />

        <h3 className="profile-name">{profile.name}</h3>
        <p className="profile-email">{profile.email}</p>
        {profile.phone && <p className="profile-phone">{profile.phone}</p>}

        <div className="status-row">
          <span>SMS alerts activation</span>
          <div className="status-indicator active" />
        </div>

        <button onClick={handleUpdate} disabled={updating} className="profile-save-btn">
          {updating ? "Saving..." : "Save"}
        </button>

        <button onClick={handleLogout} className="profile-logout-btn">
          Logout
        </button>
      </div>

      {/* ---- Orders Card ---- */}
      <div className="orders-card">
        <h3>My Orders</h3>
        {orders.length === 0 ? (
          <p className="no-orders">No orders found.</p>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-box">
                <div className="order-header">
                  <p>
                    <strong>{order.orderNumber}</strong> •{" "}
                    {order.orderDate || ""}
                  </p>
                  <span className="order-status">
                    {order.shipping?.status || "Processing"}
                  </span>
                </div>
                <div className="order-items">
                  {order.cartItems?.map((item, i) => (
                    <div key={i} className="order-item">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="item-thumb"
                      />
                      <div className="item-info">
                        <h5>{item.title}</h5>
                        <p>
                          ₹{item.price} × {item.quantity}
                        </p>
                        <p className="opt">
                          {item.options?.map((opt) => (
                            <span key={opt.name}>
                              {opt.name}: {opt.value}{" "}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="order-footer">
                  <p>
                    <strong>Total:</strong> ₹{order.total?.toFixed(2) || "—"}
                  </p>
                  <a
                    href={
                      order.invoiceUrl
                        ? `https://firebasestorage.googleapis.com/v0/b/ujaas-aroma.firebasestorage.app/o/${encodeURIComponent(
                            order.invoiceUrl
                          )}?alt=media`
                        : "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="invoice-link"
                  >
                    View Invoice
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
