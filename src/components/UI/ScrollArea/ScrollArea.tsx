// src/components/UI/ScrollArea/ScrollArea.tsx
import React, { useEffect, useRef } from "react";
import clsx from "clsx";
import s from "./ScrollArea.module.scss";

type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Блокировать скролл документа при маунте */
  lockBody?: boolean;
};

/* ------------------------- Глобальные служебные вещи ------------------------ */

let lockCount = 0;
let savedState: null | {
  scrollY: number;
  docOverflow: string;
  bodyPos: string;
  bodyTop: string;
  bodyWidth: string;
  bodyOverscrollY: string;
} = null;

/** Активные области-скроллеры, в пределах которых разрешаем вертикальный тач-скролл */
const activeAreas = new Set<HTMLElement>();

let touchStartY = 0;
let currentArea: HTMLElement | null = null;
let activeScroller: HTMLElement | null = null;

const getOverflowY = (el: HTMLElement) => {
  const v = getComputedStyle(el).overflowY;
  // Safari может отдавать 'overlay'
  return v === "overlay" ? "auto" : v;
};

const isScrollableY = (el: HTMLElement) => {
  const oy = getOverflowY(el);
  const canScroll = oy === "auto" || oy === "scroll";
  if (!canScroll) return false;
  // +1 на всякий случай против округлений
  return el.scrollHeight > el.clientHeight + 1;
};

/** Находим скроллируемого предка, но не выше заданного лимита (корня области) */
const findScrollableParent = (
  target: Element | null,
  limitRoot: HTMLElement | null
): HTMLElement | null => {
  let el: Element | null = target;
  while (el && el !== document.body && el !== limitRoot) {
    if (el instanceof HTMLElement && isScrollableY(el)) return el;
    el = el.parentElement;
  }
  // Проверим и сам limitRoot
  if (limitRoot && isScrollableY(limitRoot)) return limitRoot;
  return null;
};

const isInsideAnyArea = (target: Element | null): HTMLElement | null => {
  let el: Element | null = target;
  while (el && el !== document.body) {
    if (el instanceof HTMLElement && activeAreas.has(el)) return el;
    el = el.parentElement;
  }
  return null;
};

/* ---------------------------- Глобальные слушатели -------------------------- */

const onTouchStart = (e: TouchEvent) => {
  touchStartY = e.touches[0]?.clientY ?? 0;

  // Определяем, попали ли мы пальцем внутрь какой-либо из зарегистрированных областей
  currentArea = isInsideAnyArea(e.target as Element);
  if (currentArea) {
    activeScroller = findScrollableParent(e.target as Element, currentArea);
  } else {
    activeScroller = null;
  }
};

const onTouchMove = (e: TouchEvent) => {
  // Вне наших областей — всегда блокируем фон
  if (!currentArea) {
    e.preventDefault();
    return;
  }
  // Внутри области, но нет скроллируемого предка — тоже блокируем фон
  if (!activeScroller) {
    e.preventDefault();
    return;
  }

  const y = e.touches[0]?.clientY ?? 0;
  const dy = y - touchStartY;

  const top = activeScroller.scrollTop;
  const max = activeScroller.scrollHeight - activeScroller.clientHeight;

  // На верхней кромке и тянем вниз → запрет (чтобы не «дергать» вьюпорт)
  if (top <= 0 && dy > 0) {
    e.preventDefault();
    return;
  }
  // На нижней кромке и тянем вверх → запрет
  if (top >= max - 1 && dy < 0) {
    e.preventDefault();
    return;
  }
  // Иначе — пусть скроллится внутри контейнера
};

const addGlobalTouchGuards = () => {
  // capture + passive: false — обязательно для preventDefault на iOS
  document.addEventListener("touchstart", onTouchStart, {
    passive: false,
    capture: true,
  });
  document.addEventListener("touchmove", onTouchMove, {
    passive: false,
    capture: true,
  });
};

const removeGlobalTouchGuards = () => {
  document.removeEventListener("touchstart", onTouchStart as any, {
    capture: true,
  } as any);
  document.removeEventListener("touchmove", onTouchMove as any, {
    capture: true,
  } as any);
  currentArea = null;
  activeScroller = null;
};

/* --------------------------- Лок скролла документа -------------------------- */

function acquireBodyLock() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  lockCount += 1;
  if (lockCount !== 1) return;

  const docEl = document.documentElement;
  const body = document.body;
  const scrollY = window.scrollY || window.pageYOffset || 0;

  savedState = {
    scrollY,
    docOverflow: docEl.style.overflow,
    bodyPos: body.style.position,
    bodyTop: body.style.top,
    bodyWidth: body.style.width,
    bodyOverscrollY: body.style.overscrollBehaviorY,
  };

  // Базовая блокировка без «дёрганья» контента
  docEl.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.width = "100%";
  body.style.overscrollBehaviorY = "none";

  // iOS rubber-band guard
  addGlobalTouchGuards();
}

function releaseBodyLock() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount !== 0 || !savedState) return;

  const docEl = document.documentElement;
  const body = document.body;

  // Возвращаем всё как было
  docEl.style.overflow = savedState.docOverflow || "";
  body.style.position = savedState.bodyPos || "";
  body.style.top = savedState.bodyTop || "";
  body.style.width = savedState.bodyWidth || "";
  body.style.overscrollBehaviorY = savedState.bodyOverscrollY || "";

  removeGlobalTouchGuards();

  // Возврат к прежней прокрутке
  const y = savedState.scrollY || 0;
  window.scrollTo(0, y);

  savedState = null;
}

/* -------------------------------- Компонент -------------------------------- */

export default function ScrollArea({
  className,
  children,
  lockBody = true,
  ...rest
}: ScrollAreaProps) {
  const areaRef = useRef<HTMLDivElement>(null);

  // Регистрируем область как «разрешённую» для тач-скролла
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;

    activeAreas.add(el);
    return () => {
      activeAreas.delete(el);
      // если текущая область была удалена — сбросим ссылки
      if (currentArea === el) {
        currentArea = null;
        activeScroller = null;
      }
    };
  }, []);

  // Лок скролла документа по запросу
  useEffect(() => {
    if (!lockBody) return;
    acquireBodyLock();
    return () => releaseBodyLock();
  }, [lockBody]);

  return (
    <div
      ref={areaRef}
      className={clsx(s.s, className)}
      data-scroll-area
      {...rest}
    >
      {children}
    </div>
  );
}
