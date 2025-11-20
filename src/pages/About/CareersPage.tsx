// src/pages/About/CareersPage.tsx
import CareersPageDe from "./de/CareersPage.de";
import CareersPageEn from "./en/CareersPage.en";
import CareersPageRu from "./ru/CareersPage.ru";
import type { AppLanguage } from "../../utils/lang/lang";

function getLangFromHtml(): AppLanguage {
    if (typeof document === "undefined") return "de";
    const lang = document.documentElement.lang as AppLanguage;
    if (lang === "en" || lang === "ru" || lang === "de") return lang;
    return "de";
}

export default function CareersPage() {
    const lang = getLangFromHtml();

    if (lang === "en") return <CareersPageEn />;
    if (lang === "ru") return <CareersPageRu />;
    return <CareersPageDe />;
}
