// src/components/Product/ProductItemList.tsx
import React from "react";
import cls from "./ProductItemList.module.scss";
import type { Product, ProductVariant } from "../../types/product";
import { parseMoney } from "../../types/helpers/parseMoney";
import { getInitialVariant } from "../../specs/builders";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCard.Skeleton";

type Props = {
    products: Product[];
    onItemClick?: (product: Product) => void;
    className?: string;
    isLoading?: boolean;
    skeletonCount?: number;
};

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

    const priceNum = parseMoney(variant?.price ?? product.price);
    const compareAtNum = parseMoney(variant?.compareAtPrice);
    const discountPercent =
        Number.isFinite(priceNum) &&
            Number.isFinite(compareAtNum) &&
            compareAtNum! > 0 &&
            priceNum! < compareAtNum!
            ? Math.round(((compareAtNum! - priceNum!) / compareAtNum!) * 100)
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

const ProductItemList: React.FC<Props> = ({
    products,
    onItemClick,
    className,
    isLoading = false,
    skeletonCount = 8,
}) => {
    const gridClassName = [cls.grid, className].filter(Boolean).join(" ");
    const placeholders = Array.from({ length: skeletonCount }, (_, i) => i);

    // 👉 Первая загрузка: товаров ещё нет, но уже грузим — показываем только скелетоны
    if (isLoading && products.length === 0) {
        return (
            <div className={gridClassName}>
                {placeholders.map((n) => (
                    <ProductCardSkeleton key={`skeleton-initial-${n}`} />
                ))}
            </div>
        );
    }

    // 👉 Дальше: товары уже есть — рендерим их,
    // а при загрузке следующей страницы добавляем скелетоны внизу
    return (
        <div className={gridClassName}>
            {products.map((product, i) => {
                const {
                    imageSrc,
                    price,
                    compareAt,
                    available,
                    discountPercent,
                    energyClassArrow,
                    energyClass,
                } = computeProductComputed(product);

                const key =
                    (product as any).id ??
                    (product as any).slug ??
                    `${product.name}-${i}`;

                return (
                    <ProductCard
                        key={key}
                        name={product.name}
                        discountPercent={discountPercent}
                        compareAt={compareAt}
                        price={price}
                        imageUrl={imageSrc}
                        available={available}
                        energyClass={energyClass}
                        energyClassArrow={energyClassArrow}
                        onClick={() => onItemClick?.(product)}
                    />
                );
            })}

            {isLoading &&
                products.length > 0 &&
                placeholders.map((n) => (
                    <ProductCardSkeleton key={`skeleton-more-${n}`} />
                ))}
        </div>
    );
};

export default React.memo(ProductItemList);
