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
import dhl from "/dhl.png"
import mastercard from "/mastercard.png"
import paypal from "/paypal.png"
import visa from "/visa.png"
import dpd from "/dpd.png"
import hermes from "@/assets/svg/hermes.svg"
import klarna from "@/assets/svg/klarna.svg"
import amazonWhite from "@/assets/amazonpay_white.png"
import amazonBlack from "@/assets/amazonpay_black.png"
import amex from "@/assets/svg/amex.svg"


import cls from "./Footer.module.scss"
import Accordion from "../Product/Accordion"

const NAV_GROUPS = [
    {
        title: "About",
        links: [
            { href: "/about", label: "About Us" },
            { href: "/team", label: "Our Team" },
            { href: "/careers", label: "Careers" },
            { href: "/press", label: "Press" },
            { href: "/blog", label: "Blog" },
        ],
    },
    {
        title: "Help & Support",
        links: [
            { href: "/contact", label: "Contact" },
            { href: "/faq", label: "FAQ" },
            { href: "/shipping", label: "Shipping & Delivery" },
            { href: "/returns", label: "Returns & Refunds" },
            { href: "/track", label: "Track Order" },
            { href: "/size-guide", label: "Size Guide" },
        ],
    },
    {
        title: "Shop",
        links: [
            { href: "/new", label: "New Arrivals" },
            { href: "/bestsellers", label: "Bestsellers" },
            { href: "/sale", label: "Sale" },
            { href: "/gifts", label: "Gifts" },
            { href: "/last-chance", label: "Last Chance" },
        ],
    },
    {
        title: "Account",
        links: [
            { href: "/account", label: "My Account" },
            { href: "/account/orders", label: "Orders" },
            { href: "/account/wishlist", label: "Wishlist" },
            { href: "/account/addresses", label: "Addresses" },
            { href: "/account/security", label: "Security" },
        ],
    },
    {
        title: "Legal",
        links: [
            { href: "/terms", label: "Terms of Service" },
            { href: "/privacy", label: "Privacy Policy" },
            { href: "/cookie", label: "Cookie Policy" },
            { href: "/imprint", label: "Imprint" },
            { href: "/sitemap", label: "Sitemap" },
        ],
    },
    {
        title: "Partners",
        links: [
            { href: "/affiliate", label: "Affiliate Program" },
            { href: "/wholesale", label: "Wholesale" },
            { href: "/partners", label: "Partners" },
            { href: "/csr", label: "Sustainability" },
        ],
    },
    {
        title: "Explore",
        links: [
            { href: "/stories", label: "Stories" },
            { href: "/lookbook", label: "Lookbook" },
            { href: "/community", label: "Community" },
            { href: "/events", label: "Events" },
        ],
    },
    {
        title: "Resources",
        links: [
            { href: "/developers", label: "Developers" },
            { href: "/api", label: "API" },
            { href: "/docs", label: "Docs" },
            { href: "/status", label: "Status" },
        ],
    },
];

export default function Footer() {
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
    return (
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
                        </div>
                    </section>
                </div>
                <div className={cls["footer__container--col"]}>
                    <section className={cls.footerNav} aria-label="Footer navigation">
                        {/* Desktop / Tablet grid */}
                        <div className={cls.footerNavDesktop} role="list">
                            {NAV_GROUPS.map((group) => (
                                <div className={cls.footerNav__col} role="listitem" key={group.title}>
                                    <h3 className={cls.footerNav__heading}>{group.title}</h3>
                                    <ul className={cls.footerNav__list}>
                                        {group.links.map((l) => (
                                            <li key={l.href}>
                                                <a href={l.href} className={cls.navLink}>{l.label}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Mobile accordions */}
                        <div className={cls.footerNavMobile}>
                            {NAV_GROUPS.map((group) => (
                                <div className={cls.footerNav__accordion} key={group.title}>
                                    <Accordion title={group.title} defaultOpen={false} margin={false}>
                                        <ul className={cls.footerNav__list}>
                                            {group.links.map((l) => (
                                                <li key={l.href}>
                                                    <a href={l.href} className={cls.navLink}>{l.label}</a>
                                                </li>
                                            ))}
                                        </ul>
                                    </Accordion>
                                </div>
                            ))}
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
    );
}