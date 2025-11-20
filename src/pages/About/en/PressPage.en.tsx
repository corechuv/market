// src/pages/About/en/PressPage.en.tsx
import "react";
import Page from "../../../components/UI/Page/Page";
import s from "../About.module.scss";
import Logo from "../../../components/Footer/Logo";

export default function PressPageEn() {
    const orgJsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "⟨Dashedo GmbH⟩",
        "url": "https://dashedo.com/",
        "logo": "https://dashedo.com/⟨pfad-zum-logo⟩.png",
        "contactPoint": [
            {
                "@type": "ContactPoint",
                "contactType": "media relations",
                "email": "press@dashedo.com",
                "telephone": "+49 ⟨30⟩ ⟨1234567⟩",
                "areaServed": "DE, AT, CH, EU",
                "availableLanguage": ["de", "en"]
            }
        ]
    };

    const pageJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Press",
        "url": "https://dashedo.com/about/press",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dashedo.com/" },
                { "@type": "ListItem", "position": 2, "name": "About us", "item": "https://dashedo.com/about" },
                { "@type": "ListItem", "position": 3, "name": "Press", "item": "https://dashedo.com/about/press" }
            ]
        }
    };

    return (
        <Page>
            <div className={s.content}>
                <Logo />

                <nav aria-label="Breadcrumb">
                    <a href="/">Home</a> &nbsp;/&nbsp; <a href="/about">About us</a> &nbsp;/&nbsp; <span>Press</span>
                </nav>

                <h1 className={s.content__title}>Press</h1>
                <p><strong>Last updated:</strong> 11.11.2025</p>

                <h2>Company overview</h2>
                <p>
                    ⟨Dashedo⟩ is a ⟨German⟩ SaaS platform for ⟨one-line value proposition/product⟩.
                    Companies use Dashedo to achieve ⟨key outcomes⟩ faster and in a measurable way.
                </p>

                <h2>Key figures at a glance</h2>
                <ul>
                    <li>Founded: ⟨year⟩ · HQ: Berlin</li>
                    <li>Customers: ⟨X⟩+ companies in ⟨Y⟩ countries</li>
                    <li>Funding/status: ⟨bootstrapped/funded⟩</li>
                </ul>

                <h2>Press contact</h2>
                <p>
                    <strong>Media Relations</strong><br />
                    Email: <a href="mailto:press@dashedo.com">press@dashedo.com</a><br />
                    Phone: +49 ⟨30⟩ ⟨1234567⟩
                </p>

                <h2>Press materials</h2>
                <ul>
                    <li>
                        <a href="/assets/presskit.zip">Press kit (ZIP)</a> – logos, screenshots, product images
                    </li>
                    <li>
                        <a href="/assets/brand-guidelines.pdf">Brand guidelines (PDF)</a>
                    </li>
                    <li>
                        <a href="https://dashedo.com/⟨pressebilder-galerie⟩">Press image gallery</a>
                    </li>
                </ul>

                <h2>Boilerplate</h2>
                <p>
                    <em>About Dashedo:</em> Dashedo is a cloud-based platform for ⟨value proposition⟩.
                    Based in Berlin, the company helps teams achieve ⟨primary benefit⟩ – securely, at scale
                    and in full GDPR compliance. Learn more at{" "}
                    <a href="https://dashedo.com/">dashedo.com</a>.
                </p>

                <h2>Selected mentions</h2>
                <ul>
                    <li>⟨Outlet/publication⟩ – “⟨quote/headline⟩” (⟨date⟩)</li>
                    <li>⟨Outlet/publication⟩ – “⟨quote/headline⟩” (⟨date⟩)</li>
                    <li>Own newsroom update: <a href="/blog">Blog</a></li>
                </ul>

                <h2>Guidelines for using brand &amp; logos</h2>
                <ul>
                    <li>Please only use the files provided in the press kit.</li>
                    <li>Respect minimum sizes and clear space (see brand guidelines).</li>
                    <li>Do not alter colors, shapes, or proportions.</li>
                </ul>

                <p>
                    More information:{" "}
                    <a href="/features">Features</a> ·{" "}
                    <a href="/solutions">Solutions</a> ·{" "}
                    <a href="/help/contact">Contact</a>
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
