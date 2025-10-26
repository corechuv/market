// src/components/Product/ProductsMain.tsx
import React, { useMemo, useState } from "react";
import cls from "./ProductsMain.module.scss";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal/Modal";
import ToggleViewSwitch, { type ViewMode } from "../../components/Product/ToggleViewSwitch";
import ProductItemList from "../../components/Product/ProductItemList";
import SidebarItems from "../../components/Product/SidebarItems";
import { getProducts } from "../../services/productService";
import { getCategoryByFullSlug, getBreadcrumbs } from "../../services/categoryService";
import Breadcrumbs from "../Common/Breadcrumbs";
import type { Product } from "../../types/product";
import { SelectField } from "../UI/SelectField";

// Разрешённые API-сортировки
const sortOptions = [
  { value: "name", label: "Name: A → Z" },
  { value: "-name", label: "Name: Z → A" },
  { value: "price", label: "Price: Low to high" },
  { value: "-price", label: "Price: High to low" },
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

export default function ProductsMain({ query = "", showCategories = true, categoryFullSlug }: ProductsMainProps) {
  const nav = useNavigate();

  const cat = useMemo(() => (categoryFullSlug ? getCategoryByFullSlug(categoryFullSlug) : undefined), [categoryFullSlug]);
  const crumbs = useMemo(() => (cat ? getBreadcrumbs(cat.id) : []), [cat]);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [view, setView] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<string>("name");

  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await getProducts({
          q: query,
          sort: (["name", "-name", "price", "-price"] as const).includes(sort as any) ? (sort as any) : "name",
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

  return (
    <div className={cls.productsMain}>
      {/* Крошки */}
      <Breadcrumbs crumbs={crumbs as any} />

      <div className={cls.productListPage}>
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
          priceRange={{ min: 0, max: 5_000_000, step: 50, defaultValue: [651_650, 4_493_750] }}
          onResetFilters={() => console.log("Reset filters")}
        />

        <section className={cls.productListContent}>
          <div className={cls.productsHeader}>
            <h4 className={cls.title}>{query ? `Results for “${query}”` : cat?.name || "All products"}</h4>

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

          <div className={cls.productListActions}>
            <ToggleViewSwitch view={view} onChangeView={setView} openModal={() => setIsModalOpen(true)} />
          </div>

          {loading ? (
            <div style={{ padding: 24 }}>Loading…</div>
          ) : error ? (
            <div style={{ padding: 24, color: "var(--danger, #c00)" }}>{error}</div>
          ) : (
            <ProductItemList products={products} view={view} onItemClick={(p) => nav(`/product/${p.id}`)} />
          )}

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
              priceRange={{ min: 0, max: 5_000_000, step: 50, defaultValue: [651_650, 4_493_750] }}
              onResetFilters={() => console.log("Reset filters")}
            />
          </Modal>
        </section>
      </div>
    </div>
  );
}
