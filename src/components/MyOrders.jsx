// src/pages/MyOrders.jsx
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { Modal, Button, Image, Pagination } from "react-bootstrap";
import { IoDocumentTextOutline } from "react-icons/io5";
import { listenToUserOrders, clearOrders } from "../features/ordersSlice";
import "./styles/Accounts.css";

export default function MyOrders() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { list: orders, status } = useSelector((state) => state.orders);

  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 🧩 Start real-time listener when user logs in
  useEffect(() => {
    if (user?.uid) {
      dispatch(listenToUserOrders(user.uid));
    }
    return () => {
      dispatch(clearOrders()); // stop listening on unmount / logout
    };
  }, [user, dispatch]);

  const filteredOrders = useMemo(() => {
    if (filterStatus === "all") return orders;
    return orders.filter((o) => o?.status === filterStatus);
  }, [orders, filterStatus]);

  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders];
    sorted.sort((a, b) => {
      const valA = new Date(a.createdAt?.seconds * 1000 || 0);
      const valB = new Date(b.createdAt?.seconds * 1000 || 0);
      return valB - valA;
    });
    return sorted;
  }, [filteredOrders]);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const currentItems = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  if (status === "loading" || status === "idle") {
    return (
      <div className="profile-skeleton-container">
        <div className="profile-skeleton-orders">
          <div className="skeleton skeleton-title" />
          <div className="skeleton-tab-container">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton skeleton-tab" />
            ))}
          </div>
          <div className="skeleton-table">
            {[1, 2].map((row) => (
              <div key={row} className="skeleton-table-row">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="skeleton skeleton-col short" />
                ))}
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
      <div className="d-flex flex-column justify-content-between align-items-start mb-1">
        <h3>My Orders</h3>
        {orders.length > 0 && (
          <div className="sorted-buttons d-flex align-items-center justify-content-end">
            {["all", "processing", "delivered", "cancelled"].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "dark" : "light"}
                onClick={() => setFilterStatus(status)}
                className="me-2"
              >
                <text
                  style={{
                    color: filterStatus === status ? "#00ff00" : "#FF3131",
                  }}
                >
                  ⬤
                </text>{" "}
                {status === "all"
                  ? "All Orders"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        )}
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
                  <th style={{paddingLeft:30}}>Order ID</th>
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
                      <td style={{paddingLeft:30}}>{order.orderNumber || "—"}</td>
                      <td>{formattedDate}</td>
                      <td>{formattedTime}</td>
                      <td>
                        <span
                          className={`status-chip ${
                            order.payment?.status === "success"
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
                          className={`status-chip ${
                            fulfillment === "delivered"
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
                  className={`status-chip ${
                    selectedOrder.shipping?.status === "delivered"
                      ? "delivered"
                      : selectedOrder.shipping?.status === "cancelled"
                      ? "cancelled"
                      : "pending"
                  }`}
                >
                  {selectedOrder.shipping?.status || "processing"}
                </span>
              </div>

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
