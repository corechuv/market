// src/components/Search/SearchResultList.tsx
import React from "react"
import c from "./SearchResultList.module.scss"
import SearchIcon from "../Icons/SearchIcon";

export type KeyGetter<T> = (item: T, index: number) => React.Key;
export type LabelGetter<T> = (item: T) => string;

export interface SearchResultsListProps<T> {
    items: T[];
    getKey?: KeyGetter<T>;
    getLabel: LabelGetter<T>;
    onSelect?: (item: T, index: number) => void;

    /** UI/state */
    loading?: boolean;
    skeletonRows?: number;

    /** ARIA */
    role?: "listbox" | "menu" | "list";
    ariaLabel?: string;
    listId?: string; // чтобы связать с aria-controls у поля ввода

    /** Подсветка активного элемента (для варианта с клавиатурной навигацией) */
    activeIndex?: number;
    onActiveIndexChange?: (index: number) => void;
}

function SearchResultsList<T>({
    items,
    getKey,
    getLabel,
    onSelect,

    loading = false,
    skeletonRows = 6,

    role = "listbox",
    ariaLabel = "Search results",
    listId,

    activeIndex = -1,
    onActiveIndexChange,
}: SearchResultsListProps<T>) {
    // Ничего не рендерим, когда нет данных и не грузимся (чтобы не мусорить в DOM)
    if (!loading && items.length === 0) return null;

    const handleSelect = (item: T, index: number) => {
        onSelect?.(item, index);
    };

    return (
        <ul className={c.list}
            role={role}
            aria-label={ariaLabel}
            id={listId}
        >
            {loading
                ? Array.from({ length: skeletonRows }).map((_, i) => (
                    <li key={`skeleton-${i}`} className={c.list__item}>
                        <span className={`${c.skeleton}`} aria-hidden="true">&nbsp;</span>
                    </li>
                ))
                : items.map((item, idx) => {
                    const key = getKey ? getKey(item, idx) : (idx as React.Key);
                    const label = getLabel(item);
                    const isActive = idx === activeIndex;

                    return (
                        <li key={key}
                            id={listId ? `${listId}-opt-${idx}` : undefined}
                            className={c.list__item}
                            role="option"
                            aria-selected={isActive || undefined}
                            data-active={isActive || undefined}
                            tabIndex={0}
                            onMouseEnter={() => onActiveIndexChange?.(idx)}
                            onMouseLeave={() => onActiveIndexChange?.(-1)}
                            onClick={() => handleSelect(item, idx)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleSelect(item, idx);
                                }
                            }}
                        >
                            <SearchIcon />
                            <span className={c["list__item--label"]}
                                data-search="item-label">{label}</span>
                        </li>
                    );
                })}
        </ul>
    );
}

export default SearchResultsList;
