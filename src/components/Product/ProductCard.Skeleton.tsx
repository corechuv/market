import React from "react";
import cls from "./ProductCard.module.scss";

export const ProductCardSkeleton: React.FC = () => {
  return (
    <article
      className={`${cls.item} ${cls["item--skeleton"]}`}
      aria-busy="true"
      aria-label="Loading product"
    >
      <div className={cls.item__watch}>
        {/* Изображение */}
        <div className={`${cls["item__watch--placeholder"]} ${cls.skeletonBlock}`} />
      </div>

      <div className={cls.item__meta}>
        {/* Название (две строки разной длины) */}
        <div className={`${cls.skeletonLine}`} style={{ width: "88%", height: 18, margin: "8px 0 6px" }} />

        {/* Цена */}
        <div className={cls.item__price}>
          <div className={`${cls.skeletonLine}`} style={{ width: 110, height: 20, marginTop: 6 }} />
        </div>
      </div>
    </article>
  );
};

export default ProductCardSkeleton;
