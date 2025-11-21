// src/pages/Help/en/ShippingPage.en.tsx
import "react";
import Page from "../../../components/UI/Page/Page";
import s from "../Help.module.scss";

export default function ShippingPageEn() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Provision & Delivery (digital)",
        "url": "https://dashedo.com/help/shipping",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dashedo.com/" },
                { "@type": "ListItem", "position": 2, "name": "Help & Support", "item": "https://dashedo.com/help" },
                { "@type": "ListItem", "position": 3, "name": "Provision & Delivery", "item": "https://dashedo.com/help/shipping" }
            ]
        }
    };

    return (
        <Page>
            <div className={s.content}>
                <nav aria-label="Breadcrumb">
                    <a href="/">Home</a> &nbsp;/&nbsp; <a href="/help">Help &amp; Support</a> &nbsp;/&nbsp; <span>Provision &amp; Delivery</span>
                </nav>

                <h1 className={s.content__title}>Provision &amp; Delivery (digital)</h1>
                <p><strong>Last updated:</strong> 11.11.2025</p>

                <h2>Provisioning access</h2>
                <p>
                    After a successful order you receive <strong>immediate access</strong> to Dashedo.
                    The activation email with the confirmation link is sent to your account email address.
                </p>

                <h2>If you don’t receive an email</h2>
                <ul>
                    <li>Check your <strong>spam/junk folder</strong> and add <em>no-reply@dashedo.com</em> as a safe sender.</li>
                    <li>Make sure the email address you provided is correct.</li>
                    <li>If needed, contact <a href="/help/contact">Support</a> – we’re happy to help.</li>
                </ul>

                <h2>Regions &amp; availability</h2>
                <p>
                    Dashedo can in principle be used worldwide. Restrictions may apply due to regional legal
                    requirements or partner integrations.
                </p>

                <h2>Service levels &amp; maintenance</h2>
                <p>
                    We aim for high availability. Wherever possible, planned maintenance is announced in advance.
                    Current notices can be found in the product or via support.
                </p>

                <h2>Invoice delivery</h2>
                <p>
                    Invoices are provided digitally and can be downloaded in your account area.
                    On request, we can also send you a PDF copy by email.
                </p>

                <p>
                    More topics: <a href="/help/faq">FAQ</a> ·{" "}
                    <a href="/help/returns-refunds">Returns &amp; refunds</a> ·{" "}
                    <a href="/help/contact">Contact</a>
                </p>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </div>
        </Page>
    );
}
