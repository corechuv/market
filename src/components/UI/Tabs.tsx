// src/components/UI/Tabs.tsx
import React, { useEffect, useMemo, useRef } from "react";
import cls from "./Tabs.module.scss"

export type TabItem<K extends string = string> = {
    key: K;
    label: React.ReactNode;
    disabled?: boolean;
};

export type TabsProps<K extends string = string> = {
    /** Tabs to render */
    items: TabItem<K>[];
    /** Controlled active key */
    activeKey: K;
    /** Change handler */
    onChange: (key: K) => void;
    /** Optional ARIA label(s) */
    ariaLabel?: string;
    background?: React.CSSProperties["background"];
};

function classNames(...xs: Array<string | false | undefined | null>) {
    return xs.filter(Boolean).join(" ");
}

export function Tabs<K extends string = string>({
    items,
    activeKey,
    onChange,
    ariaLabel,
    background,
}: TabsProps<K>) {
    const normalized = useMemo(() => items.filter(Boolean), [items]);
    const keys = useMemo(() => normalized.map((i) => i.key), [normalized]);

    // Refs for keyboard navigation (works for both variants)
    const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);
    btnRefs.current = [];

    // Ensure active stays valid if items change
    useEffect(() => {
        if (!keys.includes(activeKey) && keys.length > 0) {
            onChange(keys[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keys.join("|")]);

    function onKeyNav(e: React.KeyboardEvent, idx: number, orientation: "horizontal" | "vertical") {
        const max = keys.length - 1;
        let next = idx;
        if (orientation === "horizontal") {
            if (e.key === "ArrowRight") next = Math.min(max, idx + 1);
            if (e.key === "ArrowLeft") next = Math.max(0, idx - 1);
        } else {
            if (e.key === "ArrowDown") next = Math.min(max, idx + 1);
            if (e.key === "ArrowUp") next = Math.max(0, idx - 1);
        }
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = max;

        if (next !== idx) {
            e.preventDefault();
            const nextKey = keys[next];
            const item = normalized[next];
            if (!item?.disabled) onChange(nextKey);
            btnRefs.current[next]?.focus();
        }
    }

    const style: React.CSSProperties = {
        background: background ?? "var(--bg)",
    };

    const Chips = (
        <div
            className={`${cls.tabsMobile}`}
            style={style}
            role="tablist"
            aria-label={ariaLabel || "Tabs"}
        >
            {normalized.map((t, i) => (
                <button
                    key={String(t.key)}
                    role="tab"
                    type="button"
                    ref={(el) => { (btnRefs.current[i] = el); }}
                    aria-selected={keys[i] === activeKey}
                    aria-disabled={t.disabled || undefined}
                    className={
                        classNames(cls.chip,
                            (keys[i] === activeKey) && cls.chipActive,
                        )}
                    onClick={() => !t.disabled && onChange(t.key)}
                    onKeyDown={(e) => onKeyNav(e, i, "horizontal")}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
    return (
        <div className={cls.tabs}>
            {Chips}
        </div>
    );
}

export default Tabs;
