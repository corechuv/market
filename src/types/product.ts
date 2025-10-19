// src/types/product.ts
export type AttrValue = string | number | boolean | Array<string | number> | null | undefined;

export interface ProductAttribute {
  code: string; // стабильный код характеристики (например: "cpu.cores")
  value: AttrValue; // значение
  label?: string; // метка, если словарь не знает такой код
  unit?: string; // юнит
  group?: string; // группа/секция
  priority?: number; // сортировка внутри группы
  tooltip?: string;
  href?: string;
  hidden?: boolean;
  highlight?: boolean;
}

export interface ProductBase {
  id: string;
  // Внутренний номер товара
  articleNumber?: string;
  name: string;
  price: string;
  imageUrl: string;
  images?: string[];
  link: string;
  available?: boolean;
  description?: string;
  shortDescription?: string[];
  /** Привязка к категориям */
  categoryId?: string;     // если товар в одной категории
  categoryIds?: string[];  // если товар в нескольких категориях

  datasheetPdfUrl?: string,
  energyClassUrl?: string,
  energyClassArrowUrl?: string; // URL картинки с энерго-классом
  
  attributes?: ProductAttribute[];
}

// вариант (SKU)
export type ProductVariant = {
  id: string;
  sku?: string;
  options: Record<string, string>; // { Color: 'Black', Memory: '256 GB' }
  price: string;                   // цена именно этого варианта
  compareAtPrice?: string;         // старая цена/перечёркнутая
  compareAtCents?: number | null;
  available: boolean;
  images?: string[];               // фотки для цвета
  attributes?: ProductAttribute[]; // атрибуты-override (например, цвет/память)
  datasheetPdfUrl?: string;      // PDF именно этого SKU
  energyClassUrl?: string;     // класс именно этого SKU
  energyClassArrowUrl?: string; // URL картинки с энерго-классом
};

export type Product = ProductBase & {
  options: Array<{ name: string; values: string[] }>; // определение осей выбора
  variants: ProductVariant[];
  defaultVariantId?: string;
};
