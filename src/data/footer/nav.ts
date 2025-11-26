// src/data/footer/nav.ts

export type FooterNavGroupId = "about" | "help" | "account" | "legal";

export interface FooterLink {
    href: string;
    labelKey: string;
}

export interface FooterNavGroup {
    id: FooterNavGroupId;
    titleKey: string;
    links: FooterLink[];
}

export const navInfo: FooterNavGroup[] = [
    {
        id: "about",
        titleKey: "about.title",
        links: [
            { href: "/about", labelKey: "about.links.aboutUs" },
            { href: "/about/careers", labelKey: "about.links.careers" },
            { href: "/about/press", labelKey: "about.links.press" },
        ],
    },
    {
        id: "help",
        titleKey: "help.title",
        links: [
            { href: "/help/contact", labelKey: "help.links.contact" },
            { href: "/help/faq", labelKey: "help.links.faq" },
            { href: "/help/shipping", labelKey: "help.links.shipping" },
            { href: "/help/returns-refunds", labelKey: "help.links.returns" },
        ],
    },
    {
        id: "account",
        titleKey: "account.title",
        links: [
            { href: "/account", labelKey: "account.links.myAccount" },
            { href: "/account/orders", labelKey: "account.links.orders" },
            { href: "/account/addresses", labelKey: "account.links.addresses" },
            { href: "/account/security", labelKey: "account.links.security" },
        ],
    },
    {
        id: "legal",
        titleKey: "legal.title",
        links: [
            { href: "/legal/terms", labelKey: "legal.links.terms" },
            { href: "/legal/privacy", labelKey: "legal.links.privacy" },
            { href: "/legal/cookies", labelKey: "legal.links.cookies" },
            { href: "/legal/imprint", labelKey: "legal.links.imprint" },
            { href: "/legal/sitemap", labelKey: "legal.links.sitemap" },
        ],
    },
];
