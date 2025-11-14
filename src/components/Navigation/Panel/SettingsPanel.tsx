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

    // Инициализация темы и сохранение в localStorage
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window === 'undefined') return 'light';
        const saved = (localStorage.getItem('theme') as 'light' | 'dark' | null);
        if (saved) return saved;
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

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
            <MasterBar title="Settings" background="var(--n-bg-desktop)" />
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
                    <svg className={c["list__item--icon-left"]}></svg>
                    <span className={c["list__item--label"]} aria-label={``} title="">
                        Orders
                    </span>
                </li>
                <li className={c.list__item} onClick={() => { nav("/account/addresses") }}>
                    <svg className={c["list__item--icon-left"]}></svg>
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
        </section>
    );
};

export default SettingsPanel;
