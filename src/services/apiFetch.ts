// src/services/apiFetch.ts
import { type AppLanguage } from "../utils/lang/lang";

const API = import.meta.env.VITE_API_BASE_URL;

function getCurrentLang(): AppLanguage {
  if (typeof document !== "undefined") {
    const htmlLang = document.documentElement.lang as AppLanguage;
    if (["de", "en", "ru"].includes(htmlLang)) return htmlLang;
  }

  try {
    const stored = window.localStorage.getItem("lang") as AppLanguage | null;
    if (stored && ["de", "en", "ru"].includes(stored)) return stored;
  } catch {}

  return "de";
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const lang = getCurrentLang();

  const headers = new Headers(init.headers || {});
  headers.set("Accept-Language", lang);

  const url = `${API}${path}`;

  return fetch(url, {
    ...init,
    headers,
    credentials: init.credentials ?? "omit",
  });
}
