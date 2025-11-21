// src/components/Checkout/Header.tsx
import "react"
import c from "./Header.module.scss"
import Logo from "../logo/Logo";

const Header: React.FC = () => {
    return (
        <header className={c.header}>
            <div className={c.header__brand}>
                <Logo size="28px" />
            </div>
            <div className={c.header__secure}>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 2l7 4v6c0 5-3.5 9.74-7 10-3.5-.26-7-5-7-10V6l7-4z" fill="currentColor" />
                </svg>
                <span>SSL Secure Checkout</span>
            </div>
        </header>
    );
};

export default Header;
