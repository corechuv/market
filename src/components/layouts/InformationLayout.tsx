// src/components/lyouts/InformationLayout.tsx
import { Outlet } from "react-router-dom";
import c from "./InformationLayout.module.scss";
import Logo from "../Footer/Logo";

export default function InformationLayout() {
    return (
        <div className={c.main}>
            <Logo />
            <Outlet />
        </div>
    );
}
