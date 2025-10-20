// src/components/Home/HomeVideos.tsx
import React from "react";
import clsx from "clsx";
import { listReelsFeed, posterFromMediaUrl } from "../../services/reviewApi";
import type { ReviewOut } from "../../types/review/review";
// переиспользуем сетку из product reels, чтобы было одинаково
import gridStyles from "../Product/Review/ProductReels.module.scss";
import cls from "./HomeVideos.module.scss";
import ReelsLightbox from "../Videos/ReelsLightbox";

type Props = {
    limit?: number; // по умолчанию 5
    sort?: "new" | "popular" | "trending"; // по умолчанию trending
    className?: string;
    label?: string;
};

type Item = { review: ReviewOut; url: string; poster?: string };

const toItem = (r: ReviewOut): Item | null => {
    const v = r.media.find(m => m.kind === "video");
    if (!v?.url) return null;
    return { review: r, url: v.url, poster: posterFromMediaUrl(v.url) };
};

export default function HomeVideos({
    limit = 5,
    sort = "trending",
    className,
    label = "Trending review videos",
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
                const page = await listReelsFeed({ sort, limit, offset: 0 });
                if (cancelled) return;
                const mapped = page.map(toItem).filter(Boolean) as Item[];
                setItems(mapped);
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? "Failed to load videos");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [limit, sort]);

    return (
        <section className={`${cls.section} ${className}`} aria-label={label}>
            {label ? <h2 className={cls.title}>{label}</h2> : null}

            {loading && <div>Loading videos…</div>}
            {error && <div>Failed to load videos: {error}</div>}
            {!loading && !error && !items.length && <div>No videos yet.</div>}

            {!!items.length && (
                <>
                    <div className={clsx(gridStyles.list__grid, className)}>
                        {items.map((it, i) => (
                            <div key={it.review.id} className={gridStyles.list__item}>
                                <button
                                    className={gridStyles.list__btn}
                                    onClick={() => { setStartIndex(i); setOpen(true); }}
                                    aria-label={`Open reel by ${it.review.authorName || "anonymous"}`}
                                >
                                    <div className={gridStyles.list__preview}>
                                        {it.poster ? (
                                            <img src={it.poster} alt="" className={gridStyles["list__preview--img"]} loading="lazy" />
                                        ) : (
                                            <div className={gridStyles["list__preview--placeholder"]}>
                                                Processing…
                                            </div>
                                        )}
                                    </div>
                                    <div className={gridStyles["list__item--caption"]}>{it.review.text}</div>
                                </button>
                            </div>
                        ))}
                    </div>

                    {open && (
                        <ReelsLightbox
                            items={items}
                            startIndex={startIndex}
                            onClose={() => setOpen(false)}
                        />
                    )}
                </>
            )}
        </section>
    );
}
