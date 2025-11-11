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
import LegalIcon from "../../Icons/LegalIcon";

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
                <li className={c.list__item} onClick={() => { nav("/account") }}>
                    <AccountIcon className={c["list__item--icon-left"]} />
                    <span className={c["list__item--label"]} aria-label={``} title="">
                        Account
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
                <li className={c.list__item} onClick={() => { nav("/account/notifications") }}>
                    <AboutIcon className={c["list__item--icon-left"]} />
                    <span className={c["list__item--label"]} aria-label={``} title="">
                        About
                    </span>
                </li>
                <li className={c.list__item} onClick={() => { nav("/account") }}>
                    <HelpSupportIcon className={c["list__item--icon-left"]} />
                    <span className={c["list__item--label"]} aria-label={``} title="">
                        Help & Support
                    </span>
                </li>
                <li className={c.list__item} onClick={() => { nav("/account") }}>
                    <LegalIcon className={c["list__item--icon-left"]} />
                    <span className={c["list__item--label"]} aria-label={``} title="">
                        Legal
                    </span>
                </li>
            </ul>
        </section>
    );
};

export default SettingsPanel;
