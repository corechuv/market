// src/components/Product/Review/ProductPlainReviews.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { listProductReviews } from "../../../services/reviewApi";
import type { ReviewOut } from "../../../types/review/review";
import ReviewList, { type Review as UIReview } from "../ReviewList"; // путь подправьте под ваш проект

type Props = {
  productId: string;
  limit?: number;
  className?: string;
};

export default function ProductPlainReviews({ productId, limit = 10, className }: Props) {
  const { t, i18n: i18next } = useTranslation("product");

  const [items, setItems] = React.useState<ReviewOut[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await listProductReviews(productId, { type: "plain", limit, offset: 0 });
        if (!cancelled) setItems(res);
      } catch (e: any) {
        if (!cancelled) {
          // сюда можно пробрасывать текст ошибки, но базовый текст — из i18n
          setError(e?.message ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [productId, limit]);

  if (loading) {
    return <div>{t("reviews.loading")}</div>;
  }

  if (error) {
    // строка с плейсхолдером {{error}} в product.json
    return <div>{t("reviews.error", { error })}</div>;
  }

  if (!items.length) {
    return <div>{t("reviews.empty")}</div>;
  }

  // map API -> UI type expected by ReviewList
  const uiReviews: UIReview[] = items.map((r) => ({
    id: r.id,
    reviewerName: undefined, // если есть authorName — подставь сюда
    date: r.createdAt,
    rating: r.rating,
    comment: r.text ?? "",
    productId,
    verified: !!r.verified,
    photos: r.media?.filter((m) => m.kind === "photo").map((m) => m.url) ?? [],
    helpfulCount: typeof r.helpfulCount === "number" ? r.helpfulCount : undefined,
  }));

  return (
    <ReviewList
      className={className}
      reviews={uiReviews}
      showVerifiedBadge
      // локализуем подписи через i18next
      i18n={{
        ratingLabel: (rating) => t("reviews.ratingLabel", { rating }),
        verified: t("reviews.verified"),
        helpful: (count) => t("reviews.helpful", { count }),
        anonymous: t("reviews.anonymous"),
        formatDate: (d) =>
          new Intl.DateTimeFormat(i18next.language, {
            year: "numeric",
            month: "short",
            day: "2-digit",
          }).format(d),
      }}
      ariaLabel={t("reviews.ariaLabel")}
    />
  );
}
