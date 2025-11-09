import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./styles/Subscription.css";

const candleImg =
  "https://firebasestorage.googleapis.com/v0/b/ujaas-aroma.firebasestorage.app/o/logos%2FmainPageCandle3.png?alt=media&token=fb5a812b-3b70-464d-a07d-990ca7d6e9b5";

export default function Subscription() {
  return (
    <section className="subscription-banner text-light">
      <Row className="align-items-center justify-content-center m-0 w-100">
        {/* 🕯 Left Candle Image */}
        <Col md={5} className="d-flex justify-content-center align-items-center">
          <div className="image-circle">
            <img src={candleImg} alt="Candle" className="candle-image" />
            <div className="candle-image-circle"></div>
          </div>
        </Col>

        {/* ✉️ Right Side Text + Form */}
        <Col md={6} className="d-flex flex-column justify-content-center">
          <h2 className="subscription-title">Join Our Candle Community</h2>
          <p className="subscription-subtext">
            Get exclusive offers, new scent updates, and peaceful vibes in your inbox.
          </p>

          <Form className="subscription-form d-flex flex-column flex-sm-row align-items-center justify-content-start mt-4">
            <Form.Control
              type="email"
              placeholder="Enter your email address"
              className="subscription-input"
            />
            <Button type="submit" className="subscription-btn mt-3 mt-sm-0">
              Subscribe
            </Button>
          </Form>
        </Col>
      </Row>
    </section>
  );
}
