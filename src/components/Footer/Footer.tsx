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
import dpd from "/dhl.png"
import hermes from "@/assets/svg/hermes.svg"


import cls from "./Footer.module.scss"

export default function Footer() {
    const [theme, setTheme] = useState("light");

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
                            <img src={visa} alt="Visa" className={cls.paymentMethods__visa} />
                            <img src={mastercard} alt="MasterCard" className={cls.paymentMethods__mastercard} />
                            <img src={paypal} alt="PayPal" className={cls.paymentMethods__paypal} />
                        </div>
                        <h3 className={cls.methodContainer__title}>Delivery</h3>
                        <div className={cls.deliveryMethods}>
                            <img src={dhl} alt="Dhl" className={cls.deliveryMethods__dhl} />
                            <img src={dpd} alt="Dpd" className={cls.deliveryMethods__dpd} />
                            <img src={hermes} alt="Hermes" className={cls.deliveryMethods__hermes} />
                        </div>
                    </section>
                </div>
                <div className={`${cls["footer__container--col"]}`}>
                    <section className={cls.footerNav}>
                        <ul>
                            <li><a href="/about" className={cls.navLink}>About Us</a></li>
                            <li><a href="/contact" className={cls.navLink}>Contact</a></li>
                            <li><a href="/privacy" className={cls.navLink}>Privacy Policy</a></li>
                        </ul>
                        <ul>
                            <li><a href="/terms" className={cls.navLink}>Terms of Service</a></li>
                            <li><a href="/faq" className={cls.navLink}>FAQ</a></li>
                            <li><a href="/support" className={cls.navLink}>Support</a></li>
                        </ul>
                        <ul>
                            <li><a href="/careers" className={cls.navLink}>Careers</a></li>
                            <li><a href="/blog" className={cls.navLink}>Blog</a></li>
                            <li><a href="/partners" className={cls.navLink}>Partners</a></li>
                        </ul>
                        <ul>
                            <li><a href="/sitemap" className={cls.navLink}>Sitemap</a></li>
                            <li><a href="/press" className={cls.navLink}>Press</a></li>
                            <li><a href="/affiliate" className={cls.navLink}>Affiliate Program</a></li>
                        </ul>
                    </section>
                </div>
                <div className={`${cls["footer__container--col"]}`}>
                    <section className={cls.footerBottom}>
                        <p className={cls.copyRight}>&copy; 2025 Dashedo. All rights reserved.</p>
                        <div className={cls.socialLinks}>
                            <a href="https://instagram.com" className={cls.socialLinks__link} aria-label="Instagram">
                                <img src={theme === "dark" ? instagramWhite : instagramBlack} className={cls.socialLinks__instagram} alt="Instagram" />
                            </a>
                            <a href="https://meta.com" className={cls.socialLinks__link} aria-label="Meta">
                                <img src={theme === "dark" ? metaWhite : metaBlack} className={cls.socialLinks__meta} alt="Meta" />
                            </a>
                            <a href="https://x.com" className={cls.socialLinks__link} aria-label="X">
                                <img src={theme === "dark" ? xWhite : xBlack} className={cls.socialLinks__x} alt="X" />
                            </a>
                            <a href="https://tiktok.com" className={cls.socialLinks__link} aria-label="TikTok">
                                <img src={theme === "dark" ? tiktokWhite : tiktokBlack} className={cls.socialLinks__tiktok} alt="TikTok" />
                            </a>
                            <a href="https://youtube.com" className={cls.socialLinks__link} aria-label="YouTube">
                                <img src={theme === "dark" ? youtubeWhite : youtubeBlack} className={cls.socialLinks__youtube} alt="YouTube" />
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </footer>
    );
}