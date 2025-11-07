import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, signupUser, resetPassword } from "../features/userSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import "./styles/Authorization.css";

export default function Authorization() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error, message } = useSelector((s) => s.user);

  const [isForgot, setIsForgot] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [resetEmail, setResetEmail] = useState("");

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true }); // redirect after login
    }
  }, [user, from, navigate]);

  // Handlers
  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginUser(loginData));
    navigate('/profile');
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirm) {
      alert("Passwords do not match!");
      return;
    }
    dispatch(
      signupUser({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
      })
    );
  };

  const handleForgot = (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    dispatch(resetPassword(resetEmail));
  };

  return (
    <div className="dual-auth-wrapper">
      {/* --- Left: Login / Forgot Password --- */}
      <AnimatePresence mode="wait">
        {!isForgot ? (
          <motion.div
            key="login"
            className="auth-card glass-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="auth-header">
              <h2>Welcome Back 👋</h2>
              <p>Sign in to continue exploring our candle collection.</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  required
                />
              </div>

              <div className="auth-actions">
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setIsForgot(true)}
                >
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Login"}
              </button>

              {error && <p className="error-text">{error}</p>}
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="forgot"
            className="auth-card glass-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="auth-header">
              <h2>Reset Password 🔑</h2>
              <p>Enter your email and we’ll send a reset link.</p>
            </div>

            <form onSubmit={handleForgot}>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  placeholder="Email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              {message && <p className="success-text">{message}</p>}
              {error && <p className="error-text">{error}</p>}
            </form>

            <button className="link-btn" onClick={() => setIsForgot(false)}>
              ← Back to Login
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Right: Sign Up --- */}
      <motion.div
        className="auth-card glass-card signup-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="auth-header">
          <h2>Create Account ✨</h2>
          <p>Join our candle community and start shopping today!</p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="Full Name"
              value={signupData.name}
              onChange={(e) =>
                setSignupData({ ...signupData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              value={signupData.email}
              onChange={(e) =>
                setSignupData({ ...signupData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={signupData.password}
              onChange={(e) =>
                setSignupData({ ...signupData, password: e.target.value })
              }
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={signupData.confirm}
              onChange={(e) =>
                setSignupData({ ...signupData, confirm: e.target.value })
              }
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Sign Up"}
          </button>

          {error && <p className="error-text">{error}</p>}
        </form>
      </motion.div>
    </div>
  );
}
