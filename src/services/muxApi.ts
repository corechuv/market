// src/services/muxApi.ts
import { buildHeaders } from "./reviewApi";

const API = import.meta.env.VITE_API_BASE_URL;

export type MuxStatus = 'ready' | 'waiting' | 'created' | 'asset_created' | 'errored' | 'loading';
export type MuxWaitingStatus = Exclude<MuxStatus, 'ready'>;

export type MuxResolveReady = { status: 'ready'; hlsUrl: string; posterUrl?: string };
export type MuxResolvePending = { status: MuxWaitingStatus };
export type MuxResolve = MuxResolveReady | MuxResolvePending;

export async function createMuxDirectUpload(): Promise<{ uploadId: string; uploadUrl: string }> {
  const r = await fetch(`${API}/mux/uploads`, {
    method: "POST",
    headers: buildHeaders("application/json"),
    credentials: "omit",
    body: "{}",
  });
  if (!r.ok) throw new Error(`Mux create upload failed: ${r.status}`);
  return r.json(); // { uploadId, uploadUrl }
}

export async function resolveMuxUrlMaybe(rawUrl: string): Promise<MuxResolve> {
  if (/^https?:\/\//i.test(rawUrl)) {
    return { status: 'ready', hlsUrl: rawUrl };
  }
  const m = /^mux:upload:([A-Za-z0-9_-]+)$/.exec(rawUrl);
  if (!m) return { status: 'errored' };

  const uploadId = m[1];
  const r = await fetch(`${API}/mux/uploads/${uploadId}`, { credentials: 'omit' });
  if (!r.ok) return { status: 'errored' };

  const d = await r.json();
  if (d?.hlsUrl) {
    return { status: 'ready', hlsUrl: d.hlsUrl, posterUrl: d.posterUrl };
  }
  const st = (d?.status ?? 'waiting') as MuxWaitingStatus;
  return { status: st };
}
