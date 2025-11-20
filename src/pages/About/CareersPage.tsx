// src/pages/About/CareersPage.tsx
import De from "./de/CareersPage.de";
import En from "./en/CareersPage.en";
import Ru from "./ru/CareersPage.ru";
import { useLang } from "../../context/LangContext";

export default function CareersPage() {
    const { lang } = useLang();

    if (lang === "en") return <En />;
    if (lang === "ru") return <Ru />;
    return <De />; // de по умолчанию
}
