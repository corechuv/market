// src/pages/Help/en/ReturnsRefundsPage.en.tsx
import "react";
import Page from "../../../components/UI/Page/Page";
import s from "../Help.module.scss";
import Logo from "../../../components/Footer/Logo";

export default function ReturnsRefundsPageEn() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Returns & Refunds",
        "url": "https://dashedo.com/help/returns-refunds",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dashedo.com/" },
                { "@type": "ListItem", "position": 2, "name": "Help & Support", "item": "https://dashedo.com/help" },
                { "@type": "ListItem", "position": 3, "name": "Returns & Refunds", "item": "https://dashedo.com/help/returns-refunds" }
            ]
        }
    };

    return (
        <Page>
            <div className={s.content}>
                <Logo />

                <nav aria-label="Breadcrumb">
                    <a href="/">Home</a> &nbsp;/&nbsp; <a href="/help">Help &amp; Support</a> &nbsp;/&nbsp; <span>Returns &amp; Refunds</span>
                </nav>

                <h1 className={s.content__title}>Returns &amp; Refunds</h1>
                <p><strong>Last updated:</strong> 11.11.2025</p>

                <h2>Right of withdrawal for consumers (EU)</h2>
                <p>
                    Consumers have the right to withdraw from contracts for digital services within 14&nbsp;days
                    without giving any reason. The period begins on the day the contract is concluded. For more
                    information, please refer to our <a href="/legal/terms">Terms &amp; Conditions</a>.
                </p>
                <p>
                    <em>Note on digital content/services:</em> If you ask us to start providing the service before
                    the end of the withdrawal period and you expressly confirm this, your right of withdrawal may
                    expire as soon as the service has been fully provided.
                </p>

                <h2>How to request a refund</h2>
                <ol>
                    <li>Send an email to <a href="mailto:support@dashedo.com">support@dashedo.com</a> with the subject “Refund”.</li>
                    <li>Include your <strong>invoice number</strong>, your <strong>account email</strong>, and a short explanation.</li>
                    <li>
                        Our team will review your request in line with our{" "}
                        <a href="/legal/terms">Terms &amp; Conditions</a> and confirm the decision by email.
                    </li>
                </ol>

                <h2>Timeframes and payment method</h2>
                <p>
                    Approved refunds are usually issued within 5–10 business days to the original payment method.
                    Bank processing times may vary.
                </p>

                <h2>Exceptions &amp; limitations</h2>
                <ul>
                    <li>
                        For <strong>B2B contracts</strong>, different conditions may apply as set out in the offer
                        and/or Terms &amp; Conditions.
                    </li>
                    <li>
                        In cases of <strong>abuse</strong> or <strong>breach of the Terms &amp; Conditions</strong>,
                        a refund may be excluded.
                    </li>
                    <li>
                        For <strong>discounts / special promotions</strong>, the conditions stated in the respective
                        promotion apply.
                    </li>
                </ul>

                <p>
                    Need help? <a href="/help/contact">Contact us</a>. More information:{" "}
                    <a href="/legal/privacy">Privacy</a>.
                </p>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </div>
        </Page>
    );
}
