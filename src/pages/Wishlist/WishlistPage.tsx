import "react"
import { getProducts } from "../../services/productService";
import ProductItemList from "../../components/Product/ProductItemList";
import { useNavigate } from "react-router-dom";
import cls from "./WishlistPage.module.scss"

export default function WishlistPage() {
    const products = getProducts();
    const nav = useNavigate();

    return <div>
        <h2 className={cls.title}>My Wishlist</h2>
        <ProductItemList
            products={products}
            view="list"
            onItemClick={(p) => nav(`/product/${p.id}`)}
        />
    </div>
}