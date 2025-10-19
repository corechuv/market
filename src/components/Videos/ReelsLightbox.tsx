import React from "react";
import clsx from "clsx";
import styles from "./ReelsLightbox.module.scss";
import { type ReviewOut } from "../../types/review/review";
import { ReviewVideoResolver } from "../Product/Review/ReviewVideoResolver";
import { setReviewHelpful } from "../../services/reviewApi";
import CloseIcon from "../Icons/CloseIcon";
import HeartIcon from "../Icons/HeartIcon";
import StarIcon from "../Icons/StarIcon";
import ArrowBottomIcon from "../Icons/ArrowBottomIcon";
import ArrowTopIcon from "../Icons/ArrowTopIcon";
import LinkIcon from "../Icons/LinkIcon";

type Item = {
    review: ReviewOut;
    url: string;
    poster?: string;
};

type Props = {
    items: Item[];
    startIndex?: number;
    onClose: () => void;
    onIndexChange?: (i: number) => void;
};

// скорость «скролла» трека — пикселей в секунду
const SPEED_PX_PER_SEC = 1400;

function useBodyScrollLock(active: boolean) {
    React.useEffect(() => {
        if (!active) return;

        const body = document.body;
        const docEl = document.documentElement;
        const scrollY = window.scrollY;
        const prev = {
            position: body.style.position,
            top: body.style.top,
            left: body.style.left,
            right: body.style.right,
            width: body.style.width,
            overflow: body.style.overflow,
            paddingRight: body.style.paddingRight,
        };

        // компенсируем пропажу скроллбара, чтобы не прыгала верстка
        const sbw = window.innerWidth - docEl.clientWidth;
        if (sbw > 0) body.style.paddingRight = `${sbw}px`;

        body.style.position = "fixed";
        body.style.top = `-${scrollY}px`;
        body.style.left = "0";
        body.style.right = "0";
        body.style.width = "100%";
        body.style.overflow = "hidden";

        return () => {
            body.style.position = prev.position;
            body.style.top = prev.top;
            body.style.left = prev.left;
            body.style.right = prev.right;
            body.style.width = prev.width;
            body.style.overflow = prev.overflow;
            body.style.paddingRight = prev.paddingRight;

            // вернемся туда, где были
            window.scrollTo(0, scrollY);
        };
    }, [active]);
}

