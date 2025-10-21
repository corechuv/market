// src/components/Product/Review/ProductReels.tsx
import React from "react";
import clsx from "clsx";
import { listProductReviews } from "../../../services/reviewApi";
import { posterFromMediaUrl } from "../../../services/reviewApi";
import type { ReviewOut } from "../../../types/review/review";
import styles from "./ProductReels.module.scss";
import ReelsLightbox from "../../Videos/ReelsLightbox";
import Preloader from "../../UI/Preloader/Preloader";

type Props = {
  productId: string;
  limit?: number;
  className?: string;
};

export default function ProductReels({ productId, limit = 12, className }: Props) {
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
        const res = await listProductReviews(productId, { type: "reel", limit, offset: 0 });
        if (!cancelled) setItems(res);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load videos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [productId, limit]);

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
      <div className={clsx(styles.list__grid, className)}>
        {lightboxData.map((it, i) => (
          <div key={it.review.id} className={styles.list__item}>
            <button
              className={styles.list__btn}
              onClick={() => { setStartIndex(i); setOpen(true); }}
              aria-label={`Open reel by ${it.review.authorName || "anonymous"}`}
            >
              <div className={styles.list__preview}>
                {it.poster ? (
                  <img src={it.poster} alt="" className={styles["list__preview--img"]} loading="lazy" />
                ) : (
                  <div className={styles["list__preview--placeholder"]}>
                    <Preloader sweepDeg={240} label="Processing.." />
                  </div>
                )}
              </div>
              <div className={styles["list__item--caption"]}>
                <div className={styles["rating__value--small"]}>
                  {it.review.rating}
                </div>
                {it.review.text}
              </div>
            </button>
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
