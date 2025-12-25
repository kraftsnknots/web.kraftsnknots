import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./styles/Subscription.css";

const flowerImg =
  "https://firebasestorage.googleapis.com/v0/b/ujaas-aroma.firebasestorage.app/o/logos%2FlogoLeft.png?alt=media&token=94ae79f6-2288-4b01-99a3-b660fee0a22b";

export default function Subscription() {
  return (
    <section className="subscription-banner text-light">
      <Row className="align-items-center justify-content-center m-0 w-100">
        {/* 🕯 Left Candle Image */}
        <Col md={5} className="d-flex justify-content-center align-items-center">
          <div className="image-circle">
            <img src={flowerImg} alt="FlowerLogo" className="candle-image" />
            <div className="candle-image-circle"></div>
          </div>
        </Col>

        {/* ✉️ Right Side Text + Form */}
        <Col md={6} className="d-flex flex-column justify-content-center">
          <h2 className="subscription-title">Join Our Krafts Community</h2>
          <p className="subscription-subtext">
            Get exclusive offers, new updates, and peaceful vibes in your inbox.
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
