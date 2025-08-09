import React, { useCallback, useId, useState } from "react";
import cls from "./PriceRangeDual.module.scss";

/**
 * Dual‑thumb price range slider (min ⇄ max) on a *single* track.
 *
 * — Accessible (keyboard & screen‑reader)
 * — No external dependencies
 * — Pure CSS Module styling (no Tailwind)
 */
export interface PriceRangeDualProps {
    /** Lowest selectable value (defaults to 0) */
    min?: number;
    /** Highest selectable value (defaults to 1000) */
    max?: number;
    /** Slider step (defaults to 1) */
    step?: number;
    /** Controlled value tuple ([min, max]) */
    value?: [number, number];
    /** Uncontrolled initial value */
    defaultValue?: [number, number];
    /** ISO‑4217 currency code or symbol (defaults to €) */
    currency?: string;
    /** Fires on every user interaction */
    onChange?: (value: [number, number]) => void;
    /** Visible label text (defaults to “Price Range”) */
    label?: string;
    /** Optional extra class(es) */
    className?: string;
}

const PriceRangeDual: React.FC<PriceRangeDualProps> = ({
    min = 0,
    max = 1000,
    step = 1,
    value,
    defaultValue,
    currency = "€",
    onChange,
    className,
}) => {
    /* ───────── State & controlled mode detection ───────── */
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<[number, number]>(
        defaultValue ?? [min, max],
    );
    const [lower, upper] = isControlled ? (value as [number, number]) : internal;

    /* ───────── Accessible range ids ───────── */
    const id = useId();
    const lowerId = `${id}-low`;
    const upperId = `${id}-high`;

    /* ───────── Helpers ───────── */
    const clamp = (val: number, low: number, high: number) =>
        Math.min(Math.max(val, low), high);

    const commit = useCallback(
        (next: [number, number]) => {
            if (!isControlled) setInternal(next);
            onChange?.(next);
        },
        [isControlled, onChange],
    );

    /* ───────── Handlers ───────── */
    const handleLower = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = Number(e.currentTarget.value);
            const nextLow = clamp(raw, min, upper);
            commit([nextLow, upper]);
        },
        [upper, commit, min],
    );

    const handleUpper = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = Number(e.currentTarget.value);
            const nextHigh = clamp(raw, lower, max);
            commit([lower, nextHigh]);
        },
        [lower, commit, max],
    );

    /* ───────── Dynamic track fill ───────── */
    const pct = (v: number) => ((v - min) / (max - min)) * 100;
    const trackBackground = `linear-gradient(to right,
      var(--bg-range-track) 0%,
      var(--bg-range-track) ${pct(lower)}%,
      var(--bg-range-fill)  ${pct(lower)}%,
      var(--bg-range-fill)  ${pct(upper)}%,
      var(--bg-range-track) ${pct(upper)}%,
      var(--bg-range-track) 100%)`;

    /* ───────── Currency formatter ───────── */
    const fmt = (n: number) =>
        Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currency === "€" ? "EUR" : currency,
            maximumFractionDigits: 0,
        }).format(n);

    /* ───────── Markup ───────── */
    return (
        <div className={`${cls.priceRangeDual} ${className ?? ""}`}>
            <div className={cls.rangeWrapper} style={{ background: trackBackground }}>
                {/* Lower thumb */}
                <input
                    id={lowerId}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={lower}
                    onChange={handleLower}
                    className={cls.range}
                    aria-valuemin={min}
                    aria-valuemax={upper}
                    aria-valuenow={lower}
                />

                {/* Upper thumb */}
                <input
                    id={upperId}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={upper}
                    onChange={handleUpper}
                    className={`${cls.range} ${cls.rangeUpper}`}
                    aria-valuemin={lower}
                    aria-valuemax={max}
                    aria-valuenow={upper}
                />
            </div>

            <div className={cls.values}>
                <span className={cls.value}>{fmt(lower)}</span>
                <span>-</span>
                <span className={cls.value}>{fmt(upper)}</span>
            </div>
        </div>
    );
};

export default React.memo(PriceRangeDual);
