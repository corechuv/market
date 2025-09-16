// src/types/fmtMoney.ts
import type { Settings } from "../settings";

export const fmtMoney = (n: number, currency: Settings["currency"], locale?: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(n);