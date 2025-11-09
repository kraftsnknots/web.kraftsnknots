import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAuth
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { getApp } from "firebase/app";
import axios from "axios";
import "./styles/CustomerCare.css";

const MAX_MESSAGE_LENGTH = 1000;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9()+\-\s]{7,20}$/;

export default function CustomerCare() {
  const auth = getAuth(getApp());
  const db = getFirestore(getApp());

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [prefetching, setPrefetching] = useState(true);
  const [enquiries, setEnquiries] = useState([]);
  const [fetchingEnquiries, setFetchingEnquiries] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // 🧩 Prefill logged-in user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setPrefetching(false);
          return;
        }

        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setForm((p) => ({
            ...p,
            name: data.name || p.name,
            email: data.email || user.email || p.email,
            phone: data.phone || p.phone,
          }));
        } else {
          setForm((p) => ({ ...p, email: user.email || p.email }));
        }
      } catch (err) {
        console.warn("fetchUser error:", err);
      } finally {
        setPrefetching(false);
      }
    };
    fetchUser();
  }, [auth, db]);

  // ✏️ Field change
  const handleChange = (key, value) => {
    if (key === "message" && value.length > MAX_MESSAGE_LENGTH) return;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  // ✅ Validation
  const validateAll = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!emailRegex.test(form.email.trim())) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    else if (!phoneRegex.test(form.phone.trim())) e.phone = "Invalid phone";
    if (!form.message.trim()) e.message = "Message required";
    else if (form.message.trim().length > MAX_MESSAGE_LENGTH)
      e.message = `Max ${MAX_MESSAGE_LENGTH} characters`;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // 🚀 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return alert("Please correct form errors.");

    const user = auth.currentUser;
    if (!user) return alert("You must be logged in to send a message.");

    setLoading(true);
    try {
      const formDetails = {
        userId: user.uid,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
        createdAt: serverTimestamp(),
        deleted: 0,
      };

      await addDoc(collection(db, "mobileAppContactFormQueries"), formDetails);

      const res = await axios.post(
        "https://us-central1-ujaas-aroma.cloudfunctions.net/sendContactFormConfirmation",
        { formDetails: formDetails }
      );

      if (res.data.success) {
        alert("✅ Your message has been sent. We'll get back to you soon!");
        setForm({ ...form, message: "" });
      } else {
        alert("Something went wrong. Please try again later.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // 🧾 Realtime Enquiry Listener
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "mobileAppContactFormQueries"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setEnquiries(list);
        setFetchingEnquiries(false);
      },
      (error) => {
        console.error("Realtime listener failed:", error);
        setFetchingEnquiries(false);
      }
    );

    return () => unsubscribe();
  }, [auth, db]);

  const remaining = MAX_MESSAGE_LENGTH - form.message.length;
  const isFormValid =
    !prefetching &&
    form.name.trim() &&
    emailRegex.test(form.email.trim()) &&
    phoneRegex.test(form.phone.trim()) &&
    form.message.trim() &&
    form.message.trim().length <= MAX_MESSAGE_LENGTH;

  const sortedEnquiries = useMemo(() => {
    return [...enquiries].sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  }, [enquiries]);

  return (
    <motion.div
      className="orders-card"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <h2>Previous Enquiries</h2>
        <h2>Customer Care</h2>
      </div>
      <div className="customer-care-card">
        {/* --- Contact Form --- */}
        <form onSubmit={handleSubmit} noValidate className="ccform">
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
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="send-btn"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>

        {/* ---- Enquiry History Table ---- */}
        <div className="enquiry-list mt-4">
          {fetchingEnquiries ? (
            <p>Loading enquiries...</p>
          ) : sortedEnquiries.length === 0 ? (
            <p className="no-orders">No previous enquiries found.</p>
          ) : (
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Preview</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEnquiries.map((enq) => {
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
                          className={`collapsible-row ${
                            hasReply ? "highlight-replied" : ""
                          }`}
                          onClick={() =>
                            setExpandedId(expandedId === enq.id ? null : enq.id)
                          }
                        >
                          <td>{formattedDate}</td>
                          <td>{formattedTime}</td>
                          <td>{shortPreview}</td>
                          <td>
                            <span
                              className={`status-chip ${
                                hasReply ? "delivered" : "pending"
                              }`}
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
                                      <p className="msg-label">
                                        Support replied:
                                      </p>
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
                                      <em>
                                        Our support team will reply soon.
                                      </em>
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
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
