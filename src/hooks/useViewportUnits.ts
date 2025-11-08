// src/hooks/useVisualViewport.ts
import { useEffect } from "react";

export function useVisualViewport() {
  useEffect(() => {
    const root = document.documentElement;

    const update = () => {
      const vv = window.visualViewport;
      const layoutW = window.innerWidth;
      const layoutH = window.innerHeight;

      const vw = vv?.width  ?? layoutW;
      const vh = vv?.height ?? layoutH;
      const vtop  = vv?.offsetTop  ?? 0;
      const vleft = vv?.offsetLeft ?? 0;

      // переменные для размеров/смещений видимой области
      root.style.setProperty("--vv-w", `${Math.round(vw)}px`);
      root.style.setProperty("--vv-h", `${Math.round(vh)}px`);
      root.style.setProperty("--vv-top", `${Math.round(vtop)}px`);
      root.style.setProperty("--vv-left", `${Math.round(vleft)}px`);

      // «высота клавиатуры» (примерная)
      const kb = Math.max(0, layoutH - (vv?.height ?? layoutH) - (vv?.offsetTop ?? 0));
      root.style.setProperty("--kb", `${Math.round(kb)}px`);

      root.classList.toggle("kb-open", kb > 20);
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
