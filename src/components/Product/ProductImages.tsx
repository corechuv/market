import { useState } from "react";
import type { FC, MouseEvent } from "react";
import cls from "./ProductImages.module.scss";
import ProductImageActions from "./ProductImageActions";

export interface ProductImagesProps {
    /** Ссылки на изображения; если не передать — берётся дефолтный набор */
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

    /** меняем transform‑origin, чтобы зум «приближался» туда, где курсор */
    const handleMouseMove = (e: MouseEvent<HTMLImageElement>): void => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setOrigin(`${x}% ${y}%`);
    };

    return (
        <div className={cls.wrapper}>
            {/* вертикальный список миниатюр */}
            <aside className={cls.thumbs}>
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

            {/* главное изображение с зумом при наведении */}
            <figure className={cls.main}>
                <img
                    src={images[current]}
                    alt={`Изображение товара ${current + 1}`}
                    style={{ transformOrigin: origin }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setOrigin("center center")}
                    tabIndex={0}
                />
            </figure>

            <ProductImageActions
                onCopyLink={() => alert("Ссылка на изображение отправлена!")}
                onToggleFavorite={() => alert("Добавлено в избранное!")}
            />
        </div>
    );
};

export default ProductImages;
