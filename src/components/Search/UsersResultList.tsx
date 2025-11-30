// src/components/Search/UserResultsList.tsx
import React from "react";
import c from "./SearchResultList.module.scss";

export interface BaseUserListItem {
    name: string;
    username?: string;
    photoUrl?: string | null;
}

export type KeyGetter<T> = (item: T, index: number) => React.Key;

export interface UserResultsListProps<T extends BaseUserListItem> {
    items: T[];
    getKey?: KeyGetter<T>;
    onSelect?: (item: T, index: number) => void;

    /** UI/state */
    loading?: boolean;
    skeletonRows?: number;

    /** ARIA */
    role?: "listbox" | "menu" | "list";
    ariaLabel?: string;
    listId?: string; // чтобы связать с aria-controls у поля ввода

    /** Подсветка активного элемента (для вариантa с клавиатурной навигацией) */
    activeIndex?: number;
    onActiveIndexChange?: (index: number) => void;
}

function UserResultsList<T extends BaseUserListItem>({
    items,
    getKey,
    onSelect,

    loading = false,
    skeletonRows = 6,

    role = "listbox",
    ariaLabel = "Search results",
    listId,

    activeIndex = -1,
    onActiveIndexChange,
}: UserResultsListProps<T>) {
    // когда вообще ничего нет и не грузимся — ничего не рендерим
    if (!loading && items.length === 0) return null;

    const handleSelect = (item: T, index: number) => {
        onSelect?.(item, index);
    };

    const skeletonItems = Array.from({ length: skeletonRows }).map((_, i) => (
        <li key={`skeleton-${i}`} className={c.list__item}>
            <span className={c.skeleton} aria-hidden="true">
                &nbsp;
            </span>
        </li>
    ));

    // 👉 первая загрузка: только скелеты
    if (loading && items.length === 0) {
        return (
            <ul
                className={c.list}
                role={role}
                aria-label={ariaLabel}
                id={listId}
            >
                {skeletonItems}
            </ul>
        );
    }

    // 👉 есть данные; при новом запросе оставляем данные и добавляем скелеты снизу
    return (
        <ul
            className={c.list}
            role={role}
            aria-label={ariaLabel}
            id={listId}
        >
            {items.map((item, idx) => {
                const key = getKey ? getKey(item, idx) : (idx as React.Key);
                const isActive = idx === activeIndex;

                return (
                    <li
                        key={key}
                        id={listId ? `${listId}-opt-${idx}` : undefined}
                        className={c.list__item}
                        role="option"
                        aria-selected={isActive || undefined}
                        data-active={isActive || undefined}
                        tabIndex={0}
                        onMouseEnter={() => onActiveIndexChange?.(idx)}
                        onMouseLeave={() => onActiveIndexChange?.(-1)}
                        onMouseDown={(e) => {
                            // чтобы не терять фокус у инпута при клике
                            e.preventDefault();
                            handleSelect(item, idx);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleSelect(item, idx);
                            }
                        }}
                    >
                        {item.photoUrl ? (
                            <img
                                src={item.photoUrl}
                                className={c["list__item--photo"]}
                                alt=""
                            />
                        ) : (
                            <div className={c["list__item--placeholder"]}></div>
                        )}
                        <div className={c["list__item--col"]}>
                            <span
                                className={c["list__item--label"]}
                                data-search="item-label"
                                title={item.name}
                            >
                                {item.name}
                            </span>
                            {item.username && (
                                <span
                                    className={c["list__item--label--s"]}
                                    data-search="item-label"
                                    title={item.username}
                                >
                                    @{item.username}
                                </span>
                            )}
                        </div>
                    </li>
                );
            })}

            {loading && skeletonItems}
        </ul>
    );
}

export default UserResultsList;
