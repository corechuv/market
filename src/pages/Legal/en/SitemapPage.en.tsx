// src/pages/Legal/en/SitemapPage.en.tsx
import "react";
import Page from "../../../components/UI/Page/Page";
import s from "../Legal.module.scss";
import Logo from "../../../components/Footer/Logo";

export default function SitemapPageEn() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "HTML sitemap",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "url": "https://dashedo.com/" },
            { "@type": "ListItem", "position": 2, "url": "https://dashedo.com/features" },
            { "@type": "ListItem", "position": 3, "url": "https://dashedo.com/pricing" },
            { "@type": "ListItem", "position": 4, "url": "https://dashedo.com/solutions" },
            { "@type": "ListItem", "position": 5, "url": "https://dashedo.com/about" },
            { "@type": "ListItem", "position": 6, "url": "https://dashedo.com/contact" },
            { "@type": "ListItem", "position": 7, "url": "https://dashedo.com/blog" },
            { "@type": "ListItem", "position": 8, "url": "https://dashedo.com/help" },
            { "@type": "ListItem", "position": 9, "url": "https://dashedo.com/legal/imprint" },
            { "@type": "ListItem", "position": 10, "url": "https://dashedo.com/legal/privacy" },
            { "@type": "ListItem", "position": 11, "url": "https://dashedo.com/legal/cookies" },
            { "@type": "ListItem", "position": 12, "url": "https://dashedo.com/legal/terms" }
        ]
    };

    return (
        <Page>
            <div className={s.content}>
                <Logo />

                <nav aria-label="Breadcrumb">
                    <a href="/">Home</a> &nbsp;/&nbsp; <a href="/legal">Legal</a> &nbsp;/&nbsp; <span>Sitemap</span>
                </nav>

                <h1 className={s.content__title}>Sitemap</h1>
                <p><strong>Last updated:</strong> 11.11.2025</p>

                <h2>Main sections</h2>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/features">Features</a></li>
                    <li><a href="/solutions">Solutions</a></li>
                    <li><a href="/pricing">Pricing</a></li>
                    <li><a href="/about">About us</a></li>
                    <li><a href="/contact">Contact</a></li>
                    <li><a href="/blog">Blog</a></li>
                    <li><a href="/help">Help &amp; Support</a></li>
                </ul>

                <h2>Legal</h2>
                <ul>
                    <li><a href="/legal/imprint">Imprint</a></li>
                    <li><a href="/legal/privacy">Privacy policy</a></li>
                    <li><a href="/legal/cookies">Cookie policy</a></li>
                    <li><a href="/legal/terms">Terms &amp; Conditions</a></li>
                </ul>

                <p>
                    Note: the XML sitemap for search engines is available at <code>/sitemap.xml</code>.
                </p>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </div>
        </Page>
    );
}
