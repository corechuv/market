// src/components/Product/ProductCarousel.tsx
import React from "react";
import Carousel from "../UI/Carousel/Carousel";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCard.Skeleton";
import type { Product, ProductVariant, VariantListItem } from "../../types/product";
import { parseMoney } from "../../types/helpers/parseMoney";
import { getInitialVariant } from "../../specs/builders";

type AnyItem = Product | VariantListItem;

export type ProductCarouselProps<TItem extends AnyItem> = {
  products: TItem[];
  className?: string;
  label?: string;
  onItemClick?: (item: TItem) => void;
  isLoading?: boolean;
  skeletonCount?: number;
};

function isVariantItem(x: any): x is VariantListItem {
  return (
    !!x &&
    typeof x === "object" &&
    typeof x.productId === "string" &&
    typeof x.productName === "string" &&
    typeof x.url === "string"
  );
}

function calcDiscountPercentFromCents(
  priceCents?: number,
  compareAtCents?: number | null
): number | null {
  if (typeof priceCents !== "number") return null;
  if (typeof compareAtCents !== "number") return null;
  if (compareAtCents <= 0) return null;
  if (priceCents >= compareAtCents) return null;
  return Math.round(((compareAtCents - priceCents) / compareAtCents) * 100);
}

function calcDiscountPercentFromMoneyStrings(
  price?: string,
  compareAt?: string
): number | null {
  const p = parseMoney(price);
  const c = parseMoney(compareAt);
  if (!Number.isFinite(p) || !Number.isFinite(c)) return null;
  if ((c as number) <= 0) return null;
  if ((p as number) >= (c as number)) return null;
  return Math.round((((c as number) - (p as number)) / (c as number)) * 100);
}

function getDiscountPercent(v: {
  price?: string;
  compareAtPrice?: string;
  priceCents?: number;
  compareAtCents?: number | null;
}): number | null {
  // ✅ сначала cents (самое точное)
  const byCents = calcDiscountPercentFromCents(v.priceCents, v.compareAtCents);
  if (byCents !== null) return byCents;

  // fallback — по строкам
  return calcDiscountPercentFromMoneyStrings(v.price, v.compareAtPrice);
}

function pickBestDiscountVariant(product: Product): ProductVariant | undefined {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (!variants.length) return undefined;

  let best: ProductVariant | undefined;
  let bestPct = -1;

  for (const v of variants) {
    const pct = getDiscountPercent(v);
    if (pct === null) continue;
    if (pct > bestPct) {
      bestPct = pct;
      best = v;
    }
  }

  // ✅ если скидок нет — берём initial
  return best ?? getInitialVariant(product);
}

function buildVariantTitle(base: string, options?: Record<string, string>) {
  const parts = Object.values(options || {}).filter(Boolean);
  return parts.length ? `${base} — ${parts.join(" / ")}` : base;
}

function firstImageUrl(images: any[] | undefined, fallback = ""): string {
  if (!images?.length) return fallback;
  const first = images[0] as any;
  if (typeof first === "string") return first;
  return first?.url ?? first?.src ?? fallback;
}

const ProductCarouselInner = <TItem extends AnyItem>({
  products,
  className = "",
  label,
  onItemClick,
  isLoading = false,
  skeletonCount = 8,
}: ProductCarouselProps<TItem>) => {
  if (isLoading) {
    const placeholders = Array.from({ length: skeletonCount }, (_, i) => i);
    return (
      <Carousel<number>
        items={placeholders}
        className={className}
        label={label}
        getKey={(n) => `skeleton-${n}`}
        renderItem={() => <ProductCardSkeleton />}
      />
    );
  }

  return (
    <Carousel<TItem>
      items={products}
      className={className}
      label={label}
      getKey={(it: TItem, i) => {
        if (isVariantItem(it)) return it.id ?? `${it.productId}-${i}`;
        const p = it as any;
        return p.id ?? p.slug ?? `${p.name}-${i}`;
      }}
      renderItem={({ item }) => {
        // ✅ SKU карточка (VariantListItem)
        if (isVariantItem(item)) {
          const discountPercent = getDiscountPercent(item);

          return (
            <ProductCard
              name={buildVariantTitle(item.productName, item.options)}
              discountPercent={discountPercent}
              compareAt={item.compareAtPrice}
              price={item.price}
              imageUrl={item.imageUrl || ""}
              available={!!item.available}
              energyClass={item.energyClassUrl}
              energyClassArrow={item.energyClassArrowUrl}
              deliveryBadge={item.deliveryBadge}
              onClick={() => onItemClick?.(item as TItem)}
            />
          );
        }

        // ✅ Product карточка
        const product = item as unknown as Product;
        const v = pickBestDiscountVariant(product);
        const discountPercent = v ? getDiscountPercent(v) : null;

        const price = v?.price ?? product.price;
        const compareAt = v?.compareAtPrice;

        const images = (v?.images?.length ? v.images : product.images) ?? [];
        const imageUrl = firstImageUrl(images as any[], (product as any).imageUrl ?? "");

        const available = (v?.available ?? product.available) ?? false;
        const energyClass = v?.energyClassUrl ?? product.energyClassUrl;
        const energyClassArrow = v?.energyClassArrowUrl ?? product.energyClassArrowUrl;
        const deliveryBadge = v?.deliveryBadge ?? product.deliveryBadge;

        return (
          <ProductCard
            name={product.name}
            discountPercent={discountPercent}
            compareAt={compareAt}
            price={price}
            imageUrl={imageUrl}
            available={!!available}
            energyClass={energyClass}
            energyClassArrow={energyClassArrow}
            deliveryBadge={deliveryBadge}
            onClick={() => onItemClick?.(item as TItem)}
          />
        );
      }}
    />
  );
};

// ✅ важный хак для React.memo + generic
const ProductCarousel = React.memo(ProductCarouselInner) as typeof ProductCarouselInner;
export default ProductCarousel;
