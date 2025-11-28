// src/pages/Legal/en/ImprintPage.en.tsx
import "react"
import { Helmet } from "react-helmet-async"
import Page from "../../../components/UI/Page/Page"
import s from "../Legal.module.scss"

export default function ImprintPageEn() {
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
        "name": "Imprint",
        "url": "https://dashedo.com/legal/imprint",
        "dateModified": "2025-11-11"
    };

    const title = "Imprint (Legal notice) – Legal | Dashedo";
    const description =
        "Legal notice for Dashedo GmbH: company details, contact information, trade register entry, VAT ID and liability information.";

    return (
        <>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href="https://dashedo.com/legal/imprint" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content="https://dashedo.com/legal/imprint" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
            </Helmet>
            <Page>
                <div className={s.content}>
                    <nav aria-label="Breadcrumb">
                        <a href="/">Home</a> &nbsp;/&nbsp; <a href="/legal">Legal</a> &nbsp;/&nbsp; <span>Imprint</span>
                    </nav>

                    <h1 className={s.content__title}>Imprint</h1>
                    <p><strong>Last updated:</strong> 11.11.2025</p>

                    <h2>Provider information in accordance with § 5 TMG</h2>
                    <p>
                        <strong>⟨Dashedo GmbH⟩</strong><br />
                        ⟨Musterstraße 1⟩<br />
                        10115 Berlin, Germany
                    </p>
                    <p>
                        Phone: +49 ⟨30⟩ ⟨1234567⟩<br />
                        Email: <a href="mailto:⟨hello@dashedo.com⟩">⟨hello@dashedo.com⟩</a><br />
                        Website: <a href="https://dashedo.com/">dashedo.com</a>
                    </p>

                    <h3>Authorised representative(s)</h3>
                    <p>Managing director: ⟨First name Last name⟩</p>

                    <h3>Commercial register &amp; VAT</h3>
                    <p>
                        Register court: Local Court of Berlin-Charlottenburg<br />
                        Commercial register number (HRB): ⟨HRB number⟩<br />
                        VAT ID No.: ⟨DE number⟩
                    </p>

                    <h3>Responsible person pursuant to § 18(2) MStV</h3>
                    <p>⟨First name Last name⟩, ⟨address as above⟩</p>

                    <h2>Liability for content</h2>
                    <p>
                        As a service provider, we are responsible for our own content on these pages in accordance with § 7(1) TMG.
                        However, under §§ 8–10 TMG we are not obliged to monitor transmitted or stored third-party information
                        or to investigate circumstances indicating unlawful activity. Obligations to remove or block the use of
                        information under general laws remain unaffected.
                    </p>

                    <h2>Liability for links</h2>
                    <p>
                        Our website contains links to external third-party websites over whose content we have no control.
                        Therefore, we cannot assume any liability for this external content. The respective provider or
                        operator of the linked pages is always responsible for their content.
                    </p>

                    <h2>Copyright</h2>
                    <p>
                        The content and works created by us on these pages are subject to German copyright law.
                        Duplication, editing, distribution, or any kind of utilisation beyond the limits of copyright
                        law requires our prior written consent.
                    </p>

                    <h2>Alternative dispute resolution</h2>
                    <p>
                        The European Commission provides a platform for online dispute resolution (ODR):{" "}
                        <a href="https://ec.europa.eu/odr" rel="noopener noreferrer">ec.europa.eu/odr</a>.
                        We are neither obliged nor generally willing to participate in dispute resolution proceedings
                        before a consumer arbitration board, unless mandatory by law.
                    </p>

                    <p>
                        Further information: <a href="/legal/privacy">Privacy policy</a>,{" "}
                        <a href="/legal/cookies">Cookie policy</a>.
                    </p>

                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
                    />
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
                    />
                </div>
            </Page>
        </>
    );
}
