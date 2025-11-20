// src/pages/Help/FAQPage.tsx
import De from "./de/FAQPage.de";
import En from "./en/FAQPage.en";
import Ru from "./ru/FAQPage.ru";
import { useLang } from "../../context/LangContext";

export default function FAQPage() {
  const { lang } = useLang();

  if (lang === "en") return <En />;
  if (lang === "ru") return <Ru />;
  return <De />; // de по умолчанию
}