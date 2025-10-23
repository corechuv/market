// src/components/Product/ProductItemList.tsx
import React from "react";
import cls from "./ProductItemList.module.scss";
import type { ViewMode } from "../../components/Product/ToggleViewSwitch";
import type { Product, ProductVariant } from "../../types/product";
import { parseMoney } from "../../types/helpers/parseMoney";
import { getInitialVariant } from "../../specs/builders";
import EnergyLabel from "./Details/EnergyLabel";

type Props = {
    products: Product[];
    view: ViewMode; // 'grid' | 'list'
    onItemClick?: (product: Product) => void;
    className?: string;
};

// 🔧 БОЛЬШЕ НЕ ХУК — чистая функция, без React.useMemo и т.п.
function computeProductComputed(product: Product) {
    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
    const variant: ProductVariant | undefined = hasVariants ? getInitialVariant(product) : undefined;

    const images = (variant?.images?.length ? variant.images : product.images) ?? [];

    const price = variant?.price ?? product.price;
    const compareAt = variant?.compareAtPrice;
    const available = (variant?.available ?? product.available) ?? false;

    const priceNum = parseMoney(variant?.price ?? product.price);
    const compareAtNum = parseMoney(variant?.compareAtPrice);
    const discountPercent =
        Number.isFinite(priceNum) &&
            Number.isFinite(compareAtNum) &&
            compareAtNum! > 0 &&
            priceNum! < compareAtNum!
            ? Math.round(((compareAtNum! - priceNum!) / compareAtNum!) * 100)
            : null;

    const energyClassArrow = variant?.energyClassArrowUrl ?? product.energyClassArrowUrl;
    const energyClass = variant?.energyClassUrl ?? product.energyClassUrl;

    const imageSrc =
        (images?.[0] as any)?.url ??
        (images?.[0] as any)?.src ??
        (product as any).imageUrl ??
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

    return (
        <div className={[cls.productList, className].filter(Boolean).join(" ")}>
            <div className={view === "grid" ? cls.grid : cls.list}>
                {products.map((product) => {
                    const {
                        imageSrc,
                        price,
                        compareAt,
                        available,
                        discountPercent,
                        energyClassArrow,
                        energyClass,
                    } = computeProductComputed(product);

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
                                        {energyClassArrow && energyClass && (
                                            <EnergyLabel
                                                size="small"
                                                energyClassUrl={energyClass}
                                                energyClassArrowUrl={energyClassArrow}
                                                label="Energieklasse"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className={cls.productDetails}>
                                <h2 className={cls.productName}>{product.name}</h2>
                                <div className={cls.price}>
                                    {!!discountPercent && compareAt && (
                                        <div className={cls.priceRow}>
                                            <div className={cls.badgeDiscount}>-{discountPercent}%</div>
                                            <span className={cls.priceCompareAt}>{compareAt}</span>
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
