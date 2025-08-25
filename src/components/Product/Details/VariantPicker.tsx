import React from "react";
import styles from "./VariantPicker.module.scss";
import type { Product, ProductVariant } from "../../../types/product";

export type VariantPickerProps = {
  product: Product;
  value?: ProductVariant;
  onChange: (v: ProductVariant | undefined) => void;

  /** Кастомные подписи осей (локализация) */
  optionLabelMap?: Record<string, string>;

  /** Учитывать ли доступность при выборе/дизейбле значений */
  respectAvailability?: boolean;

  /** Скрывать (а не дизейблить) невозможные значения */
  hideUnavailable?: boolean;

  /** Показывать выбранное значение справа от заголовка опции */
  showSelectedOnLabel?: boolean;

  /** Принудительно указать имена опций, для которых использовать превью-картинки (по умолчанию — Color/Colour/Цвет) */
  imageOptionNames?: string[];

  className?: string;
};

// ───────────────── helpers ─────────────────
function isColorOption(name: string) {
  const s = name.trim().toLowerCase();
  return s === "color" || s === "colour" || s === "цвет";
}

function getInitialPartial(product: Product, value?: ProductVariant): Record<string, string> {
  if (value?.options) return { ...value.options };
  const v = product.variants?.[0];
  return v?.options ? { ...v.options } : {};
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
    if (v.options[optionName] !== optionValue) return false;
    return Object.entries(partial).every(([k, val]) => k === optionName || v.options[k] === val);
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
    const exact = pool.find(v => Object.entries(v.options).every(([k, val]) => partial[k] === val));
    if (exact) return exact;
  }
  return undefined;
}

/** Строим схему опций из variants (не доверяем product.options.values) */
function computeOptionSchema(product: Product): Array<{ name: string; values: string[] }> {
  const names = new Set<string>();
  for (const v of product.variants ?? []) {
    Object.keys(v.options ?? {}).forEach(n => names.add(n));
  }
  return Array.from(names).map(name => {
    const set = new Set<string>();
    for (const v of product.variants ?? []) {
      const val = v.options?.[name];
      if (val) set.add(val);
    }
    return { name, values: Array.from(set) };
  });
}

/** Картинка-превью для значения опции: берём первое изображение варианта с этим значением */
function getPreviewImageForValue(
  product: Product,
  optionName: string,
  optionValue: string,
  preferAvailable = true
): string | undefined {
  const choose = (arr: ProductVariant[]) =>
    arr.find(v => v.options?.[optionName] === optionValue && v.images && v.images.length > 0)?.images?.[0];

  const availableFirst = preferAvailable
    ? choose(product.variants.filter(v => v.available)) ?? choose(product.variants)
    : choose(product.variants);

  return (
    availableFirst ??
    product.images?.[0] ??
    product.imageUrl // совсем крайний фолбек
  );
}

// ───────────────── component ─────────────────
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
  if (!hasVariants) return null;

  const schema = React.useMemo(() => computeOptionSchema(product), [product]);

  const [partial, setPartial] = React.useState<Record<string, string>>(
    () => getInitialPartial(product, value)
  );

  // синхронизация с внешним выбранным вариантом
  React.useEffect(() => {
    if (value?.options) setPartial(value.options);
  }, [value?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePick = (optionName: string, optionValue: string) => {
    if (partial[optionName] === optionValue) return;
    const nextPartial = { ...partial, [optionName]: optionValue };
    const candidate = findCompatibleVariant(product, nextPartial, respectAvailability);
    if (candidate) {
      setPartial(candidate.options);
      onChange(candidate);
    } else {
      setPartial(nextPartial);
      onChange(undefined);
    }
  };

  return (
    <div className={`${styles.root}${className ? ` ${className}` : ""}`}>
      {schema.map(opt => {
        const current = partial[opt.name];
        const useImages =
          (imageOptionNames?.includes(opt.name)) ?? isColorOption(opt.name);

        const values = hideUnavailable
          ? opt.values.filter(val => canPick(product, partial, opt.name, val, respectAvailability))
          : opt.values;

        return (
          <div key={opt.name} className={styles.option} role="radiogroup" aria-label={opt.name}>
            <div className={styles.optionHeader}>
              <span className={styles.optionLabel}>
                {optionLabelMap?.[opt.name] ?? opt.name}
              </span>
              <span>-</span>
              {showSelectedOnLabel && current && (
                <span className={styles.optionCurrent}>{current}</span>
              )}
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
                    <button
                      {...commonProps}
                      className={`${styles.thumbBtn}${active ? ` ${styles.active}` : ""}`}
                      title={val}
                    >
                      <span className={styles.thumb}>
                        {src ? (
                          <img className={styles.thumbImg} src={src} alt={`${opt.name}: ${val}`} />
                        ) : (
                          <span className={styles.thumbFallback}>{val}</span>
                        )}
                      </span>
                      <span className={styles.valueText}>{val}</span>
                    </button>
                  );
                }

                // не цвет — обычный чип
                return (
                  <button
                    {...commonProps}
                    className={`${styles.chip}${active ? ` ${styles.chipActive}` : ""}`}
                  >
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
