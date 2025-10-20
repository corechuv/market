// src/pages/ReelsPage.tsx
import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { listReelsFeed, posterFromMediaUrl, getReviewById } from "../services/reviewApi";
import type { ReviewOut } from "../types/review/review";
import ReelsLightbox from "../components/Videos/ReelsLightbox";

type Item = { review: ReviewOut; url: string; poster?: string };
const mapToItem = (r: ReviewOut): Item | null => {
  const v = r.media.find(m => m.kind === "video");
  if (!v?.url) return null;
  return { review: r, url: v.url, poster: posterFromMediaUrl(v.url) };
};

export default function ReelsPage() {
  const nav = useNavigate();
  const { id: startId } = useParams<{ id?: string }>();
  const [sp] = useSearchParams();
  const sort = (sp.get("sort") as "new" | "popular" | "trending") || "trending";

  const [items, setItems] = React.useState<Item[]>([]);
  const [offset, setOffset] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [moreLoading, setMoreLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);

  // Сброс при смене сортировки или стартового id
  React.useEffect(() => {
    setItems([]);
    setOffset(0);
    setHasMore(true);
    setLoading(true);
  }, [sort, startId]);

  // Дедуп
  const pushDedupe = React.useCallback((arr: Item[]) => {
    setItems(prev => {
      const seen = new Set(prev.map(i => i.review.id));
      const add = arr.filter(i => !seen.has(i.review.id));
      return [...prev, ...add];
    });
  }, []);

  // Начальная загрузка
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // 1) если шарим ссылку на конкретный ролик — подтянем его и покажем мгновенно
        if (startId) {
          try {
            const one = await getReviewById(startId);
            if (!cancelled) {
              const mapped = mapToItem(one);
              setItems(mapped ? [mapped] : []);
            }
          } catch {
            // не нашли — просто продолжим с общей лентой
          }
        }

        // 2) параллельно — первая страница общей ленты
        const page = await listReelsFeed({ sort, limit: 40, offset: 0 });
        if (cancelled) return;
        const mapped = page.map(mapToItem).filter(Boolean) as Item[];
        // если стартового нет — просто показываем стандартную ленту
        if (!startId) {
          setItems(mapped);
        } else {
          // если стартовый уже внутри первой страницы — будет дедуп
          pushDedupe(mapped);
        }
        setOffset(page.length);
        setHasMore(page.length > 0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [sort, startId, pushDedupe]);

  // Догрузка
  const loadMore = React.useCallback(async () => {
    if (moreLoading || !hasMore) return;
    setMoreLoading(true);
    try {
      const page = await listReelsFeed({ sort, limit: 40, offset });
      const mapped = page.map(mapToItem).filter(Boolean) as Item[];
      pushDedupe(mapped);
      setOffset(o => o + page.length);
      setHasMore(page.length > 0);
    } finally {
      setMoreLoading(false);
    }
  }, [sort, offset, hasMore, moreLoading, pushDedupe]);

  // Подгружать, если пользователь подбирается к хвосту массива
  const onIndexChange = (i: number) => {
    if (hasMore && !moreLoading && i >= items.length - 6) {
      loadMore();
    }
  };

  if (loading && !items.length) return null; // можно поставить скелетон

  // стартовый индекс: если шарили ссылку — 0 (мы уже поставили стартовый первым),
  // если нет — тоже 0 (обычная лента)
  const startIndex = 0;

  return (
    <ReelsLightbox
      items={items}
      startIndex={startIndex}
      onClose={() => nav(-1)}
      onIndexChange={onIndexChange}
    />
  );
}
