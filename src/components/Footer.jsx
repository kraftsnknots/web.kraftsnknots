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
import { useNavigate } from "react-router-dom";
import { Image } from "react-bootstrap";

const logoUrl =
  "https://firebasestorage.googleapis.com/v0/b/ujaas-aroma.firebasestorage.app/o/logos%2Fknklogo.png?alt=media&token=6564bb71-757f-46d5-b0b5-a8f22e13280b";

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="color-pink">

      {/* Footer Content */}
      <Container fluid className="m-0 pt-5 d-flex flex-column align-items-center">
        <div className="main-logo-class d-flex justify-content-center align-items-center">
          <Image src={logoUrl} alt="Krafts & Knots" className="main-logo-bottom" />
        </div>
        {/* Newsletter Section */}
        <Row style={{ paddingBottom: 5, borderBottom: '1px solid #333', margin: '25px 0', width: '100%' }}>
          <Col lg={12}>
            <div
              className="d-flex flex-column align-items-center justify-content-center">
              
              <Form className="d-flex justify-content-between align-items-center gap-3 mb-4 footer-subscripton">
                <Form.Control
                  type="email"
                  placeholder="Enter your e-mail address here"
                  className="footer-subscription"
                  required
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
                    fontSize: "13px",
                    fontWeight: "600",
                    letterSpacing: "1.5px",
                    padding: "10px 0",
                    width: 200,
                    textAlign:'end'
                  }}
                >
                  SEND
                </Button>
              </Form>
            </div>
          </Col>
        </Row>

        <Row className="footer-bottom-row">
          {/* Contact Column */}
          <Col lg={3} md={6} className="mb-4 ">
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
            <div style={{ fontSize: "13px", lineHeight: "2.1" }} className="mobile-md-3">
              <p className="mb-2">🗺️: Amritsar, Punjab, India</p>
              <p className="mb-2">📞: +91 98558-62831</p>
              <p className="mb-2">📧: support@kraftsnknots.com</p>
              <p className="mb-2" onClick={() => navigate("/contact")}>🌐: Contact Us</p>
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
              className="list-unstyled mobile-md-3"
              style={{ fontSize: "13px", lineHeight: "2" }}
            >
              <li className="mb-2">
                <a
                  href="#"
                  className="text-decoration"
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
                  className="text-decoration"
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
                  className="text-decoration"
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
                  className="text-decoration"
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
              className="list-unstyled mobile-md-3"
              style={{ fontSize: "13px", lineHeight: "2" }}
            >
              <li className="mb-2">
                <a
                  href="#"
                  className="text-decoration"
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
                  className="text-decoration"
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
                  className="text-decoration"
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
                  className="text-decoration"
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
              className="list-unstyled mobile-md-3"
              style={{ fontSize: "13px", lineHeight: "2" }}
            >
              <li className="mb-2">
                <a
                  href="#"
                  className="text-decoration"
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
                  className="text-decoration"
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
                  className="text-decoration"
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
                  className="text-decoration"
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
            href="https://www.instagram.com/thekraftsnknots"
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
            href="https://youtube.com/@thekraftsnknots"
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
          © 2026. All rights reserved by Rudra Enterprises.
        </p>

      </Container>
    </footer>
  );
}
