import React, { useMemo, useState } from "react";
import cls from "./ProductsMain.module.scss";
import { useNavigate } from "react-router-dom";
import ProductItemList from "../../components/Product/ProductItemList";
import SidebarItems from "../../components/Product/SidebarItems";
import { getProducts } from "../../services/productService";
import { getCategoryByFullSlug } from "../../services/categoryService";
// import Breadcrumbs from "../Common/Breadcrumbs";
import type { Product } from "../../types/product";
import { SelectField, type SelectOption } from "../UI/SelectField";
import IconFilters from "../Icons/IconFilters";
import MasterBar from "../UI/Bars/MasterBar";
import CloseIcon from "../Icons/CloseIcon";

// ---- значения сортировки (для типов) ----
const sortValues = ["price", "-price", "discount", "new", "rating"] as const;
type SortValue = (typeof sortValues)[number];

// ---- сами опции для SelectField (обычный массив, не readonly) ----
const sortOptions: SelectOption[] = [
  { value: "price", label: "Price: Low to high" },
  { value: "-price", label: "Price: High to low" },
  { value: "discount", label: "Biggest discount" },
  { value: "new", label: "New arrivals" },
  { value: "rating", label: "Rating: High to low" },
];

type ProductsMainProps = {
  query?: string;
  showCategories?: boolean;
  categoryFullSlug?: string; // "/electronics/computers/cpu"
};

// офферы: распродажа и новинки
const offerings = [
  { value: "sale", label: "Sale" },
  { value: "new", label: "New arrivals" },
];

const stars = [
  { value: "6", label: "Select all" },
  { value: "5", label: "" },
  { value: "4", label: "" },
  { value: "3", label: "" },
  { value: "2", label: "" },
  { value: "1", label: "" },
];

// утилита для подсчёта диапазона цен по списку товаров
function calcPriceBounds(products: Product[]) {
  let min = Number.POSITIVE_INFINITY;
  let max = 0;

  for (const p of products) {
    // если в типе Product нет поля priceCents — можно добавить его в тип
    const cents = (p as any).priceCents as number | undefined;
    if (typeof cents !== "number" || !Number.isFinite(cents)) continue;

    if (cents < min) min = cents;
    if (cents > max) max = cents;
  }

  if (!Number.isFinite(min)) {
    return null;
  }
  return { min, max };
}

export default function ProductsMain({
  query = "",
  showCategories = true,
  categoryFullSlug,
}: ProductsMainProps) {
  const nav = useNavigate();

  const cat = useMemo(
    () => (categoryFullSlug ? getCategoryByFullSlug(categoryFullSlug) : undefined),
    [categoryFullSlug]
  );
  // const crumbs = useMemo(() => (cat ? getBreadcrumbs(cat.id) : []), [cat]);

  // 👉 мобильный bottom-sheet для фильтров
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

  // сортировка
  const [sort, setSort] = useState<SortValue>("price");

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

  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [, setError] = React.useState<string | null>(null);

  // 👉 при смене категории / поискового запроса — сбрасываем диапазон и фильтр по цене
  React.useEffect(() => {
    setPriceBounds(null);
    setPriceRangeState(null);
    setFiltersResetKey((v) => v + 1);
  }, [cat?.id, query]);

  // Загрузка продуктов
  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await getProducts({
          q: query,
          sort,
          categoryId: cat?.id,
          saleOnly,
          // фильтр новинок + сорт "new" оба включают newArrivalsOnly на бэке
          newArrivalsOnly: newArrivalsOnly,
          // значения слайдера (цены в центах)
          minPriceCents: priceRangeState ? priceRangeState[0] : undefined,
          maxPriceCents: priceRangeState ? priceRangeState[1] : undefined,
          minRating: minRating ?? undefined,
        });

        if (cancelled) return;

        setProducts(res);

        // обновляем глобальный диапазон цен:
        // 1) если его ещё нет
        // 2) либо если фильтр по цене сейчас выключен (priceRangeState === null)
        setPriceBounds((prev) => {
          const bounds = calcPriceBounds(res);
          if (!bounds) return prev; // нет нормальных цен — оставляем как есть
          if (!prev) return bounds; // первый раз — устанавливаем
          if (priceRangeState == null) return bounds; // фильтр по цене снят — обновляем
          return prev; // фильтр по цене включен — НЕ сжимаем диапазон
        });
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [query, sort, cat?.id, saleOnly, newArrivalsOnly, priceRangeState, minRating]);

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

  return (
    <div className={cls.main}>
      {/* Крошки
      <Breadcrumbs crumbs={crumbs as any} />*/}

      {/* Секция со списком товаров */}
      <section className={cls.content}>
        <div className={cls.mastbar}>
          <h2 className={cls.title}>
            {query ? `Results for “${query}”` : cat?.name || "All products"}
          </h2>
          <div className={cls.topbar}>
            <SelectField
              className={cls.selectField}
              id="products-sort"
              placeholder="Sort by…"
              value={sort}
              onChange={(v) => setSort(v as SortValue)}
              options={sortOptions}
              disabled={loading}
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
            isLoading={loading}
            skeletonCount={12}
            onItemClick={(p) => nav(`/product/${p.id}`)}
          />
        </section>
      </section>

      <aside className={cls.desktopSidebarWrapper}>
        <h2 className={cls.title}>Filters</h2>
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
          <MasterBar title="Filters">
            <CloseIcon className={cls.close} onClick={closeMobileFilters} />
          </MasterBar>
          <div className={cls.sidebar}>{renderSidebar()}</div>
        </aside>
      </div>
    </div>
  );
}
