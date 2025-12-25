import Footer from "../components/Footer";
import Header from "../components/Header";
import Reveal from "../components/Reveal";
import Accounts from "../components/Accounts";

export default function AccountPage() {
    return (
        <>
            <Header />
            <Reveal><Accounts /></Reveal>
            <Reveal><Footer /></Reveal>
        </>
    )
}