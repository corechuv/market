// src/pages/Category/CategoryPage.tsx
import React from "react";
import { Helmet } from "react-helmet-async";
import type { SeoConfig } from "../../types/seo/seoConfig";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProductsMain from "../../components/Product/ProductsMain";
import NotFound from "../NotFound/NotFound";
import {
  getCategoryByFullSlug,
  subscribe,
  syncFromApi,
  getStatus,
  getBreadcrumbs
} from "../../services/categoryService";
import { useLang } from "../../context/LangContext";


export default function CategoryPage() {
  const { pathname } = useLocation();
  const { lang } = useLang();
  const { t } = useTranslation("category");

  // нормализованный slug категории
  const full = React.useMemo(() => {
    const tail = decodeURI(pathname.replace(/^\/category/, "")) || "";
    let s = tail.startsWith("/") ? tail : `/${tail}`;
    if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
    return s;
  }, [pathname]);

  const [, force] = React.useReducer((x) => x + 1, 0);
  const [status, setStatus] = React.useState(getStatus());

  React.useEffect(() => {
    const off = subscribe(() => {
      setStatus(getStatus());
      force();
    });
    void syncFromApi(lang).catch(() => { });
    return off;
  }, [lang]);

  const cat = getCategoryByFullSlug(full);
  const breadcrumbs = cat ? getBreadcrumbs(cat.id) : [];

  const seo: SeoConfig | null = React.useMemo(() => {
    if (!cat) return null;

    const name = cat.meta?.title || cat.name;
    const descriptionText =
      cat.meta?.description || cat.description || "";

    const descKey = descriptionText
      ? "seo.description"
      : "seo.descriptionShort";

    return {
      title: cat.meta?.title || t("seo.title", { name }),
      description:
        cat.meta?.description ||
        t(descKey, { name, description: descriptionText })
    };
  }, [cat, t]);

  const canonicalUrl = cat
    ? `https://dashedo.com/category${cat.fullSlug ?? full}`
    : `https://dashedo.com/category${full}`;

  const breadcrumbSchema =
    cat && breadcrumbs.length
      ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((c, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: c.name,
          item: `https://dashedo.com/category${c.fullSlug}`
        }))
      }
      : null;

  // Пока индексы ещё не построены — показываем загрузку
  if (!status.loaded && !cat) {
    return (
      <>
        <Helmet>
          <title>{t("seo.title", { name: "…" })}</title>
          <meta
            name="description"
            content={t("seo.descriptionShort", { name: "…" })}
          />
        </Helmet>
        <div style={{ padding: 24 }}>{t("loading")}</div>
      </>
    );
  }

  // После загрузки категория так и не нашлась — 404
  if (!cat) {
    return (
      <>
        <Helmet>
          <title>{t("notFound.title")}</title>
          <meta
            name="description"
            content={t("notFound.description")}
          />
          <meta name="robots" content="noindex,follow" />
        </Helmet>
        <NotFound />
      </>
    );
  }

  const seoTitle = seo?.title ?? "Dashedo – Katalog";
  const seoDescription = seo?.description ?? "";

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        {cat.image && <meta property="og:image" content={cat.image} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {cat.image && <meta name="twitter:image" content={cat.image} />}

        {/* JSON-LD Breadcrumbs */}
        {breadcrumbSchema && (
          <script type="application/ld+json">
            {JSON.stringify(breadcrumbSchema)}
          </script>
        )}
      </Helmet>

      <ProductsMain categoryFullSlug={full} />
    </>
  );
}

