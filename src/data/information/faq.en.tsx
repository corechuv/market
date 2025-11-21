// src/data/information/faq.en.tsx
import type { FaqItem } from "./helper";

export const faqItemsEn: FaqItem[] = [
    {
        id: "what-is-dashedo",
        question: "What is Dashedo and who is it for?",
        answerText:
            "Dashedo is a cloud-based software service (SaaS) for ⟨short description of your product⟩. It is suitable for ⟨target audiences⟩.",
        answerContent: (
            <p>
                Dashedo is a cloud-based software service (SaaS) for ⟨short product
                description⟩. Ideal for ⟨target audiences⟩.
            </p>
        ),
    },
    {
        id: "trial",
        question: "Is there a free trial?",
        answerText:
            "Yes, you can try Dashedo with no obligation. Details about duration and included features can be found on the Pricing page.",
        answerContent: (
            <p>
                Yes – details about scope and duration are available on the{" "}
                <a href="/pricing">Pricing</a> page. You can cancel at any time before
                the trial ends.
            </p>
        ),
    },
    {
        id: "change-plan",
        question: "How can I change or cancel my plan?",
        answerText:
            "You can change or cancel your plan at any time in the account area. Changes apply from the next billing period in accordance with our Terms & Conditions.",
        answerContent: (
            <p>
                You can adjust your plan flexibly in your account area. The conditions
                in our{" "}
                <a href="/legal/terms">Terms &amp; Conditions</a> apply.
            </p>
        ),
    },
    {
        id: "payment-methods",
        question: "Which payment methods are supported?",
        answerText:
            "We support common payment methods via ⟨Stripe/Adyen⟩. Invoices are available for download in your account.",
        answerContent: (
            <p>
                We accept payments via ⟨Stripe/Adyen⟩ (e.g. credit card, SEPA).
                Invoices are available in your account.
            </p>
        ),
    },
    {
        id: "security",
        question: "How is my data kept secure?",
        answerText:
            "We use TLS encryption, role-based access control, and regular backups. You can find more details in our privacy policy.",
        answerContent: (
            <p>
                Encryption, access controls, backups, and monitoring are standard. For
                details, see our{" "}
                <a href="/legal/privacy">privacy policy</a>.
            </p>
        ),
    },
    {
        id: "integrations",
        question: "Do you offer integrations with other tools?",
        answerText:
            "Yes, there are integrations with ⟨example tools⟩. You can find an up-to-date list on the Features page.",
        answerContent: (
            <p>
                Yes, including with ⟨example tools⟩. Learn more under{" "}
                <a href="/features">Features</a>.
            </p>
        ),
    },
    {
        id: "access-after-order",
        question: "How quickly will I get access after ordering?",
        answerText:
            "Access is usually granted immediately. If you do not receive an activation email, please check your spam folder or contact support.",
        answerContent: (
            <p>
                Typically you get access immediately via activation email. Please also
                check your spam folder. Help:{" "}
                <a href="/help/shipping">Provision &amp; delivery</a>.
            </p>
        ),
    },
    {
        id: "refunds",
        question: "How can I request a refund?",
        answerText:
            "Information about cancellations and refunds can be found under Returns & Refunds. If you have questions, please contact support.",
        answerContent: (
            <p>
                Conditions and requirements are described under{" "}
                <a href="/help/returns-refunds">Returns &amp; refunds</a>.
            </p>
        ),
    },
];
