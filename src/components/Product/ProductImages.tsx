import { useRef, useState, type MouseEvent, type FC } from "react";
import cls from "./ProductImages.module.scss";
import ProductImageActions from "./ProductImageActions";

export interface ProductImagesProps {
    /** Ссылки на изображения; если не передать — берётся дефолтный набор */
    images?: string[];
}

const DEFAULT_IMAGES = [
    "https://cdnbigbuy.com/images/5032037282062_I00.jpg",
    "https://cdnbigbuy.com/images/4711387829523_S9917329_P01.jpg",
    "https://cdnbigbuy.com/images/4711387922279_S9917321_P01.jpg",
];

const ProductImages: FC<ProductImagesProps> = ({ images = DEFAULT_IMAGES }) => {
    const [current, setCurrent] = useState(0);
    const [origin, setOrigin] = useState<string>("center center");
    const carouselRef = useRef<HTMLDivElement | null>(null);

    /** меняем transform-origin, чтобы зум «приближался» туда, где курсор (desktop) */
    const handleMouseMove = (e: MouseEvent<HTMLImageElement>): void => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setOrigin(`${x}% ${y}%`);
    };

    /** скролл к нужному слайду в моб-карусели */
    const scrollToIndex = (idx: number) => {
        setCurrent(idx);
        const el = carouselRef.current;
        if (!el) return;
        el.scrollTo({ left: el.clientWidth * idx, behavior: "smooth" });
    };

    /** синхронизируем индекс при свайпе */
    const handleCarouselScroll = () => {
        const el = carouselRef.current;
        if (!el) return;
        const width = el.clientWidth || 1;
        const idx = Math.round(el.scrollLeft / width);
        if (idx !== current) setCurrent(idx);
    };

    return (
        <div className={cls.root}>
            {/* ======== МОБИЛЬНАЯ ВЕРСИЯ: горизонтальный скролл, без зума ======== */}
            <div className={cls.wrapperMobile}>
                <div
                    className={cls.carousel}
                    ref={carouselRef}
                    onScroll={handleCarouselScroll}
                    aria-label="Галерея изображений — листайте горизонтально"
                >
                    {images.map((src, idx) => (
                        <div className={cls.slide} key={`${src}-${idx}`}>
                            <img
                                src={src}
                                alt={`Изображение товара ${idx + 1} из ${images.length}`}
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>

                {/* горизонтальные миниатюры под каруселью */}
                <aside className={cls.thumbsMobile} aria-label="Миниатюры изображений">
                    {images.map((src, idx) => (
                        <button
                            key={`${src}-m-${idx}`}
                            type="button"
                            onClick={() => scrollToIndex(idx)}
                            className={`${cls.thumbBtn} ${idx === current ? cls.active : ""}`}
                            aria-label={`Показать изображение ${idx + 1}`}
                        >
                            <img src={src} alt={`Миниатюра ${idx + 1}`} />
                        </button>
                    ))}
                </aside>

                <ProductImageActions
                    onCopyLink={() => alert("Ссылка на изображение отправлена!")}
                    onToggleFavorite={() => alert("Добавлено в избранное!")}
                />
            </div>

            {/* ======== ДЕСКТОПНАЯ ВЕРСИЯ: превью слева, зум по ховеру ======== */}
            <div className={cls.wrapperDesktop}>
                <aside className={cls.thumbs} aria-label="Миниатюры изображений">
                    {images.map((src, idx) => (
                        <button
                            key={`${src}-${idx}`}
                            type="button"
                            onClick={() => setCurrent(idx)}
                            className={`${cls.thumbBtn} ${idx === current ? cls.active : ""}`}
                            aria-label={`Показать изображение ${idx + 1}`}
                        >
                            <img src={src} alt={`Миниатюра ${idx + 1}`} />
                        </button>
                    ))}
                </aside>

                <figure className={cls.main}>
                    <img
                        src={images[current]}
                        alt={`Изображение товара ${current + 1}`}
                        style={{ transformOrigin: origin }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setOrigin("center center")}
                        tabIndex={0}
                        draggable={false}
                    />
                    <ProductImageActions
                        onCopyLink={() => alert("Ссылка на изображение отправлена!")}
                        onToggleFavorite={() => alert("Добавлено в избранное!")}
                    />
                </figure>
            </div>
        </div>
    );
};

export default ProductImages;
