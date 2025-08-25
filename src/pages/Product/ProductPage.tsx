import React from "react";
import { useParams } from "react-router-dom";
import { getProductById, getMoreProducts } from "../../services/productService";
import { getReviewsById } from "../../services/reviewService";
import { getBreadcrumbs } from "../../services/categoryService";
import { buildSpecs, getInitialVariant } from "../../specs/builders";


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
import type { ProductVariant } from "../../types/product";
import VariantPicker from "../../components/Product/Details/VariantPicker";

// помощник: приводим денежную строку к числу
function parseMoney(input: unknown): number {
    if (typeof input === "number") return input;

    if (input == null) return NaN;
    // убираем пробелы (в т.ч. неразрывные) и валюты
    let s = String(input)
        .replace(/\u00A0/g, " ")     // nbsp -> пробел
        .replace(/\s/g, "")          // все пробелы
        .replace(/[^\d.,-]/g, "");   // только цифры и разделители

    // определяем, что является десятичным разделителем: последняя запятая/точка в строке
    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");
    if (lastComma > lastDot) {
        // десятичная запятая: убираем все тысячи-точки и меняем запятую на точку
        s = s.replace(/\./g, "").replace(",", ".");
    } else {
        // десятичная точка или вовсе нет десятичной части: убираем все запятые (тысячи)
        s = s.replace(/,/g, "");
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
}

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

    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
    const initial = hasVariants ? getInitialVariant(product) : undefined;
    const [variant, setVariant] = React.useState<ProductVariant | undefined>(initial);

    // картинки/цена/наличие с учётом варианта (или без него)
    const images = (variant?.images?.length ? variant.images : product.images) ?? [];
    const price = variant?.price ?? product.price;
    const compareAt = variant?.compareAtPrice;
    const available = (variant?.available ?? product.available) ?? false;

    const { entries, dictionary } = buildSpecs(product, { variant });

    // вычисляем скидку (если есть compareAtPrice)
    const rawPrice = variant?.price ?? product.price;
    const rawCompareAt = variant?.compareAtPrice;

    const priceNum = parseMoney(rawPrice);
    const compareAtNum = parseMoney(rawCompareAt);

    const discountPercent = React.useMemo(() => {
        if (!Number.isFinite(priceNum) || !Number.isFinite(compareAtNum)) return null;
        if (compareAtNum <= 0 || priceNum >= compareAtNum) return null;
        return Math.round(((compareAtNum - priceNum) / compareAtNum) * 100);
    }, [priceNum, compareAtNum]);

    return (
        <div className="container">
            <div className={cls.product}>
                {/* Крошки */}
                <Breadcrumbs crumbs={categoryCrumbs as any} />
                <div className={cls.productDetails}>
                    <ProductImages images={images} />
                    <div className={cls.productInfo}>
                        <div className={cls.productTitle}>
                            <h1 className={cls.productName}>{product.name}</h1>
                            <div className={cls.productPrice}>
                                <div className={cls.price}>
                                    {Number.isFinite(compareAtNum) && compareAtNum > priceNum && <div className={cls.price__old}>
                                        {discountPercent !== null && (
                                            <span className={cls.price__discount}>-{discountPercent}%</span>
                                        )}
                                        <span className={cls.price__compareAt}>{compareAt}</span>
                                    </div>}
                                    <span className={cls.price__current}>{price}</span>
                                </div>
                                <div className={cls.available}>
                                    <span className={available ? cls.inStock : cls.outOfStock} />
                                    <span className={available ? cls.inStockText : cls.outOfStockText}>
                                        {available ? "In Stock" : "Out of Stock"}
                                    </span>
                                </div>
                            </div>
                            <div className={cls.section}>
                                <div className={cls.section__content}>
                                    <div className={cls.productVat}>
                                        <span>VAT included</span>
                                    </div>
                                </div>
                            </div>
                            {hasVariants && (
                                <div className={cls.section}>
                                    <div className={cls.section__content}>
                                        {/* Варианты (цвет/память и т.п.) */}
                                        <VariantPicker
                                            product={product}
                                            value={variant}
                                            onChange={setVariant}
                                        />
                                    </div>
                                </div>
                            )}
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