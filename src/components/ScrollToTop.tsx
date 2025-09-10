// src/components/ScrollToTop.tsx
import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType(); // "PUSH" | "POP" | "REPLACE"

  useEffect(() => {
    // Если пришли по якорю /path#id — не мешаем браузеру проскроллить к якорю
    if (hash) return;

    // При обычной навигации "вперёд" поднимаем вверх.
    // При "назад/вперёд" (POP) чаще хотят восстановление позиции — оставим как есть.
    if (navType !== "POP") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" }); // можно "smooth"
    }
  }, [pathname, hash, navType]);

  return null;
}
