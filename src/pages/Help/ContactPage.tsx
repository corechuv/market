// src/pages/Help/ContactPage.tsx
import De from "./de/ContactPage.de";
import En from "./en/ContactPage.en";
import Ru from "./ru/ContactPage.ru";
import { useLang } from "../../context/LangContext";

export default function ContactPage() {
  const { lang } = useLang();

  if (lang === "en") return <En />;
  if (lang === "ru") return <Ru />;
  return <De />; // de по умолчанию
}