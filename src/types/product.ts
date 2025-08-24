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

export interface Product {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  link: string;

  available?: boolean;

  description?: string;
  shortDescription?: string[];

  images?: string[];

  /** Привязка к категориям */
  categoryId?: string;     // если товар в одной категории
  categoryIds?: string[];  // если товар в нескольких категориях

  attributes?: ProductAttribute[];
}
