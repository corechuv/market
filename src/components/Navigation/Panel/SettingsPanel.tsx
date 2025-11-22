// src/components/Navigation/Panel/SettingsPanel.tsx
import React, { useEffect, useState } from "react";
import c from "./SettingsPanel.module.scss";
import SunIcon from "../../Icons/SunIcon";
import MoonIcon from "../../Icons/MoonIcon";
import { useNavigate } from "react-router-dom";
import AccountIcon from "../../Icons/AccountIcon";
import NotificationIcon from "../../Icons/NotificationIcon";
import MasterBar from "../../UI/Bars/MasterBar";
import AboutIcon from "../../Icons/AboutIcon";
import HelpSupportIcon from "../../Icons/HelpSupportIcon";
import { useAuth } from "../../../context/AuthContext";
import OrdersIcon from "../../Icons/OrdersIcon";
import AddressIcon from "../../Icons/AddressIcon";
import { applyTheme, getInitialTheme, type Theme } from "../../../utils/theme/theme";
import { useLang } from "../../../context/LangContext";
import type { AppLanguage } from "../../../utils/lang/lang";
import ScrollArea from "../../UI/ScrollArea/ScrollArea";
import { useVisualViewport } from "../../../hooks/useViewportUnits";

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
    if (!open) return null;

    const nav = useNavigate()
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
        setLang(next);      // это триггерит applyLanguage() в провайдере
        // по желанию, если хочешь полный перерендер всего SPA:
        window.location.reload();
    };

    return (
        <section
            id="settings-panel"            // для aria-controls на кнопке
            role="region"
            aria-label="Settings"
            data-panel="settings"
            data-anchor={anchorRole}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={c.g}
        >
            <div className={c.content}>
                <MasterBar title="Settings" background="var(--n-bg-desktop)" />
                <ScrollArea lockBody={false}>
                    <ul className={c.list}>
                        <li className={c.list__item} onClick={() => { nav("/account/notifications") }}>
                            <NotificationIcon className={c["list__item--icon-left"]} />
                            <span className={c["list__item--label"]} aria-label={``} title="">
                                Notifications
                            </span>
                        </li>
                        <li className={c.list__item} onClick={() => { nav("/account/profile/edit") }}>
                            <AccountIcon className={c["list__item--icon-left"]} />
                            <span className={c["list__item--label"]} aria-label={``} title="">
                                Edit profile
                            </span>
                        </li>
                        <li className={c.list__item} onClick={() => { nav("/account/orders") }}>
                            <OrdersIcon className={c["list__item--icon-left"]} />
                            <span className={c["list__item--label"]} aria-label={``} title="">
                                Orders
                            </span>
                        </li>
                        <li className={c.list__item} onClick={() => { nav("/account/addresses") }}>
                            <AddressIcon className={c["list__item--icon-left"]} />
                            <span className={c["list__item--label"]} aria-label={``} title="">
                                Addresses
                            </span>
                        </li>
                        <li className={c.list__item} onClick={() => { nav("/account/security") }}>
                            <svg className={c["list__item--icon-left"]}></svg>
                            <span className={c["list__item--label"]} aria-label={``} title="">
                                Security
                            </span>
                        </li>
                    </ul>
                    <h3 className={c.subtitle}>Theme</h3>
                    <ul className={c.list}>
                        <li className={c.list__item} aria-checked={theme === 'light'} onClick={() => { setTheme('light') }}>
                            <SunIcon className={c["list__item--icon-left"]} />
                            <span className={c["list__item--label"]} aria-label={`Light`} title="light">
                                Light
                            </span>
                        </li>
                        <li className={c.list__item} aria-checked={theme === 'dark'} onClick={() => { setTheme('dark') }}>
                            <MoonIcon className={c["list__item--icon-left"]} />
                            <span className={c["list__item--label"]} aria-label={`Dark`} title="dark">
                                Dark
                            </span>
                        </li>
                    </ul>
                    <h3 className={c.subtitle}>Language</h3>
                    <ul className={c.list}>
                        <li
                            className={c.list__item}
                            aria-checked={lang === "en"}
                            onClick={() => handleChangeLanguage("en")}
                        >
                            <svg className={c["list__item--icon-left"]}></svg>
                            <span className={c["list__item--label"]}>English</span>
                        </li>

                        <li
                            className={c.list__item}
                            aria-checked={lang === "ru"}
                            onClick={() => handleChangeLanguage("ru")}
                        >
                            <svg className={c["list__item--icon-left"]}></svg>
                            <span className={c["list__item--label"]}>Russian</span>
                        </li>

                        <li
                            className={c.list__item}
                            aria-checked={lang === "de"}
                            onClick={() => handleChangeLanguage("de")}
                        >
                            <svg className={c["list__item--icon-left"]}></svg>
                            <span className={c["list__item--label"]}>German</span>
                        </li>
                    </ul>
                    <h3 className={c.subtitle}>Information</h3>
                    <ul className={c.list}>
                        <li className={c.list__item} onClick={() => { nav("/about") }}>
                            <AboutIcon className={c["list__item--icon-left"]} />
                            <span className={c["list__item--label"]} aria-label={``} title="">
                                About
                            </span>
                        </li>
                        <li className={c.list__item} onClick={() => { nav("/help") }}>
                            <HelpSupportIcon className={c["list__item--icon-left"]} />
                            <span className={c["list__item--label"]} aria-label={``} title="">
                                Help & Support
                            </span>
                        </li>
                        <li className={c.list__item} onClick={() => { nav("/legal") }}>
                            <svg className={c["list__item--icon-left"]}></svg>
                            <span className={c["list__item--label"]} aria-label={``} title="">
                                Legal
                            </span>
                        </li>
                    </ul>
                    <h3 className={c.subtitle}></h3>

                    <ul className={c.list}>
                        <li className={c.list__item} onClick={onLogout}>
                            <svg className={c["list__item--icon-left"]}></svg>
                            <span className={c["list__item--label"]} aria-label={``} title="">
                                Logout
                            </span>
                        </li>
                    </ul>
                </ScrollArea>
            </div>
        </section>
    );
};

export default SettingsPanel;
