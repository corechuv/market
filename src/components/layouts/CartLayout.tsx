// src/components/lyouts/CartLayout.tsx
import { Outlet } from "react-router-dom";
import c from "./CartLayout.module.scss"
import Footer from "../Footer/Footer";
import Header from "../Checkout/Header";

export default function CartLayout() {

    return (
        <div className={c.m}>
            <Header />
            <Outlet />
            <Footer />
        </div>
    )
}
