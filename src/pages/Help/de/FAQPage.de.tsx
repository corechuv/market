// src/pages/Help/de/FAQPage.de.tsx
import "react"
import { Helmet } from "react-helmet-async"
import Page from "../../../components/UI/Page/Page"
import s from "../Help.module.scss"
import Accordion from "../../../components/UI/Accordion"

import { faqItemsDe } from "../../../data/information/faq.de"

export default function FAQPageDe() {
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItemsDe.map((item) => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answerText,
            },
        })),
    };

    const title = "FAQ – Hilfe & Support | Dashedo";
    const description =
        "Häufige Fragen und Antworten zu Dashedo: Konto, Bestellungen, Versand, Rückgaben und technische Themen.";

    return (
        <>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href="https://dashedo.com/help/faq" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content="https://dashedo.com/help/faq" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
            </Helmet>
            <Page>
                <div className={s.content}>
                    <nav aria-label="Brotkrumen">
                        <a href="/">Startseite</a> &nbsp;/&nbsp;{" "}
                        <a href="/help">Hilfe &amp; Support</a> &nbsp;/&nbsp; <span>FAQ</span>
                    </nav>

                    <h1 className={s.content__title}>FAQ – Häufige Fragen</h1>
                    <p>
                        <strong>Zuletzt aktualisiert:</strong> 11.11.2025
                    </p>

                    <p>
                        Hier finden Sie Antworten auf häufige Fragen zu Dashedo. Nicht fündig
                        geworden? <a href="/help/contact">Kontaktieren Sie uns</a>.
                    </p>

                    <section className={s.content__accordion}>
                        {faqItemsDe.map((item) => (
                            <Accordion key={item.id} title={item.question}>
                                {item.answerContent}
                            </Accordion>
                        ))}
                    </section>

                    <p>
                        Weitere Themen: <a href="/help/contact">Kontakt</a> ·{" "}
                        <a href="/legal/terms">AGB</a> ·{" "}
                        <a href="/legal/privacy">Datenschutz</a>
                    </p>

                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify(faqJsonLd),
                        }}
                    />
                </div>
            </Page>
        </>
    );
}
