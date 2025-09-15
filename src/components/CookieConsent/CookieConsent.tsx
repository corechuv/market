// =============================================
// File: src/components/CookieConsent/CookieConsent.tsx
// A fully featured, dependency‑free cookie consent UI
// for Vite + React (TypeScript) using a SCSS module.
// ---------------------------------------------
// ✨ Возможности
// - Категории: necessary (всегда включено), functional, analytics, marketing
// - «Принять все», «Отклонить все», «Сохранить выбор»
// - Сохранение в cookie (JSON), настраиваемый срок жизни, sameSite/secure/domain
// - Поддержка Do Not Track (DNT) — по умолчанию отключает не‑обязательные
// - Ленивое подключение скриптов с атрибутами data-cookie-category через
//   <script type="text/plain" data-cookie-category="analytics" data-src="..."></script>
// - Событие window.dispatchEvent(new CustomEvent('cookie-consent:changed', { detail: state }))
// - Кнопка «Управление cookie» (отдельный компонент), открывает диалог с настройками
// - Адаптивность, доступность (ARIA), клавиатурная навигация
// - Без сторонних библиотек
// ---------------------------------------------
// 🧩 Быстрый старт (Vite):
// 1) Поместите оба файла (TSX и SCSS) в src/components/CookieConsent/
// 2) В App.tsx:
//    import CookieConsent, { CookieSettingsButton, getConsent } from "./components/CookieConsent/CookieConsent";
//    export default function App() {
//      return (
//        <>
//          <CookieConsent policyUrl="/privacy" brandName="Dashedo" />
//          {/* где‑то в шапке/футере */}
//          <CookieSettingsButton label="Настройки cookie" />
//        </>
//      );
//    }
// 3) Добавляйте отложенные скрипты так:
//    <script
//      type="text/plain"
//      data-cookie-category="analytics"
//      data-src="https://www.googletagmanager.com/gtag/js?id=G-XXXX" >
//    </script>
//    <script type="text/plain" data-cookie-category="analytics">
//      window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-XXXX');
//    </script>
//    // Эти скрипты автоматически активируются после сохранения согласия.
// ---------------------------------------------

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./CookieConsent.module.scss";
import Button from "../UI/Button";
import SwitchField from "../UI/SwitchField";
import Modal from "../Modal/Modal";

// ===== Types =====
export type ConsentCategory = "necessary" | "functional" | "analytics" | "marketing";

// List of categories with literal types to keep indexes strongly typed
const CATEGORIES = ["necessary", "functional", "analytics", "marketing"] as const;

function isConsentCategory(x: string): x is ConsentCategory {
    return (CATEGORIES as readonly string[]).includes(x);
}

export type ConsentState = Record<ConsentCategory, boolean> & {
    ts: string;
    v: number;
};

export type CookieConsentProps = {
    policyUrl?: string;
    brandName?: string;
    showFloatingTrigger?: boolean;
    storageKey?: string;
    maxAgeDays?: number;
    cookieDomain?: string;
    version?: number;
    position?: "bottom" | "top";
    defaults?: Partial<Record<Exclude<ConsentCategory, "necessary">, boolean>>;
    onAcceptAll?: (s: ConsentState) => void;
    onRejectAll?: (s: ConsentState) => void;
    onSave?: (s: ConsentState) => void;
};

function setCookie(
    name: string,
    value: string,
    days: number,
    options?: { domain?: string; sameSite?: "Lax" | "Strict" | "None"; secure?: boolean }
) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const opts = [
        `expires=${date.toUTCString()}`,
        `path=/`,
        options?.domain ? `domain=${options.domain}` : "",
        `SameSite=${options?.sameSite ?? "Lax"}`,
        options?.secure !== false ? "Secure" : "",
    ].filter(Boolean);
    document.cookie = `${name}=${encodeURIComponent(value)}; ${opts.join("; ")}`;
}

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const nameEQ = name + "=";
    const ca = document.cookie.split("; ");
    for (let i = 0; i < ca.length; i++) {
        const c = ca[i];
        if (c.startsWith(nameEQ)) return decodeURIComponent(c.substring(nameEQ.length));
    }
    return null;
}

const DEFAULTS: ConsentState = {
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
    ts: new Date(0).toISOString(),
    v: 1,
};

export function isDNTEnabled(): boolean {
    if (typeof navigator === "undefined") return false;
    const dnt = (navigator as any).doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack;
    return dnt === "1" || dnt === 1 || dnt === "yes";
}

