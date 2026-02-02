// src/utils/useIsMobile.ts
import { useEffect, useState } from "react";

export function useIsMobile(breakpoint: number = 768) {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.innerWidth < breakpoint;
    });
    useEffect(() => {
        if (typeof window === "undefined") return; // на случай SSR
        const update = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };
        update(); // первый вызов при монтировании
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, [breakpoint]);
    return isMobile;
}
