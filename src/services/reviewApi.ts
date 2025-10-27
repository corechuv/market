// src/services/reviewApi.ts
import type { ReviewOut, ReviewType } from "../types/review/review";

const API = import.meta.env.VITE_API_BASE_URL;

const API_ORIGIN = new URL(API).origin;

function qs(params: Record<string, any>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  });
  return q.toString();
}

function getAccessToken(): string | null {
  return localStorage.getItem("mp_auth_access") || sessionStorage.getItem("mp_auth_access");
}

export function buildHeaders(contentType?: string): Record<string, string> {
  const h: Record<string, string> = {};
  if (contentType) h["Content-Type"] = contentType;
  const t = getAccessToken();
  if (t) h["Authorization"] = `Bearer ${t}`;
  return h;
}

export async function listProductReviews(
  productId: string,
  opts: { type?: ReviewType; limit?: number; offset?: number } = {}
): Promise<ReviewOut[]> {
  const query = qs({ limit: opts.limit ?? 20, offset: opts.offset ?? 0, type: opts.type });
  const r = await fetch(`${API}/reviews/products/${productId}?${query}`, {
    headers: buildHeaders(),
    credentials: "omit",
  });
  if (!r.ok) throw new Error(`Failed to load reviews: ${r.status}`);
  return r.json();
}

export async function createReview(
  productId: string,
  payload: {
    type: ReviewType;
    rating: number;
    text?: string;
    media?: Array<{ kind: "photo" | "video"; url: string; width?: number; height?: number; durationMs?: number }>;
  }
): Promise<ReviewOut> {
  const r = await fetch(`${API}/reviews/products/${productId}`, {
    method: "POST",
    headers: buildHeaders("application/json"),
    credentials: "omit",
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Create review failed: ${r.status} ${t}`);
  }
  return r.json();
}

export async function addReviewMedia(
  productId: string,
  media: { kind: "photo" | "video"; url: string; width?: number; height?: number; durationMs?: number }
) {
  const r = await fetch(`${API}/reviews/products/${productId}/media`, {
    method: "POST",
    headers: buildHeaders("application/json"),
    credentials: "omit",
    body: JSON.stringify(media),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Add media failed: ${r.status} ${t}`);
  }
  return r.json();
}

export async function setReviewHelpful(
  reviewId: string,
  value: boolean
): Promise<{ helpfulCount: number; helpful: boolean }> {
  const r = await fetch(`${API}/reviews/${reviewId}/helpful`, {
    method: "POST",
    headers: buildHeaders("application/json"),
    credentials: "omit",
    body: JSON.stringify({ value }),
  });
  if (!r.ok) {
    const t = await r.text().catch(()=>"");
    throw new Error(`Set helpful failed: ${r.status} ${t}`);
  }
  return r.json();
}

// постер для Mux HLS или плейсхолдера mux:upload:{id}
export function posterFromMediaUrl(url: string | undefined): string | undefined {
  if (!url) return;
  if (/^https:\/\/stream\.mux\.com\/[^/]+\.m3u8/.test(url)) {
    const id = url.split("/").pop()!.split(".m3u8")[0];
    return `https://image.mux.com/${id}/thumbnail.jpg?time=1`;
  }
  const m = /^mux:upload:([A-Za-z0-9_-]+)$/.exec(url);
  if (m) {
    // пока ждём — покажем placeholder (можно свой статику)
    return undefined;
  }
  return undefined;
}

export async function listReelsFeed(opts: {
  sort?: "new" | "popular" | "trending";
  productId?: string;
  days?: number;
  limit?: number;
  offset?: number;
} = {}) {
  const query = qs({
    sort: opts.sort ?? "trending",
    productId: opts.productId,
    days: opts.days,
    limit: opts.limit ?? 40,
    offset: opts.offset ?? 0,
  });
  const r = await fetch(`${API}/reviews/reels?${query}`, {
    headers: buildHeaders(),
    credentials: "omit",
  });
  if (!r.ok) throw new Error(`Failed to load reels feed: ${r.status}`);
  return (await r.json()) as ReviewOut[];
}

export async function getReviewById(reviewId: string): Promise<ReviewOut> {
  const r = await fetch(`${API}/reviews/${reviewId}`, {
    headers: buildHeaders(),
    credentials: "omit",
  });
  if (!r.ok) throw new Error(`Review not found: ${r.status}`);
  return r.json();
}

export async function deleteReview(reviewId: string) {
  const r = await fetch(`${API}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: buildHeaders(),
    credentials: "omit",
  });
  if (!r.ok) throw new Error(`Delete failed: ${r.status}`);
}

// === ВАЖНО: единая функция для «моих роликов» ===
export async function listMyReels(opts: {
  limit?: number;
  offset?: number;
  status?: "pending" | "approved" | "rejected";
  type?: Extract<ReviewType, "reel" | "plain">; // по умолчанию "reel"
  onlyWithVideo?: boolean;                      // клиентская фильтрация
} = {}): Promise<ReviewOut[]> {
  const query = qs({
    limit: opts.limit ?? 50,
    offset: opts.offset ?? 0,
    status: opts.status ?? "approved",
    type: opts.type ?? "reel",
  });

  const r = await fetch(`${API}/reviews/me?${query}`, {
    headers: buildHeaders(),
    credentials: "omit",
  });
  if (!r.ok) throw new Error(`Failed to load my reels: ${r.status}`);

  const data = (await r.json()) as ReviewOut[];
  if (opts.onlyWithVideo) {
    return data.filter((rev) => rev.media?.some((m) => m.kind === "video" && m.url));
  }
  return data;
}

export function abs(u?: string | null): string {
  if (!u) return "";
  return u.startsWith("http") ? u : `${API_ORIGIN}${u}`;
}

// Абсолютный URL аватара с меткой "t=" для борьбы с кешем
export function toAvatarSrc(r: ReviewOut): string {
  const url = r.authorAvatarUrl ? abs(r.authorAvatarUrl) : "";
  if (!url) return "";
  const t = r.authorUpdatedAt || r.createdAt || "";
  return t ? `${url}?t=${encodeURIComponent(t)}` : url;
}