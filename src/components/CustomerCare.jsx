// src/pages/CustomerCare.jsx
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth } from "firebase/auth";
import { getApp } from "firebase/app";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Pagination } from "react-bootstrap";
import {
  listenToUserEnquiries,
  clearEnquiries,
  submitEnquiry,
} from "../features/enquiriesSlice";
import axios from "axios";
import "./styles/CustomerCare.css";

const MAX_MESSAGE_LENGTH = 1000;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9()+\-\s]{7,20}$/;

export default function CustomerCare() {
  const auth = getAuth(getApp());
  const dispatch = useDispatch();
  const { list: enquiries, status } = useSelector((s) => s.enquiries);

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 7;
  const user = auth.currentUser;

  // 🧠 Prefill user info
  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;
    setForm((f) => ({
      ...f,
      name: u.displayName || "",
      email: u.email || "",
    }));
  }, [auth]);

  // 🔁 Start realtime listener
  useEffect(() => {
    if (user?.uid) {
      dispatch(listenToUserEnquiries(user.uid));
    }
    return () => {
      dispatch(clearEnquiries());
    };
  }, [user, dispatch]);

  // 🧾 Derived list
  const sortedEnquiries = useMemo(() => {
    return [...enquiries].sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  }, [enquiries]);

  const totalPages = Math.ceil(sortedEnquiries.length / itemsPerPage);
  const currentItems = sortedEnquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ✏️ Form updates
  const handleChange = (key, value) => {
    if (key === "message" && value.length > MAX_MESSAGE_LENGTH) return;
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  // 🧩 Validation
  const validateAll = () => {
    const e = {};
    if (!form.message.trim()) e.message = "Message required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // 🚀 Submit enquiry
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return alert("Please fix the errors.");
    if (!user) return alert("Login required to submit a message.");

    setLoading(true);
    try {
      // Send confirmation email Cloud Function
      await axios.post(
        "https://us-central1-ujaas-aroma.cloudfunctions.net/sendContactFormConfirmation",
        { formDetails: { ...form, userId: user.uid } }
      );

      // Add to Firestore via Redux thunk
      await dispatch(
        submitEnquiry({
          userId: user.uid,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
        })
      );

      setForm((p) => ({ ...p, message: "" }));
      setAlertMessage(true);
    } catch (err) {
      console.error(err);
      alert("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    form.message.trim();

  return (
    <motion.div
      className="accounts-card"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <h2>Previous Enquiries</h2>
        <h2>Connect us Again</h2>
      </div>

      <div className="customer-care-card">
        {/* --- Form --- */}
        <form onSubmit={handleSubmit} className="ccform position-relative">
          {loading && (
            <div className="loader-div d-flex flex-column justify-content-center align-items-center">
              <div className="loader"></div>
              <div className="sending-loader"></div>
            </div>
          )}
          {alertMessage && (
            <Alert variant="success" className="d-flex justify-content-between">
              Your message has been sent!{" "}
              <i className="bi bi-x-lg" onClick={() => setAlertMessage(false)}></i>
            </Alert>
          )}

          <label>Message</label>
          <textarea
            rows="8"
            value={form.message}
            onChange={(e) => handleChange("message", e.target.value)}
            placeholder="Write your message..."
          />
          {errors.message && <p className="error-text">{errors.message}</p>}
          <div className="char-counter">
            {form.message.length} / {MAX_MESSAGE_LENGTH}
          </div>

          <div className="button-row">
            <button type="submit" disabled={!isFormValid || loading} className="send-btn">
              {loading ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>

        {/* --- Enquiries Table --- */}
        <div className="enquiry-list">
          {status === "loading" ? (
            <div className="loader-div d-flex flex-column justify-content-center align-items-center">
              <div className="loader"></div>
              <div className="fetching-loader"></div>
            </div>
          ) : sortedEnquiries.length === 0 ? (
            <p className="no-orders">No previous enquiries found.</p>
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
                      <th>Date</th>
                      <th>Time</th>
                      <th>Preview</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((enq) => {
                      const date = enq.createdAt?.seconds
                        ? new Date(enq.createdAt.seconds * 1000)
                        : new Date();
                      const formattedDate = date.toLocaleDateString();
                      const formattedTime = date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      const hasReply = !!enq.adminReply;
                      const shortPreview =
                        enq.message.length > 20
                          ? enq.message.slice(0, 20) + "..."
                          : enq.message;

                      return (
                        <React.Fragment key={enq.id}>
                          <tr
                            className={`collapsible-row ${hasReply ? "highlight-replied" : ""}`}
                            onClick={() =>
                              setExpandedId(expandedId === enq.id ? null : enq.id)
                            }
                          >
                            <td>{formattedDate}</td>
                            <td>{formattedTime}</td>
                            <td>{shortPreview}</td>
                            <td>
                              <span
                                className={`status-chip ${hasReply ? "delivered" : "pending"}`}
                              >
                                {hasReply ? "replied" : "pending"}
                              </span>
                            </td>
                          </tr>
                          <AnimatePresence>
                            {expandedId === enq.id && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <td colSpan="4" className="expanded-message-cell">
                                  <div className="expanded-message">
                                    <div className="user-message">
                                      <p className="msg-label">You said:</p>
                                      <div className="msg-bubble user-bubble">
                                        {enq.message}
                                      </div>
                                      <small className="msg-time">
                                        Sent on {formattedDate} at {formattedTime}
                                      </small>
                                    </div>

                                    {hasReply ? (
                                      <div className="admin-reply">
                                        <p className="msg-label">Support replied:</p>
                                        <div className="msg-bubble admin-bubble">
                                          {enq.adminReply}
                                        </div>
                                        <small className="msg-time">
                                          {enq.adminReplyAt
                                            ? `Replied on ${new Date(
                                                enq.adminReplyAt.seconds * 1000
                                              ).toLocaleDateString()}`
                                            : ""}
                                        </small>
                                      </div>
                                    ) : (
                                      <div className="no-reply-msg">
                                        <em>Our support team will reply soon.</em>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
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
        </div>
      </div>
    </motion.div>
  );
}
