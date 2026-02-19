import React, { useEffect, useMemo, useRef, useState } from "react";
import s from "./Banner.module.scss";
import Left  from "../Icons/ChevronLeftIcon";
import Right from "../Icons/ChevronRightIcon";

export type BannerImage = {
  src: string;
  alt?: string;
  caption?: string;
  type?: "image" | "video";
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  controls?: boolean;
};

export type BannerProps = {
  images: BannerImage[];
  /** CSS aspect-ratio, например '21 / 9', '16/9', '3:1', '2 / 1'. Если не задан — используются брейкпоинты из CSS. */
  aspectRatio?: string;
  /** Интервал автопрокрутки (мс) */
  interval?: number;
  /** Автоплей */
  autoPlay?: boolean;
  /** Зациклить прокрутку */
  loop?: boolean;
  /** Пауза при наведении/таче */
  pauseOnHover?: boolean;
  /** Показать стрелки */
  showControls?: boolean;
  /** Показать точки */
  showDots?: boolean;
  /** Закругление углов */
  rounded?: boolean;
  /** Градиентная маска поверх картинки */
  overlay?: "none" | "gradient";
  className?: string;
};

const clampIndex = (i: number, len: number) => {
  if (len === 0) return 0;
  const r = i % len;
  return r < 0 ? r + len : r;
};

