// src/components/Product/ProductMain.tsx
import React, { useMemo, useState } from "react";
import cls from "./ProductsMain.module.scss";
import { useNavigate } from "react-router-dom";
import ProductItemList from "../../components/Product/ProductItemList";
import SidebarItems from "../../components/Product/SidebarItems";
import { getProducts, getProductFacets } from "../../services/productService";
import { getCategoryByFullSlug } from "../../services/categoryService";
// import Breadcrumbs from "../Common/Breadcrumbs";
import type { Product } from "../../types/product";
import { SelectField, type SelectOption } from "../UI/SelectField";
import IconFilters from "../Icons/IconFilters";
import MasterBar from "../UI/Bars/MasterBar";
import CloseIcon from "../Icons/CloseIcon";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../utils/useInfiniteList";

const PAGE_SIZE = 50;

// ---- значения сортировки (для типов) ----
const sortValues = ["price", "-price", "discount", "new", "rating"] as const;
type SortValue = (typeof sortValues)[number];

type ProductsMainProps = {
  query?: string;
  showCategories?: boolean;
  categoryFullSlug?: string; // "/electronics/computers/cpu"
};

// хелпер: убираем дубли по id
function uniqById<T extends { id: string | number }>(items: T[]): T[] {
  const seen = new Set<string | number>();
  const result: T[] = [];
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}

