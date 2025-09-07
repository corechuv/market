// src/utils/paymentCard.ts
export type CardBrand = "visa" | "mastercard" | "amex" | "mir" | "maestro" | "unknown";

export const BRAND_RULES: Record<CardBrand, { re: RegExp; cvc: 3 | 4; lengths: number[]; label: string }> = {
  visa:       { re: /^4/,                     cvc: 3, lengths: [16, 18, 19], label: "VISA" },
  mastercard: { re: /^(5[1-5]|2[2-7])/,       cvc: 3, lengths: [16],         label: "Mastercard" },
  amex:       { re: /^3[47]/,                 cvc: 4, lengths: [15],         label: "AmEx" },
  mir:        { re: /^220[0-4]/,              cvc: 3, lengths: [16],         label: "MIR" },
  maestro:    { re: /^(50|5[6-9]|6[0-9])/,    cvc: 3, lengths: [12,13,14,15,16,17,18,19], label: "Maestro" },
  unknown:    { re: /.^/,                     cvc: 3, lengths: [16,19],      label: "Card" },
};

export function detectBrand(digits: string): CardBrand {
  for (const k of Object.keys(BRAND_RULES) as CardBrand[]) {
    if (k !== "unknown" && BRAND_RULES[k].re.test(digits)) return k;
  }
  return "unknown";
}

export function luhnCheck(digits: string): boolean {
  let sum = 0, dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (dbl) { n *= 2; if (n > 9) n -= 9; }
    sum += n; dbl = !dbl;
  }
  return sum % 10 === 0;
}

export function formatCardNumber(value: string, brand: CardBrand): string {
  let clean = value.replace(/\D/g, "");
  const maxLen = Math.max(...BRAND_RULES[brand].lengths);
  clean = clean.slice(0, maxLen);
  if (brand === "amex") {
    const p1 = clean.slice(0, 4);
    const p2 = clean.slice(4, 10);
    const p3 = clean.slice(10, 15);
    return [p1, p2, p3].filter(Boolean).join(" ").trim();
  }
  return (clean.match(/.{1,4}/g) || [clean]).join(" ").trim();
}

export function formatExpiryInput(v: string): string {
  let d = v.replace(/\D/g, "").slice(0, 4);
  if (d.length === 1 && parseInt(d, 10) > 1) d = "0" + d; // 8 -> 08
  if (d.length >= 3) return d.slice(0, 2) + "/" + d.slice(2);
  return d;
}

export function expiryValid(exp: string): boolean {
  const m = exp.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const mm = parseInt(m[1], 10);
  const yy = 2000 + parseInt(m[2], 10);
  if (mm < 1 || mm > 12) return false;
  const endOfMonth = new Date(yy, mm, 0, 23, 59, 59, 999);
  return endOfMonth >= new Date();
}

export function lengthOkForBrand(brand: CardBrand, len: number): boolean {
  const set = new Set(BRAND_RULES[brand].lengths);
  return set.has(len) || (brand === "unknown" && (len === 16 || len === 19));
}
