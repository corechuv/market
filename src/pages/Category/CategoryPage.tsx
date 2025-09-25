import "react";
import { useLocation } from "react-router-dom";
import ProductsMain from "../../components/Product/ProductsMain";
import { getCategoryByFullSlug } from "../../services/categoryService";
import NotFound from "../NotFound/NotFound";

export default function CategoryPage() {
  const { pathname } = useLocation();
  const full = pathname.replace(/^\/category/, "") || "/"; // "/electronics/..."

  const cat = getCategoryByFullSlug(full);
  if (!cat) {
    return (
      <NotFound />
    );
  }

  return <ProductsMain categoryFullSlug={full} />;
}
