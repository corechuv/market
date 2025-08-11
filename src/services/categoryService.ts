// src/services/categoryService.ts
import type { Category } from "../types/category";
import { categories as RAW_TREE } from "../data/categories";

/** Внутренние индексы для быстрых операций */
type CategoryIndexes = {
  list: Category[];                              // плоский список (нормализованный)
  byId: Map<string, Category>;
  byFullSlug: Map<string, Category>;
  childrenByParentId: Map<string | null, Category[]>;
};

/** Сортировка категорий: по sortOrder, потом по имени */
function sortCats(a: Category, b: Category): number {
  const so = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  if (so !== 0) return so;
  return a.name.localeCompare(b.name, "ru");
}

/** Глубокий обход, разворачиваем в плоский список, подставляем parentId если отсутствует */
function flattenTree(tree: Category[], parentId: string | null = null, out: Category[] = []): Category[] {
  for (const node of tree) {
    const { children, ...rest } = node;
    const normalized: Category = {
      ...rest,
      parentId: node.parentId ?? parentId,
      isActive: node.isActive ?? true,
      // fullSlug достроим позже
    };
    out.push(normalized);
    if (children?.length) flattenTree(children, node.id, out);
  }
  return out;
}

/** Строим индексы и достраиваем fullSlug */
function buildIndexes(): CategoryIndexes {
  // 1) плоский список без children (не мутируем исходный RAW_TREE)
  const list = flattenTree(RAW_TREE, null, []);

  // 2) черновой индекс по id, чтобы можно было подниматься к предкам
  const byId = new Map<string, Category>();
  for (const c of list) byId.set(c.id, { ...c }); // копия

  // 3) достраиваем fullSlug, если отсутствует
  function computeFullSlug(c: Category): string {
    if (c.fullSlug) return c.fullSlug;
    const segments: string[] = [];
    let cur: Category | undefined = c;
    while (cur) {
      segments.push(cur.slug);
      cur = cur.parentId ? byId.get(cur.parentId) : undefined;
    }
    return "/" + segments.reverse().join("/");
  }
  for (const [id, c] of byId) {
    const fullSlug = computeFullSlug(c);
    byId.set(id, { ...c, fullSlug });
  }

  // 4) индексы по fullSlug и по детям
  const byFullSlug = new Map<string, Category>();
  const childrenByParentId = new Map<string | null, Category[]>();

  for (const c of byId.values()) {
    if (c.fullSlug) byFullSlug.set(c.fullSlug, c);
    const key = c.parentId ?? null;
    const bucket = childrenByParentId.get(key) ?? [];
    bucket.push(c);
    childrenByParentId.set(key, bucket);
  }

  // 5) отсортируем детей в каждом бакете
  for (const [k, arr] of childrenByParentId) {
    arr.sort(sortCats);
    childrenByParentId.set(k, arr);
  }

  // 6) итоговый list = значения byId, чтобы были уже с fullSlug
  const finalList = Array.from(byId.values());

  return { list: finalList, byId, byFullSlug, childrenByParentId };
}

// Индексы и геттер, чтобы лениво пересоздавать при необходимости
let INDEX: CategoryIndexes | null = null;
function ensureIndex(): CategoryIndexes {
  if (!INDEX) INDEX = buildIndexes();
  return INDEX;
}

/** Публичное API */

export function getAllCategories(opts?: { activeOnly?: boolean }): Category[] {
  const { list } = ensureIndex();
  const activeOnly = opts?.activeOnly ?? true;
  return activeOnly ? list.filter(c => c.isActive !== false) : list.slice();
}

export function getRootCategories(opts?: { activeOnly?: boolean }): Category[] {
  const { childrenByParentId } = ensureIndex();
  const roots = childrenByParentId.get(null) ?? [];
  return (opts?.activeOnly ?? true) ? roots.filter(c => c.isActive !== false) : roots.slice();
}

export function getChildren(parentId: string | null, opts?: { activeOnly?: boolean }): Category[] {
  const { childrenByParentId } = ensureIndex();
  const arr = childrenByParentId.get(parentId) ?? [];
  return (opts?.activeOnly ?? true) ? arr.filter(c => c.isActive !== false) : arr.slice();
}

export function getCategoryById(id: string): Category | undefined {
  const { byId } = ensureIndex();
  return byId.get(id);
}

export function getCategoryByFullSlug(fullSlug: string): Category | undefined {
  const { byFullSlug } = ensureIndex();
  return byFullSlug.get(fullSlug);
}

/** Может вернуть несколько, т.к. slug не обязан быть уникальным глобально */
export function findCategoriesBySlug(slug: string): Category[] {
  const { list } = ensureIndex();
  return list.filter(c => c.slug === slug);
}

