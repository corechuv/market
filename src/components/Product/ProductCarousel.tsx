// src/components/Product/ProductCarousel.tsx
import React, { useRef, useCallback, useEffect, useState } from "react";
import cls from "./ProductCarousel.module.scss";
import Right from "../Icons/ChevronLeftIcon";
import Left from "../Icons/ChevronRightIcon";
import ProductCard from "./ProductCard";
import type { Product, ProductVariant } from "../../types/product";
import { parseMoney } from "../../types/helpers/parseMoney";
import { getInitialVariant } from "../../specs/builders";

export interface ProductCarouselProps {
  products: Product[];
  /**
   * Верхний предел видимых карточек ( ceiling ): «не больше N».
   * Если не задан — количество определяется только авто-адаптацией по ширине.
   */
  visibleItems?: number;
  /** Минимальная ширина карточки для авто-адаптации, px */
  minCardWidth?: number; // default 240
  /** Максимально допустимое число видимых карточек при авто-адаптации */
  maxVisible?: number;   // default 8
  /** Зазор между карточками, px */
  gap?: number;          // default 16
  className?: string;
  label?: string;
  onItemClick?: (product: Product) => void;
}

/** Вспомогательная без хуков — собираем поля для карточки */
function computeProductComputed(product: Product) {
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const variant: ProductVariant | undefined = hasVariants ? getInitialVariant(product) : undefined;

  const images = (variant?.images?.length ? variant.images : product.images) ?? [];
  const price = variant?.price ?? product.price;
  const compareAt = variant?.compareAtPrice;
  const available = (variant?.available ?? product.available) ?? false;

  const priceNum = parseMoney(price);
  const compareAtNum = parseMoney(compareAt);
  const discountPercent =
    Number.isFinite(priceNum) &&
    Number.isFinite(compareAtNum) &&
    compareAtNum > 0 &&
    priceNum < compareAtNum
      ? Math.round(((compareAtNum - priceNum) / compareAtNum) * 100)
      : null;

  const energyClassArrow = variant?.energyClassArrowUrl ?? product.energyClassArrowUrl;
  const energyClass = variant?.energyClassUrl ?? product.energyClassUrl;

  const imageSrc =
    (images?.[0] as any)?.url ??
    (images?.[0] as any)?.src ??
    (product as any).imageUrl ??
    "";

  return { imageSrc, images, price, compareAt, available, discountPercent, energyClassArrow, energyClass };
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  visibleItems,          // потолок (не больше N)
  minCardWidth = 200,
  maxVisible = 8,
  gap = 16,
  className = "",
  label,
  onItemClick,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [effectiveVisible, setEffectiveVisible] = useState<number>(1);

  // Авто-адаптация: считаем, сколько слотов реально влезает при заданном minCardWidth и gap
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const recalc = () => {
      const W = viewport.clientWidth;
      const stepBase = minCardWidth + gap;
      let n = Math.floor((W + gap) / stepBase); // сколько карточек укладывается с учётом gap
      n = Math.max(1, Math.min(n, maxVisible, products.length));
      if (typeof visibleItems === "number" && Number.isFinite(visibleItems)) {
        n = Math.min(n, visibleItems); // проп — потолок
      }
      setEffectiveVisible(n);
    };

    const ro = new ResizeObserver(recalc);
    ro.observe(viewport);
    recalc();

    return () => ro.disconnect();
  }, [visibleItems, minCardWidth, maxVisible, gap, products.length]);

  // Сдвиг ровно на 1 карточку (ширина слота + gap), с ограничениями по краям
  const scrollByCard = useCallback((dir: "prev" | "next") => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const track = viewport.querySelector(`.${cls.track}`) as HTMLDivElement | null;
    const firstSlot = track?.querySelector(`.${cls.itemWrap}`) as HTMLElement | null;
    if (!track || !firstSlot) return;

    const slotWidth = firstSlot.getBoundingClientRect().width;
    const csTrack = getComputedStyle(track);
    const gapPx = parseFloat((csTrack.columnGap || csTrack.gap || "0").toString()) || 0;
    const step = slotWidth + gapPx;

    const count = track.querySelectorAll(`.${cls.itemWrap}`).length;
    const currentIndex = Math.round(viewport.scrollLeft / step);
    const delta = dir === "next" ? 1 : -1;
    const maxIndex = Math.max(0, count - effectiveVisible);
    const targetIndex = Math.max(0, Math.min(currentIndex + delta, maxIndex));

    viewport.scrollTo({ left: targetIndex * step, behavior: "smooth" });
  }, [effectiveVisible]);

  // Инлайн-переменные: фактическое число видимых и gap
  const viewportStyle = {
    ["--gap" as any]: `${gap}px`,
    ["--visible" as any]: String(effectiveVisible),
  } as React.CSSProperties;

  return (
    <div className={cls.container}>
      <div className={cls.container__header}>
        {label ? <h2 className={cls["container__header--title"]}>{label}</h2> : null}
        <div className={cls.container__controls}>
          <button
            type="button"
            className={cls["container__controls--btn"]}
            aria-label="Scroll left"
            onClick={() => scrollByCard("prev")}
          >
            <Left />
          </button>
          <button
            type="button"
            className={cls["container__controls--btn"]}
            aria-label="Scroll right"
            onClick={() => scrollByCard("next")}
          >
            <Right />
          </button>
        </div>
      </div>

      <div className={`${cls.carousel} ${className}`.trim()}>
        <div className={cls.trackWrapper} ref={viewportRef} style={viewportStyle}>
          <div className={cls.track} role="list">
            {products.map((product, i) => {
              const c = computeProductComputed(product);
              const key =
                (product as any).id ??
                (product as any).slug ??
                `${product.name}-${i}`;

              return (
                <div className={cls.itemWrap} role="listitem" key={key}>
                  <ProductCard
                    name={product.name}
                    discountPercent={c.discountPercent}
                    compareAt={c.compareAt}
                    price={c.price}
                    imageUrl={c.imageSrc}
                    available={c.available}
                    energyClass={c.energyClass}
                    energyClassArrow={c.energyClassArrow}
                    onClick={() => onItemClick?.(product)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCarousel);
