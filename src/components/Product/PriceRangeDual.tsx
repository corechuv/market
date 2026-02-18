// src/components/Product/PriceRangeDual.tsx
import React, { useCallback, useEffect, useId, useState } from "react";
import cls from "./PriceRangeDual.module.scss";

export interface PriceRangeDualProps {
    min?: number;
    max?: number;
    step?: number;
    value?: [number, number];
    defaultValue?: [number, number];
    currency?: string;
    onChange?: (value: [number, number]) => void;
    label?: string;
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
    const isControlled = value !== undefined;

    const [internal, setInternal] = useState<[number, number]>(
        defaultValue ?? [min, max],
    );
    const [dragging, setDragging] = useState(false);

    // если компонент используют в неконтролируемом режиме —
    // обновляем внутреннее состояние, когда меняется defaultValue/min/max
    useEffect(() => {
        if (!isControlled) {
            if (defaultValue) {
                setInternal(defaultValue);
            } else {
                setInternal([min, max]);
            }
        }
    }, [defaultValue, min, max, isControlled]);

    useEffect(() => {
        if (!isControlled) return;
        if (dragging) return;
        if (value) setInternal(value);
    }, [value, isControlled, dragging]);

    const [lower, upper] = internal;

    const id = useId();
    const lowerId = `${id}-low`;
    const upperId = `${id}-high`;

    const clamp = (val: number, low: number, high: number) =>
        Math.min(Math.max(val, low), high);

    const commit = useCallback(
        (next: [number, number]) => {
            if (!isControlled) setInternal(next);
            onChange?.(next);
        },
        [isControlled, onChange],
    );

    const handleLower = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = Number(e.currentTarget.value);
            const nextLow = clamp(raw, min, upper);
            setInternal([nextLow, upper]);
        },
        [upper, commit, min],
    );

    const handleUpper = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = Number(e.currentTarget.value);
            const nextHigh = clamp(raw, lower, max);
            setInternal([lower, nextHigh]);
        },
        [lower, commit, max],
    );

    const commitNow = useCallback(() => {
        setDragging(false);
        commit([lower, upper]);
    }, [commit, lower, upper]);

    // защита от деления на ноль
    const range = max - min || 1;
    const pct = (v: number) => ((clamp(v, min, max) - min) / range) * 100;

    const trackBackground = `linear-gradient(to right,
      var(--bg-range-track) 0%,
      var(--bg-range-track) ${pct(lower)}%,
      var(--bg-range-fill)  ${pct(lower)}%,
      var(--bg-range-fill)  ${pct(upper)}%,
      var(--bg-range-track) ${pct(upper)}%,
      var(--bg-range-track) 100%)`;

    // n — ЦЕНТЫ, показываем в валюте
    const fmt = (n: number) =>
        Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currency === "€" ? "EUR" : currency,
            maximumFractionDigits: 0,
        }).format(n / 100);

    return (
        <div className={`${cls.priceRangeDual} ${className ?? ""}`}>
            <div className={cls.rangeWrapper} style={{ background: trackBackground }}>
                <input
                    id={lowerId}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={lower}
                    onChange={handleLower}
                    onPointerDown={() => setDragging(true)}
                    onPointerUp={commitNow}
                    onPointerCancel={commitNow}
                    onKeyUp={commitNow}
                    onMouseUp={commitNow}
                    onTouchEnd={commitNow}
                    className={cls.range}
                    aria-valuemin={min}
                    aria-valuemax={upper}
                    aria-valuenow={lower}
                />

                <input
                    id={upperId}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={upper}
                    onChange={handleUpper}
                    onPointerDown={() => setDragging(true)}
                    onPointerUp={commitNow}
                    onPointerCancel={commitNow}
                    onKeyUp={commitNow}
                    onMouseUp={commitNow}
                    onTouchEnd={commitNow}
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
