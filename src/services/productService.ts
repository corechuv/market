import { products } from "../data/products";
import type { Product } from "../types/product";

type GetProductsParams = { q?: string };

export function getProducts(params?: GetProductsParams): Product[] {
  const list = products; // можно .slice(), но тут не обязательно
  const q = params?.q?.trim();
  if (!q) return list;

  const s = q.toLowerCase();
  return list.filter(p =>
    [
      p.name,
      // сюда можно добавить p.brand, p.category, p.sku, p.description и т.п.
    ].some(v => v?.toLowerCase().includes(s))
  );
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getMoreProducts(currentId?: string, limit = 5): Product[] {
  return products.filter(p => p.id !== currentId).slice(0, limit);
}
