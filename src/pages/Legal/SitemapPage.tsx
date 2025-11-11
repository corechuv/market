// src/pages/Legal/SitemapPage.tsx
import "react"
import Page from "../../components/UI/Page/Page"
import s from "./Legal.module.scss"

export default function SitemapPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "HTML-Sitemap",
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
                <nav aria-label="Brotkrumen">
                    <a href="/">Startseite</a> &nbsp;/&nbsp; <a href="/legal">Rechtliches</a> &nbsp;/&nbsp; <span>Sitemap</span>
                </nav>

                <h1 className={s.content__title}>Sitemap</h1>
                <p><strong>Zuletzt aktualisiert:</strong> 11.11.2025</p>

                <h2>Hauptbereiche</h2>
                <ul>
                    <li><a href="/">Startseite</a></li>
                    <li><a href="/features">Funktionen</a></li>
                    <li><a href="/solutions">Lösungen</a></li>
                    <li><a href="/pricing">Preise</a></li>
                    <li><a href="/about">Über uns</a></li>
                    <li><a href="/contact">Kontakt</a></li>
                    <li><a href="/blog">Blog</a></li>
                    <li><a href="/help">Hilfe &amp; Support</a></li>
                </ul>

                <h2>Rechtliches</h2>
                <ul>
                    <li><a href="/legal/imprint">Impressum</a></li>
                    <li><a href="/legal/privacy">Datenschutzerklärung</a></li>
                    <li><a href="/legal/cookies">Cookie-Richtlinie</a></li>
                    <li><a href="/legal/terms">AGB</a></li>
                </ul>

                <p>
                    Hinweis: Die XML-Sitemap für Suchmaschinen ist unter <code>/sitemap.xml</code> erreichbar.
                </p>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </div>
        </Page>
    );
}
