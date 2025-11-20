// src/pages/Help/ImprintPage.tsx
import De from "./de/ImprintPage.de";
import En from "./en/ImprintPage.en";
import Ru from "./ru/ImprintPage.ru";
import { useLang } from "../../context/LangContext";

export default function ImprintPage() {
  const { lang } = useLang();

  if (lang === "en") return <En />;
  if (lang === "ru") return <Ru />;
  return <De />; // de по умолчанию
}