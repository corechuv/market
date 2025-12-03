import type { Product } from "../types/product";
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
  newArrivalsOnly?: boolean;  // фильтр "только новинки"
  saleOnly?: boolean;         // фильтр "только со скидкой"
  minPriceCents?: number;     // нижняя граница цены в центах
  maxPriceCents?: number;     // верхняя граница цены в центах
  minRating?: number;         // минимальный рейтинг (1–5)
  lang?: AppLanguage;         // 👈 можно явно передать язык, если нужно

  // НОВОЕ: фильтры по атрибутам
  attrFilters?: AttributeFilterPayload;
};

export type ProductFacets = {
  total: number;
  price: {
    min: number | null;
    max: number | null;
  };
  rating: {
    min: number | null;
    max: number | null;
  };
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
  lang?: AppLanguage;         // 👈 тоже можно переопределить при желании

  // те же фильтры по атрибутам, что и для списка
  attrFilters?: AttributeFilterPayload;
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

export async function getProducts(params: GetProductsParams = {}): Promise<Product[]> {
  const { attrFilters, ...rest } = params;

  const query = qs({
    ...rest,
    attrFilters: attrFilters && Object.keys(attrFilters).length
      ? JSON.stringify(attrFilters)
      : undefined,
  });

  const url = `${API}/products?${query}`;
  const r = await fetch(url, { credentials: "omit" });
  if (!r.ok) throw new Error(`Failed to fetch products: ${r.status}`);
  return r.json();
}

export async function getProductFacets(
  params: GetProductFacetsParams = {},
): Promise<ProductFacets> {
  const { attrFilters, ...rest } = params;

  const query = qs({
    ...rest,
    attrFilters: attrFilters && Object.keys(attrFilters).length
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
): Promise<Product | undefined> {
  const lang = resolveLang(langOverride);
  const r = await fetch(`${API}/products/${id}?lang=${lang}`);
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
  lang?: AppLanguage; // опциональный оверрайд
}): Promise<Product[]> {
  const lang = resolveLang(options?.lang);

  if (options?.currentId) {
    const q = qs({
      limit: options.limit ?? 8,
      availableOnly: options.availableOnly ?? true,
      shuffle: options.shuffle ?? true,
      fillFromAllIfShort: options.fillFromAllIfShort ?? true,
      lang,
    });
    const r = await fetch(`${API}/products/${options.currentId}/similar?${q}`);
    if (!r.ok) throw new Error(`Failed to fetch similar: ${r.status}`);
    return r.json();
  }

  // Без currentId — просто list по категории/фильтрам
  return getProducts({
    sort: "new",
    availableOnly: options?.availableOnly ?? true,
    categoryId: options?.categoryId,
    categoryFullSlug: options?.categoryFullSlug,
    limit: options?.limit ?? 8,
    lang,
  });
}
