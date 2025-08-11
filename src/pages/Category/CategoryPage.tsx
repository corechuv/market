import "react";
import { useLocation } from "react-router-dom";
import ProductsMain from "../../components/Product/ProductsMain";
import { getCategoryByFullSlug } from "../../services/categoryService";
import NotFound from "../../components/Common/NotFound";

export default function CategoryPage() {
  const { pathname } = useLocation();
  const full = pathname.replace(/^\/category/, "") || "/"; // "/electronics/..."

  const cat = getCategoryByFullSlug(full);
  if (!cat) {
    return (
      <NotFound
        title="Категория не найдена"
        message="Похоже, такой категории не существует или она была удалена."
        backHref="/"
        backLabel="На главную"
      />
    );
  }

  return <ProductsMain categoryFullSlug={full} />;
}
