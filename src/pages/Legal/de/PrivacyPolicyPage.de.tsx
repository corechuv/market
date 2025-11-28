// src/pages/Legal/de/PrivacyPolicyPage.de.tsx
import "react"
import { Helmet } from "react-helmet-async"
import Page from "../../../components/UI/Page/Page"
import s from "../Legal.module.scss"

export default function PrivacyPolicyPageDe() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Datenschutzerklärung",
        "url": "https://dashedo.com/legal/privacy",
        "dateModified": "2025-11-11"
    };

    const title = "Datenschutzerklärung – Rechtliches | Dashedo";
    const description =
        "Datenschutzerklärung der Dashedo GmbH: Informationen zur Verarbeitung personenbezogener Daten, Rechtsgrundlagen (DSGVO), Speicherdauer und Ihren Betroffenenrechten.";

    return (
        <>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href="https://dashedo.com/legal/privacy" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content="https://dashedo.com/legal/privacy" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
            </Helmet>
            <Page>
                <div className={s.content}>
                    <nav aria-label="Brotkrumen">
                        <a href="/">Startseite</a> &nbsp;/&nbsp; <a href="/legal">Rechtliches</a> &nbsp;/&nbsp; <span>Datenschutzerklärung</span>
                    </nav>

                    <h1 className={s.content__title}>Datenschutzerklärung</h1>
                    <p><strong>Zuletzt aktualisiert:</strong> 11.11.2025</p>

                    <h2>1. Verantwortlicher</h2>
                    <p>
                        <strong>⟨Dashedo GmbH⟩</strong><br />
                        ⟨Musterstraße 1⟩, 10115 Berlin, Deutschland<br />
                        E-Mail: <a href="mailto:⟨hello@dashedo.com⟩">⟨hello@dashedo.com⟩</a><br />
                        Telefon: +49 ⟨30⟩ ⟨1234567⟩
                    </p>
                    <p><em>Datenschutzbeauftragte/r (falls vorhanden):</em> ⟨Name, Kontakt⟩</p>

                    <h2>2. Zwecke, Rechtsgrundlagen, Speicherdauer</h2>
                    <ul>
                        <li><strong>Bereitstellung der Website / Server-Logs</strong> (Art. 6 Abs. 1 lit. f DSGVO): IP-Adresse (gekürzt), Zeitstempel, User-Agent, Referrer; Löschung i.d.R. nach ⟨30⟩ Tagen.</li>
                        <li><strong>Kontaktanfragen</strong> (Art. 6 Abs. 1 lit. b oder f): Bearbeitung Ihrer Anfrage; Löschung nach Abschluss bzw. gesetzlichen Pflichten.</li>
                        <li><strong>Kundenkonto / Registrierung</strong> (Art. 6 Abs. 1 lit. b): Verwaltung des Accounts; Speicherung bis Kündigung/gesetzlicher Pflichten.</li>
                        <li><strong>Vertragserfüllung &amp; Abrechnung</strong> (Art. 6 Abs. 1 lit. b, c): Leistungsbereitstellung, Zahlung, Buchhaltung; Aufbewahrung nach HGB/AO.</li>
                        <li><strong>Newsletter</strong> (Art. 6 Abs. 1 lit. a): Nur mit Einwilligung (Double-Opt-In); Widerruf jederzeit möglich.</li>
                        <li><strong>Analyse &amp; Marketing</strong> (Art. 6 Abs. 1 lit. a): siehe <a href="/legal/cookies">Cookie-Richtlinie</a>.</li>
                    </ul>

                    <h2>3. Pflichtangaben / Minderjährige</h2>
                    <p>Die Bereitstellung bestimmter Daten kann für Vertragsschluss oder Support erforderlich sein. Unsere Angebote richten sich nicht an Kinder unter 16 Jahren.</p>

                    <h2>4. Empfänger der Daten</h2>
                    <p>Wir setzen Auftragsverarbeiter gemäß Art. 28 DSGVO ein (z.&nbsp;B. Hosting, E-Mail, Support-Tools, Analytik). Mit allen Dienstleistern bestehen Verträge zur Auftragsverarbeitung.</p>

                    <h2>5. Drittlandübermittlungen</h2>
                    <p>
                        Bei Verarbeitung in Drittländern (außerhalb EU/EWR) stellen wir geeignete Garantien sicher
                        (Art. 46 DSGVO, z.&nbsp;B. EU-Standardvertragsklauseln) und bewerten das Datenschutzniveau.
                        Details finden Sie in der Anbieterliste unseres Consent-Banners.
                    </p>

                    <h2>6. Speicherdauer</h2>
                    <p>Wir verarbeiten personenbezogene Daten nur so lange, wie es für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.</p>

                    <h2>7. Ihre Rechte</h2>
                    <ul>
                        <li>Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung (Art. 18)</li>
                        <li>Datenübertragbarkeit (Art. 20)</li>
                        <li>Widerspruch gegen Verarbeitungen auf Basis berechtigter Interessen (Art. 21)</li>
                        <li>Widerruf erteilter Einwilligungen (Art. 7 Abs. 3) mit Wirkung für die Zukunft</li>
                        <li>Beschwerde bei einer Aufsichtsbehörde (Art. 77)</li>
                    </ul>

                    <h2>8. Sicherheit</h2>
                    <p>Wir treffen angemessene technische und organisatorische Maßnahmen (z.&nbsp;B. TLS-Verschlüsselung, Zugriffskontrollen, Datensparsamkeit), um Ihre Daten zu schützen.</p>

                    <h2>9. Cookies &amp; ähnliche Technologien</h2>
                    <p>Details zu eingesetzten Cookies, Rechtsgrundlagen, Speicherdauern sowie Widerrufsoptionen finden Sie in unserer <a href="/legal/cookies">Cookie-Richtlinie</a>.</p>

                    <h2>10. Newsletter</h2>
                    <p>Versand nur nach Double-Opt-In. Protokollierung von Anmeldung/Bestätigung. Abmeldung jederzeit über Link in jeder E-Mail.</p>

                    <h2>11. Zahlungsabwicklung (falls zutreffend)</h2>
                    <p>Bei Zahlungen können Zahlungsdaten an Zahlungsdienstleister (z.&nbsp;B. ⟨Stripe/Adyen⟩) übermittelt werden. Rechtsgrundlage Art. 6 Abs. 1 lit. b und ggf. lit. f DSGVO.</p>

                    <h2>12. Bewerbungen (falls zutreffend)</h2>
                    <p>Verarbeitung zur Entscheidung über die Begründung eines Beschäftigungsverhältnisses (§ 26 BDSG); Löschung i.d.R. nach ⟨6⟩ Monaten.</p>

                    <h2>13. Änderungen dieser Erklärung</h2>
                    <p>Wir passen diese Erklärung bei Bedarf an. Die aktuelle Version finden Sie stets auf dieser Seite.</p>

                    <p>Weitere Informationen: <a href="/legal/imprint">Impressum</a>, <a href="/legal/terms">AGB</a>.</p>

                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                    />
                </div>
            </Page>
        </>
    );
}