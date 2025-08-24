import React from "react";
import { useParams } from "react-router-dom";
import { getProductById, getMoreProducts } from "../../services/productService";
import { getReviewsById } from "../../services/reviewService";
import { getBreadcrumbs } from "../../services/categoryService";
import { buildSpecs } from "../../specs/builders";


import cls from './ProductPage.module.scss'

import ProductImages from "../../components/Product/ProductImages";
import Button from "../../components/UI/Button";
import Modal from "../../components/Modal/Modal";
import ReviewList from "../../components/Product/ReviewList";
import ReviewForm from "../../components/Product/ReviewForm";
import ProductCarousel from "../../components/Product/ProductCarousel";
import Breadcrumbs from "../../components/Common/Breadcrumbs";
import DeliveryBadge from "../../components/Product/DeliveryBadge";
import SpecTable from "../../components/Product/SpecTable";


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
    const { entries, dictionary } = buildSpecs(product);

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
                        </div>
                        <div className={cls.productActions}>
                            <Button className={`${cls.addToCart}`} size="small">Add to Cart</Button>
                            <Button className={`${cls.buyNow}`} size="small">Buy Now</Button>
                        </div>
                    </div>
                    <div className={cls.section}>
                        <h3 className={cls.section__title}>Delivery</h3>
                        <div className={cls.section__content}>
                            <DeliveryBadge minDays={2} maxDays={4} />
                        </div>
                    </div>
                    <div className={cls.section}>
                        <h3 className={cls.section__title}>Short description</h3>
                        <div className={cls.section__content}>
                            <ul className={cls.list}>
                                {product.shortDescription ? product.shortDescription.map((line, idx) => (
                                    <li key={idx}>{line}</li>
                                )) : <li>No short description available for this product.</li>}
                            </ul>
                        </div>
                    </div>
                    <div className={cls.section}>
                        <h3 className={cls.section__title}>Specifications</h3>
                        <div className={cls.section__content}>
                            <SpecTable
                                specs={entries}
                                dictionary={dictionary}
                                showEmpty="dash"
                                mergeStrategy="dict-first"
                            />
                        </div>
                    </div>
                    <div className={cls.section}>
                        <h3 className={cls.section__title}>Description</h3>
                        <div className={cls.section__content}>
                            <p>
                                {product.description || "No description available for this product."}
                            </p>
                        </div>
                    </div>
                    <div className={cls.section}>
                        <h3 className={cls.section__title}>Reviews</h3>
                        <div className={cls.section__content}>
                            <div className={cls.reviewsHeader}>
                                <div>
                                    <div className={cls.reviewCount}>4.5 <span className={cls.reviewCountText}>(120 reviews)</span></div>
                                </div>
                                <div className={cls.reviewActions}>
                                    <Button className={cls.openReviewButton} onClick={() => setIsOpen(true)} size="small">Open Reviews</Button>
                                </div>
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