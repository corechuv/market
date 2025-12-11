// src/components/Product/SidebarItems.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Accordion from "../UI/Accordion";
import CheckboxGroup from "../../components/Product/CheckboxGroup";
import PriceRangeDual from "../../components/Product/PriceRangeDual";
import Button from "../UI/Button";
import cls from "./SidebarItems.module.scss";
import type { AttributeFacet } from "../../services/productService";

import {
  getRootCategories,
  getCategoryByFullSlug,
  getBreadcrumbs,
  getChildren,
  subscribe,
} from "../../services/categoryService";

import { useTranslation } from "react-i18next";

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

  // facets по атрибутам
  attributeFacets?: AttributeFacet[];
  selectedAttributeValues?: Record<string, string[]>;
  onChangeAttributeValues?: (code: string, values: string[]) => void;

  // коллбеки фильтров
  onChangePriceRange?: (min: number, max: number) => void;
  onToggleSaleOnly?: (value: boolean) => void;
  onToggleNewArrivalsOnly?: (value: boolean) => void;
  onChangeMinRating?: (value: number | null) => void;

  onResetFilters?: () => void;
};

const RATING_ALL_VALUE = "6"; // "Select all"

function normalizeFullSlug(s?: string) {
  if (!s) return undefined;
  const trimmed = s.trim();
  if (!trimmed) return undefined;
  return "/" + trimmed.replace(/^\/+/, "");
}

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
  attributeFacets = [],
  selectedAttributeValues = {},
  onChangeAttributeValues,
}) => {
  const { t } = useTranslation("products");
  const nav = useNavigate();
  const go = (fullSlug?: string) => fullSlug && nav(`/category${fullSlug}`);

  // ✅ триггер перерендера при обновлении индекса категорий
  const [catsVersion, setCatsVersion] = useState(0);
  useEffect(() => {
    return subscribe(() => setCatsVersion((v) => v + 1));
  }, []);

  // --- Рейтинг: локальное состояние выбранных чекбоксов ---
  const [ratingSelected, setRatingSelected] = useState<string[]>(() =>
    stars.map((s) => s.value)
  );

  // 1) Нормализованный fullSlug текущей категории
  const normalizedCurrentFullSlug = useMemo(
    () => normalizeFullSlug(currentCategoryFullSlug),
    [currentCategoryFullSlug]
  );

  // 2) Текущая категория (если есть)
  const currentCat = useMemo(
    () =>
      normalizedCurrentFullSlug
        ? getCategoryByFullSlug(normalizedCurrentFullSlug)
        : undefined,
    [normalizedCurrentFullSlug, catsVersion]
  );

  // 3) Все корневые категории
  const roots = useMemo(() => getRootCategories(), [catsVersion]);

  // 4) Активный root по крошкам
  const activeRoot = useMemo(() => {
    if (!currentCat) return undefined;
    const chain = getBreadcrumbs(currentCat.id); // [root, L2?, L3?]
    return chain[0];
  }, [currentCat, catsVersion]);

  const isActiveRoot = (id?: string) => !!activeRoot && id === activeRoot.id;

  // 5) Активный L2 по крошкам
  const activeL2 = useMemo(() => {
    if (!currentCat || !activeRoot) return undefined;
    const chain = getBreadcrumbs(currentCat.id);
    return chain.find((c) => c.parentId === activeRoot.id);
  }, [currentCat, activeRoot, catsVersion]);

  const isActiveL2 = (id?: string) => !!activeL2 && id === activeL2.id;
  const isActiveL3 = (id?: string) => !!currentCat && id === currentCat.id;

  // 6) L3 = дети активного L2
  const level3 = useMemo(
    () => (activeL2 ? getChildren(activeL2.id) : []),
    [activeL2, catsVersion]
  );

  // --- Логика "Select all" для рейтинга ---
  const handleRatingChange = (next: string[]) => {
    const prev = ratingSelected;
    const allValue = RATING_ALL_VALUE;

    const starValues = stars
      .map((s) => s.value)
      .filter((v) => v !== allValue);

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

    if (!changed) return;

    let result: string[] = [];

    if (changed === allValue) {
      const wasSelected = prev.includes(allValue);
      if (wasSelected) {
        result = [];
      } else {
        result = [allValue, ...starValues];
      }
    } else {
      const prevWithoutAll = prev.filter((v) => v !== allValue);
      const wasSelected = prevWithoutAll.includes(changed);

      if (wasSelected) {
        result = prevWithoutAll.filter((v) => v !== changed);
      } else {
        const set = new Set(prevWithoutAll);
        set.add(changed);
        const childrenSelected = Array.from(set);

        if (childrenSelected.length === starValues.length) {
          result = [allValue, ...starValues];
        } else {
          result = childrenSelected;
        }
      }
    }

    setRatingSelected(result);

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
        <Button variant="primary" size="small" onClick={onResetFilters}>
          {t("filters.reset")}
        </Button>
      </div>

      {showSort && (
        <Accordion title={t("sort.title")} defaultOpen>
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

      {/* ✅ МУЛЬТИ-ROOT КАТЕГОРИИ */}
      {showCategories && roots.length > 0 && (
        <Accordion
          title={t("filters.categoriesTitle", { defaultValue: "Категории" })}
          defaultOpen
        >
          <ul className={cls.sidebar__list}>
            {roots.map((root) => {
              const level2 = getChildren(root.id);
              const rootActive = isActiveRoot(root.id);

              return (
                <li key={root.id} className={cls.sidebar__item}>
                  <a
                    type="button"
                    className={[
                      cls.catButton,
                      rootActive ? cls.activeItem : "",
                    ].join(" ")}
                    onClick={() => go(root.fullSlug)}
                  >
                    {root.name}
                  </a>

                  {/* L2 показываем только у активного root */}
                  {rootActive && level2.length > 0 && (
                    <ul className={cls.sidebar__sublist}>
                      {level2.map((l2) => (
                        <li key={l2.id} className={cls.sidebar__subitem}>
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

                          {/* L3 показываем только у активного L2 */}
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
                  )}
                </li>
              );
            })}
          </ul>
        </Accordion>
      )}

      <Accordion title={t("filters.priceTitle")} defaultOpen>
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

      <Accordion title={t("filters.offerTitle")} defaultOpen>
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

      {/* Динамические фильтры по атрибутам */}
      {attributeFacets.map((facet) => (
        <Accordion key={facet.code} title={facet.label} defaultOpen>
          <CheckboxGroup
            options={facet.options.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
            value={selectedAttributeValues[facet.code] ?? []}
            onChange={(vals) => onChangeAttributeValues?.(facet.code, vals)}
            direction="vertical"
          />
        </Accordion>
      ))}

      <Accordion title={t("filters.ratingTitle")} defaultOpen>
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
