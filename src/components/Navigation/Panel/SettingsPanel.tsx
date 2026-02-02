// src/components/Navigation/Panel/SettingsPanel.tsx
import React, { useEffect, useState } from "react";
import c from "./SettingsPanel.module.scss";
import { useNavigate } from "react-router-dom";
import MasterBar from "../../UI/Bars/MasterBar";
import { useAuth } from "../../../context/AuthContext";
import {
    applyTheme,
    getInitialTheme,
    type Theme,
} from "../../../utils/theme/theme";
import { useLang } from "../../../context/LangContext";
import type { AppLanguage } from "../../../utils/lang/lang";
import ScrollArea from "../../UI/ScrollArea/ScrollArea";
import { useVisualViewport } from "../../../hooks/useViewportUnits";
import { useTranslation } from "react-i18next";

interface SettingsPanelProps {
    /** Управление видимостью извне (Navigation) */
    open: boolean;
    /** Закрыть панель (например, по Esc/выбору) */
    onClose: () => void;
    /** Чтобы разместить панель относительно якоря в стилях (опционально) */
    anchorRole?: "settings";
    /** Поддержка hover-логики родителя: держим открытым, пока курсор над панелью */
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
    open,
    /*onClose,*/
    anchorRole = "settings",
    onMouseEnter,
    onMouseLeave,
}) => {
    useVisualViewport();
    const { t } = useTranslation("settings");
    if (!open) return null;

    const nav = useNavigate();
    const { logout } = useAuth();

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
        <section
            id="settings-panel" // для aria-controls на кнопке
            role="region"
            aria-label={t("panel.ariaLabel")}
            data-panel="settings"
            data-anchor={anchorRole}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={c.g}
        >
            <div className={c.content}>
                <MasterBar title={t("panel.title")} background="var(--n-bg-desktop)" />
                <ScrollArea lockBody={false}>
                    {/* Аккаунт / навигация */}
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

                    {/* Язык */}
                    <h3 className={c.subtitle}>{t("sections.language")}</h3>
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

                    {/* Информация */}
                    <h3 className={c.subtitle}>{t("sections.info")}</h3>
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
        </section>
    );
};

export default SettingsPanel;
