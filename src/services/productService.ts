// src/services/productService.ts
import type { Product, VariantListItem } from "../types/product";
import i18n from "../i18n";
import type { AppLanguage } from "../utils/lang/lang";

const API = import.meta.env.VITE_API_BASE_URL;

export type AttrPrimitive = string | number | boolean;

export type AttributeFacetOption = {
  value: string;
  label: string;
  count: number;
  sortOrder: number;
  rawValue: AttrPrimitive;
};

export type AttributeFacet = {
  code: string;
  type: string;
  scope: string;
  groupKey: string | null;
  groupLabel?: string | null;
  unitLabel?: string | null;
  label: string;
  options: AttributeFacetOption[];
};

export type AttributeFilterPayload = Record<string, AttrPrimitive[]>;

export type GetProductsParams = {
  q?: string;
  sort?: "price" | "-price" | "discount" | "-discount" | "rating" | "-rating" | "new";
  availableOnly?: boolean;
  categoryId?: string;
  categoryFullSlug?: string;
  limit?: number;
  offset?: number;
  newArrivalsOnly?: boolean;
  saleOnly?: boolean;
  minPriceCents?: number;
  maxPriceCents?: number;
  minRating?: number;
  lang?: AppLanguage;

  /** Опционально: фильтрация витрины по продавцу */
  sellerCode?: string;

  // фильтры по атрибутам
  attrFilters?: AttributeFilterPayload;

  // view каталога
  view?: "product" | "variant";
};

export type ProductFacets = {
  total: number;
  price: { min: number | null; max: number | null };
  rating: { min: number | null; max: number | null };
  attributes: AttributeFacet[];
};

export type GetProductFacetsParams = {
  q?: string;
  availableOnly?: boolean;
  categoryId?: string;
  categoryFullSlug?: string;
  newArrivalsOnly?: boolean;
  saleOnly?: boolean;
  minRating?: number;
  minPriceCents?: number;
  maxPriceCents?: number;
  lang?: AppLanguage;

  /** Опционально: фильтрация витрины по продавцу */
  sellerCode?: string;

  attrFilters?: AttributeFilterPayload;

  view?: "product" | "variant";
};

function resolveLang(explicit?: string | null): AppLanguage {
  const raw = (explicit || i18n.language || "").slice(0, 2);
  if (raw === "en" || raw === "ru" || raw === "de") return raw;
  return "de";
}

function qs(params: Record<string, any>) {
  const q = new URLSearchParams();

  const lang = resolveLang(params.lang);
  q.set("lang", lang);

  Object.entries(params).forEach(([k, v]) => {
    if (k === "lang") return;
    if (v !== undefined && v !== null && v !== "") {
      q.set(k, String(v));
    }
  });

  return q.toString();
}

// ✅ overloads
export async function getProducts(
  params?: GetProductsParams & { view?: "product" }
): Promise<Product[]>;
export async function getProducts(
  params: GetProductsParams & { view: "variant" }
): Promise<VariantListItem[]>;
export async function getProducts(
  params: GetProductsParams = {}
): Promise<Product[] | VariantListItem[]> {
  const { attrFilters, ...rest } = params;

  const query = qs({
    ...rest,
    attributeFilters:
      attrFilters && Object.keys(attrFilters).length
        ? JSON.stringify(attrFilters)
        : undefined,
  });

  const url = `${API}/products?${query}`;
  const r = await fetch(url, { credentials: "omit" });
  if (!r.ok) throw new Error(`Failed to fetch products: ${r.status}`);
  return r.json();
}

export async function getProductFacets(
  params: GetProductFacetsParams = {}
): Promise<ProductFacets> {
  const { attrFilters, ...rest } = params;

  const query = qs({
    ...rest,
    attributeFilters:
      attrFilters && Object.keys(attrFilters).length
        ? JSON.stringify(attrFilters)
        : undefined,
  });

  const url = `${API}/products/facets?${query}`;
  const r = await fetch(url, { credentials: "omit" });
  if (!r.ok) throw new Error(`Failed to fetch product facets: ${r.status}`);
  return r.json();
}

export async function getProductById(
  id: string,
  langOverride?: AppLanguage,
  opts?: { sellerCode?: string }
): Promise<Product | undefined> {
  const lang = resolveLang(langOverride);

  const q = new URLSearchParams();
  q.set("lang", lang);
  if (opts?.sellerCode) q.set("sellerCode", opts.sellerCode);

  const r = await fetch(`${API}/products/${id}?${q.toString()}`);
  if (r.status === 404) return undefined;
  if (!r.ok) throw new Error(`Failed to load product: ${r.status}`);
  return r.json();
}

export async function getMoreProducts(options?: {
  currentId?: string;
  limit?: number;
  availableOnly?: boolean;
  shuffle?: boolean;
  fillFromAllIfShort?: boolean;
  categoryId?: string;
  categoryFullSlug?: string;
  lang?: AppLanguage;
  sellerCode?: string;
}): Promise<Product[]> {
  const lang = resolveLang(options?.lang);

  if (options?.currentId) {
    const q = qs({
      limit: options.limit ?? 8,
      availableOnly: options.availableOnly ?? true,
      shuffle: options.shuffle ?? true,
      fillFromAllIfShort: options.fillFromAllIfShort ?? true,
      lang,
      sellerCode: options.sellerCode,
    });
    const r = await fetch(`${API}/products/${options.currentId}/similar?${q}`);
    if (!r.ok) throw new Error(`Failed to fetch similar: ${r.status}`);
    return r.json();
  }

  // Без currentId — просто list по категории/фильтрам (product-view)
  const res = await getProducts({
    sort: "new",
    availableOnly: options?.availableOnly ?? true,
    categoryId: options?.categoryId,
    categoryFullSlug: options?.categoryFullSlug,
    limit: options?.limit ?? 8,
    lang,
    sellerCode: options?.sellerCode,
    view: "product",
  });

  return res as Product[];
}
