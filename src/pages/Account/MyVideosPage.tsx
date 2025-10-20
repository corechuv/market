// src/pages/Account/MyVideosPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { listMyReels, posterFromMediaUrl } from "../../services/reviewApi";
import type { ReviewOut } from "../../types/review/review";
import ReelsLightbox from "../../components/Videos/ReelsLightbox";

type Item = { review: ReviewOut; url: string; poster?: string };

export default function MyVideosPage() {
  const nav = useNavigate();
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await listMyReels({
          status: "approved",
          type: "reel",
          onlyWithVideo: true,
          limit: 200,
        });
        if (cancelled) return;
        const mapped = res
          .map((r) => {
            const v = r.media.find((m) => m.kind === "video" && m.url);
            return v?.url ? { review: r, url: v.url, poster: posterFromMediaUrl(v.url) } : null;
          })
          .filter(Boolean) as Item[];
        setItems(mapped);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return null;
  if (!items.length) return null;

  return (
    <ReelsLightbox
      items={items}
      startIndex={0}
      onClose={() => nav(-1)}
    />
  );
}
