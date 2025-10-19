// src/components/Product/Details/VariantPicker.tsx
import React from "react";
import styles from "./VariantPicker.module.scss";
import type { Product, ProductVariant } from "../../../types/product";

export type VariantPickerProps = {
  product: Product;
  value?: ProductVariant;
  onChange: (v: ProductVariant | undefined) => void;
  optionLabelMap?: Record<string, string>;
  respectAvailability?: boolean;
  hideUnavailable?: boolean;
  showSelectedOnLabel?: boolean;
  imageOptionNames?: string[];
  className?: string;
};

// ───────── helpers ─────────

// Маппинг кодов атрибутов → имена осей (то, что увидит пользователь)
const CODE_TO_OPTION_NAME: Record<string, string> = {
  color: "Color",
  colour: "Color",
  storage: "Memory",
  memory: "Memory",
};

function isColorOption(name: string) {
  const s = name.trim().toLowerCase();
  return s === "color" || s === "colour" || s === "цвет";
}

/** Берём variant.options; если они пустые — конструируем из variant.attributes */
function getVariantOptions(v: ProductVariant): Record<string, string> {
  const hasRealOptions = v.options && Object.keys(v.options).length > 0;
  if (hasRealOptions) return { ...v.options };

  const out: Record<string, string> = {};
  for (const a of v.attributes ?? []) {
    const rawCode = String(a.code ?? "").toLowerCase();
    const axis = CODE_TO_OPTION_NAME[rawCode] || a.label || a.code;
    const val = a.value;
    if (!axis || val == null) continue;
    const str = typeof val === "string" ? val : String(val);
    if (!out[axis]) out[axis] = str; // не перезаписываем первое найденное
  }
  return out;
}

function getInitialPartial(product: Product, value?: ProductVariant): Record<string, string> {
  if (value) return { ...getVariantOptions(value) };
  const v = product.variants?.[0];
  return v ? getVariantOptions(v) : {};
}

function canPick(
  product: Product,
  partial: Record<string, string>,
  optionName: string,
  optionValue: string,
  respectAvailability: boolean
): boolean {
  const pool = respectAvailability ? product.variants.filter(v => v.available) : product.variants;
  return pool.some(v => {
    const opts = getVariantOptions(v);
    if (opts[optionName] !== optionValue) return false;
    return Object.entries(partial).every(([k, val]) => k === optionName || opts[k] === val);
  });
}

function findCompatibleVariant(
  product: Product,
  partial: Record<string, string>,
  respectAvailability: boolean
): ProductVariant | undefined {
  const pools = respectAvailability
    ? [product.variants.filter(v => v.available), product.variants]
    : [product.variants];

  for (const pool of pools) {
    const exact = pool.find(v => {
      const opts = getVariantOptions(v);
      return Object.entries(opts).every(([k, val]) => partial[k] === val);
    });
    if (exact) return exact;
  }
  return undefined;
}

function computeOptionSchema(product: Product): Array<{ name: string; values: string[] }> {
  const nameSet = new Set<string>();
  for (const v of product.variants ?? []) {
    Object.keys(getVariantOptions(v)).forEach(n => nameSet.add(n));
  }
  return Array.from(nameSet).map(name => {
    const values = new Set<string>();
    for (const v of product.variants ?? []) {
      const opts = getVariantOptions(v);
      const val = opts[name];
      if (val) values.add(val);
    }
    return { name, values: Array.from(values) };
  });
}

function getPreviewImageForValue(
  product: Product,
  optionName: string,
  optionValue: string,
  preferAvailable = true
): string | undefined {
  const choose = (arr: ProductVariant[]) => {
    const hit = arr.find(v => getVariantOptions(v)[optionName] === optionValue && v.images && v.images.length > 0);
    return hit?.images?.[0];
  };
  return (
    (preferAvailable ? choose(product.variants.filter(v => v.available)) ?? choose(product.variants) : choose(product.variants)) ??
    product.images?.[0] ??
    (product as any).imageUrl
  );
}

// ───────── component ─────────
const VariantPicker: React.FC<VariantPickerProps> = ({
  product,
  value,
  onChange,
  optionLabelMap,
  respectAvailability = true,
  hideUnavailable = false,
  showSelectedOnLabel = true,
  imageOptionNames,
  className,
}) => {
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

  // хуки всегда запускаем
  const schema = React.useMemo(() => computeOptionSchema(product), [product]);

  const [partial, setPartial] = React.useState<Record<string, string>>(
    () => getInitialPartial(product, value)
  );

  React.useEffect(() => {
    if (value) setPartial(getVariantOptions(value));
  }, [value?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePick = (optionName: string, optionValue: string) => {
    if (partial[optionName] === optionValue) return;
    const nextPartial = { ...partial, [optionName]: optionValue };
    const candidate = findCompatibleVariant(product, nextPartial, respectAvailability);
    if (candidate) {
      setPartial(getVariantOptions(candidate));
      onChange(candidate);
    } else {
      setPartial(nextPartial);
      onChange(undefined);
    }
  };

  // условный рендер ПОСЛЕ хуков
  if (!hasVariants || schema.length === 0) return null;

  return (
    <div className={`${styles.root}${className ? ` ${className}` : ""}`}>
      {schema.map(opt => {
        const current = partial[opt.name];
        const useImages = (imageOptionNames?.includes(opt.name)) ?? isColorOption(opt.name);

        const values = hideUnavailable
          ? opt.values.filter(val => canPick(product, partial, opt.name, val, respectAvailability))
          : opt.values;

        return (
          <div key={opt.name} className={styles.option} role="radiogroup" aria-label={opt.name}>
            <div className={styles.optionHeader}>
              <span className={styles.optionLabel}>{optionLabelMap?.[opt.name] ?? opt.name}:</span>
              {showSelectedOnLabel && current && <span className={styles.optionCurrent}>{current}</span>}
            </div>

            <div className={styles.values}>
              {values.map(val => {
                const active = current === val;
                const available = canPick(product, partial, opt.name, val, respectAvailability);

                const commonProps = {
                  type: "button" as const,
                  key: val,
                  onClick: () => available && handlePick(opt.name, val),
                  disabled: !available && !hideUnavailable,
                  role: "radio" as const,
                  "aria-checked": active,
                  "aria-label": `${opt.name}: ${val}`,
                };

                if (useImages) {
                  const src = getPreviewImageForValue(product, opt.name, val, respectAvailability);
                  return (
                    <button {...commonProps} className={`${styles.thumbBtn}${active ? ` ${styles.active}` : ""}`} title={val}>
                      <span className={styles.thumb}>
                        {src ? <img className={styles.thumbImg} src={src} alt={`${opt.name}: ${val}`} /> : <span className={styles.thumbFallback}>{val}</span>}
                      </span>
                      <span className={styles.valueText}>{val}</span>
                    </button>
                  );
                }

                return (
                  <button {...commonProps} className={`${styles.chip}${active ? ` ${styles.chipActive}` : ""}`}>
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VariantPicker;
