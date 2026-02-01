// src/pages/Home/Home.tsx
import React from "react";
import cls from "./Home.module.scss";
import { Helmet } from "react-helmet-async";

import Banner from "../../components/Home/Banner";
import ProductCarousel from "../../components/Product/ProductCarousel";
import BrandCarousel from "../../components/Home/BrandCarousel";
import HomeVideos from "../../components/Home/HomeVideos";
import Page from "../../components/UI/Page/Page";
import Footer from "../../components/Footer/Footer";

import { getProducts } from "../../services/productService";
import type { VariantListItem } from "../../types/product";
import { useNavigate, useParams } from "react-router-dom";

import apple_light from "@/assets/brand_logos/Apple_Logo_black.png";
import apple_dark from "@/assets/brand_logos/Apple_Logo_white.png";
import samsung_light from "@/assets/brand_logos/Samsung_color.png";
import samsung_dark from "@/assets/brand_logos/Samsung_color.png";
import microsoft_light from "@/assets/brand_logos/Microsoft_Logo_color.svg";
import microsoft_dark from "@/assets/brand_logos/Microsoft_Logo_color.svg";
import intel_light from "@/assets/brand_logos/Intel_black.svg";
import intel_dark from "@/assets/brand_logos/Intel_white.svg";
import nvidia_light from "@/assets/brand_logos/NVIDIA_Logo_black.png";
import nvidia_dark from "@/assets/brand_logos/NVIDIA_Logo_white.png";
import hp_light from "@/assets/brand_logos/HP_Logo_color.svg";
import hp_dark from "@/assets/brand_logos/HP_Logo_color.svg";

import { Tabs, type TabItem } from "../../components/UI/Tabs";
import ProductItemList from "../../components/Product/ProductItemList";
import { useTranslation } from "react-i18next";
import type { SeoConfig } from "../../types/seo/seoConfig";

const demoImages = [
  {
    src: "/___1080p_202602011243.mp4",
    alt: "1",
    caption: ""
  },
  {
    src: "https://www.apple.com/v/iphone-17-pro/a/images/overview/highlights/highlights_design_endframe__flnga0hibmeu_large_2x.jpg",
    alt: "2",
    caption: ""
  },
  {
    src: "https://www.apple.com/v/iphone-17-pro/a/images/overview/highlights/highlights_ios__empnwsdz698i_large_2x.jpg",
    alt: "3",
    caption: ""
  },
  {
    src: "https://www.apple.com/v/iphone-17-pro/a/images/overview/highlights/highlights_apple_intelligence__bs20h6298f36_medium_2x.jpg",
    alt: "4",
    caption: ""
  }
];

const brandLogos = [
  { name: "Apple", light: { svg: apple_light }, dark: { svg: apple_dark } },
  { name: "Samsung", light: { svg: samsung_light }, dark: { svg: samsung_dark } },
  { name: "Microsoft", light: { svg: microsoft_light }, dark: { svg: microsoft_dark } },
  { name: "Intel", light: { svg: intel_light }, dark: { svg: intel_dark } },
  { name: "Nvidia", light: { svg: nvidia_light }, dark: { svg: nvidia_dark } },
  { name: "HP", light: { svg: hp_light }, dark: { svg: hp_dark } }
];

type TabKey = "home" | "new_arrivals" | "sale";

const normalizeTab = (tabParam?: string): TabKey => {
  switch (tabParam) {
    case "new_arrivals":
      return "new_arrivals";
    case "sale":
      return "sale";
    case "home":
    case undefined:
    default:
      return "home";
  }
};

function toUrl(item: VariantListItem) {
  return item.url || `/product/${item.productId}?variant=${item.id}`;
}

