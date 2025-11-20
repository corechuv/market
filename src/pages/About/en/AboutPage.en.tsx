// src/pages/About/en/AboutPage.en.tsx
import "react";
import Page from "../../../components/UI/Page/Page";
import s from "../About.module.scss";
import Logo from "../../../components/Footer/Logo";

export default function AboutPageEn() {
    const orgJsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Dashedo GmbH",
        "url": "https://dashedo.com/",
        "logo": "https://dashedo.com/dashedo-logo.edge-height120-tracking30.svg",
        "foundingDate": "2023-01-01",
        "founders": [
            { "@type": "Person", "name": "Jane Doe" },
            { "@type": "Person", "name": "John Doe" }
        ],
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Example Street 1",
            "postalCode": "10115",
            "addressLocality": "Berlin",
            "addressCountry": "DE"
        },
        "sameAs": [
            "https://www.linkedin.com/company/dashedo",
            "https://x.com/dashedo"
        ]
    };

    const pageJsonLd = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "About us",
        "url": "https://dashedo.com/about",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://dashedo.com/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "About us",
                    "item": "https://dashedo.com/about"
                }
            ]
        }
    };

    return (
        <Page>
            <div className={s.content}>

                <Logo />

                <nav aria-label="Breadcrumb">
                    <a href="/">Home</a> &nbsp;/&nbsp; <span>About us</span>
                </nav>

                <h1 className={s.content__title}>About us</h1>
                <p>
                    <strong>Last updated:</strong> November 11, 2025
                </p>

                <h2>Our mission</h2>
                <p>
                    We build software that radically simplifies complex workflows.
                    With Dashedo, we enable teams to design, automate, and monitor
                    their critical processes – quickly, securely, and at scale.
                </p>

                <h2>What we do</h2>
                <p>
                    Dashedo is a cloud-based SaaS platform for workflow automation
                    and insights. Companies use us to automate processes, understand
                    their data, and measurably improve outcomes. Learn more under{" "}
                    <a href="/features">Features</a>,{" "}
                    <a href="/solutions">Solutions</a>, and{" "}
                    <a href="/pricing">Pricing</a>.
                </p>

                <h2>Our values</h2>
                <ul>
                    <li>
                        <strong>Customer value first:</strong> Every decision is
                        measured against real customer use cases.
                    </li>
                    <li>
                        <strong>Simplicity:</strong> Fewer clicks, clearer interfaces,
                        better results.
                    </li>
                    <li>
                        <strong>Security &amp; data protection:</strong> GDPR-compliant,
                        EU-based data centers, least-privilege access.
                    </li>
                    <li>
                        <strong>Ownership:</strong> Small, autonomous teams with clear
                        responsibility.
                    </li>
                    <li>
                        <strong>Transparency:</strong> Open communication internally and
                        externally.
                    </li>
                </ul>

                <h2>Numbers &amp; facts</h2>
                <ul>
                    <li>Founded: 2023 in Berlin, Germany</li>
                    <li>Customers in 10+ countries</li>
                    <li>Uptime: 99.9% (last 12 months)</li>
                    <li>Team size: 15+ people (remote-first, European time zones)</li>
                </ul>

                <h2>Team &amp; founding story</h2>
                <p>
                    Dashedo was founded by an experienced product and engineering team
                    with a passion for developer experience and tangible business
                    impact. We combine deep domain expertise with first-class
                    engineering to ship reliable, scalable software.
                </p>

                <h2>Milestones</h2>
                <ul>
                    <li>
                        <strong>2023:</strong> Company founded, first MVP shipped
                    </li>
                    <li>
                        <strong>2024:</strong> Public launch, first enterprise customers
                    </li>
                    <li>
                        <strong>2025:</strong> Major product release and expanded
                        integrations ecosystem
                    </li>
                </ul>

                <p>
                    Want to help shape the future of workflow automation?
                    Check out our <a href="/about/careers">careers</a> page
                    or reach out via our{" "}
                    <a href="/help/contact">contact form</a>. For media inquiries,
                    please visit our <a href="/about/press">press</a> section.
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
    );
}
