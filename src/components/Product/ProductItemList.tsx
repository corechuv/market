// src/components/Product/ProductItemList.tsx
import React from "react";
import cls from "./ProductItemList.module.scss";
import type { Product, ProductVariant } from "../../types/product";
import { parseMoney } from "../../types/helpers/parseMoney";
import { getInitialVariant } from "../../specs/builders";
import ProductCard from "./ProductCard";

type Props = {
    products: Product[];
    onItemClick?: (product: Product) => void;
    className?: string;
};

function computeProductComputed(product: Product) {
    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
    const variant: ProductVariant | undefined = hasVariants ? getInitialVariant(product) : undefined;

    const images = (variant?.images?.length ? variant.images : product.images) ?? [];

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

const ProductItemList: React.FC<Props> = ({ products, onItemClick, className }) => {

    return (
        <div className={[cls.grid, className].filter(Boolean).join(" ")}>
            {products.map((product) => {
                const {
                    imageSrc,
                    price,
                    compareAt,
                    available,
                    discountPercent,
                    energyClassArrow,
                    energyClass,
                } = computeProductComputed(product);

                return (
                    <ProductCard
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
        </div>
    );
};

export default React.memo(ProductItemList);
