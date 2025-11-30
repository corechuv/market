// src/utils/useInfiniteList.ts
import { useCallback, useEffect, useState } from "react";

export function useInfiniteList<T>(
  loadPage: (page: number) => Promise<T[]>,
  pageSize = 50
) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        const res = await loadPage(page);
        if (cancelled) return;

        setItems((prev) => (page === 0 ? res : [...prev, ...res]));
        if (res.length < pageSize) setHasMore(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (hasMore) {
      run();
    }

    return () => {
      cancelled = true;
    };
  }, [page, loadPage, pageSize, hasMore]);

  const loadNext = useCallback(() => {
    if (!loading && hasMore) setPage((p) => p + 1);
  }, [loading, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
  }, []);

  return { items, loading, hasMore, loadNext, reset, page };
}
