// src/components/Product/ProductCarousel.tsx
import React, { useRef, useCallback } from "react";
import cls from "./ProductCarousel.module.scss";
import Right from "../Icons/ChevronLeftIcon";
import Left from "../Icons/ChevronRightIcon";
import ProductCard from "./ProductCard";
import type { Product, ProductVariant } from "../../types/product";
import { parseMoney } from "../../types/helpers/parseMoney";
import { getInitialVariant } from "../../specs/builders";

export interface ProductCarouselProps {
  products: Product[];
  className?: string;
  label?: string;
  onItemClick?: (product: Product) => void;
}

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
  className = "",
  label,
  onItemClick,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);

  const getVisibleFromCSS = () => {
    const vp = viewportRef.current;
    if (!vp) return 4;
    const raw = getComputedStyle(vp).getPropertyValue("--visible").trim();
    const n = parseFloat(raw);
    return Number.isFinite(n) && n > 0 ? n : 4;
  };

  // шаг ровно 1 карточка: ширина слота + gap
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
    const visible = getVisibleFromCSS();

    const currentIndex = Math.round(viewport.scrollLeft / step);
    const delta = dir === "next" ? 1 : -1;
    const maxIndex = Math.max(0, count - visible);
    const targetIndex = Math.max(0, Math.min(currentIndex + delta, maxIndex));

    viewport.scrollTo({ left: targetIndex * step, behavior: "smooth" });
  }, []);

  // только gap и адаптивный --visible из CSS (ничего не переопределяем инлайном)
  const viewportStyle = { ["--gap" as any]: "16px" } as React.CSSProperties;

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
