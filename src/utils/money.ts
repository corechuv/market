// FILE: src/utils/money.ts
export const EUR = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
export const formatMoney = (cents: number) => EUR.format(cents / 100);
export const toCents = (amount: number) => Math.round(amount * 100);

// Parse strings like "1 299,00 €" → cents
export function parseEuroToCents(input: unknown): number {
    if (typeof input === "number") return toCents(input);
    if (input == null) return 0;
    let s = String(input)
        .replace(/\u00A0/g, " ")
        .replace(/\s/g, "")
        .replace(/[^\d.,-]/g, "");
    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");
    if (lastComma > lastDot) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
    const n = Number(s);
    return Number.isFinite(n) ? toCents(n) : 0;
}