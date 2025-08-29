// services/reviewService.ts
import { reviews } from "../data/reviews";
import type { Review } from "../types/review";

export function getReviewsById(productId: string): Review[] {
  return reviews.filter(r => r.productId === productId);
}

export type ReviewSummary = {
  count: number;
  sum: number;
  avg: number; // округлено до 1 знака
  histogram: [number, number, number, number, number]; // 1..5 звёзд
};

export function getReviewSummaryById(productId: string): ReviewSummary {
  const list = getReviewsById(productId);
  const count = list.length;
  const sum = list.reduce((acc, r) => acc + (r.rating || 0), 0);
  const avgRaw = count ? sum / count : 0;
  const histogram: ReviewSummary["histogram"] = [0, 0, 0, 0, 0];
  for (const r of list) histogram[(r.rating ?? 1) - 1]++;

  return {
    count,
    sum,
    avg: Math.round(avgRaw * 10) / 10, // один знак после запятой
    histogram,
  };
}

/** one-shot карта для списков, чтобы не фильтровать по productId на каждый элемент */
export function getReviewSummaryMap(): Record<string, ReviewSummary> {
  const map: Record<string, ReviewSummary> = {};
  for (const r of reviews) {
    if (!map[r.productId]) {
      map[r.productId] = { count: 0, sum: 0, avg: 0, histogram: [0, 0, 0, 0, 0] };
    }
    const s = map[r.productId];
    s.count += 1;
    s.sum += r.rating;
    s.histogram[r.rating - 1] += 1;
    s.avg = Math.round((s.sum / s.count) * 10) / 10;
  }
  return map;
}
