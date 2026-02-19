// src/utils/lang/lang.ts
export const SUPPORTED_APP_LANGS = ["en", "ru", "de"] as const;
export type AppLanguage = (typeof SUPPORTED_APP_LANGS)[number];

const STORAGE_KEY = "lang";
const SUPPORTED_LANGS_SET = new Set<string>(SUPPORTED_APP_LANGS);

function isSupported(lang: string | null | undefined): lang is AppLanguage {
    return !!lang && SUPPORTED_LANGS_SET.has(lang);
}

export function getInitialLanguage(): AppLanguage {
    if (typeof window === "undefined") return "de";

    try {
        // 1) пробуем из localStorage
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (isSupported(stored)) {
            return stored;
        }

        // 2) пробуем язык браузера
        const navLang = window.navigator?.language?.slice(0, 2);
        if (isSupported(navLang)) {
            return navLang;
        }
    } catch {
        // игнорируем ошибки
    }

    // 3) дефолт
    return "de";
}

export function applyLanguage(lang: AppLanguage) {
    try {
        document.documentElement.lang = lang;
        window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
        document.documentElement.lang = lang;
    }
}

export function getCurrentLanguage(): AppLanguage {
    if (typeof window === "undefined") return "de";
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (isSupported(stored)) return stored;
    } catch {
        // ignore
    }
    return getInitialLanguage();
}
