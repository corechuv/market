// src/pages/About/ru/CareersPage.ru.tsx
import "react"
import Page from "../../../components/UI/Page/Page"
import s from "../About.module.scss"
import Logo from "../../../components/Footer/Logo";

export default function CareersPageRu() {
    const pageJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Karriere",
        "url": "https://dashedo.com/about/careers",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Startseite", "item": "https://dashedo.com/" },
                { "@type": "ListItem", "position": 2, "name": "Über uns", "item": "https://dashedo.com/about" },
                { "@type": "ListItem", "position": 3, "name": "Karriere", "item": "https://dashedo.com/about/careers" }
            ]
        }
    };

    // Beispielhafte Job-Postings für SEO (JSON-LD):
    const jobsJsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": "Frontend Engineer (m/w/d)",
            "datePosted": "2025-11-11",
            "employmentType": "FULL_TIME",
            "hiringOrganization": {
                "@type": "Organization",
                "name": "⟨Dashedo GmbH⟩",
                "sameAs": "https://dashedo.com/"
            },
            "industry": "Software",
            "jobLocationType": "TELECOMMUTE",
            "applicantLocationRequirements": { "@type": "Country", "name": "Deutschland" },
            "jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": "Berlin", "addressCountry": "DE" } },
            "description": "Baue moderne Interfaces für Dashedo. Tech: ⟨React/TypeScript/Tailwind⟩.",
            "responsibilities": "UI-Entwicklung, Performance, Tests, Code-Reviews.",
            "qualifications": "3+ Jahre Erfahrung, sehr gute Kenntnisse in React/TS.",
            "incentiveCompensation": "⟨vs.⟩",
            "baseSalary": { "@type": "MonetaryAmount", "currency": "EUR", "value": { "@type": "QuantitativeValue", "value": "⟨xx⟩", "unitText": "YEAR" } },
            "applicantLocationRequirementsDescription": "Remote in DE/EU-Zeitzonen."
        },
        {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": "Account Executive DACH (m/w/d)",
            "datePosted": "2025-11-11",
            "employmentType": "FULL_TIME",
            "hiringOrganization": { "@type": "Organization", "name": "⟨Dashedo GmbH⟩" },
            "industry": "Software",
            "jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": "Berlin", "addressCountry": "DE" } },
            "description": "Skaliere unser Wachstum im DACH-Markt. Fokus: Mid-Market/Enterprise.",
            "qualifications": "2–4 Jahre SaaS-Sales, Deutsch/Englisch fließend.",
            "baseSalary": { "@type": "MonetaryAmount", "currency": "EUR", "value": { "@type": "QuantitativeValue", "value": "⟨xx⟩", "unitText": "YEAR" } }
        }
    ];

    return (
        <Page>
            <div className={s.content}>
                
                <Logo />

                <nav aria-label="Brotkrumen">
                    <a href="/">Startseite</a> &nbsp;/&nbsp; <a href="/about">Über uns</a> &nbsp;/&nbsp; <span>Karriere</span>
                </nav>

                <h1 className={s.content__title}>Karriere bei Dashedo</h1>
                <p><strong>Zuletzt aktualisiert:</strong> 11.11.2025</p>

                <h2>Warum Dashedo?</h2>
                <p>
                    Wir sind ein produktgetriebenes Team und bauen Software, die täglich echte Probleme löst.
                    Bei uns bekommst du Ownership, klare Ziele und ein Umfeld, in dem <em>Impact</em> zählt.
                </p>

                <h2>Was wir bieten</h2>
                <ul>
                    <li>Remote-first (EU-Zeitzonen) &amp; flexibles Arbeiten</li>
                    <li>Top-Equipment &amp; persönliches Lernbudget ⟨x €/Jahr⟩</li>
                    <li>🔒 Fokus auf Qualität: Code-Reviews, Tests, CI/CD</li>
                    <li>30 Tage Urlaub &amp; ⟨Benefits, z.&nbsp;B. BVG-Ticket, Sport⟩</li>
                    <li>Transparente Karrierepfade und faire Gehälter</li>
                </ul>

                <h2>Wie wir arbeiten</h2>
                <ul>
                    <li>Kleine, autonome Squads mit klaren Metriken</li>
                    <li>Async-Kommunikation, wöchentliche Demos, Quartals-Roadmaps</li>
                    <li>Kundennähe: User-Interviews, Beta-Programme, Feature-Flags</li>
                </ul>

                <h2 id="open-roles">Offene Stellen</h2>
                <article>
                    <h3>Frontend Engineer (m/w/d) – Berlin/Remote</h3>
                    <p>Tech-Stack: ⟨React, TypeScript, Node, Cloud⟩ · Vollzeit</p>
                    <p><a href="#bewerbung">Jetzt bewerben</a></p>
                </article>
                <article>
                    <h3>Account Executive DACH (m/w/d) – Berlin/Remote</h3>
                    <p>Mid-Market/Enterprise · Vollzeit</p>
                    <p><a href="#bewerbung">Jetzt bewerben</a></p>
                </article>
                <p>Keine passende Rolle? <strong>Initiativbewerbung</strong> an <a href="mailto:jobs@dashedo.com">jobs@dashedo.com</a>.</p>

                <h2 id="prozess">Bewerbungsprozess</h2>
                <ol>
                    <li><strong>Intro-Call</strong> (30 Min.) – gegenseitiges Kennenlernen</li>
                    <li><strong>Fachgespräch</strong> – Deep-Dive in Erfahrung &amp; Arbeitsweise</li>
                    <li><strong>Praktische Aufgabe</strong> – realitätsnah, zeitlich begrenzt</li>
                    <li><strong>Team-Interview</strong> – Kultur &amp; Zusammenarbeit</li>
                    <li><strong>Angebot</strong> – transparent &amp; schnell</li>
                </ol>

                <h2 id="bewerbung">So bewirbst du dich</h2>
                <p>
                    Sende CV/Profil (LinkedIn/GitHub) an <a href="mailto:jobs@dashedo.com">jobs@dashedo.com</a> und
                    nenne die gewünschte Rolle, Startdatum und Gehaltsrahmen.
                </p>

                <h2>Vielfalt &amp; Inklusion</h2>
                <p>
                    Wir begrüßen Bewerbungen unabhängig von Herkunft, Geschlecht, Identität, Religion, Behinderung
                    oder Alter. Wichtig sind Neugier, Ownership und Teamgeist.
                </p>

                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
                {jobsJsonLd.map((j, i) => (
                    <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />
                ))}
            </div>
        </Page>
    );
}
