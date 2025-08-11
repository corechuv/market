export interface Category {
  id: string;
  name: string;
  slug: string;            // уникально в пределах родителя
  fullSlug?: string;       // полный путь (e.g. /electronics/computers/cpu)
  description?: string;
  image?: string;          // баннер/картинка категории
  icon?: string;           // имя иконки или URL
  parentId?: string | null;
  children?: Category[];   // подкатегории (до 3 уровней в нашем датасете)
  productsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  sortOrder?: number;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string;     // можно хранить CSV, если нужно
  };
}