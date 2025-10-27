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
    /** Сколько карточек помещается во вьюпорте */
    visibleItems?: number; // default 4
    className?: string;
    label?: string;
    /** Клик по карточке */
    onItemClick?: (product: Product) => void;
}

/** Вспомогательная функция — БЕЗ хуков, чтобы можно было вызывать в .map() */
function computeProductComputed(product: Product) {
    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

    const variant: ProductVariant | undefined = hasVariants
        ? getInitialVariant(product)
        : undefined;

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

    return {
        imageSrc,
        images,
        price,
        compareAt,
        available,
        discountPercent,
        energyClassArrow,
        energyClass,
    };
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
    products,
    visibleItems = 4,
    className = "",
    label,
    onItemClick,
}) => {
    /** viewportRef — скроллируемый вьюпорт (overflow-x: auto) */
    const viewportRef = useRef<HTMLDivElement>(null);
    const scrollByItemWidth = useCallback(
        (dir: "left" | "right") => {
            const viewport = viewportRef.current;
            if (!viewport) return;
            const distance = (viewport.offsetWidth / visibleItems) * (dir === "left" ? -1 : 1);
            viewport.scrollBy({ left: distance, behavior: "smooth" });
        },
        [visibleItems]
    );

    return (
        <div className={cls.container}>
            <div className={cls.container__header}>
                {label ? <h2 className={cls["container__header--title"]}>{label}</h2> : null}
                <div className={cls.controls}>
                    <button
                        type="button"
                        className={cls.controls__btn}
                        aria-label="Scroll left"
                        onClick={() => scrollByItemWidth("left")}
                    >
                        <Left />
                    </button>
                    <button
                        type="button"
                        className={cls.controls__btn}
                        aria-label="Scroll right"
                        onClick={() => scrollByItemWidth("right")}
                    >
                        <Right />
                    </button>
                </div>
            </div>

            <div className={`${cls.carousel} ${className}`.trim()}>
                <div className={cls.trackWrapper}
                    ref={viewportRef}
                    // передаём CSS-переменную, чтобы задать ширину карточки из SCSS
                    style={{ ["--visible" as any]: String(visibleItems) }}
                >
                    <div className={cls.track} role="list">
                        {products.map((product) => {
                            const c = computeProductComputed(product);
                            const cardInner = (
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
                            );
                            return cardInner;
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ProductCarousel);
