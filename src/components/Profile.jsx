import React, { useEffect, useState, useMemo } from "react";
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
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { logoutUser } from "../features/userSlice";
import "./styles/Profile.css";
import { useNavigate } from "react-router-dom";
import { IoDocumentTextOutline } from "react-icons/io5";
import { Modal, Button, Image } from "react-bootstrap";

export default function Profile() {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const db = getFirestore(getApp());
  const storage = getStorage(getApp());
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    photoURL: "",
  });
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // 🧩 Fetch user & orders
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

        // Fetch orders
        const ordersRef = collection(db, "successOrders");
        const q = query(ordersRef, where("userId", "==", user.uid));
        const orderSnap = await getDocs(q);
        const orderList = [];

        for (const d of orderSnap.docs) {
          const orderData = d.data();
          let invoiceUrl = "#";

          if (orderData.invoiceUrl) {
            try {
              const fileRef = ref(storage, orderData.invoiceUrl);
              invoiceUrl = await getDownloadURL(fileRef);
            } catch (e) {
              console.warn("Invoice URL fetch failed:", e.message);
            }
          }

          orderList.push({
            id: d.id,
            ...orderData,
            invoiceUrl,
          });
        }

        setOrders(orderList);
        setFilteredOrders(orderList);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // 🧭 Sorting logic
  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const valA =
          sortConfig.key === "total"
            ? a.total
            : sortConfig.key === "date"
              ? new Date(a.createdAt?.seconds * 1000 || a.orderDate)
              : a[sortConfig.key];
        const valB =
          sortConfig.key === "total"
            ? b.total
            : sortConfig.key === "date"
              ? new Date(b.createdAt?.seconds * 1000 || b.orderDate)
              : b[sortConfig.key];

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredOrders, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  // 🧩 Filtering
  const handleFilterChange = (value) => {
    setFilterStatus(value);
    if (value === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((o) => o?.status === value));
    }
  };

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
    navigate("/");
  };

  // 🧾 Modal open
  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
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
        <h3 className="profile-name">{profile.name}</h3>
        <p className="profile-email">{profile.email}</p>
        {profile.phone && <p className="profile-phone">{profile.phone}</p>}

        <button
          onClick={handleUpdate}
          disabled={updating}
          className="profile-save-btn"
        >
          {updating ? "Saving..." : "Save"}
        </button>

        <button onClick={handleLogout} className="profile-logout-btn">
          Logout
        </button>
      </div>

      {/* ---- Orders Table ---- */}
      <div className="orders-card">
        <div className="d-flex flex-column justify-content-between align-items-start mb-1">
          <h3>My Orders</h3>
          <div className="sorted-buttons d-flex align-items-center justify-content-end">
            <Button variant={filterStatus === "all" ? "dark" : "light"} onClick={() => handleFilterChange('all')} >All Orders</Button>
            <Button variant={filterStatus === "processing" ? "dark" : "light"} onClick={() => handleFilterChange('processing')}>Processing</Button>
            <Button variant={filterStatus === "delivered" ? "dark" : "light"} onClick={() => handleFilterChange('delivered')}>Delivered</Button>
            <Button variant={filterStatus === "cancelled" ? "dark" : "light"} onClick={() => handleFilterChange('cancelled')}>Cancelled</Button>
          </div>
        </div>

        {sortedOrders.length === 0 ? (
          <p className="no-orders">No orders found.</p>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Items</th>
                  <th>Fulfillment</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order) => {
                  const date = order.createdAt?.seconds
                    ? new Date(order.createdAt.seconds * 1000)
                    : new Date(`${order.orderDate}T00:00:00`);
                  const formattedDate = date.toLocaleDateString();
                  const formattedTime = date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const fulfillment = order.shipping?.status || "processing";

                  return (
                    <tr key={order.id} onClick={() => openOrderDetails(order)} style={{ cursor: "pointer" }}>
                      <td>{order.orderNumber || "—"}</td>
                      <td>{formattedDate}</td>
                      <td>{formattedTime}</td>
                      <td>
                        <span
                          className={`status-chip ${order.payment?.status === "success"
                            ? "delivered"
                            : order.payment?.status === "failed"
                              ? "cancelled"
                              : "pending"
                            }`}
                        >
                          {order.payment?.status || "pending"}
                        </span>
                      </td>
                      <td>₹{order.total?.toFixed(2) || "—"}</td>
                      <td>{order.cartItems?.length || 0}</td>
                      <td>
                        <span
                          className={`status-chip ${fulfillment === "delivered"
                            ? "delivered"
                            : fulfillment === "cancelled"
                              ? "cancelled"
                              : "pending"
                            }`}
                        >
                          {fulfillment}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <IoDocumentTextOutline className="action-icon" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---- Order Details Modal ---- */}
      {selectedOrder && (
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          size="lg"
          backdrop="static"
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold">
              Order {selectedOrder.orderNumber}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="order-details-modal">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">
                  Date: {selectedOrder.orderDate}
                </span>
                <span
                  className={`status-chip ${selectedOrder.shipping?.status === "delivered"
                    ? "delivered"
                    : selectedOrder.shipping?.status === "cancelled"
                      ? "cancelled"
                      : "pending"
                    }`}
                >
                  {selectedOrder.shipping?.status || "processing"}
                </span>
              </div>

              {/* Items */}
              <div className="order-items-modal mb-3">
                {selectedOrder.cartItems?.map((item, i) => (
                  <div
                    key={i}
                    className="d-flex align-items-center border-bottom py-2"
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        objectFit: "cover",
                        marginRight: 10,
                      }}
                    />
                    <div style={{ flexGrow: 1 }}>
                      <h6 className="mb-0">{item.title}</h6>
                      <small className="text-muted">
                        Qty: {item.quantity} | ₹{item.price}
                      </small>
                      <div className="text-muted small">
                        {item.options?.map((opt) => (
                          <span key={opt.name}>
                            {opt.name}: {opt.value}{" "}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="order-summary mt-3">
                <p>
                  <strong>Subtotal:</strong> ₹{selectedOrder.subtotal || "—"}
                </p>
                <p>
                  <strong>Tax:</strong> ₹{selectedOrder.tax || "—"}
                </p>
                <p>
                  <strong>Total:</strong>{" "}
                  <span className="fw-bold text-success">
                    ₹{selectedOrder.total?.toFixed(2) || "—"}
                  </span>
                </p>
              </div>

              <div className="d-flex justify-content-end">
                {selectedOrder.invoiceUrl && (
                  <Button
                    variant="dark"
                    onClick={() => window.open(selectedOrder.invoiceUrl, "_blank")}
                  >
                    <IoDocumentTextOutline className="me-2" />
                    View Invoice
                  </Button>
                )}
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </motion.div>
  );
}
