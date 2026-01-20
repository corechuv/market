// src/utils/useInfiniteList.ts
import { useCallback, useEffect, useRef, useState } from "react";

export function useInfiniteList<T>(
  loadPage: (page: number) => Promise<T[]>,
  pageSize = 50
) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // “перезапускатель” эффекта загрузки
  const [resetToken, setResetToken] = useState(0);

  // --- refs для надёжной синхронизации (без гонок) ---
  const genRef = useRef(0);                 // поколение (каждый reset = новое поколение)
  const bootstrappedRef = useRef(false);    // true после успешной загрузки page=0 текущего поколения
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    const myGen = genRef.current;
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        const res = await loadPage(page);
        if (cancelled) return;
        if (myGen !== genRef.current) return; // устаревший ответ после reset()

        setItems((prev) => (page === 0 ? res : [...prev, ...res]));
        setHasMore(res.length >= pageSize);

        // ✅ фикс: считаем “старт пройден”, только когда реально загрузили page=0
        if (page === 0) bootstrappedRef.current = true;
      } catch {
        if (cancelled) return;
        if (myGen !== genRef.current) return;

        // если loadPage кидает — прекращаем пагинацию (можно добавить retry отдельно)
        setHasMore(false);
      } finally {
        if (!cancelled && myGen === genRef.current) setLoading(false);
      }
    }

    if (hasMore) run();

    return () => {
      cancelled = true;
    };
  }, [page, loadPage, pageSize, hasMore, resetToken]);

  /**
   * ✅ loadNext теперь защищён:
   * - не работает, пока не загрузилась первая страница после reset()
   * - не работает, когда идёт загрузка
   * - не работает, когда hasMore=false
   */
  const loadNext = useCallback(() => {
    if (loadingRef.current) return;
    if (!hasMoreRef.current) return;
    if (!bootstrappedRef.current) return; // 🔥 главное: не даём перепрыгнуть на page=1

    setPage((p) => p + 1);
  }, []);

  const reset = useCallback(() => {
    // новое поколение — “обнуляем” bootstrap
    genRef.current += 1;
    bootstrappedRef.current = false;

    setItems([]);
    setPage(0);
    setHasMore(true);

    // триггерим перезагрузку даже если page уже 0
    setResetToken((x) => x + 1);
  }, []);

  return { items, loading, hasMore, loadNext, reset, page };
}
