// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import './App.css'
import ShopPage from './pages/ShopPage';
import AddProduct from './pages/AddProduct';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProductDetailsPage from './pages/ProductsDetailsPage';
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/product/:productId" element={<ProductDetailsPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected routes */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/add" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App
