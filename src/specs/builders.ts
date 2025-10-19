// src/specs/builders.ts
import type { Product, ProductAttribute, ProductVariant } from "../types/product";
import type { SpecEntry, SpecDictionary } from "../components/Product/SpecTable";
import { codebook } from "./codebook";

// 1) merge: базовые + override варианта (по code)
export function mergeAttributes(base: ProductAttribute[] = [], override: ProductAttribute[] = []): ProductAttribute[] {
    const map = new Map<string, ProductAttribute>();
    for (const a of base) map.set(a.code, a);
    for (const b of override) map.set(b.code, { ...map.get(b.code), ...b }); // приоритет варианта
    return [...map.values()];
}

// 2) адаптация атрибутов к SpecEntry[]
export function buildSpecEntries(attrs: ProductAttribute[]): SpecEntry[] {
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

// 3) выбрать стартовый вариант
export function getInitialVariant(product: Product): ProductVariant | undefined {
    const variants = Array.isArray(product.variants) ? product.variants : [];
    if (variants.length === 0) return undefined;

    if (product.defaultVariantId) {
        const byId = variants.find(v => v.id === product.defaultVariantId);
        if (byId) return byId;
    }
    // предпочтём доступный SKU, иначе первый
    return variants.find(v => v.available) ?? variants[0];
}

// 4) билд спецификаций с учётом выбранного варианта (цена/наличие/атрибуты перекрываются)
export function buildSpecs(
    product: Product,
    opts?: { variant?: ProductVariant; dictionary?: SpecDictionary }
) {
    const v = opts?.variant;
    // NEW: энерго-класс и даташит (SKU → fallback SPU)
    const energy = v?.energyClassUrl ?? product.energyClassUrl;
    const datasheet = v?.datasheetPdfUrl ?? product.datasheetPdfUrl;
    const energyClassArrow = v?.energyClassArrowUrl ?? product.energyClassArrowUrl;


    const base: ProductAttribute[] = [
        { code: "name", value: product.name },
        { code: "price", value: v?.price ?? product.price }, // цена варианта перекрывает базовую
        { code: "available", value: (v?.available ?? product.available) ?? null },
        { code: "sku", value: v?.sku ?? null }, // артикул варианта
        ...(energyClassArrow ? [{ code: "energy.class.arrow", value: "SVG", href: energyClassArrow, hidden: true }] : []),
        ...(energy ? [{ code: "energy.class", value: "SVG", href: energy, hidden: true }] : []),
        ...(datasheet ? [{ code: "docs.datasheet", value: "PDF", href: datasheet }] : []),
    ];


    const merged = mergeAttributes([...base, ...(product.attributes ?? [])], v?.attributes ?? []);
    const entries = buildSpecEntries(merged);


    const dictionary: SpecDictionary = { ...(opts?.dictionary ?? {}), ...codebook };
    return { entries, dictionary };
}


// 5) Автогруппировка по префиксу кода (если group не задан ни в словаре, ни в атрибуте)
export function inferGroupFromCode(code: string) {
    const head = code.split(".")[0];
    return head.toUpperCase();
}

export function buildSpecsWithAutoGroups(
    product: Product,
    opts?: { variant?: ProductVariant; dictionary?: SpecDictionary }
) {
    const { entries, dictionary } = buildSpecs(product, opts);
    const patched = entries.map((e) => ({
        ...e,
        group: e.group ?? dictionary[e.key]?.group ?? inferGroupFromCode(e.key),
    }));
    return { entries: patched, dictionary };
}


// 6) Цена для выдачи (вариант или диапазон)
export function getDisplayPrice(product: Product, v?: ProductVariant) {
    if (v) return { price: v.price, compareAt: v.compareAtPrice };
    const prices = product.variants?.map((x) => x.price) ?? [];
    if (prices.length > 0) return { price: `from ${prices[0]}`, compareAt: undefined };
    return { price: product.price, compareAt: undefined };
}