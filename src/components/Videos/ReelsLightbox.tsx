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

// базовая скорость «доводящей» анимации (px/сек)
const SPEED_PX_PER_SEC = 1400;
const MIN_ANIM_MS = 140;
const MAX_ANIM_MS = 420;
const UNMUTE_EVENT = "reels:unmute_now";
const isMobileUA =
  typeof navigator !== "undefined" &&
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");

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

// «резинка» на краях (когда тянуть некуда)
const rubber = (v: number, coef = 0.35) => v * coef;

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
    window.dispatchEvent(
      new CustomEvent("reels:index", { detail: { index, id: items[index]?.review.id } })
    );
  }, [index, onIndexChange, items]);

  React.useEffect(() => {
    ReelsAudio.armGlobalUnlock();
    window.dispatchEvent(new CustomEvent("reels:open"));
    return () => {
      window.dispatchEvent(new CustomEvent("reels:close"));
    };
  }, []);

  // карта готовых hlsUrl по reviewId (получаем из Resolver)
  const hlsMapRef = React.useRef(new Map<string, string>());
  React.useEffect(() => {
    const onResolved = (ev: Event) => {
      const { reviewId, hlsUrl } = (ev as CustomEvent<{ reviewId: string; hlsUrl: string }>).detail || {};
      if (reviewId && hlsUrl) hlsMapRef.current.set(reviewId, hlsUrl);
    };
    window.addEventListener("reels:resolved", onResolved as any);
    return () => window.removeEventListener("reels:resolved", onResolved as any);
  }, []);

  // текущее состояние соседей
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;
  const prevItem = hasPrev ? items[index - 1] : null;
  const cur = items[index];
  const nextItem = hasNext ? items[index + 1] : null;

  // ===== свайп/drag =====
  const shellRef = React.useRef<HTMLDivElement | null>(null);
  const [dragPct, setDragPct] = useState(0); // смещение сцены в %, где 0 — центр (-100%), +100 — prev (0%), -100 — next (-200%)
  const dragRef = React.useRef<{
    active: boolean;
    id: number | null;
    y0: number;
    y: number;
    lastTs: number;
  }>({ active: false, id: null, y0: 0, y: 0, lastTs: 0 });

  // анимация доведения
  const [anim, setAnim] = useState<{ running: boolean; toPct: number; ms: number }>({
    running: false,
    toPct: 0,
    ms: 260,
  });

  const stopAnim = React.useCallback(() => setAnim((a) => ({ ...a, running: false })), []);

  // нормализованное смещение
  const p = dragPct / 100; // [-1..1]
  const [busy, setBusy] = useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const ensureSoundUnlocked = React.useCallback(() => {
    ReelsAudio.unlock();
  }, []);

  const unmuteCurrentNow = React.useCallback((id: string) => {
    window.dispatchEvent(new CustomEvent(UNMUTE_EVENT, { detail: { reviewId: id } }));
  }, []);

  // клавиатура (десктоп)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        if (!hasNext || busy) return;
        ensureSoundUnlocked();
        if (!isMobileUA && items[index]) unmuteCurrentNow(items[index].review.id);
        snapTo(-100);
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (!hasPrev || busy) return;
        ensureSoundUnlocked();
        if (!isMobileUA && items[index]) unmuteCurrentNow(items[index].review.id);
        snapTo(100);
      }
    };
    window.addEventListener("keydown", onKey, { passive: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, ensureSoundUnlocked, unmuteCurrentNow, hasNext, hasPrev, busy, index, items]);

  // колесо — аккумулируем (размьютим так только на десктопе)
  const wheelAgg = React.useRef({ sum: 0, lastTs: 0 });
  const onWheel = (e: React.WheelEvent) => {
    if (busy || anim.running || dragRef.current.active) return;
    const now = performance.now();
    const h = shellRef.current?.clientHeight || window.innerHeight || 800;

    let dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 16; // lines → px
    else if (e.deltaMode === 2) dy *= h; // pages → px

    if (now - wheelAgg.current.lastTs > 220) wheelAgg.current.sum = 0;
    wheelAgg.current.lastTs = now;
    wheelAgg.current.sum += dy;

    const TH = Math.max(60, Math.round(h * 0.06));
    if (Math.abs(wheelAgg.current.sum) >= TH) {
      ensureSoundUnlocked();
      if (!isMobileUA && items[index]) unmuteCurrentNow(items[index].review.id);
      if (wheelAgg.current.sum > 0 && hasNext) snapTo(-100);
      else if (wheelAgg.current.sum < 0 && hasPrev) snapTo(100);
      wheelAgg.current.sum = 0;
    }
  };

  // helper: запустить доводящую анимацию к целевому смещению (+/-100% или 0)
  function animateTo(toPct: number, onDone?: () => void) {
    const el = shellRef.current;
    const h = el?.clientHeight || window.innerHeight || 800;
    const fromPct = dragPct;
    const distPx = (Math.abs(toPct - fromPct) / 100) * h;
    const ms = Math.max(
      MIN_ANIM_MS,
      Math.min(MAX_ANIM_MS, Math.round((distPx / SPEED_PX_PER_SEC) * 1000))
    );

    setAnim({ running: true, toPct, ms });
    // по окончании — скорректируем index/состояние
    window.setTimeout(() => {
      stopAnim();
      if (toPct === -100) {
        // вниз -> next
        setIndex((i) => Math.min(items.length - 1, i + 1));
        setDragPct(0);
      } else if (toPct === 100) {
        // вверх -> prev
        setIndex((i) => Math.max(0, i - 1));
        setDragPct(0);
      } else {
        // вернулись в центр
        setDragPct(0);
      }
      // маленькая задержка — анмьют активного, если звук уже «разлочен» (только десктоп)
      const newIdx =
        toPct === -100 ? index + 1 : toPct === 100 ? index - 1 : index;
      const nextId = items[newIdx]?.review.id;
      if (nextId && ReelsAudio.isUnlocked() && !isMobileUA) {
        setTimeout(() => unmuteCurrentNow(nextId), 0);
      }
      onDone?.();
      setBusy(false);
    }, ms);
  }

  // быстрый «щелчок» к соседу без drag (используется колесом/клавой)
  function snapTo(toPct: -100 | 0 | 100) {
    if (busy) return;
    setBusy(true);
    animateTo(toPct);
  }

  // ====== pointer-свайп (drag) ======
  const onPointerDown = (e: React.PointerEvent) => {
    window.dispatchEvent(new CustomEvent('reels:gesture_begin')); // ← отметка начала жеста
    if (busy || anim.running) return;
    ensureSoundUnlocked();
    // размьют текущий «по жесту» — только для десктопа
    if (cur && !isMobileUA) unmuteCurrentNow(cur.review.id);

    dragRef.current = {
      active: true,
      id: e.pointerId,
      y0: e.clientY,
      y: e.clientY,
      lastTs: performance.now(),
    };
    try {
      (e.currentTarget as any).setPointerCapture?.(e.pointerId);
    } catch {}
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const st = dragRef.current;
    if (!st.active || e.pointerId !== st.id) return;
    st.y = e.clientY;
    st.lastTs = performance.now();

    const el = shellRef.current;
    const h = el?.clientHeight || window.innerHeight || 1;
    let deltaY = st.y - st.y0;

    // резинка на краях
    if ((deltaY < 0 && !hasNext) || (deltaY > 0 && !hasPrev)) {
      deltaY = rubber(deltaY);
    }

    const pct = (deltaY / h) * 100; // [-100..100]
    setDragPct(Math.max(-120, Math.min(120, pct)));
  };

  const onPointerEnd = (e: React.PointerEvent) => {
    const st = dragRef.current;
    if (!st.active || e.pointerId !== st.id) return;
    dragRef.current.active = false;
    dragRef.current.id = null;

    if (busy || anim.running) return;

    // решение: если ушли дальше 22% экрана — переключаемся, иначе — отскакиваем
    const threshold = 22;

    // Мобильная «магия»: прямо в этом же жесте пробуем запустить следующее/предыдущее со звуком
    const trySwapAndPlay = (targetReviewId: string | undefined) => {
      if (!isMobileUA || !targetReviewId) return;
      const hls = hlsMapRef.current.get(targetReviewId);
      if (!hls) return;
      ReelsAudio.unlock();
      try {
        window.dispatchEvent(
          new CustomEvent("reels:swap_src_and_play", {
            detail: { hlsUrl: hls, unmute: true },
          })
        );
      } catch {}
    };

    if (dragPct <= -threshold && hasNext) {
      // вниз -> next
      trySwapAndPlay(items[index + 1]?.review.id);
      setBusy(true);
      animateTo(-100);
    } else if (dragPct >= threshold && hasPrev) {
      // вверх -> prev
      trySwapAndPlay(items[index - 1]?.review.id);
      setBusy(true);
      animateTo(100);
    } else {
      animateTo(0);
    }
  };

  // ===== helpful / share / more =====
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
    } catch {
      /* noop */
    } finally {
      setBusy(false);
    }
  };

  const [, setCopied] = React.useState(false);
  const onShare = async () => {
    if (!cur) return;
    const origin = window.location.origin;
    const query = window.location.search || "";
    const url = `${origin}/videos/${cur.review.id}${query}`;
    const title = cur.review.authorName
      ? `${cur.review.authorName} — видео-отзыв`
      : "Видео-отзыв";
    const text =
      (cur.review.text && cur.review.text.trim()) || "Посмотри этот отзыв";
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
    } catch {
      /* noop */
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Удалить этот ролик?")) return;
    try {
      await deleteReview(id);
    } catch (e: any) {
      alert(e?.message ?? "Не удалось удалить ролик");
    }
  };

  if (!cur) return null;

  // финальный translateY сцены:
  const sceneTranslatePct = anim.running ? -100 + anim.toPct : -100 + dragPct;

  // === ВАЖНО: управление активностью/автоплеем ===
  // Во время drag/анимации — активен ТОЛЬКО текущий (он продолжает играть).
  // Соседи можно слегка «подогреть» (preload) без автоплея и строгоMuted.
  const isDragging = dragRef.current.active && !anim.running;

  // слабый сигнал на предпрогрев соседей во время drag в их сторону
  const preloadNext = isDragging && p < -0.01 && !!hasNext;
  const preloadPrev = isDragging && p > 0.01 && !!hasPrev;

  // текущий держим активным всегда
  const activeCur = true;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      onWheel={onWheel}
      onPointerDown={() => {
        ensureSoundUnlocked();
        if (cur && !isMobileUA) unmuteCurrentNow(cur.review.id);
      }}
    >
      <button className={styles.backdrop} aria-label="Close" onClick={onClose} />
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
        <CloseIcon />
      </button>

      {/* стрелки (desktop) */}
      <div className={styles.navV}>
        <button
          className={styles.navBtn}
          onClick={() => {
            ensureSoundUnlocked();
            if (cur && !isMobileUA) unmuteCurrentNow(cur.review.id);
            if (hasPrev) snapTo(100);
          }}
          disabled={!hasPrev || busy || anim.running}
          aria-label="Previous (Up)"
        >
          <ArrowTopIcon />
        </button>
        <button
          className={styles.navBtn}
          onClick={() => {
            ensureSoundUnlocked();
            if (cur && !isMobileUA) unmuteCurrentNow(cur.review.id);
            if (hasNext) snapTo(-100);
          }}
          disabled={!hasNext || busy || anim.running}
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
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        style={
          anim.running
            ? ({ ["--dur" as any]: `${anim.ms}ms` } as React.CSSProperties)
            : undefined
        }
      >
        {/* СЦЕНА: трек из трёх панелей, тянем весь трек */}
        <div
          className={clsx(
            styles.scene,
            anim.running ? styles.isAnimating : styles.noAnim
          )}
          style={{ transform: `translateY(${sceneTranslatePct}%)` }}
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
                autoPlay={false}
                muted={true}
                active={!!preloadPrev}
              />
            )}
          </div>

          {/* current */}
          <div className={styles.panel}>
            <ReviewVideoResolver
              /* ВАЖНО: без key — не размонтируем DOM <video> */
              url={cur.url}
              reviewId={cur.review.id}
              productId={cur.review.productId}
              reviewType={cur.review.type}
              userId={cur.review.authorId}
              autoPlay={true}
              muted={false}
              active={activeCur}
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
                autoPlay={false}
                muted={true}
                active={!!preloadNext}
              />
            )}
          </div>
        </div>

        {/* Нижняя инфо-панель (подписи) */}
        <div
          className={styles.bar__bottom}
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
              {cur.review.verified && (
                <span style={{ display: "none" }}>✅ verified</span>
              )}
            </div>
          </div>
        </div>

        {/* Вертикальные action-кнопки */}
        <div className={styles.actions} aria-label="Actions">
          <button
            className={clsx(styles.actionBtn, helpful.mine && styles.actionActive)}
            onClick={(e) => {
              e.stopPropagation();
              toggleHelpful();
            }}
            aria-pressed={helpful.mine}
            aria-label={helpful.mine ? "Убрать отметку полезно" : "Отметить как полезный"}
            disabled={busy}
          >
            <HeartIcon fill="white" />
            <span className={styles.actionCount}>{helpful.count}</span>
          </button>

          <button
            className={styles.actionBtn}
            onClick={(e) => {
              e.stopPropagation();
              onShare();
            }}
            aria-label="Поделиться"
            title="Поделиться"
          >
            <LinkIcon />
          </button>

          <button
            className={styles.actionBtn}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            aria-label="Ещё"
            title="Ещё"
          >
            <MoreHorizontalIcon />
          </button>
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
