// src/pages/About/AboutPage.tsx
import De from "./de/AboutPage.de"
import En from "./en/AboutPage.en"
import Ru from "./ru/AboutPage.ru"
import { useLang } from "../../context/LangContext"

export default function AboutPage() {
  const { lang } = useLang();

  if (lang === "en") return <En />;
  if (lang === "ru") return <Ru />;
  return <De />; // de по умолчанию
}