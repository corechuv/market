// src/components/UI/Carousel/Carousel.tsx
import React, { useRef, useCallback, useMemo } from "react";
import cls from "./Carousel.module.scss";
import Right from "../../Icons/ChevronLeftIcon";
import Left from "../../Icons/ChevronRightIcon";

export type CarouselRenderItem<T> = (args: { item: T; index: number }) => React.ReactNode;

export type CarouselProps<T> = {
    items: T[];
    label?: string;
    className?: string;
    getKey?: (item: T, index: number) => string | number;
    renderItem: CarouselRenderItem<T>;
    gap?: number | string; // CSS var override for --gap (e.g. 12, "12px", "1rem")
    controls?: {
        show?: boolean;
        prevAria?: string;
        nextAria?: string;
    };
};

function getNumber(val: string | null): number | null {
    if (!val) return null;
    const n = parseFloat(val.trim());
    return Number.isFinite(n) ? n : null;
}

export default function Carousel<T>({
    items,
    label,
    className = "",
    getKey,
    renderItem,
    gap = 14,
    controls = { show: true, prevAria: "Scroll left", nextAria: "Scroll right" },
}: CarouselProps<T>) {
    const viewportRef = useRef<HTMLDivElement>(null);

    // read responsive --visible from CSS on the wrapper
    const getVisibleFromCSS = useCallback(() => {
        const vp = viewportRef.current;
        if (!vp) return 4;
        const raw = getComputedStyle(vp).getPropertyValue("--visible");
        const n = getNumber(raw);
        return n && n > 0 ? n : 4;
    }, []);

    // compute one logical step = slot width + gap
    const computeStep = useCallback(() => {
        const vp = viewportRef.current;
        if (!vp) return { step: 0, count: 0, visible: 1 };

        const track = vp.querySelector(`.${cls.track}`) as HTMLDivElement | null;
        const firstSlot = track?.querySelector(`.${cls.itemWrap}`) as HTMLElement | null;
        if (!track || !firstSlot) return { step: 0, count: 0, visible: 1 };

        const slotRect = firstSlot.getBoundingClientRect();
        const gapPx = getNumber(getComputedStyle(track).getPropertyValue("column-gap"))
            ?? getNumber(getComputedStyle(track).getPropertyValue("gap"))
            ?? 0;

        const step = slotRect.width + gapPx;
        const count = track.querySelectorAll(`.${cls.itemWrap}`).length;
        const visible = getVisibleFromCSS();
        return { step, count, visible };
    }, [getVisibleFromCSS]);

    const scrollByCard = useCallback((dir: "prev" | "next") => {
        const vp = viewportRef.current;
        if (!vp) return;
        const { step, count, visible } = computeStep();
        if (!step) return;

        const currentIndex = Math.round(vp.scrollLeft / step);
        const delta = dir === "next" ? 1 : -1;
        const maxIndex = Math.max(0, count - visible);
        const targetIndex = Math.max(0, Math.min(currentIndex + delta, maxIndex));

        vp.scrollTo({ left: targetIndex * step, behavior: "smooth" });
    }, [computeStep]);

    const viewportStyle = useMemo(() => (
        { ["--gap" as any]: typeof gap === "number" ? `${gap}px` : gap }
    ), [gap]);

    return (
        <div className={cls.container}>
            <div className={cls.container__header}>
                {label ? (<h2 className={cls["container__header--title"]}>{label}</h2>) : null}
                {controls?.show !== false && (
                    <div className={cls.container__controls}>
                        <button
                            type="button"
                            className={cls["container__controls--btn"]}
                            aria-label={controls?.prevAria || "Scroll left"}
                            onClick={() => scrollByCard("prev")}
                        >
                            <Left />
                        </button>
                        <button
                            type="button"
                            className={cls["container__controls--btn"]}
                            aria-label={controls?.nextAria || "Scroll right"}
                            onClick={() => scrollByCard("next")}
                        >
                            <Right />
                        </button>
                    </div>
                )}
            </div>

            <div className={`${cls.carousel} ${className}`.trim()}>
                <div className={cls.trackWrapper} ref={viewportRef} style={viewportStyle}
                    role="region" aria-label={label || "Carousel"}>
                    <div className={cls.track} role="list">
                        {items.map((item, i) => (
                            <div className={cls.itemWrap} role="listitem" key={(getKey?.(item, i) ?? i).toString()}>
                                {renderItem({ item, index: i })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
