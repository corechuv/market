// src/services/apiFetch.ts
import { getCurrentLanguage } from "../utils/lang/lang";

const API = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const lang = getCurrentLanguage();

  const headers = new Headers(init.headers || {});
  headers.set("Accept-Language", lang);
  headers.set("X-App-Lang", lang);

  const url = `${API}${path}`;

  return fetch(url, {
    ...init,
    headers,
    credentials: init.credentials ?? "omit",
  });
}
