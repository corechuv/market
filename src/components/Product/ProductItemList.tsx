import React from "react";
import cls from "./ProductItemList.module.scss";
import type { ViewMode } from "../../components/Product/ToggleViewSwitch";

export type Product = {
    id: number;
    name: string;
    price: string;
    image: string;
    available: boolean;
};

type Props = {
    products: Product[];
    view: ViewMode; // 'grid' | 'list'
    onItemClick?: (product: Product) => void;
    className?: string;
};

const ProductItemList: React.FC<Props> = ({ products, view, onItemClick, className }) => {
    return (
        <div className={[cls.productList, className].filter(Boolean).join(" ")}>
            <div className={view === "grid" ? cls.grid : cls.list}>
                {products.map((product) => (
                    <div
                        key={product.id}
                        className={[
                            cls.productItem,
                            view === "list" ? cls.itemList : cls.itemGrid,
                        ].join(" ")}
                        onClick={() => onItemClick?.(product)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") onItemClick?.(product);
                        }}
                    >
                        <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className={cls.productImage}
                        />
                        <div className={cls.productDetails}>
                            <h2 className={cls.productName}>{product.name}</h2>
                            <div className={cls.productPrice}>{product.price}</div>
                            <div className={cls.available}>
                                <span className={product.available ? cls.inStock : cls.outOfStock} />
                                <span className={product.available ? cls.inStockText : cls.outOfStockText}>
                                    {product.available ? "In Stock" : "Out of Stock"}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default React.memo(ProductItemList);
