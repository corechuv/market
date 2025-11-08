// src/hooks/useViewportUnits.ts
import { useEffect } from "react";

export function useViewportUnits() {
  useEffect(() => {
    const root = document.documentElement;

    const update = () => {
      const vv = window.visualViewport;
      const vh = vv?.height ?? window.innerHeight;
      // высота видимой области
      root.style.setProperty("--app-vh", `${vh}px`);

      // при Overlay-клавиатуре iOS:
      // keyboard = (layoutVH) - (visualVH + offsetTop)
      const layoutH = window.innerHeight;
      const kb = Math.max(0, layoutH - (vv?.height ?? layoutH) - (vv?.offsetTop ?? 0));
      root.style.setProperty("--kb", `${Math.round(kb)}px`);
    };

    update();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("orientationchange", update);

    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);
}
