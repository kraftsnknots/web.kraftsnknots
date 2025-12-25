import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import textimg1 from '../assets/images/text-img1.jpg';
import textimg2 from '../assets/images/text-img2.jpg';
import './styles/Section3.css';
import { Link } from "react-router-dom";

export default function Section3() {
    return (
        <Row className="m-0 p-5 text-center section3-row">
            <Col
                className="d-flex justify-content-center align-items-center section3-col"
                style={{ gap: "15px" }}
            >
                {/* First Image Card */} 
                <div className="image-card">
                    <Image src={textimg1} className="background-img"/> 
                    <div className="overlay-content">
                        <p className="small-text">UNIQUE & ADORABLE DESIGNS</p>
                        <h2>Explore Our Collection</h2>
                        <Link to="/shop" className="shop-btn shop-btn2">
                            Shop Now
                        </Link>
                    </div>
                </div>

                {/* Second Image Card */}
                <div className="image-card">
                    <Image src={textimg2} className="background-img" />
                    <div className="overlay-content">
                        <p className="small-text">CUSTOMIZED GIFT ORDERS</p>
                        <h2>Personalized Decorated Collection</h2>
                        <Link to="/shop" className="shop-btn">
                            Order Yours
                        </Link>
                    </div>
                </div>
            </Col>
        </Row>
    )
}