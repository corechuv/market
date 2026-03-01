// src/components/Product/ProductsMain.tsx
import React, { useMemo, useState } from "react";
import cls from "./ProductsMain.module.scss";
import { useNavigate } from "react-router-dom";
import ProductItemList from "../../components/Product/ProductItemList";
import SidebarItems from "../../components/Product/SidebarItems";
import {
  getProducts,
  getProductFacets,
  type AttributeFacet,
  type AttributeFilterPayload,
} from "../../services/productService";
import { getCategoryByFullSlug } from "../../services/categoryService";
import type { VariantListItem } from "../../types/product";
import { SelectField, type SelectOption } from "../UI/SelectField";
import IconFilters from "../Icons/IconFilters";
import MasterBar from "../UI/Bars/MasterBar";
import CloseIcon from "../Icons/CloseIcon";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../utils/useInfiniteList";
import { useCategoriesVersion } from "../../utils/useCategoriesVersion";

const PAGE_SIZE = 50;

function buildAttrFiltersPayload(
  facets: AttributeFacet[],
  selected: Record<string, string[]>
): AttributeFilterPayload | undefined {
  if (!facets.length) return undefined;

  const byCode: Record<string, AttributeFacet> = {};
  facets.forEach((f) => {
    byCode[f.code] = f;
  });

  const result: AttributeFilterPayload = {};

  Object.entries(selected).forEach(([code, values]) => {
    const facet = byCode[code];
    if (!facet || !values.length) return;

    const rawValues: (string | number | boolean)[] = [];

    values.forEach((val) => {
      const opt = facet.options.find((o) => o.value === val);
      if (!opt) return;
      rawValues.push(opt.rawValue);
    });

    if (rawValues.length) result[code] = rawValues;
  });

  return Object.keys(result).length ? result : undefined;
}

const sortValues = ["price", "-price", "discount", "new", "rating"] as const;
type SortValue = (typeof sortValues)[number];

