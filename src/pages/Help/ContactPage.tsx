// src/pages/Help/ContactPage.tsx
import "react"
import Page from "../../components/UI/Page/Page"
import s from "./Help.module.scss"
import Logo from "../../components/Footer/Logo";

export default function ContactPage() {
    const orgJsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "⟨Dashedo GmbH⟩",
        "url": "https://dashedo.com/",
        "contactPoint": [
            {
                "@type": "ContactPoint",
                "contactType": "customer support",
                "telephone": "+49 ⟨30⟩ ⟨1234567⟩",
                "email": "support@dashedo.com",
                "areaServed": "DE, AT, CH, EU",
                "availableLanguage": ["de", "en"],
                "hoursAvailable": {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
                    "opens": "09:00",
                    "closes": "18:00"
                }
            }
        ]
    };

    const pageJsonLd = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Kontakt",
        "url": "https://dashedo.com/help/contact",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Startseite", "item": "https://dashedo.com/" },
                { "@type": "ListItem", "position": 2, "name": "Hilfe & Support", "item": "https://dashedo.com/help" },
                { "@type": "ListItem", "position": 3, "name": "Kontakt", "item": "https://dashedo.com/help/contact" }
            ]
        }
    };

    return (
        <Page>
            <div className={s.content}>
                            
                            <Logo />
                            
                <nav aria-label="Brotkrumen">
                    <a href="/">Startseite</a> &nbsp;/&nbsp; <a href="/help">Hilfe &amp; Support</a> &nbsp;/&nbsp; <span>Kontakt</span>
                </nav>

                <h1 className={s.content__title}>Kontakt</h1>
                <p><strong>Zuletzt aktualisiert:</strong> 11.11.2025</p>

                <h2>So erreichen Sie uns</h2>
                <p>
                    Unser Support-Team hilft Ihnen Montag–Freitag, 09:00–18:00 Uhr (CET/CEST).
                    Wir antworten in der Regel innerhalb von 24&nbsp;Stunden.
                </p>
                <ul>
                    <li><strong>E-Mail:</strong> <a href="mailto:support@dashedo.com">support@dashedo.com</a></li>
                    <li><strong>Telefon:</strong> <a href="tel:+49⟨30⟩⟨1234567⟩">+49 ⟨30⟩ ⟨1234567⟩</a></li>
                    <li><strong>Adresse (Geschäftssitz):</strong> ⟨Dashedo GmbH, Musterstraße 1, 10115 Berlin⟩</li>
                </ul>

                <h2>Schneller zur Lösung</h2>
                <ol>
                    <li>Werfen Sie einen Blick in unsere <a href="/help/faq">FAQ</a> – viele Fragen sind dort bereits beantwortet.</li>
                    <li>Beschreiben Sie Ihr Anliegen präzise und fügen Sie bei Bedarf Screenshots, Log-IDs oder Links hinzu.</li>
                    <li>Teilen Sie uns Ihre <em>Account-E-Mail</em> und – falls vorhanden – die <em>Ticket- oder Bestellnummer</em> mit.</li>
                </ol>

                <h2>Datenschutz beim Support</h2>
                <p>
                    Wir verarbeiten Support-Anfragen gem. Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b/f DSGVO. Details in unserer
                    <a href="/legal/privacy"> Datenschutzerklärung</a>.
                </p>

                <p>Weitere Hilfe: <a href="/help/returns-refunds">Rückgaben &amp; Erstattungen</a>, <a href="/help/shipping">Bereitstellung &amp; Lieferung</a>.</p>

                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
            </div>
        </Page>
    );
}
