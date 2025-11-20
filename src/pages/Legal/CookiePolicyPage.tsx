// src/pages/Help/CookiePolicyPage.tsx
import De from "./de/CookiePolicyPage.de";
import En from "./en/CookiePolicyPage.en";
import Ru from "./ru/CookiePolicyPage.ru";
import { useLang } from "../../context/LangContext";

export default function CookiePolicyPage() {
  const { lang } = useLang();

  if (lang === "en") return <En />;
  if (lang === "ru") return <Ru />;
  return <De />; // de по умолчанию
}