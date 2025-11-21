// src/pages/Help/en/FAQPage.en.tsx
import "react";
import Page from "../../../components/UI/Page/Page";
import s from "../Help.module.scss";
import Accordion from "../../../components/UI/Accordion";

import { faqItemsEn } from "../../../data/information/faq.en";

export default function FAQPageEn() {
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItemsEn.map((item) => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answerText,
            },
        })),
    };

    return (
        <Page>
            <div className={s.content}>
                <nav aria-label="Breadcrumb">
                    <a href="/">Home</a> &nbsp;/&nbsp;{" "}
                    <a href="/help">Help &amp; Support</a> &nbsp;/&nbsp; <span>FAQ</span>
                </nav>

                <h1 className={s.content__title}>FAQ – Frequently asked questions</h1>
                <p>
                    <strong>Last updated:</strong> 11.11.2025
                </p>

                <p>
                    Here you’ll find answers to common questions about Dashedo. Didn’t
                    find what you were looking for?{" "}
                    <a href="/help/contact">Get in touch with us</a>.
                </p>

                <section className={s.content__accordion}>
                    {faqItemsEn.map((item) => (
                        <Accordion key={item.id} title={item.question}>
                            {item.answerContent}
                        </Accordion>
                    ))}
                </section>

                <p>
                    More topics: <a href="/help/contact">Contact</a> ·{" "}
                    <a href="/legal/terms">Terms &amp; Conditions</a> ·{" "}
                    <a href="/legal/privacy">Privacy</a>
                </p>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(faqJsonLd),
                    }}
                />
            </div>
        </Page>
    );
}
