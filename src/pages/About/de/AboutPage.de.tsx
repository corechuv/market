// src/pages/About/de/AboutPage.de.tsx
import "react"
import { Helmet } from "react-helmet-async"
import Page from "../../../components/UI/Page/Page"
import s from "../About.module.scss"

export default function AboutPageDe() {
    const orgJsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "⟨Dashedo GmbH⟩",
        "url": "https://dashedo.com/",
        "logo": "./dashedo-logo.edge-height120-tracking30.svg",
        "foundingDate": "⟨2023-01-01⟩",
        "founders": [
            { "@type": "Person", "name": "⟨Vorname Nachname⟩" },
            { "@type": "Person", "name": "⟨Vorname Nachname⟩" }
        ],
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "⟨Musterstraße 1⟩",
            "postalCode": "⟨10115⟩",
            "addressLocality": "Berlin",
            "addressCountry": "DE"
        },
        "sameAs": ["https://www.linkedin.com/company/⟨…⟩", "https://x.com/⟨…⟩"]
    };

    const pageJsonLd = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "Über uns",
        "url": "https://dashedo.com/about",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Startseite", "item": "https://dashedo.com/" },
                { "@type": "ListItem", "position": 2, "name": "Über uns", "item": "https://dashedo.com/about" }
            ]
        }
    };

    return (
        <>
            <Helmet>
                <title>Über uns – Dashedo</title>
                <meta
                    name="description"
                    content="Erfahren Sie mehr über Dashedo, unser Team, unsere Mission und wie wir komplexe Workflows vereinfachen."
                />
                <link rel="canonical" href="https://dashedo.com/about" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Über uns – Dashedo" />
                <meta
                    property="og:description"
                    content="Erfahren Sie mehr über Dashedo, unser Team, unsere Mission und wie wir komplexe Workflows vereinfachen."
                />
                <meta property="og:url" content="https://dashedo.com/about" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="Über uns – Dashedo" />
                <meta
                    name="twitter:description"
                    content="Erfahren Sie mehr über Dashedo, unser Team, unsere Mission und wie wir komplexe Workflows vereinfachen."
                />
            </Helmet>
            <Page>
                <div className={s.content}>
                    <nav aria-label="Brotkrumen">
                        <a href="/">Startseite</a> &nbsp;/&nbsp; <span>Über uns</span>
                    </nav>

                    <h1 className={s.content__title}>Über uns</h1>
                    <p><strong>Zuletzt aktualisiert:</strong> 11.11.2025</p>

                    <h2>Unsere Mission</h2>
                    <p>
                        Wir bauen Software, die komplexe Workflows radikal vereinfacht. Mit Dashedo ermöglichen wir Teams,
                        ⟨kurze, prägnante Beschreibung eures Produkts/Use-Cases⟩ – schnell, sicher und skalierbar.
                    </p>

                    <h2>Was wir tun</h2>
                    <p>
                        Dashedo ist ein cloudbasierter SaaS-Dienst für ⟨Hauptnutzen⟩. Unternehmen nutzen uns, um
                        Prozesse zu automatisieren, Daten zu verstehen und Ergebnisse messbar zu verbessern.
                        Mehr dazu unter <a href="/features">Funktionen</a>, <a href="/solutions">Lösungen</a> und <a href="/pricing">Preise</a>.
                    </p>

                    <h2>Unsere Werte</h2>
                    <ul>
                        <li><strong>Kundennutzen zuerst:</strong> Entscheidungen werden an echten Use-Cases gemessen.</li>
                        <li><strong>Einfachheit:</strong> Weniger Klicks, klarere Interfaces, bessere Ergebnisse.</li>
                        <li><strong>Sicherheit &amp; Datenschutz:</strong> DSGVO-konform, ⟨Rechenzentrum/Region⟩, Least-Privilege.</li>
                        <li><strong>Ownership:</strong> Kleine, autonome Teams mit klarer Verantwortung.</li>
                        <li><strong>Transparenz:</strong> Offene Kommunikation intern wie extern.</li>
                    </ul>

                    <h2>Zahlen &amp; Fakten</h2>
                    <ul>
                        <li>Gegründet: ⟨Jahr⟩ in Berlin</li>
                        <li>Kunden in ⟨X⟩+ Ländern</li>
                        <li>Verfügbarkeit: ⟨99,9&nbsp;%⟩ (letzte 12 Monate)</li>
                        <li>Teamgröße: ⟨n⟩ Personen (Remote-First, EU-Zeitzonen)</li>
                    </ul>

                    <h2>Team &amp; Gründung</h2>
                    <p>
                        Gegründet von ⟨Gründer&nbsp;A⟩ und ⟨Gründer&nbsp;B⟩ – Produktmenschen mit Leidenschaft für
                        Developer-Experience und Business-Impact. Wir kombinieren ⟨Domänenerfahrung⟩ mit
                        erstklassigem Engineering.
                    </p>

                    <h2>Meilensteine</h2>
                    <ul>
                        <li><strong>⟨2023⟩:</strong> Gründung, erster MVP</li>
                        <li><strong>⟨2024⟩:</strong> Public Launch, erste Enterprise-Kunden</li>
                        <li><strong>⟨2025⟩:</strong> ⟨wichtiger Release/Meilenstein⟩</li>
                    </ul>

                    <p>
                        Lust, die Zukunft von ⟨Branche/Anwendungsfall⟩ mitzugestalten?
                        Schauen Sie bei unseren <a href="/about/careers">Jobs</a> vorbei oder schreiben Sie uns:
                        <a href="/help/contact"> Kontakt</a>. Für Medien: <a href="/about/press">Presse</a>.
                    </p>

                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
                </div>
            </Page>
        </>
    );
}
