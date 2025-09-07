import { useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import Modal from "react-bootstrap/Modal";

import gallery from "../data/gallery.json";

export default function Gallery() {
  const [show, setShow] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = (img) => {
    setSelectedImg(img);
    setShow(true);
  };

  return (
    <div className="m-0 p-4 w-100 d-flex flex-column justify-content-center align-items-center">
      {/* Title */}
      <Row>
        <Col className="p-3 text-center">
          <h2 className="gallery-text fw-bold">Gallery</h2>
          <p className="gallery-small-text fw-bold font-monospace">
            Explore our exquisite handmade scented candles.
          </p>
        </Col>
      </Row>

      {/* Images */}
      <Row className="justify-content-center align-items-center gallery-row">
        {gallery.map((img) => (
          <Col
            key={img.id}
            xs={12}
            sm={6}
            md={6}
            lg={5}
            className="mb-4 d-flex justify-content-center align-items-center"
            style={{ maxWidth: "606px", maxHeight: "465px" }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              className="gallery-images"
              fluid
              onClick={() => handleShow(img)}
              style={{ cursor: "pointer" }}
            />
          </Col>
        ))}
      </Row>

      {/* Modal for full image */}
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Body className="d-flex justify-content-center">
          {selectedImg && (
            <Image
              src={selectedImg.src}
              alt={selectedImg.alt}
              fluid
              style={{ maxHeight: "70vh", objectFit: "contain" }}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
