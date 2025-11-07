// src/components/UI/SearchField.tsx
import React, { useCallback } from "react";
import CloseIcon from "../Icons/CloseIcon";
import SearchIcon from "../Icons/SearchIcon";
import c from "./SearchField.module.scss";
import { getSearchStatus, type SearchStatusMessages } from "../../utils/searchStatus";

export interface SearchFieldProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
    value: string;
    backgroundColor?: string;
    onChange: (value: string) => void;
    /** Вызывается по Enter */
    onEnter?: () => void;
    /** Вызывается по Escape */
    onEscape?: () => void;
    /** Данные для построения статуса (необязательны, если статус не нужен) */
    loading?: boolean;
    error?: unknown;
    resultsLength?: number;
    /** Переопределение текстов (i18n) */
    messages?: Partial<SearchStatusMessages>;
    /** Спрятать строку статуса, если не нужна */
    hideStatus?: boolean;
    /** Поведение aria-live для статуса */
    statusAriaLive?: "polite" | "assertive" | "off";
}

const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
    (
        {
            backgroundColor = "var(--bg)",
            value,
            onChange,
            onEnter,
            onEscape,
            loading,
            error,
            resultsLength,
            messages,
            hideStatus,
            statusAriaLive = "polite",
            onKeyDown,
            ...inputProps
        },
        ref
    ) => {
        const clear = useCallback(() => onChange(""), [onChange]);

        const handleKeyDown = useCallback<React.KeyboardEventHandler<HTMLInputElement>>(
            (e) => {
                if (e.key === "Enter") onEnter?.();
                if (e.key === "Escape") {
                    onEscape?.();
                    clear();
                    (e.currentTarget as HTMLInputElement).blur();
                }
                // пробрасываем оригинальный onKeyDown, если был
                onKeyDown?.(e);
            },
            [onEnter, onEscape, clear, onKeyDown]
        );

        const statusText =
            hideStatus
                ? ""
                : getSearchStatus({
                    query: value,
                    loading,
                    error,
                    resultsLength,
                    messages,
                });

        return (
            <div className={c.topbar}>
                <div className={c.topbar__panel}>
                    <SearchIcon className={c["topbar__panel--icon"]} />
                    <input
                        ref={ref}
                        className={c["topbar__panel--input"]}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        inputMode="search"
                        {...inputProps}
                    />
                    {value && (
                        <CloseIcon onClick={clear} className={c["topbar__panel--clear"]} />
                    )}
                </div>

                {!hideStatus && (
                    <section
                        className={c.topbar__meta}
                        data-search="status"
                        role="status"
                        aria-live={statusAriaLive}
                    >
                        {statusText}
                    </section>
                )}
            </div>
        );
    }
);

SearchField.displayName = "SearchField";
export default SearchField;
