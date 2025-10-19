// src/pages/Product/ProductPage.tsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, getMoreProducts } from "../../services/productService";
import { getReviewsById, getReviewSummaryById } from "../../services/reviewService";
import { getBreadcrumbs } from "../../services/categoryService";
import { buildSpecs, getInitialVariant } from "../../specs/builders";
import { parseMoney } from "../../types/helpers/parseMoney";
import type { Product, ProductVariant } from "../../types/product";

import cls from "./ProductPage.module.scss";

import ProductImages from "../../components/Product/ProductImages";
import Button from "../../components/UI/Button";
import Modal from "../../components/Modal/Modal";
import ReviewList from "../../components/Product/ReviewList";
import ReviewForm from "../../components/Product/ReviewForm";
import Breadcrumbs from "../../components/Common/Breadcrumbs";
import DeliveryBadge from "../../components/Product/DeliveryBadge";
import SpecTable from "../../components/Product/SpecTable";
import VariantPicker from "../../components/Product/Details/VariantPicker";
import Stars from "../../components/Product/Stars";
import ProductDatasheet from "../../components/Product/Details/ProductDatasheet";
import EnergyLabel from "../../components/Product/Details/EnergyLabel";
import ReviewsHistogram from "../../components/Product/Details/ReviewsHistogram";
import { useCart } from "../../context/CartContext";
import { toCartLine } from "../../services/cartAdapter";
import ProductCarouselRich from "../../components/Product/ProductCarouselRich";

import ProductReels from "../../components/Product/Review/ProductReels";
import ProductPlainReviews from "../../components/Product/Review/ProductPlainReviews";
import ReviewComposer from "../../components/Product/Review/ReviewComposer";

