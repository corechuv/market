// FILE: src/specs/builders.ts
import type { Product, ProductAttribute } from "../types/product";
import type { SpecEntry, SpecDictionary } from "../components/Product/SpecTable";
import { codebook } from "./codebook";


// Маппинг массива атрибутов → SpecEntry[]
export function buildSpecsFromAttributes(attrs: ProductAttribute[]): SpecEntry[] {
    return attrs.map((a) => ({
        key: a.code,
        label: a.label,
        value: a.value as any,
        unit: a.unit,
        group: a.group,
        priority: a.priority,
        tooltip: a.tooltip,
        href: a.href,
        hidden: a.hidden,
        highlight: a.highlight,
    }));
}

// Универсальный билдер для карточки — объединяет базовые поля + attributes
export function buildSpecs(product: Product, extraCodebook?: SpecDictionary) {
    const base: ProductAttribute[] = [
        { code: "name", value: product.name },
        { code: "price", value: product.price },
        { code: "available", value: product.available ?? null },
    ];

    const allAttrs = [...base, ...(product.attributes ?? [])];
    const entries = buildSpecsFromAttributes(allAttrs);

    // Словари можно складывать (например, передать категории-специфичные дополнения)
    const dictionary: SpecDictionary = { ...(extraCodebook ?? {}), ...codebook };

    return { entries, dictionary };
}

// Автогруппировка по префиксу кода (если group не задан ни в словаре, ни в атрибуте)
export function inferGroupFromCode(code: string) {
    const head = code.split(".")[0];
    return head.toUpperCase();
}

export function buildSpecsWithAutoGroups(product: Product, extraCodebook?: SpecDictionary) {
    const { entries, dictionary } = buildSpecs(product, extraCodebook);
    const patched = entries.map((e) => ({
        ...e,
        group: e.group ?? dictionary[e.key]?.group ?? inferGroupFromCode(e.key),
    }));
    return { entries: patched, dictionary };
}