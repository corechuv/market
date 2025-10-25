// src/components/Product/ProductCarouselRish.tsx
import React, { useRef, useCallback } from "react";
import cls from "./ProductCarousel.module.scss";

import type { Product, ProductVariant } from "../../types/product";
import { parseMoney } from "../../types/helpers/parseMoney";
import { getInitialVariant } from "../../specs/builders";

import EnergyLabel from "./Details/EnergyLabel";

import ChevronRightIcon from "../Icons/ChevronLeftIcon";
import ChevronLeftIcon from "../Icons/ChevronRightIcon";
import AmbientImage from "./AmbientImage";


export interface ProductCarouselRichProps {
    products: Product[];
    /** Сколько карточек помещается во вьюпорте */
    visibleItems?: number; // default 4
    className?: string;
    label?: string;
    /** Генератор ссылки. Если не передан — используем onItemClick. */
    itemLinkBuilder?: (product: Product) => string;
    /** Клик по карточке */
    onItemClick?: (product: Product) => void;
}

/** Вспомогательная функция — БЕЗ хуков, чтобы можно было вызывать в .map() */
function computeProductComputed(product: Product) {
    const hasVariants =
        Array.isArray(product.variants) && product.variants.length > 0;

    const variant: ProductVariant | undefined = hasVariants
        ? getInitialVariant(product)
        : undefined;

    const images =
        (variant?.images?.length ? variant.images : product.images) ?? [];

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

    const energyClassArrow =
        variant?.energyClassArrowUrl ?? product.energyClassArrowUrl;
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

const ProductCarouselRich: React.FC<ProductCarouselRichProps> = ({
    products,
    visibleItems = 4,
    className = "",
    label,
    itemLinkBuilder,
    onItemClick,
}) => {
    /** viewportRef — скроллируемый вьюпорт (overflow-x: auto) */
    const viewportRef = useRef<HTMLDivElement>(null);

    const scrollByItemWidth = useCallback(
        (dir: "left" | "right") => {
            const viewport = viewportRef.current;
            if (!viewport) return;
            const distance =
                (viewport.offsetWidth / visibleItems) * (dir === "left" ? -1 : 1);
            viewport.scrollBy({ left: distance, behavior: "smooth" });
        },
        [visibleItems]
    );

    return (
        <div className={cls.listContainer}>
            {label ? <h2 className={cls.title}>{label}</h2> : null}

            <div className={`${cls.carousel} ${className}`.trim()}>
                <div className={cls.trackWrapper}
                    ref={viewportRef}
                    // передаём CSS-переменную, чтобы задать ширину карточки из SCSS
                    style={{ ["--visible" as any]: String(visibleItems) }}
                >
                    <div className={cls.track} role="list">
                        {products.map((product) => {
                            const c = computeProductComputed(product);

                            const href =
                                itemLinkBuilder?.(product) ?? (undefined as string | undefined);

                            const cardInner = (
                                <>
                                    <AmbientImage src={c.imageSrc} alt={product.name}>
                                        {(c.energyClassArrow || c.energyClass) && (
                                            <div className={cls.meta__energyClass}>
                                                {c.energyClassArrow && c.energyClass && (
                                                    <EnergyLabel
                                                        size="small"
                                                        energyClassUrl={c.energyClass}
                                                        energyClassArrowUrl={c.energyClassArrow}
                                                        label="Energieklasse"
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </AmbientImage>

                                    <div className={cls.productDetails}>
                                        <h2 className={cls.productName} title={product.name}>
                                            {product.name}
                                        </h2>

                                        <div className={cls.price}>
                                            {c.discountPercent && c.compareAt ? (
                                                <div className={cls.priceRow}>
                                                    <div className={cls.badgeDiscount}>
                                                        -{c.discountPercent}%
                                                    </div>
                                                    <span className={cls.priceCompareAt}>
                                                        {c.compareAt}
                                                    </span>
                                                </div>
                                            ) : null}
                                            <span className={cls.productPrice}>{c.price}</span>
                                        </div>

                                        <div className={cls.product__infoBelow}>
                                            <span className={cls.productVat}>inkl. MwSt.</span>&nbsp;
                                            <span className={cls.productDelivery}>versandkostenfrei</span>
                                        </div>

                                        <div className={cls.available}>
                                            <span
                                                className={
                                                    c.available ? cls.inStock : cls.outOfStock
                                                }
                                            />
                                            <span
                                                className={
                                                    c.available ? cls.inStockText : cls.outOfStockText
                                                }
                                            >
                                                {c.available ? "In stock" : "Out of stock"}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            );

                            // если есть href — рендерим <a>, иначе — кликабельный <div>
                            return href ? (
                                <a
                                    key={product.id}
                                    href={href}
                                    className={`${cls.item} ${!c.available ? cls.itemDisabled : ""}`}
                                    role="listitem"
                                >
                                    {cardInner}
                                </a>
                            ) : (
                                <div
                                    key={product.id}
                                    className={`${cls.item} ${!c.available ? cls.itemDisabled : ""}`}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => onItemClick?.(product)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") onItemClick?.(product);
                                    }}
                                >
                                    {cardInner}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className={cls.dotControls}>
                <button
                    type="button"
                    className={cls.controls__btnIcon}
                    aria-label="Scroll left"
                    onClick={() => scrollByItemWidth("left")}
                >
                    <ChevronLeftIcon className={cls.icon} />
                </button>
                {products.map((_, i) => (
                    <span key={i} className={cls.dot} />
                ))}
                <button
                    type="button"
                    className={cls.controls__btnIcon}
                    aria-label="Scroll right"
                    onClick={() => scrollByItemWidth("right")}
                >
                    <ChevronRightIcon className={cls.icon} />
                </button>
            </div>
        </div>
    );
};

export default React.memo(ProductCarouselRich);
