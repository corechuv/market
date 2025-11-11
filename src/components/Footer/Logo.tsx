// src/components/Footer/Logo.tsx
import s from "../../styles/default.module.scss"
import { useEffect, useState } from "react";

import l from "@/assets/svg/logo/dashedo-logo.edge-height120-tracking30-light.svg"
import d from "@/assets/svg/logo/dashedo-logo.edge-height120-tracking30-dark.svg"

export default function Logo() {
    const [theme, setTheme] = useState(() =>
        document.documentElement.getAttribute("data-theme") || "light"
    );

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTheme(document.documentElement.getAttribute("data-theme") || "light");
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    return (
        <div className={s.brand}>
            <img loading="lazy" src={theme === "dark" ? l : d} alt="dashedo logo" className={s.brand__logo} />
        </div>
    );
}
