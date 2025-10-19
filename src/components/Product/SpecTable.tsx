// src/components/Product/SpecTable.tsx
import React, { memo, useMemo } from "react";
import styles from "./SpecTable.module.scss";

/**
 * Универсальная таблица характеристик товара (key→value), с группировками.
 * — Без сторонних библиотек
 * — TypeScript типы
 * — Адаптивная, доступная (semantic <table>)
 * — Нормализация входных данных (array | Record)
 * — Сортировка по приоритетам и группам
 * — Форматирование чисел/булевых, единицы измерения, многозначность
 * — Лёгкая «подвязка» к произвольной модели товара через helper buildSpecsFromProduct
 */

// ───────────────────────── Types ─────────────────────────
export type SpecPrimitive = string | number | boolean | null | undefined;
export type SpecValue = SpecPrimitive | Array<string | number>;

export type SpecEntry = {
    /** Машинный ключ (используется для маппинга, тестов, аналитики) */
    key: string;
    /** Человекочитаемый ярлык, если не задан — генерируется из key или словаря */
    label?: string;
    /** Значение; null/undefined/"" считаются пустыми */
    value: SpecValue;
    /** Единица измерения, например "ГБ", "мм" */
    unit?: string;
    /** Группа (раздел), например "Дисплей", "Аккумулятор" */
    group?: string;
    /** Подсказка (title-атрибут на ячейке значения) */
    tooltip?: string;
    /** Чем меньше число — тем выше в списке */
    priority?: number;
    /** Если значение — ссылка */
    href?: string;
    /** Скрыть строку принудительно */
    hidden?: boolean;
    /** Подсветить строку (например, ключевые ТТХ) */
    highlight?: boolean;
};

export type SpecDictionaryItem = {
    label?: string;
    unit?: string;
    group?: string;
    priority?: number;
    /** Задать собственное форматирование для конкретного ключа */
    format?: (value: SpecValue) => string;
};

export type SpecDictionary = Record<string, SpecDictionaryItem>;

export type SpecSource = SpecEntry[] | Record<string, SpecValue>;

export type SpecTableProps = {
    specs: SpecSource;
    /** Необязательный словарь для обогащения подписей, единиц, групп и сортировки */
    dictionary?: SpecDictionary;
    className?: string;
    /** Локаль для форматирования чисел по умолчанию */
    locale?: string; // например, "ru-RU"
    /** Что делать с пустыми значениями */
    showEmpty?: "hide" | "dash" | "empty"; // скрыть | показать «—» | показать пусто
    /** Компактные отступы */
    compact?: boolean;
    /** Приоритет слияния значений словаря и входных данных */
    mergeStrategy?: "dict-first" | "spec-first";
    /** Переопределение форматирования чисел */
    formatNumber?: (n: number, key?: string) => string;
    /** Подписи для булевых значений */
    yesNo?: { yes: string; no: string };
    /** Клик по строке спецификации */
    onSpecClick?: (entry: SpecEntry) => void;
    /** data-testid для e2e/rtl */
    testId?: string;
};

// ─────────────────────── Utilities ───────────────────────
const isNil = (v: unknown): v is null | undefined => v === null || v === undefined;
const isEmptyString = (v: unknown) => typeof v === "string" && v.trim() === "";

