// src/pages/Help/de/ShippingPage.de.tsx
import "react"
import { Helmet } from "react-helmet-async"
import Page from "../../../components/UI/Page/Page"
import s from "../Help.module.scss"

export default function ShippingPageDe() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Bereitstellung & Lieferung (digital)",
        "url": "https://dashedo.com/help/shipping",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Startseite", "item": "https://dashedo.com/" },
                { "@type": "ListItem", "position": 2, "name": "Hilfe & Support", "item": "https://dashedo.com/help" },
                { "@type": "ListItem", "position": 3, "name": "Bereitstellung & Lieferung", "item": "https://dashedo.com/help/shipping" }
            ]
        }
    };

    const title = "Bereitstellung & Lieferung (digital) – Hilfe | Dashedo";
    const description =
        "Informationen zur digitalen Bereitstellung, Erreichbarkeit des Zugangs, Regionen und Service-Level bei Dashedo.";

    return (
        <>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href="https://dashedo.com/help/shipping" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content="https://dashedo.com/help/shipping" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
            </Helmet>
            <Page>
                <div className={s.content}>
                    <nav aria-label="Brotkrumen">
                        <a href="/">Startseite</a> &nbsp;/&nbsp; <a href="/help">Hilfe &amp; Support</a> &nbsp;/&nbsp; <span>Bereitstellung &amp; Lieferung</span>
                    </nav>

                    <h1 className={s.content__title}>Bereitstellung &amp; Lieferung (digital)</h1>
                    <p><strong>Zuletzt aktualisiert:</strong> 11.11.2025</p>

                    <h2>Bereitstellung des Zugangs</h2>
                    <p>
                        Nach erfolgreicher Bestellung erhalten Sie <strong>sofortigen Zugang</strong> zu Dashedo.
                        Die Aktivierungs-E-Mail mit Bestätigungslink wird an Ihre Account-Adresse gesendet.
                    </p>

                    <h2>Falls keine E-Mail ankommt</h2>
                    <ul>
                        <li>Prüfen Sie den <strong>Spam-/Junk-Ordner</strong> und fügen Sie <em>no-reply@dashedo.com</em> als sicheren Absender hinzu.</li>
                        <li>Vergewissern Sie sich, dass die angegebene E-Mail-Adresse korrekt ist.</li>
                        <li>Kontaktieren Sie bei Bedarf den <a href="/help/contact">Support</a> – wir helfen gerne weiter.</li>
                    </ul>

                    <h2>Regionen &amp; Verfügbarkeit</h2>
                    <p>Dashedo ist grundsätzlich weltweit nutzbar. Einschränkungen können sich aus regionalen rechtlichen Vorgaben oder Partner-Integrationen ergeben.</p>

                    <h2>Service-Level &amp; Wartung</h2>
                    <p>
                        Wir streben eine hohe Verfügbarkeit an. Geplante Wartungen kündigen wir – soweit möglich – im Voraus an.
                        Aktuelle Hinweise finden Sie im Produkt oder über den Support.
                    </p>

                    <h2>Rechnungszustellung</h2>
                    <p>Rechnungen werden digital bereitgestellt und können im Account-Bereich heruntergeladen werden. Auf Wunsch stellen wir eine PDF-Kopie per E-Mail zu.</p>

                    <p>Weitere Themen: <a href="/help/faq">FAQ</a> · <a href="/help/returns-refunds">Rückgaben &amp; Erstattungen</a> · <a href="/help/contact">Kontakt</a></p>

                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
                </div>
            </Page>
        </>
    );
}
