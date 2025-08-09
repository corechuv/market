import React, { useCallback, useId, useState } from "react";
import cls from "./PriceRange.module.scss";

/**
 * Production-ready price-range slider without external dependencies.
 */
export interface PriceRangeProps {
    /** Lowest selectable value (defaults to 0) */
    min?: number;
    /** Highest selectable value (defaults to 1000) */
    max?: number;
    /** Slider step (defaults to 1) */
    step?: number;
    /** Controlled value */
    value?: number;
    /** Uncontrolled initial value */
    defaultValue?: number;
    /** ISO 4217 currency code or symbol (defaults to €) */
    currency?: string;
    /** Change handler (fires on every user interaction) */
    onChange?: (value: number) => void;
    /** Visible label text (defaults to “Price Range”) */
    label?: string;
    /** Optional extra class(es) */
    className?: string;
}

const PriceRange: React.FC<PriceRangeProps> = ({
    min = 0,
    max = 1000,
    step = 1,
    value,
    defaultValue,
    currency = "€",
    onChange,
    label = "Price Range",
    className,
}) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<number>(
        defaultValue ?? min,
    );
    const currentValue = isControlled ? (value as number) : internalValue;

    const rangeId = useId();

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const next = Number(e.currentTarget.value);
            if (!isControlled) setInternalValue(next);
            onChange?.(next);
        },
        [isControlled, onChange],
    );

    return (
        <div className={`${cls.priceRange} ${className ?? ""}`}>
            <label htmlFor={rangeId} className={cls.title}>
                {label}
            </label>

            <div className={cls.sliderWrapper}>
                <input
                    id={rangeId}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={currentValue}
                    onChange={handleChange}
                    className={cls.slider}
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={currentValue}
                    aria-label={label}
                />

                <output className={cls.value} htmlFor={rangeId}>
                    {Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: currency === "€" ? "EUR" : currency,
                        maximumFractionDigits: 0,
                    }).format(currentValue)}
                </output>
            </div>
        </div>
    );
};

export default React.memo(PriceRange);
