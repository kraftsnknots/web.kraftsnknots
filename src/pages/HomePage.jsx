import { useEffect, useState } from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import Dropdown from "react-bootstrap/Dropdown";
import logo from '../assets/images/logo.png';
import textimg1 from '../assets/images/text-img1.jpg';
import textimg2 from '../assets/images/text-img2.jpg';
import '../styles/HomePage.css';
import main1 from "../assets/videos/main1.mp4";
import main2 from "../assets/videos/main2.mp4";
import main3 from "../assets/videos/main3.mp4";
import main4 from "../assets/videos/main4.mp4";
import main5 from "../assets/videos/main5.mp4";
import main6 from "../assets/videos/main6.mp4";
import main7 from "../assets/videos/main7.mp4";
import products from "../data/products.json";


export default function HomePage() {
    const videos = [
        main1,
        main2,
        main3,
        main4,
        main5,
        main6,
        main7,
    ];

    const [selectedVideo, setSelectedVideo] = useState(videos[0]);
    console.log(selectedVideo);

    useEffect(() => {
        // Pick random video each time page loads
        const randomIndex = Math.floor(Math.random() * videos.length);
        setSelectedVideo(videos[randomIndex]);
    }, []);
    return (
        <Container fluid className="p-0 m-0">
            <div className="sticky-top bg-white">
                <Row className='m-0 p-0'>
                    <Col className="text-white p-2 text-center text-uppercase top-tab">
                        Enjoy special discounts on our candles!
                    </Col>
                </Row>
                <Row className='m-0 p-0'>
                    <Col className="text-black text-center flex-row d-flex justify-content-around align-items-center">
                        <Image src={logo} rounded className="logo-small" />
                        <Nav className="d-flex align-items-center justify-content-center p-4 nav-tab" activeKey="/home">
                            <Nav.Item>
                                <Nav.Link href="/home" className='text-black'>Home</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="link-1" className='text-black'>Shop</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="link-2" className='text-black'>About</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="link-3" className='text-black'>Contact</Nav.Link>
                            </Nav.Item>
                            <Nav.Item className='ms-4'>
                                <Nav.Link eventKey="link-3" className='text-black'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-cart3" viewBox="0 0 16 16">
                                        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l.84 4.479 9.144-.459L13.89 4zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                                    </svg>
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                </Row>
            </div>
            <Row className="w-100 m-0 p-0">
                <Col className="video-container">
                    <video
                        className="background-video"
                        src={selectedVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                    {/* ✅ Overlay */}
                    <div className="video-overlay"></div>

                    {/* ✅ Text Content */}
                    <div className="video-text w-50">
                        <h1>Artisanal Distinct Scented Flames</h1>
                        <p>Each of the Ujaas Aroma wick is crafted with love. Explore our unique fragrances!</p>
                        <Button variant="dark mt-5 p-3 w-25" className="main-btn">Shop Now</Button>
                    </div>
                </Col>
            </Row>
            <Row className="m-0 p-5 text-center">
                <Col
                    className="d-flex flex-row justify-content-center align-items-center"
                    style={{ gap: "15px" }}
                >
                    {/* First Image Card */}
                    <div className="image-card">
                        <Image src={textimg1} className="background-img" />
                        <div className="overlay-content">
                            <p className="small-text">UNIQUE SHAPES & SCENTS</p>
                            <h2>Explore Our Candles</h2>
                            <button className="shop-btn shop-btn2">Shop Now</button>
                        </div>
                    </div>

                    {/* Second Image Card */}
                    <div className="image-card">
                        <Image src={textimg2} className="background-img" />
                        <div className="overlay-content">
                            <p className="small-text">CUSTOM CANDLE ORDERS</p>
                            <h2>Personalized Scented Candles</h2>
                            <button className="shop-btn">Order Yours</button>
                        </div>
                    </div>
                </Col>
            </Row>
            <Row className="m-0 p-4  justify-content-center align-items-center">
                <Col className="d-flex justify-content-end align-items-center " style={{ maxWidth: "70%", gap: "50px" }}>
                    <span className="me-2">Sort by:</span>
                    <Dropdown>
                        <Dropdown.Toggle
                            variant="light"
                            id="dropdown-basic"
                            className="border-0 shadow-none bg-white"
                        >
                            Default
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item>Price: Low to High</Dropdown.Item>
                            <Dropdown.Item>Price: High to Low</Dropdown.Item>
                            <Dropdown.Item>Newest</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
            </Row>
            <div className="m-0 p-0 w-100 justify-content-center d-flex">
                <Row className="m-0 p-0 flex-row justify-content-center align-items-center" style={{ rowGap: "100px", columnGap: '30px', maxWidth: '75%' }}>
                    {products.map((product) => (
                        <Col key={product.id} style={{ maxWidth: "288px" }}>
                            <div className="product-card">
                                <div className="product-img-wrapper">
                                    <Image src={product.img} alt={product.name} fluid />
                                    <span className="product-tag">{product.tag}</span>
                                </div>
                                <div className="product-info">
                                    <p className="product-name">{product.name}</p>
                                    <p className="product-price">
                                        <span className="old-price">{product.oldPrice}</span>{" "}
                                        <span className="new-price">{product.price}</span>
                                    </p>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>
            <Row className="d-flex border flex-column justify-content-center align-items-center" style={{ backgroundColor: "#1f1f2e", marginTop: "150px", padding: "80px", height: 504 }}>
                <Col className="d-flex flex-column justify-content-center align-items-center">
                    <h4 className="text-white fw-bold mb-3 subscription-heading">Join Our Candle Community</h4>
                    <p className="text-light mb-4 subscription-text">
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
                                className="p-3 rounded subscription-input"
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

        </Container>
    );
}
