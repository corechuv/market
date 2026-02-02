// src/pages/Settings/SettingsPage.tsx
import "react";
import { useLocation, useNavigate } from "react-router-dom";
import c from "./SettingsPage.module.scss";

import Page from "../../components/UI/Page/Page";
import { useVisualViewport } from "../../hooks/useViewportUnits";
import MasterBar from "../../components/UI/Bars/MasterBar";
import ScrollArea from "../../components/UI/ScrollArea/ScrollArea";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    applyTheme,
    getInitialTheme,
    type Theme,
} from "../../utils/theme/theme";
import { useLang } from "../../context/LangContext";
import type { AppLanguage } from "../../utils/lang/lang";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "../../utils/useIsMobile";
import { openSettingsPanel } from "../../utils/navEvents";

export default function SettingsPage() {
    useVisualViewport();
    const nav = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const { t } = useTranslation("settings");
    const isMobile = useIsMobile(768);

    useEffect(() => {
        if (isMobile) return;
        const back = new URLSearchParams(location.search).get("back") || "/account";
        openSettingsPanel();
        nav(back, { replace: true });
    }, [isMobile, location.search, nav]);

    async function onLogout() {
        try {
            await logout();
        } finally {
            nav("/auth", { replace: true });
        }
    }

    // Тема
    const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    // Язык
    const { lang, setLang } = useLang();

    const handleChangeLanguage = (next: AppLanguage) => {
        if (next === lang) return;
        setLang(next); // триггерит applyLanguage() в провайдере
        window.location.reload();
    };

    if (!isMobile) return null;

    return (
        <Page padding={false} className={c.pageMain}>
            <div className={c.page}>
                <MasterBar title={t("panel.title")} includeBars={false} />
                <ScrollArea
                    lockBody={true}
                    className={c.scroll}
                    useBottomNavOffset
                >
                    <section aria-labelledby="settings-account">
                        <h2 id="settings-account" className={c.subtitle}>{t("sections.account")}</h2>
                        <ul className={c.list}>
                        <li
                            className={c.list__item}
                            onClick={() => {
                                nav("/account/profile/edit");
                            }}
                        >
                            <span className={c["list__item--label"]}>
                                {t("items.editProfile")}
                            </span>
                        </li>
                        <li
                            className={c.list__item}
                            onClick={() => {
                                nav("/account/orders");
                            }}
                        >
                            <span className={c["list__item--label"]}>
                                {t("items.orders")}
                            </span>
                        </li>
                        <li
                            className={c.list__item}
                            onClick={() => {
                                nav("/account/addresses");
                            }}
                        >
                            <span className={c["list__item--label"]}>
                                {t("items.addresses")}
                            </span>
                        </li>
                        <li
                            className={c.list__item}
                            onClick={() => {
                                nav("/account/security");
                            }}
                        >
                            <span className={c["list__item--label"]}>
                                {t("items.security")}
                            </span>
                        </li>
                        </ul>
                    </section>
                    <section aria-labelledby="settings-theme">
                    <h2 id="settings-theme" className={c.subtitle}>{t("sections.theme")}</h2>
                    <ul className={c.list}>
                        <li
                            className={c.list__item}
                            aria-checked={theme === "light"}
                            onClick={() => {
                                setTheme("light");
                            }}
                        >
                            <span
                                className={c["list__item--label"]}
                                aria-label={t("theme.light")}
                                title="light"
                            >
                                {t("theme.light")}
                            </span>
                        </li>
                        <li
                            className={c.list__item}
                            aria-checked={theme === "dark"}
                            onClick={() => {
                                setTheme("dark");
                            }}
                        >
                            <span
                                className={c["list__item--label"]}
                                aria-label={t("theme.dark")}
                                title="dark"
                            >
                                {t("theme.dark")}
                            </span>
                        </li>
                    </ul>
                    </section>
                    <section aria-labelledby="settings-language">
                    <h2 id="settings-language" className={c.subtitle}>{t("sections.language")}</h2>
                    <ul className={c.list}>
                        <li
                            className={c.list__item}
                            aria-checked={lang === "en"}
                            onClick={() => handleChangeLanguage("en")}
                        >
                            <span className={c["list__item--label"]}>
                                {t("languages.en")}
                            </span>
                        </li>
                        <li
                            className={c.list__item}
                            aria-checked={lang === "ru"}
                            onClick={() => handleChangeLanguage("ru")}
                        >
                            <span className={c["list__item--label"]}>
                                {t("languages.ru")}
                            </span>
                        </li>
                        <li
                            className={c.list__item}
                            aria-checked={lang === "de"}
                            onClick={() => handleChangeLanguage("de")}
                        >
                            <span className={c["list__item--label"]}>
                                {t("languages.de")}
                            </span>
                        </li>
                    </ul>
                    </section>
                    <section aria-labelledby="settings-info">
                    <h2 id="settings-info" className={c.subtitle}>{t("sections.info")}</h2>
                    <ul className={c.list}>
                        <li
                            className={c.list__item}
                            onClick={() => {
                                nav("/about");
                            }}
                        >
                            <span className={c["list__item--label"]}>
                                {t("items.about")}
                            </span>
                        </li>
                        <li
                            className={c.list__item}
                            onClick={() => {
                                nav("/help");
                            }}
                        >
                            <span className={c["list__item--label"]}>
                                {t("items.help")}
                            </span>
                        </li>
                        <li
                            className={c.list__item}
                            onClick={() => {
                                nav("/legal");
                            }}
                        >
                            <span className={c["list__item--label"]}>
                                {t("items.legal")}
                            </span>
                        </li>
                    </ul>
                    </section>
                    <h3 className={c.subtitle}></h3>
                    <ul className={c.list}>
                        <li className={c.list__item} onClick={onLogout}>
                            <span className={c["list__item--label"]}>
                                {t("items.logout")}
                            </span>
                        </li>
                    </ul>
                </ScrollArea>
            </div>
        </Page>
    );
}
