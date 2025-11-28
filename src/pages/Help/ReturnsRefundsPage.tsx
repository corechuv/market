// src/pages/Help/ReturnsRefundsPage.tsx
import De from "./de/ReturnsRefundsPage.de"
import En from "./en/ReturnsRefundsPage.en"
import Ru from "./ru/ReturnsRefundsPage.ru"
import { useLang } from "../../context/LangContext"

export default function ReturnsRefundsPage() {
  const { lang } = useLang();

  if (lang === "en") return <En />;
  if (lang === "ru") return <Ru />;
  return <De />; // de по умолчанию
}