// src/pages/Product/ProductPage.tsx
import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import type { SeoConfig } from "../../types/seo/seoConfig";
import { useTranslation } from "react-i18next";

import { getProductById, getMoreProducts } from "../../services/productService";
import { buildSpecs, getInitialVariant } from "../../specs/builders";
import { parseMoney } from "../../types/helpers/parseMoney";
import type { Product, ProductVariant } from "../../types/product";
import { listProductReviews } from "../../services/reviewApi";
import { Tabs, type TabItem } from "../../components/UI/Tabs";

import cls from "./ProductPage.module.scss";

import Button from "../../components/UI/Button";
import Modal from "../../components/Modal/Modal";
import DeliveryBadge from "../../components/Product/DeliveryBadge";
import SpecTable from "../../components/Product/SpecTable";
import VariantPicker from "../../components/Product/Details/VariantPicker";
import ProductDatasheet from "../../components/Product/Details/ProductDatasheet";
import EnergyLabel from "../../components/Product/Details/EnergyLabel";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { toCartLine } from "../../services/cartAdapter";
import ProductCarousel from "../../components/Product/ProductCarousel";

import ProductPlainReviews from "../../components/Product/Review/ProductPlainReviews";
import ReviewComposer from "../../components/Product/Review/ReviewComposer";
import RatingBadge from "../../components/Rating/RatingBadge";
import Page from "../../components/UI/Page/Page";
import Footer from "../../components/Footer/Footer";
import ProductVideos from "../../components/Product/Review/ProductVideos";
import ProductImages from "../../components/Product/Details/ProductImages";

type TabKey = "details" | "reviews" | "other";

const normalizeTab = (tabParam?: string): TabKey => {
  switch (tabParam) {
    case "reviews":
      return "reviews";
    case "other":
      return "other";
    default:
      return "details";
  }
};

