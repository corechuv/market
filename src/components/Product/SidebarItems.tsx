import React from "react";
import { useNavigate } from "react-router-dom";
import Accordion from "../../components/Product/Accordion";
import CheckboxGroup from "../../components/Product/CheckboxGroup";
import PriceRangeDual from "../../components/Product/PriceRangeDual";
import Stars from "../../components/Product/Stars";
import Button from "../../components/Buttons/Button";
import cls from "./SidebarItems.module.scss";

type SortOption = { value: string; label: string };
type Option = { value: string; label: string };

type SidebarItemsProps = {
    /** Десктопный сайдбар скрываем на мобильных, в модалке показываем всегда */
    variant?: "desktop" | "modal";
    /** Показать секцию сортировки внутри сайдбара */
    showSort?: boolean;
    /** Текущее значение сортировки (когда showSort=true) */
    sort?: string;
    /** Опции сортировки (когда showSort=true) */
    sortOptions?: SortOption[];
    /** Колбэк выбора сортировки (когда showSort=true) */
    onChangeSort?: (val: string) => void;

    /** Опции чекбоксов */
    offerings: Option[];
    stars: Option[];

    /** Параметры диапазона цен */
    priceRange?: {
        min: number;
        max: number;
        step?: number;
        defaultValue?: [number, number];
    };

    /** Колбэк сброса фильтров (опционально) */
    onResetFilters?: () => void;
};

const SidebarItems: React.FC<SidebarItemsProps> = ({
    variant = "desktop",
    showSort = false,
    sort,
    sortOptions = [],
    onChangeSort,
    offerings,
    stars,
    priceRange = { min: 0, max: 0, step: 1, defaultValue: [0, 0] },
    onResetFilters,
}) => {
    const nav = useNavigate();

    return (
        <aside className={[cls.sidebar, cls[variant]].join(" ")}>
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

            <Accordion title="PC Components" defaultOpen>
                <ul className={cls.sidebar__list}>
                    <li
                        className={cls.sidebar__item}
                        onClick={() => nav("/product/cpu")}
                    >
                        CPU
                        <ul className={cls.sidebar__sublist}>
                            <li
                                className={cls.sidebar__subitem}
                                onClick={() => nav("/product/cpu/i9-14900ks")}
                            >
                                i9-14900KS
                            </li>
                            <li
                                className={cls.sidebar__subitem}
                                onClick={() => nav("/product/cpu/xeon-silver-4")}
                            >
                                Xeon Silver 4
                            </li>
                        </ul>
                    </li>
                    <li className={cls.sidebar__item} onClick={() => nav("/product/gpu")}>
                        GPU
                    </li>
                    <li className={cls.sidebar__item} onClick={() => nav("/product/ram")}>
                        RAM
                    </li>
                    <li
                        className={cls.sidebar__item}
                        onClick={() => nav("/product/storage")}
                    >
                        Storage
                    </li>
                    <li
                        className={cls.sidebar__item}
                        onClick={() => nav("/product/motherboard")}
                    >
                        Motherboard
                    </li>
                    <li
                        className={cls.sidebar__item}
                        onClick={() => nav("/product/power-supply")}
                    >
                        Power Supply
                    </li>
                    <li
                        className={cls.sidebar__item}
                        onClick={() => nav("/product/cooling")}
                    >
                        Cooling
                    </li>
                    <li
                        className={cls.sidebar__item}
                        onClick={() => nav("/product/cases")}
                    >
                        Cases
                    </li>
                    <li
                        className={cls.sidebar__item}
                        onClick={() => nav("/product/peripherals")}
                    >
                        Peripherals
                    </li>
                </ul>
            </Accordion>

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
                        option.value === "6" ? null : (
                            <Stars size={16} value={Number(option.value)} />
                        )
                    }
                />
            </Accordion>

            <Button
                className={cls.resetButton}
                size="small"
                onClick={onResetFilters}
            >
                Reset filters
            </Button>
        </aside>
    );
};

export default React.memo(SidebarItems);
