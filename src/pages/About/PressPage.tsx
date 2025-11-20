// src/pages/About/PressPage.tsx
import De from "./de/PressPage.de";
import En from "./en/PressPage.en";
import Ru from "./ru/PressPage.ru";
import { useLang } from "../../context/LangContext";


export default function PressPage() {
    const { lang } = useLang();

    if (lang === "en") return <En />;
    if (lang === "ru") return <Ru />;
    return <De />; // de по умолчанию
}