const humanizeKey = (key: string) =>
    key
        .replace(/[_-]+/g, " ")
        .replace(/([a-z\d])([A-Z])/g, "$1 $2")
        .replace(/^\s+|\s+$/g, "")
        .replace(/\s+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

const joinClasses = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

const defaultYesNo = { yes: "Да", no: "Нет" };

function defaultNumberFormatter(locale?: string) {
    try {
        return new Intl.NumberFormat(locale ?? undefined).format;
    } catch {
        return (n: number) => String(n);
    }
}

function normalize(specs: SpecSource, dict?: SpecDictionary, merge: SpecTableProps["mergeStrategy"] = "dict-first"): SpecEntry[] {
    const entries: SpecEntry[] = Array.isArray(specs)
        ? specs
        : Object.entries(specs).map(([key, value]) => ({ key, value }));

    return entries.map((raw) => {
        const d = dict?.[raw.key];
        const base: SpecEntry = { ...raw };

        if (merge === "dict-first") {
            return {
                ...base,
                label: base.label ?? d?.label ?? humanizeKey(base.key),
                unit: base.unit ?? d?.unit,
                group: base.group ?? d?.group,
                priority: base.priority ?? d?.priority,
            };
        }
        // spec-first
        return {
            key: raw.key,
            label: raw.label ?? humanizeKey(raw.key),
            value: raw.value,
            unit: d?.unit ?? raw.unit,
            group: d?.group ?? raw.group,
            priority: d?.priority ?? raw.priority,
            tooltip: raw.tooltip,
            href: raw.href,
            hidden: raw.hidden,
            highlight: raw.highlight,
        };
    });
}

function isValueEmpty(v: SpecValue): boolean {
    if (isNil(v)) return true;
    if (Array.isArray(v)) return v.length === 0 || v.every((x) => isNil(x) || isEmptyString(x));
    if (typeof v === "string") return v.trim() === "";
    return false;
}

function valueToString(
    value: SpecValue,
    key: string,
    unit: string | undefined,
    dictItem: SpecDictionaryItem | undefined,
    formatNumber: (n: number, key?: string) => string,
    yesNo: { yes: string; no: string }
): string {
    if (dictItem?.format) return dictItem.format(value);

    const appendUnit = (s: string) => (unit ? `${s}\u00A0${unit}` : s);

    if (Array.isArray(value)) {
        const parts = value.map((v) => (typeof v === "number" ? formatNumber(v, key) : String(v))).filter((v) => v && v !== "undefined");
        return appendUnit(parts.join(", "));
    }
    if (typeof value === "number") return appendUnit(formatNumber(value, key));
    if (typeof value === "boolean") return value ? yesNo.yes : yesNo.no;
    if (typeof value === "string") return appendUnit(value);
    return "";
}

function sortEntries(a: SpecEntry, b: SpecEntry) {
    const ga = a.group ?? "";
    const gb = b.group ?? "";
    if (ga !== gb) return ga.localeCompare(gb);
    const pa = a.priority ?? Number.POSITIVE_INFINITY;
    const pb = b.priority ?? Number.POSITIVE_INFINITY;
    if (pa !== pb) return pa - pb;
    return (a.label ?? a.key).localeCompare(b.label ?? b.key, undefined, { sensitivity: "base" });
}

// ───────────────────────── View ──────────────────────────
const SpecTable: React.FC<SpecTableProps> = memo(
    ({
        specs,
        dictionary,
        className,
        locale = "ru-RU",
        showEmpty = "hide",
        compact = false,
        mergeStrategy = "dict-first",
        formatNumber,
        yesNo = defaultYesNo,
        onSpecClick,
        testId,
    }) => {
        const numberFormatter = useMemo(() => formatNumber ?? defaultNumberFormatter(locale), [formatNumber, locale]);

        const prepared = useMemo(() => {
            const list = normalize(specs, dictionary, mergeStrategy)
                .filter((e) => !e.hidden)
                .sort(sortEntries);
            return list;
        }, [specs, dictionary, mergeStrategy]);

        // Группировка по разделам
        const groups = useMemo(() => {
            const g = new Map<string, SpecEntry[]>();
            for (const e of prepared) {
                const k = e.group ?? "";
                const arr = g.get(k) ?? [];
                arr.push(e);
                g.set(k, arr);
            }
            return g;
        }, [prepared]);

        return (
            <section className={joinClasses(styles.root, className, compact && styles.compact)} data-testid={testId}>
                {[...groups.entries()].map(([groupName, entries]) => {
                    const visible = entries.filter((e) => !(showEmpty === "hide" && isValueEmpty(e.value)));
                    if (visible.length === 0) return null;
                    return (
                        <div key={groupName || "__no_group__"} className={styles.group}>
                            {groupName && <div className={styles.groupTitle}>{groupName}</div>}
                            <table className={styles.table} role="table">
                                <tbody>
                                    {visible.map((e) => {
                                        const empty = isValueEmpty(e.value);
                                        const dictItem = dictionary?.[e.key];
                                        const content = empty
                                            ? showEmpty === "dash"
                                                ? "—"
                                                : ""
                                            : valueToString(e.value, e.key, e.unit ?? dictItem?.unit, dictItem, numberFormatter, yesNo);

                                        const clickable = Boolean(onSpecClick) || Boolean(e.href);
                                        const labelId = `spec-${e.key}`;

                                        return (
                                            <tr
                                                key={e.key}
                                                className={joinClasses(styles.row, e.highlight && styles.rowHighlight, clickable && styles.rowClickable)}
                                                onClick={() => {
                                                    if (onSpecClick) onSpecClick(e);
                                                    if (e.href) {
                                                        // Не используем <a> во всём ряду, чтобы сохранить семантику таблицы
                                                        window.location.href = e.href;
                                                    }
                                                }}
                                            >
                                                <th id={labelId} scope="row" className={styles.cellLabel}>
                                                    {e.label ?? dictionary?.[e.key]?.label ?? humanizeKey(e.key)}
                                                </th>
                                                <td aria-labelledby={labelId} className={joinClasses(styles.cellValue, empty && styles.valueEmpty)} title={e.tooltip}>
                                                    {content}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </section>
        );
    }
);

export default SpecTable;

// ──────────────────────── Usage demo ─────────────────────
/**
* // 1) Плоская Record-структура (минимум усилий)
* <SpecTable
* specs={{
* brand: "Acme",
* model: "X100",
* screen_size: 6.5,
* resolution: "2400×1080",
* battery: 5000,
* fast_charge: true,
* colors: ["Black", "Blue"],
* }}
* dictionary={{
* brand: { label: "Бренд", priority: 1 },
* model: { label: "Модель", priority: 2 },
* screen_size: { label: "Диагональ", unit: "дюйм", group: "Дисплей", priority: 1 },
* resolution: { label: "Разрешение", group: "Дисплей", priority: 2 },
* battery: { label: "Ёмкость", unit: "мА·ч", group: "Аккумулятор" },
* fast_charge: { label: "Быстрая зарядка", group: "Аккумулятор" },
* colors: { label: "Цвета", group: "Общее" },
* }}
* title="Характеристики"
* />
*
* // 2) С произвольной моделью товара через buildSpecsFromProduct
* type Phone = { brand: string; title: string; specs: { display: { sizeInches: number; resolution: string }, battery: { capacityMah: number, fast: boolean } } };
*
* const specList = buildSpecsFromProduct(product, {
* brand: { path: (p) => p.brand, label: "Бренд", priority: 1 },
* model: { path: (p) => p.title, label: "Модель", priority: 2 },
* screen_size: { path: (p) => p.specs.display.sizeInches, unit: "дюйм", group: "Дисплей" },
* resolution: { path: (p) => p.specs.display.resolution, group: "Дисплей" },
* battery: { path: (p) => p.specs.battery.capacityMah, unit: "мА·ч", group: "Аккумулятор" },
* fast_charge: { path: (p) => p.specs.battery.fast, label: "Быстрая зарядка", group: "Аккумулятор" },
* });
*
* <SpecTable specs={specList} title="Характеристики" />
*/