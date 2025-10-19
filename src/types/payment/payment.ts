// src/types/payment/payment.ts
import type { Settings } from "../settings";

export type PaymentMethod =
  | { type: "card"; brand: import("../../utils/paymentCard").CardBrand; last4: string; holder?: string }
  | { type: "paypal"; email: string }
  | { type: "bank_transfer"; ibanMasked: string; holder?: string }
  | { type: "apple_pay" | "google_pay" | "sofort" | "klarna" };

export type PaymentInfo = {
  method: PaymentMethod;
  amountCents: number;
  currency: Settings["currency"];
  paidAt?: string;         // ISO
  transactionId?: string;
};

// Удобный label для вывода в UI
export function paymentMethodLabel(m: PaymentMethod): string {
  switch (m.type) {
    case "card":       return `${m.brand?.toUpperCase?.() || "CARD"} •••• ${m.last4}`;
    case "paypal":     return `PayPal (${m.email})`;
    case "bank_transfer": return `Bank transfer (${m.ibanMasked})`;
    case "apple_pay":  return "Apple Pay";
    case "google_pay": return "Google Pay";
    case "sofort":     return "Sofort";
    case "klarna":     return "Klarna";
  }
}