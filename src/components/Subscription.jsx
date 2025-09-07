import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export default function Subscription() {
    return (
        <Row className="m-0 w-100 d-flex flex-column justify-content-center align-items-center subscription-panel" >
            <Col className="d-flex flex-column justify-content-center align-items-center">
                <h4 className="text-white fw-bold mb-3 subscription-heading">Join Our Candle Community</h4>
                <p className="text-light mb-4 subscription-text fs-6">
                    Get exclusive offers and updates on scents!
                </p>

                <Form className="d-flex flex-column align-items-center w-100">
                    <Form.Group controlId="formEmail" className="mb-3 subscription-form">
                        <Form.Label className="text-white text-start w-100">
                            Your Email Address
                        </Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter your email here"
                            className="rounded subscription-input"
                        />
                    </Form.Group>

                    <Button
                        type="submit"
                        className="px-5 py-3 rounded-pill"
                        style={{ backgroundColor: "#9a7d9b", border: "none" }}
                    >
                        Subscribe
                    </Button>
                </Form>
            </Col>
        </Row>
    )
}