export default function ProductPage() {
  const nav = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  // --- загрузка товара ---
  const [product, setProduct] = React.useState<Product | undefined>(undefined);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!productId) return;
      setLoading(true);
      setError(null);
      try {
        const p = await getProductById(productId);
        if (!cancelled) setProduct(p);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  // --- крошки по первичной категории (после загрузки товара) ---
  const categoryCrumbs = React.useMemo(() => {
    if (!product) return [];
    const primaryCategoryId = product.categoryId ?? product.categoryIds?.[0];
    return primaryCategoryId ? (getBreadcrumbs(primaryCategoryId) as any) : [];
  }, [product]);

  // --- варианты ---
  const [variant, setVariant] = React.useState<ProductVariant | undefined>(undefined);
  React.useEffect(() => {
    if (product) setVariant(getInitialVariant(product));
  }, [product?.id]); // при смене товара — переинициализировать вариант

  // --- ещё товары (после загрузки товара) ---
  const [moreProducts, setMoreProducts] = React.useState<Product[]>([]);
  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!product?.id) return;
      try {
        const res = await getMoreProducts({
          currentId: product.id,
          limit: 8,
          availableOnly: true,
          shuffle: true,
          fillFromAllIfShort: true,
          // categoryId: product.categoryId, // при желании можно зафиксировать
        });
        if (!cancelled) setMoreProducts(res);
      } catch {
        if (!cancelled) setMoreProducts([]);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [product?.id]);

  // --- отзывы (синхронный мок/сервис) ---
  const reviews = React.useMemo(
    () => (productId ? getReviewsById(String(productId)) : []),
    [productId]
  );

  const reviewSummary = React.useMemo(
    () =>
      productId
        ? getReviewSummaryById(String(productId))
        : { avg: 0, count: 0, histogram: [0, 0, 0, 0, 0] },
    [productId]
  );

  const histogramData = React.useMemo(
    () => reviewSummary.histogram.map((count: number, i: number) => ({ rating: i + 1, count })),
    [reviewSummary.histogram]
  );

  const [isOpen, setIsOpen] = React.useState(false);

  // sticky CTA visibility
  const actionsRef = React.useRef<HTMLDivElement | null>(null);
  const [showStickyCta, setShowStickyCta] = React.useState(false);
  React.useEffect(() => {
    const node = actionsRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting),
      { root: null, threshold: 0.2, rootMargin: "0px 0px -24px 0px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const { add } = useCart();
  const handleAddToCart = React.useCallback(() => {
    if (!product) return;
    const line = toCartLine(product, variant, 1);
    add(line);
  }, [product, variant, add]);

  // --- загрузочные состояния (после объявления всех хуков!) ---
  if (loading) {
    return (
      <div className="container">
        <div className={cls.product}>
          <Breadcrumbs crumbs={[]} />
          <h2>Loading…</h2>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container">
        <div className={cls.product}>
          <Breadcrumbs crumbs={categoryCrumbs as any} />
          <h2>{error ?? "Product not found"}</h2>
        </div>
      </div>
    );
  }

  // --- вычисления под UI (теперь товар точно есть) ---
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

  const images = (() => {
    const vImgs = variant?.images ?? [];
    const pImgs = product?.images ?? (product?.imageUrl ? [product.imageUrl] : []);
    const seen = new Set<string>();
    const merged: string[] = [];
    for (const u of [...vImgs, ...pImgs]) {
      if (u && !seen.has(u)) {
        seen.add(u);
        merged.push(u);
      }
    }
    return merged;
  })();
  const price = variant?.price ?? product.price;
  const compareAt = variant?.compareAtPrice;
  const available = (variant?.available ?? product.available) ?? false;

  const { entries, dictionary } = buildSpecs(product, { variant });

  const rawPrice = variant?.price ?? product.price;
  const rawCompareAt = variant?.compareAtPrice;
  const priceNum = parseMoney(rawPrice);
  const compareAtNum = parseMoney(rawCompareAt);
  const discountPercent =
    Number.isFinite(priceNum) &&
      Number.isFinite(compareAtNum) &&
      (compareAtNum as number) > 0 &&
      (priceNum as number) < (compareAtNum as number)
      ? Math.round(((compareAtNum! - priceNum!) / compareAtNum!) * 100)
      : null;

  const articleNumber = product.articleNumber ?? undefined;
  const energyClassArrow = variant?.energyClassArrowUrl ?? product.energyClassArrowUrl;
  const energyClass = variant?.energyClassUrl ?? product.energyClassUrl;
  const datasheetUrl = variant?.datasheetPdfUrl ?? product.datasheetPdfUrl;

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

              <div className={cls.productMeta}>
                <div className={cls.productMeta__rating}>
                  {reviewSummary.count > 0 ? (
                    <>
                      <Stars size={18} value={reviewSummary.avg} />
                      <span className={cls.productMeta__ratingValue}>
                        {reviewSummary.avg.toFixed(1)}
                      </span>
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
                <div className={cls.productMeta__articleNumber}>Art.-Nr. {articleNumber}</div>
              </div>

              <div className={cls.productPrice}>
                <div className={cls.meta__container}>
                  <div className={"cls.meta_container--item"}>
                    <div className={cls.price}>
                      {!!discountPercent && compareAt && (
                        <div className={cls.price__old}>
                          <span className={cls.price__discount}>-{discountPercent}%</span>
                          <span className={cls.price__compareAt}>{compareAt}</span>
                        </div>
                      )}
                      <span className={cls.price__current}>{price}</span>
                    </div>
                    <div className={cls.product__infoBelow}>
                      <span className={cls.productVat}>inkl. MwSt.</span>&nbsp;
                      <span className={cls.productDelivery}>versandkostenfrei</span>
                    </div>
                  </div>

                  <div className={"cls.meta_container--item"}>
                    <div className={cls.product__info}>
                      {(energyClass || energyClassArrow || datasheetUrl) && (
                        <div className={cls.productEnergy}>
                          {(energyClass || energyClassArrow) && (
                            <EnergyLabel
                              energyClassUrl={energyClass || undefined}
                              energyClassArrowUrl={energyClassArrow || undefined}
                              label="Energieklasse"
                            />
                          )}
                          {datasheetUrl && (
                            <ProductDatasheet pdfUrl={datasheetUrl} label="Produktdatenblatt" />
                          )}
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
                    <VariantPicker product={product} value={variant} onChange={setVariant} />
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
              <Button className={cls.addToCart} disabled={!available} onClick={handleAddToCart}>
                Add to Cart
              </Button>
            </div>
          </div>

          <div className={cls.section}>
            <h3 className={cls.section__title}>Short description</h3>
            <div className={cls.section__content}>
              <ul className={cls.list}>
                {product.shortDescription?.length ? (
                  product.shortDescription.map((line, idx) => <li key={idx}>{line}</li>)
                ) : (
                  <li>No short description available for this product.</li>
                )}
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
              <p>{product.description || "No description available for this product."}</p>
            </div>
          </div>

          <div className={cls.section}>
            <h3 className={cls.section__title}>Reviews</h3>
            <div className={cls.section__content}>
              <div className={cls.reviewsHeader}>
                {reviewSummary.count > 0 ? (
                  <>
                    <div className={cls.reviewCount}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          justifyContent: "left",
                        }}
                      >
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
                      <Button
                        className={cls.openReviewButton}
                        onClick={() => setIsOpen(true)}
                        size="small"
                      >
                        Open Reviews
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className={cls.reviewCount}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        justifyContent: "left",
                      }}
                    >
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

          {/* === Video Reels (server) === */}
          <div className={cls.section}>
            <h3 className={cls.section__title}>Review videos</h3>
            <div className={cls.section__content}>
              <ProductReels productId={product.id} limit={4} />
            </div>
          </div>

          {/* === Plain Reviews (server) — превью === */}
          <div className={cls.section}>
            <h3 className={cls.section__title}>Recent customer reviews</h3>
            <div className={cls.section__content}>
              <ReviewComposer productId={product.id} />
              <ProductPlainReviews productId={product.id} limit={5} />
            </div>
          </div>

          <ProductCarouselRich
            products={moreProducts}
            label="More Products"
            visibleItems={4}
            onItemClick={(p) => nav(`/product/${p.id}`)}
          />
        </div>
      </div>

      {showStickyCta && (
        <div className={cls.stickyCta} role="region" aria-label="Quick add to cart">
          <div className={cls.stickyCta__price}>
            {!!discountPercent && compareAt && (
              <div className={cls.price__old}>
                <span className={cls.price__discount}>-{discountPercent}%</span>
                <span className={cls.price__compareAt}>{compareAt}</span>
              </div>
            )}
            <span className={cls.stickyCta__currentPrice}>{price}</span>
          </div>
          <Button disabled={!available} onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant="right"
        header="Reviews"
        headerBorder={false}
      >
        <div className={cls.reviewsContent}>
          <ReviewForm />
          <ReviewList reviews={reviews} className={cls.reviewList} />
        </div>
      </Modal>
    </div>
  );
}
