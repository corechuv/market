import React, { useMemo, useState } from "react";
import cls from "./ProductsMain.module.scss";
import { useNavigate } from "react-router-dom";
import ProductItemList from "../../components/Product/ProductItemList";
import SidebarItems from "../../components/Product/SidebarItems";
import { getProducts } from "../../services/productService";
import { getCategoryByFullSlug } from "../../services/categoryService";
// import Breadcrumbs from "../Common/Breadcrumbs";
import type { Product } from "../../types/product";
import { SelectField } from "../UI/SelectField";
import IconFilters from "../Icons/IconFilters";
import MasterBar from "../UI/Bars/MasterBar";
import CloseIcon from "../Icons/CloseIcon";

// Разрешённые API-сортировки
const sortOptions = [
  { value: "price", label: "Price: Low to high" },
  { value: "-price", label: "Price: High to low" },
  { value: "name", label: "Name: A → Z" },
  { value: "-name", label: "Name: Z → A" },
];

type ProductsMainProps = {
  query?: string;
  showCategories?: boolean;
  categoryFullSlug?: string; // "/electronics/computers/cpu"
};

const offerings = [
  { value: "sale", label: "Sale" },
];

const stars = [
  { value: "6", label: "Select all" },
  { value: "5", label: "" },
  { value: "4", label: "" },
  { value: "3", label: "" },
  { value: "2", label: "" },
  { value: "1", label: "" },
];

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

  // 👉 это теперь ТОЛЬКО мобильное открытие фильтров (bottom-sheet)
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);
  const [sort, setSort] = useState<string>("");

  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [, setError] = React.useState<string | null>(null);

  // Загрузка продуктов
  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await getProducts({
          q: query,
          sort: (["price", "-price", "name", "-name"] as const).includes(
            sort as any
          )
            ? (sort as any)
            : "name",
          categoryId: cat?.id,
        });
        if (!cancelled) setProducts(res);
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
  }, [query, sort, cat?.id]);

  const openMobileFilters = () => setIsFiltersOpen(true);
  const closeMobileFilters = () => setIsFiltersOpen(false);

  // вынес рендер сайдбара, чтобы не дублировать пропсы
  const renderSidebar = () => (
    <SidebarItems
      variant="desktop" // если есть вариант "mobile", можно сюда подставить его
      showCategories={showCategories}
      currentCategoryFullSlug={cat?.fullSlug}
      showSort={false}
      sort={sort}
      sortOptions={sortOptions}
      onChangeSort={setSort}
      offerings={offerings}
      stars={stars}
      priceRange={{
        min: 0,
        max: 5_000_000,
        step: 50,
        defaultValue: [651_650, 4_493_750],
      }}
      onResetFilters={() => console.log("Reset filters")}
    />
  );

  return (
    <div className={cls.main}>
      {/* Крошки
      <Breadcrumbs crumbs={crumbs as any} />*/}

      {/* Секция со списком товаров */}
      <section className={cls.content}>
        <MasterBar
          title={query ? `Results for “${query}”` : cat?.name || "All products"}
          includeBars
        >
          <div className={cls.topbar}>
            <SelectField
              className={cls.selectField}
              id="products-sort"
              placeholder="Sort by…"
              value={sort}
              onChange={setSort}
              options={sortOptions}
              disabled={loading}
              showTitleOnHover={false}
            />
            <div className={cls.field} onClick={openMobileFilters}>
              <IconFilters />
            </div>
          </div>
        </MasterBar>

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
        className={`${cls.mobileSidebar} ${isFiltersOpen ? cls.mobileSidebarOpen : ""
          }`}
      >
        <div
          className={cls.mobileSidebarBackdrop}
          onClick={closeMobileFilters}
        />
        <aside className={cls.mobileSidebarSheet}>
          <MasterBar title="Filters">
            <CloseIcon className={cls.close} onClick={closeMobileFilters} />
          </MasterBar>
          <div className={cls.sidebar}>
            {renderSidebar()}
          </div>
        </aside>
      </div>
    </div>
  );
}
