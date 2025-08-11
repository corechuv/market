import React from "react";
import { getProductById, getMoreProducts } from "../../services/productService";
import { getReviewsById } from "../../services/reviewService";
import cls from './ProductPage.module.scss'

import ProductImages from "../../components/Product/ProductImages";
import Button from "../../components/Buttons/Button";
import Modal from "../../components/Modal/Modal";
import ReviewList from "../../components/Product/ReviewList";
import ReviewForm from "../../components/Product/ReviewForm";
import ProductCarousel from "../../components/Product/ProductCarousel";
import ChevronRightIcon from "../../components/Icons/ChevronLeftIcon";
import { useNavigate, useParams } from "react-router-dom";

export default function ProductPage() {
    const { productId } = useParams<{ productId: string }>();

    const product = getProductById(String(productId));
    const moreProducts = getMoreProducts(product?.id);
    const reviews = getReviewsById(String(productId));

    const nav = useNavigate();

    const [isOpen, setIsOpen] = React.useState(false);

    if (!product) {
        return (
            <div className="container">
                <div className={cls.product}>
                    <div className={cls.productCategory}>
                        <span className={cls.productCategory__link} onClick={() => nav('/')}>Home</span>
                        <ChevronRightIcon className={cls.productCategory__icon} />
                        <span className={cls.productCategory__link} onClick={() => nav(-1)}>PC Components</span>
                        <ChevronRightIcon className={cls.productCategory__icon} />
                        <span className={cls.productCategory__link} onClick={() => nav(-1)}>Processors</span>
                    </div>
                    <h2>Product not found</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className={cls.product}>
                <div className={cls.productCategory}>
                    <span className={cls.productCategory__link} onClick={() => nav('/')}>Home</span>
                    <ChevronRightIcon className={cls.productCategory__icon} />
                    <span className={cls.productCategory__link} onClick={() => nav(-1)}>PC Components</span>
                    <ChevronRightIcon className={cls.productCategory__icon} />
                    <span className={cls.productCategory__link} onClick={() => nav(-1)}>Processors</span>
                </div>
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