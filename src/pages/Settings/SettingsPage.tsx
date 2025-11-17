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
            </ScrollArea>
        </Page>
    );
}
