// src/components/lyouts/InformationLayout.tsx
import { Outlet } from "react-router-dom";
import c from "./InformationLayout.module.scss";
import Logo from "../Footer/Logo";
import Footer from "../Footer/Footer";

export default function InformationLayout() {
    return (
        <div className={c.main}>
            <Logo />
            <Outlet />
            <Footer />
        </div>
    );
}
