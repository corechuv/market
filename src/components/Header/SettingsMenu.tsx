// SettingsMenu.tsx
import { useEffect, useRef, useState } from 'react';
import cls from './SettingsMenu.module.scss';
import SettingsIcon from '../Icons/SettingsIcon';
import MoonIcon from '../Icons/MoonIcon';
import SunIcon from '../Icons/SunIcon';
import Modal from '../Modal/Modal';

export const SettingsMenuButton: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

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

    // Клик вне поповера закрывает меню
    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    return (
        <>
            <div ref={wrapperRef} className={cls.wrapper}>
                <button
                    className={cls.navButton}
                    aria-label="Account settings"
                    aria-haspopup="menu"
                    aria-expanded={open}
                    onClick={() => setOpen(o => !o)}   // работает и на мобилке
                >
                    <SettingsIcon width={20} strokeWidth={0.5} />
                </button>

                {open && (
                    <div className={cls.popover} role="menu" aria-label="Select theme">
                        <h5 className={cls.popTitle}>Theme</h5>
                        <button
                            className={cls.popItem}
                            role="menuitemradio"
                            aria-checked={theme === 'light'}
                            onClick={() => { setTheme('light'); setOpen(false); }}
                        >
                            <SunIcon width={16} strokeWidth={1.5} />
                            Light
                        </button>
                        <button
                            className={cls.popItem}
                            role="menuitemradio"
                            aria-checked={theme === 'dark'}
                            onClick={() => { setTheme('dark'); setOpen(false); }}
                        >
                            <MoonIcon width={16} strokeWidth={1.5} />
                            Dark
                        </button>

                        <h5 className={cls.popTitle}>Language</h5>
                        <button
                            className={cls.popItem}
                            role="menuitemradio"
                            aria-checked={false}
                            onClick={() => setIsOpen(true)}
                        >
                            English
                        </button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                header="Select Language"
                variant="center"
                className={cls.languageModal}
                bodyClassName={cls.languageModalBody}
            >
                <ul className={cls.languageList}>
                    <li><a href="/en" className={cls.languageList__item}>English</a></li>
                    <li><a href="/es" className={cls.languageList__item}>Español</a></li>
                    <li><a href="/fr" className={cls.languageList__item}>Français</a></li>
                    <li><a href="/de" className={cls.languageList__item}>Deutsch</a></li>
                    <li><a href="/zh" className={cls.languageList__item}>中文</a></li>
                    <li><a href="/ru" className={cls.languageList__item}>Русский</a></li>
                    <li><a href="/ja" className={cls.languageList__item}>日本語</a></li>
                </ul>
            </Modal>
        </>
    );
};