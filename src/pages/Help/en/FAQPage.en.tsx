// src/pages/Help/en/FAQPage.en.tsx
import "react";
import Page from "../../../components/UI/Page/Page";
import s from "../Help.module.scss";
import Logo from "../../../components/Footer/Logo";

export default function FAQPageEn() {
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is Dashedo and who is it for?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Dashedo is a cloud-based software service (SaaS) for ⟨short description of your product⟩. It is suitable for ⟨target audiences⟩."
                }
            },
            {
                "@type": "Question",
                "name": "Is there a free trial?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, you can try Dashedo with no obligation. Details about duration and included features can be found on the Pricing page."
                }
            },
            {
                "@type": "Question",
                "name": "How can I change or cancel my plan?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You can change or cancel your plan at any time in the account area. Changes apply from the next billing period in accordance with our Terms & Conditions."
                }
            },
            {
                "@type": "Question",
                "name": "Which payment methods are supported?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We support common payment methods via ⟨Stripe/Adyen⟩. Invoices are available for download in your account."
                }
            },
            {
                "@type": "Question",
                "name": "How is my data kept secure?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We use TLS encryption, role-based access control, and regular backups. You can find more details in our privacy policy."
                }
            },
            {
                "@type": "Question",
                "name": "Do you offer integrations with other tools?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, there are integrations with ⟨example tools⟩. You can find an up-to-date list on the Features page."
                }
            },
            {
                "@type": "Question",
                "name": "How quickly will I get access after ordering?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Access is usually granted immediately. If you do not receive an activation email, please check your spam folder or contact support."
                }
            },
            {
                "@type": "Question",
                "name": "How can I request a refund?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Information about cancellations and refunds can be found under Returns & Refunds. If you have questions, please contact support."
                }
            }
        ]
    };

    return (
        <Page>
            <div className={s.content}>
                <Logo />

                <nav aria-label="Breadcrumb">
                    <a href="/">Home</a> &nbsp;/&nbsp; <a href="/help">Help &amp; Support</a> &nbsp;/&nbsp; <span>FAQ</span>
                </nav>

                <h1 className={s.content__title}>FAQ – Frequently asked questions</h1>
                <p><strong>Last updated:</strong> 11.11.2025</p>

                <p>
                    Here you’ll find answers to common questions about Dashedo. Didn’t find what you were looking for?{" "}
                    <a href="/help/contact">Get in touch with us</a>.
                </p>

                <details>
                    <summary><strong>What is Dashedo and who is it for?</strong></summary>
                    <p>
                        Dashedo is a cloud-based software service (SaaS) for ⟨short product description⟩.
                        Ideal for ⟨target audiences⟩.
                    </p>
                </details>

                <details>
                    <summary><strong>Is there a free trial?</strong></summary>
                    <p>
                        Yes – details about scope and duration are available on the{" "}
                        <a href="/pricing">Pricing</a> page. You can cancel at any time before the trial ends.
                    </p>
                </details>

                <details>
                    <summary><strong>How can I change or cancel my plan?</strong></summary>
                    <p>
                        You can adjust your plan flexibly in your account area. The conditions in our{" "}
                        <a href="/legal/terms">Terms &amp; Conditions</a> apply.
                    </p>
                </details>

                <details>
                    <summary><strong>Which payment methods are supported?</strong></summary>
                    <p>
                        We accept payments via ⟨Stripe/Adyen⟩ (e.g. credit card, SEPA). Invoices are available in your account.
                    </p>
                </details>

                <details>
                    <summary><strong>How secure is my data?</strong></summary>
                    <p>
                        Encryption, access controls, backups, and monitoring are standard. For details, see our{" "}
                        <a href="/legal/privacy">privacy policy</a>.
                    </p>
                </details>

                <details>
                    <summary><strong>Are there integrations?</strong></summary>
                    <p>
                        Yes, including with ⟨example tools⟩. Learn more under{" "}
                        <a href="/features">Features</a>.
                    </p>
                </details>

                <details>
                    <summary><strong>How do I get access after ordering?</strong></summary>
                    <p>
                        Typically you get access immediately via activation email. Please also check your spam folder.
                        Help: <a href="/help/shipping">Provision &amp; delivery</a>.
                    </p>
                </details>

                <details>
                    <summary><strong>How do I request a refund?</strong></summary>
                    <p>
                        Conditions and requirements are described under{" "}
                        <a href="/help/returns-refunds">Returns &amp; refunds</a>.
                    </p>
                </details>

                <p>
                    More topics: <a href="/help/contact">Contact</a> ·{" "}
                    <a href="/legal/terms">Terms &amp; Conditions</a> ·{" "}
                    <a href="/legal/privacy">Privacy</a>
                </p>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
                />
            </div>
        </Page>
    );
}
