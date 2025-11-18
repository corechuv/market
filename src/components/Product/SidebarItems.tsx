import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Accordion from "../UI/Accordion";
import CheckboxGroup from "../../components/Product/CheckboxGroup";
import PriceRangeDual from "../../components/Product/PriceRangeDual";
import Button from "../UI/Button";
import cls from "./SidebarItems.module.scss";

import {
    getRootCategories,
    getCategoryByFullSlug,
    getBreadcrumbs,
    getChildren,
} from "../../services/categoryService";

type SortOption = { value: string; label: string };
type Option = { value: string; label: string };

type SidebarItemsProps = {
    variant?: "desktop" | "modal";
    showSort?: boolean;
    sort?: string;
    sortOptions?: SortOption[];
    onChangeSort?: (val: string) => void;
    showCategories?: boolean;
    /** текущая категория вида "/electronics/computers/cpu" */
    currentCategoryFullSlug?: string;

    offerings: Option[];
    stars: Option[];
    priceRange?: {
        min: number;
        max: number;
        step?: number;
        defaultValue?: [number, number];
    };

    // НОВЫЕ коллбеки фильтров
    onChangePriceRange?: (min: number, max: number) => void;
    onToggleSaleOnly?: (value: boolean) => void;
    onToggleNewArrivalsOnly?: (value: boolean) => void;
    onChangeMinRating?: (value: number | null) => void;

    onResetFilters?: () => void;
};

const RATING_ALL_VALUE = "6"; // "Select all"

