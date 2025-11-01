import { useSearchParams } from "react-router-dom";
import ProductsMain from "../../components/Product/ProductsMain";
import Page from "../../components/UI/Page/Page";

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  return (
    <Page>
      <ProductsMain query={q} showCategories={false} />
    </Page>
  );
}