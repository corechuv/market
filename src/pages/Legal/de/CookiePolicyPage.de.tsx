// src/pages/Legal/de/CookiePolicyPage.de.tsx
import "react"
import Page from "../../../components/UI/Page/Page"
import s from "../Legal.module.scss"
import Logo from "../../../components/Footer/Logo";
import Button from "../../../components/UI/Button";

export default function CookiePolicyPageDe() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Cookie-Richtlinie",
        "url": "https://dashedo.com/legal/cookies",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Startseite", "item": "https://dashedo.com/" },
                { "@type": "ListItem", "position": 2, "name": "Rechtliches", "item": "https://dashedo.com/legal" },
                { "@type": "ListItem", "position": 3, "name": "Cookie-Richtlinie", "item": "https://dashedo.com/legal/cookies" }
            ]
        }
    };

    const openCookieSettings = () => {
        try {
            window.dispatchEvent(new Event("cookie-consent:open"));
            (window as any)?.Cookiebot?.renew?.();
            (window as any)?.OneTrust?.ToggleInfoDisplay?.();
            (window as any)?.klaro?.show?.();
            (window as any)?.CookieConsent?.showPreferences?.();
        } catch (e) {
            alert("Bitte verwenden Sie den Cookie-Banner am Seitenende dieser Seite, um Ihre Einstellungen zu ändern.");
        }
    };

    return (
        <Page>
            <div className={s.content}>

                <Logo />

                <nav aria-label="Brotkrumen">
                    <a href="/">Startseite</a> &nbsp;/&nbsp; <a href="/legal">Rechtliches</a> &nbsp;/&nbsp; <span>Cookie-Richtlinie</span>
                </nav>

                <h1>Cookie-Richtlinie</h1>
                <p><strong>Zuletzt aktualisiert:</strong> 11.11.2025</p>

                <p>
                    Diese Cookie-Richtlinie erklärt, wie <strong>⟨Unternehmen, z.&nbsp;B. Dashedo GmbH⟩</strong> („wir“)
                    Cookies und ähnliche Technologien auf <strong>dashedo.com</strong> verwendet. Wir informieren über
                    Arten, Zwecke, Speicherdauern und Rechtsgrundlagen gemäß Art.&nbsp;6 DSGVO sowie Ihre
                    Widerspruchs- und Widerrufsrechte.
                </p>

                <h2>1. Was sind Cookies?</h2>
                <p>
                    Cookies sind kleine Textdateien, die über den Browser auf Ihrem Gerät gespeichert werden.
                    Ähnliche Technologien sind z.&nbsp;B. Local Storage, Session Storage, Pixel und Tags. Einige Cookies
                    sind technisch erforderlich, andere dienen Statistik, Komfort oder Marketing.
                </p>

                <h2>2. Rechtsgrundlagen</h2>
                <ul>
                    <li><strong>Essentiell (Art. 6 Abs. 1 lit. f DSGVO):</strong> erforderlich, um unsere Website bereitzustellen (z.&nbsp;B. Sitzung, Sicherheit, Consent-Speicherung).</li>
                    <li><strong>Statistik/Marketing (Art. 6 Abs. 1 lit. a DSGVO):</strong> nur mit Ihrer Einwilligung über unseren Consent-Banner.</li>
                </ul>

                <h2>3. Cookie-Kategorien</h2>
                <ul>
                    <li><strong>Notwendig:</strong> Grundfunktionen, Sicherheit, Lastverteilung, Betrugsprävention.</li>
                    <li><strong>Präferenzen:</strong> Sprache, Layout, Einstellungen.</li>
                    <li><strong>Statistik:</strong> anonyme/aggregierte Nutzungsmessung (z.&nbsp;B. Seitenaufrufe).</li>
                    <li><strong>Marketing:</strong> Reichweitenmessung, Retargeting, Konversions-Tracking.</li>
                    <li><strong>Externe Medien:</strong> eingebettete Inhalte (z.&nbsp;B. Karten, Videos).</li>
                </ul>

                <h2>4. Verwaltung Ihrer Einwilligung</h2>
                <p>Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft anpassen oder widerrufen:</p>
                <p>
                    <Button onClick={openCookieSettings}>Cookie-Einstellungen öffnen</Button>
                </p>
                <p>Alternativ: Browser-Einstellungen für Cookies ändern oder Cookies löschen.</p>

                <h2>5. Speicherdauern</h2>
                <p>
                    Session-Cookies werden nach Sitzungsende gelöscht. Persistente Cookies bleiben bis zum Ablauf der
                    in unserem Consent-Tool ausgewiesenen Dauer gespeichert oder bis Sie diese manuell entfernen.
                    Die konkrete Laufzeit je Cookie entnehmen Sie bitte der Liste im Consent-Banner.
                </p>

                <h2>6. Eingesetzte Dienste (Beispiele)</h2>
                <ul>
                    <li><strong>Web-Analyse:</strong> ⟨z.&nbsp;B. Google Analytics / Matomo⟩ – Statistik, Performance. Anbieter: ⟨Name, Sitz⟩.</li>
                    <li><strong>Marketing:</strong> ⟨z.&nbsp;B. Meta Pixel, LinkedIn Insight Tag⟩ – Konversions-Tracking.</li>
                    <li><strong>CDN/Performance:</strong> ⟨z.&nbsp;B. Cloudflare⟩ – Sicherheit und Auslieferung.</li>
                    <li><strong>Video/Maps:</strong> ⟨z.&nbsp;B. YouTube, Vimeo, Google Maps⟩ – eingebettete Inhalte.</li>
                </ul>
                <p><em>Hinweis:</em> Die jeweils aktuelle, verbindliche Anbieterliste inkl. Drittlandübermittlungen, Garantien und Speicherdauern finden Sie immer im Consent-Banner.</p>

                <h2>7. Datenübermittlungen in Drittländer</h2>
                <p>
                    Sofern Anbieter außerhalb der EU/des EWR eingesetzt werden, erfolgt die Übermittlung
                    auf Basis geeigneter Garantien (Art.&nbsp;46 DSGVO), z.&nbsp;B. EU-Standardvertragsklauseln. Details siehe Anbieterliste im Consent-Tool.
                </p>

                <h2>8. Ihre Rechte</h2>
                <p>
                    Sie haben u.&nbsp;a. das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
                    Datenübertragbarkeit sowie Widerspruch (Art.&nbsp;15–21 DSGVO). Beschwerden können Sie an eine
                    Datenschutzaufsichtsbehörde richten.
                </p>

                <p>
                    Weitere Informationen: <a href="/legal/privacy">Datenschutzerklärung</a>, <a href="/legal/imprint">Impressum</a>.
                </p>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </div>
        </Page>
    );
}
