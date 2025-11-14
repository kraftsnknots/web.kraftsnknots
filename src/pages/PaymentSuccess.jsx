// src/pages/PaymentSuccess.jsx
import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/Checkout.css";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { orderNumber, paymentId, total } = state || {};

  return (
    <Container className="checkout-page py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="elegant-card status-card text-center p-4 p-md-5">
            <div className="status-icon success mb-3">
              <span className="status-icon-inner">✓</span>
            </div>

            <h2 className="status-title mb-2">Payment Successful</h2>
            <p className="status-subtitle mb-4">
              Thank you for shopping with Ujaas Aroma. Your order is confirmed and will be processed shortly.
            </p>

            <div className="status-details mb-4">
              {orderNumber && (
                <div className="status-row">
                  <span>Order Number</span>
                  <span className="fw-semibold">{orderNumber}</span>
                </div>
              )}

              {paymentId && (
                <div className="status-row">
                  <span>Payment ID</span>
                  <span className="status-mono">{paymentId}</span>
                </div>
              )}

              {typeof total === "number" && (
                <div className="status-row">
                  <span>Total Paid</span>
                  <span className="fw-semibold">₹ {total.toFixed(2)}</span>
                </div>
              )}
            </div>

            <p className="text-muted small mb-4">
              A confirmation email with your invoice and order details has been sent to your registered email address.
            </p>

            <div className="d-flex flex-column flex-md-row gap-2 justify-content-center">
              <Button
                variant="dark"
                className="rounded-pill px-4"
                onClick={() => navigate("/my-orders")}
              >
                View My Orders
              </Button>
              <Button
                variant="outline-secondary"
                className="rounded-pill px-4"
                onClick={() => navigate("/shop")}
              >
                Continue Shopping
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
