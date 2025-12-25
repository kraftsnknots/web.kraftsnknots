import { useEffect, useState } from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import main1 from "../assets/videos/main1.mp4";
import main2 from "../assets/videos/main2.mp4";
import main3 from "../assets/videos/main3.mp4";
import main4 from "../assets/videos/main4.mp4";
import './styles/VideoPlayer.css';
import { useNavigate } from "react-router-dom";

export default function VideoPlayer() {
    const navigate = useNavigate();
    const videos = [
        main1,
        main2,
        main3,
        main4,
    ];

    const [selectedVideo, setSelectedVideo] = useState(videos[0]);

    useEffect(() => {
        // Pick random video each time page loads
        const randomIndex = Math.floor(Math.random() * videos.length);
        setSelectedVideo(videos[randomIndex]);
    }, []);
    return (
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
                <div className="video-text">
                    <h1>Distinctive Packaging for Exceptional Experience</h1>
                    <p>Each of the Krafts & Knots item is crafted with love. Explore our distinct range of products!</p>
                    <Button variant="link mt-5 p-3" className="main-btn" onClick={()=> navigate("/shop")}>Shop Now</Button>
                </div>
            </Col>
        </Row>
    )
}