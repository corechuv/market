// src/components/Navigation/Panel/SettingsPanel.tsx
import React, { useEffect, useState } from "react";
import c from "./SettingsPanel.module.scss";
import SunIcon from "../../Icons/SunIcon";
import MoonIcon from "../../Icons/MoonIcon";

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
    onClose,
    anchorRole = "settings",
    onMouseEnter,
    onMouseLeave,
}) => {
    if (!open) return null;

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
            <div className={c.b}>
                <h4 className={c.b__title}>Theme</h4>
                <div className={c.b__list}>
                    <div
                        className={c.b__it}
                        aria-checked={theme === 'light'}
                        onClick={() => { setTheme('light') }}
                    >
                        <span className={c["b__it--i"]}>
                            <SunIcon />
                        </span>
                        <div className={c["b__it--n"]}>Light</div>
                    </div>
                    <div
                        className={c.b__it}
                        aria-checked={theme === 'dark'}
                        onClick={() => { setTheme('dark') }}
                    >
                        <span className={c["b__it--i"]}>
                            <MoonIcon />
                        </span>
                        <div className={c["b__it--n"]}>Dark</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SettingsPanel;
