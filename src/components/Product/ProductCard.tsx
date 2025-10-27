// src/components/Product/ProductCard.tsx
import React from "react";
import cls from "./ProductCard.module.scss";
import EnergyLabel from "./Details/EnergyLabel";

export type ProductCardProps = {
    /** Название товара */
    name: string;
    discountPercent?: number | null;
    compareAt?: string;
    /** Цена товара (число) */
    price: string;
    /** URL изображения товара */
    imageUrl: string;
    /** Валюта (ISO-код), по умолчанию EUR */
    currency?: string;
    /** Доступность товара, по умолчанию true */
    available?: boolean;
    energyClassArrow?: string;
    energyClass?: string;
    /** Обработчик клика по карточке */
    onClick?: () => void;
};

export const ProductCard: React.FC<ProductCardProps> = ({
    name,
    discountPercent,
    compareAt,
    price,
    imageUrl,
    available = true,
    energyClassArrow,
    energyClass,
    onClick,
}) => {
    const availabilityText = available ? "In stock" : "Out of stock";
    const dicountPercentText = discountPercent ? `-${discountPercent}%` : "Out of stock";
    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <article
            className={`${cls.item} ${!available ? cls["item--disable"] : ""}`}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : -1}
            aria-label={name}
        >
            <div className={cls.item__watch}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        loading="lazy"
                        className={cls["item__watch--image"]}
                    />
                ) : (
                    <div className={cls["item__watch--placeholder"]} />
                )}

                {(energyClassArrow || energyClass) && (
                    <div className={cls["item__watch--meta"]}>
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
            <h2 className={cls["item--name"]} title={name}>
                {name}
            </h2>
            <div className={cls.item__price}>
                {discountPercent && compareAt ? (
                    <div className={cls["item__price--row"]}>
                        <div className={cls["item__price--discount"]}>
                            {dicountPercentText}
                        </div>
                        <div className={cls["item__price--compare"]}>
                            {compareAt}
                        </div>
                    </div>
                ) : null}
                <span className={cls["item__price--current"]}>{price}</span>
            </div>
            <div className={cls.item__available}>
                <span className={available ? `${cls["item__available--badge"]} ${cls["item__available--badge--true"]}` : cls["item__available--badge--false"]} />
                <span className={available ? cls["item__available--text--true"] : cls["item__available--text--false"]}>
                    {availabilityText}
                </span>
            </div>
        </article>
    );
};
export default ProductCard;