export default function Home() {
  const { t } = useTranslation("home");
  const { tab } = useParams<{ tab?: string }>();
  const nav = useNavigate();

  // ✅ теперь Home работает в view=variant
  const [products, setProducts] = React.useState<VariantListItem[]>([]);
  const [newArrivals, setNewArrivals] = React.useState<VariantListItem[]>([]);
  const [saleProducts, setSaleProducts] = React.useState<VariantListItem[]>([]);

  const [loading, setLoading] = React.useState(true);
  const [, setError] = React.useState<string | null>(null);

  const active = normalizeTab(tab);

  const tabs: TabItem<TabKey>[] = React.useMemo(
    () => [
      { key: "home", label: t("tabs.home") },
      { key: "new_arrivals", label: t("tabs.newArrivals") },
      { key: "sale", label: t("tabs.sale") }
    ],
    [t]
  );

  React.useEffect(() => {
    let cancelled = false;

    const unwrap = async (maybe: any): Promise<VariantListItem[]> => {
      const list = Array.isArray(maybe) ? maybe : await maybe;
      const arr = Array.isArray(list)
        ? list
        : (list?.items ?? list?.data ?? list?.products ?? []);
      return Array.isArray(arr) ? arr : [];
    };

    (async () => {
      try {
        setLoading(true);

        // ✅ ключ: view=variant
        const allReq = (getProducts as any)({
          q: "",
          sort: "new",
          availableOnly: true,
          limit: 50,
          view: "variant"
        });

        const newReq = (getProducts as any)({
          newArrivalsOnly: true,
          availableOnly: true,
          sort: "new",
          limit: 20,
          view: "variant"
        });

        const saleReq = (getProducts as any)({
          saleOnly: true,
          availableOnly: true,
          limit: 20,
          view: "variant"
        });

        const [all, newest, sale] = await Promise.all([
          unwrap(allReq),
          unwrap(newReq),
          unwrap(saleReq)
        ]);

        if (!cancelled) {
          setProducts(all);
          setNewArrivals(newest);
          setSaleProducts(sale);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const seo: SeoConfig = React.useMemo(() => {
    const key =
      active === "new_arrivals"
        ? "seo.newArrivals"
        : active === "sale"
          ? "seo.sale"
          : "seo.home";

    return {
      title: t(`${key}.title`),
      description: t(`${key}.description`)
    };
  }, [active, t]);

  const handleTabChange = (key: TabKey) => {
    nav(`/${key}`, { replace: false });
  };

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>

      <Page padding={false}>
        <div className="container">
          <div className={cls.homeContent}>
            <Tabs<TabKey>
              items={tabs}
              activeKey={active}
              onChange={handleTabChange}
              ariaLabel={t("tabs.ariaLabel")}
            />

            <div style={{ padding: "0 var(--gap)" }}>
              <Banner
                images={demoImages}
                interval={4500}
                autoPlay
                loop
                pauseOnHover
                showControls
                showDots
                rounded
                overlay="gradient"
              />
            </div>

            {active === "home" && (
              <>
                <BrandCarousel label={t("sections.brands")} images={brandLogos} />

                <ProductCarousel
                  label={t("sections.newArrivals")}
                  products={newArrivals}
                  isLoading={loading}
                  skeletonCount={10}
                  onItemClick={(it) => nav(toUrl(it))}
                />

                <HomeVideos limit={5} sort="trending" label={t("sections.trendingVideos")} />

                <ProductCarousel
                  label={t("sections.bestsellers")}
                  products={products}
                  isLoading={loading}
                  skeletonCount={10}
                  onItemClick={(it) => nav(toUrl(it))}
                />

                <ProductCarousel
                  label={t("sections.sale")}
                  products={saleProducts}
                  isLoading={loading}
                  skeletonCount={10}
                  onItemClick={(it) => nav(toUrl(it))}
                />
              </>
            )}

            {active === "new_arrivals" && (
              <>
                <BrandCarousel label={t("sections.brands")} images={brandLogos} />

                <div style={{ padding: "0 var(--gap)" }}>
                  <ProductItemList
                    items={newArrivals}
                    isLoading={loading}
                    skeletonCount={12}
                    onItemClick={(it) => nav(toUrl(it))}
                  />
                </div>

                <ProductCarousel
                  label={t("sections.newArrivals")}
                  products={newArrivals}
                  isLoading={loading}
                  skeletonCount={10}
                  onItemClick={(it) => nav(toUrl(it))}
                />
              </>
            )}

            {active === "sale" && (
              <>
                <BrandCarousel label={t("sections.brands")} images={brandLogos} />

                <div style={{ padding: "0 var(--gap)" }}>
                  <ProductItemList
                    items={saleProducts}
                    isLoading={loading}
                    skeletonCount={12}
                    onItemClick={(it) => nav(toUrl(it))}
                  />
                </div>

                <ProductCarousel
                  label={t("sections.sale")}
                  products={saleProducts}
                  isLoading={loading}
                  skeletonCount={10}
                  onItemClick={(it) => nav(toUrl(it))}
                />
              </>
            )}
          </div>
        </div>

        <Footer />
      </Page>
    </>
  );
}
