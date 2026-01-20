// src/types/product.ts

export type AttrValue =
  | string
  | number
  | boolean
  | Array<string | number>
  | null
  | undefined;

export interface ProductAttribute {
  code: string;
  value: AttrValue;
  label?: string;
  unit?: string;
  group?: string;
  priority?: number;
  tooltip?: string;
  href?: string;
  hidden?: boolean;
  highlight?: boolean;
}

export interface ProductBase {
  id: string;

  // Внутренний номер товара
  articleNumber?: string;

  name: string;
  price: string;
  imageUrl: string;

  images?: string[];
  link: string;

  available?: boolean;
  description?: string;
  shortDescription?: string[];

  /** Привязка к категориям */
  categoryId?: string;
  categoryIds?: string[];

  datasheetPdfUrl?: string;
  energyClassUrl?: string;
  energyClassArrowUrl?: string;

  attributes?: ProductAttribute[];
}

// вариант (SKU) — для PDP
export type ProductVariant = {
  id: string;
  sku?: string;

  // оси вариантов (уже локализованные label/value строки)
  options: Record<string, string>;

  price: string;
  priceCents?: number;

  compareAtPrice?: string;
  compareAtCents?: number | null;

  available: boolean;

  stockQty?: number | null;

  images?: string[];
  attributes?: ProductAttribute[];

  datasheetPdfUrl?: string;
  energyClassUrl?: string;
  energyClassArrowUrl?: string;
};

export type Product = ProductBase & {
  // определение осей выбора на PDP
  options: Array<{ name: string; values: string[] }>;

  variants: ProductVariant[];
  defaultVariantId?: string;
};

/**
 * Variant listing item — для каталога (view=variant)
 * Это отдельная "карточка" на каждый SKU.
 */
export type VariantListItem = {
  id: string; // variantId
  productId: string;

  productName: string;

  options: Record<string, string>;

  price: string;
  priceCents?: number;

  compareAtPrice?: string;
  compareAtCents?: number | null;

  available: boolean;

  imageUrl: string;

  // сразу готовый URL на PDP с выбранным вариантом
  url: string; // /product/:productId?variant=:variantId

  sku?: string;
  stockQty?: number | null;

  datasheetPdfUrl?: string;
  energyClassUrl?: string;
  energyClassArrowUrl?: string;
};
