import React from "react";
import cls from "./RatingBadge.module.scss";

export type RatingBadgeProps = {
    /** Средняя оценка (0–5) с точностью до 0.1. null — если оценок нет */
    ratingValue: number | null;
    /** Количество отзывов */
    reviewCount: number | null | undefined;
    /** Позволяет добавить внешние классы к контейнеру */
    className?: string;
    /** Размер шрифта/стилей. По умолчанию — "small" как в карточке товара */
    size?: "small" | "default";
    /** Доступное описание для скринридеров */
    ariaLabel?: string;
    count?: boolean;
};

/**
 * Небольшой бейдж рейтинга: "4.7/5 (123)".
*/
const RatingBadge: React.FC<RatingBadgeProps> = ({
    ratingValue,
    reviewCount = 0,
    className,
    size = "small",
    ariaLabel,
    count = true,
}) => {
    const containerClass = [cls.rating__capture, className].filter(Boolean).join(" ");
    const valueClass = size === "small" ? cls["rating__value--small"] : cls.rating__value;
    const countClass = size === "small" ? cls["rating__count--small"] : cls.rating__count;

    const valueText = ratingValue !== null && Number.isFinite(ratingValue)
        ? (Math.round(ratingValue * 10) / 10).toFixed(1)
        : "—";

    const a11y = ariaLabel ?? `User rating: ${valueText}/5 based on ${reviewCount ?? 0} reviews`;

    return (
        <div className={containerClass} aria-label={a11y} role="group">
            <span className={valueClass}>{valueText}/5</span>
            {count ? (
                <span className={countClass}>({reviewCount ?? 0})</span>
            ) : (<></>)}
        </div>
    );
};

export default React.memo(RatingBadge);
