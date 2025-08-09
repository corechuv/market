import { useLayoutEffect, useRef, useState } from "react"

import cls from "./Header.module.scss"

import Logo from "../logo/Logo";

import HeartIcon from "../Icons/HeartIcon";
import CartIcon from "../Icons/CartIcon";
import AccountIcon from "../Icons/AccountIcon";
import Search from "./Search";
import Catalog from "./Catalog";
import { SettingsMenuButton } from "./SettingsMenu";

export interface HeaderProps {
    className?: string;
}

const products = [
    "iPhone 15 Pro",
    "iPad Air",
    "Apple Watch Ultra",
    "MacBook Air 13",
];

const Header: React.FC<HeaderProps> = ({ className }) => {
    const ref = useRef<HTMLElement | null>(null);
    const [hh, setHh] = useState<number>(80);
    useLayoutEffect(() => {
        if (!ref.current) return;
        const el = ref.current;
        const set = () => setHh(el.offsetHeight);
        set();
        const ro = new ResizeObserver(set);
        ro.observe(el);
        window.addEventListener("resize", set);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", set);
        };
    }, []);
    return (
        <>
            <header
                ref={ref}
                className={`${cls.header} ${className}`}
                style={{ ["--header-height" as any]: `${hh}px` }}
            >
                <div className={cls.header__container}>
                    <Logo />
                    <div className={cls.header__navigation}>
                        <SettingsMenuButton />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                        <Search data={products} onSelect={(v) => console.log("Выбрано:", v)} />
                    </div>
                    <div className={cls.header__navigation}>
                        <button className={cls.header__navButton} aria-label="Account">
                            <AccountIcon strokeWidth={1.5} />
                        </button>
                        <button className={cls.header__navButton} aria-label="Cart">
                            <CartIcon />
                        </button>
                        <button className={cls.header__navButton} aria-label="Wishlist">
                            <HeartIcon fill="none" strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
                <Catalog trigger="hover" />
            </header>
        </>
    );
};

export default Header;
