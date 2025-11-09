// src/components/Header.jsx
import { useState, useEffect } from "react";
import { Image, Offcanvas } from "react-bootstrap";
import { IoHeartOutline, IoBagOutline, IoSearch, IoMenu } from "react-icons/io5";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getApp } from "firebase/app";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../features/userSlice";
import "./styles/Header.css";

const logoUrl =
  "https://firebasestorage.googleapis.com/v0/b/ujaas-aroma.firebasestorage.app/o/logos%2Flogo2.png?alt=media&token=192d3c40-2147-4053-b692-30db63606a9a";

export default function Header({ bg }) {
  const [showCart, setShowCart] = useState(false);
  const { user } = useSelector((state) => state.user); 
  const db = getFirestore(getApp());
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    photoURL: "",
  });

  console.log(profile)

  useEffect(() => {
    const fetchUser = async () => {
      try {
       
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setProfile(snap.data());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth");
  };

  return (
    <header className="ujaas-header">
      {/* 🔹 Top Black Bar */}
      <div className="top-bar">
        <div className="top-bar-content">
          <span className="email">support@ujaasaroma.com</span>
          <span className="promo">free shipping on orders over ₹2500</span>

          {user ? (
            <button onClick={handleLogout} className="account logout-btn">
              Logout {' '}
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-box-arrow-right" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z" />
                <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z" />
              </svg>
            </button>
          ) : (
            <Link to="/auth" className="account">
              My Account{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-person"
                viewBox="0 0 16 16"
              >
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* 🔹 Main Navbar */}
      <div
        className="main-navbar m-0 d-flex align-items-center justify-content-between"
        style={{ background: bg }}
      >
        {/* Left Nav Links */}
        <div className="d-flex align-items-center justify-content-end column-gap-5 nav-left">
          <Link to="/" className="nav-link-custom">
            HOME
          </Link>
          <Link to="/shop" className="nav-link-custom">
            SHOP
          </Link>
          <Link to="/about" className="nav-link-custom">
            ABOUT US
          </Link>
          <Link to="/contact" className="nav-link-custom">
            CONTACT
          </Link>
        </div>

        {/* Center Logo */}
        <div className="main-logo-class d-flex justify-content-center align-items-center">
          <Link to="/">
            <Image src={logoUrl} alt="Ujaas Aroma" className="main-logo" />
          </Link>
        </div>

        {/* Right Icons */}
        <div className="d-flex align-items-center justify-content-center column-gap-3 nav-icons">
          <span>
            <IoHeartOutline className="icon" title="Wishlist" />
            <small>(0)</small>
          </span>
          <span>
            <IoBagOutline
              className="icon"
              title="Cart"
              onClick={() => setShowCart(true)}
            />
            <small>(0)</small>
          </span>
          <span>
            <IoSearch className="icon" title="Search" />
          </span>
          <span>
            {user?.uid &&
              <Link to="/profile">
                <Image src={profile.photoURL} alt="Display Picture" className="display-pic" />
              </Link>
            }
          </span>
        </div>
      </div>

      {/* 🛍 Offcanvas Cart */}
      <Offcanvas show={showCart} onHide={() => setShowCart(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Shopping Bag</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <p>Your bag is empty 🛒</p>
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
}
