// src/pages/Legal/en/PrivacyPolicyPage.en.tsx
import "react";
import Page from "../../../components/UI/Page/Page";
import s from "../Legal.module.scss";

export default function PrivacyPolicyPageEn() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Privacy policy",
        "url": "https://dashedo.com/legal/privacy",
        "dateModified": "2025-11-11"
    };

    return (
        <Page>
            <div className={s.content}>
                <nav aria-label="Breadcrumb">
                    <a href="/">Home</a> &nbsp;/&nbsp; <a href="/legal">Legal</a> &nbsp;/&nbsp; <span>Privacy policy</span>
                </nav>

                <h1 className={s.content__title}>Privacy policy</h1>
                <p><strong>Last updated:</strong> 11.11.2025</p>

                <h2>1. Controller</h2>
                <p>
                    <strong>⟨Dashedo GmbH⟩</strong><br />
                    ⟨Musterstraße 1⟩, 10115 Berlin, Germany<br />
                    Email: <a href="mailto:⟨hello@dashedo.com⟩">⟨hello@dashedo.com⟩</a><br />
                    Phone: +49 ⟨30⟩ ⟨1234567⟩
                </p>
                <p><em>Data protection officer (if applicable):</em> ⟨name, contact details⟩</p>

                <h2>2. Purposes, legal bases, storage periods</h2>
                <ul>
                    <li>
                        <strong>Provision of the website / server logs</strong> (Art. 6(1)(f) GDPR):
                        IP address (truncated), timestamp, user agent, referrer; usually deleted after ⟨30⟩ days.
                    </li>
                    <li>
                        <strong>Contact requests</strong> (Art. 6(1)(b) or (f) GDPR):
                        processing your request; deletion after completion or in line with statutory obligations.
                    </li>
                    <li>
                        <strong>Customer account / registration</strong> (Art. 6(1)(b) GDPR):
                        administration of your account; stored until cancellation and/or expiry of legal retention periods.
                    </li>
                    <li>
                        <strong>Contract performance &amp; billing</strong> (Art. 6(1)(b), (c) GDPR):
                        service provision, payment, accounting; retention in accordance with commercial and tax law (e.g. HGB/AO).
                    </li>
                    <li>
                        <strong>Newsletter</strong> (Art. 6(1)(a) GDPR):
                        only with your consent (double opt-in); you can withdraw consent at any time.
                    </li>
                    <li>
                        <strong>Analytics &amp; marketing</strong> (Art. 6(1)(a) GDPR):
                        see our <a href="/legal/cookies">cookie policy</a>.
                    </li>
                </ul>

                <h2>3. Mandatory data / minors</h2>
                <p>
                    Providing certain data may be necessary to conclude a contract or to handle support requests.
                    Our services are not directed at children under the age of 16.
                </p>

                <h2>4. Recipients of the data</h2>
                <p>
                    We use processors in accordance with Art. 28 GDPR (e.g. hosting, email, support tools, analytics).
                    Data processing agreements are in place with all service providers.
                </p>

                <h2>5. Transfers to third countries</h2>
                <p>
                    Where data is processed in third countries (outside the EU/EEA), we ensure appropriate safeguards
                    (Art. 46 GDPR, e.g. EU standard contractual clauses) and assess the level of data protection.
                    Details can be found in the provider list within our consent banner.
                </p>

                <h2>6. Storage periods</h2>
                <p>
                    We process personal data only for as long as necessary for the respective purposes or as long as
                    legal retention obligations apply.
                </p>

                <h2>7. Your rights</h2>
                <ul>
                    <li>Right of access (Art. 15), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18)</li>
                    <li>Right to data portability (Art. 20)</li>
                    <li>Right to object to processing based on legitimate interests (Art. 21)</li>
                    <li>
                        Right to withdraw consent (Art. 7(3)) with effect for the future
                    </li>
                    <li>Right to lodge a complaint with a supervisory authority (Art. 77)</li>
                </ul>

                <h2>8. Security</h2>
                <p>
                    We implement appropriate technical and organisational measures (e.g. TLS encryption, access controls,
                    data minimisation) to protect your data.
                </p>

                <h2>9. Cookies &amp; similar technologies</h2>
                <p>
                    Details on the cookies we use, legal bases, storage periods, and options to withdraw consent can be
                    found in our <a href="/legal/cookies">cookie policy</a>.
                </p>

                <h2>10. Newsletter</h2>
                <p>
                    Newsletters are sent only after double opt-in. We log your registration and confirmation.
                    You can unsubscribe at any time via the link included in every email.
                </p>

                <h2>11. Payment processing (if applicable)</h2>
                <p>
                    For payments, payment data may be transmitted to payment service providers (e.g. ⟨Stripe/Adyen⟩).
                    The legal basis is Art. 6(1)(b) and, where applicable, Art. 6(1)(f) GDPR.
                </p>

                <h2>12. Applications (if applicable)</h2>
                <p>
                    Application data is processed for the purpose of deciding on the establishment of an employment
                    relationship (§ 26 BDSG). Data is usually deleted after ⟨6⟩ months.
                </p>

                <h2>13. Changes to this policy</h2>
                <p>
                    We may update this privacy policy from time to time. The current version is always available on this page.
                </p>

                <p>
                    Further information: <a href="/legal/imprint">Imprint</a>,{" "}
                    <a href="/legal/terms">Terms &amp; Conditions</a>.
                </p>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </div>
        </Page>
    );
}
