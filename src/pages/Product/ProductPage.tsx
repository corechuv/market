import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, getMoreProducts } from "../../services/productService";
import { getReviewsById } from "../../services/reviewService";
import { getBreadcrumbs } from "../../services/categoryService";
import { buildSpecs, getInitialVariant } from "../../specs/builders";
import { parseMoney } from "../../types/helpers/parseMoney";
import { getReviewSummaryById } from "../../services/reviewService";
import { /*addWishlistItem, removeWishlistItemBySku,*/ isInWishlist, toggleWishlistItem } from "../../services/wishlistService";


import cls from './ProductPage.module.scss'

import ProductImages from "../../components/Product/ProductImages";
import Button from "../../components/UI/Button";
import Modal from "../../components/Modal/Modal";
import ReviewList from "../../components/Product/ReviewList";
import ReviewForm from "../../components/Product/ReviewForm";
import Breadcrumbs from "../../components/Common/Breadcrumbs";
import DeliveryBadge from "../../components/Product/DeliveryBadge";
import SpecTable from "../../components/Product/SpecTable";
import type { ProductVariant } from "../../types/product";
import VariantPicker from "../../components/Product/Details/VariantPicker";
import Stars from "../../components/Product/Stars";

import ProductDatasheet from "../../components/Product/Details/ProductDatasheet";
import EnergyLabel from "../../components/Product/Details/EnergyLabel";
import ReviewsHistogram from "../../components/Product/Details/ReviewsHistogram";

import { useCart } from "../../context/CartContext";
import { toCartLine } from "../../services/cartAdapter";
import ProductCarouselRich from "../../components/Product/ProductCarouselRich";

