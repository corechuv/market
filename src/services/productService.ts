import type { Product } from "../types/product";
import { products as RAW } from "../data/products";
import { getCategoryByFullSlug, getDescendants } from "./categoryService";

export type GetProductsParams = {
  q?: string;
  sort?: "name" | "-name" | "price" | "-price";
  availableOnly?: boolean;
  /** фильтрация по категории */
  categoryId?: string;          // id категории
  categoryFullSlug?: string;    // альтернатива: /electronics/computers/cpu
};

function normalizeProduct(p: Product): Product {
  const imgs = Array.from(new Set([p.imageUrl, ...(p.images ?? [])].filter(Boolean)));
  return { ...p, images: imgs };
}

function parsePriceEuro(price: string): number {
  const n = parseFloat(price.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function collectAllowedCategoryIds(params: GetProductsParams): Set<string> | null {
  let catId: string | undefined;
  if (params.categoryId) {
    catId = params.categoryId;
  } else if (params.categoryFullSlug) {
    const cat = getCategoryByFullSlug(params.categoryFullSlug);
    if (cat) catId = cat.id;
  }
  if (!catId) return null;

  // текущая категория + все её потомки
  const descendants = getDescendants(catId, { includeSelf: true });
  return new Set(descendants.map(c => c.id));
}

export function getProducts(params: GetProductsParams = {}): Product[] {
  const { q, availableOnly, sort = "name" } = params;
  let list = RAW.map(normalizeProduct);

  // фильтр по категории (включая подкатегории)
  const allowed = collectAllowedCategoryIds(params);
  if (allowed) {
    list = list.filter(p => {
      const ids = p.categoryIds ?? (p.categoryId ? [p.categoryId] : []);
      return ids.some(id => allowed.has(id));
    });
  }

  if (availableOnly) {
    list = list.filter(p => p.available !== false);
  }

  if (q && q.trim()) {
    const s = q.trim().toLowerCase();
    list = list.filter(p =>
      [p.name, p.description ?? ""].join(" ").toLowerCase().includes(s)
    );
  }

  switch (sort) {
    case "price":
      list.sort((a, b) => parsePriceEuro(a.price) - parsePriceEuro(b.price));
      break;
    case "-price":
      list.sort((a, b) => parsePriceEuro(b.price) - parsePriceEuro(a.price));
      break;
    case "-name":
      list.sort((a, b) => b.name.localeCompare(a.name, "ru"));
      break;
    case "name":
    default:
      list.sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }

  return list;
}

export function getProductById(id: string): Product | undefined {
  return RAW.map(normalizeProduct).find(p => p.id === id);
}

/** Опции для getMoreProducts */

export type GetMoreProductsOptions = {
  currentId?: string;           // id текущего товара (исключим его)
  limit?: number;               // сколько вернуть (по умолчанию 5)
  availableOnly?: boolean;      // только в наличии
  shuffle?: boolean;            // перемешать выдачу для разнообразия
  fillFromAllIfShort?: boolean; // если мало кандидатов из категории — добрать из остальных

  // Контекст категории (любое из полей)
  categoryId?: string;
  categoryFullSlug?: string;    // напр. "/electronics/computers/cpu"
};

function resolveSeedCategoryIds(opts: GetMoreProductsOptions, pool: Product[]): string[] {
  // 1) если явно передали категорию — берём её
  if (opts.categoryId) return [opts.categoryId];

  if (opts.categoryFullSlug) {
    const cat = getCategoryByFullSlug(opts.categoryFullSlug);
    if (cat) return [cat.id];
  }

  // 2) иначе — из текущего товара
  if (opts.currentId) {
    const cur = pool.find(p => p.id === opts.currentId);
    if (cur) return cur.categoryIds ?? (cur.categoryId ? [cur.categoryId] : []);
  }
  return [];
}

function expandWithDescendants(ids: string[]): Set<string> {
  const all = new Set<string>();
  ids.forEach(id => {
    getDescendants(id, { includeSelf: true }).forEach(c => all.add(c.id));
  });
  return all;
}

function pick<T>(arr: T[], n: number): T[] {
  return arr.slice(0, Math.max(0, n));
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Получить "ещё товары" — кандидаты из той же категории (с подкатегориями).
 * Если мало — опционально добираем из других товаров.
 */
export function getMoreProducts(options?: string | GetMoreProductsOptions, limitLegacy?: number): Product[] {
  // Поддержка старой сигнатуры getMoreProducts(currentId?: string, limit=5)
  const opts: GetMoreProductsOptions =
    typeof options === "string"
      ? { currentId: options, limit: limitLegacy }
      : (options ?? {});

  const limit = opts.limit ?? 5;

  // Базовый пул
  const pool = RAW.map(normalizeProduct);

  // Флаги
  const availableOnly = opts.availableOnly ?? true;
  const fill = opts.fillFromAllIfShort ?? true;
  const doShuffle = opts.shuffle ?? true;

  // Разрешённые категории: текущая + все её потомки
  const seedCatIds = resolveSeedCategoryIds(opts, pool);
  const allowedCats = seedCatIds.length ? expandWithDescendants(seedCatIds) : null;

  // Кандидаты из той же категории
  let candidates = pool.filter(p => p.id !== opts.currentId);
  if (allowedCats) {
    candidates = candidates.filter(p => {
      const ids = p.categoryIds ?? (p.categoryId ? [p.categoryId] : []);
      return ids.some(id => allowedCats!.has(id));
    });
  }
  if (availableOnly) candidates = candidates.filter(p => p.available !== false);

  // Если не хватает — добрать из остальных
  if (candidates.length < limit && fill) {
    const excluded = new Set(candidates.map(p => p.id).concat(opts.currentId ? [opts.currentId] : []));
    let rest = pool.filter(p => !excluded.has(p.id));
    if (availableOnly) rest = rest.filter(p => p.available !== false);
    candidates = candidates.concat(rest);
  }

  if (doShuffle) shuffleInPlace(candidates);

  return pick(candidates, limit);
}