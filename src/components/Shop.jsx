import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Dropdown from "react-bootstrap/Dropdown";
import products from "../data/products.json";
import '../styles/Shop.css';

export default function Shop() {
    return (
        <Row className="p-0 flex-column justify-content-center align-items-center shop-row">
            <Col className="products-sorting">
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
            <Col>
                <Row className="m-0 shop-display-row">
                    {products.map((product) => (
                        <Col key={product.id} className='shop-product-col'>
                            <div className="product-card">
                                <div className="product-img-wrapper">
                                    <Image src={product.img} alt={product.name} className='image-hover' />
                                    <span className="product-tag">{product.tag}</span>
                                </div>
                                <div className="product-info">
                                    <p className="product-name fs-6 fw-bold">{product.name}</p>
                                    <p className="product-price">
                                        <span className="old-price">{product.oldPrice}</span>{" "}
                                        <span className="new-price">{product.price}</span>
                                    </p>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Col>
        </Row>

    )
}