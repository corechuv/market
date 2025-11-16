// src/pages/Home/Home.tsx
import React from "react";
import cls from "./Home.module.scss";

import Banner from "../../components/Home/Banner";
import ProductCarousel from "../../components/Product/ProductCarousel";
import BrandCarousel from "../../components/Home/BrandCarousel";
import HomeVideos from "../../components/Home/HomeVideos";
import Page from "../../components/UI/Page/Page";
import Footer from "../../components/Footer/Footer";

import { getProducts } from "../../services/productService";
import type { Product } from "../../types/product";
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

const demoImages = [
    { src: "https://www.apple.com/v/iphone-17-pro/a/images/overview/highlights/highlights_apple_intelligence__bs20h6298f36_medium_2x.jpg", alt: "1", caption: "" },
    { src: "https://www.apple.com/v/iphone-17-pro/a/images/overview/highlights/highlights_design_endframe__flnga0hibmeu_large_2x.jpg", alt: "2", caption: "" },
    { src: "https://www.apple.com/v/iphone-17-pro/a/images/overview/highlights/highlights_ios__empnwsdz698i_large_2x.jpg", alt: "3", caption: "" },
];

const brandLogos = [
    { name: "Apple", light: { svg: apple_light }, dark: { svg: apple_dark } },
    { name: "Samsung", light: { svg: samsung_light }, dark: { svg: samsung_dark } },
    { name: "Microsoft", light: { svg: microsoft_light }, dark: { svg: microsoft_dark } },
    { name: "Intel", light: { svg: intel_light }, dark: { svg: intel_dark } },
    { name: "Nvidia", light: { svg: nvidia_light }, dark: { svg: nvidia_dark } },
    { name: "HP", light: { svg: hp_light }, dark: { svg: hp_dark } },
];

type TabKey = "home" | "new_arrivals" | "sale";

const tabs: TabItem<TabKey>[] = [
    { key: "home", label: "Home" },
    { key: "new_arrivals", label: "New Arrivals" },
    { key: "sale", label: "Sale" },
];

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

export default function Home() {
    const { tab } = useParams<{ tab?: string; }>();
    const nav = useNavigate();
    const [products, setProducts] = React.useState<Product[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [, setError] = React.useState<string | null>(null);

    const active = normalizeTab(tab);

    React.useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                // поддержим и старый sync, и новый async сервисы
                const maybe = (getProducts as any)({ q: "", sort: "name" });
                const list = Array.isArray(maybe) ? maybe : await maybe;

                const arr: Product[] = Array.isArray(list)
                    ? list
                    : (list?.items ?? list?.data ?? list?.products ?? []);

                if (!cancelled) setProducts(arr);
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? "Failed to load products");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const handleTabChange = (key: TabKey) => {
        nav(`/${key}`, { replace: false });
    };

    return (
        <Page padding={false}>
            <div className="container">
                <div className={cls.homeContent}>
                    <Tabs<TabKey>
                        items={tabs}
                        activeKey={active}
                        onChange={handleTabChange}
                        ariaLabel="Profile sections"
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
                            <BrandCarousel label="Brands" images={brandLogos} />

                            <ProductCarousel
                                label="New Arrivals"
                                products={products}
                                isLoading={loading}
                                skeletonCount={10}
                                onItemClick={(p) => nav(`/product/${p.id}`)}
                            />

                            <HomeVideos limit={4} sort="trending" label="Trending videos" />


                            <ProductCarousel
                                label="Bestsellers"
                                products={products}
                                isLoading={loading}
                                skeletonCount={10}
                                onItemClick={(p) => nav(`/product/${p.id}`)}
                            />

                            <ProductCarousel
                                label="Sale"
                                products={products}
                                isLoading={loading}
                                skeletonCount={10}
                                onItemClick={(p) => nav(`/product/${p.id}`)}
                            />
                        </>
                    )}
                    {active === "new_arrivals" && (
                        <>
                            <BrandCarousel label="Brands" images={brandLogos} />
                            <div style={{ padding: "0 var(--gap)" }}>
                                <ProductItemList view="grid" products={products} />
                            </div>
                            <ProductCarousel
                                label="New Arrivals"
                                products={products}
                                isLoading={loading}
                                skeletonCount={10}
                                onItemClick={(p) => nav(`/product/${p.id}`)}
                            />
                        </>
                    )}
                    {active === "sale" && (
                        <>
                            <BrandCarousel label="Brands" images={brandLogos} />
                            <div style={{ padding: "0 var(--gap)" }}>
                                <ProductItemList view="grid" products={products} />
                            </div>
                            <ProductCarousel
                                label="Sale"
                                products={products}
                                isLoading={loading}
                                skeletonCount={10}
                                onItemClick={(p) => nav(`/product/${p.id}`)}
                            />
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </Page>
    );
}
