// src/components/UI/SelectField.tsx
import React, { useEffect, useId, useRef, useState } from "react";
import cs from "./SelectField.module.scss";
import ArrowBottomIcon from "../Icons/ArrowBottomIcon";

export type SelectOption = {
    value: string;
    label: string;
    disabled?: boolean;
};

type CssSize = number | string;

export type SelectFieldProps = {
    label?: string;
    value?: string;
    onChange?: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    hint?: string;
    error?: string;
    id?: string;
    className?: string;
    disabled?: boolean;

    /** Ширина кнопки-селекта */
    minWidth?: CssSize;           // например: 160 | "12rem"
    maxWidth?: CssSize;           // например: 360 | "100%"

    /** Ширина выпадающего меню */
    dropdownMinWidth?: CssSize;   // по умолчанию совпадает с кнопкой
    dropdownMaxWidth?: CssSize;   // например: 480
    /** Показывать полный текст во всплывающей подсказке */
    showTitleOnHover?: boolean;   // по умолчанию true
};

const toCss = (v?: CssSize) =>
    typeof v === "number" ? `${v}px` : v;

export const SelectField: React.FC<SelectFieldProps> = ({
    label,
    value,
    onChange,
    options,
    placeholder = "— Выберите —",
    hint,
    error,
    id,
    className,
    disabled,

    minWidth,
    maxWidth,
    dropdownMinWidth,
    dropdownMaxWidth,
    showTitleOnHover = true,
}) => {
    const autoId = useId();
    const rootId = id ?? autoId;
    const listboxId = `${rootId}-listbox`;

    const btnRef = useRef<HTMLButtonElement | null>(null);
    const listRef = useRef<HTMLDivElement | null>(null);

    const [open, setOpen] = useState(false);
    const [focusIndex, setFocusIndex] = useState<number>(-1);

    const selectedIndex = Math.max(-1, options.findIndex((o) => o.value === value));
    const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

    // typeahead
    const [buffer, setBuffer] = useState("");
    const bufferTimer = useRef<number | null>(null);

    function commit(index: number) {
        const opt = options[index];
        if (!opt || opt.disabled) return;
        onChange?.(opt.value);
        setOpen(false);
        setTimeout(() => btnRef.current?.focus(), 0);
    }

    function move(delta: number) {
        if (!options.length) return;
        let i = focusIndex < 0 ? (selectedIndex >= 0 ? selectedIndex : -1) : focusIndex;
        for (let step = 0; step < options.length; step++) {
            i = (i + delta + options.length) % options.length;
            if (!options[i].disabled) {
                setFocusIndex(i);
                scrollIntoView(i);
                break;
            }
        }
    }

    function scrollIntoView(i: number) {
        const list = listRef.current;
        if (!list) return;
        const el = list.querySelector<HTMLElement>(`#${optionId(i)}`);
        if (!el) return;
        const { offsetTop, offsetHeight } = el;
        const { scrollTop, clientHeight } = list;
        if (offsetTop < scrollTop) list.scrollTop = offsetTop;
        else if (offsetTop + offsetHeight > scrollTop + clientHeight)
            list.scrollTop = offsetTop + offsetHeight - clientHeight;
    }

    const optionId = (i: number) => `${rootId}-opt-${i}`;

    function handleKeyDown(e: React.KeyboardEvent) {
        if (disabled) return;
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                if (!open) {
                    setOpen(true);
                    setTimeout(() => setFocusIndex(selectedIndex >= 0 ? selectedIndex : 0), 0);
                } else move(1);
                break;
            case "ArrowUp":
                e.preventDefault();
                if (!open) {
                    setOpen(true);
                    setTimeout(
                        () => setFocusIndex(selectedIndex >= 0 ? selectedIndex : options.length - 1),
                        0
                    );
                } else move(-1);
                break;
            case "Home":
                e.preventDefault();
                if (!open) setOpen(true);
                setFocusIndex(0);
                scrollIntoView(0);
                break;
            case "End":
                e.preventDefault();
                if (!open) setOpen(true);
                setFocusIndex(options.length - 1);
                scrollIntoView(options.length - 1);
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                if (!open) {
                    setOpen(true);
                    setTimeout(() => setFocusIndex(selectedIndex >= 0 ? selectedIndex : 0), 0);
                } else if (focusIndex >= 0) {
                    commit(focusIndex);
                }
                break;
            case "Escape":
                if (open) {
                    e.preventDefault();
                    setOpen(false);
                    setTimeout(() => btnRef.current?.focus(), 0);
                }
                break;
            default: {
                if (e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey) {
                    const next = (buffer + e.key).toLowerCase();
                    setBuffer(next);
                    if (bufferTimer.current) window.clearTimeout(bufferTimer.current);
                    bufferTimer.current = window.setTimeout(() => setBuffer(""), 600);
                    const idx = options.findIndex(
                        (o) => !o.disabled && o.label.toLowerCase().startsWith(next)
                    );
                    if (idx >= 0) {
                        if (!open) setOpen(true);
                        setFocusIndex(idx);
                        scrollIntoView(idx);
                    }
                }
            }
        }
    }

    // клик вне — закрываем
    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!open) return;
            const t = e.target as Node;
            if (!btnRef.current?.contains(t) && !listRef.current?.contains(t)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [open]);

    // при открытии — фокус на выбранном
    useEffect(() => {
        if (open) {
            const i = selectedIndex >= 0 ? selectedIndex : 0;
            setFocusIndex(i);
            setTimeout(() => scrollIntoView(i), 0);
        }
    }, [open]); // eslint-disable-line

    const showLabel = selected?.label ?? placeholder;

    // Прокидываем CSS-переменные для размеров
    const vars: React.CSSProperties = {
        // для кнопки
        ["--sf-min-w" as any]: toCss(minWidth),
        ["--sf-max-w" as any]: toCss(maxWidth),
        // для дропдауна
        ["--sf-dd-min-w" as any]: toCss(dropdownMinWidth),
        ["--sf-dd-max-w" as any]: toCss(dropdownMaxWidth),
    };

    return (
        <div className={[cs.field, className || ""].join(" ")}>
            {label && (
                <label className={cs.label} id={`${rootId}-label`}>
                    {label}
                </label>
            )}

            <div className={cs.root} style={vars}>
                <button
                    ref={btnRef}
                    type="button"
                    className={[cs.control, error ? cs.controlError : "", disabled ? cs.controlDisabled : ""].join(" ")}
                    aria-labelledby={`${rootId}-label`}
                    role="combobox"
                    aria-controls={listboxId}
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    aria-activedescendant={open && focusIndex >= 0 ? optionId(focusIndex) : undefined}
                    onKeyDown={handleKeyDown}
                    onClick={() => !disabled && setOpen((v) => !v)}
                    disabled={disabled}
                    // Полный текст подсказкой
                    title={showTitleOnHover ? showLabel : undefined}
                >
                    <span className={[cs.value, !selected && cs.placeholder].join(" ")}>
                        {showLabel}
                    </span>
                    <span className={cs.chevron} aria-hidden>
                        <ArrowBottomIcon />
                    </span>
                </button>

                {open && (
                    <div
                        ref={listRef}
                        id={listboxId}
                        role="listbox"
                        className={cs.listbox}
                        tabIndex={-1}
                        aria-labelledby={`${rootId}-label`}
                        onKeyDown={handleKeyDown}
                    >
                        {options.map((o, i) => {
                            const isSel = i === selectedIndex;
                            const isFocus = i === focusIndex;
                            return (
                                <div
                                    key={o.value}
                                    id={optionId(i)}
                                    role="option"
                                    aria-selected={isSel}
                                    aria-disabled={o.disabled || undefined}
                                    className={[
                                        cs.option,
                                        isSel ? cs.optionSelected : "",
                                        isFocus ? cs.optionFocused : "",
                                        o.disabled ? cs.optionDisabled : "",
                                    ].join(" ")}
                                    onMouseEnter={() => setFocusIndex(i)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => !o.disabled && commit(i)}
                                    title={showTitleOnHover ? o.label : undefined}
                                >
                                    {o.label}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {hint && <div className={cs.hint}>{hint}</div>}
            {error && (
                <div className={cs.error} role="alert">
                    {error}
                </div>
            )}
        </div>
    );
};