type ProductsMainProps = {
  query?: string;
  showCategories?: boolean;
  categoryFullSlug?: string;
};

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

  const [attrFacets, setAttrFacets] = useState<AttributeFacet[]>([]);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string[]>>({});
  const categoriesVersion = useCategoriesVersion();

  const normalized = categoryFullSlug
    ? `/${categoryFullSlug.replace(/^\/+/, "")}`
    : undefined;

  const cat = useMemo(
    () => (normalized ? getCategoryByFullSlug(normalized) : undefined),
    [normalized, categoriesVersion]
  );

  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);
  const [sort, setSort] = useState<SortValue>("new");

  const [saleOnly, setSaleOnly] = useState(false);
  const [newArrivalsOnly, setNewArrivalsOnly] = useState(false);
  const [priceRangeState, setPriceRangeState] = useState<[number, number] | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);

  const [priceBounds, setPriceBounds] = useState<{ min: number; max: number } | null>(null);
  const [filtersResetKey, setFiltersResetKey] = useState(0);
  const [, setError] = React.useState<string | null>(null);

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

  const offerings = useMemo(
    () => [
      { value: "sale", label: t("filters.sale") },
      { value: "new", label: t("filters.newArrivals") },
    ],
    [t]
  );

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

  const loadPage = React.useCallback(
    async (pageNum: number) => {
      const offset = pageNum * PAGE_SIZE;

      try {
        const attrFiltersPayload = buildAttrFiltersPayload(attrFacets, selectedAttrs);

        const res = await getProducts({
          q: query,
          sort,
          categoryId: cat?.id,

          saleOnly,
          newArrivalsOnly,

          minPriceCents: priceRangeState ? priceRangeState[0] : undefined,
          maxPriceCents: priceRangeState ? priceRangeState[1] : undefined,
          minRating: minRating ?? undefined,

          limit: PAGE_SIZE,
          offset,

          attrFilters: attrFiltersPayload,

          view: "variant",
          includeSponsored: true,
          sponsoredSlotEvery: 8,
          sponsoredSlotOffset: 5,
        });

        return res as VariantListItem[];
      } catch (e: any) {
        setError(e?.message ?? "Failed to load products");
        return [];
      }
    },
    [
      query,
      sort,
      cat?.id,
      saleOnly,
      newArrivalsOnly,
      priceRangeState,
      minRating,
      attrFacets,
      selectedAttrs,
    ]
  );

  const { items: rawItems, loading, hasMore, loadNext, reset, page } =
    useInfiniteList<VariantListItem>(loadPage, PAGE_SIZE);

  const items = useMemo(() => uniqById(rawItems), [rawItems]);

  // при изменении фильтров — перезагрузка списка
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
    selectedAttrs,
    reset,
  ]);

  // при смене категории/поиска — сброс UI-фильтров
  React.useEffect(() => {
    setPriceRangeState(null);
    setSelectedAttrs({});
    setFiltersResetKey((v) => v + 1);
  }, [cat?.id, query]);

  // facets
  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await getProductFacets({
          q: query || undefined,
          availableOnly: true,
          categoryId: cat?.id,
          saleOnly,
          newArrivalsOnly,
          minRating: minRating ?? undefined,
          view: "variant",
        });

        if (cancelled) return;

        const min = res.price?.min ?? null;
        const max = res.price?.max ?? null;

        if (min !== null && max !== null) setPriceBounds({ min, max });
        else setPriceBounds(null);

        setAttrFacets(res.attributes ?? []);
      } catch {
        if (!cancelled) {
          setPriceBounds(null);
          setAttrFacets([]);
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

  const handleAttrFilterChange = React.useCallback((code: string, values: string[]) => {
    setSelectedAttrs((prev) => {
      const next = { ...prev };
      if (!values.length) delete next[code];
      else next[code] = values;
      return next;
    });
  }, []);

  const handleResetFilters = React.useCallback(() => {
    setSort("price");
    setSaleOnly(false);
    setNewArrivalsOnly(false);
    setPriceRangeState(null);
    setMinRating(null);
    setSelectedAttrs({});
    setFiltersResetKey((v) => v + 1);
  }, []);

  const renderSidebar = () => {
    const min = priceBounds?.min ?? 0;
    const max = priceBounds?.max ?? 0;

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
        priceRange={{ min, max, step: 1, defaultValue: defaultRange }}
        onChangePriceRange={(minVal, maxVal) => setPriceRangeState([minVal, maxVal])}
        onToggleSaleOnly={setSaleOnly}
        onToggleNewArrivalsOnly={setNewArrivalsOnly}
        onChangeMinRating={setMinRating}
        onResetFilters={handleResetFilters}
        attributeFacets={attrFacets}
        selectedAttributeValues={selectedAttrs}
        onChangeAttributeValues={handleAttrFilterChange}
      />
    );
  };

  const loaderRef = React.useRef<HTMLDivElement | null>(null);

  // ✅ refs, чтобы observer не зависел от кучи стейтов
  const obsStateRef = React.useRef({ loading: false, hasMore: true, itemsLen: 0 });
  React.useEffect(() => {
    obsStateRef.current = { loading, hasMore, itemsLen: items.length };
  }, [loading, hasMore, items.length]);

  React.useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;

        const s = obsStateRef.current;

        // ✅ супер-важно: не грузим next-page, если:
        // - уже грузим
        // - нет следующей страницы
        // - список пустой (после reset), чтобы не перескочить на offset=50
        if (s.loading) return;
        if (!s.hasMore) return;
        if (s.itemsLen === 0) return;

        loadNext();
      },
      { root: null, rootMargin: "400px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadNext]);

  return (
    <div className={cls.main}>
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
            items={items}
            isLoading={loading}
            skeletonCount={12}
            layout="masonry"
            onItemClick={(it) => nav(it.url)}
          />

          <div ref={loaderRef} />

          {!hasMore && items.length > 0 && <div className={cls.endMarker}></div>}
        </section>
      </section>

      <aside className={cls.desktopSidebarWrapper}>
        <h2 className={cls.title}>{t("filters.title")}</h2>
        {renderSidebar()}
      </aside>

      <div className={`${cls.mobileSidebar} ${isFiltersOpen ? cls.mobileSidebarOpen : ""}`}>
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
