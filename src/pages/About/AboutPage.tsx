// src/pages/About/AboutPage.tsx
import AboutPageDe from "./de/AboutPage.de";
import AboutPageEn from "./en/AboutPage.en";
import AboutPageRu from "./ru/AboutPage.ru";
import { useLang } from "../../context/LangContext";

export default function AboutPage() {
  const { lang } = useLang();

  if (lang === "en") return <AboutPageEn />;
  if (lang === "ru") return <AboutPageRu />;
  return <AboutPageDe />; // de по умолчанию
}