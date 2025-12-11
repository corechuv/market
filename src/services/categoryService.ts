// src/services/categoryService.ts
import type { Category } from "../types/category";
import type { AppLanguage } from "../utils/lang/lang";
import { getInitialLanguage } from "../utils/lang/lang";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (process.env as any).VITE_API_BASE_URL ||
  "";

// --- индексы в памяти ---
type CategoryIndexes = {
  list: Category[];
  byId: Map<string, Category>;
  byFullSlug: Map<string, Category>;
  childrenByParentId: Map<string | null, Category[]>;
};

let INDEX: CategoryIndexes | null = null;
let _loaded = false;
let _lastError: string | null = null;

// текущий язык данных категорий
let _currentLang: AppLanguage = getInitialLanguage();

function sortCats(a: Category, b: Category) {
  const so = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  if (so !== 0) return so;
  // сортируем по алфавиту текущего языка
  return a.name.localeCompare(b.name, _currentLang);
}

function flattenTree(
  tree: Category[],
  parentId: string | null = null,
  out: Category[] = []
): Category[] {
  for (const node of tree) {
    const { children, ...rest } = node as any;
    const normalized: Category = {
      ...rest,
      parentId: node.parentId ?? parentId,
      isActive: node.isActive ?? true,
      fullSlug: node.fullSlug || undefined,
    };
    out.push(normalized);
    if ((node as any).children?.length) {
      flattenTree((node as any).children, node.id, out);
    }
  }
  return out;
}

function buildIndexes(source: Category[]): CategoryIndexes {
  const list = flattenTree(source, null, []);
  const byId = new Map<string, Category>();
  for (const c of list) byId.set(c.id, { ...c });

  const computeFullSlug = (c: Category): string => {
    if (c.fullSlug) return c.fullSlug;
    const segs: string[] = [];
    let cur: Category | undefined = c;
    while (cur) {
      segs.push(cur.slug);
      cur = cur.parentId ? byId.get(cur.parentId) : undefined;
    }
    return "/" + segs.reverse().join("/");
  };

  for (const [id, c] of byId) {
    byId.set(id, { ...c, fullSlug: computeFullSlug(c) });
  }

  const byFullSlug = new Map<string, Category>();
  const childrenByParentId = new Map<string | null, Category[]>();

  for (const c of byId.values()) {
    if (c.fullSlug) byFullSlug.set(c.fullSlug, c);
    const key = c.parentId ?? null;
    const bucket = childrenByParentId.get(key) ?? [];
    bucket.push(c);
    childrenByParentId.set(key, bucket);
  }

  for (const [, arr] of childrenByParentId) arr.sort(sortCats);

  return {
    list: Array.from(byId.values()),
    byId,
    byFullSlug,
    childrenByParentId,
  };
}

function ensureIndex(): CategoryIndexes {
  if (!INDEX) {
    INDEX = {
      list: [],
      byId: new Map(),
      byFullSlug: new Map(),
      childrenByParentId: new Map([[null, []]]),
    };
  }
  return INDEX;
}

// ---------- язык для категорий ----------

const SUPPORTED: AppLanguage[] = ["de", "en", "ru"];

function normalizeLang(lang: string | null | undefined): AppLanguage | null {
  if (!lang) return null;
  return (SUPPORTED.includes(lang as AppLanguage) ? (lang as AppLanguage) : null);
}

function resolveLang(explicit?: AppLanguage): AppLanguage {
  if (explicit && SUPPORTED.includes(explicit)) {
    _currentLang = explicit;
    return _currentLang;
  }

  if (typeof window !== "undefined") {
    try {
      const stored = normalizeLang(window.localStorage.getItem("lang"));
      if (stored) {
        _currentLang = stored;
        return _currentLang;
      }
    } catch {
      // ignore
    }

    const htmlLang = normalizeLang(document.documentElement.lang);
    if (htmlLang) {
      _currentLang = htmlLang;
      return _currentLang;
    }

    const navLang = normalizeLang(window.navigator?.language?.slice(0, 2));
    if (navLang) {
      _currentLang = navLang;
      return _currentLang;
    }
  }

  return _currentLang ?? "de";
}

export function getCategoriesLang(): AppLanguage {
  return _currentLang;
}

// ---- крошечный кэш в sessionStorage (отдельно на каждый язык) ----
const CACHE_PREFIX = "categories.tree.v1.";

function cacheKeyFor(lang: AppLanguage): string {
  return `${CACHE_PREFIX}${lang}`;
}

