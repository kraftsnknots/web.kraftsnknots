import React, { useEffect, useState } from "react";
import { getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import { Button, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  removeFromCart,
  addToWishlist,
  removeFromWishlist,
} from "../features/cartWishlistSlice";
import "./styles/ProductDetails.css";
import StarRating from "./StarRating";
import { useLocation, useNavigate } from "react-router-dom";

export default function ProductDetails({ productId, shopCartAdded, shopCartRemoved }) {
  const navigate = useNavigate();
  const location = useLocation();


  const { cart, wishlist } = useSelector((state) => state.cartWishlist);
  const q = () => {
    const item = cart.find((p) => p.id === productId);
    return item ? item.quantity : 1;
  };
  const inCart = cart.some((item) => item.id === productId);
  const inWishlist = wishlist.some((item) => item.id === productId);

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(q);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const app = getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);
  const dispatch = useDispatch();


  // 🔐 Listen to Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsub();
  }, []);

  // 🧩 Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({ id: productId, ...data });
          setSelectedImage(data.images?.[0]);
        } else {
          console.error("❌ No such product!");
        }
      } catch (error) {
        console.error("🔥 Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // 💬 Fetch live reviews
  useEffect(() => {
    if (!productId) return;
    const reviewsRef = collection(db, "products", productId, "reviews");
    const unsubscribe = onSnapshot(
      reviewsRef,
      (snapshot) => {
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(
          fetched.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
        );
      },
      (error) => console.error("Error loading reviews:", error)
    );
    return () => unsubscribe();
  }, [productId]);

  // 🛒 Cart logic
  const increaseQty = () => setQuantity((q) => q + 1);
  const decreaseQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleCart = () => {
    if (!product) return;
    dispatch(addToCart({ ...product, quantity }));
    shopCartAdded(true);
    // shopCartRemoved(false)
  };

  const handleWishlist = () => {
    if (!product) return;
    inWishlist
      ? dispatch(removeFromWishlist(product.id))
      : dispatch(addToWishlist(product));
  };

  // ✍️ Submit new review
  // inside ProductDetails.jsx handleReviewSubmit()
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in to submit a review.");
    if (newReview.rating <= 0 || !newReview.comment.trim()) {
      return alert("Please provide both rating and review.");
    }

    try {
      setSubmitting(true);
      await addDoc(collection(db, "products", productId, "reviews"), {
        userId: user.uid,
        name: user.name,
        email: user.email,
        rating: newReview.rating,
        review: newReview.comment.trim(),
        createdAt: serverTimestamp(),
      });
      setNewReview({ rating: 0, comment: "" });
    } catch (error) {
      console.error("Error adding review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/auth", { state: { from: location } });
  };


  if (loading) return <div className="loader-div d-flex flex-column justify-content-center align-items-center"><div className="loader"></div><div className="sending-loader"></div></div>;
  if (!product) return <div className="not-found">Product not found.</div>;

  return (
    <div className="product-page">
      <div className="product-details-section-1">
        {/* 🖼️ Gallery */}
        <div className="gallery">
          <div className="thumbnails">
            {product.images?.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`thumb-${index}`}
                className={`thumbnail ${selectedImage === img ? "active" : ""}`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
          <div className="main-image">
            <img src={selectedImage} alt={product.title} />
            {product.ribbon && <span className="ribbon">{product.ribbon}</span>}
          </div>
        </div>

        {/* 📋 Details */}
        <div className="details">
          <h1 className="title">{product.title}</h1>
          <h3 className="subtitle">{product.subtitle}</h3>
          {/* {product.discountPrice ? } */}
          <p className="price"><small className="line-through danger">₹{product.price || product.options?.[0]?.price}</small> ₹{product.discountPrice || product.options?.[0]?.price}</p>

          <div className="description">
            <p>
              {product.description ||
                "This beautifully handcrafted candle adds warmth and charm to any space. Perfect for gifts or home decor."}
            </p>
          </div>

          <div className="quantity-controls">
            <div className="cartlist">
              <div className="d-flex justify-content-center align-items-center">
                <Button variant="light" onClick={decreaseQty}>
                  −
                </Button>
                <span>{quantity}</span>
                <Button variant="light" onClick={increaseQty}>
                  ＋
                </Button>
              </div>
              <Button
                variant="dark"
                onClick={handleCart}
              >
                {inCart ? <i className="bi bi-cart-dash"></i> : <i className="bi bi-cart-plus"></i>}
              </Button>
            </div>

            <span className="wishlist" onClick={handleWishlist}>
              {inWishlist ? <i className="bi bi-hearts filled-heart"></i> : <i className="bi bi-suit-heart empty-heart"></i>}
            </span>
          </div>
        </div>
      </div>

      {/* 🧾 Tabs */}
      <div className="tabs">
        <div className="tab-headers">
          <span
            className={activeTab === "description" ? "active" : ""}
            onClick={() => setActiveTab("description")}
          >
            DESCRIPTION
          </span>
          <span
            className={activeTab === "info" ? "active" : ""}
            onClick={() => setActiveTab("info")}
          >
            ADDITIONAL INFORMATION
          </span>
          <span
            className={activeTab === "reviews" ? "active" : ""}
            onClick={() => setActiveTab("reviews")}
          >
            REVIEWS ({reviews.length})
          </span>
        </div>

        <div className="tab-body">
          {activeTab === "description" && (
            <p>{product.description || "No additional description."}</p>
          )}

          {activeTab === "info" && (
            <div>
              {product.options?.length ? (
                product.options.map((opt, i) => (
                  <p key={i}>
                    <strong>{opt.name}:</strong> {opt.value}
                  </p>
                ))
              ) : (
                <p>No additional info.</p>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="reviews-section">
              {reviews.length === 0 ? (
                <p>No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="review-card">
                    <div className="review-header">
                      <strong>{r.name || "Anonymous"}</strong>
                      {r.rating && (
                        <span className="rating">
                          {"⭐".repeat(r.rating)} {' '}
                          <strong style={{ color: '#000' }}>({r.rating})</strong>
                        </span>
                      )}
                    </div>
                    <p className="review-text">{r.review}</p>
                    {r.createdAt?.seconds && (
                      <small className="review-date">
                        {new Date(
                          r.createdAt.seconds * 1000
                        ).toLocaleDateString()}
                      </small>
                    )}
                  </div>
                ))
              )}

              {/* Review form for logged-in users */}
              {user ? (
                <Form onSubmit={handleReviewSubmit} className="review-form mt-4">
                  <h5>Write a review</h5>
                  <Form.Group controlId="rating" className="mb-3">
                    <Form.Label>Rating</Form.Label>
                    <StarRating
                      rating={newReview.rating}
                      setRating={(val) =>
                        setNewReview((prev) => ({ ...prev, rating: val }))
                      }
                    />
                  </Form.Group>


                  <Form.Group className="mb-3">
                    <Form.Label>Comment</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={newReview.comment}
                      onChange={(e) =>
                        setNewReview((prev) => ({
                          ...prev,
                          comment: e.target.value,
                        }))
                      }
                    />
                  </Form.Group>

                  <Button variant="dark" type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </Form>
              ) : (
                <p className="text-muted mt-3">
                  🔒 Please <strong onClick={handleLoginRedirect}>Sign In</strong> to submit a review.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
