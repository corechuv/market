import React from "react";
import cls from "./ProductItemList.module.scss";
import type { ViewMode } from "../../components/Product/ToggleViewSwitch";
import type { Product, ProductVariant } from "../../types/product";
import { parseMoney } from "../../types/helpers/parseMoney";
import { getReviewSummaryMap } from "../../services/reviewService";

// эти утилиты берём из вашего проекта
import { getInitialVariant } from "../../specs/builders";
import EnergyLabel from "./Details/EnergyLabel";
import Stars from "./Stars";
// buildSpecs не обязателен для списка, но при желании можно тоже подключить
// import { buildSpecs } from "../../lib/buildSpecs";

type Props = {
    products: Product[];
    view: ViewMode; // 'grid' | 'list'
    onItemClick?: (product: Product) => void;
    className?: string;
};

// --- маленький хук для вычислений как на карточке товара ---
function useProductComputed(product: Product) {
    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

    // в списке пользователь не выбирает вариант — используем стартовый
    const variant: ProductVariant | undefined = React.useMemo(
        () => (hasVariants ? getInitialVariant(product) : undefined),
        [hasVariants, product]
    );

    const images = (variant?.images?.length ? variant.images : product.images) ?? [];

    const price = variant?.price ?? product.price;
    const compareAt = variant?.compareAtPrice;
    const available = (variant?.available ?? product.available) ?? false;

    // скидка
    const priceNum = parseMoney(variant?.price ?? product.price);
    const compareAtNum = parseMoney(variant?.compareAtPrice);
    const discountPercent = React.useMemo(() => {
        if (!Number.isFinite(priceNum) || !Number.isFinite(compareAtNum)) return null;
        if (compareAtNum <= 0 || priceNum >= compareAtNum) return null;
        return Math.round(((compareAtNum - priceNum) / compareAtNum) * 100);
    }, [priceNum, compareAtNum]);

    // доп. поля
    const energyClassArrow = variant?.energyClassArrowUrl ?? product.energyClassArrowUrl;
    const energyClass = variant?.energyClassUrl ?? product.energyClassUrl;

    // безопасный src для первой картинки
    const imageSrc =
        (images?.[0] as any)?.url ??
        (images?.[0] as any)?.src ??
        (product as any).imageUrl ?? // на случай старого поля
        "";

    return {
        imageSrc,
        images,
        price,
        compareAt,
        available,
        discountPercent,
        energyClassArrow,
        energyClass,
    };
}

const ProductItemList: React.FC<Props> = ({ products, view, onItemClick, className }) => {
    const reviewSummaryMap = React.useMemo(() => getReviewSummaryMap(), []);
    return (
        <div className={[cls.productList, className].filter(Boolean).join(" ")}>
            <div className={view === "grid" ? cls.grid : cls.list}>
                {products.map((product) => {
                    const rs = reviewSummaryMap[product.id];
                    const {
                        imageSrc,
                        price,
                        compareAt,
                        available,
                        discountPercent,
                        energyClassArrow,
                        energyClass,
                    } = useProductComputed(product);

                    return (
                        <div
                            key={product.id}
                            className={[
                                cls.productItem,
                                view === "list" ? cls.itemList : cls.itemGrid,
                                !available ? cls.itemDisabled : "",
                            ].join(" ")}
                            onClick={() => onItemClick?.(product)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") onItemClick?.(product);
                            }}
                        >
                            <div className={cls.imageWrap}>
                                {imageSrc ? (
                                    <img
                                        src={imageSrc}
                                        alt={product.name}
                                        loading="lazy"
                                        className={cls.productImage}
                                    />
                                ) : (
                                    <div className={cls.imagePlaceholder} />
                                )}
                                {(energyClassArrow || energyClass) && (
                                    <div className={cls.meta__energyClass}>
                                        {energyClassArrow && energyClass && <EnergyLabel size="small" energyClassUrl={energyClass} energyClassArrowUrl={energyClassArrow} label="Energieklasse" />}
                                    </div>
                                )}
                            </div>

                            <div className={cls.productDetails}>
                                <h2 className={cls.productName}>{product.name}</h2>
                                <div className={cls.productMeta__rating}>
                                    {rs?.count ? (
                                        <>
                                            <Stars size={14} value={rs.avg} />
                                            <span className={cls.productMeta__ratingValue}>{rs.avg.toFixed(1)}</span>
                                            <span className={cls.productMeta__ratingCount}>({rs.count})</span>
                                        </>
                                    ) : (
                                        <>
                                            <Stars size={14} value={0} />
                                            <span className={cls.productMeta__ratingValue}>0.0</span>
                                            <span className={cls.productMeta__ratingCount}>(0)</span>
                                        </>
                                    )}
                                </div>
                                <div className={cls.price}>
                                    {!!discountPercent && compareAt && (
                                        <div className={cls.priceRow}>
                                            {!!discountPercent && <div className={cls.badgeDiscount}>-{discountPercent}%</div>}
                                            {compareAt ? <span className={cls.priceCompareAt}>{compareAt}</span> : null}
                                        </div>
                                    )}
                                    <span className={cls.productPrice}>{price}</span>
                                </div>
                                <div className={cls.product__infoBelow}>
                                    <span className={cls.productVat}>inkl. MwSt.</span>&nbsp;
                                    <span className={cls.productDelivery}>versandkostenfrei</span>
                                </div>
                                <div className={cls.available}>
                                    <span className={available ? cls.inStock : cls.outOfStock} />
                                    <span className={available ? cls.inStockText : cls.outOfStockText}>
                                        {available ? "In stock" : "Out of stock"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default React.memo(ProductItemList);
