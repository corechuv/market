// src/pages/Legal/de/ImprintPage.de.tsx
import "react"
import Page from "../../../components/UI/Page/Page"
import s from "../Legal.module.scss"
import Logo from "../../../components/Footer/Logo";

export default function ImprintPageDe() {
    const orgJsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "⟨Dashedo GmbH⟩",
        "url": "https://dashedo.com/",
        "logo": "https://dashedo.com/⟨pfad-zum-logo⟩.png",
        "email": "mailto:⟨hello@dashedo.com⟩",
        "telephone": "+49 ⟨30⟩ ⟨1234567⟩",
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
        "@type": "WebPage",
        "name": "Impressum",
        "url": "https://dashedo.com/legal/imprint",
        "dateModified": "2025-11-11"
    };

    return (
        <Page>
            <div className={s.content}>

                <Logo />

                <nav aria-label="Brotkrumen">
                    <a href="/">Startseite</a> &nbsp;/&nbsp; <a href="/legal">Rechtliches</a> &nbsp;/&nbsp; <span>Impressum</span>
                </nav>

                <h1 className={s.content__title}>Impressum</h1>
                <p><strong>Zuletzt aktualisiert:</strong> 11.11.2025</p>

                <h2>Anbieterkennzeichnung gemäß § 5 TMG</h2>
                <p>
                    <strong>⟨Dashedo GmbH⟩</strong><br />
                    ⟨Musterstraße 1⟩<br />
                    10115 Berlin, Deutschland
                </p>
                <p>
                    Telefon: +49 ⟨30⟩ ⟨1234567⟩<br />
                    E-Mail: <a href="mailto:⟨hello@dashedo.com⟩">⟨hello@dashedo.com⟩</a><br />
                    Website: <a href="https://dashedo.com/">dashedo.com</a>
                </p>

                <h3>Vertretungsberechtigte Person(en)</h3>
                <p>Geschäftsführung: ⟨Vorname Nachname⟩</p>

                <h3>Register &amp; Umsatzsteuer</h3>
                <p>
                    Registergericht: Amtsgericht Berlin-Charlottenburg<br />
                    Handelsregisternummer (HRB): ⟨HRB-Nummer⟩<br />
                    USt-IdNr.: ⟨DE-Nummer⟩
                </p>

                <h3>Verantwortlich i.S.d. § 18 Abs. 2 MStV</h3>
                <p>⟨Vorname Nachname⟩, ⟨Anschrift wie oben⟩</p>

                <h2>Haftung für Inhalte</h2>
                <p>
                    Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte verantwortlich.
                    Nach §§ 8–10 TMG sind wir jedoch nicht verpflichtet, übermittelte oder gespeicherte
                    fremde Informationen zu überwachen. Verpflichtungen zur Entfernung oder Sperrung
                    der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben unberührt.
                </p>

                <h2>Haftung für Links</h2>
                <p>
                    Unsere Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir
                    keinen Einfluss haben. Für diese fremden Inhalte übernehmen wir keine Haftung. Für
                    die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter verantwortlich.
                </p>

                <h2>Urheberrecht</h2>
                <p>
                    Die durch uns erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
                    Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung
                    bedürfen unserer schriftlichen Zustimmung.
                </p>

                <h2>Außergerichtliche Streitbeilegung</h2>
                <p>
                    Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                    <a href="https://ec.europa.eu/odr" rel="noopener noreferrer">ec.europa.eu/odr</a>.
                    Wir sind weder verpflichtet noch grundsätzlich bereit, an Streitbeilegungsverfahren vor einer
                    Verbraucherschlichtungsstelle teilzunehmen, sofern nicht gesetzlich zwingend.
                </p>

                <p>Weitere Informationen: <a href="/legal/privacy">Datenschutzerklärung</a>, <a href="/legal/cookies">Cookie-Richtlinie</a>.</p>

                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
            </div>
        </Page>
    );
}
