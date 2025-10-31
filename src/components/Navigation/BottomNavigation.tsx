// src/components/Navigation/BottomNavigation.tsx
import React, { useEffect, useRef, useState } from "react";
import styles from "./BottomNavigation.module.scss";

export type BottomNavItem = {
    key: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    href?: string;
    ariaLabel?: string;
    active?: boolean;
};

export type BottomNavigationProps = { /** Ровно 4 элемента */ items: [BottomNavItem, BottomNavItem, BottomNavItem, BottomNavItem]; /** Отступ снизу в px (к safe-area добавится автоматически) */ bottomOffset?: number; /** Радиус скругления контейнера в px */ rounded?: number; /** Показ на десктопе (по умолчанию скрыт) */ visibleOnDesktop?: boolean; /** Отключить авто-скрытие при скролле */ hideOnScroll?: boolean; className?: string; };

// Тип для CSS custom properties (кастомных CSS‑переменных)
// Чтобы React.CSSProperties не ругался на '--bottom-offset' и '--radius'
// мы расширяем тип и явно объявляем эти ключи.
// Это устраняет ошибку TS2353.

type CSSVars = React.CSSProperties & {
    ['--bottom-offset']?: string;
    ['--radius']?: string;
};

const cx = (...arr: Array<string | undefined | false>) => arr.filter(Boolean).join(" ");

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
    const lastYRef = useRef<number>(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (!hideOnScroll) return;
        if (typeof window === "undefined") return;

        lastYRef.current = window.scrollY;

        const onScroll = () => {
            const currentY = window.scrollY;
            const lastY = lastYRef.current;
            const delta = currentY - lastY;

            if (prefersReducedMotion()) {
                // Уважить настройки доступности — не дёргать панель
                return;
            }

            if (rafRef.current == null) {
                rafRef.current = window.requestAnimationFrame(() => {
                    // Небольшой порог, чтобы не срабатывало от микродвижений
                    if (Math.abs(delta) > 6) {
                        if (delta > 0 && currentY > 32) {
                            setHidden(true); // скролл вниз — прятать
                        } else {
                            setHidden(false); // скролл вверх — показывать
                        }
                        lastYRef.current = currentY;
                    }
                    rafRef.current && window.cancelAnimationFrame(rafRef.current);
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
        '--bottom-offset': `${bottomOffset}px`,
        '--radius': `${rounded}px`,
    };

    const outerClass = cx(
        styles.outer,
        hidden && styles.hidden,
        visibleOnDesktop && styles.forceDesktop,
        className
    );

    return (
        <div className={outerClass} style={styleVars} aria-hidden={false}>
            <nav className={styles.bar} aria-label="Bottom Navigation">
                <ul className={styles.nav} role="menubar">
                    {items.map((item) => {
                        const content = (
                            <>
                                {item.icon && <div className={styles.icon} aria-hidden>{item.icon}</div>}
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
                                    >
                                        {content}
                                    </a>
                                ) : (
                                    <button
                                        type="button"
                                        role="menuitem"
                                        className={cx(styles.item, item.active && styles.itemActive)}
                                        onClick={item.onClick}
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
