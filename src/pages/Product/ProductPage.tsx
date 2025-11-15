// src/pages/Product/ProductPage.tsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, getMoreProducts } from "../../services/productService";
import { getBreadcrumbs } from "../../services/categoryService";
import { buildSpecs, getInitialVariant } from "../../specs/builders";
import { parseMoney } from "../../types/helpers/parseMoney";
import type { Product, ProductVariant } from "../../types/product";
import { listProductReviews } from "../../services/reviewApi";
import { Tabs, type TabItem } from "../../components/UI/Tabs";

import cls from "./ProductPage.module.scss";

import ProductImages from "../../components/Product/ProductImages";
import Button from "../../components/UI/Button";
import Modal from "../../components/Modal/Modal";
import Breadcrumbs from "../../components/Common/Breadcrumbs";
import DeliveryBadge from "../../components/Product/DeliveryBadge";
import SpecTable from "../../components/Product/SpecTable";
import VariantPicker from "../../components/Product/Details/VariantPicker";
import ProductDatasheet from "../../components/Product/Details/ProductDatasheet";
import EnergyLabel from "../../components/Product/Details/EnergyLabel";
import { useCart } from "../../context/CartContext";
import { toCartLine } from "../../services/cartAdapter";
import ProductCarousel from "../../components/Product/ProductCarousel";

import ProductPlainReviews from "../../components/Product/Review/ProductPlainReviews";
import ReviewComposer from "../../components/Product/Review/ReviewComposer";
import RatingBadge from "../../components/Rating/RatingBadge";
import Page from "../../components/UI/Page/Page";
import Footer from "../../components/Footer/Footer";
import ProductVideos from "../../components/Product/Review/ProductVideos";

type TabKey = "details" | "reviews";

const productTabs: TabItem<TabKey>[] = [
  { key: "details", label: "Details" },
  { key: "reviews", label: "Reviews" },
];

const normalizeTab = (tabParam?: string): TabKey => {
  switch (tabParam) {
    case "reviews":
      return "reviews";
    default:
      return "details";
  }
};

export default function ProductPage() {
  const nav = useNavigate();
  const { productId, tab } = useParams<{ productId: string; tab?: string }>();

  // --- табы ---
  const [activeTab, setActiveTab] = React.useState<TabKey>(normalizeTab(tab));

  React.useEffect(() => {
    setActiveTab(normalizeTab(tab));
  }, [tab]);

  // --- загрузка товара ---
  const [product, setProduct] = React.useState<Product | undefined>(undefined);
  const [, setLoading] = React.useState<boolean>(true);
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
          // categoryId: product.categoryId,
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

  // --- модалка отзыва ---
  const [isOpenUpload, setIsOpenUpload] = React.useState(false);

  // --- sticky CTA visibility ---
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

  // --- корзина ---
  const { add } = useCart();
  const handleAddToCart = React.useCallback(() => {
    if (!product) return;
    const line = toCartLine(product, variant, 1);
    add(line);
  }, [product, variant, add]);

  // --- агрегаты отзывов (средняя оценка + количество всех типов) ---
  // ВАЖНО: эти хуки объявлены выше любых ранних return!
  const [reviewAvg, setReviewAvg] = React.useState<number | null>(null);
  const [reviewCount, setReviewCount] = React.useState<number>(0);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!product?.id) {
        setReviewAvg(null);
        setReviewCount(0);
        return;
      }

      const LIMIT = 200;
      let offset = 0;
      let sum = 0;
      let cnt = 0;

      try {
        while (true) {
          // без type — получим plain + reel
          const page = await listProductReviews(product.id, { limit: LIMIT, offset });
          if (cancelled) return;
          if (!page.length) break;

          for (const r of page) {
            if (typeof r.rating === "number") {
              sum += r.rating;
              cnt += 1;
            }
          }

          if (page.length < LIMIT) break;
          offset += page.length;
        }

        if (!cancelled) {
          setReviewCount(cnt);
          setReviewAvg(cnt ? sum / cnt : 0);
        }
      } catch {
        if (!cancelled) {
          setReviewCount(0);
          setReviewAvg(0);
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [product?.id]);

  if (error || !product) {
    return (
      <Page>
        <div className="container">
          <div className={cls.product}>
            <Breadcrumbs crumbs={categoryCrumbs as any} />
            {/*<h2>{error ?? "Product not found"}</h2>*/}
          </div>
        </div>
      </Page>
    );
  }

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    if (!product) return;

    if (key === "reviews") {
      nav(`/product/${product.id}/reviews`, { replace: false });
    } else {
      // details по умолчанию без суффикса
      nav(`/product/${product.id}`, { replace: false });
    }
  };

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

  const ratingValue = reviewAvg !== null ? Math.round(reviewAvg * 10) / 10 : null;

  return (
    <Page padding={true}>
      <div className={cls.product}>
        {/*
        <Breadcrumbs crumbs={categoryCrumbs as any} />
        */}

        <div className={cls.productDetails}>
          <ProductImages images={images} />

          <div style={{ display: "none" }}>
            <Tabs<TabKey>
              items={productTabs}
              activeKey={activeTab}
              onChange={handleTabChange}
              ariaLabel="Product sections"
            />
          </div>

          {activeTab === "details" && (
            <>
              <div className={cls.productInfo}>
                <div className={cls.productTitle}>
                  <div style={{ marginBottom: "10px" }}>
                    <h1 className={cls.productName}>{product.name}</h1>
                    <div className={cls.productMeta}>
                      <RatingBadge size="small" ratingValue={ratingValue} reviewCount={reviewCount} />
                      <div className={cls.productMeta__articleNumber}>Art.-Nr.: {articleNumber}</div>
                    </div>
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
                                  className={cls.energyLabel}
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
            </>
          )}

          {activeTab === "reviews" && (
            <>
              {/* === Plain Reviews (server) — превью === */}
              <div className={cls.section}>
                <div className={cls.section__content}>
                  <div className={cls.reviews}>
                    <div className={cls.rating}>
                      <RatingBadge
                        size="default"
                        ratingValue={ratingValue}
                        reviewCount={reviewCount}
                      />
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => setIsOpenUpload(true)}
                      >
                        Add review
                      </Button>
                    </div>
                    <ProductPlainReviews productId={product.id} limit={5} />
                  </div>
                </div>
              </div>

              <ProductVideos label="Video reviews" limit={10} productId={product.id} />
            </>
          )}

          <ProductCarousel
            products={moreProducts}
            label="More Products"
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
        isOpen={isOpenUpload}
        onClose={() => setIsOpenUpload(false)}
        variant="center"
        headerBorder={false}
        bodyStyles={true}
      >
        <ReviewComposer productId={product.id} />
      </Modal>
      <Footer />
    </Page>
  );
}
