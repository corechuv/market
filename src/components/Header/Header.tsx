import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { getProducts } from "../../services/productService";
import cls from "./Header.module.scss";
import Logo from "../logo/Logo";
import HamburgerIcon from "../Icons/HamburgerIcon";
import HeartIcon from "../Icons/HeartIcon";
import AccountIcon from "../Icons/AccountIcon";
import SearchIcon from "../Icons/SearchIcon";
import Search from "./Search";
import Catalog from "./Catalog";
import { SettingsMenuButton } from "./SettingsMenu";
import { useNavigate } from "react-router-dom";
import BagIcon from "../Icons/BagIcon";
import CounterBadge from "../Common/CounterBadge/CounterBadge";
import { useCart } from "../../context/CartContext";
import { CookieSettingsButton } from "../CookieConsent/CookieConsent";
import MobileSearch from "./MobileSearch";

export interface HeaderProps {
    className?: string;
}

function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(false);
    useLayoutEffect(() => {
        const mql = window.matchMedia(`(max-width:${breakpoint}px)`);
        const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
            setIsMobile("matches" in e ? e.matches : (e as MediaQueryList).matches);
        setIsMobile(mql.matches);
        mql.addEventListener ? mql.addEventListener("change", onChange as any) : mql.addListener(onChange as any);
        return () => {
            mql.removeEventListener ? mql.removeEventListener("change", onChange as any) : mql.removeListener(onChange as any);
        };
    }, [breakpoint]);
    return isMobile;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
    const allProducts = getProducts();
    const items = useMemo(() => allProducts.map((p) => ({ id: p.id, label: p.name })), [allProducts]);

    const ref = useRef<HTMLElement | null>(null);
    const [hh, setHh] = useState<number>(80);

    const isMobile = useIsMobile(768);
    const nav = useNavigate();

    const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);

    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    // высота шапки -> CSS-переменная
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

    // ----- КОЛ-ВО В КОРЗИНЕ
    const { lines } = useCart();
    const cartCount = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);

    // ----- СКРЫТИЕ ПРИ СКРОЛЛЕ
    const [hidden, setHidden] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useLayoutEffect(() => {
        let lastY = Math.max(window.scrollY || 0, 0);
        let ticking = false;

        const onScroll = () => {
            const run = () => {
                const y = Math.max(window.scrollY || 0, 0);
                const delta = y - lastY;
                const threshold = 6; // отсечка мелких дерганий

                // тень после старта скролла
                setScrolled(y > 2);

                // если открыт мобильный каталог — не скрываем
                if (mobileCatalogOpen) {
                    setHidden(false);
                    lastY = y;
                    ticking = false;
                    return;
                }

                if (Math.abs(delta) > threshold) {
                    const goingDown = delta > 0;
                    // Прячем только когда идем вниз и уже ушли ниже высоты шапки,
                    // при скролле вверх — показываем.
                    if (goingDown && y > hh) {
                        setHidden(true);
                    } else {
                        setHidden(false);
                    }
                    lastY = y;
                }
                ticking = false;
            };

            if (!ticking) {
                ticking = true;
                requestAnimationFrame(run);
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [hh, mobileCatalogOpen]);

    return (
        <>
            <header
                ref={ref}
                className={[
                    cls.header,
                    hidden ? cls.isHidden : "",
                    scrolled ? cls.withShadow : "",
                    className || "",
                ].join(" ")}
                style={{ ["--header-height" as any]: `${hh}px` }}
            >
                <div className={cls.header__container}>
                    {isMobile && (
                        <div className={cls.header__mobile}>
                            <a className={cls.header__navButton} onClick={() => nav("/")}>
                                <Logo size={isMobile ? "19px" : "28px"} weight={600} />
                            </a>
                            <button className={cls.header__navButton} aria-label="Menu" onClick={() => setMobileCatalogOpen(true)}>
                                <HamburgerIcon className={cls.header__hamburgerIcon} />
                            </button>
                        </div>
                    )}

                    {!isMobile && (
                        <>
                            <a className={cls.header__navButton} onClick={() => nav("/")}>
                                <Logo size={isMobile ? "19px" : "28px"} />
                            </a>
                            <div className={cls.header__navigation}>
                                <SettingsMenuButton />
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <Search
                                    data={items}
                                    onSelect={(item) => {
                                        nav(`/product/${item.id}`);
                                    }}
                                />
                            </div>
                        </>
                    )}

                    <div className={cls.header__navigation}>
                        {!isMobile && (
                            <CookieSettingsButton label="" />
                        )}
                        {isMobile && (
                            <button
                                className={cls.header__navButton}
                                aria-label="Search"
                                onClick={() => setMobileSearchOpen(true)}
                            >
                                <SearchIcon strokeWidth={1.5} width={24} />
                            </button>
                        )}
                        <button className={cls.header__navButton} aria-label="Account" onClick={() => nav("/auth")}>
                            <AccountIcon strokeWidth={1.5} />
                        </button>
                        <button className={cls.header__navButton} aria-label="Wishlist" onClick={() => nav("/wishlist")}>
                            <HeartIcon strokeWidth={1.5} />
                        </button>
                        <button className={cls.header__navButton} aria-label="Cart" onClick={() => nav("/checkout")}>
                            <BagIcon strokeWidth={1.5} />
                            <CounterBadge count={cartCount} title={`In cart: ${cartCount}`} />
                        </button>
                    </div>
                </div>

                <Catalog
                    trigger="hover"
                    renderMobileHamburger={false}
                    mobileDrawerOpen={mobileCatalogOpen}
                    onMobileDrawerOpenChange={setMobileCatalogOpen}
                />

                <MobileSearch open={mobileSearchOpen} onOpenChange={setMobileSearchOpen} />
            </header>
        </>
    );
};

export default Header;
