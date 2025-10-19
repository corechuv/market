// src/services/productService.ts (новая версия, fetch API)
import type { Product } from "../types/product";

const API = import.meta.env.VITE_API_BASE_URL;

export type GetProductsParams = {
  q?: string;
  sort?: "name" | "-name" | "price" | "-price";
  availableOnly?: boolean;
  categoryId?: string;
  categoryFullSlug?: string;
  limit?: number;
  offset?: number;
};

function qs(params: Record<string, any>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  });
  return q.toString();
}

export async function getProducts(params: GetProductsParams = {}): Promise<Product[]> {
  const url = `${API}/products?${qs(params)}`;
  const r = await fetch(url, { credentials: "omit" });
  if (!r.ok) throw new Error(`Failed to fetch products: ${r.status}`);
  return r.json();
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const r = await fetch(`${API}/products/${id}`);
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
}): Promise<Product[]> {
  if (options?.currentId) {
    const q = qs({
      limit: options.limit ?? 8,
      availableOnly: options.availableOnly ?? true,
      shuffle: options.shuffle ?? true,
      fillFromAllIfShort: options.fillFromAllIfShort ?? true,
    });
    const r = await fetch(`${API}/products/${options.currentId}/similar?${q}`);
    if (!r.ok) throw new Error(`Failed to fetch similar: ${r.status}`);
    return r.json();
  }
  // Без currentId — просто list по категории/фильтрам
  return getProducts({
    sort: "name",
    availableOnly: options?.availableOnly ?? true,
    categoryId: options?.categoryId,
    categoryFullSlug: options?.categoryFullSlug,
    limit: options?.limit ?? 8,
  });
}
