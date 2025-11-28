// src/pages/About/de/PressPage.de.tsx
import "react"
import { Helmet } from "react-helmet-async"
import Page from "../../../components/UI/Page/Page"
import s from "../About.module.scss"

export default function PressPageDe() {
    const orgJsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "⟨Dashedo GmbH⟩",
        "url": "https://dashedo.com/",
        "logo": "https://dashedo.com/⟨pfad-zum-logo⟩.png",
        "contactPoint": [{
            "@type": "ContactPoint",
            "contactType": "media relations",
            "email": "press@dashedo.com",
            "telephone": "+49 ⟨30⟩ ⟨1234567⟩",
            "areaServed": "DE, AT, CH, EU",
            "availableLanguage": ["de", "en"]
        }]
    };

    const pageJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Presse",
        "url": "https://dashedo.com/about/press",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Startseite", "item": "https://dashedo.com/" },
                { "@type": "ListItem", "position": 2, "name": "Über uns", "item": "https://dashedo.com/about" },
                { "@type": "ListItem", "position": 3, "name": "Presse", "item": "https://dashedo.com/about/press" }
            ]
        }
    };

    return (
        <>
            <Helmet>
                <title>Presse – Dashedo</title>
                <meta
                    name="description"
                    content="Pressebereich von Dashedo: Kurzprofil, Pressematerial, Kontakt für Medienanfragen und Boilerplate für Artikel."
                />
                <link rel="canonical" href="https://dashedo.com/about/press" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Presse – Dashedo" />
                <meta
                    property="og:description"
                    content="Presseinformationen und Pressematerial zu Dashedo für Journalist:innen und Medien."
                />
                <meta property="og:url" content="https://dashedo.com/about/press" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="Presse – Dashedo" />
                <meta
                    name="twitter:description"
                    content="Pressebereich von Dashedo mit Kurzprofil, Boilerplate und Kontakt für Medien."
                />
            </Helmet>
            <Page>
                <div className={s.content}>
                    <nav aria-label="Brotkrumen">
                        <a href="/">Startseite</a> &nbsp;/&nbsp; <a href="/about">Über uns</a> &nbsp;/&nbsp; <span>Presse</span>
                    </nav>

                    <h1 className={s.content__title}>Presse</h1>
                    <p><strong>Zuletzt aktualisiert:</strong> 11.11.2025</p>

                    <h2>Kurzprofil</h2>
                    <p>
                        ⟨Dashedo⟩ ist eine ⟨deutsche⟩ SaaS-Plattform für ⟨Einzeiler Nutzen/Produkt⟩. Unternehmen nutzen Dashedo,
                        um ⟨wichtigste Outcomes⟩ schneller und messbar zu erreichen.
                    </p>

                    <h2>Zahlen auf einen Blick</h2>
                    <ul>
                        <li>Gründung: ⟨Jahr⟩ · Sitz: Berlin</li>
                        <li>Kunden: ⟨X⟩+ Unternehmen in ⟨Y⟩ Ländern</li>
                        <li>Finanzierung/Status: ⟨bootstrapped/finanziert⟩</li>
                    </ul>

                    <h2>Pressekontakt</h2>
                    <p>
                        <strong>Media Relations</strong><br />
                        E-Mail: <a href="mailto:press@dashedo.com">press@dashedo.com</a><br />
                        Telefon: +49 ⟨30⟩ ⟨1234567⟩
                    </p>

                    <h2>Pressematerial</h2>
                    <ul>
                        <li><a href="/assets/presskit.zip">Pressemappe (ZIP)</a> – Logos, Screenshots, Produktbilder</li>
                        <li><a href="/assets/brand-guidelines.pdf">Brand Guidelines (PDF)</a></li>
                        <li><a href="https://dashedo.com/⟨pressebilder-galerie⟩">Pressebilder-Galerie</a></li>
                    </ul>

                    <h2>Boilerplate</h2>
                    <p>
                        <em>Über Dashedo:</em> Dashedo ist eine cloudbasierte Plattform für ⟨Wertversprechen⟩.
                        Das Unternehmen mit Sitz in Berlin unterstützt Teams dabei, ⟨Hauptnutzen⟩ – sicher, skalierbar
                        und DSGVO-konform. Mehr unter <a href="https://dashedo.com/">dashedo.com</a>.
                    </p>

                    <h2>Ausgewählte Erwähnungen</h2>
                    <ul>
                        <li>⟨Medium/Publikation⟩ – „⟨Zitat/Headline⟩“ (⟨Datum⟩)</li>
                        <li>⟨Medium/Publikation⟩ – „⟨Zitat/Headline⟩“ (⟨Datum⟩)</li>
                        <li>Eigenes Newsroom-Update: <a href="/blog">Blog</a></li>
                    </ul>

                    <h2>Richtlinien zur Nutzung von Marken &amp; Logos</h2>
                    <ul>
                        <li>Bitte verwenden Sie ausschließlich die in der Pressemappe bereitgestellten Dateien.</li>
                        <li>Ausreichende Freiflächen und Mindestgrößen beachten (siehe Brand Guidelines).</li>
                        <li>Keine Veränderungen an Farbe, Form oder Verhältnis.</li>
                    </ul>

                    <p>Weitere Infos: <a href="/features">Funktionen</a> · <a href="/solutions">Lösungen</a> · <a href="/help/contact">Kontakt</a></p>

                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
                </div>
            </Page>
        </>
    );
}
