import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { FaInstagram, FaYoutube } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="text-light mt-5 footer-container">
            <Container className="p-5 d-flex flex-column justify-content-between align-items-start">
                <Row className="w-100 d-flex justify-content-center">
                    {/* Left Section - Candles */}
                    <Col md={4} className="mb-4">
                        <h5 className="fw-bold">Candles</h5>
                        <p className="small fs-6 mt-4">
                            Explore our unique handmade scented candles on our social media
                            channels.
                        </p>
                        <div className="d-flex justify-content-center justify-content-md-start gap-3 mt-3">
                            <a href="https://www.instagram.com/ujaasaroma" className="text-light fs-4" target="_blank" >
                                <FaInstagram />
                            </a>
                            <a href="https://youtube.com/@ujaasaroma" className="text-light fs-4" target="_blank">
                                <FaYoutube />
                            </a>
                        </div>
                    </Col>

                    {/* Middle Section - Contact */}
                    <Col md={4} className="mb-4">
                        <h6 className="fw-bold">CONTACT</h6>
                        <p className="mb-0 mt-4">support@ujaasaroma.com</p>
                    </Col>

                    {/* Right Section - Follow */}
                    <Col md={4}>
                        <h6 className="fw-bold">FOLLOW</h6>
                        <Form className="mt-4">
                            <Form.Group controlId="formEmail" className="mb-3">
                                <Form.Label className="small fs-6">Your Email Address</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter your email here"
                                    className="rounded p-3"
                                />
                            </Form.Group>
                            <Button
                                type="submit"
                                className="px-4"
                                style={{ backgroundColor: "#9B84A5", border: "none" }}
                            >
                                Subscribe
                            </Button>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <p className="small mt-5 mb-0 fs-6">
                        © 2025. All rights reserved.
                    </p>
                </Row>
            </Container>
        </footer>
    );
}