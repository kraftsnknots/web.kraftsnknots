// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { listenToAuthChanges } from "./features/userSlice";
import HomePage from "./pages/HomePage";
import ShopPage from './pages/ShopPage';
import AddProduct from './pages/AddProduct';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProductDetailsPage from './pages/ProductsDetailsPage';
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from './pages/AuthPage';
import './App.css'
import "./components/styles/KraftsnKnotsLoader.css";
import AccountPage from './pages/AccountPage';
import Checkout from './pages/Checkout';
import PaymentFailure from './pages/PaymentFailure';
import PaymentSuccess from './pages/PaymentSuccess';
import CartPage from './pages/CartPage';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(listenToAuthChanges());
  }, [dispatch]);
  return (
    <Router basename="/kraftsnknots">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/product/:productId" element={<ProductDetailsPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/cart" element={<CartPage />} />

        {/* Protected routes */}
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/add" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/checkout/failure" element={<ProtectedRoute><PaymentFailure /></ProtectedRoute>} />
        <Route path="/checkout/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App
