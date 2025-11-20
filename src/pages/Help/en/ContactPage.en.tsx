// src/pages/Help/en/ContactPage.en.tsx
import "react";
import Page from "../../../components/UI/Page/Page";
import s from "../Help.module.scss";
import Logo from "../../../components/Footer/Logo";

export default function ContactPageEn() {
    const orgJsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "⟨Dashedo GmbH⟩",
        "url": "https://dashedo.com/",
        "contactPoint": [
            {
                "@type": "ContactPoint",
                "contactType": "customer support",
                "telephone": "+49 ⟨30⟩ ⟨1234567⟩",
                "email": "support@dashedo.com",
                "areaServed": "DE, AT, CH, EU",
                "availableLanguage": ["de", "en"],
                "hoursAvailable": {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
                    "opens": "09:00",
                    "closes": "18:00"
                }
            }
        ]
    };

    const pageJsonLd = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Contact",
        "url": "https://dashedo.com/help/contact",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dashedo.com/" },
                { "@type": "ListItem", "position": 2, "name": "Help & Support", "item": "https://dashedo.com/help" },
                { "@type": "ListItem", "position": 3, "name": "Contact", "item": "https://dashedo.com/help/contact" }
            ]
        }
    };

    return (
        <Page>
            <section className={s.content} lang="en">
                <Logo />

                <nav aria-label="Breadcrumb">
                    <a href="/">Home</a> &nbsp;/&nbsp; <a href="/help">Help &amp; Support</a> &nbsp;/&nbsp; <span>Contact</span>
                </nav>

                <h1 className={s.content__title}>Contact</h1>
                <p><strong>Last updated:</strong> 11.11.2025</p>

                <h2>How to reach us</h2>
                <p>
                    Our support team is available Monday–Friday, 09:00–18:00 (CET/CEST).
                    We usually respond within 24&nbsp;hours.
                </p>
                <ul>
                    <li><strong>Email:</strong> <a href="mailto:support@dashedo.com">support@dashedo.com</a></li>
                    <li><strong>Phone:</strong> <a href="tel:+49⟨30⟩⟨1234567⟩">+49 ⟨30⟩ ⟨1234567⟩</a></li>
                    <li><strong>Address (registered office):</strong> ⟨Dashedo GmbH, Musterstraße 1, 10115 Berlin⟩</li>
                </ul>

                <h2>Get to a solution faster</h2>
                <ol>
                    <li>Have a look at our <a href="/help/faq">FAQ</a> – many questions are already answered there.</li>
                    <li>Describe your request clearly and, if needed, add screenshots, log IDs, or links.</li>
                    <li>Include your <em>account email</em> and – if available – your <em>ticket or order number</em>.</li>
                </ol>

                <h2>Data protection &amp; support</h2>
                <p>
                    We process support requests in accordance with Art.&nbsp;6(1)(b)/(f) GDPR. For details, see our
                    <a href="/legal/privacy"> privacy policy</a>.
                </p>

                <p>
                    More help:{" "}
                    <a href="/help/returns-refunds">Returns &amp; refunds</a>,{" "}
                    <a href="/help/shipping">Provision &amp; delivery</a>.
                </p>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
                />
            </section>
        </Page>
    );
}