function loadCache(lang: AppLanguage): Category[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(cacheKeyFor(lang));
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    // кэш на 15 минут
    if (Date.now() - ts > 15 * 60 * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

function saveCache(lang: AppLanguage, tree: Category[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      cacheKeyFor(lang),
      JSON.stringify({ ts: Date.now(), data: tree })
    );
  } catch {
    // ignore
  }
}

// ---- загрузка из API + события ----
async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${text}`.trim());
  }
  return res.json();
}

/** первая и последующие синхронизации */
export async function syncFromApi(lang?: AppLanguage): Promise<void> {
  if (typeof window === "undefined") return; // на всякий случай отрубим SSR
  const effLang = resolveLang(lang);
  _lastError = null;

  try {
    if (!API_BASE) throw new Error("VITE_API_BASE_URL is empty");
    const url = `${API_BASE}/categories/tree?depth=3&activeOnly=true&depth=3&lang=${encodeURIComponent(
      effLang
    )}`;
    const tree = await fetchJSON<Category[]>(url);
    INDEX = buildIndexes(tree);
    saveCache(effLang, tree);
    _loaded = true;
    window.dispatchEvent(new CustomEvent("categories:updated"));
  } catch (e: any) {
    _lastError = e?.message ?? String(e);
    const cached = loadCache(effLang);
    if (cached) {
      INDEX = buildIndexes(cached);
      _loaded = true;
      window.dispatchEvent(new CustomEvent("categories:updated"));
    } else {
      window.dispatchEvent(
        new CustomEvent("categories:error", { detail: _lastError })
      );
    }
  }
}

export function subscribe(cb: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const h = () => cb();
  window.addEventListener("categories:updated", h);
  window.addEventListener("categories:error", h);
  return () => {
    window.removeEventListener("categories:updated", h);
    window.removeEventListener("categories:error", h);
  };
}

export function getStatus() {
  return { loaded: _loaded, error: _lastError };
}

// --- публичные синхронные API (читают из индексов) ---
export function getAllCategories(opts?: { activeOnly?: boolean }): Category[] {
  const { list } = ensureIndex();
  const activeOnly = opts?.activeOnly ?? true;
  return activeOnly ? list.filter((c) => c.isActive !== false) : list.slice();
}

export function getRootCategories(opts?: { activeOnly?: boolean }): Category[] {
  const { childrenByParentId } = ensureIndex();
  const roots = childrenByParentId.get(null) ?? [];
  return (opts?.activeOnly ?? true)
    ? roots.filter((c) => c.isActive !== false)
    : roots.slice();
}

export function getChildren(
  parentId: string | null,
  opts?: { activeOnly?: boolean }
): Category[] {
  const { childrenByParentId } = ensureIndex();
  const arr = childrenByParentId.get(parentId) ?? [];
  return (opts?.activeOnly ?? true)
    ? arr.filter((c) => c.isActive !== false)
    : arr.slice();
}

export function getCategoryById(id: string) {
  return ensureIndex().byId.get(id);
}

function normalizeFullSlug(fullSlug: string) {
  const s = (fullSlug ?? "").trim();
  if (!s) return s;
  return "/" + s.replace(/^\/+/, "");
}

export function getCategoryByFullSlug(fullSlug: string) {
  const norm = normalizeFullSlug(fullSlug);
  return ensureIndex().byFullSlug.get(norm);
}

export function findCategoriesBySlug(slug: string) {
  return ensureIndex().list.filter((c) => c.slug === slug);
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
  return chain.reverse();
}

export function getBreadcrumbs(idOrFullSlug: string): Category[] {
  const { byId, byFullSlug } = ensureIndex();
  const self = byId.get(idOrFullSlug) ?? byFullSlug.get(idOrFullSlug);
  if (!self) return [];
  return [...getAncestors(self.id), self];
}

export function getDescendants(
  id: string,
  opts?: { includeSelf?: boolean; activeOnly?: boolean }
): Category[] {
  const start = getCategoryById(id);
  if (!start) return [];
  const res: Category[] = [];
  const stack: Category[] = getChildren(start.id, {
    activeOnly: opts?.activeOnly,
  }).slice();
  while (stack.length) {
    const node = stack.shift()!;
    res.push(node);
    stack.unshift(
      ...getChildren(node.id, { activeOnly: opts?.activeOnly })
    );
  }
  return opts?.includeSelf ? [start, ...res] : res;
}

export function searchCategories(
  q: string,
  opts?: { limit?: number; activeOnly?: boolean }
): Category[] {
  const { list } = ensureIndex();
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const activeOnly = opts?.activeOnly ?? true;
  const source = activeOnly
    ? list.filter((c) => c.isActive !== false)
    : list;
  const matched = source.filter((c) =>
    [c.name, c.slug, c.meta?.title, c.meta?.description, c.meta?.keywords]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(needle)
  );
  return matched.slice(0, opts?.limit ?? 20);
}

export function getCategoryUrl(c: Category): string {
  return (
    c.fullSlug ??
    "/" +
      [...getAncestors(c.id), c]
        .map((x) => x.slug)
        .join("/")
  );
}

// автоинициализация (ленивая: сначала кэш по текущему языку, затем API через syncFromApi)
(() => {
  if (typeof window === "undefined") return;
  const initialLang = resolveLang(_currentLang);
  const cached = loadCache(initialLang);
  if (cached) {
    INDEX = buildIndexes(cached);
    _loaded = true;
    // не шлём событие здесь, чтобы не мигал интерфейс до syncFromApi(lang)
  }
})();