export default function ProductPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const { productId, tab } = useParams<{ productId: string; tab?: string }>();
  const { t } = useTranslation("product");

  const [activeTab, setActiveTab] = React.useState<TabKey>(normalizeTab(tab));

  const productTabs = React.useMemo<TabItem<TabKey>[]>(() => {
    return [
      { key: "details", label: t("tabs.details") },
      { key: "other", label: t("tabs.other") },
      { key: "reviews", label: t("tabs.reviews") },
    ];
  }, [t]);

  React.useEffect(() => {
    setActiveTab(normalizeTab(tab));
  }, [tab]);

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

  // ✅ variant из querystring
  const variantFromUrl = React.useMemo(() => {
    const sp = new URLSearchParams(loc.search);
    return sp.get("variant");
  }, [loc.search]);

  const [variant, setVariant] = React.useState<ProductVariant | undefined>(undefined);

  // ✅ выбираем вариант: из URL → иначе default
  React.useEffect(() => {
    if (!product) return;

    if (variantFromUrl) {
      const found = product.variants?.find((v) => v.id === variantFromUrl);
      setVariant(found ?? getInitialVariant(product));
      return;
    }

    setVariant(getInitialVariant(product));
  }, [product?.id, variantFromUrl]);

  // ✅ когда пользователь меняет вариант — обновим querystring (чтобы ссылку можно было копировать)
  const handleVariantChange = React.useCallback(
    (v?: ProductVariant) => {
      setVariant(v);
      if (!v?.id) return;
      const sp = new URLSearchParams(loc.search);
      sp.set("variant", v.id);
      nav(`${loc.pathname}?${sp.toString()}`, { replace: true });
    },
    [nav, loc.pathname, loc.search]
  );

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

  const [isOpenUpload, setIsOpenUpload] = React.useState(false);

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
  const toast = useToast();

  const handleAddToCart = React.useCallback(() => {
    if (!product) return;
    const line = toCartLine(product, variant, 1);
    add(line);
    toast.success(t("toast.addedToCart"));
  }, [product, variant, add, toast, t]);

  const [reviewAvg, setReviewAvg] = React.useState<number | null>(null);
  const [reviewCount, setReviewCount] = React.useState<number>(0);

  const seo: SeoConfig | null = React.useMemo(() => {
    if (!product) return null;

    const name = product.name ?? "";
    const short =
      (product.shortDescription && product.shortDescription[0]) ||
      (typeof product.description === "string" ? product.description : "") ||
      "";

    if (activeTab === "reviews") {
      return {
        title: t("seo.reviewsTitle", { name }) || t("seo.title", { name }),
        description:
          t("seo.reviewsDescription", { name, short }) ||
          t("seo.description", { name, short }),
      };
    }

    if (activeTab === "other") {
      return {
        title: t("seo.otherTitle", { name }) || t("seo.title", { name }),
        description:
          t("seo.otherDescription", { name, short }) ||
          t("seo.description", { name, short }),
      };
    }

    return {
      title: t("seo.detailsTitle", { name }) || t("seo.title", { name }),
      description:
        t("seo.detailsDescription", { name, short }) ||
        t("seo.description", { name, short }),
    };
  }, [product, activeTab, t]);

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

  if (loading && !product) {
    return (
      <Page padding={false}>
        <div className={cls.product}></div>
      </Page>
    );
  }

  if (error || !product) {
    return (
      <>
        <Helmet>
          <title>Produkt nicht gefunden – Dashedo</title>
          <meta name="description" content="Das gesuchte Produkt wurde nicht gefunden." />
          <meta name="robots" content="noindex,follow" />
        </Helmet>
        <Page padding={false}>
          <div className={cls.product} />
        </Page>
      </>
    );
  }

  const descriptionHtml =
    typeof product.description === "string" && product.description.trim().length > 0
      ? product.description
      : `<p>${t("sections.description.empty")}</p>`;

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    if (!product) return;

    if (key === "reviews") nav(`/product/${product.id}/reviews`, { replace: false });
    else if (key === "other") nav(`/product/${product.id}/other`, { replace: false });
    else nav(`/product/${product.id}`, { replace: false });
  };

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

  const bannerImages = images.map((src, idx) => ({
    src,
    alt: product.name ? `${product.name} – фото ${idx + 1}` : `Фото ${idx + 1}`,
  }));

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
  const manufacturerNumber = variant?.sku ?? undefined;

  const canonicalUrl = `https://dashedo.com/product/${product.id}`;
  const primaryImage = images[0];

  const seoTitle = seo?.title || product.name || "Produkt – Dashedo";
  const seoDescription =
    seo?.description ||
    (product.description as string | undefined) ||
    (product.shortDescription && product.shortDescription.join(" ")) ||
    "";

  const numericPrice =
    typeof priceNum === "number" && Number.isFinite(priceNum) ? priceNum : null;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images,
    sku: articleNumber,
    description: seoDescription,
    brand: (product as any).brand
      ? { "@type": "Brand", name: (product as any).brand }
      : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: numericPrice !== null ? String(numericPrice) : undefined,
      availability: available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: canonicalUrl,
    },
    aggregateRating:
      ratingValue && reviewCount > 0
        ? { "@type": "AggregateRating", ratingValue, reviewCount }
        : undefined,
  };

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="product" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        {primaryImage && <meta property="og:image" content={primaryImage} />}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {primaryImage && <meta name="twitter:image" content={primaryImage} />}

        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      </Helmet>

      <Page padding={false}>
        <div className={cls.product}>
          <div className={cls.productDetails}>
            <Tabs<TabKey>
              items={productTabs}
              activeKey={activeTab}
              onChange={handleTabChange}
              ariaLabel={t("tabs.ariaLabel")}
            />

            {activeTab === "details" && (
              <>
                <div style={{ marginBottom: 10, padding: "0 var(--gap)" }}>
                  <div className={cls.productMeta}>
                    <RatingBadge size="small" ratingValue={ratingValue} reviewCount={reviewCount} />
                    <div className={cls.productMeta__articleNumber}>
                      {t("meta.articlePrefix")} {articleNumber}
                    </div>
                  </div>
                  <h1 className={cls.productName}>{product.name}</h1>
                </div>
                <div style={{ padding: "0 var(--gap)" }}>
                  <ProductImages
                    images={bannerImages}
                    interval={4500}
                    autoPlay={true}
                    loop
                    pauseOnHover
                    showControls
                    showDots
                    rounded
                    overlay="gradient"
                    aspectRatio="16 / 9"
                    fit="contain"
                  />
                </div>
                <div className={cls.productInfo} style={{ padding: "0 var(--gap)" }}>
                  <div className={cls.productTitle}>
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
                            <span className={cls.productVat}>{t("price.vatIncluded")}</span>&nbsp;
                            <span className={cls.productDelivery}>{t("price.freeShipping")}</span>
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
                            {available
                              ? t("availability.inStock")
                              : t("availability.outOfStock")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {hasVariants && (
                      <div className={cls.section}>
                        <div className={cls.section__content}>
                          <VariantPicker
                            product={product}
                            value={variant}
                            onChange={handleVariantChange}
                          />
                        </div>
                      </div>
                    )}

                    <div className={cls.section}>
                      <h3 className={cls.section__title}>
                        {t("sections.delivery.title")}
                      </h3>
                      <div className={cls.section__content}>
                        <DeliveryBadge minDays={2} maxDays={4} />
                      </div>
                    </div>
                  </div>

                  <div ref={actionsRef} className={cls.productActions}>
                    <Button
                      className={cls.addToCart}
                      disabled={!available}
                      onClick={handleAddToCart}
                    >
                      {t("actions.addToCart")}
                    </Button>
                  </div>
                </div>

                <div className={cls.section} style={{ padding: "0 var(--gap)" }}>
                  <h3 className={cls.section__title}>
                    {t("sections.shortDescription.title")}
                  </h3>
                  <div className={cls.section__content}>
                    <ul className={cls.list}>
                      {product.shortDescription?.length ? (
                        product.shortDescription.map((line, idx) => (
                          <li key={idx}>{line}</li>
                        ))
                      ) : (
                        <li>{t("sections.shortDescription.empty")}</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className={cls.section} style={{ padding: "0 var(--gap)" }}>
                  <div className={cls.section__content}>
                    {t("sections.meta.manufacturerNumber")}: {manufacturerNumber}
                  </div>
                </div>

                <div className={cls.section} style={{ padding: "0 var(--gap)" }}>
                  <h3 className={cls.section__title}>
                    {t("sections.specifications.title")}
                  </h3>
                  <div className={cls.section__content}>
                    <SpecTable
                      specs={entries}
                      dictionary={dictionary}
                      showEmpty="dash"
                      mergeStrategy="dict-first"
                    />
                  </div>
                </div>

                <div className={cls.section} style={{ padding: "0 var(--gap)" }}>
                  <h3 className={cls.section__title}>
                    {t("sections.description.title")}
                  </h3>
                  <div className={cls.section__content}>
                    <div
                      className={cls.section__description}
                      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === "other" && <></>}

            {activeTab === "reviews" && (
              <>
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
                          {t("reviews.addButton")}
                        </Button>
                      </div>
                      <ProductVideos
                        label={t("reviews.videoLabel")}
                        limit={10}
                        productId={product.id}
                      />
                      <ProductPlainReviews productId={product.id} limit={5} />
                    </div>
                  </div>
                </div>
              </>
            )}

            <ProductCarousel
              products={moreProducts}
              label={t("related.title")}
              onItemClick={(p) => nav(`/product/${p.id}`)}
            />
          </div>
        </div>

        {showStickyCta && (
          <div
            className={cls.stickyCta}
            role="region"
            aria-label={t("sticky.ariaLabel")}
          >
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
              {t("actions.addToCart")}
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
    </>
  );
}
