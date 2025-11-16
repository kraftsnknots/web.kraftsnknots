import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Table,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./styles/PaymentSuccess.css";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { paymentId, orderNumber } = state || {};

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Fetch Order
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const app = getApp();
        const db = getFirestore(app);

        const q = query(
          collection(db, "successOrders"),
          where("orderNumber", "==", orderNumber),
          limit(1)
        );

        const snap = await getDocs(q);

        if (!snap.empty) setOrder(snap.docs[0].data());
      } catch (err) {
        console.error("Error loading order:", err);
      }
      setLoading(false);
    };

    if (orderNumber) fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <Container className="ps-container d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="dark" />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="ps-container text-center py-5">
        <h4>Order Not Found</h4>
        <Button variant="dark" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Header />

      <Container className="ps-container py-5">
        <Row className="justify-content-center">
          <Col md={10} lg={7}>
            <Card className="ps-card p-4 p-md-5">

              {/* Success Badge */}
              <div className="ps-success-icon">
                <div className="ps-success-inner">✓</div>
              </div>

              <h2 className="ps-title text-center">Payment Successful</h2>
              <p className="ps-subtitle text-center mb-4">
                Thank you for your purchase! Your order has been confirmed.
              </p>

              {/* Order Details */}
              <div className="ps-box mb-4">
                <div className="ps-row">
                  <span>Order Number</span>
                  <span className="ps-bold">{orderNumber}</span>
                </div>
                <div className="ps-row">
                  <span>Payment ID</span>
                  <span className="ps-mono">{paymentId}</span>
                </div>
                <div className="ps-row">
                  <span>Total Paid</span>
                  <span className="ps-bold">₹ {order.total?.toFixed(2)}</span>
                </div>
              </div>

              {/* Customer Info */}
              <h5 className="ps-section-title">Customer Information</h5>
              <div className="ps-box mb-4">
                <p className="mb-1 ps-address">Name: {order.customerInfo?.name}</p>
                <p className="mb-1 ps-address">Email: {order.customerInfo?.email}</p>
                <p className="mb-1 ps-address">Phone: {order.customerInfo?.phone}</p>
                <p className="ps-address">Address: {" "}
                  {order.customerInfo?.shipping_address?.address},{" "}
                  {order.customerInfo?.shipping_address?.city},{" "}
                  {order.customerInfo?.shipping_address?.state} -{" "}
                  {order.customerInfo?.shipping_address?.postalCode},{" "}
                  {order.customerInfo?.shipping_address?.country}
                </p>
              </div>

              {/* Items */}
              <h5 className="ps-section-title">Items Purchased</h5>
              <div className="ps-box mb-4">
                <Table borderless className="ps-table">
                  <tbody>
                    {order.cartItems?.map((item, index) => (
                      <tr key={index} className="ps-item-row">
                        <td>
                          <strong>{item.title}</strong>
                          {item.options?.length ? (
                            <div className="ps-options">
                              {item.options.map((o) => (
                                <span key={o.name}>
                                  {o.name}: {o.value}{" "}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </td>
                        <td>
                          ₹ {item.price}/-
                        </td>
                        <td>
                          Qty: {item.quantity}
                        </td>
                        <td className="text-end">
                          ₹ {(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Summary */}
              <h5 className="ps-section-title">Order Summary</h5>
              <div className="ps-box mb-4">
                {order.discountValue > 0 && (
                  <>
                    <div className="ps-row">
                      <span>Total Before Discount ({order.discountCode})</span>
                      <span>- ₹ {order.totalBeforeDiscount.toFixed(2)}</span>
                    </div>
                    <div className="ps-row ps-discount">
                      <span>Discount ({order.discountCode})</span>
                      <span>- ₹ {order.discountValue.toFixed(2)}</span>
                    </div>
                  </>
                )}

                <div className="ps-row">
                  <span>Subtotal</span>
                  <span>₹ {order.subtotal?.toFixed(2)}</span>
                </div>

                <div className="ps-row">
                  <span>GST (12%)</span>
                  <span>₹ {order.tax?.toFixed(2)}</span>
                </div>

                <div className="ps-row">
                  <span>Shipping</span>
                  <span>₹ {order.shipping.shippingCost.toFixed(2)}</span>
                </div>

                <div className="ps-row ps-total">
                  <span>Total</span>
                  <span className="ps-bold">₹ {order.total?.toFixed(2)}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="ps-btn-group">
                <Button
                  variant="dark"
                  className="ps-btn"
                  onClick={() => navigate("/account")}
                >
                  View My Orders
                </Button>

                <Button
                  variant="outline-secondary"
                  className="ps-btn"
                  onClick={() => navigate("/shop")}
                >
                  Continue Shopping
                </Button>

                <Button
                  variant="warning"
                  className="ps-btn"
                  onClick={async () => {
                    try {
                      setDownloading(true);

                      const app = getApp();
                      const storage = getStorage(app);
                      const auth = getAuth(app);

                      if (!auth.currentUser) {
                        alert("Login required to download invoice.");
                        return;
                      }

                      const fileRef = ref(storage, order.invoiceUrl);
                      const url = await getDownloadURL(fileRef);

                      window.open(url, "_blank");
                    } catch (err) {
                      console.error(err);
                      alert("Invoice unavailable.");
                    } finally {
                      setDownloading(false);
                    }
                  }}
                >
                  {downloading ? <Spinner size="sm" /> : "Download Invoice"}
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>

      <Footer />
    </>
  );
}
