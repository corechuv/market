// src/components/Product/ProductCard.tsx
import React from "react";
import cls from "./ProductCard.module.scss";
import EnergyLabel from "./Details/EnergyLabel";
import { useTranslation } from "react-i18next";
import type { DeliveryBadge } from "../../types/product";

export type ProductCardProps = {
    name: string;
    discountPercent?: number | null;
    compareAt?: string;
    price: string;
    imageUrl: string;
    currency?: string;
    available?: boolean;
    energyClassArrow?: string;
    energyClass?: string;
    deliveryBadge?: DeliveryBadge;
    deliveryMode?: "full" | "etaOnly";
    isSponsored?: boolean;
    sponsoredLabel?: string | null;
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
    deliveryBadge,
    deliveryMode = "full",
    isSponsored = false,
    sponsoredLabel,
    onClick,
}) => {
    const { t, i18n } = useTranslation("product");

    const availabilityText = available ? "In stock" : "Out of stock";
    const discountText =
        typeof discountPercent === "number" ? `-${discountPercent}%` : "";

    const deliveryText = React.useMemo(() => {
        if (!deliveryBadge) return "";

        const lang = (i18n.language || "de").slice(0, 2).toLowerCase();
        const locale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-GB" : "de-DE";
        const effective =
            typeof deliveryBadge.effectivePriceCents === "number"
                ? deliveryBadge.effectivePriceCents
                : deliveryBadge.priceCents;

        const shippingLabel =
            typeof effective === "number"
                ? effective <= 0
                    ? t("price.freeShipping")
                    : t("price.shippingFromPrice", {
                        price: new Intl.NumberFormat(locale, {
                            style: "currency",
                            currency: deliveryBadge.currency || "EUR",
                        }).format(effective / 100),
                    })
                : "";

        const minDays =
            typeof deliveryBadge.etaMinDays === "number"
                ? deliveryBadge.etaMinDays
                : null;
        const maxDays =
            typeof deliveryBadge.etaMaxDays === "number"
                ? deliveryBadge.etaMaxDays
                : null;

        const etaText =
            minDays === null && maxDays === null
                ? ""
                : minDays !== null && maxDays !== null && minDays !== maxDays
                    ? t("price.deliveryDaysRange", {
                        min: Math.min(minDays, maxDays),
                        max: Math.max(minDays, maxDays),
                    })
                    : t("price.deliveryDaysExact", { count: minDays ?? maxDays ?? 0 });

        if (deliveryMode === "etaOnly") {
            return etaText || shippingLabel;
        }

        if (shippingLabel && etaText) return `${shippingLabel} • ${etaText}`;
        return shippingLabel || etaText;
    }, [deliveryBadge, deliveryMode, i18n.language, t]);

    const sponsoredText = React.useMemo(() => {
        if (!isSponsored) return "";
        const explicit = (sponsoredLabel || "").trim();
        if (explicit) return explicit;

        const lang = (i18n.language || "en").slice(0, 2).toLowerCase();
        if (lang === "ru") return "Реклама";
        if (lang === "de") return "Anzeige";
        return "Sponsored";
    }, [i18n.language, isSponsored, sponsoredLabel]);

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

            <div className={cls.item__meta}>
                {sponsoredText ? <div className={cls.item__sponsored}>{sponsoredText}</div> : null}

                <h2 className={cls["item--name"]} title={name}>
                    {name}
                </h2>

                <div className={cls.item__price}>
                    {discountPercent != null && compareAt ? (
                        <div className={cls["item__price--row"]}>
                            <div className={cls["item__price--discount"]}>{discountText}</div>
                            <div className={cls["item__price--compare"]}>{compareAt}</div>
                        </div>
                    ) : null}

                    <span className={cls["item__price--current"]}>{price}</span>
                </div>

                {deliveryText ? <div className={cls.item__delivery}>{deliveryText}</div> : null}

                <div className={cls.item__available}>
                    <span
                        className={
                            available
                                ? `${cls["item__available--badge"]} ${cls["item__available--badge--true"]}`
                                : `${cls["item__available--badge"]} ${cls["item__available--badge--false"]}`
                        }
                    />
                    <span
                        className={
                            available
                                ? cls["item__available--text--true"]
                                : cls["item__available--text--false"]
                        }
                    >
                        {availabilityText}
                    </span>
                </div>
            </div>
        </article>
    );
};

export default ProductCard;
