// src/pages/Help/ReturnsRefundsPage.tsx
import "react"
import Page from "../../components/UI/Page/Page"
import s from "./Help.module.scss"

export default function ReturnsRefundsPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Rückgaben & Erstattungen",
        "url": "https://dashedo.com/help/returns-refunds",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Startseite", "item": "https://dashedo.com/" },
                { "@type": "ListItem", "position": 2, "name": "Hilfe & Support", "item": "https://dashedo.com/help" },
                { "@type": "ListItem", "position": 3, "name": "Rückgaben & Erstattungen", "item": "https://dashedo.com/help/returns-refunds" }
            ]
        }
    };

    return (
        <Page>
            <div className={s.content}>
                <nav aria-label="Brotkrumen">
                    <a href="/">Startseite</a> &nbsp;/&nbsp; <a href="/help">Hilfe &amp; Support</a> &nbsp;/&nbsp; <span>Rückgaben &amp; Erstattungen</span>
                </nav>

                <h1 className={s.content__title}>Rückgaben &amp; Erstattungen</h1>
                <p><strong>Zuletzt aktualisiert:</strong> 11.11.2025</p>

                <h2>Widerrufsrecht für Verbraucher (EU)</h2>
                <p>
                    Verbraucher haben das Recht, Verträge über digitale Dienste innerhalb von 14&nbsp;Tagen ohne Angabe von Gründen zu widerrufen.
                    Die Frist beginnt am Tag des Vertragsschlusses. Weitere Informationen entnehmen Sie bitte unseren <a href="/legal/terms">AGB</a>.
                </p>
                <p>
                    <em>Hinweis zu digitalen Inhalten/Diensten:</em> Wenn Sie verlangen, dass wir vor Ablauf der Widerrufsfrist mit der
                    Leistung beginnen, und Sie dies ausdrücklich bestätigen, kann das Widerrufsrecht erlöschen, sobald die Leistung vollständig erbracht wurde.
                </p>

                <h2>So beantragen Sie eine Erstattung</h2>
                <ol>
                    <li>Senden Sie eine E-Mail an <a href="mailto:support@dashedo.com">support@dashedo.com</a> mit Betreff „Erstattung“.</li>
                    <li>Fügen Sie Ihre <strong>Rechnungsnummer</strong>, die <strong>Account-E-Mail</strong> und eine kurze Begründung hinzu.</li>
                    <li>Unser Team prüft Ihren Antrag gemäß den <a href="/legal/terms">AGB</a> und bestätigt die Entscheidung per E-Mail.</li>
                </ol>

                <h2>Fristen und Zahlungsweg</h2>
                <p>
                    Genehmigte Rückerstattungen zahlen wir in der Regel innerhalb von 5–10 Werktagen auf die ursprüngliche Zahlungsart aus.
                    Banklaufzeiten können variieren.
                </p>

                <h2>Ausnahmen &amp; Einschränkungen</h2>
                <ul>
                    <li>Bei <strong>B2B-Verträgen</strong> gelten ggf. abweichende Bedingungen laut Angebot/AGB.</li>
                    <li>Für <strong>missbräuchliche Nutzung</strong> oder <strong>Verstöße gegen die AGB</strong> kann eine Erstattung ausgeschlossen sein.</li>
                    <li>Bei <strong>Rabatt-/Sonderaktionen</strong> gelten die in der Aktion genannten Bedingungen.</li>
                </ul>

                <p>Benötigen Sie Hilfe? <a href="/help/contact">Kontaktieren Sie uns</a>. Weitere Infos: <a href="/legal/privacy">Datenschutz</a>.</p>

                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            </div>
        </Page>
    );
}
