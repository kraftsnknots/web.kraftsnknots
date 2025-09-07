import Container from "react-bootstrap/Container";
import "../styles/HomePage.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Gallery from "../components/Gallery";
import VideoPlayer from "../components/VideoPlayer";
import Shop from "../components/Shop";
import Subscription from "../components/Subscription";
import Section3 from "../components/Section3";
import Reveal from "../components/Reveal";

export default function HomePage() {
    return (
        <Container fluid className="p-0 m-0">
            <Header />

            <Reveal>
                <VideoPlayer />
            </Reveal>

            <Reveal>
                <Section3 />
            </Reveal>

            <Reveal>
                <Shop />
            </Reveal>

            <Reveal>
                <Subscription />
            </Reveal>

            <Reveal>
                <Gallery />
            </Reveal>

            <Reveal>
                <Footer />
            </Reveal>
        </Container>
    );
}
