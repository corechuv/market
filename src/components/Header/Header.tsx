import { useLayoutEffect, useRef, useState } from "react"

import cls from "./Header.module.scss"

import Logo from "../logo/Logo";

import HamburgerIcon from "../Icons/HamburgerIcon";
import HeartIcon from "../Icons/HeartIcon";
import CartIcon from "../Icons/CartIcon";
import AccountIcon from "../Icons/AccountIcon";
import SearchIcon from "../Icons/SearchIcon";
import Search from "./Search";
import Catalog from "./Catalog";
import { SettingsMenuButton } from "./SettingsMenu";
import { useNavigate } from "react-router-dom";
import LogoIcon from "../Icons/LogoIcon";

export interface HeaderProps {
    className?: string;
}

const products = [
    "iPhone 15 Pro",
    "iPad Air",
    "Apple Watch Ultra",
    "MacBook Air 13",
];

function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(false);

    useLayoutEffect(() => {
        const mql = window.matchMedia(`(max-width:${breakpoint}px)`);
        const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
            setIsMobile('matches' in e ? e.matches : (e as MediaQueryList).matches);
        setIsMobile(mql.matches);
        mql.addEventListener ? mql.addEventListener('change', onChange as any)
            : mql.addListener(onChange as any);
        return () => {
            mql.removeEventListener ? mql.removeEventListener('change', onChange as any)
                : mql.removeListener(onChange as any);
        };
    }, [breakpoint]);
    return isMobile;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
    const ref = useRef<HTMLElement | null>(null);
    const [hh, setHh] = useState<number>(80);

    const isMobile = useIsMobile(768);
    const nav = useNavigate();

    const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);

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
                    {isMobile ? (
                        <div className={cls.header__mobile}>
                            <button
                                className={cls.header__navButton}
                                onClick={() => nav('/')}
                            >
                                <LogoIcon className={cls.header__logoIcon} />
                            </button>
                            <button
                                className={cls.header__navButton}
                                aria-label="Menu"
                                onClick={() => setMobileCatalogOpen(true)}
                            >
                                <HamburgerIcon className={cls.header__hamburgerIcon} />
                            </button>
                        </div>
                    ) : <Logo size={isMobile ? "18px" : "28px"} />}
                    {!isMobile && (
                        <div className={cls.header__navigation}>
                            <SettingsMenuButton />
                        </div>
                    )}
                    {!isMobile && (
                        <div style={{ flexGrow: 1 }}>
                            <Search data={products} onSelect={(v) => console.log("Выбрано:", v)} />
                        </div>
                    )}
                    <div className={cls.header__navigation}>
                        {isMobile && (
                            <button
                                className={cls.header__navButton}
                                aria-label="Search"
                                onClick={() => nav('/search')}   // или открой модалку, если есть
                            >
                                <SearchIcon strokeWidth={1.5} width={24} />
                            </button>
                        )}
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
                <Catalog trigger="hover"
                    renderMobileHamburger={false}
                    mobileDrawerOpen={mobileCatalogOpen}
                    onMobileDrawerOpenChange={setMobileCatalogOpen} />
            </header>
        </>
    );
};

export default Header;
