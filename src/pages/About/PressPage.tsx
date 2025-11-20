// src/pages/About/PressPage.tsx
import PressPageDe from "./de/PressPage.de";
import PressPageEn from "./en/PressPage.en";
import PressPageRu from "./ru/PressPage.ru";
import type { AppLanguage } from "../../utils/lang/lang";

function getLangFromHtml(): AppLanguage {
    if (typeof document === "undefined") return "de";
    const lang = document.documentElement.lang as AppLanguage;
    if (lang === "en" || lang === "ru" || lang === "de") return lang;
    return "de";
}

export default function PressPage() {
    const lang = getLangFromHtml();

    if (lang === "en") return <PressPageEn />;
    if (lang === "ru") return <PressPageRu />;
    return <PressPageDe />;
}
