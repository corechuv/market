// src/pages/Settings/SettingsPage.tsx
import "react";
import { useNavigate } from "react-router-dom";
import c from "./SettingsPage.module.scss";

import Page from "../../components/UI/Page/Page";
import { useVisualViewport } from "../../hooks/useViewportUnits";
import MasterBar from "../../components/UI/Bars/MasterBar";
import ScrollArea from "../../components/UI/ScrollArea/ScrollArea";
import SunIcon from "../../components/Icons/SunIcon";
import MoonIcon from "../../components/Icons/MoonIcon";
import AboutIcon from "../../components/Icons/AboutIcon";
import HelpSupportIcon from "../../components/Icons/HelpSupportIcon";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import OrdersIcon from "../../components/Icons/OrdersIcon";
import AddressIcon from "../../components/Icons/AddressIcon";
import {
    applyTheme,
    getInitialTheme,
    type Theme,
} from "../../utils/theme/theme";
import { useLang } from "../../context/LangContext";
import type { AppLanguage } from "../../utils/lang/lang";
import { useTranslation } from "react-i18next";

export default function SettingsPage() {
    useVisualViewport();
    const nav = useNavigate();
    const { logout } = useAuth();
    const { t } = useTranslation("settings");

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

    return (
        <Page padding={false}>
            <MasterBar title={t("panel.title")} includeBars={false} />
            <ScrollArea lockBody={false}>
                {/* Аккаунт */}
                <ul className={c.list}>
                    <li
                        className={c.list__item}
                        onClick={() => {
                            nav("/account/notifications");
                        }}
                    >
                        <svg className={c["list__item--icon-left"]} />
                        <span className={c["list__item--label"]}>
                            {t("items.notifications")}
                        </span>
                    </li>
                    <li
                        className={c.list__item}
                        onClick={() => {
                            nav("/account/profile/edit");
                        }}
                    >
                        <svg className={c["list__item--icon-left"]} />
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
                        <OrdersIcon className={c["list__item--icon-left"]} />
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
                        <AddressIcon className={c["list__item--icon-left"]} />
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
                        <svg className={c["list__item--icon-left"]}></svg>
                        <span className={c["list__item--label"]}>
                            {t("items.security")}
                        </span>
                    </li>
                </ul>

                {/* Тема */}
                <h3 className={c.subtitle}>{t("sections.theme")}</h3>
                <ul className={c.list}>
                    <li
                        className={c.list__item}
                        aria-checked={theme === "light"}
                        onClick={() => {
                            setTheme("light");
                        }}
                    >
                        <SunIcon className={c["list__item--icon-left"]} />
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
                        <MoonIcon className={c["list__item--icon-left"]} />
                        <span
                            className={c["list__item--label"]}
                            aria-label={t("theme.dark")}
                            title="dark"
                        >
                            {t("theme.dark")}
                        </span>
                    </li>
                </ul>

                {/* Язык */}
                <h3 className={c.subtitle}>{t("sections.language")}</h3>
                <ul className={c.list}>
                    <li
                        className={c.list__item}
                        aria-checked={lang === "en"}
                        onClick={() => handleChangeLanguage("en")}
                    >
                        <svg className={c["list__item--icon-left"]}></svg>
                        <span className={c["list__item--label"]}>
                            {t("languages.en")}
                        </span>
                    </li>

                    <li
                        className={c.list__item}
                        aria-checked={lang === "ru"}
                        onClick={() => handleChangeLanguage("ru")}
                    >
                        <svg className={c["list__item--icon-left"]}></svg>
                        <span className={c["list__item--label"]}>
                            {t("languages.ru")}
                        </span>
                    </li>

                    <li
                        className={c.list__item}
                        aria-checked={lang === "de"}
                        onClick={() => handleChangeLanguage("de")}
                    >
                        <svg className={c["list__item--icon-left"]}></svg>
                        <span className={c["list__item--label"]}>
                            {t("languages.de")}
                        </span>
                    </li>
                </ul>

                {/* Информация */}
                <h3 className={c.subtitle}>{t("sections.info")}</h3>
                <ul className={c.list}>
                    <li
                        className={c.list__item}
                        onClick={() => {
                            nav("/about");
                        }}
                    >
                        <AboutIcon className={c["list__item--icon-left"]} />
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
                        <HelpSupportIcon className={c["list__item--icon-left"]} />
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
                        <svg className={c["list__item--icon-left"]}></svg>
                        <span className={c["list__item--label"]}>
                            {t("items.legal")}
                        </span>
                    </li>
                </ul>

                <h3 className={c.subtitle}></h3>
                <ul className={c.list}>
                    <li className={c.list__item} onClick={onLogout}>
                        <svg className={c["list__item--icon-left"]}></svg>
                        <span className={c["list__item--label"]}>
                            {t("items.logout")}
                        </span>
                    </li>
                </ul>
            </ScrollArea>
        </Page>
    );
}
