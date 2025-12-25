import { useLocation } from "react-router-dom";
import Authorization from "../components/Authorization";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Reveal from "../components/Reveal";


export default function AuthPage() {
    const location = useLocation();
    const from = location.state?.from?.pathname || "/account";



    return (
        <>
            <Header />
            <Reveal><Authorization lastPage={from} /></Reveal>
            <Reveal><Footer /></Reveal>
        </>
    )
} 