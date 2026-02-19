// src/components/UI/Carousel/Carousel.tsx
import React, { useRef, useCallback, useEffect, useState } from "react";
import cls from "./Carousel.module.scss";
import Right from "../../Icons/ChevronRightIcon";
import Left from "../../Icons/ChevronLeftIcon";

export type CarouselRenderItem<T> = (args: { item: T; index: number }) => React.ReactNode;

export type CarouselProps<T> = {
    items: T[];
    label?: string;
    className?: string;
    getKey?: (item: T, index: number) => string | number;
    renderItem: CarouselRenderItem<T>;
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
    controls = { show: true, prevAria: "Scroll left", nextAria: "Scroll right" },
}: CarouselProps<T>) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(items.length > 1);

    const updateControlsState = useCallback(() => {
        const vp = viewportRef.current;
        if (!vp) {
            setCanPrev(false);
            setCanNext(false);
            return;
        }
        const maxLeft = Math.max(0, vp.scrollWidth - vp.clientWidth);
        const left = vp.scrollLeft;
        const epsilon = 2;
        setCanPrev(left > epsilon);
        setCanNext(left < maxLeft - epsilon);
    }, []);

    const getVisibleFromCSS = useCallback(() => {
        const vp = viewportRef.current;
        if (!vp) return 4;
        const raw = getComputedStyle(vp).getPropertyValue("--visible");
        const n = getNumber(raw);
        return n && n > 0 ? n : 4;
    }, []);

    const computeStep = useCallback(() => {
        const vp = viewportRef.current;
        if (!vp) return { step: 0, count: 0, visible: 1 };

        const track = vp.querySelector(`.${cls["carousel__track"]}`) as HTMLDivElement | null;
        const firstSlot = track?.querySelector(`.${cls["carousel__slide"]}`) as HTMLElement | null;
        if (!track || !firstSlot) return { step: 0, count: 0, visible: 1 };

        const slotRect = firstSlot.getBoundingClientRect();
        const gapPx = getNumber(getComputedStyle(track).getPropertyValue("column-gap"))
            ?? getNumber(getComputedStyle(track).getPropertyValue("gap"))
            ?? 0;

        const step = slotRect.width + gapPx;
        const count = track.querySelectorAll(`.${cls["carousel__slide"]}`).length;
        const visible = getVisibleFromCSS();
        return { step, count, visible };
    }, [getVisibleFromCSS]);

    useEffect(() => {
        const vp = viewportRef.current;
        if (!vp) {
            setCanPrev(false);
            setCanNext(false);
            return;
        }

        updateControlsState();

        const onScroll = () => updateControlsState();
        vp.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", updateControlsState);

        let ro: ResizeObserver | null = null;
        if (typeof ResizeObserver !== "undefined") {
            ro = new ResizeObserver(() => updateControlsState());
            ro.observe(vp);
            const track = vp.querySelector(`.${cls["carousel__track"]}`) as Element | null;
            if (track) ro.observe(track);
        }

        return () => {
            vp.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", updateControlsState);
            ro?.disconnect();
        };
    }, [items.length, updateControlsState]);

    const scrollByCard = useCallback((dir: "prev" | "next") => {
        const vp = viewportRef.current;
        if (!vp) return;
        if (dir === "prev" && !canPrev) return;
        if (dir === "next" && !canNext) return;
        const { step, count, visible } = computeStep();
        if (!step) return;

        const currentIndex = Math.round(vp.scrollLeft / step);
        const delta = dir === "next" ? 1 : -1;
        const maxIndex = Math.max(0, count - visible);
        const targetIndex = Math.max(0, Math.min(currentIndex + delta, maxIndex));

        vp.scrollTo({ left: targetIndex * step, behavior: "smooth" });
    }, [canNext, canPrev, computeStep]);

    return (
        <section className={cls.carousel}>
            <div className={cls.carousel__header}>
                {label ? (<h2 className={cls["carousel__header--title"]}>{label}</h2>) : null}
                {controls?.show !== false && (
                    <div className={cls.carousel__controls}>
                        <button
                            type="button"
                            className={cls["carousel__controls--btn"]}
                            aria-label={controls?.prevAria || "Scroll left"}
                            onClick={() => scrollByCard("prev")}
                            disabled={!canPrev}
                        >
                            <Left />
                        </button>
                        <button
                            type="button"
                            className={cls["carousel__controls--btn"]}
                            aria-label={controls?.nextAria || "Scroll right"}
                            onClick={() => scrollByCard("next")}
                            disabled={!canNext}
                        >
                            <Right />
                        </button>
                    </div>
                )}
            </div>

            <div className={`${cls.carousel__viewport} ${className}`.trim()}>
                <div className={cls["carousel__viewport--inner"]}
                    ref={viewportRef}
                    role="region"
                    aria-label={label || "Carousel"}
                >
                    <div className={cls["carousel__track"]} role="list">
                        {items.map((item, i) => (
                            <div className={cls["carousel__slide"]} role="listitem" key={(getKey?.(item, i) ?? i).toString()}>
                                {renderItem({ item, index: i })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
