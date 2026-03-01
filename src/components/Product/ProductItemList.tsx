// src/components/Product/ProductItemList.tsx
import React from "react";
import cls from "./ProductItemList.module.scss";
import type { VariantListItem } from "../../types/product";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCard.Skeleton";

type Props = {
  items: VariantListItem[];
  onItemClick?: (item: VariantListItem) => void;
  className?: string;
  isLoading?: boolean;
  skeletonCount?: number;
};

function calcDiscountPercent(
  priceCents?: number,
  compareAtCents?: number | null
): number | null {
  if (typeof priceCents !== "number") return null;
  if (typeof compareAtCents !== "number") return null;
  if (compareAtCents <= 0) return null;
  if (priceCents >= compareAtCents) return null;
  return Math.round(((compareAtCents - priceCents) / compareAtCents) * 100);
}

function buildVariantTitle(item: VariantListItem): string {
  const parts = Object.values(item.options || {}).filter(Boolean);
  if (!parts.length) return item.productName;
  return `${item.productName} — ${parts.join(" / ")}`;
}

const ProductItemList: React.FC<Props> = ({
  items,
  onItemClick,
  className,
  isLoading = false,
  skeletonCount = 8,
}) => {
  const gridClassName = [cls.grid, className].filter(Boolean).join(" ");
  const placeholders = Array.from({ length: skeletonCount }, (_, i) => i);

  if (isLoading && items.length === 0) {
    return (
      <div className={gridClassName}>
        {placeholders.map((n) => (
          <ProductCardSkeleton key={`skeleton-initial-${n}`} />
        ))}
      </div>
    );
  }

  return (
    <div className={gridClassName}>
      {items.map((item, i) => {
        const key = item.id ?? `${item.productId}-${i}`;

        const name = buildVariantTitle(item);

        const discountPercent = calcDiscountPercent(
          item.priceCents,
          item.compareAtCents ?? null
        );

        return (
          <ProductCard
            key={key}
            name={name}
            discountPercent={discountPercent}
            compareAt={item.compareAtPrice}
            price={item.price}
            imageUrl={item.imageUrl || ""}
            available={!!item.available}
            energyClass={item.energyClassUrl}
            energyClassArrow={item.energyClassArrowUrl}
            deliveryBadge={item.deliveryBadge}
            onClick={() => onItemClick?.(item)}
          />
        );
      })}

      {isLoading &&
        items.length > 0 &&
        placeholders.map((n) => (
          <ProductCardSkeleton key={`skeleton-more-${n}`} />
        ))}
    </div>
  );
};

export default React.memo(ProductItemList);
