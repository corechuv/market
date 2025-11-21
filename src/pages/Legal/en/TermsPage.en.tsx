// src/pages/Legal/en/TermsPage.en.tsx
import "react";
import Page from "../../../components/UI/Page/Page";
import s from "../Legal.module.scss";

export default function TermsPageEn() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Terms & Conditions",
        "url": "https://dashedo.com/legal/terms",
        "dateModified": "2025-11-11"
    };

    return (
        <Page>
            <div className={s.content}>
                <nav aria-label="Breadcrumb">
                    <a href="/">Home</a> &nbsp;/&nbsp; <a href="/legal">Legal</a> &nbsp;/&nbsp; <span>Terms &amp; Conditions</span>
                </nav>

                <h1 className={s.content__title}>Terms &amp; Conditions (GTC)</h1>
                <p><strong>Last updated:</strong> 11.11.2025</p>

                <h2>1. Scope</h2>
                <p>
                    These Terms &amp; Conditions govern the use of the digital services of{" "}
                    <strong>⟨Dashedo GmbH⟩</strong> on <strong>dashedo.com</strong> (“Service”). Any deviating
                    terms shall only apply if we have expressly agreed to them.
                </p>

                <h2>2. Contracting parties &amp; conclusion of contract</h2>
                <p>
                    The contracting party is ⟨Dashedo GmbH⟩, ⟨Musterstraße 1⟩, 10115 Berlin. The contract is concluded
                    by registering, ordering a plan, or via written confirmation.
                </p>

                <h2>3. Description of services</h2>
                <p>
                    We provide a cloud-based software service (SaaS). Availability, scope of features and any usage
                    limits are set out in the respective plan description on{" "}
                    <a href="/pricing">/pricing</a>.
                </p>

                <h2>4. User account</h2>
                <p>
                    Use of the Service requires an account. Login credentials must be kept confidential. Activities
                    carried out via the account are deemed to have been initiated by the account holder.
                </p>

                <h2>5. Prices &amp; payment</h2>
                <p>
                    The prices applicable at the time of ordering, plus statutory VAT, shall apply. Billing is carried
                    out ⟨monthly/annually⟩ via ⟨payment service provider⟩. In case of payment default, we are entitled
                    to temporarily suspend access to the Service.
                </p>

                <h2>6. Term &amp; termination</h2>
                <p>
                    Contracts run ⟨for an indefinite term / for the selected billing period⟩ and are automatically
                    renewed unless they are properly terminated at the end of the respective period. Termination can be
                    made via the account area or in text form.
                </p>

                <h2>7. Usage rights &amp; intellectual property</h2>
                <p>
                    We grant a simple, non-transferable right to use the Service for the duration of the contract. All
                    intellectual property rights remain with us.
                </p>

                <h2>8. Availability &amp; support</h2>
                <p>
                    We strive to ensure high availability of the Service. Maintenance windows are announced in advance
                    where reasonably possible. Support is provided as described under{" "}
                    <a href="/help">/help</a>.
                </p>

                <h2>9. Prohibited uses</h2>
                <p>
                    Prohibited uses include, among others, unlawful content, impairing system security, reverse
                    engineering, circumventing technical protection measures, and overload/denial-of-service attacks.
                </p>

                <h2>10. Liability</h2>
                <p>
                    We are liable without limitation in cases of intent and gross negligence, as well as for injury to
                    life, body, or health. In cases of slight negligence, we are only liable for breaches of essential
                    contractual obligations (“cardinal duties”), and such liability is limited to the typically
                    foreseeable damage.
                </p>

                <h2>11. Warranty</h2>
                <p>
                    Statutory warranty law applies. For services provided free of charge, liability is limited to intent
                    and gross negligence.
                </p>

                <h2>12. Data protection</h2>
                <p>
                    Information on the processing of personal data can be found in our{" "}
                    <a href="/legal/privacy">privacy policy</a>. Where required, we conclude data processing
                    agreements pursuant to Art. 28 GDPR.
                </p>

                <h2>13. Confidentiality</h2>
                <p>
                    The parties shall treat confidential information as strictly confidential and use it solely for the
                    purpose of fulfilling the contract.
                </p>

                <h2>14. Changes to these Terms &amp; Conditions</h2>
                <p>
                    We may amend these Terms &amp; Conditions with effect for the future. We will inform you in good
                    time of any material changes. If you do not object within ⟨6 weeks⟩, the changes shall be deemed
                    accepted (this will be pointed out in the change notification).
                </p>

                <h2>15. Consumer information / right of withdrawal</h2>
                <p>
                    If the customer is a consumer, the statutory right of withdrawal applies. For digital content, this
                    right may expire if performance has begun before the end of the withdrawal period and the consumer
                    has expressly agreed to this.
                </p>

                {/*
                <h3>Sample withdrawal form</h3>
                <pre>
I/we hereby withdraw from the contract concluded by me/us for the provision of the following service:
Ordered on: ⟨date⟩ / received on: ⟨date⟩
Name of consumer(s): ⟨…⟩
Address of consumer(s): ⟨…⟩
Signature (only if submitted on paper) — Date
                </pre>
                */}

                <h2>16. Final provisions</h2>
                <p>
                    German law applies, to the exclusion of the UN Convention on Contracts for the International Sale of
                    Goods (CISG). The place of jurisdiction is – where permissible – ⟨Berlin⟩. The contract language is
                    German.
                </p>

                <p>
                    Further information: <a href="/legal/imprint">Imprint</a>,{" "}
                    <a href="/legal/privacy">Privacy policy</a>,{" "}
                    <a href="/legal/cookies">Cookie policy</a>.
                </p>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </div>
        </Page>
    );
}
