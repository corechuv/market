// src/components/Footer/Footer.tsx
import "react"
import cls from "./Footer.module.scss"
import { useIsMobile } from "../../utils/useIsMobile"
import Accordion from "../UI/Accordion"
import { navInfo } from "../../data/footer/nav"

export default function Footer() {
    const isMobile = useIsMobile(768)

    return (
        <footer className={cls.footer}>
            <section className={cls.footer__section} aria-label="Footer Navigation">
                {isMobile ? (
                    <nav className={cls.footer__nav}>
                        {navInfo.map((group) => (
                            <Accordion
                                key={group.title}
                                title={group.title}
                                defaultOpen={false}
                                margin={false}
                            >
                                <ul className={cls["footer__nav--col--list"]}>
                                    {group.links.map((l) => (
                                        <li key={l.href} className={cls["footer__nav--col--list--item"]}>
                                            <a href={l.href}>{l.label}</a>
                                        </li>
                                    ))}
                                </ul>
                            </Accordion>
                        ))}
                    </nav>
                ) : (
                    <nav className={cls.footer__nav} role="list">
                        {navInfo.map((group) => (
                            <div
                                className={cls["footer__nav--col"]}
                                role="listitem"
                                key={group.title}
                            >
                                <h3 className={cls["footer__nav--col--title"]}>{group.title}</h3>
                                <ul className={cls["footer__nav--col--list"]}>
                                    {group.links.map((l) => (
                                        <li key={l.href} className={cls["footer__nav--col--list--item"]}>
                                            <a href={l.href}>{l.label}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                )}
            </section>
            <section className={cls.footer__section} aria-label="Footer Copyright">
                <p className={cls.corp}>&copy; 2025 Dashedo. All rights reserved.</p>
            </section>
        </footer>
    )
}


{/*
import { useEffect, useState } from "react"
import instagramWhite from "@/assets/svg/instagram_white.svg"
import instagramBlack from "@/assets/svg/instagram_black.svg"
import metaBlack from "@/assets/svg/meta_black.svg"
import metaWhite from "@/assets/svg/meta_white.svg"
import xBlack from "@/assets/svg/x_black.svg"
import xWhite from "@/assets/svg/x_white.svg"
import tiktokBlack from "/tiktok_black.png"
import tiktokWhite from "/tiktok_white.png"
import youtubeBlack from "/youtube_black.png"
import youtubeWhite from "/youtube_white.png"
import mastercard from "/mastercard.png"
import paypal from "/paypal.png"
import visa from "/visa.png"
import dpd from "/dpd.png"
import dhl from "/dhl.png"
import gls from "@/assets/gls.png"
import hermes from "@/assets/svg/hermes.svg"
import klarna from "@/assets/svg/klarna.svg"
import amazonWhite from "@/assets/amazonpay_white.png"
import amazonBlack from "@/assets/amazonpay_black.png"
import amex from "@/assets/svg/amex.svg"

const [theme, setTheme] = useState(() =>
    document.documentElement.getAttribute("data-theme") || "light"
);

useEffect(() => {
    const observer = new MutationObserver(() => {
        setTheme(document.documentElement.getAttribute("data-theme") || "light");
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
}, []);

<footer className={cls.footer}>
    <div className={cls.footer__container}>
    <div className={`${cls["footer__container--col"]}`}>
        <section className={cls.methodContainer}>
            <h3 className={cls.methodContainer__title}>Shipping</h3>
            <div className={cls.paymentMethods}>
                <img loading="lazy" src={visa} alt="Visa" className={cls.paymentMethods__visa} />
                <img loading="lazy" src={mastercard} alt="MasterCard" className={cls.paymentMethods__mastercard} />
                <img loading="lazy" src={paypal} alt="PayPal" className={cls.paymentMethods__paypal} />
                <img loading="lazy" src={amex} alt="Amex" className={cls.paymentMethods__amex} />
                <img loading="lazy" src={theme === "dark" ? klarna : klarna} alt="Klarna" className={cls.paymentMethods__klarna} />
                <img loading="lazy" src={theme === "dark" ? amazonWhite : amazonBlack} alt="AmazonPay" className={cls.paymentMethods__amazonPay} />
            </div>
        </section>
        <section className={cls.methodContainer}>
            <h3 className={cls.methodContainer__title}>Delivery</h3>
            <div className={cls.deliveryMethods}>
                <img loading="lazy" src={dhl} alt="Dhl" className={cls.deliveryMethods__dhl} />
                <img loading="lazy" src={dpd} alt="Dpd" className={cls.deliveryMethods__dpd} />
                <img loading="lazy" src={hermes} alt="Hermes" className={cls.deliveryMethods__hermes} />
                <img loading="lazy" src={gls} alt="Gls" className={cls.deliveryMethods__gls} />
            </div>
        </section>
    </div>
    <div className={`${cls["footer__container--col"]}`}>
        <section className={cls.footerBottom}>
            <p className={cls.copyRight}>&copy; 2025 Dashedo. All rights reserved.</p>
            <div className={cls.socialLinks}>
                <a href="https://instagram.com" className={cls.socialLinks__link} aria-label="Instagram">
                    <img loading="lazy" src={theme === "dark" ? instagramWhite : instagramBlack} className={cls.socialLinks__instagram} alt="Instagram" />
                </a>
                <a href="https://meta.com" className={cls.socialLinks__link} aria-label="Meta">
                    <img loading="lazy" src={theme === "dark" ? metaWhite : metaBlack} className={cls.socialLinks__meta} alt="Meta" />
                </a>
                <a href="https://x.com" className={cls.socialLinks__link} aria-label="X">
                    <img loading="lazy" src={theme === "dark" ? xWhite : xBlack} className={cls.socialLinks__x} alt="X" />
                </a>
                <a href="https://tiktok.com" className={cls.socialLinks__link} aria-label="TikTok">
                    <img loading="lazy" src={theme === "dark" ? tiktokWhite : tiktokBlack} className={cls.socialLinks__tiktok} alt="TikTok" />
                </a>
                <a href="https://youtube.com" className={cls.socialLinks__link} aria-label="YouTube">
                    <img loading="lazy" src={theme === "dark" ? youtubeWhite : youtubeBlack} className={cls.socialLinks__youtube} alt="YouTube" />
                </a>
            </div>
        </section>
    </div>
    </div>
</footer>
*/}
