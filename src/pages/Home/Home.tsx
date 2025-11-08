// src/pages/Home/Home.tsx
import React from "react";
import cls from "./Home.module.scss";

import Banner from "../../components/Home/Banner";
import CategoryGrid from "../../components/CategoryGrid/CategoryGrid";
import ProductCarousel from "../../components/Product/ProductCarousel";
import BrandCarousel from "../../components/Home/BrandCarousel";
import HomeVideos from "../../components/Home/HomeVideos";
import Page from "../../components/UI/Page/Page";
import Footer from "../../components/Footer/Footer";

import { getProducts } from "../../services/productService";
import type { Product } from "../../types/product";
import { useNavigate } from "react-router-dom";

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

const demoImages = [
    { src: "https://www.apple.com/v/iphone-17-pro/a/images/overview/highlights/highlights_apple_intelligence__bs20h6298f36_medium_2x.jpg", alt: "1", caption: "" },
    { src: "https://www.apple.com/v/iphone-17-pro/a/images/overview/highlights/highlights_design_endframe__flnga0hibmeu_large_2x.jpg", alt: "2", caption: "" },
    { src: "https://www.apple.com/v/iphone-17-pro/a/images/overview/highlights/highlights_ios__empnwsdz698i_large_2x.jpg", alt: "3", caption: "" },
];

const demo = [
    { id: "1", title: "IPhone", color: "#000000", image: "/preview_categries.png" },
    { id: "2", title: "CPU", color: "#000000", image: "/preview_categries.png" },
    { id: "3", title: "GPU", color: "#000000", image: "/preview_categries.png" },
    { id: "4", title: "MacBook", color: "#000000", image: "/preview_categries.png" },
    { id: "5", title: "Case", color: "#000000", image: "/preview_categries.png" },
];

const brandLogos = [
    { name: "Apple", light: { svg: apple_light }, dark: { svg: apple_dark } },
    { name: "Samsung", light: { svg: samsung_light }, dark: { svg: samsung_dark } },
    { name: "Microsoft", light: { svg: microsoft_light }, dark: { svg: microsoft_dark } },
    { name: "Intel", light: { svg: intel_light }, dark: { svg: intel_dark } },
    { name: "Nvidia", light: { svg: nvidia_light }, dark: { svg: nvidia_dark } },
    { name: "HP", light: { svg: hp_light }, dark: { svg: hp_dark } },
];

export default function Home() {
    const nav = useNavigate();
    const [products, setProducts] = React.useState<Product[]>([]);
    const [loading, setLoading] = React.useState(true);        // ✅ теперь используем
    const [error, setError] = React.useState<string | null>(null);

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

    return (
        <Page>
            <div className="container">
                <div className={cls.homeContent}>
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

                    <CategoryGrid
                        title="Customer Favorites"
                        categories={demo}
                        onSelect={(cat) => console.log("Выбрано:", cat)}
                    />

                    <HomeVideos limit={4} sort="trending" label="Trending videos" />

                    {error ? (
                        <div style={{ padding: 16, color: "var(--danger, #c00)" }}>{error}</div>
                    ) : (
                        <>
                            {/* Во время загрузки ProductCarousel сам покажет скелеты */}
                            <ProductCarousel
                                label="Best Products"
                                products={products}
                                isLoading={loading}
                                skeletonCount={10}
                                onItemClick={(p) => nav(`/product/${p.id}`)}
                            />

                            <ProductCarousel
                                label="Featured Products"
                                products={products}
                                isLoading={loading}
                                skeletonCount={10}
                                onItemClick={(p) => nav(`/product/${p.id}`)}
                            />
                        </>
                    )}

                    <BrandCarousel label="Brands" images={brandLogos} />
                </div>
            </div>
            <Footer />
        </Page>
    );
}
