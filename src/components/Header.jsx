import { useState, useEffect } from "react";
import { DropdownButton, Image, Offcanvas, Modal, Button } from "react-bootstrap";
import { IoHeartOutline, IoBagOutline, IoMenuOutline } from "react-icons/io5";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { getApp } from "firebase/app";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../features/userSlice";
import dummy from "../assets/images/dummy_profile_picture.png"
import {
  removeFromCart,
  removeFromWishlist,
} from "../features/cartWishlistSlice";
import "./styles/Header.css";

const logoUrl =
  "https://firebasestorage.googleapis.com/v0/b/kraftsnknots-921a0.firebasestorage.app/o/logos%2Fknklogo2.png?alt=media&token=e3ba6239-845d-4d11-9976-120790ca53e3";
// "https://firebasestorage.googleapis.com/v0/b/kraftsnknots-921a0.firebasestorage.app/o/logos%2Fknklogo4.png?alt=media&token=59b74f21-e205-4bf3-8df4-2f21ce57a5b7";

export default function Header({ bg }) {

  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [accDropDown, setAccDropDown] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    photoURL: "",
  });

  const { user } = useSelector((state) => state.user);
  const { cart, wishlist } = useSelector((state) => state.cartWishlist);
  const [showMenu, setShowMenu] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const db = getFirestore(getApp());

  // 🧾 Fetch user profile
  useEffect(() => {
    if (!user?.uid) return;

    const ref = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data());
        }
      },
      (error) => {
        console.error("Profile realtime error:", error);
      }
    );

    // 🔥 VERY IMPORTANT: cleanup listener
    return () => unsubscribe();
  }, [user?.uid]);


  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth");
  };

  // 🧮 Cart total
  const total = cart.reduce(
    (sum, i) => sum + (i.discountPrice || i.price) * (i.quantity || 1),
    0
  );

  return (
    <header className="ujaas-header">
      {/* 🔹 Top Black Bar */}
      <div className="top-bar">
        <div className="top-bar-content">
          <span className="email">support@kraftsnknots.com</span>
          <span className="promo">free shipping on orders over ₹2500</span>

          {user ? (
            <button onClick={handleLogout} className="account logout-btn">
              Logout <i className="bi bi-box-arrow-right"></i>
            </button>
          ) : (
            <Link to="/auth" className="account">
              My Account{" "}
              <i className="bi bi-person" style={{ fontSize: 14 }}></i>
            </Link>
          )}
        </div>
      </div>

      {/* ================= MAIN NAVBAR ================= */}
      <div className="main-navbar m-0 d-flex align-items-center justify-content-between">

        {/* ☰ Hamburger (Mobile Only) */}
        <Button
          variant="link"
          className="d-md-none p-0 text-dark"
          onClick={() => setShowMenu(true)}
        >
          <IoMenuOutline size={30} />
        </Button>

        {/* Center Logo */}
        <div className="main-logo-class d-flex align-items-center">
          <Link to="/">
            <Image src={logoUrl} alt="Krafts & Knots" className="main-logo" />
          </Link>
        </div>

        {/* Left Nav Links */}
        <div className="align-items-center justify-content-start column-gap-5 nav-left">
          <Link to="/" className="nav-link-custom"> HOME </Link>
          <Link to="/shop" className="nav-link-custom"> SHOP </Link>
          <Link to="/about" className="nav-link-custom"> ABOUT US </Link>
          <Link to="/contact" className="nav-link-custom"> CONTACT </Link>

          {/* ❤️ Wishlist */}
          <Link onClick={() => setShowWishlist(true)} style={{ cursor: "pointer", color: '#ea8c8e', textDecorationLine: 'none' }}>
            <IoHeartOutline className="icon" title="Wishlist" />
            <small>({wishlist.length})</small>
          </Link>
          {/* 🛍 Cart */}
          <Link style={{ cursor: "pointer", color: '#ea8c8e', textDecorationLine: 'none' }}>
            <IoBagOutline className="icon" title="Cart" onClick={() => setShowCart(true)} />
            <small>({cart.length})</small>
          </Link>
          {/* 👤 Profile */}
          <span> {user?.uid && (<div className="account-dropdown">
            <Image src={profile.photoURL || dummy} className="display-pic" onClick={() => setAccDropDown(!accDropDown)} />
            {accDropDown &&
              (<div className="accdropdown">
                <p> <strong>Hey! {profile.name}</strong> </p>
                <p onClick={() => navigate("/account")}> <small>My Account</small> </p>
                <p onClick={handleLogout}> <small>Sign Out</small> </p>
              </div>)}
          </div>)}
          </span>
        </div>
      </div>

      {/* ================= MOBILE OFFCANVAS MENU ================= */}
      <Offcanvas
        show={showMenu}
        onHide={() => setShowMenu(false)}
        placement="start"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <Image src={logoUrl} height={40} />
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column gap-3">

          <Link to="/" onClick={() => setShowMenu(false)} className="mobile-link">HOME</Link>
          <Link to="/shop" onClick={() => setShowMenu(false)} className="mobile-link">SHOP</Link>
          <Link to="/about" onClick={() => setShowMenu(false)} className="mobile-link">ABOUT US</Link>
          <Link to="/contact" onClick={() => setShowMenu(false)} className="mobile-link">CONTACT</Link>

          <hr />

          <div
            className="mobile-link"
            onClick={() => {
              setShowWishlist(true);
              setShowMenu(false);
            }}
          >
            ❤️ Wishlist ({wishlist.length})
          </div>

          <div
            className="mobile-link"
            onClick={() => {
              setShowCart(true);
              setShowMenu(false);
            }}
          >
            🛍 Cart ({cart.length})
          </div>

          {user?.uid && (
            <>
              <hr />
              <div className="mobile-link" onClick={() => navigate("/account")}>
                👤 My Account
              </div>
              <div className="mobile-link" onClick={handleLogout}>
                🚪 Sign Out
              </div>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>


      {/* 🛍 CART Offcanvas */}
      <Offcanvas show={showCart} onHide={() => setShowCart(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Shopping Bag</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {cart.length === 0 ? (
            <p>Your bag is empty 🛒</p>
          ) : (
            <div className="cart-items-list d-flex flex-column justify-content-between h-100">
              <div>
                {cart.map((item) => (
                  <div key={item.id} className="cart-item d-flex align-items-center mb-3">
                    <img
                      src={item.images}
                      alt={item.title}
                      className="cart-item-img me-3"
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "contain",
                        borderRadius: 8,
                      }}
                    />
                    <div className="cart-item-details flex-grow-1">
                      <h6 className="mb-0 d-flex justify-content-between align-items-center">{item.title} <i className="bi bi-x-circle " onClick={() => dispatch(removeFromCart(item.id))}></i></h6>
                      {item.discountPrice ?
                        <small> <small style={{ color: 'red', textDecorationLine: 'line-through' }}>₹ {item.price}</small> ₹ {item.discountPrice} X {item.quantity} = {item.discountPrice * item.quantity}</small>
                        :
                        <small>₹ {item.price} X {item.quantity} = {item.price * item.quantity}</small>
                      }

                    </div>

                  </div>
                ))}

                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Total:</strong>
                  <strong>₹{total.toFixed(2)}</strong>
                </div>
              </div>
              <div className="pt-3 mt-3 d-flex justify-content-between align-items-center">
                <button
                  className="btn"
                  onClick={() => {
                    setShowCart(false);
                    navigate("/cart");
                  }}
                >
                  View Cart
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setShowCart(false);
                    navigate("/checkout");
                  }}
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* 💖 WISHLIST Modal */}
      <Modal show={showWishlist} onHide={() => setShowWishlist(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>My Wishlist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {wishlist.length === 0 ? (
            <p>No items in wishlist 💔</p>
          ) : (
            wishlist.map((item) => (
              <div
                key={item.id}
                className="wishlist-item d-flex align-items-center mb-3"
                onClick={() => navigate(`/product/${item.id}`)}
              >
                <img
                  src={item.images[0]}
                  alt={item.title}
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginRight: 10,
                  }}
                />
                <div className="flex-grow-1">
                  <h6 className="mb-0">{item.title}</h6>
                  <small>₹{item.price}</small>
                </div>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => dispatch(removeFromWishlist(item.id))}
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWishlist(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </header>
  );
}
