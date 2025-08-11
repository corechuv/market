export interface Product {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  link: string;

  available?: boolean;
  description?: string;
  images?: string[];

  /** Привязка к категориям */
  categoryId?: string;     // если товар в одной категории
  categoryIds?: string[];  // если товар в нескольких категориях
}
