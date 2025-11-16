// src/pages/Contact.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { submitEnquiry } from "../features/enquiriesSlice";
import "./styles/Contact.css";
import { Alert, Pagination } from "react-bootstrap";

const MAX_MESSAGE_LENGTH = 1000;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9()+\-\s]{7,20}$/;

export default function Contact() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user); // but NOT auto-prefill

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(false);

  // -----------------------------
  // Handle input changes
  // -----------------------------
  const handleChange = (key, value) => {
    if (key === "message" && value.length > MAX_MESSAGE_LENGTH) return;
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  // -----------------------------
  // Validation
  // -----------------------------
  const validateAll = () => {
    const e = {};

    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!emailRegex.test(form.email)) e.email = "Invalid email";

    if (form.phone.trim() && !phoneRegex.test(form.phone))
      e.phone = "Invalid phone number";

    if (!form.message.trim()) e.message = "Message is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // -----------------------------
  // Submit Handler
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);

    try {
      // Cloud Function: send confirmation email
      await axios.post(
        "https://us-central1-ujaas-aroma.cloudfunctions.net/sendContactFormConfirmation",
        {
          formDetails: {
            ...form,
            userId: user?.uid || null,
          },
        }
      );

      // Add enquiry to Firestore
      await dispatch(
        submitEnquiry({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
          deleted: 0,
          sentFrom: "Website without Authorization",
        })
      );

      // Reset only message
      setForm((p) => ({ ...p, message: "" }));
      setAlertMessage(true);
    } catch (err) {
      console.error(err);
      alert("Failed to send message. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="contact-page"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Contact Layout */}
      <section className="contact-hero">

        {/* LEFT COLUMN */}
        <div className="contact-info">
          <h2 className="section-title">Get in Touch</h2>
          <p className="intro-text">
            We’d love to hear from you! Whether you have questions about our handcrafted scented candles,
            need help with an order, or want to collaborate, we’re here.
          </p>

          <div className="support-block">
            <h4>Support</h4>
            <a href="mailto:support@ujaasaroma.com" className="email-link">
              support@ujaasaroma.com
            </a>
          </div>

          <div className="divider"></div>

          <div className="location-block">
            <h2 className="section-title">Our Location</h2>
            <p className="intro-text">
              Based in Bengaluru, India — crafting artisanal scented candles with love.
            </p>

            <div className="location-details">
              <div>
                <h4>Address</h4>
                <p>Bellandur, Bengaluru, Karnataka, India</p>

                <h4>Hours</h4>
                <p>7 AM – 11 PM (Daily)</p>
              </div>

              <div>
                <h4>Contact</h4>
                <a href="mailto:support@ujaasaroma.com" className="email-link">
                  support@ujaasaroma.com
                </a>

                <h4>Open</h4>
                <p>Daily</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — FORM */}
        <div className="contact-form">
          <form onSubmit={handleSubmit} className="cwform position-relative">
            {loading && (
              <div className="loader-div d-flex flex-column justify-content-center align-items-center" style={{height:'100%'}}>
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

            <h3 className="form-title">Send Us a Message</h3>
            <p className="form-subtitle">
              Fill the form and we’ll respond soon.
            </p>

            {/* NAME */}
            <div className="form-group">
              <label>Your First Name*</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter your first name"
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <label>Your Email Address*</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter your email"
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            {/* PHONE */}
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="error-text">{errors.phone}</p>}
            </div>

            {/* MESSAGE */}
            <div className="form-group">
              <label>Your Message*</label>
              <textarea
                value={form.message}
                rows="6"
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder="Type your message here"
              ></textarea>
              {errors.message && (
                <p className="error-text">{errors.message}</p>
              )}

              <div className="char-counter">
                {form.message.length} / {MAX_MESSAGE_LENGTH}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.message.trim()}
              className="btn-submit"
            >
              {loading ? "Sending..." : "Submit Your Inquiry"}
            </button>
          </form>
        </div>
      </section>
    </motion.div>
  );
}
