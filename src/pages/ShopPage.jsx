import Footer from "../components/Footer";
import Header from "../components/Header";
import Reveal from "../components/Reveal";
import Shop from "../components/Shop";

export default function ShopPage() {
    return (
        <>
            <Header bg="linear-gradient(135deg, #fff, #f5f1f0)"/>
            <Reveal><Shop /></Reveal>
            <Reveal><Footer /></Reveal>
        </>
    )
}