export default function ReelsLightbox({ items, startIndex = 0, onClose, onIndexChange }: Props) {
    useBodyScrollLock(true); // <— ЛОК ВКЛ
    const [index, setIndex] = React.useState(startIndex);
    React.useEffect(() => {
        onIndexChange?.(index);
    }, [index]);

    const [busy, setBusy] = React.useState(false);

    // направление и флаг активной анимации
    const [dir, setDir] = React.useState<1 | -1 | 0>(0);
    const [kick, setKick] = React.useState(false);

    const cur = items[index];

    // refs и продолжительность по высоте
    const shellRef = React.useRef<HTMLDivElement | null>(null);
    const [durMs, setDurMs] = React.useState(260);

    // пересчёт длительности по фактической высоте карточки
    const recalcDuration = React.useCallback(() => {
        const h = shellRef.current?.clientHeight ?? 0;
        if (h > 0) {
            const ms = Math.max(30, Math.round((h / SPEED_PX_PER_SEC) * 1000));
            setDurMs(ms);
        }
    }, []);

    React.useLayoutEffect(recalcDuration, [recalcDuration, index]);

    React.useEffect(() => {
        if (!shellRef.current) return;

        // всегда слушаем resize окна как запасной вариант
        const onWinResize = () => recalcDuration();
        window.addEventListener("resize", onWinResize);

        // создаём ResizeObserver, если он есть в среде
        let ro: any = null;
        const RO = (window as any).ResizeObserver as any;
        if (RO) {
            ro = new RO(() => recalcDuration());
            ro.observe(shellRef.current);
        }

        return () => {
            window.removeEventListener("resize", onWinResize);
            if (ro) ro.disconnect();
        };
    }, [recalcDuration]);


    // соседи
    const hasPrev = index > 0;
    const hasNext = index < items.length - 1;
    const prevItem = hasPrev ? items[index - 1] : null;
    const nextItem = hasNext ? items[index + 1] : null;

    // клавиши
    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowDown" || e.key === "PageDown") go(1);
            if (e.key === "ArrowUp" || e.key === "PageUp") go(-1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [index, hasPrev, hasNext, busy]); // eslint-disable-line react-hooks/exhaustive-deps

    const go = React.useCallback((d: 1 | -1) => {
        if (busy || kick) return;
        if (d === 1 && !hasNext) return;
        if (d === -1 && !hasPrev) return;
        setBusy(true);
        setDir(d);
        // два rAF, чтобы гарантировать старт CSS-транзишна
        requestAnimationFrame(() => requestAnimationFrame(() => setKick(true)));
    }, [busy, kick, hasNext, hasPrev]);

    // окончание анимации
    React.useEffect(() => {
        if (!kick) return;
        const t = setTimeout(() => {
            setIndex((i) => i + dir);
            setKick(false);    // мгновенный «отскок» трека в центр без анимации
            setDir(0);
            setBusy(false);
        }, durMs);
        return () => clearTimeout(t);
    }, [kick, dir, durMs]);

    // колесо
    const wheelLock = React.useRef(0);
    const onWheel = (e: React.WheelEvent) => {
        const now = Date.now();
        if (busy || kick) return;
        if (now - wheelLock.current < 250) return;
        wheelLock.current = now;
        if (e.deltaY > 8) go(1);
        if (e.deltaY < -8) go(-1);
    };

    // свайпы
    const touchStartY = React.useRef<number | null>(null);
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (busy || kick) return;
        const s = touchStartY.current;
        if (s == null) return;
        const dy = e.changedTouches[0].clientY - s;
        if (dy < -40) go(1);
        if (dy > 40) go(-1);
        touchStartY.current = null;
    };

    // helpful
    const [helpful, setHelpful] = React.useState<{ count: number, mine: boolean }>({
        count: cur?.review.helpfulCount ?? 0,
        mine: !!cur?.review.helpfulByMe,
    });

    React.useEffect(() => {
        setHelpful({
            count: items[index]?.review.helpfulCount ?? 0,
            mine: !!items[index]?.review.helpfulByMe,
        });
    }, [index, items]);

    const toggleHelpful = async () => {
        if (!cur) return;
        try {
            setBusy(true);
            const res = await setReviewHelpful(cur.review.id, !helpful.mine);
            setHelpful({ count: res.helpfulCount, mine: res.helpful });
        } catch { /* noop */ }
        finally { setBusy(false); }
    };

    // ===== SHARE =====
    const [,setCopied] = React.useState(false);
    const onShare = async () => {
        if (!cur) return;
        const origin = window.location.origin;
        const query = window.location.search || ""; // сохраним ?sort=...
        const url = `${origin}/videos/${cur.review.id}${query}`;
        const title = cur.review.authorName ? `${cur.review.authorName} — видео-отзыв` : "Видео-отзыв";
        const text = (cur.review.text && cur.review.text.trim()) || "Посмотри этот отзыв";

        const navAny = navigator as any;
        try {
            if (navAny.share) {
                await navAny.share({ title, text, url });
            } else if (navigator.clipboard && 'writeText' in navigator.clipboard) {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
            } else {
                // максимально совместимый фолбэк
                window.prompt("Скопируйте ссылку:", url);
            }
        } catch {
            // юзер мог отменить — ничего
        }
    };

    if (!cur) return null;
    // позиция трека: по умолчанию центр (-100%), а при анимации уходит к 0% (вверх) или -200% (вниз)
    const trackY = kick ? (dir === -1 ? 0 : -200) : -100;

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true" onWheel={onWheel}>
            <button className={styles.backdrop} aria-label="Close" onClick={onClose} />
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                <CloseIcon />
            </button>

            {/* стрелки */}
            <div className={styles.navV}>
                <button className={styles.navBtn} onClick={() => go(-1)} disabled={!hasPrev || busy} aria-label="Previous (Up)">
                    <ArrowTopIcon />
                </button>
                <button className={styles.navBtn} onClick={() => go(1)} disabled={!hasNext || busy} aria-label="Next (Down)">
                    <ArrowBottomIcon />
                </button>
            </div>
            <div
                className={styles.shell}
                ref={shellRef}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                style={{ ["--dur" as any]: `${durMs}ms` }}
            >
                {/* СЦЕНА */}
                <div
                    className={clsx(styles.scene, kick && styles.isAnimating)}
                    style={{ transform: `translateY(${trackY}%)` }}
                >
                    {/* prev */}
                    <div className={clsx(styles.panel, !hasPrev && styles.ghost)} aria-hidden={!hasPrev}>
                        {prevItem && (
                            <ReviewVideoResolver
                                key={`prev-${prevItem.review.id}`}
                                url={prevItem.url}
                                reviewId={prevItem.review.id}
                                productId={prevItem.review.productId}
                                reviewType={prevItem.review.type}
                                userId={prevItem.review.authorId}
                                // соседей не автоплеим
                                muted
                            />
                        )}
                    </div>

                    {/* current */}
                    <div className={styles.panel}>
                        <ReviewVideoResolver
                            key={`cur-${cur.review.id}`}
                            url={cur.url}
                            reviewId={cur.review.id}
                            productId={cur.review.productId}
                            reviewType={cur.review.type}
                            userId={cur.review.authorId}
                            autoPlay
                            muted
                        />
                    </div>

                    {/* next */}
                    <div className={clsx(styles.panel, !hasNext && styles.ghost)} aria-hidden={!hasNext}>
                        {nextItem && (
                            <ReviewVideoResolver
                                key={`next-${nextItem.review.id}`}
                                url={nextItem.url}
                                reviewId={nextItem.review.id}
                                productId={nextItem.review.productId}
                                reviewType={nextItem.review.type}
                                userId={nextItem.review.authorId}
                                muted
                            />
                        )}
                    </div>
                </div>

                {/* нижняя панель */}
                <div className={styles.bottomBar}>
                    <div className={styles.metaLeft}>
                        <div className={styles.info}>
                            <div className={styles.rating}>
                                <StarIcon fill="#5dbc00" />
                                <span className={styles.count}>{cur.review.rating}</span>
                            </div>
                        </div>
                        <div>
                            <strong className={styles.author}>{cur.review.authorName || "Аноним"}</strong>
                            <p className={styles.text}>{cur.review.text || ""}</p>
                            {cur.review.verified && (<><span style={{ display: "none" }}>✅ verified</span></>)}
                        </div>
                    </div>
                    <div className={styles.metaRight}>
                        <button
                            className={clsx(styles.helpfulBtn, helpful.mine && styles.helpfulActive)}
                            onClick={toggleHelpful}
                            disabled={busy}
                            aria-pressed={helpful.mine}
                            aria-label={helpful.mine ? "Убрать отметку полезно" : "Отметить как полезный"}
                        >
                            <HeartIcon fill="white" />
                            <span className={styles.count}>{helpful.count}</span>
                        </button>
                        <button
                            className={clsx(styles.helpfulBtn)}
                            onClick={onShare}
                            aria-label="Copy link"
                            title="Copy link"
                        >
                            <LinkIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
