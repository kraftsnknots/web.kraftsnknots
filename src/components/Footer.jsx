import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import "./styles/Footer.css";

const logoUrl =
  "https://firebasestorage.googleapis.com/v0/b/ujaas-aroma.firebasestorage.app/o/logos%2Flogo-shadow.png?alt=media&token=14434b83-1c6b-4b1a-9df9-07745b330edd";

export default function Footer() {
  return (
    <footer
      className="text-light footer-container"
      style={{
        backgroundColor: "#000",
        fontFamily: '"Work Sans", sans-serif',
        paddingBottom: "10px",
      }}
    >

      {/* Footer Content */}
      <Container fluid className="m-0 pt-5 d-flex flex-column align-items-center" style={{ borderTop: '10px groove #eee' }}>
        {/* Newsletter Section */}
        <Row style={{ paddingBottom: 5, borderBottom: '1px solid #333', marginBottom: 25, width: '100%' }}>
          <Col lg={12}>
            <div
              className="d-flex flex-column align-items-center justify-content-center">
              <h5
                className="mb-4"
                style={{
                  fontSize: "18px",
                  fontWeight: "400",
                  letterSpacing: "3px",
                }}
              >
                FOLLOW US & SUBSCRIBE
              </h5>
              <Form className="d-flex justify-content-between align-items-center gap-3 mb-4" style={{
                borderBottom: "1px solid #fff", width: '60%'
              }}>
                <Form.Control
                  type="email"
                  placeholder="Enter your e-mail address here"
                  className="footer-subscription"
                  style={{
                    maxWidth: "100%",
                    backgroundColor: "transparent",
                    border: "none",
                    borderRadius: "0",
                    color: "#fff",
                    fontSize: "13px",
                    padding: "10px 0",
                  }}
                />
                <Button
                  type="submit"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: "600",
                    letterSpacing: "1.5px",
                    padding: "10px 0"
                  }}
                >
                  SEND
                </Button>
              </Form>
            </div>
          </Col>
        </Row>

        <Row style={{ width: '70%', marginLeft: 160 }}>
          {/* Contact Column */}
          <Col lg={3} md={6} className="mb-4">
            <h6
              className="mb-4"
              style={{
                fontSize: "13px",
                fontWeight: "600",
                letterSpacing: "1.5px",
              }}
            >
              CONTACT
            </h6>
            <div style={{ fontSize: "13px", lineHeight: "2.1" }}>
              <p className="mb-2">🗺️: Bengaluru, Karnataka, India</p>
              <p className="mb-2">📞: +91 96855-58919</p>
              <p className="mb-2">📧: support@ujaasaroma.com</p>
              <p className="mb-2">🌐: www.ujaasaroma.com/contact</p>
            </div>
          </Col>

          {/* Services Column */}
          <Col lg={3} md={6} className="mb-4">
            <h6
              className="mb-4"
              style={{
                fontSize: "13px",
                fontWeight: "600",
                letterSpacing: "1.5px",
              }}
            >
              SERVICES
            </h6>
            <ul
              className="list-unstyled"
              style={{ fontSize: "13px", lineHeight: "2" }}
            >
              <li className="mb-2">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                  style={{ transition: "opacity 0.3s" }}
                  onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.target.style.opacity = "1")}
                >
                  Exclusive offers
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                  style={{ transition: "opacity 0.3s" }}
                  onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.target.style.opacity = "1")}
                >
                  Corporate Sales
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                  style={{ transition: "opacity 0.3s" }}
                  onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.target.style.opacity = "1")}
                >
                  Privacy Policy
                </a>
              </li>
              <li className="mb-0">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                  style={{ transition: "opacity 0.3s" }}
                  onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.target.style.opacity = "1")}
                >
                  Terms of Use
                </a>
              </li>
            </ul>
          </Col>

          {/* Orders Column */}
          <Col lg={3} md={6} className="mb-4">
            <h6
              className="mb-4"
              style={{
                fontSize: "13px",
                fontWeight: "600",
                letterSpacing: "1.5px",
              }}
            >
              ORDERS
            </h6>
            <ul
              className="list-unstyled"
              style={{ fontSize: "13px", lineHeight: "2" }}
            >
              <li className="mb-2">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                  style={{ transition: "opacity 0.3s" }}
                  onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.target.style.opacity = "1")}
                >
                  My account
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                  style={{ transition: "opacity 0.3s" }}
                  onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.target.style.opacity = "1")}
                >
                  Delivery information
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                  style={{ transition: "opacity 0.3s" }}
                  onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.target.style.opacity = "1")}
                >
                  Track my order
                </a>
              </li>
              <li className="mb-0">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                  style={{ transition: "opacity 0.3s" }}
                  onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.target.style.opacity = "1")}
                >
                  Help
                </a>
              </li>
            </ul>
          </Col>

          {/* Most Popular Column */}
          <Col lg={3} md={6} className="mb-4">
            <h6
              className="mb-4"
              style={{
                fontSize: "13px",
                fontWeight: "600",
                letterSpacing: "1.5px",
              }}
            >
              MOST POPULAR
            </h6>
            <ul
              className="list-unstyled"
              style={{ fontSize: "13px", lineHeight: "2" }}
            >
              <li className="mb-2">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                  style={{ transition: "opacity 0.3s" }}
                  onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.target.style.opacity = "1")}
                >
                  Jar Candles
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                  style={{ transition: "opacity 0.3s" }}
                  onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.target.style.opacity = "1")}
                >
                  Bloom Candles
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                  style={{ transition: "opacity 0.3s" }}
                  onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.target.style.opacity = "1")}
                >
                  Heart Candles
                </a>
              </li>
              <li className="mb-0">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                  style={{ transition: "opacity 0.3s" }}
                  onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.target.style.opacity = "1")}
                >
                  Modak Candles
                </a>
              </li>
            </ul>
          </Col>
        </Row>

        {/* Social Icons */}
        <div className="d-flex justify-content-center gap-4 mb-2">
          <a
            href="https://www.instagram.com/ujaasaroma"
            className="text-light"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "16px",
              transition: "opacity 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            <FaInstagram />
          </a>
          <a
            href="https://youtube.com/@ujaasaroma"
            className="text-light"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "16px",
              transition: "opacity 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            <FaYoutube />
          </a>
        </div>
        <p
          className="mb-0"
          style={{ fontSize: "11px", opacity: "0.7" }}
        >
          © 2025. All rights reserved.
        </p>

      </Container>
    </footer>
  );
}
