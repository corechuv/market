// ProductCarousel.tsx
// Horizontal product carousel with arrow controls and inline SVG icons — no external deps.
// 🔧  Fix: scrollBy now targets the **viewport** (trackWrapper), enabled via overflow-x: auto.
// -----------------------------------------------------------------------------
import React, { useRef, useCallback } from "react";
import cls from "./ProductCarousel.module.scss";
import ChevronLeftIcon from "../Icons/ChevronRightIcon";
import ChevronRightIcon from "../Icons/ChevronLeftIcon";

export interface Product {
    id: string;
    imageUrl: string;
    name: string;
    price?: string;
    link?: string;
}

export interface ProductCarouselProps {
    products: Product[];
    visibleItems?: number; // default 4
    className?: string;
    label?: string; // optional label for the carousel
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ products, visibleItems = 4, className = "", label }) => {
    /** viewportRef points to the scrollable wrapper */
    const viewportRef = useRef<HTMLDivElement>(null);

    const scrollByItemWidth = useCallback(
        (dir: "left" | "right") => {
            const viewport = viewportRef.current;
            if (!viewport) return;
            const distance = (viewport.offsetWidth / visibleItems) * (dir === "left" ? -1 : 1);
            viewport.scrollBy({ left: distance, behavior: "smooth" });
        },
        [visibleItems]
    );

    return (
        <div className={cls.listContainer}>
            <h2 className={cls.title}>{label}</h2>
            <div className={`${cls.carousel} ${className}`.trim()}>
                <button type="button" aria-label="Scroll products left" className={`${cls.arrow} ${cls.left}`} onClick={() => scrollByItemWidth("left")}> <ChevronLeftIcon className={cls.icon} /> </button>

                <div className={cls.trackWrapper} ref={viewportRef}>
                    <div className={cls.track}>
                        {products.map((p) => (
                            <a key={p.id} href={p.link ?? "#"} className={cls.item}>
                                <img src={p.imageUrl} alt={p.name} loading="lazy" className={cls.image} />
                                <span className={cls.name}>{p.name}</span>
                                {p.price && <span className={cls.price}>{p.price}</span>}
                            </a>
                        ))}
                    </div>
                </div>

                <button type="button" aria-label="Scroll products right" className={`${cls.arrow} ${cls.right}`} onClick={() => scrollByItemWidth("right")}> <ChevronRightIcon className={cls.icon} /> </button>
            </div>

            <div className={cls.dotControls}>
                {products.map((_, idx) => (
                    <span key={idx} className={cls.dot}></span>
                ))}
            </div>
        </div>
    );
};

export default ProductCarousel;