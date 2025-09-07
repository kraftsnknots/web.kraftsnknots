import { useState } from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Image from 'react-bootstrap/Image';
import Offcanvas from 'react-bootstrap/Offcanvas';
import logo from '../assets/images/logo.png';
import '../styles/Header.css';
import { IoBagOutline, IoBagSharp } from "react-icons/io5";
import { Link } from 'react-router-dom';

export default function Header() {
    const [expanded, setExpanded] = useState(false);
    const [showCart, setShowCart] = useState(false);

    const handleClose = () => setShowCart(false);
    const handleShow = () => setShowCart(true);

    return (
        <div className="sticky-top bg-white border-bottom">
            <Row className='m-0 p-0'>
                <Col className="text-white p-2 text-center text-uppercase top-tab">
                    Enjoy special discounts on our candles!
                </Col>
            </Row>
            <Row className='m-0 p-0'>
                <Col className="text-black text-center d-flex flex-row align-items-center header-navigation-col">
                    <Link to="/"><Image src={logo} rounded className="logo-small" /></Link>

                    <Nav className="align-items-center justify-content-center p-4 nav-tab" activeKey="/">
                        <Nav.Item>
                            <Nav.Link href="/" className='text-black'>Home</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href='/shop' className='text-black'>Shop</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="link-2" className='text-black'>About</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="link-3" className='text-black'>Contact</Nav.Link>
                        </Nav.Item>
                        <Nav.Item className='ms-4'>
                            <Nav.Link
                                eventKey="link-4"
                                className='text-black'
                                onClick={handleShow}   // <-- OPEN OFFCANVAS
                            >
                                {showCart ? (
                                    <IoBagSharp style={{ width: '2em', height: '2em' }} />
                                ) :
                                    (
                                        <IoBagOutline style={{ width: '2em', height: '2em' }} />
                                    )}

                            </Nav.Link>
                        </Nav.Item>
                    </Nav>

                    {/* Mobile icons (hamburger, etc.) */}
                    <div className="w-25 d-flex justify-content-between align-items-center d-lg-none">
                        {showCart ? (
                            <IoBagSharp style={{ width: '2em', height: '2em' }} onClick={handleShow} />
                        ) :
                            (
                                <IoBagOutline style={{ width: '2em', height: '2em' }} onClick={handleShow} />
                            )}

                        <button
                            className="border-0 bg-transparent "
                            onClick={() => setExpanded(expanded ? false : true)}
                        >
                            {expanded ? (
                                // Close icon (X)
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 
                                    7.293l2.646-2.647a.5.5 0 0 1 
                                    .708.708L8.707 8l2.647 
                                    2.646a.5.5 0 0 1-.708.708L8 
                                    8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 
                                    8 4.646 5.354a.5.5 0 0 1 
                                    0-.708" />
                                </svg>
                            ) : (
                                // Hamburger icon
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M1.5 12.5a.5.5 
                                    0 0 1 0-1h13a.5.5 0 0 1 0 
                                    1h-13zm0-4a.5.5 0 0 1 
                                    0-1h13a.5.5 0 0 1 0 
                                    1h-13zm0-4a.5.5 0 0 1 
                                    0-1h13a.5.5 0 0 1 0 
                                    1h-13z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </Col>
            </Row>

            {/* OFFCANVAS */}
            <Offcanvas show={showCart} onHide={handleClose} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Shopping Bag</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <p>Shopping Bag is empty 🛒</p>
                </Offcanvas.Body>
            </Offcanvas>

            {/* Mobile Dropdown Menu (Overlay) */}
            <div className={`mobile-dropdown ${expanded ? "open" : "close"}`}>
                <Nav className="flex-column p-4 text-end">
                    <Nav.Link as={Link} to="/">Home</Nav.Link>
                    <Nav.Link as={Link} to="/shop">Shop</Nav.Link>
                    <Nav.Link as={Link} to="/about">About</Nav.Link>
                    <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
                </Nav>
            </div>
        </div>
    );
}
