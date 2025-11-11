// src/pages/Help/FAQPage.tsx
import "react"
import Page from "../../components/UI/Page/Page"
import s from "./Help.module.scss"

export default function FAQPage() {
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Was ist Dashedo und für wen ist es geeignet?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Dashedo ist ein cloudbasierter Software-Dienst (SaaS) für ⟨kurze Beschreibung eures Produkts⟩. Geeignet für ⟨Zielgruppen⟩."
                }
            },
            {
                "@type": "Question",
                "name": "Gibt es eine kostenlose Testphase?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Ja, Sie können Dashedo unverbindlich testen. Details zu Dauer und Funktionsumfang finden Sie auf der Seite Preise."
                }
            },
            {
                "@type": "Question",
                "name": "Wie ändere oder kündige ich meinen Plan?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sie können Ihren Plan jederzeit im Account-Bereich ändern oder kündigen. Die Änderungen gelten zum nächsten Abrechnungszeitraum gemäß unseren AGB."
                }
            },
            {
                "@type": "Question",
                "name": "Welche Zahlungsmethoden werden unterstützt?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Wir unterstützen gängige Zahlungsmethoden über ⟨Stripe/Adyen⟩. Rechnungen stehen im Account zum Download bereit."
                }
            },
            {
                "@type": "Question",
                "name": "Wie wird meine Datensicherheit gewährleistet?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Wir setzen TLS-Verschlüsselung, rollenbasierte Zugriffe und regelmäßige Backups ein. Details finden Sie in der Datenschutzerklärung."
                }
            },
            {
                "@type": "Question",
                "name": "Bietet ihr Integrationen mit anderen Tools an?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Ja, es gibt Integrationen mit ⟨Beispiel-Tools⟩. Eine aktuelle Liste finden Sie auf der Features-Seite."
                }
            },
            {
                "@type": "Question",
                "name": "Wie schnell erhalte ich Zugang nach der Bestellung?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "In der Regel sofort. Sollten Sie keine Aktivierungs-E-Mail erhalten, prüfen Sie bitte den Spam-Ordner oder kontaktieren Sie den Support."
                }
            },
            {
                "@type": "Question",
                "name": "Wie kann ich eine Rückerstattung beantragen?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Informationen zum Widerruf und zu Erstattungen finden Sie unter Rückgaben & Erstattungen. Wenden Sie sich bei Fragen an den Support."
                }
            }
        ]
    };

    return (
        <Page>
            <div className={s.content}>
                <nav aria-label="Brotkrumen">
                    <a href="/">Startseite</a> &nbsp;/&nbsp; <a href="/help">Hilfe &amp; Support</a> &nbsp;/&nbsp; <span>FAQ</span>
                </nav>

                <h1 className={s.content__title}>FAQ – Häufige Fragen</h1>
                <p><strong>Zuletzt aktualisiert:</strong> 11.11.2025</p>

                <p>Hier finden Sie Antworten auf häufige Fragen zu Dashedo. Nicht fündig geworden? <a href="/help/contact">Kontaktieren Sie uns</a>.</p>

                <details>
                    <summary><strong>Was ist Dashedo und für wen ist es geeignet?</strong></summary>
                    <p>Dashedo ist ein cloudbasierter Software-Dienst (SaaS) für ⟨kurze Produktbeschreibung⟩. Ideal für ⟨Zielgruppen⟩.</p>
                </details>

                <details>
                    <summary><strong>Gibt es eine kostenlose Testphase?</strong></summary>
                    <p>Ja – Umfang und Laufzeit finden Sie unter <a href="/pricing">Preise</a>. Eine Kündigung ist jederzeit vor Ende der Testphase möglich.</p>
                </details>

                <details>
                    <summary><strong>Wie ändere oder kündige ich meinen Plan?</strong></summary>
                    <p>Im Account-Bereich können Sie Ihren Tarif flexibel anpassen. Es gelten die Hinweise in unseren <a href="/legal/terms">AGB</a>.</p>
                </details>

                <details>
                    <summary><strong>Welche Zahlungsmethoden werden unterstützt?</strong></summary>
                    <p>Wir akzeptieren Zahlungen über ⟨Stripe/Adyen⟩ (z.&nbsp;B. Kreditkarte, SEPA). Rechnungen finden Sie in Ihrem Konto.</p>
                </details>

                <details>
                    <summary><strong>Wie sicher sind meine Daten?</strong></summary>
                    <p>Verschlüsselung, Zugriffskontrollen, Backups und Monitoring sind Standard. Details: <a href="/legal/privacy">Datenschutzerklärung</a>.</p>
                </details>

                <details>
                    <summary><strong>Gibt es Integrationen?</strong></summary>
                    <p>Ja, u.&nbsp;a. mit ⟨Beispiel-Tools⟩. Mehr unter <a href="/features">Funktionen</a>.</p>
                </details>

                <details>
                    <summary><strong>Wie erhalte ich Zugang nach der Bestellung?</strong></summary>
                    <p>In der Regel sofort via Aktivierungs-E-Mail. Prüfen Sie ggf. den Spam-Ordner. Hilfe: <a href="/help/shipping">Bereitstellung &amp; Lieferung</a>.</p>
                </details>

                <details>
                    <summary><strong>Wie beantrage ich eine Rückerstattung?</strong></summary>
                    <p>Hinweise und Voraussetzungen finden Sie unter <a href="/help/returns-refunds">Rückgaben &amp; Erstattungen</a>.</p>
                </details>

                <p>Weitere Themen: <a href="/help/contact">Kontakt</a> · <a href="/legal/terms">AGB</a> · <a href="/legal/privacy">Datenschutz</a></p>

                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            </div>
        </Page>
    );
}
