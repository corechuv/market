import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Accordion from "../../components/Product/Accordion";
import CheckboxGroup from "../../components/Product/CheckboxGroup";
import PriceRangeDual from "../../components/Product/PriceRangeDual";
import Stars from "../../components/Product/Stars";
import Button from "../../components/Buttons/Button";
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
    priceRange?: { min: number; max: number; step?: number; defaultValue?: [number, number]; };
    onResetFilters?: () => void;
};

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
    onResetFilters,
}) => {
    const nav = useNavigate();
    const go = (fullSlug?: string) => fullSlug && nav(`/category${fullSlug}`);

    // 1) Текущая категория (если есть)
    const currentCat = useMemo(
        () => (currentCategoryFullSlug ? getCategoryByFullSlug(currentCategoryFullSlug) : undefined),
        [currentCategoryFullSlug]
    );

    // 2) Всегда берём корень «Электроника» (если несколько корней, найдём по slug, иначе берём первый)
    const electronicsRoot = useMemo(() => {
        const roots = getRootCategories();
        return roots.find(r => r.slug === "electronics") ?? roots[0];
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
        // ищем первую категорию, у которой родитель = electronicsRoot
        return chain.find(c => c.parentId === electronicsRoot.id);
    }, [currentCat, electronicsRoot]);

    // 5) Список 3-го уровня = дети активной L2
    const level3 = useMemo(
        () => (activeL2 ? getChildren(activeL2.id) : []),
        [activeL2]
    );

    const isActiveL2 = (id?: string) => !!activeL2 && id === activeL2.id;
    const isActiveL3 = (id?: string) => !!currentCat && id === currentCat.id;

    return (
        <aside className={[cls.sidebar, cls[variant]].join(" ")}>
            {showSort && (
                <Accordion title="Sort by" defaultOpen>
                    <ul className={cls.sidebar__list}>
                        {sortOptions.map((o) => (
                            <li
                                key={o.value}
                                className={[cls.sidebar__item, sort === o.value ? cls.activeItem : ""].join(" ")}
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
                                    className={[cls.catButton, isActiveL2(l2.id) ? cls.activeItem : ""].join(" ")}
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
                                                    className={[cls.catButton, isActiveL3(l3.id) ? cls.activeItem : ""].join(" ")}
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
                />
            </Accordion>

            <Accordion title="Offer" defaultOpen>
                <CheckboxGroup
                    options={offerings}
                    defaultValue={[""]}
                    onChange={(vals) => console.log("Selected:", vals)}
                    direction="vertical"
                />
            </Accordion>

            <Accordion title="Rating" defaultOpen>
                <CheckboxGroup
                    options={stars}
                    defaultValue={[""]}
                    onChange={(vals) => console.log("Selected:", vals)}
                    direction="vertical"
                    contentRenderer={(option) =>
                        option.value === "6" ? null : <Stars size={16} value={Number(option.value)} />
                    }
                />
            </Accordion>

            <Button className={cls.resetButton} size="small" onClick={onResetFilters}>
                Reset filters
            </Button>
        </aside>
    );
};

export default React.memo(SidebarItems);
