import React, { useEffect, useMemo, useRef, useState } from "react";
import s from "./ProductImages.module.scss";
import Left  from "../../Icons/ChevronLeftIcon";
import Right from "../../Icons/ChevronRightIcon";

export type BannerImage = {
  src: string;
  alt?: string;
  caption?: string;
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
  fit?: "cover" | "contain";
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
  fit = "cover",
  className,
}) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const count = images.length;

  const goTo = (i: number) => setIndex(() => clampIndex(i, count));
  const next = () =>
    setIndex((prev) => (loop ? clampIndex(prev + 1, count) : Math.min(prev + 1, count - 1)));
  const prev = () =>
    setIndex((prev) => (loop ? clampIndex(prev - 1, count) : Math.max(prev - 1, 0)));

  // Автопрокрутка
  useEffect(() => {
    if (!autoPlay || isPaused || count <= 1) return;
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (loop ? clampIndex(i + 1, count) : Math.min(i + 1, count - 1)));
    }, interval) as unknown as number;

    return () => {
      if (timerRef.current != null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoPlay, isPaused, count, interval, loop]);

  // Клавиатура
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
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
      if (dx > threshold) prev();
      else if (dx < -threshold) next();
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

  return (
    <div
      className={[
        s.banner,
        rounded ? s.rounded : "",
        className || "",
        overlay === "gradient" ? s.withOverlay : "",
        fit === "contain" ? s.fitContain : "",
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
            <img className={s.image} src={img.src} alt={img.alt ?? ""} />
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
          >
            <Left />
          </button>
          <button className={[s.ctrl, s.next].join(" ")} aria-label="Следующий слайд" onClick={next}>
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

