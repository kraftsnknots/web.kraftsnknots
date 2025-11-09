// src/pages/MyOrders.jsx
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useSelector } from "react-redux";
import { Modal, Button, Image, Pagination } from "react-bootstrap";
import { IoDocumentTextOutline } from "react-icons/io5";
import "./styles/Accounts.css";

export default function MyOrders() {
  const { user } = useSelector((state) => state.user);
  const db = getFirestore(getApp());
  const storage = getStorage(getApp());

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🧾 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
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

  const handleFilterChange = (value) => {
    setFilterStatus(value);
    setCurrentPage(1);
    if (value === "all") setFilteredOrders(orders);
    else setFilteredOrders(orders.filter((o) => o?.status === value));
  };

  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const valA = new Date(a.createdAt?.seconds * 1000);
        const valB = new Date(b.createdAt?.seconds * 1000);
        return sortConfig.direction === "asc" ? valA - valB : valB - valA;
      });
    }
    return sorted;
  }, [filteredOrders, sortConfig]);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedOrders, currentPage]);

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="profile-skeleton-container">
        <div className="profile-skeleton-orders">
          <div className="skeleton skeleton-title" />
          <div className="skeleton-tab-container">
            <div className="skeleton skeleton-tab" />
            <div className="skeleton skeleton-tab" />
            <div className="skeleton skeleton-tab" />
            <div className="skeleton skeleton-tab" />
          </div>
          <div className="skeleton-table">
            {[1, 2].map((row) => (
              <div key={row} className="skeleton-table-row">
                <div className="skeleton skeleton-col short" />
                <div className="skeleton skeleton-col medium" />
                <div className="skeleton skeleton-col short" />
                <div className="skeleton skeleton-col short" />
                <div className="skeleton skeleton-col short" />
                <div className="skeleton skeleton-col medium" />
                <div className="skeleton skeleton-col icon" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="orders-card"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* ---- Orders Table ---- */}
      <div className="d-flex flex-column justify-content-between align-items-start mb-1">
        <h3>My Orders</h3>
        {orders.length > 0 &&
          <div className="sorted-buttons d-flex align-items-center justify-content-end">
            <Button
              variant={filterStatus === "all" ? "dark" : "light"}
              onClick={() => handleFilterChange("all")}
            >
              <text style={{ color: filterStatus === "all" ? "#00ff00" : "#FF3131" }}>
                ⬤
              </text>{" "}
              All Orders
            </Button>
            <Button
              variant={filterStatus === "processing" ? "dark" : "light"}
              onClick={() => handleFilterChange("processing")}
            >
              <text
                style={{ color: filterStatus === "processing" ? "#00ff00" : "#FF3131" }}
              >
                ⬤
              </text>{" "}
              Processing
            </Button>
            <Button
              variant={filterStatus === "delivered" ? "dark" : "light"}
              onClick={() => handleFilterChange("delivered")}
            >
              <text
                style={{ color: filterStatus === "delivered" ? "#00ff00" : "#FF3131" }}
              >
                ⬤
              </text>{" "}
              Delivered
            </Button>
            <Button
              variant={filterStatus === "cancelled" ? "dark" : "light"}
              onClick={() => handleFilterChange("cancelled")}
            >
              <text
                style={{ color: filterStatus === "cancelled" ? "#00ff00" : "#FF3131" }}
              >
                ⬤
              </text>{" "}
              Cancelled
            </Button>
          </div>
        }
      </div>

      {sortedOrders.length === 0 ? (
        <p className="no-orders">No orders found.</p>
      ) : (
        <div className="orders-table-container">
          <AnimatePresence mode="wait">
            <motion.table
              key={currentPage}
              className="orders-table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Items</th>
                  <th>Fulfillment</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((order) => {
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
                    <tr
                      key={order.id}
                      onClick={() => openOrderDetails(order)}
                      style={{ cursor: "pointer" }}
                    >
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
                              : "processing"
                            }`}
                        >
                          {fulfillment}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </motion.table>
          </AnimatePresence>

          {/* 🌟 Pagination */}
          {totalPages > 1 && (
            <motion.div
              className="d-flex justify-content-center mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Pagination>
                <Pagination.First
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                />
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                />
                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                />
                <Pagination.Last
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                />
              </Pagination>
            </motion.div>
          )}
        </div>
      )}

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
                    onClick={() =>
                      window.open(selectedOrder.invoiceUrl, "_blank")
                    }
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