const SidebarItems: React.FC<SidebarItemsProps> = ({
    variant = "desktop",
    showSort = false,
    sort,
    sortOptions = [],
    onChangeSort,
    showCategories = true,
    currentCategoryFullSlug,
    offerings,
    stars,
    priceRange = { min: 0, max: 0, step: 1, defaultValue: [0, 0] },
    onChangePriceRange,
    onToggleSaleOnly,
    onToggleNewArrivalsOnly,
    onChangeMinRating,
    onResetFilters,
}) => {
    const nav = useNavigate();
    const go = (fullSlug?: string) => fullSlug && nav(`/category${fullSlug}`);

    // --- Рейтинг: локальное состояние выбранных чекбоксов ---
    // По умолчанию: выбраны "all" + все звёзды (то есть реально всё отмечено)
    const [ratingSelected, setRatingSelected] = useState<string[]>(() =>
        stars.map((s) => s.value)
    );

    // 1) Текущая категория (если есть)
    const currentCat = useMemo(
        () =>
            currentCategoryFullSlug
                ? getCategoryByFullSlug(currentCategoryFullSlug)
                : undefined,
        [currentCategoryFullSlug]
    );

    // 2) Всегда берём корень «Электроника»
    const electronicsRoot = useMemo(() => {
        const roots = getRootCategories();
        return roots.find((r) => r.slug === "electronics") ?? roots[0];
    }, []);

    // 3) Список 2-го уровня = дети «Электроника»
    const level2 = useMemo(
        () => (electronicsRoot ? getChildren(electronicsRoot.id) : []),
        [electronicsRoot]
    );

    // 4) Определяем активный L2 по крошкам (если мы в L2 или L3)
    const activeL2 = useMemo(() => {
        if (!currentCat || !electronicsRoot) return undefined;
        const chain = getBreadcrumbs(currentCat.id); // [root, L2?, L3?]
        return chain.find((c) => c.parentId === electronicsRoot.id);
    }, [currentCat, electronicsRoot]);

    // 5) Список 3-го уровня = дети активной L2
    const level3 = useMemo(
        () => (activeL2 ? getChildren(activeL2.id) : []),
        [activeL2]
    );

    const isActiveL2 = (id?: string) => !!activeL2 && id === activeL2.id;
    const isActiveL3 = (id?: string) => !!currentCat && id === currentCat.id;

    // --- Логика "Select all" для рейтинга ---
    const handleRatingChange = (next: string[]) => {
        const prev = ratingSelected;
        const allValue = RATING_ALL_VALUE;

        const starValues = stars
            .map((s) => s.value)
            .filter((v) => v !== allValue); // ["5","4","3","2","1"]

        // Находим, какой именно чекбокс изменился
        let changed: string | null = null;
        const union = Array.from(new Set([...prev, ...next]));
        for (const v of union) {
            const inPrev = prev.includes(v);
            const inNext = next.includes(v);
            if (inPrev !== inNext) {
                changed = v;
                break;
            }
        }

        if (!changed) {
            return;
        }

        let result: string[] = [];

        if (changed === allValue) {
            // Клик по "Select all"
            const wasSelected = prev.includes(allValue);
            if (wasSelected) {
                // Был включен → выключаем вообще всё
                result = [];
            } else {
                // Включили "all" → ставим all + ВСЕ звёзды
                result = [allValue, ...starValues];
            }
        } else {
            // Кликнули по конкретной звезде
            const prevWithoutAll = prev.filter((v) => v !== allValue);
            const wasSelected = prevWithoutAll.includes(changed);

            if (wasSelected) {
                // Выключаем одну звезду → просто убираем её и точно убираем all
                const childrenSelected = prevWithoutAll.filter((v) => v !== changed);
                result = childrenSelected;
            } else {
                // Включаем звезду
                const set = new Set(prevWithoutAll);
                set.add(changed);
                const childrenSelected = Array.from(set);

                if (childrenSelected.length === starValues.length) {
                    // Все звёзды выбраны → автоматически считаем, что "all" тоже включён
                    result = [allValue, ...starValues];
                } else {
                    // Частичный набор → без "all"
                    result = childrenSelected;
                }
            }
        }

        setRatingSelected(result);

        // 🚩 Пересчитываем порог рейтинга для родителя
        // Если пусто или включён "all" → без фильтра
        if (!result.length || result.includes(allValue)) {
            onChangeMinRating?.(null);
            return;
        }

        const nums = result
            .map((v) => parseInt(v, 10))
            .filter((n) => !Number.isNaN(n));

        if (!nums.length) {
            onChangeMinRating?.(null);
            return;
        }

        const min = Math.min(...nums);
        onChangeMinRating?.(min);
    };

    return (
        <aside className={[cls.sidebar, cls[variant]].join(" ")}>
            <div className={cls.actions}>
                <Button
                    className={cls.resetButton}
                    variant="primary"
                    size="small"
                    onClick={onResetFilters}
                >
                    Reset filters
                </Button>
            </div>

            {showSort && (
                <Accordion title="Sort by" defaultOpen>
                    <ul className={cls.sidebar__list}>
                        {sortOptions.map((o) => (
                            <li
                                key={o.value}
                                className={[
                                    cls.sidebar__item,
                                    sort === o.value ? cls.activeItem : "",
                                ].join(" ")}
                                onClick={() => onChangeSort?.(o.value)}
                            >
                                {o.label}
                            </li>
                        ))}
                    </ul>
                </Accordion>
            )}

            {showCategories && electronicsRoot && (
                <Accordion title={electronicsRoot.name} defaultOpen>
                    {/* UL: всегда рисуем 2-й уровень (дети Электроники) */}
                    <ul className={cls.sidebar__list}>
                        {level2.map((l2) => (
                            <li key={l2.id} className={cls.sidebar__item}>
                                <a
                                    type="button"
                                    className={[
                                        cls.catButton,
                                        isActiveL2(l2.id) ? cls.activeItem : "",
                                    ].join(" ")}
                                    onClick={() => go(l2.fullSlug)}
                                >
                                    {l2.name}
                                </a>

                                {/* Если этот L2 активен — под ним выводим его 3-й уровень */}
                                {isActiveL2(l2.id) && level3.length > 0 && (
                                    <ul className={cls.sidebar__sublist}>
                                        {level3.map((l3) => (
                                            <li key={l3.id} className={cls.sidebar__subitem}>
                                                <a
                                                    type="button"
                                                    className={[
                                                        cls.catButton,
                                                        isActiveL3(l3.id) ? cls.activeItem : "",
                                                    ].join(" ")}
                                                    onClick={() => go(l3.fullSlug)}
                                                >
                                                    {l3.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </Accordion>
            )}

            <Accordion title="Price" defaultOpen>
                <PriceRangeDual
                    min={priceRange.min}
                    max={priceRange.max}
                    step={priceRange.step ?? 1}
                    defaultValue={priceRange.defaultValue ?? [0, 0]}
                    onChange={(values: [number, number]) =>
                        onChangePriceRange?.(values[0], values[1])
                    }
                />
            </Accordion>

            <Accordion title="Offer" defaultOpen>
                <CheckboxGroup
                    options={offerings}
                    defaultValue={[]}
                    onChange={(vals) => {
                        const hasSale = vals.includes("sale");
                        const hasNew = vals.includes("new");
                        onToggleSaleOnly?.(hasSale);
                        onToggleNewArrivalsOnly?.(hasNew);
                    }}
                    direction="vertical"
                />
            </Accordion>

            <Accordion title="Rating" defaultOpen>
                <CheckboxGroup
                    options={stars}
                    value={ratingSelected}
                    onChange={handleRatingChange}
                    direction="vertical"
                    contentRenderer={(option) =>
                        option.value === RATING_ALL_VALUE ? null : (
                            <span>{Number(option.value)}/5</span>
                        )
                    }
                />
            </Accordion>
        </aside>
    );
};

export default React.memo(SidebarItems);
