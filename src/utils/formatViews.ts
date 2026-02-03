// src/utils/formatViews.ts
export function formatViewsCount(value?: number | null) {
  const n = Math.max(0, Math.floor(Number(value || 0)));
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
