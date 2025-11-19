// src/utils/avatar.ts
const API_ORIGIN = new URL(import.meta.env.VITE_API_BASE_URL).origin;

export function absUrl(u?: string | null): string {
  if (!u) return "";
  return u.startsWith("http") ? u : `${API_ORIGIN}${u}`;
}

export function buildAvatarSrc(
  rawUrl?: string | null,
  cacheKey?: string | null | undefined,
): string | undefined {
  if (!rawUrl) return undefined;
  const base = absUrl(rawUrl);
  if (!cacheKey) return base;
  return `${base}?t=${encodeURIComponent(cacheKey)}`;
}
