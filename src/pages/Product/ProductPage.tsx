import React from "react";
import { useParams } from "react-router-dom";
import { getProductById, getMoreProducts } from "../../services/productService";
import { getReviewsById } from "../../services/reviewService";
import { getBreadcrumbs } from "../../services/categoryService";

import cls from './ProductPage.module.scss'

import ProductImages from "../../components/Product/ProductImages";
import Button from "../../components/Buttons/Button";
import Modal from "../../components/Modal/Modal";
import ReviewList from "../../components/Product/ReviewList";
import ReviewForm from "../../components/Product/ReviewForm";
import ProductCarousel from "../../components/Product/ProductCarousel";
import Breadcrumbs from "../../components/Common/Breadcrumbs";

export default function ProductPage() {
    const { productId } = useParams<{ productId: string }>();

    const product = getProductById(String(productId));

    const [isOpen, setIsOpen] = React.useState(false);

    // первичная категория товара (если несколько — берём первую)
    const primaryCategoryId = product?.categoryId ?? product?.categoryIds?.[0];
    const categoryCrumbs = primaryCategoryId ? getBreadcrumbs(primaryCategoryId) : [];


    const moreProducts = getMoreProducts({
        currentId: product?.id,
        // необязательно, но можно уточнить:
        // categoryId: product.categoryId, // или categoryFullSlug: "/electronics/computers/cpu"
        limit: 8,
        availableOnly: true,
        shuffle: true,
        fillFromAllIfShort: true,
    });
    const reviews = getReviewsById(String(productId));

    if (!product) {
        return (
            <div className="container">
                <div className={cls.product}>
                    <Breadcrumbs crumbs={categoryCrumbs as any} />
                    <h2>Product not found</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className={cls.product}>
                {/* Крошки */}
                <Breadcrumbs crumbs={categoryCrumbs as any} />
                <div className={cls.productDetails}>
                    <ProductImages images={product.images} />
                    <div className={cls.productInfo}>
                        <div className={cls.productTitle}>
                            <h1 className={cls.productName}>{product.name}</h1>
                            <div className={cls.productPrice}>{product.price}
                                <div className={cls.available}>
                                    <span className={product.available ? cls.inStock : cls.outOfStock} />
                                    <span className={product.available ? cls.inStockText : cls.outOfStockText}>
                                        {product.available ? "In Stock" : "Out of Stock"}
                                    </span>
                                </div>
                            </div>
                            <div className={cls.productVat}>
                                <span>VAT included</span>
                            </div>
                            <div className={cls.productDelivery}>
                                <span>Delivery: <span className={cls.deliveryTime}>3-5</span> business days</span>
                            </div>
                        </div>
                        <div className={cls.productActions}>
                            <Button className={`${cls.addToCart}`} size="small">Add to Cart</Button>
                            <Button className={`${cls.buyNow}`} size="small">Buy Now</Button>
                        </div>
                    </div>
                    <div className={cls.productDescription}>
                        <h3 className={cls.descriptionTitle}>Description</h3>
                        <p>
                            {product.description || "No description available for this product."}
                        </p>
                    </div>
                    <div className={cls.productReviews}>
                        <h3 className={cls.reviewsTitle}>Reviews</h3>
                        <div className={cls.reviewsHeader}>
                            <div>
                                <div className={cls.reviewCount}>4.5 <span className={cls.reviewCountText}>(120 reviews)</span></div>
                            </div>
                            <div className={cls.reviewActions}>
                                <Button className={cls.openReviewButton} onClick={() => setIsOpen(true)} size="small">Open Reviews</Button>
                            </div>
                        </div>
                    </div>
                    <ProductCarousel products={moreProducts} label="More Products" />
                </div>
            </div>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} variant="right" header="Reviews" headerBorder={false}>
                <div className={cls.reviewsContent}>
                    <ReviewForm />
                    <ReviewList reviews={reviews} className={cls.reviewList} />
                </div>
            </Modal>
        </div>
    )
}