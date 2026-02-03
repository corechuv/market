// src/pages/Account/MyVideos.tsx
import React from "react";
import clsx from "clsx";
import styles from "./MyVideos.module.scss";
import ReelsLightbox from "../../components/Videos/ReelsLightbox";
import { listMyReels, posterFromMediaUrl } from "../../services/reviewApi";
import type { ReviewOut } from "../../types/review/review";
import { formatViewsCount } from "../../utils/formatViews";

export default function MyVideos() {
    const [items, setItems] = React.useState<ReviewOut[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [open, setOpen] = React.useState(false);
    const [startIndex, setStartIndex] = React.useState(0);

    const load = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await listMyReels({
                status: "approved",
                type: "reel",
                onlyWithVideo: true,
                limit: 100,
            });
            setItems(res);
        } catch (e: any) {
            setError(e?.message ?? "Failed to load my reels");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => { load(); }, [load]);

    if (loading) return <div>Loading my videos…</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!items.length) return <div className={styles.muted}>У вас пока нет видео-отзывов.</div>;

    const lightboxData = items
        .map((r) => {
            const v = r.media.find((m) => m.kind === "video" && m.url);
            const poster = posterFromMediaUrl(v?.url);
            return { review: r, url: v?.url || "", poster };
        })
        .filter((x) => !!x.url);

    return (
        <>
            <div className={clsx(styles.list__grid)}>
                {lightboxData.map((it, i) => (
                    <div key={it.review.id} className={styles.list__item}>
                        <div className={styles.list__watch}>
                            <button
                                className={styles.list__btn}
                                onClick={() => { setStartIndex(i); setOpen(true); }}
                                aria-label="Открыть ролик"
                            >
                                <div className={styles.list__preview}>
                                    {it.poster ? (
                                        <img src={it.poster} alt="" className={styles["list__preview--img"]} loading="lazy" />
                                    ) : (
                                        <div className={styles["list__preview--placeholder"]}>Processing…</div>
                                    )}
                                    <div
                                        className={styles.list__views}
                                        aria-label={`Views: ${typeof it.review.viewsCount === "number" ? it.review.viewsCount : 0}`}
                                    >
                                        {formatViewsCount(it.review.viewsCount)}
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {open && (
                <ReelsLightbox
                    items={lightboxData}
                    startIndex={startIndex}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}
