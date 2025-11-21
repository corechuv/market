// src/pages/Legal/en/CookiePolicyPage.en.tsx
import "react";
import Page from "../../../components/UI/Page/Page";
import s from "../Legal.module.scss";
import Button from "../../../components/UI/Button";

export default function CookiePolicyPageEn() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Cookie policy",
        "url": "https://dashedo.com/legal/cookies",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dashedo.com/" },
                { "@type": "ListItem", "position": 2, "name": "Legal", "item": "https://dashedo.com/legal" },
                { "@type": "ListItem", "position": 3, "name": "Cookie policy", "item": "https://dashedo.com/legal/cookies" }
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
            alert("Please use the cookie banner at the bottom of this page to change your settings.");
        }
    };

    return (
        <Page>
            <div className={s.content}>
                <nav aria-label="Breadcrumb">
                    <a href="/">Home</a> &nbsp;/&nbsp; <a href="/legal">Legal</a> &nbsp;/&nbsp; <span>Cookie policy</span>
                </nav>

                <h1>Cookie policy</h1>
                <p><strong>Last updated:</strong> 11.11.2025</p>

                <p>
                    This cookie policy explains how <strong>⟨company, e.g. Dashedo GmbH⟩</strong> (“we”)
                    uses cookies and similar technologies on <strong>dashedo.com</strong>. We inform you about
                    the types, purposes, storage periods, and legal bases pursuant to Art.&nbsp;6 GDPR as well as
                    your rights to object and withdraw consent.
                </p>

                <h2>1. What are cookies?</h2>
                <p>
                    Cookies are small text files that are stored on your device via your browser.
                    Similar technologies include, for example, local storage, session storage, pixels, and tags.
                    Some cookies are technically necessary, others are used for statistics, convenience, or marketing.
                </p>

                <h2>2. Legal bases</h2>
                <ul>
                    <li>
                        <strong>Essential (Art. 6(1)(f) GDPR):</strong> required to provide our website
                        (e.g. session handling, security, storing consent).
                    </li>
                    <li>
                        <strong>Statistics/marketing (Art. 6(1)(a) GDPR):</strong> used only with your consent
                        via our consent banner.
                    </li>
                </ul>

                <h2>3. Cookie categories</h2>
                <ul>
                    <li><strong>Necessary:</strong> core functions, security, load balancing, fraud prevention.</li>
                    <li><strong>Preferences:</strong> language, layout, settings.</li>
                    <li><strong>Statistics:</strong> anonymous/aggregated usage measurement (e.g. page views).</li>
                    <li><strong>Marketing:</strong> reach measurement, retargeting, conversion tracking.</li>
                    <li><strong>External media:</strong> embedded content (e.g. maps, videos).</li>
                </ul>

                <h2>4. Managing your consent</h2>
                <p>You can adjust or withdraw your consent at any time with effect for the future:</p>
                <p>
                    <Button onClick={openCookieSettings}>Open cookie settings</Button>
                </p>
                <p>Alternatively, you can change your browser settings for cookies or delete cookies manually.</p>

                <h2>5. Storage periods</h2>
                <p>
                    Session cookies are deleted after the session ends. Persistent cookies remain stored until the
                    expiry date shown in our consent tool or until you remove them manually.
                    You can find the specific lifetime for each cookie in the list within the consent banner.
                </p>

                <h2>6. Services used (examples)</h2>
                <ul>
                    <li>
                        <strong>Web analytics:</strong> ⟨e.g. Google Analytics / Matomo⟩ – statistics, performance.
                        Provider: ⟨name, registered office⟩.
                    </li>
                    <li>
                        <strong>Marketing:</strong> ⟨e.g. Meta Pixel, LinkedIn Insight Tag⟩ – conversion tracking.
                    </li>
                    <li>
                        <strong>CDN/performance:</strong> ⟨e.g. Cloudflare⟩ – security and content delivery.
                    </li>
                    <li>
                        <strong>Video/maps:</strong> ⟨e.g. YouTube, Vimeo, Google Maps⟩ – embedded content.
                    </li>
                </ul>
                <p>
                    <em>Note:</em> The current, binding list of providers, including third-country transfers, safeguards,
                    and storage periods, is always available in the consent banner.
                </p>

                <h2>7. Data transfers to third countries</h2>
                <p>
                    Where providers outside the EU/EEA are used, data is transferred on the basis of appropriate
                    safeguards (Art.&nbsp;46 GDPR), such as EU standard contractual clauses. For details, please see
                    the provider list in the consent tool.
                </p>

                <h2>8. Your rights</h2>
                <p>
                    You have, among others, the right of access, rectification, erasure, restriction of processing,
                    data portability, and the right to object (Art.&nbsp;15–21 GDPR). You can lodge a complaint with
                    a data protection supervisory authority.
                </p>

                <p>
                    Further information: <a href="/legal/privacy">Privacy policy</a>,{" "}
                    <a href="/legal/imprint">Imprint</a>.
                </p>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </div>
        </Page>
    );
}
