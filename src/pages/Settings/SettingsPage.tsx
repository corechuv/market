// src/pages/Settings/SettingsPage.tsx
import "react"
import { useNavigate } from "react-router-dom"
import c from "./SettingsPage.module.scss"

import Page from "../../components/UI/Page/Page"
import { useVisualViewport } from "../../hooks/useViewportUnits"
import MasterBar from "../../components/UI/Bars/MasterBar"
import ScrollArea from "../../components/UI/ScrollArea/ScrollArea"
import SunIcon from "../../components/Icons/SunIcon"
import MoonIcon from "../../components/Icons/MoonIcon"
import AboutIcon from "../../components/Icons/AboutIcon"
import HelpSupportIcon from "../../components/Icons/HelpSupportIcon"
import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import OrdersIcon from "../../components/Icons/OrdersIcon"
import AddressIcon from "../../components/Icons/AddressIcon"
import { applyTheme, getInitialTheme, type Theme } from "../../utils/theme/theme"
import { useLang } from "../../context/LangContext"
import type { AppLanguage } from "../../utils/lang/lang"


export default function SettingsPage() {
    useVisualViewport();
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
        setLang(next);      // это триггерит applyLanguage() в провайдере
        // по желанию, если хочешь полный перерендер всего SPA:
        window.location.reload();
    };


    return (
        <Page padding={false}>
            <MasterBar title="Settings" includeBars={false} />
            <ScrollArea lockBody={false}>
                <ul className={c.list}>
                    <li className={c.list__item} onClick={() => { nav("/account/notifications") }}>
                        <svg className={c["list__item--icon-left"]} />
                        <span className={c["list__item--label"]} aria-label={``} title="">
                            Notifications
                        </span>
                    </li>
                    <li className={c.list__item} onClick={() => { nav("/account/profile/edit") }}>
                        <svg className={c["list__item--icon-left"]} />
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
        </Page>
    );
}
