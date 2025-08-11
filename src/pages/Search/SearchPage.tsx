import { useSearchParams } from "react-router-dom";
import ProductsMain from "../../components/Product/ProductsMain";

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  return <ProductsMain query={q} showCategories={false} />;
}