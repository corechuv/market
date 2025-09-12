import React from "react";
import { useNavigate } from "react-router-dom";
import ChevronRightIcon from "../Icons/ChevronLeftIcon"; // 👈 проверь импорт!
import cls from "./Breadcrumbs.module.scss";
import HomeIcon from "../Icons/HomeIcon";

type CategoryCrumb = {
    id: string;
    name: string;
    fullSlug: string;
};

type BreadcrumbsProps = {
    crumbs?: CategoryCrumb[];
    className?: string;
    showHome?: boolean;
};

const FADE_PX = 16; // ширина затемнения по краям

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
    crumbs = [],
    className,
    showHome = true,
}) => {
    const nav = useNavigate();
    const ref = React.useRef<HTMLElement | null>(null);

    // вспомогательная функция: обновляет CSS-переменные в зависимости от позиции скролла
    const updateFade = React.useCallback(() => {
        const el = ref.current;
        if (!el) return;

        const { scrollLeft, scrollWidth, clientWidth } = el;
        const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);

        // небольшой допуск на плавающие значения
        const EPS = 1;

        const noOverflow = scrollWidth <= clientWidth + EPS;
        const atLeft = scrollLeft <= EPS;
        const atRight = maxScrollLeft - scrollLeft <= EPS;

        // по умолчанию показываем фейды с обеих сторон
        let left = `${FADE_PX}px`;
        let right = `${FADE_PX}px`;

        if (noOverflow) {
            left = "0px";
            right = "0px";
        } else {
            if (atLeft) left = "0px";
            if (atRight) right = "0px";
        }

        el.style.setProperty("--fade-left", left);
        el.style.setProperty("--fade-right", right);
    }, []);

    // Авто-скролл к концу на узких экранах + выставление фейдов
    React.useEffect(() => {
        if (typeof window === "undefined") return;
        const el = ref.current;
        const isNarrow = window.matchMedia("(max-width: 756px)").matches;
        if (el && isNarrow) {
            el.scrollLeft = el.scrollWidth;
            // ждём кадр, чтобы браузер применил scrollLeft, затем считаем фейды
            requestAnimationFrame(updateFade);
        } else {
            updateFade();
        }
    }, [crumbs.length, updateFade]);

    // Слушатели скролла/ресайза
    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const onScroll = () => updateFade();
        const onResize = () => updateFade();

        el.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);

        // начальная инициализация
        updateFade();

        return () => {
            el.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
        };
    }, [updateFade]);

    return (
        <nav
            ref={ref}
            className={`${cls.category} ${className ?? ""}`}
            aria-label="Breadcrumb"
            tabIndex={0} // клавиатурный скролл
        >
            {showHome && (
                <HomeIcon
                    className={cls["category__icon--home"]}
                    aria-label="Home"
                    onClick={() => nav("/")}
                />
            )}

            {crumbs.map((c, i) => {
                const isLast = i === crumbs.length - 1;
                return (
                    <span className={cls.category__crumb} key={c.id}>
                        <ChevronRightIcon className={cls.category__icon} aria-hidden />
                        <span
                            className={cls.category__link}
                            aria-current={isLast ? "page" : undefined}
                            onClick={() => nav(`/category${c.fullSlug}`)}
                            title={c.name}
                        >
                            {c.name}
                        </span>
                    </span>
                );
            })}
        </nav>
    );
};

export default React.memo(Breadcrumbs);
