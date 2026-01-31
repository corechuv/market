import React, { useEffect, useRef } from "react";
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
  items: BottomNavItem[];     // Ровно 4 элемента
  bottomOffset?: number;      // Отступ снизу в px
  visibleOnDesktop?: boolean; // Показ на десктопе
  /**
   * @deprecated Авто-скрытие и анимации убраны, проп больше не используется
   */
  hideOnScroll?: boolean;
  className?: string;
};

type CSSVars = React.CSSProperties & {
  ["--bottom-offset"]?: string;
  ["--radius"]?: string;
  ["--vb-offset"]?: string;
  ["--bar-h"]?: string;
};

const cx = (...arr: Array<string | undefined | false>) =>
  arr.filter(Boolean).join(" ");

export default function BottomNavigation({
  items,
  bottomOffset = 0,
  visibleOnDesktop = false,
  className,
}: BottomNavigationProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);

  // учёт iOS нижней панели / клавы через visualViewport
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
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
      root.style.setProperty("--bottom-nav-vb", `${vb}px`);
    };

    const setBarHeight = () => {
      if (outerRef.current && barRef.current) {
        const h = barRef.current.offsetHeight;
        outerRef.current.style.setProperty("--bar-h", `${h}px`);
        root.style.setProperty("--bottom-nav-h", `${h}px`);
      }
    };

    setViewportOffsets();
    setBarHeight();
    root.style.setProperty("--bottom-nav-offset", `${bottomOffset}px`);

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
      root.style.setProperty("--bottom-nav-vb", "0px");
      root.style.setProperty("--bottom-nav-h", "0px");
      root.style.setProperty("--bottom-nav-offset", "0px");
    };
  }, [items, bottomOffset]);

  const styleVars: CSSVars = {
    "--bottom-offset": `${bottomOffset}px`,
  };

  const outerClass = cx(
    styles.outer,
    visibleOnDesktop && styles.forceDesktop,
    className
  );

  return (
    <div ref={outerRef} className={outerClass} style={styleVars}>
      <nav
        ref={barRef}
        className={styles.bar}
        aria-label="Bottom Navigation"
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
                    className={cx(
                      styles.item,
                      item.active && styles.itemActive
                    )}
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
                    className={cx(
                      styles.item,
                      item.active && styles.itemActive
                    )}
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