export function getSiblings(id: string, opts?: { includeSelf?: boolean; activeOnly?: boolean }): Category[] {
  const { byId } = ensureIndex();
  const self = byId.get(id);
  if (!self) return [];
  const arr = getChildren(self.parentId ?? null, { activeOnly: opts?.activeOnly });
  return (opts?.includeSelf ? arr : arr.filter(c => c.id !== id));
}

export function getAncestors(id: string): Category[] {
  const { byId } = ensureIndex();
  let cur = byId.get(id);
  const chain: Category[] = [];
  while (cur?.parentId) {
    const p = byId.get(cur.parentId);
    if (!p) break;
    chain.push(p);
    cur = p;
  }
  return chain.reverse(); // от корня к родителю
}

/** Крошки: [root ... parent, self] */
export function getBreadcrumbs(idOrFullSlug: string): Category[] {
  const { byId, byFullSlug } = ensureIndex();
  let self = byId.get(idOrFullSlug) ?? byFullSlug.get(idOrFullSlug);
  if (!self) return [];
  return [...getAncestors(self.id), self];
}

export function getDescendants(id: string, opts?: { includeSelf?: boolean; activeOnly?: boolean }): Category[] {
  const { byId } = ensureIndex();
  const start = byId.get(id);
  if (!start) return [];
  const res: Category[] = [];
  const stack: Category[] = getChildren(start.id, { activeOnly: opts?.activeOnly }).slice();
  while (stack.length) {
    const node = stack.shift()!;
    res.push(node);
    stack.unshift(...getChildren(node.id, { activeOnly: opts?.activeOnly }));
  }
  return opts?.includeSelf ? [start, ...res] : res;
}

/** Поиск по названию/keywords/meta, с ограничением */
export function searchCategories(q: string, opts?: { limit?: number; activeOnly?: boolean }): Category[] {
  const { list } = ensureIndex();
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const activeOnly = opts?.activeOnly ?? true;
  const source = activeOnly ? list.filter(c => c.isActive !== false) : list;
  const scored = source
    .map(c => {
      const hay = [
        c.name,
        c.slug,
        c.meta?.title,
        c.meta?.description,
        c.meta?.keywords,
      ].filter(Boolean).join(" ").toLowerCase();
      const hit = hay.includes(needle);
      return { c, hit };
    })
    .filter(x => x.hit)
    .map(x => x.c);
  const limit = opts?.limit ?? 20;
  return scored.slice(0, limit);
}

/** Построить URL категории (использует fullSlug) */
export function getCategoryUrl(c: Category): string {
  return c.fullSlug ?? "/" + [...getAncestors(c.id), c].map(x => x.slug).join("/");
}

/** Дерево для меню: depth N, только активные, с отсортированными детьми */
export function getTreeForNav(opts?: { depth?: number }): Category[] {
  const depth = Math.max(1, opts?.depth ?? 2);
  const roots = getRootCategories({ activeOnly: true });

  function cloneWithDepth(node: Category, d: number): Category {
    if (d <= 1) return { ...node, children: [] };
    const kids = getChildren(node.id, { activeOnly: true }).map(k => cloneWithDepth(k, d - 1));
    return { ...node, children: kids };
  }

  return roots.map(r => cloneWithDepth(r, depth));
}

/**
 * Опционально: посчитать productsCount по списку товаров.
 * Поддерживает либо product.categoryId, либо product.categoryIds: string[]
 */
export type ProductForCounting = { id: string; categoryId?: string; categoryIds?: string[] };

export function attachProductsCount<T extends ProductForCounting>(products: T[]): Category[] {
  const idx = ensureIndex();
  const counts = new Map<string, number>();

  function inc(catId: string) {
    counts.set(catId, (counts.get(catId) ?? 0) + 1);
  }

  for (const p of products) {
    const catIds = p.categoryIds ?? (p.categoryId ? [p.categoryId] : []);
    for (const cid of catIds) inc(cid);
  }

  // Прокидываем количество вверх по дереву (родителям)
  for (const [catId, n] of counts) {
    let cur = idx.byId.get(catId);
    while (cur?.parentId) {
      const pid = cur.parentId;
      counts.set(pid, (counts.get(pid) ?? 0) + n);
      cur = idx.byId.get(pid);
    }
  }

  // Возвращаем новый список категорий с актуальными productsCount
  return getAllCategories({ activeOnly: false }).map(c => ({
    ...c,
    productsCount: counts.get(c.id) ?? 0,
  }));
}

/** Сброс и пересбор индексов (на случай, если RAW_TREE меняется во время разработки) */
export function rebuildCategoryIndexes(): void {
  INDEX = null;
  ensureIndex();
}

// Инициализация при первом импорте
ensureIndex();
