// src/components/Home/HomeVideos.tsx
import React from "react";
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
    const v = r.media.find(m => m.kind === "video");
    if (!v?.url) return null;
    return { review: r, url: v.url, poster: posterFromMediaUrl(v.url) };
};

export default function ProductVideos({
    productId,
    limit = 5,
    className,
    label = "Videos",
}: Props) {
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
                const res = await listProductReviews(productId, { type: "reel", limit, offset: 0 });
                if (cancelled) return;
                const mapped = res.map(toItem).filter(Boolean) as Item[];
                setItems(mapped);
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? "Failed to load videos");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [productId, limit]);

    const viewItems = items.map((it, i) => ({
        id: it.review.id,
        poster: it.poster,
        title: it.review.text,
        onClick: () => { ReelsAudio.unlock(); setStartIndex(i); setOpen(true); }
    }));

    return (
        <section className={`${cls.section} ${className || ""}`} aria-label={label}>
            {error && <div>Failed to load videos: {error}</div>}

            <VideoCarousel
                label={label}
                items={viewItems}
                isLoading={loading}
                skeletonCount={limit}
            />

            {!loading && !error && !items.length && <div>No videos yet.</div>}

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
