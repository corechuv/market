// src/pages/Help/TermsPage.tsx
import De from "./de/TermsPage.de";
import En from "./en/TermsPage.en";
import Ru from "./ru/TermsPage.ru";
import { useLang } from "../../context/LangContext";

export default function TermsPage() {
  const { lang } = useLang();

  if (lang === "en") return <En />;
  if (lang === "ru") return <Ru />;
  return <De />; // de по умолчанию
}