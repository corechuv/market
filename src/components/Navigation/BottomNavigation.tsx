// src/components/Navigation/BottomNavigation.tsx
import React, { useEffect, useRef, useState } from "react";
import styles from "./BottomNavigation.module.scss";

export type BottomNavItem = {
  key: string;
  icon?: React.ReactNode;
  renderAfterIcon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  ariaLabel?: string;
  active?: boolean;
  to?: string; // опционально для react-router
};

export type BottomNavigationProps = {
  items: BottomNavItem[];           // Ровно 4 элемента
  bottomOffset?: number;            // Отступ снизу в px
  rounded?: number;                 // Радиус скругления контейнера
  visibleOnDesktop?: boolean;       // Показ на десктопе
  hideOnScroll?: boolean;           // Отключить авто-скрытие при скролле
  className?: string;
};

type CSSVars = React.CSSProperties & {
  ["--bottom-offset"]?: string;
  ["--radius"]?: string;
  ["--vb-offset"]?: string; // динамическая «закрытая» зона снизу (Safari toolbar/клава)
  ["--bar-h"]?: string;     // реальная высота панели
};

const cx = (...arr: Array<string | undefined | false>) =>
  arr.filter(Boolean).join(" ");

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function BottomNavigation({
  items,
  bottomOffset = 12,
  rounded = 16,
  visibleOnDesktop = false,
  hideOnScroll = true,
  className,
}: BottomNavigationProps) {
  const [hidden, setHidden] = useState(false);
  const [opening, setOpening] = useState(false); // одноразовая анимация входа «слева»
  const hiddenRef = useRef(hidden);
  const lastYRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const outerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);

  // ====== учёт iOS нижней панели / клавы через visualViewport ======
  useEffect(() => {
    if (typeof window === "undefined") return;

    const setViewportOffsets = () => {
      const vv = (window as any).visualViewport as VisualViewport | undefined;
      let vb = 0;
      if (vv) {
        const bottomGap = window.innerHeight - (vv.height + vv.offsetTop);
        vb = Math.max(0, Math.round(bottomGap));
      }
      if (outerRef.current) {
        outerRef.current.style.setProperty("--vb-offset", `${vb}px`);
      }
    };

    const setBarHeight = () => {
      if (outerRef.current && barRef.current) {
        const h = barRef.current.offsetHeight;
        outerRef.current.style.setProperty("--bar-h", `${h}px`);
      }
    };

    setViewportOffsets();
    setBarHeight();

    window.addEventListener("resize", setViewportOffsets);
    window.addEventListener("orientationchange", setViewportOffsets);

    const vv = (window as any).visualViewport as VisualViewport | undefined;
    if (vv) {
      vv.addEventListener("resize", setViewportOffsets);
      vv.addEventListener("scroll", setViewportOffsets);
    }

    const ro = new ResizeObserver(setBarHeight);
    if (barRef.current) ro.observe(barRef.current);

    return () => {
      window.removeEventListener("resize", setViewportOffsets);
      window.removeEventListener("orientationchange", setViewportOffsets);
      if (vv) {
        vv.removeEventListener("resize", setViewportOffsets);
        vv.removeEventListener("scroll", setViewportOffsets);
      }
      ro.disconnect();
    };
  }, [items]);

  // ====== авто-скрытие при скролле (вправо) / показ (въезд слева) ======
  useEffect(() => {
    if (!hideOnScroll || typeof window === "undefined") return;
    lastYRef.current = window.scrollY;

    const onScroll = () => {
      if (prefersReducedMotion()) return;

      const currentY = window.scrollY;
      const lastY = lastYRef.current;
      const delta = currentY - lastY;

      if (rafRef.current == null) {
        rafRef.current = window.requestAnimationFrame(() => {
          if (Math.abs(delta) > 6) {
            if (delta > 0 && currentY > 32) {
              // прячем вправо
              if (!hiddenRef.current) {
                hiddenRef.current = true;
                setHidden(true);
              }
            } else {
              // показываем: вход слева (только при переходе hidden -> false)
              if (hiddenRef.current) {
                hiddenRef.current = false;
                setHidden(false);
                setOpening(true);
              }
            }
            lastYRef.current = currentY;
          }
          if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [hideOnScroll]);

  const styleVars: CSSVars = {
    "--bottom-offset": `${bottomOffset}px`,
    "--radius": `${rounded}px`,
  };

  const outerClass = cx(
    styles.outer,
    hidden && styles.hidden,
    opening && styles.opening,
    visibleOnDesktop && styles.forceDesktop,
    className
  );

  return (
    <div ref={outerRef} className={outerClass} style={styleVars} aria-hidden={false}>
      <nav
        ref={barRef}
        className={styles.bar}
        aria-label="Bottom Navigation"
        onAnimationEnd={() => setOpening(false)}
      >
        <ul className={styles.nav} role="menubar">
          {items.map((item) => {
            const content = (
              <>
                {item.icon && (
                  <div className={styles.icon} aria-hidden>
                    {item.icon}
                    {item.renderAfterIcon}
                  </div>
                )}
              </>
            );

            return (
              <li key={item.key} className={styles.navItem} role="none">
                {item.href ? (
                  <a
                    role="menuitem"
                    className={cx(styles.item, item.active && styles.itemActive)}
                    href={item.href}
                    onClick={item.onClick}
                    aria-label={item.ariaLabel}
                  >
                    {content}
                  </a>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    className={cx(styles.item, item.active && styles.itemActive)}
                    onClick={item.onClick}
                    aria-label={item.ariaLabel}
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