export function readConsent(storageKey: string): ConsentState | null {
    try {
        const raw = getCookie(storageKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as ConsentState;
        if (typeof parsed !== "object" || parsed == null) return null;
        if (typeof parsed.ts !== "string" || typeof parsed.v !== "number") return null;
        return {
            necessary: true,
            functional: !!parsed.functional,
            analytics: !!parsed.analytics,
            marketing: !!parsed.marketing,
            ts: parsed.ts,
            v: parsed.v,
        };
    } catch {
        return null;
    }
}

export function writeConsent(storageKey: string, state: ConsentState, opts: { days: number; domain?: string }) {
    setCookie(storageKey, JSON.stringify(state), opts.days, {
        domain: opts.domain,
        sameSite: "Lax",
        secure: true,
    });
}

export function applyConsentToDeferredScripts(state: ConsentState) {
    if (typeof document === "undefined") return;
    const allowed: ConsentCategory[] = CATEGORIES.filter((c) => state[c]);

    const $scripts = Array.from(
        document.querySelectorAll<HTMLScriptElement>('script[type="text/plain"][data-cookie-category]')
    );

    for (const s of $scripts) {
        const catAttr = s.getAttribute("data-cookie-category");
        if (!catAttr || !isConsentCategory(catAttr)) continue;
        const cat: ConsentCategory = catAttr;
        if (!allowed.includes(cat)) continue;

        const newScript = document.createElement("script");
        for (const { name, value } of Array.from(s.attributes)) {
            if (["type", "data-cookie-category", "data-src"].includes(name)) continue;
            newScript.setAttribute(name, value);
        }
        const dataSrc = s.getAttribute("data-src");
        if (dataSrc) newScript.src = dataSrc;
        if (s.textContent && s.textContent.trim().length) newScript.text = s.textContent;

        s.replaceWith(newScript);
    }
}

export function updateGtagConsent(state: ConsentState) {
    const w = window as any;
    if (!w.gtag) return;
    const granted = (b: boolean) => (b ? "granted" : "denied");
    w.gtag("consent", "update", {
        ad_user_data: granted(state.marketing),
        ad_personalization: granted(state.marketing),
        ad_storage: granted(state.marketing),
        analytics_storage: granted(state.analytics),
        functionality_storage: granted(state.functional),
        security_storage: "granted",
    });
}

export function getConsent(storageKey = "dcc_consent"): ConsentState | null {
    return readConsent(storageKey);
}

export default function CookieConsent({
    policyUrl = "/privacy",
    brandName = "Ваш сайт",
    showFloatingTrigger = false,
    storageKey = "dcc_consent",
    maxAgeDays = 180,
    cookieDomain,
    version = 1,
    position = "bottom",
    defaults,
    onAcceptAll,
    onRejectAll,
    onSave,
}: CookieConsentProps) {
    const [open, setOpen] = useState(false);
    const [managerOpen, setManagerOpen] = useState(false);

    const base = useMemo<ConsentState>(
        () => ({
            ...DEFAULTS,
            v: version,
            functional: isDNTEnabled() ? false : !!defaults?.functional,
            analytics: isDNTEnabled() ? false : !!defaults?.analytics,
            marketing: isDNTEnabled() ? false : !!defaults?.marketing,
            ts: new Date().toISOString(),
        }),
        [version, defaults]
    );

    const [state, setState] = useState<ConsentState>(base);

    useEffect(() => {
        const existing = readConsent(storageKey);
        if (!existing || existing.v !== version) {
            setOpen(true);
            return;
        }
        setState(existing);
        setOpen(false);
    }, [storageKey, version]);

    useEffect(() => {
        const handler = () => setManagerOpen(true);
        window.addEventListener("cookie-consent:open", handler as EventListener);
        return () => window.removeEventListener("cookie-consent:open", handler as EventListener);
    }, []);

    const firstInteractiveRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
        if (managerOpen && firstInteractiveRef.current) {
            firstInteractiveRef.current.focus();
        }
    }, [managerOpen]);

    function persistAndApply(s: ConsentState) {
        writeConsent(storageKey, s, { days: maxAgeDays, domain: cookieDomain });
        applyConsentToDeferredScripts(s);
        updateGtagConsent(s);
        window.dispatchEvent(new CustomEvent("cookie-consent:changed", { detail: s }));
    }

    function handleAcceptAll() {
        const next: ConsentState = {
            ...state,
            functional: true,
            analytics: true,
            marketing: true,
            ts: new Date().toISOString(),
            v: version,
        };
        setState(next);
        persistAndApply(next);
        setOpen(false);
        setManagerOpen(false);
        onAcceptAll?.(next);
    }

    function handleRejectAll() {
        const next: ConsentState = {
            ...state,
            functional: false,
            analytics: false,
            marketing: false,
            ts: new Date().toISOString(),
            v: version,
        };
        setState(next);
        persistAndApply(next);
        setOpen(false);
        setManagerOpen(false);
        onRejectAll?.(next);
    }

    function handleSave() {
        const next: ConsentState = { ...state, ts: new Date().toISOString(), v: version };
        setState(next);
        persistAndApply(next);
        setOpen(false);
        setManagerOpen(false);
        onSave?.(next);
    }

    const Banner = (
        <div
            className={styles.banner}
            data-position={position}
            role="dialog"
            aria-live="polite"
            aria-label="Сообщение о cookie"
        >
            <div className={styles.banner__text}>
                <strong>Мы используем cookie</strong>
                <p>
                    {brandName} применяет файлы cookie для работы сайта, улучшения функций и аналитики. Выберите категории, с
                    которыми вы согласны. Подробнее в{" "}
                    <a href={policyUrl} target="_blank" rel="noopener noreferrer">
                        политике конфиденциальности
                    </a>
                    .
                </p>
            </div>
            <div className={styles.banner__actions}>
                <Button className={styles.btnSecondary} onClick={handleRejectAll}>
                    Отклонить
                </Button>
                <Button onClick={handleAcceptAll}>Принять все</Button>
                <Button onClick={() => setManagerOpen(true)} aria-haspopup="dialog">
                    Настроить
                </Button>
            </div>
        </div>
    );

    const Manager = managerOpen ? (
        <Modal
            isOpen={managerOpen}
            onClose={() => setManagerOpen(false)}
            variant="center"
            header="Настройки cookie"
            headerBorder={false}
        >
            <div className={styles.manager__content}>
                <div className={styles.prefRow}>
                    <SwitchField label="Строго необходимые" description="Нужны для работы сайта и безопасности. Отключить нельзя."
                        checked={true} disabled />
                </div>

                <div className={styles.prefRow}>
                    <SwitchField
                        label="Функциональные"
                        description="Запоминают ваши предпочтения, улучшают опыт использования."
                        checked={state.functional}
                        onChange={(v) => setState((s) => ({ ...s, functional: v }))}
                        ref={firstInteractiveRef}
                    />
                </div>

                <div className={styles.prefRow}>
                    <SwitchField
                        label="Аналитика"
                        description="Помогают нам понимать, как используется сайт, чтобы его улучшать."
                        checked={state.analytics}
                        onChange={(v) => setState((s) => ({ ...s, analytics: v }))}
                    />
                </div>

                <div className={styles.prefRow}>
                    <SwitchField
                        label="Маркетинг"
                        description="Используются для персонализации рекламы и измерения эффективности."
                        checked={state.marketing}
                        onChange={(v) => setState((s) => ({ ...s, marketing: v }))}
                    />
                </div>

                <p className={styles.note}>
                    Уважение к вашей приватности: если в браузере включён «Не отслеживать (DNT)», не обязательные категории по
                    умолчанию отключены.
                </p>
            </div>

            <div className={styles.manager__footer}>
                <div>
                    <a className={styles.link} href={policyUrl} target="_blank" rel="noopener noreferrer">
                        Политика конфиденциальности
                    </a>
                    <div className={styles.spacer} />
                </div>
                <Button className={styles.btnSecondary} onClick={handleRejectAll}>
                    Отклонить все
                </Button>
                <Button onClick={handleSave}>Сохранить</Button>
                <Button onClick={handleAcceptAll}>Принять все</Button>
            </div>
        </Modal>
    ) : null;

    return (
        <>
            {open && Banner}
            {Manager}
            {showFloatingTrigger && (
                <div className={styles.fabWrapper}>
                    <CookieSettingsButton />
                </div>
            )}
        </>
    );
}

export function CookieSettingsButton({ label = "" }: { label?: string }) {
    return (
        <button className={styles.manageBtn} onClick={() => window.dispatchEvent(new Event("cookie-consent:open"))}>
            🍪 {label}
        </button>
    );
}