// src/components/Product/ProductsMain.tsx
import React, { useMemo, useState } from "react";
import cls from "./ProductsMain.module.scss";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal/Modal";
import ProductItemList from "../../components/Product/ProductItemList";
import SidebarItems from "../../components/Product/SidebarItems";
import { getProducts } from "../../services/productService";
import { getCategoryByFullSlug } from "../../services/categoryService";
// import Breadcrumbs from "../Common/Breadcrumbs";
import type { Product } from "../../types/product";
import { SelectField } from "../UI/SelectField";

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
  { value: "discounted", label: "Discounted" },
  { value: "In stock", label: "In stock" },
];

const stars = [
  { value: "6", label: "Select all" },
  { value: "5", label: "" },
  { value: "4", label: "" },
  { value: "3", label: "" },
  { value: "2", label: "" },
  { value: "1", label: "" },
];

const DESKTOP_MIN_WIDTH = 768; // совпадает с $bp-md

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

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isFiltersOpenDesktop, setIsFiltersOpenDesktop] = React.useState(false);
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
          sort: (["price", "-price", "name", "-name"] as const).includes(sort as any)
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

  // Блокируем скролл страницы, когда открыт десктопный фильтр
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const updateOverflow = () => {
      const isDesktop = window.innerWidth >= DESKTOP_MIN_WIDTH;
      if (isFiltersOpenDesktop && isDesktop) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    };

    updateOverflow();
    window.addEventListener("resize", updateOverflow);

    return () => {
      window.removeEventListener("resize", updateOverflow);
      document.body.style.overflow = "";
    };
  }, [isFiltersOpenDesktop]);

  const toggleDesktopFilters = () => {
    setIsFiltersOpenDesktop((prev) => !prev);
  };

  return (
    <div
      className={`${cls.productsMain} ${
        isFiltersOpenDesktop ? cls.filtersOpen : ""
      }`}
    >
      {/* Крошки 
      <Breadcrumbs crumbs={crumbs as any} />*/}

      <div className={cls.productListPage}>
        {/* Десктопный сайдбар, который выезжает слева */}
        <aside className={cls.desktopSidebarWrapper}>
          <SidebarItems
            variant="desktop"
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
        </aside>

        <section className={cls.productListContent}>
          <div className={cls.productsHeader}>
            <h4 className={cls.title}>
              {query ? `Results for “${query}”` : cat?.name || "All products"}
            </h4>

            <div className={cls.productsHeaderRight}>
              {/* Кнопка открыть/закрыть фильтр (только десктоп) */}
              <button
                type="button"
                className={cls.filtersToggle}
                onClick={toggleDesktopFilters}
              >
                {isFiltersOpenDesktop ? "Close filter" : "Open filter"}
              </button>

              <div className={cls.sortWrap}>
                <SelectField
                  id="products-sort"
                  placeholder="Sort by…"
                  value={sort}
                  onChange={setSort}
                  options={sortOptions}
                  disabled={loading}
                  showTitleOnHover={false}
                />
              </div>
            </div>
          </div>

          <ProductItemList
            products={products}
            isLoading={loading}
            skeletonCount={12}
            onItemClick={(p) => nav(`/product/${p.id}`)}
          />

          {/* Мобильный фильтр по-старому через модалку */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            variant="left"
            header="Filter"
            headerBorder={false}
          >
            <SidebarItems
              variant="modal"
              showCategories={false}
              showSort
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
          </Modal>
        </section>
      </div>
    </div>
  );
}
