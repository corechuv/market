// src/pages/Help/SitemapPage.tsx
import De from "./de/SitemapPage.de";
import En from "./en/SitemapPage.en";
import Ru from "./ru/SitemapPage.ru";
import { useLang } from "../../context/LangContext";

export default function SitemapPage() {
  const { lang } = useLang();

  if (lang === "en") return <En />;
  if (lang === "ru") return <Ru />;
  return <De />; // de по умолчанию
}