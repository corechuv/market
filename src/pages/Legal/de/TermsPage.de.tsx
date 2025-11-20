// src/pages/Legal/de/TermsPage.de.tsx
import "react"
import Page from "../../../components/UI/Page/Page"
import s from "../Legal.module.scss"
import Logo from "../../../components/Footer/Logo";

export default function TermsPageDe() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Allgemeine Geschäftsbedingungen (AGB)",
        "url": "https://dashedo.com/legal/terms",
        "dateModified": "2025-11-11"
    };

    return (
        <Page>
            <div className={s.content}>

                <Logo />

                <nav aria-label="Brotkrumen">
                    <a href="/">Startseite</a> &nbsp;/&nbsp; <a href="/legal">Rechtliches</a> &nbsp;/&nbsp; <span>AGB</span>
                </nav>

                <h1 className={s.content__title}>Allgemeine Geschäftsbedingungen (AGB)</h1>
                <p><strong>Zuletzt aktualisiert:</strong> 11.11.2025</p>

                <h2>1. Geltungsbereich</h2>
                <p>Diese AGB regeln die Nutzung der digitalen Dienste von <strong>⟨Dashedo GmbH⟩</strong> auf <strong>dashedo.com</strong> („Dienst“). Abweichende Bedingungen gelten nur, wenn wir ihnen ausdrücklich zustimmen.</p>

                <h2>2. Vertragsparteien &amp; Vertragsschluss</h2>
                <p>Vertragspartner ist ⟨Dashedo GmbH⟩, ⟨Musterstraße 1⟩, 10115 Berlin. Der Vertrag kommt durch Registrierung, Bestellung eines Plans oder schriftliche Bestätigung zustande.</p>

                <h2>3. Leistungsbeschreibung</h2>
                <p>Wir stellen einen cloudbasierten Software-Dienst (SaaS) bereit. Verfügbarkeit, Funktionsumfang und ggf. Nutzungsgrenzen ergeben sich aus der jeweiligen Planbeschreibung auf <a href="/pricing">/pricing</a>.</p>

                <h2>4. Nutzerkonto</h2>
                <p>Für die Nutzung ist ein Konto erforderlich. Zugangsdaten sind geheim zu halten. Aktivitäten im Konto gelten als vom Konto-Inhaber veranlasst.</p>

                <h2>5. Preise &amp; Zahlung</h2>
                <p>Es gelten die zum Zeitpunkt der Bestellung ausgewiesenen Preise zuzüglich gesetzlicher Umsatzsteuer. Abrechnung erfolgt ⟨monatlich/jährlich⟩ über ⟨Zahlungsdienstleister⟩. Bei Zahlungsverzug sind wir berechtigt, den Zugang vorübergehend zu sperren.</p>

                <h2>6. Laufzeit &amp; Kündigung</h2>
                <p>Verträge laufen ⟨auf unbestimmte Zeit / für die gewählte Abrechnungsperiode⟩ und verlängern sich automatisch, sofern nicht fristgerecht zum Periodenende gekündigt wird. Kündigungen können im Accountbereich oder in Textform erfolgen.</p>

                <h2>7. Nutzungsrechte &amp; geistiges Eigentum</h2>
                <p>Wir räumen ein einfaches, nicht übertragbares Recht zur Nutzung des Dienstes während der Vertragslaufzeit ein. Sämtliche Schutzrechte verbleiben bei uns.</p>

                <h2>8. Verfügbarkeit &amp; Support</h2>
                <p>Wir streben eine hohe Verfügbarkeit an. Wartungsfenster werden – soweit möglich – angekündigt. Support gemäß den Angaben unter <a href="/help">/help</a>.</p>

                <h2>9. Verbotene Nutzungen</h2>
                <p>Untersagt sind u.&nbsp;a. rechtswidrige Inhalte, Beeinträchtigung der Systemsicherheit, Reverse Engineering, Umgehung technischer Schutzmaßnahmen und Überlastungsangriffe.</p>

                <h2>10. Haftung</h2>
                <p>Wir haften unbegrenzt bei Vorsatz und grober Fahrlässigkeit sowie für Verletzungen von Leben, Körper oder Gesundheit. Bei leichter Fahrlässigkeit nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten), beschränkt auf den typischerweise vorhersehbaren Schaden.</p>

                <h2>11. Gewährleistung</h2>
                <p>Es gilt das gesetzliche Gewährleistungsrecht. Für unentgeltliche Leistungen ist die Haftung auf Vorsatz und grobe Fahrlässigkeit beschränkt.</p>

                <h2>12. Datenschutz</h2>
                <p>Informationen zur Verarbeitung personenbezogener Daten finden Sie in unserer <a href="/legal/privacy">Datenschutzerklärung</a>. Wir schließen, sofern erforderlich, Auftragsverarbeitungsverträge (Art. 28 DSGVO).</p>

                <h2>13. Vertraulichkeit</h2>
                <p>Die Parteien behandeln vertrauliche Informationen streng vertraulich und verwenden sie ausschließlich zur Vertragserfüllung.</p>

                <h2>14. Änderungen der AGB</h2>
                <p>Wir können diese AGB mit Wirkung für die Zukunft ändern. Über wesentliche Änderungen informieren wir rechtzeitig. Widersprechen Sie nicht innerhalb von ⟨6 Wochen⟩, gelten die Änderungen als akzeptiert (Hinweis in der Änderungsmitteilung).</p>

                <h2>15. Verbraucherhinweise / Widerrufsrecht</h2>
                <p>Ist der Kunde Verbraucher, gilt das gesetzliche Widerrufsrecht. Bei digitalen Inhalten kann es erlöschen, wenn vor Ablauf der Frist mit der Ausführung begonnen wird und der Verbraucher dem ausdrücklich zugestimmt hat.</p>

                {/*
                <h3>Muster-Widerrufsformular</h3>
                <pre>
Hiermit widerrufe(n) ich/wir den von mir/uns abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung:
Bestellt am: ⟨Datum⟩ / erhalten am: ⟨Datum⟩
Name des/der Verbraucher(s): ⟨…⟩
Anschrift des/der Verbraucher(s): ⟨…⟩
Unterschrift (nur bei Mitteilung auf Papier) — Datum
                </pre>
                */}

                <h2>16. Schlussbestimmungen</h2>
                <p>Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Gerichtsstand ist – sofern zulässig – ⟨Berlin⟩. Vertragssprache ist Deutsch.</p>

                <p>Weitere Informationen: <a href="/legal/imprint">Impressum</a>, <a href="/legal/privacy">Datenschutzerklärung</a>, <a href="/legal/cookies">Cookie-Richtlinie</a>.</p>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </div>
        </Page>
    );
}
