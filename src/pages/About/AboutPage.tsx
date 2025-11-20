// src/pages/About/AboutPage.tsx
import AboutPageDe from "./de/AboutPage.de";
import AboutPageEn from "./en/AboutPage.en";
import AboutPageRu from "./ru/AboutPage.ru";
import type { AppLanguage } from "../../utils/lang/lang";

function getLangFromHtml(): AppLanguage {
    if (typeof document === "undefined") return "de";
    const lang = document.documentElement.lang as AppLanguage;
    if (lang === "en" || lang === "ru" || lang === "de") return lang;
    return "de";
}

export default function AboutPage() {
    const lang = getLangFromHtml();

    if (lang === "en") return <AboutPageEn />;
    if (lang === "ru") return <AboutPageRu />;
    return <AboutPageDe />;
}
