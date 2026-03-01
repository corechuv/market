// src/components/Product/ProductItemList.tsx
import React from "react";
import cls from "./ProductItemList.module.scss";
import type { VariantListItem } from "../../types/product";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCard.Skeleton";

type ListLayout = "grid" | "masonry";

type Props = {
  items: VariantListItem[];
  onItemClick?: (item: VariantListItem) => void;
  className?: string;
  isLoading?: boolean;
  skeletonCount?: number;
  layout?: ListLayout;
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
  layout = "grid",
}) => {
  const listClassName = [layout === "masonry" ? cls.masonry : cls.grid, className]
    .filter(Boolean)
    .join(" ");

  const placeholders = Array.from({ length: skeletonCount }, (_, i) => i);

  const cardEntries = items.map((item, i) => {
    const key = item.id ?? `${item.productId}-${i}`;
    const name = buildVariantTitle(item);
    const discountPercent = calcDiscountPercent(item.priceCents, item.compareAtCents ?? null);

    return {
      key,
      node: (
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
          isSponsored={Boolean(item.isSponsored)}
          sponsoredLabel={item.sponsorship?.label}
          onClick={() => onItemClick?.(item)}
        />
      ),
    };
  });

  const initialSkeletonEntries = placeholders.map((n) => ({
    key: `skeleton-initial-${n}`,
    node: <ProductCardSkeleton key={`skeleton-initial-${n}`} />,
  }));

  const appendSkeletonEntries =
    isLoading && items.length > 0
      ? placeholders.map((n) => ({
        key: `skeleton-more-${n}`,
        node: <ProductCardSkeleton key={`skeleton-more-${n}`} />,
      }))
      : [];

  const [columnsCount, setColumnsCount] = React.useState(5);

  React.useEffect(() => {
    if (layout !== "masonry") return;
    if (typeof window === "undefined") return;

    const calcColumns = () => {
      const width = window.innerWidth;
      if (width <= 480) return 2;
      if (width <= 1024) return 3;
      if (width <= 1200) return 4;
      return 5;
    };

    const syncColumns = () => setColumnsCount(calcColumns());
    syncColumns();

    window.addEventListener("resize", syncColumns, { passive: true });
    return () => window.removeEventListener("resize", syncColumns);
  }, [layout]);

  if (layout !== "masonry") {
    if (isLoading && items.length === 0) {
      return (
        <div className={listClassName}>
          {initialSkeletonEntries.map((entry) => entry.node)}
        </div>
      );
    }

    return (
      <div className={listClassName}>
        {cardEntries.map((entry) => entry.node)}
        {appendSkeletonEntries.map((entry) => entry.node)}
      </div>
    );
  }

  const entries =
    isLoading && items.length === 0
      ? initialSkeletonEntries
      : [...cardEntries, ...appendSkeletonEntries];

  const columns = Array.from({ length: columnsCount }, () => [] as typeof entries);
  entries.forEach((entry, index) => {
    columns[index % columnsCount].push(entry);
  });

  return (
    <div className={listClassName}>
      {columns.map((column, idx) => (
        <div className={cls.masonry__column} key={`masonry-col-${idx}`}>
          {column.map((entry) => (
            <div className={cls.masonry__item} key={entry.key}>
              {entry.node}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default React.memo(ProductItemList);
