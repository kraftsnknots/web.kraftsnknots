import Footer from "../components/Footer";
import Header from "../components/Header";
import Profile from "../components/Profile";
import Reveal from "../components/Reveal";

export default function ProfilePage() {
    return (
        <>
            <Header bg="#f9fafc"/>
            <Reveal><Profile /></Reveal>
            <Reveal><Footer /></Reveal>
        </>
    )
}