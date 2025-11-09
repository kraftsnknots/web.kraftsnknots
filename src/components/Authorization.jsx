import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, signupUser, resetPassword, clearAlerts } from "../features/userSlice";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import "./styles/Authorization.css";
import Alert from 'react-bootstrap/Alert';

export default function Authorization({ lastPage }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error, message } = useSelector((s) => s.user);

  const [isForgot, setIsForgot] = useState(false);
  const [errorMsgs, setErrorMsgs] = useState('');
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    if (user) {

      { lastPage && navigate(lastPage) }
    }
  }, [user, lastPage, navigate]);

  useEffect(() => {
    setErrorMsgs(error);
  }, [error]);

  // Handlers
  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginUser(loginData));
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirm) {
      setErrorMsgs('Passwords do not match!');
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

  const handleAlertClears = () => {
    dispatch(clearAlerts());
    setErrorMsgs('');
  }

  return (
    <div className="dual-auth-wrapper">
      {errorMsgs && (
        <Alert
          variant="danger"
          style={{ width: "50%" }}
          className="d-flex justify-content-between align-items-center"
        >
          <span>
            {errorMsgs === "Firebase: Error (auth/email-already-in-use)."
              ? "This Email is already registered in system."
              : errorMsgs}
          </span>
          <i
            className="bi bi-x-circle-fill"
            style={{ cursor: "pointer" }}
            onClick={handleAlertClears}
          ></i>
        </Alert>
      )}

      {message && (
        <Alert
          variant="primary"
          style={{ width: "50%", textAlign: "center" }}
          className="d-flex justify-content-between align-items-center"
        >
          <span>{message}</span>
          <i
            className="bi bi-x-circle-fill"
            style={{ cursor: "pointer" }}
            onClick={() => dispatch(clearAlerts())}
          ></i>
        </Alert>
      )}
      <div className="d-flex justify-content-center gap-5 flex-wrap " style={{ width: '100%' }}>
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
              </form>

              <button className="link-btn mt-5" onClick={() => setIsForgot(false)}>
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
          </form>
        </motion.div>
      </div>
    </div>
  );
}
