import React from "react";
import styles from "./MyReelsSection.module.scss"; // создайте по аналогии с ProductReels.module.scss
import clsx from "clsx";
import CloseIcon from "../../components/Icons/CloseIcon";
import ReelsLightbox from "../../components/Videos/ReelsLightbox";
import { listMyReviews, deleteReview, posterFromMediaUrl } from "../../services/reviewApi";
import type { ReviewOut } from "../../types/review/review";

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
      const res = await listMyReviews({ type: "reel", status: "approved", onlyWithVideo: true, limit: 100 });
      setItems(res);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load my reels");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const onDelete = async (id: string) => {
    if (!confirm("Удалить этот ролик?")) return;
    try {
      await deleteReview(id);
      setItems(prev => prev.filter(r => r.id !== id));
    } catch (e: any) {
      alert(e?.message ?? "Не удалось удалить ролик");
    }
  };

  if (loading) return <div>Loading my reels…</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!items.length) return <div className={styles.muted}>У вас пока нет видео-отзывов.</div>;

  const lightboxData = items.map(r => {
    const v = r.media.find(m => m.kind === "video");
    const poster = posterFromMediaUrl(v?.url);
    return { review: r, url: v?.url || "", poster };
  }).filter(x => !!x.url);

  return (
    <>
      <div className={clsx(styles.grid)}>
        {lightboxData.map((it, i) => (
          <div key={it.review.id} className={styles.thumb}>
            <button
              className={styles.thumbBtn}
              onClick={() => { setStartIndex(i); setOpen(true); }}
              aria-label="Открыть ролик"
            >
              <div className={styles.thumbInner}>
                {it.poster ? (
                  <img src={it.poster} alt="" className={styles.img} loading="lazy" />
                ) : (
                  <div className={styles.placeholder}>Processing…</div>
                )}
              </div>
              <div className={styles.caption}>{it.review.text}</div>
            </button>

            <button
              className={styles.deleteBtn}
              title="Удалить ролик"
              aria-label="Удалить ролик"
              onClick={() => onDelete(it.review.id)}
            >
              <CloseIcon />
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
