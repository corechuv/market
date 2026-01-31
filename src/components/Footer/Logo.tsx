// src/components/Footer/Logo.tsx
import s from "../../styles/default.module.scss"
import { useEffect, useState } from "react";

import l from "@/assets/svg/logo/dashedo-logo.edge-height120-tracking30-light.svg"
import d from "@/assets/svg/logo/dashedo-logo.edge-height120-tracking30-dark.svg"

type LogoProps = {
    onClick?: () => void;
    ariaLabel?: string;
    compact?: boolean;
};

export default function Logo({ onClick, ariaLabel = "Home", compact = false }: LogoProps) {
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

    const clickable = !!onClick;

    const className = [
        s.brand,
        compact ? s["brand--compact"] : "",
    ].join(" ");

    return (
        <div className={className}>
            <img
                loading="lazy"
                src={theme === "dark" ? l : d}
                alt="dashedo logo"
                className={[
                    s.brand__logo,
                    clickable ? s["brand__logo--clickable"] : "",
                ].join(" ")}
                onClick={onClick}
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                aria-label={clickable ? ariaLabel : undefined}
                onKeyDown={(e) => {
                    if (!onClick) return;
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onClick();
                    }
                }}
            />
        </div>
    );
}
