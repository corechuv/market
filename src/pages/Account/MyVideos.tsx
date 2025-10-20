import React from "react";
import clsx from "clsx";
import { listMyReviews, posterFromMediaUrl } from "../../services/reviewApi";
import type { ReviewOut } from "../../types/review/review";
import styles from "../Product/Review/ProductReels.module.scss"; // переиспользуем стили
import ReelsLightbox from "../../components/Videos/ReelsLightbox";

type Props = {
  limit?: number;
  className?: string;
  status?: 'pending' | 'approved' | 'rejected'; // опционально
};

export default function MyVideos({ limit = 100, className, status }: Props) {
  const [items, setItems] = React.useState<ReviewOut[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [open, setOpen] = React.useState(false);
  const [startIndex, setStartIndex] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listMyReviews({ type: "reel", status, limit, offset: 0 });
        if (!cancelled) setItems(res);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load my videos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [limit, status]);

  if (loading) return <div>Loading videos…</div>;
  if (error) return <div>Failed to load videos: {error}</div>;
  if (!items.length) return <div>No videos yet.</div>;

  const lightboxData = items.map(r => {
    const v = r.media.find(m => m.kind === "video");
    const poster = posterFromMediaUrl(v?.url);
    return { review: r, url: v?.url || "", poster };
  }).filter(x => !!x.url);

  return (
    <>
      <div className={clsx(styles.grid, className)}>
        {lightboxData.map((it, i) => (
          <button
            key={it.review.id}
            className={styles.thumb}
            onClick={() => { setStartIndex(i); setOpen(true); }}
            aria-label={`Open my reel (${it.review.createdAt})`}
          >
            <div className={styles.thumbInner}>
              {it.poster ? (
                <img src={it.poster} alt="" className={styles.img} loading="lazy" />
              ) : (
                <div className={styles.placeholder}>Processing…</div>
              )}
            </div>
            <div className={styles.caption}>
              {it.review.text}
            </div>
          </button>
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
