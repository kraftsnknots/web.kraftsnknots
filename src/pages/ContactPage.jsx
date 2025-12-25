import Footer from "../components/Footer";
import Header from "../components/Header";
import Reveal from "../components/Reveal";
import Contact from "../components/Contact";

export default function ContactPage() {
    return (
        <>
            <Header />
            <Reveal><Contact /></Reveal>
            <Reveal><Footer /></Reveal>
        </>
    )
}