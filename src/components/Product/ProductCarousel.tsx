// src/components/Product/ProductCarousel.tsx
import React from "react"; "react";
import Carousel from "../UI/Carousel/Carousel";
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
            (compareAtNum as number) > 0 &&
            (priceNum as number) < (compareAtNum as number)
            ? Math.round((((compareAtNum as number) - (priceNum as number)) / (compareAtNum as number)) * 100)
            : null;

    const energyClassArrow = variant?.energyClassArrowUrl ?? product.energyClassArrowUrl;
    const energyClass = variant?.energyClassUrl ?? product.energyClassUrl;

    const imageSrc = (images?.[0] as any)?.url ?? (images?.[0] as any)?.src ?? (product as any).imageUrl ?? "";

    return { imageSrc, images, price, compareAt, available, discountPercent, energyClassArrow, energyClass };
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ products, className = "", label, onItemClick }) => {
    return (
        <Carousel
            items={products}
            className={className}
            label={label}
            getKey={(p, i) => (p as any).id ?? (p as any).slug ?? `${p.name}-${i}`}
            renderItem={({ item: product }) => {
                const c = computeProductComputed(product);
                return (
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
            }}
        />
    );
};

export default React.memo(ProductCarousel);