const parseAspect = (val?: string) => {
  if (!val) return null;
  const m = String(val).replace(/\s+/g, "").match(/^(\d+(?:\.\d+)?)\s*[/:]\s*(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const w = parseFloat(m[1]);
  const h = parseFloat(m[2]);
  if (!isFinite(w) || !isFinite(h) || w <= 0 || h <= 0) return null;
  return { css: `${w} / ${h}`, w, h };
};

const isVideoSrc = (src: string) =>
  /\.(mp4|webm|ogg|m4v|mov)(\?.*)?$/i.test(src);

const isVideoItem = (item: BannerImage) =>
  item.type === "video" || (item.type !== "image" && isVideoSrc(item.src));

const Banner: React.FC<BannerProps> = ({
  images,
  aspectRatio,
  interval = 5000,
  autoPlay = true,
  loop = true,
  pauseOnHover = true,
  showControls = true,
  showDots = true,
  rounded = true,
  overlay = "gradient",
  className,
}) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const count = images.length;
  const canPrev = loop || index > 0;
  const canNext = loop || index < count - 1;

  const goTo = (i: number) => setIndex(() => clampIndex(i, count));
  const next = () => {
    if (!canNext) return;
    setIndex((prev) => (loop ? clampIndex(prev + 1, count) : Math.min(prev + 1, count - 1)));
  };
  const prev = () => {
    if (!canPrev) return;
    setIndex((prev) => (loop ? clampIndex(prev - 1, count) : Math.max(prev - 1, 0)));
  };

  // Автопрокрутка
  useEffect(() => {
    if (!autoPlay || isPaused || count <= 1) return;
    const current = images[index];
    if (current && isVideoItem(current)) return;
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (loop ? clampIndex(i + 1, count) : Math.min(i + 1, count - 1)));
    }, interval) as unknown as number;

    return () => {
      if (timerRef.current != null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoPlay, isPaused, count, interval, loop, index, images]);

  // Клавиатура
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" && canNext) next();
    if (e.key === "ArrowLeft" && canPrev) prev();
    if (e.key === "Home") goTo(0);
    if (e.key === "End") goTo(count - 1);
  };

  // Свайп
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    if (pauseOnHover) setPaused(true);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    if (start != null) {
      const dx = e.changedTouches[0].clientX - start;
      const threshold = 40; // px
      if (dx > threshold && canPrev) prev();
      else if (dx < -threshold && canNext) next();
    }
    if (pauseOnHover) setPaused(false);
    touchStartX.current = null;
  };

  const ariaLabel = useMemo(
    () => `Баннер, слайд ${Math.min(index + 1, Math.max(count, 1))} из ${Math.max(count, 1)}`,
    [index, count]
  );

  // Пользовательский AR → CSS-переменные (и фолбэк через padding-top)
  const customAR = useMemo(() => parseAspect(aspectRatio), [aspectRatio]);
  const arStyle: React.CSSProperties | undefined = customAR
    ? ({
        ["--ar" as any]: customAR.css,
        ["--ar-w" as any]: String(customAR.w),
        ["--ar-h" as any]: String(customAR.h),
      } as React.CSSProperties)
    : undefined;

  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  useEffect(() => {
    const item = images[index];
    if (!autoPlay || !item || !isVideoItem(item)) return;
    if (item.autoPlay === false) return;
    const v = videoRefs.current[index];
    if (!v) return;
    const onEnded = () => {
      if (!autoPlay) return;
      next();
    };
    v.addEventListener("ended", onEnded);
    return () => v.removeEventListener("ended", onEnded);
  }, [autoPlay, index, images]);
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index) {
        const item = images[i];
        const shouldPlay = item ? isVideoItem(item) && (item.autoPlay ?? true) : false;
        if (!shouldPlay) return;
        const p = v.play?.();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } else {
        v.pause?.();
        try {
          v.currentTime = 0;
        } catch { }
      }
    });
  }, [index, images]);

  return (
    <div
      className={[
        s.banner,
        rounded ? s.rounded : "",
        className || "",
        overlay === "gradient" ? s.withOverlay : "",
      ].join(" ")}
      role="region"
      aria-roledescription="карусель"
      aria-label={ariaLabel}
      aria-live="off"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
      onFocus={() => pauseOnHover && setPaused(true)}
      onBlur={() => pauseOnHover && setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={arStyle}
    >
      <div className={s.viewport}>
        {images.map((img, i) => (
          <div
            className={[s.slide, i === index ? s.active : ""].join(" ")}
            key={i}
            aria-hidden={i !== index}
          >
            {isVideoItem(img) ? (
              <video
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                className={s.video}
                src={img.src}
                poster={img.poster}
                muted={img.muted ?? true}
                loop={img.loop ?? false}
                playsInline={img.playsInline ?? true}
                controls={img.controls ?? false}
                preload="metadata"
                autoPlay={i === index && (img.autoPlay ?? true)}
                aria-label={img.alt ?? ""}
              />
            ) : (
              <img className={s.image} src={img.src} alt={img.alt ?? ""} />
            )}
            {img.caption && (
              <div className={s.caption} aria-hidden={i !== index}>
                {img.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {showControls && count > 1 && (
        <>
          <button
            className={[s.ctrl, s.prev].join(" ")}
            aria-label="Предыдущий слайд"
            onClick={prev}
            disabled={!canPrev}
          >
            <Left />
          </button>
          <button
            className={[s.ctrl, s.next].join(" ")}
            aria-label="Следующий слайд"
            onClick={next}
            disabled={!canNext}
          >
            <Right />
          </button>
        </>
      )}

      {showDots && count > 1 && (
        <div className={s.dots} role="tablist" aria-label="Индикаторы слайдов">
          {images.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === index}
              aria-label={`Перейти к слайду ${i + 1}`}
              className={[s.dot, i === index ? s.dotActive : ""].join(" ")}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Banner;

/*
<div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
    <h1 style={{ marginBottom: 12 }}>Демо баннера</h1>
    <Banner
    images={demoImages}
    interval={4500}
    autoPlay
    loop
    pauseOnHover
    showControls
    showDots
    rounded
    overlay="gradient"
    />

    <h2 style={{ margin: "24px 0 12px" }}>Компаκтнее (16:9)</h2>
    <Banner images={demoImages} aspectRatio="16 / 9" showDots={false} />

    <h2 style={{ margin: "24px 0 12px" }}>Узкий (3:1), без автоплея</h2>
    <Banner images={demoImages} aspectRatio="3 / 1" autoPlay={false} />
</div>
*/
