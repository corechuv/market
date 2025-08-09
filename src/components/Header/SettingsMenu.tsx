// SettingsMenu.tsx

import { useState, useRef } from 'react';
import cls from './SettingsMenu.module.scss';

import SettingsIcon from '../Icons/SettingsIcon';

import MoonIcon from '../Icons/MoonIcon';
import SunIcon from '../Icons/SunIcon';

import Modal from '../Modal/Modal';

export const SettingsMenuButton: React.FC = () => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const [isOpen, setIsOpen] = useState(false);

    // Смена темы (пример на data‑атрибуте — адаптируйте под свою логику)
    const changeTheme = (theme: 'light' | 'dark') => {
        document.documentElement.dataset.theme = theme;
        setOpen(false);
    };

    return (
        <>
            <div
                ref={wrapperRef}
                className={cls.wrapper}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
                <button
                    className={cls.navButton}
                    aria-label="Account settings"
                >
                    <SettingsIcon width={20} strokeWidth={0.5} />
                </button>

                {open && (
                    <div className={cls.popover} role="menu" aria-label="Select theme">
                        <h5 className={cls.popTitle}>Theme</h5>
                        <button
                            className={cls.popItem}
                            role="menuitemradio"
                            aria-checked={false}
                            onClick={() => changeTheme('light')}
                        >
                            <SunIcon width={16} strokeWidth={1.5} />
                            Light
                        </button>
                        <button
                            className={cls.popItem}
                            role="menuitemradio"
                            aria-checked={false}
                            onClick={() => changeTheme('dark')}
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
                isOpen={isOpen} onClose={() => setIsOpen(false)}
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