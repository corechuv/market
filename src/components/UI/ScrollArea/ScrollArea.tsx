// src/components/UI/ScrollArea/ScrollArea.tsx
import React, { useEffect } from "react";
import clsx from "clsx";
import s from "./ScrollArea.module.scss";

type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement> & {
    /** Блокировать скролл документа при маунте */
    lockBody?: boolean;
    /** Переопределить нижний внутренний отступ (например, высоту нижней навигации). Можно "0", "72px" или "calc(...)" */
    bottomInset?: number | string;
};

/* ====== body scroll lock с рефкаунтингом ====== */
let lockCount = 0;
let savedState: null | {
    scrollY: number;
    docOverflow: string;
    bodyPos: string;
    bodyTop: string;
    bodyWidth: string;
    bodyOverscrollY: string;
} = null;

function lockBodyScroll(): () => void {
    if (typeof window === "undefined" || typeof document === "undefined") return () => { };
    lockCount += 1;

    if (lockCount === 1) {
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

        // Перекрываем скролл документа без "дёрганья" контента
        docEl.style.overflow = "hidden";
        body.style.position = "fixed";
        body.style.top = `-${scrollY}px`;
        body.style.width = "100%";
        body.style.overscrollBehaviorY = "none";
    }

    return () => {
        lockCount = Math.max(0, lockCount - 1);
        if (lockCount === 0 && savedState) {
            const docEl = document.documentElement;
            const body = document.body;

            docEl.style.overflow = savedState.docOverflow || "";
            body.style.position = savedState.bodyPos || "";
            body.style.top = savedState.bodyTop || "";
            body.style.width = savedState.bodyWidth || "";
            body.style.overscrollBehaviorY = savedState.bodyOverscrollY || "";

            // Возвращаемся туда, где были
            const y = savedState.scrollY || 0;
            window.scrollTo(0, y);

            savedState = null;
        }
    };
}
/* ============================================== */

export default function ScrollArea({
    className,
    style,
    children,
    lockBody = true,
    bottomInset,
    ...rest
}: ScrollAreaProps) {
    useEffect(() => {
        if (!lockBody) return;
        const unlock = lockBodyScroll();
        return () => unlock();
    }, [lockBody]);

    const styleWithInset: React.CSSProperties =
        bottomInset === undefined
            ? style || {}
            : {
                ...style,
                paddingBottom:
                    typeof bottomInset === "number" ? `${bottomInset}px` : String(bottomInset),
            };

    return (
        <div className={clsx(s.root, className)} style={styleWithInset} {...rest}>
            {children}
        </div>
    );
}
