// src/hooks/useLockBodyScroll.ts
import { useLayoutEffect, useRef } from "react";

export function useLockBodyScroll(locked: boolean) {
  const scrollYRef = useRef(0);

  useLayoutEffect(() => {
    const body = document.body;
    const doc = document.documentElement;

    if (locked) {
      scrollYRef.current = window.scrollY;

      const scrollbarW = window.innerWidth - doc.clientWidth;
      if (scrollbarW > 0) body.style.paddingRight = `${scrollbarW}px`;

      // iOS-safe блокировка
      body.style.position = "fixed";
      body.style.top = `-${scrollYRef.current}px`;
      body.style.width = "100%";

      // на десктопах тоже выключим прокрутку для надежности
      body.style.overflow = "hidden";
    } else {
      const y = -parseInt(body.style.top || "0", 10);

      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      body.style.overflow = "";
      body.style.paddingRight = "";

      if (!Number.isNaN(y)) window.scrollTo(0, y);
    }

    return () => {
      // безопасный откат, если компонент размонтируется в "заблокированном" состоянии
      const y = -parseInt(body.style.top || "0", 10);
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      body.style.overflow = "";
      body.style.paddingRight = "";
      if (!Number.isNaN(y)) window.scrollTo(0, y);
    };
  }, [locked]);
}
