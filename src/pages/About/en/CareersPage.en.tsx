// src/pages/About/en/CareersPage.en.tsx
import "react"
import { Helmet } from "react-helmet-async"
import Page from "../../../components/UI/Page/Page"
import s from "../About.module.scss"

export default function CareersPageEn() {
    const pageJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Careers",
        "url": "https://dashedo.com/about/careers",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dashedo.com/" },
                { "@type": "ListItem", "position": 2, "name": "About us", "item": "https://dashedo.com/about" },
                { "@type": "ListItem", "position": 3, "name": "Careers", "item": "https://dashedo.com/about/careers" }
            ]
        }
    };

    // Example job postings for SEO (JSON-LD):
    const jobsJsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": "Frontend Engineer (m/f/d)",
            "datePosted": "2025-11-11",
            "employmentType": "FULL_TIME",
            "hiringOrganization": {
                "@type": "Organization",
                "name": "Dashedo GmbH",
                "sameAs": "https://dashedo.com/"
            },
            "industry": "Software",
            "jobLocationType": "TELECOMMUTE",
            "applicantLocationRequirements": { "@type": "Country", "name": "Germany" },
            "jobLocation": {
                "@type": "Place",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Berlin",
                    "addressCountry": "DE"
                }
            },
            "description": "Build modern interfaces for Dashedo. Tech stack: ⟨React/TypeScript/Tailwind⟩.",
            "responsibilities": "UI development, performance, tests, code reviews.",
            "qualifications": "3+ years of experience, strong knowledge of React/TypeScript.",
            "incentiveCompensation": "⟨vs.⟩",
            "baseSalary": {
                "@type": "MonetaryAmount",
                "currency": "EUR",
                "value": {
                    "@type": "QuantitativeValue",
                    "value": "⟨xx⟩",
                    "unitText": "YEAR"
                }
            },
            "applicantLocationRequirementsDescription": "Remote within DE / EU time zones."
        },
        {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": "Account Executive DACH (m/f/d)",
            "datePosted": "2025-11-11",
            "employmentType": "FULL_TIME",
            "hiringOrganization": {
                "@type": "Organization",
                "name": "Dashedo GmbH"
            },
            "industry": "Software",
            "jobLocation": {
                "@type": "Place",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Berlin",
                    "addressCountry": "DE"
                }
            },
            "description": "Scale our growth in the DACH market. Focus: mid-market / enterprise.",
            "qualifications": "2–4 years of SaaS sales experience, fluent in German and English.",
            "baseSalary": {
                "@type": "MonetaryAmount",
                "currency": "EUR",
                "value": {
                    "@type": "QuantitativeValue",
                    "value": "⟨xx⟩",
                    "unitText": "YEAR"
                }
            }
        }
    ];

    return (
        <>
            <Helmet>
                <title>Careers at Dashedo</title>
                <meta
                    name="description"
                    content="Join Dashedo: open roles, how we work, our hiring process and benefits for our remote-first team in Europe."
                />
                <link rel="canonical" href="https://dashedo.com/about/careers" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Careers at Dashedo" />
                <meta
                    property="og:description"
                    content="Explore open roles at Dashedo and learn how we work as a product-led, remote-first team."
                />
                <meta property="og:url" content="https://dashedo.com/about/careers" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="Careers at Dashedo" />
                <meta
                    name="twitter:description"
                    content="Open positions, hiring process and benefits at Dashedo."
                />
            </Helmet>
            <Page>
                <div className={s.content}>
                    <nav aria-label="Breadcrumb">
                        <a href="/">Home</a> &nbsp;/&nbsp; <a href="/about">About us</a> &nbsp;/&nbsp; <span>Careers</span>
                    </nav>

                    <h1 className={s.content__title}>Careers at Dashedo</h1>
                    <p><strong>Last updated:</strong> 11.11.2025</p>

                    <h2>Why Dashedo?</h2>
                    <p>
                        We are a product-driven team building software that solves real problems every day.
                        With us, you get ownership, clear goals, and an environment where <em>impact</em> matters.
                    </p>

                    <h2>What we offer</h2>
                    <ul>
                        <li>Remote-first (EU time zones) &amp; flexible working</li>
                        <li>Top equipment &amp; personal learning budget ⟨x €/year⟩</li>
                        <li>🔒 Focus on quality: code reviews, tests, CI/CD</li>
                        <li>30 days of vacation &amp; ⟨benefits, e.g. public transport, sports⟩</li>
                        <li>Transparent career paths and fair compensation</li>
                    </ul>

                    <h2>How we work</h2>
                    <ul>
                        <li>Small, autonomous squads with clear metrics</li>
                        <li>Async communication, weekly demos, quarterly roadmaps</li>
                        <li>Close to our users: interviews, beta programs, feature flags</li>
                    </ul>

                    <h2 id="open-roles">Open roles</h2>
                    <article>
                        <h3>Frontend Engineer (m/f/d) – Berlin/Remote</h3>
                        <p>Tech stack: ⟨React, TypeScript, Node, Cloud⟩ · Full-time</p>
                        <p><a href="#bewerbung">Apply now</a></p>
                    </article>
                    <article>
                        <h3>Account Executive DACH (m/f/d) – Berlin/Remote</h3>
                        <p>Mid-market / Enterprise · Full-time</p>
                        <p><a href="#bewerbung">Apply now</a></p>
                    </article>
                    <p>
                        No suitable role? Send a <strong>speculative application</strong> to{" "}
                        <a href="mailto:jobs@dashedo.com">jobs@dashedo.com</a>.
                    </p>

                    <h2 id="prozess">Hiring process</h2>
                    <ol>
                        <li><strong>Intro call</strong> (30 min) – get to know each other</li>
                        <li><strong>Technical interview</strong> – deep dive into your experience &amp; way of working</li>
                        <li><strong>Practical task</strong> – realistic and time-boxed</li>
                        <li><strong>Team interview</strong> – culture &amp; collaboration</li>
                        <li><strong>Offer</strong> – transparent &amp; fast</li>
                    </ol>

                    <h2 id="bewerbung">How to apply</h2>
                    <p>
                        Send your CV/profile (LinkedIn/GitHub) to{" "}
                        <a href="mailto:jobs@dashedo.com">jobs@dashedo.com</a> and
                        include the role you are applying for, your earliest start date, and salary expectations.
                    </p>

                    <h2>Diversity &amp; inclusion</h2>
                    <p>
                        We welcome applications regardless of background, gender, identity, religion,
                        disability, or age. What matters to us is curiosity, ownership, and team spirit.
                    </p>

                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
                    />
                    {jobsJsonLd.map((j, i) => (
                        <script
                            key={i}
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }}
                        />
                    ))}
                </div>
            </Page>
        </>
    );
}