export default function ProductsMain({
  query = "",
  showCategories = true,
  categoryFullSlug,
}: ProductsMainProps) {
  const { t } = useTranslation("products");
  const nav = useNavigate();

  const cat = useMemo(
    () => (categoryFullSlug ? getCategoryByFullSlug(categoryFullSlug) : undefined),
    [categoryFullSlug]
  );
  // const crumbs = useMemo(() => (cat ? getBreadcrumbs(cat.id) : []), [cat]);

  // 👉 мобильный bottom-sheet для фильтров
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

  // сортировка
  const [sort, setSort] = useState<SortValue>("new");

  // фильтры
  const [saleOnly, setSaleOnly] = useState(false);
  const [newArrivalsOnly, setNewArrivalsOnly] = useState(false);
  const [priceRangeState, setPriceRangeState] = useState<[number, number] | null>(
    null
  );
  const [minRating, setMinRating] = useState<number | null>(null);

  // диапазон цен для слайдера (ГЛОБАЛЬНЫЙ для текущей категории/поиска)
  const [priceBounds, setPriceBounds] = useState<{ min: number; max: number } | null>(
    null
  );

  // ключ для полного ресета Sidebar (чтобы сбрасывались defaultValue)
  const [filtersResetKey, setFiltersResetKey] = useState(0);

  const [, setError] = React.useState<string | null>(null);

  // локализованные опции сортировки
  const sortOptions: SelectOption[] = useMemo(
    () => [
      { value: "new", label: t("sort.new") },
      { value: "price", label: t("sort.priceAsc") },
      { value: "-price", label: t("sort.priceDesc") },
      { value: "discount", label: t("sort.discount") },
      { value: "rating", label: t("sort.rating") },
    ],
    [t]
  );

  // офферы: распродажа и новинки (для фильтра)
  const offerings = useMemo(
    () => [
      { value: "sale", label: t("filters.sale") },
      { value: "new", label: t("filters.newArrivals") },
    ],
    [t]
  );

  // рейтинг: только "Select all" требует текста
  const stars = useMemo(
    () => [
      { value: "6", label: t("filters.stars.all") },
      { value: "5", label: "" },
      { value: "4", label: "" },
      { value: "3", label: "" },
      { value: "2", label: "" },
      { value: "1", label: "" },
    ],
    [t]
  );

  // ====== loadPage с useCallback, чтобы не дёргалось лишний раз ======
  const loadPage = React.useCallback(
    async (pageNum: number) => {
      const offset = pageNum * PAGE_SIZE;

      try {
        const res = await getProducts({
          q: query,
          sort,
          categoryId: cat?.id,
          saleOnly,
          // фильтр новинок + сорт "new" оба включают newArrivalsOnly на бэке
          newArrivalsOnly,
          // значения слайдера (цены в центах)
          minPriceCents: priceRangeState ? priceRangeState[0] : undefined,
          maxPriceCents: priceRangeState ? priceRangeState[1] : undefined,
          minRating: minRating ?? undefined,
          limit: PAGE_SIZE,
          offset,
        });

        return res;
      } catch (e: any) {
        setError(e?.message ?? "Failed to load products");
        return [];
      }
    },
    [query, sort, cat?.id, saleOnly, newArrivalsOnly, priceRangeState, minRating]
  );

  // ====== Infinite list (hook) ======
  const {
    items: rawItems,
    loading,
    hasMore,
    loadNext,
    reset,
    page,
  } = useInfiniteList<Product>(loadPage, PAGE_SIZE);

  // убираем дубли по id (на всякий случай)
  const products = useMemo(() => uniqById(rawItems), [rawItems]);

  // 👉 при смене фильтров/сортировки/категории/поиска — сбрасываем список
  React.useEffect(() => {
    reset();
  }, [
    query,
    sort,
    cat?.id,
    saleOnly,
    newArrivalsOnly,
    priceRangeState,
    minRating,
    reset,
  ]);

  // 👉 при смене категории / поискового запроса — сбрасываем фильтр по цене и перерисовываем сайдбар
  React.useEffect(() => {
    setPriceRangeState(null);
    setFiltersResetKey((v) => v + 1);
  }, [cat?.id, query]);

  // 👉 глобальные priceBounds по всем товарам (через /products/facets)
  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await getProductFacets({
          q: query || undefined,
          categoryId: cat?.id,
          saleOnly,
          newArrivalsOnly,
          minRating: minRating ?? undefined,
          // availableOnly можно добавить, если нужно
        });

        if (cancelled) return;

        const min = res.price?.min ?? null;
        const max = res.price?.max ?? null;

        if (min !== null && max !== null) {
          setPriceBounds({ min, max });
        } else {
          setPriceBounds(null);
        }
      } catch {
        if (!cancelled) {
          setPriceBounds(null);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [query, cat?.id, saleOnly, newArrivalsOnly, minRating]);

  const openMobileFilters = () => setIsFiltersOpen(true);
  const closeMobileFilters = () => setIsFiltersOpen(false);

  const handleResetFilters = React.useCallback(() => {
    setSort("price");
    setSaleOnly(false);
    setNewArrivalsOnly(false);
    setPriceRangeState(null);
    setMinRating(null);
    setFiltersResetKey((v) => v + 1);
  }, []);

  // общий рендер сайдбара, чтобы не дублировать пропсы
  const renderSidebar = () => {
    const min = priceBounds?.min ?? 0;
    const max = priceBounds?.max ?? 0;

    // если пользователь ещё не трогал диапазон — показываем полностью весь доступный
    const defaultRange: [number, number] =
      priceRangeState ?? (priceBounds ? [min, max] : [0, 0]);

    return (
      <SidebarItems
        key={filtersResetKey}
        variant="desktop"
        showCategories={showCategories}
        currentCategoryFullSlug={cat?.fullSlug}
        showSort={false}
        sort={sort}
        sortOptions={sortOptions}
        onChangeSort={(val) => setSort(val as SortValue)}
        offerings={offerings}
        stars={stars}
        priceRange={{
          min,
          max,
          step: 1,
          defaultValue: defaultRange,
        }}
        onChangePriceRange={(minVal, maxVal) => setPriceRangeState([minVal, maxVal])}
        onToggleSaleOnly={setSaleOnly}
        onToggleNewArrivalsOnly={setNewArrivalsOnly}
        onChangeMinRating={setMinRating}
        onResetFilters={handleResetFilters}
      />
    );
  };

  // ====== IntersectionObserver для бесконечной прокрутки ======
  const loaderRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          loadNext();
        }
      },
      {
        root: null,
        rootMargin: "400px", // подгружаем заранее
        threshold: 0,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [loadNext]);

  return (
    <div className={cls.main}>
      {/* Крошки
      <Breadcrumbs crumbs={crumbs as any} />*/}

      {/* Секция со списком товаров */}
      <section className={cls.content}>
        <div className={cls.mastbar}>
          <h2 className={cls.title}>
            {query ? t("title.resultsFor", { query }) : cat?.name || t("title.all")}
          </h2>
          <div className={cls.topbar}>
            <SelectField
              className={cls.selectField}
              id="products-sort"
              placeholder={t("sort.placeholder")}
              value={sort}
              onChange={(v) => setSort(v as SortValue)}
              options={sortOptions}
              disabled={loading && page === 0}
              showTitleOnHover={false}
            />
            <div className={cls.field} onClick={openMobileFilters}>
              <IconFilters />
            </div>
          </div>
        </div>

        <section className={cls.items}>
          <ProductItemList
            products={products}
            // skeleton только для первой загрузки
            isLoading={loading}
            skeletonCount={12}
            onItemClick={(p) => nav(`/product/${p.id}`)}
          />

          {/* маячок для IntersectionObserver */}
          <div ref={loaderRef} />

          {/* конец списка */}
          {!hasMore && products.length > 0 && (
            <div className={cls.endMarker}></div>
          )}
        </section>
      </section>

      <aside className={cls.desktopSidebarWrapper}>
        <h2 className={cls.title}>{t("filters.title")}</h2>
        {renderSidebar()}
      </aside>

      {/* Мобильный сайдбар: bottom-sheet на весь экран */}
      <div
        className={`${cls.mobileSidebar} ${
          isFiltersOpen ? cls.mobileSidebarOpen : ""
        }`}
      >
        <div className={cls.mobileSidebarBackdrop} onClick={closeMobileFilters} />
        <aside className={cls.mobileSidebarSheet}>
          <MasterBar title={t("filters.title")}>
            <CloseIcon className={cls.close} onClick={closeMobileFilters} />
          </MasterBar>
          <div className={cls.sidebar}>{renderSidebar()}</div>
        </aside>
      </div>
    </div>
  );
}
