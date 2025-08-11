import { products } from "../data/products";
import type { Product } from "../types/product";

export function getProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getMoreProducts(currentId?: string, limit = 5): Product[] {
  return products.filter(p => p.id !== currentId).slice(0, limit);
}
