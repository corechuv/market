// src/pages/Help/ShippingPage.tsx
import De from "./de/ShippingPage.de"
import En from "./en/ShippingPage.en"
import Ru from "./ru/ShippingPage.ru"
import { useLang } from "../../context/LangContext"

export default function ShippingPage() {
  const { lang } = useLang();

  if (lang === "en") return <En />;
  if (lang === "ru") return <Ru />;
  return <De />; // de по умолчанию
}