export default function ProductPage() {
    const nav = useNavigate();
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
    const reviewSummary = React.useMemo(
        () => getReviewSummaryById(String(productId)),
        [productId]
    );

    // Преобразуем [c1..c5] → [{ rating: 1..5, count }]
    const histogramData = React.useMemo(
        () => reviewSummary.histogram.map((count, i) => ({ rating: i + 1, count })),
        [reviewSummary.histogram]
    );

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

    const articleNumber = product.articleNumber ?? undefined;

    // Выводить с приоритетом варианта EnergyClass/Datasheet или товара
    const energyClassArrow = variant?.energyClassArrowUrl ?? product.energyClassArrowUrl;
    const energyClass = variant?.energyClassUrl ?? product.energyClassUrl;
    const datasheetUrl = variant?.datasheetPdfUrl ?? product.datasheetPdfUrl;

    const { add } = useCart();
    const handleAddToCart = React.useCallback(() => {
        if (!product) return;
        const line = toCartLine(product, variant, 1);
        add(line);
    }, [product, variant, add]);

    // NEW: следим, виден ли основной блок с кнопкой Add to Cart
    const actionsRef = React.useRef<HTMLDivElement | null>(null);
    const [showStickyCta, setShowStickyCta] = React.useState(false);

    React.useEffect(() => {
        const node = actionsRef.current;
        if (!node || typeof IntersectionObserver === "undefined") {
            // если нет IntersectionObserver — просто не показываем панель
            return;
        }
        const io = new IntersectionObserver(
            ([entry]) => {
                // если основной блок НЕ виден, показываем мини-панель
                setShowStickyCta(!entry.isIntersecting);
            },
            {
                root: null,
                threshold: 0.2,               // считаем «видимым», если хотя бы 20% блока в вьюпорте
                rootMargin: "0px 0px -24px 0px", // небольшой запас снизу
            }
        );
        io.observe(node);
        return () => io.disconnect();
    }, []);

    // SKU для избранного: берём из варианта, иначе из товара, иначе fallback
    const sku = (variant as any)?.sku ?? (product as any)?.sku ?? `ID:${product.id}`;
    const [inWish, setInWish] = React.useState<boolean>(() => isInWishlist(sku));

    // при смене варианта/товара - пересчитать
    React.useEffect(() => {
        setInWish(isInWishlist(sku));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sku]);

    const priceCents = Math.max(0, Math.round((parseMoney(variant?.price ?? product.price) || 0) * 100));
    const handleToggleWishlist = React.useCallback(() => {
        const now = toggleWishlistItem({
            sku,
            name: product.name,
            priceCents,
        });
        setInWish(now);
    }, [sku, product.name, priceCents]);

    return (
        <div className="container">
            <div className={cls.product}>
                {/* Крошки */}
                <Breadcrumbs crumbs={categoryCrumbs as any} />
                <div className={cls.productDetails}>
                    <ProductImages
                        images={images}
                        isFavorite={inWish}
                        onToggleFavorite={handleToggleWishlist}
                    />
                    <div className={cls.productInfo}>
                        <div className={cls.productTitle}>
                            <h1 className={cls.productName}>{product.name}</h1>
                            <div className={cls.productMeta}>
                                <div className={cls.productMeta__rating}>
                                    {reviewSummary.count > 0 ? (
                                        <>
                                            <Stars size={18} value={reviewSummary.avg} />
                                            <span className={cls.productMeta__ratingValue}>{reviewSummary.avg.toFixed(1)}</span>
                                            <span className={cls.productMeta__ratingCount}>({reviewSummary.count})</span>
                                        </>
                                    ) : (
                                        <>
                                            <Stars size={18} value={0} />
                                            <span className={cls.productMeta__ratingValue}>0.0</span>
                                            <span className={cls.productMeta__ratingCount}>(0)</span>
                                        </>
                                    )}
                                </div>
                                <div className={cls.productMeta__articleNumber}>
                                    Art.-Nr. {articleNumber}
                                </div>
                            </div>
                            <div className={cls.productPrice}>
                                <div className={cls.meta__container}>
                                    <div className={`${"cls.meta_container--item"}`}>
                                        <div className={cls.price}>
                                            {Number.isFinite(compareAtNum) && compareAtNum > priceNum && <div className={cls.price__old}>
                                                {discountPercent !== null && (
                                                    <span className={cls.price__discount}>-{discountPercent}%</span>
                                                )}
                                                <span className={cls.price__compareAt}>{compareAt}</span>
                                            </div>}
                                            <span className={cls.price__current}>{price}</span>
                                        </div>
                                        <div className={cls.product__infoBelow}>
                                            <span className={cls.productVat}>inkl. MwSt.</span>&nbsp;
                                            <span className={cls.productDelivery}>versandkostenfrei</span>
                                        </div>
                                    </div>
                                    <div className={`${"cls.meta_container--item"}`}>
                                        <div className={cls.product__info}>
                                            {energyClass && datasheetUrl && energyClassArrow && (
                                                <div className={cls.productEnergy}>
                                                    {energyClass && <EnergyLabel energyClassUrl={energyClass} energyClassArrowUrl={energyClassArrow} label="Energieklasse" />}
                                                    {datasheetUrl && <ProductDatasheet pdfUrl={datasheetUrl} label="Produktdatenblatt" />}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={cls.section}>
                                <div className={cls.section__content}>
                                    <div className={cls.available}>
                                        <span className={available ? cls.inStock : cls.outOfStock} />
                                        <span className={available ? cls.inStockText : cls.outOfStockText}>
                                            {available ? "In Stock" : "Out of Stock"}
                                        </span>
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
                            <div className={cls.section}>
                                <h3 className={cls.section__title}>Delivery</h3>
                                <div className={cls.section__content}>
                                    <DeliveryBadge minDays={2} maxDays={4} />
                                </div>
                            </div>
                        </div>
                        <div ref={actionsRef} className={cls.productActions}>
                            <Button
                                className={`${cls.addToCart}`}
                                disabled={!available}
                                onClick={handleAddToCart}
                            >
                                Add to Cart
                            </Button>
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
                                {reviewSummary.count > 0 ? (
                                    <>
                                        <div className={cls.reviewCount}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'left' }}>
                                                {reviewSummary.avg.toFixed(1)}{" "}
                                                <span className={cls.reviewCountText}>({reviewSummary.count})</span>
                                            </div>
                                        </div>
                                        <ReviewsHistogram
                                            data={histogramData}
                                            sort="desc"
                                            locale="de-DE"
                                            ratingLabel={(r) => `${r}`}
                                        />
                                        <div className={cls.reviewActions}>
                                            <Button className={cls.openReviewButton} onClick={() => setIsOpen(true)} size="small">
                                                Open Reviews
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className={cls.reviewCount}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'left' }}>
                                            0.0 <span className={cls.reviewCountText}>(0)</span>
                                        </div>
                                        <ReviewsHistogram
                                            data={histogramData}
                                            sort="desc"
                                            locale="de-DE"
                                            ratingLabel={(r) => `${r}`}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <ProductCarouselRich products={moreProducts} label="More Products"
                        visibleItems={4}
                        onItemClick={(p) => nav(`/product/${p.id}`)}
                    // или, если хотите <a href> вместо onClick:
                    // itemLinkBuilder={(p) => `/product/${p.id}`}
                    />
                </div>
            </div>

            {/* NEW: мини-панель, прижатая снизу как «модалка» */}
            {showStickyCta && (
                <div className={cls.stickyCta} role="region" aria-label="Quick add to cart">
                    <div className={cls.stickyCta__price}>
                        {Number.isFinite(compareAtNum) && compareAtNum > priceNum && <div className={cls.price__old}>
                            {discountPercent !== null && (
                                <span className={cls.price__discount}>-{discountPercent}%</span>
                            )}
                            <span className={cls.price__compareAt}>{compareAt}</span>
                        </div>}
                        <span className={cls.stickyCta__currentPrice}>{price}</span>
                    </div>

                    <Button
                        disabled={!available}
                        onClick={handleAddToCart}
                    >
                        Add to Cart
                    </Button>
                </div>
            )}
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} variant="right" header="Reviews" headerBorder={false}>
                <div className={cls.reviewsContent}>
                    <ReviewForm />
                    <ReviewList reviews={reviews} className={cls.reviewList} />
                </div>
            </Modal>
        </div>
    )
}