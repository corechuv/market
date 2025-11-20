// src/pages/Help/PrivacyPolicyPage.tsx
import De from "./de/PrivacyPolicyPage.de";
import En from "./en/PrivacyPolicyPage.en";
import Ru from "./ru/PrivacyPolicyPage.ru";
import { useLang } from "../../context/LangContext";

export default function PrivacyPolicyPage() {
  const { lang } = useLang();

  if (lang === "en") return <En />;
  if (lang === "ru") return <Ru />;
  return <De />; // de по умолчанию
}