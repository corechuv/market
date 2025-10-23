import React, { useState } from "react";
import clsx from "clsx";
import styles from "./ReelsLightbox.module.scss";
import { type ReviewOut } from "../../types/review/review";
import { ReviewVideoResolver } from "../Product/Review/ReviewVideoResolver";
import { setReviewHelpful, deleteReview } from "../../services/reviewApi";
import CloseIcon from "../Icons/CloseIcon";
import HeartIcon from "../Icons/HeartIcon";
import StarIcon from "../Icons/StarIcon";
import ArrowBottomIcon from "../Icons/ArrowBottomIcon";
import ArrowTopIcon from "../Icons/ArrowTopIcon";
import LinkIcon from "../Icons/LinkIcon";
import MoreHorizontalIcon from "../Icons/MoreHorizontalIcon";
import Modal from "../Modal/Modal";
import Button from "../UI/Button";
import { ReelsAudio } from "../../utils/reelsAudio";

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
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}

export default function ReelsLightbox({
  items,
  startIndex = 0,
  onClose,
  onIndexChange,
}: Props) {
  useBodyScrollLock(true);

  const [index, setIndex] = React.useState(startIndex);
  React.useEffect(() => {
    onIndexChange?.(index);
    window.dispatchEvent(new CustomEvent('reels:index', { detail: { index, id: items[index]?.review.id } }));
  }, [index, onIndexChange, items]);

  React.useEffect(() => {
    ReelsAudio.armGlobalUnlock();
    window.dispatchEvent(new CustomEvent('reels:open'));
    return () => {
      window.dispatchEvent(new CustomEvent('reels:close'));
    };
  }, []);

  const [busy, setBusy] = React.useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [dir, setDir] = React.useState<1 | -1 | 0>(0);
  const [kick, setKick] = React.useState(false);

  const cur = items[index];

  const shellRef = React.useRef<HTMLDivElement | null>(null);
  const [durMs, setDurMs] = React.useState(260);

  const recalcDuration = React.useCallback(() => {
    const h = shellRef.current?.clientHeight ?? 0;
    if (h > 0) {
      const ms = Math.max(30, Math.round((h / SPEED_PX_PER_SEC) * 1000));
      setDurMs(ms);
    }
  }, []);

  React.useLayoutEffect(recalcDuration, [recalcDuration, index]);

  React.useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const onWinResize = () => recalcDuration();
    window.addEventListener("resize", onWinResize);
    let ro: ResizeObserver | null = null;
    const RO = (window as any).ResizeObserver as typeof ResizeObserver | undefined;
    if (RO) {
      ro = new RO(() => recalcDuration());
      ro.observe(el);
    }
    return () => {
      window.removeEventListener("resize", onWinResize);
      if (ro) ro.disconnect();
    };
  }, [recalcDuration]);

  // какая панель становится активной в рамках текущего жеста
  const [preActiveIndex, setPreActiveIndex] = React.useState<number | null>(null);

  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;
  const prevItem = hasPrev ? items[index - 1] : null;
  const nextItem = hasNext ? items[index + 1] : null;

  const ensureSoundUnlocked = React.useCallback(() => {
    ReelsAudio.unlock();
  }, []);

  const unmuteById = React.useCallback((id: string) => {
    window.dispatchEvent(new CustomEvent('reels:unmute_now', { detail: { reviewId: id } }));
  }, []);

  const go = React.useCallback((d: 1 | -1) => {
    if (busy || kick) return;
    if (d === 1 && !hasNext) return;
    if (d === -1 && !hasPrev) return;

    const target = index + d;

    // целевую панель делаем активной ДО анимации
    setPreActiveIndex(target);

    // этот же жест разблокирует звук и анмьютит целевой ролик
    ensureSoundUnlocked();
    const nextId = items[target]?.review.id;
    if (nextId) unmuteById(nextId);

    setBusy(true);
    setDir(d);
    requestAnimationFrame(() => requestAnimationFrame(() => setKick(true)));
    window.dispatchEvent(new CustomEvent('reels:nav', { detail: { dir: d, from: index, to: target } }));
  }, [busy, kick, hasNext, hasPrev, index, items, ensureSoundUnlocked, unmuteById]);

  // клавиатура
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        ensureSoundUnlocked();
        go(1);
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        ensureSoundUnlocked();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey, { passive: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, ensureSoundUnlocked, go]);

  // окончание анимации — фиксируем индекс
  React.useEffect(() => {
    if (!kick) return;
    const t = setTimeout(() => {
      setIndex(prev => prev + dir);
      setKick(false);
      setDir(0);
      setBusy(false);
      setPreActiveIndex(null);
    }, durMs);
    return () => clearTimeout(t);
  }, [kick, dir, durMs]);

  // колесо
  const wheelAgg = React.useRef({ sum: 0, lastTs: 0 });
  const onWheel = (e: React.WheelEvent) => {
    if (busy || kick) return;
    const now = performance.now();
    const h = shellRef.current?.clientHeight || window.innerHeight || 800;

    let dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 16;
    else if (e.deltaMode === 2) dy *= h;

    if (now - wheelAgg.current.lastTs > 220) wheelAgg.current.sum = 0;
    wheelAgg.current.lastTs = now;
    wheelAgg.current.sum += dy;

    const TH = Math.max(60, Math.round(h * 0.06));
    if (Math.abs(wheelAgg.current.sum) >= TH) {
      ensureSoundUnlocked();
      go(wheelAgg.current.sum > 0 ? 1 : -1);
      wheelAgg.current.sum = 0;
    }
  };

  // свайп
  const ptr = React.useRef<{ id: number; y0: number; y: number; moved: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (busy || kick) return;
    if (ptr.current) return;
    ptr.current = { id: e.pointerId, y0: e.clientY, y: e.clientY, moved: false };
    const el = e.target as Element | null;
    try { (el as any)?.setPointerCapture?.(e.pointerId); } catch { /* noop */ }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!ptr.current || e.pointerId !== ptr.current.id) return;
    ptr.current.y = e.clientY;
    if (Math.abs(ptr.current.y - ptr.current.y0) > 6) ptr.current.moved = true;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const st = ptr.current;
    if (!st || e.pointerId !== st.id) { ptr.current = null; return; }
    const dy = st.y - st.y0;
    ptr.current = null;
    if (busy || kick) return;
    if (dy < -40) {
      ensureSoundUnlocked();
      go(1);
    } else if (dy > 40) {
      ensureSoundUnlocked();
      go(-1);
    }
  };

  // helpful
  const [helpful, setHelpful] = React.useState<{ count: number; mine: boolean }>({
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
  const [, setCopied] = React.useState(false);
  const onShare = async () => {
    if (!cur) return;
    const origin = window.location.origin;
    const query = window.location.search || "";
    const url = `${origin}/videos/${cur.review.id}${query}`;
    const title = cur.review.authorName ? `${cur.review.authorName} — видео-отзыв` : "Видео-отзыв";
    const text = (cur.review.text && cur.review.text.trim()) || "Посмотри этот отзыв";
    const navAny = navigator as any;
    try {
      if (navAny.share) {
        await navAny.share({ title, text, url });
      } else if (navigator.clipboard && "writeText" in navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      } else {
        window.prompt("Скопируйте ссылку:", url);
      }
    } catch { /* noop */ }
  };

  if (!cur) return null;
  const trackY = kick ? (dir === -1 ? 0 : -200) : -100;

  const onDelete = async (id: string) => {
    if (!confirm("Удалить этот ролик?")) return;
    try {
      await deleteReview(id);
    } catch (e: any) {
      alert(e?.message ?? "Не удалось удалить ролик");
    }
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      onWheel={onWheel}
      onPointerDown={() => { ReelsAudio.unlock(); }} // не мешаем свайпу, просто анлок
    >
      <button
        className={styles.backdrop}
        aria-label="Close"
        onClick={onClose}
      />
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
        <CloseIcon />
      </button>

      <div className={styles.navV}>
        <button
          className={styles.navBtn}
          onClick={() => { ReelsAudio.unlock(); go(-1); }}
          disabled={!hasPrev || busy}
          aria-label="Previous (Up)"
        >
          <ArrowTopIcon />
        </button>
        <button
          className={styles.navBtn}
          onClick={() => { ReelsAudio.unlock(); go(1); }}
          disabled={!hasNext || busy}
          aria-label="Next (Down)"
        >
          <ArrowBottomIcon />
        </button>
      </div>

      <div
        className={styles.shell}
        ref={shellRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { ptr.current = null; }}
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
                key={prevItem.review.id}
                url={prevItem.url}
                reviewId={prevItem.review.id}
                productId={prevItem.review.productId}
                reviewType={prevItem.review.type}
                userId={prevItem.review.authorId}
                // целевая панель — активна, автоплей и без mute; остальные — mute
                muted={preActiveIndex !== index - 1}
                autoPlay={preActiveIndex === index - 1}
                active={preActiveIndex === index - 1}
              />
            )}
          </div>

          {/* current */}
          <div className={styles.panel}>
            <ReviewVideoResolver
              key={cur.review.id}
              url={cur.url}
              reviewId={cur.review.id}
              productId={cur.review.productId}
              reviewType={cur.review.type}
              userId={cur.review.authorId}
              autoPlay={preActiveIndex === null}
              muted={preActiveIndex !== null}
              active={preActiveIndex === null}
            />
          </div>

          {/* next */}
          <div className={clsx(styles.panel, !hasNext && styles.ghost)} aria-hidden={!hasNext}>
            {nextItem && (
              <ReviewVideoResolver
                key={nextItem.review.id}
                url={nextItem.url}
                reviewId={nextItem.review.id}
                productId={nextItem.review.productId}
                reviewType={nextItem.review.type}
                userId={nextItem.review.authorId}
                muted={preActiveIndex !== index + 1}
                autoPlay={preActiveIndex === index + 1}
                active={preActiveIndex === index + 1}
              />
            )}
          </div>
        </div>

        {/* нижняя панель */}
        <div className={styles.bar__bottom}
          onPointerDown={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className={styles.meta}>
            <div className={styles.info}>
              <div className={styles.rating}>
                <StarIcon fill="#5dbc00" />
                <span className={styles.count}>{cur.review.rating}</span>
              </div>
            </div>
            <div>
              <strong className={styles.author}>
                {cur.review.authorName || "Аноним"}
              </strong>
              <p className={styles.text}>{cur.review.text || ""}</p>
              {cur.review.verified && <span style={{ display: "none" }}>✅ verified</span>}
            </div>
          </div>
          <div className={styles.meta}>
            <button
              className={clsx(styles.meta__btn, helpful.mine && styles.meta__btnActive)}
              onClick={toggleHelpful}
              disabled={busy}
              aria-pressed={helpful.mine}
              aria-label={helpful.mine ? "Убрать отметку полезно" : "Отметить как полезный"}
            >
              <HeartIcon fill="white" />
              <span className={styles.count}>{helpful.count}</span>
            </button>
            <button className={clsx(styles.meta__btn)} onClick={onShare} aria-label="Copy link" title="Copy link">
              <LinkIcon />
            </button>
            <button className={clsx(styles.meta__btn)} onClick={() => setIsOpen(true)} aria-label="More" title="More">
              <MoreHorizontalIcon />
            </button>
          </div>
        </div>

        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} variant="center">
          <Button variant="link" onClick={() => onDelete(cur.review.id)}>
            Delete
          </Button>
        </Modal>
      </div>
    </div>
  );
}
