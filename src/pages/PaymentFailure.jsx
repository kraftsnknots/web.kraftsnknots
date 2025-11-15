// src/pages/PaymentFailure.jsx
import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/Checkout.css";

export default function PaymentFailure() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { reason, orderNumber } = state || {};

  return (
    <Container className="checkout-page py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="elegant-card status-card text-center p-4 p-md-5">
            <div className="status-icon failure mb-3">
              <span className="status-icon-inner">!</span>
            </div>

            <h2 className="status-title mb-2">Payment Unsuccessful</h2>
            <p className="status-subtitle mb-4">
              We couldn’t complete your payment. Don’t worry — no amount has been charged.
            </p>

            <div className="status-details mb-4">
              {orderNumber && (
                <div className="status-row">
                  <span>Order Attempt</span>
                  <span className="fw-semibold">{orderNumber}</span>
                </div>
              )}

              {reason && (
                <div className="status-row">
                  <span>Reason</span>
                  <span className="text-danger small">{reason}</span>
                </div>
              )}
            </div>

            <p className="text-muted small mb-4">
              You can try again or review your cart before completing the purchase.
            </p>

            <div className="d-flex flex-column flex-md-row gap-2 justify-content-center">
              <Button
                variant="dark"
                className="rounded-pill px-4"
                onClick={() => navigate("/checkout")}
              >
                Try Again
              </Button>
              <Button
                variant="outline-secondary"
                className="rounded-pill px-4"
                onClick={() => navigate("/checkout")}
              >
                Back to Cart
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
