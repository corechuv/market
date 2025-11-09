// src/utils/scroll/lock.ts
let lockCount = 0;

type Saved = {
  scrollY: number;
  docOverflow: string;
  bodyPos: string;
  bodyTop: string;
  bodyWidth: string;
  bodyPaddingRight: string;
  bodyOverscrollY: string;
};
let savedState: Saved | null = null;

/** Области, в пределах которых разрешаем вертикальный тач-скролл (iOS) */
const activeAreas = new Set<HTMLElement>();
let touchStartY = 0;
let currentArea: HTMLElement | null = null;
let activeScroller: HTMLElement | null = null;

const getOverflowY = (el: HTMLElement) => {
  const v = getComputedStyle(el).overflowY;
  return v === "overlay" ? "auto" : v;
};
const isScrollableY = (el: HTMLElement) => {
  const oy = getOverflowY(el);
  const canScroll = oy === "auto" || oy === "scroll";
  if (!canScroll) return false;
  return el.scrollHeight > el.clientHeight + 1;
};
const findScrollableParent = (target: Element | null, limitRoot: HTMLElement | null): HTMLElement | null => {
  let el: Element | null = target;
  while (el && el !== document.body && el !== limitRoot) {
    if (el instanceof HTMLElement && isScrollableY(el)) return el;
    el = el.parentElement;
  }
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

// --- touch guards (для iOS, чтобы не «протекало» прокруткой за пределы активной области)
const onTouchStart = (e: TouchEvent) => {
  touchStartY = e.touches[0]?.clientY ?? 0;
  currentArea = isInsideAnyArea(e.target as Element);
  activeScroller = currentArea ? findScrollableParent(e.target as Element, currentArea) : null;
};
const onTouchMove = (e: TouchEvent) => {
  if (!currentArea) { e.preventDefault(); return; }
  if (!activeScroller) { e.preventDefault(); return; }
  const y = e.touches[0]?.clientY ?? 0;
  const dy = y - touchStartY;
  const top = activeScroller.scrollTop;
  const max = activeScroller.scrollHeight - activeScroller.clientHeight;
  if (top <= 0 && dy > 0) { e.preventDefault(); return; }
  if (top >= max - 1 && dy < 0) { e.preventDefault(); return; }
};
const addGlobalTouchGuards = () => {
  document.addEventListener("touchstart", onTouchStart, { passive: false, capture: true });
  document.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
};
const removeGlobalTouchGuards = () => {
  document.removeEventListener("touchstart", onTouchStart as any, { capture: true } as any);
  document.removeEventListener("touchmove", onTouchMove as any, { capture: true } as any);
  currentArea = null;
  activeScroller = null;
};

// --- public API для регистрации областей прокрутки
export function registerScrollArea(el: HTMLElement) {
  activeAreas.add(el);
}
export function unregisterScrollArea(el: HTMLElement) {
  activeAreas.delete(el);
  if (currentArea === el) {
    currentArea = null;
    activeScroller = null;
  }
}

// --- основной lock manager
export function acquireBodyLock() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  lockCount += 1;
  if (lockCount !== 1) return;

  const docEl = document.documentElement;
  const body = document.body;
  const scrollY = window.scrollY || window.pageYOffset || 0;
  const scrollbarW = window.innerWidth - docEl.clientWidth;

  savedState = {
    scrollY,
    docOverflow: docEl.style.overflow,
    bodyPos: body.style.position,
    bodyTop: body.style.top,
    bodyWidth: body.style.width,
    bodyPaddingRight: body.style.paddingRight,
    bodyOverscrollY: body.style.overscrollBehaviorY,
  };

  if (scrollbarW > 0) body.style.paddingRight = `${scrollbarW}px`; // компенсация исчезнувшего скроллбара
  docEl.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;   // держим визуально на той же позиции
  body.style.width = "100%";
  body.style.overscrollBehaviorY = "none";

  addGlobalTouchGuards();
}

export function releaseBodyLock() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount !== 0 || !savedState) return;

  const docEl = document.documentElement;
  const body = document.body;

  docEl.style.overflow = savedState.docOverflow || "";
  body.style.position = savedState.bodyPos || "";
  body.style.top = savedState.bodyTop || "";
  body.style.width = savedState.bodyWidth || "";
  body.style.paddingRight = savedState.bodyPaddingRight || "";
  body.style.overscrollBehaviorY = savedState.bodyOverscrollY || "";

  removeGlobalTouchGuards();

  const y = savedState.scrollY || 0;
  window.scrollTo(0, y); // вернули туда, где были до блокировки
  savedState = null;
}
