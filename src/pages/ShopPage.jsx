import Footer from "../components/Footer";
import Header from "../components/Header";
import Shop from "../components/Shop";
import Reveal from "../components/Reveal";

export default function ShopPage() {
    return (
        <>
            <Header />
            <Reveal><Shop /></Reveal>
            <Reveal><Footer /></Reveal>
        </>
    )
}