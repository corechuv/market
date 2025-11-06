// src/pages/Category/CategoryPage.tsx
import React from "react";
import { useLocation } from "react-router-dom";
import ProductsMain from "../../components/Product/ProductsMain";
import NotFound from "../NotFound/NotFound";
import {
  getCategoryByFullSlug,
  subscribe,
  syncFromApi,
  getStatus,
} from "../../services/categoryService";
import Page from "../../components/UI/Page/Page";

export default function CategoryPage() {
  const { pathname } = useLocation();

  // нормализуем /category/electronics/... -> /electronics/...
  const full = React.useMemo(() => {
    const tail = decodeURI(pathname.replace(/^\/category/, "")) || "";
    let s = tail.startsWith("/") ? tail : `/${tail}`;
    if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
    return s;
  }, [pathname]);

  // следим за состоянием загрузки категорий
  const [, force] = React.useReducer((x) => x + 1, 0);
  const [status, setStatus] = React.useState(getStatus());

  React.useEffect(() => {
    const off = subscribe(() => {
      setStatus(getStatus());
      force();
    });
    // первая синхронизация (если ещё не было)
    void syncFromApi().catch(() => { });
    return off;
  }, []);

  const cat = getCategoryByFullSlug(full);

  // лоадер, пока индексы ещё не построены
  if (!status.loaded && !cat) {
    return <div style={{ padding: 24 }}>Загрузка категории…</div>;
  }

  // если после загрузки категория так и не нашлась — 404
  if (!cat) {
    return <NotFound />;
  }

  // можно передавать и id, и fullSlug (на будущее удобно иметь id)
  return (
    <Page>
      <ProductsMain categoryFullSlug={full} />
    </Page>
  )
}
