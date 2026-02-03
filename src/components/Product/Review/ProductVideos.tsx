// src/components/Product/Review/ProductVideos.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { listProductReviews, posterFromMediaUrl } from "../../../services/reviewApi";
import type { ReviewOut } from "../../../types/review/review";
import cls from "./ProductVideos.module.scss";
import VideoCarousel from "../../Videos/VideoCarousel";
import ReelsLightbox from "../../Videos/ReelsLightbox";
import { ReelsAudio } from "../../../utils/reelsAudio";

type Props = {
    limit?: number;
    className?: string;
    label?: string;
    productId: string;
};

type Item = { review: ReviewOut; url: string; poster?: string };

const toItem = (r: ReviewOut): Item | null => {
    const v = r.media.find((m) => m.kind === "video");
    if (!v?.url) return null;
    return { review: r, url: v.url, poster: posterFromMediaUrl(v.url) };
};

export default function ProductVideos({
    productId,
    limit = 5,
    className,
    label,
}: Props) {
    const { t } = useTranslation("product");

    // если label не передали пропсом — берем из product.json
    const resolvedLabel = label || t("reviews.videoLabel");

    const [items, setItems] = React.useState<Item[]>([]);
    const [open, setOpen] = React.useState(false);
    const [startIndex, setStartIndex] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await listProductReviews(productId, {
                    type: "reel",
                    limit,
                    offset: 0,
                });
                if (cancelled) return;
                const mapped = res.map(toItem).filter(Boolean) as Item[];
                setItems(mapped);
            } catch (e: any) {
                if (!cancelled) {
                    // текст ошибки локализуем через i18n, поэтому тут можно не хардкодить
                    setError(e?.message ?? null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [productId, limit]);

    const viewItems = items.map((it, i) => ({
        id: it.review.id,
        poster: it.poster,
        title: it.review.text,
        viewsCount: it.review.viewsCount,
        onClick: () => {
            ReelsAudio.unlock();
            setStartIndex(i);
            setOpen(true);
        },
    }));

    return (
        <section
            className={`${cls.section} ${className || ""}`}
            aria-label={resolvedLabel}
        >
            {error && (
                <div>
                    {t("reviews.videoError", { error })}
                </div>
            )}

            <VideoCarousel
                label={resolvedLabel}
                items={viewItems}
                isLoading={loading}
                skeletonCount={limit}
            />

            {!loading && !error && !items.length && (
                <div>{t("reviews.videoEmpty")}</div>
            )}

            {open && (
                <ReelsLightbox
                    items={items}
                    startIndex={startIndex}
                    onClose={() => setOpen(false)}
                />
            )}
        </section>
    );
}
