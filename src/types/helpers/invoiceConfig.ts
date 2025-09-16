// +++ PDF export
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Profile } from "../profile";
import type { Settings } from "../settings";
import { statusLabel, type Order } from "../order";
import type { Address } from "../address";
import { fmtMoney } from "./fmtMoney";

// ---- Seller info for invoice (можно вынести в config)
const STORE = {
    name: "dashedo.com",
    legalName: "Dashedo GmbH",
    vatId: "DE123456789",       // поставь свой
    email: "support@dashedo.com",
    address: "Alexanderstraße 1, 10178 Berlin, Germany",
};

// Защита от пробелов/undefined
const safestr = (x?: string | null) => (x ? String(x) : "");

// Экспорт PDF инвойса
export function exportInvoicePDF(opts: {
    order: Order;
    address?: Address;
    currency: Settings["currency"];
    locale: string;
    buyer?: Profile;
}) {
    const { order, address, currency, locale, buyer } = opts;

    const doc = new jsPDF({ unit: "pt", format: "a4" }); // 595x842pt
    const left = 48;
    let y = 56;

    // Header
    doc.setFontSize(18);
    doc.text("Invoice / Rechnung", left, y);
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(STORE.legalName, left, y += 18);
    doc.text(STORE.address, left, y += 14);
    doc.text(`VAT ID: ${STORE.vatId}`, left, y += 14);
    doc.text(`Email: ${STORE.email}`, left, y += 14);

    // Order meta (right side)
    const rightCol = 595 - 48;
    doc.setTextColor(0);
    doc.setFontSize(12);
    const meta: Array<[string, string]> = [
        ["Order №", order.number],
        ["Date", new Date(order.createdAt).toLocaleString(locale)],
        ["Status", statusLabel(order.status)],
    ];
    meta.forEach((row, i) => {
        const label = row[0];
        const value = row[1];
        const yy = 56 + 18 + i * 16;
        doc.text(`${label}:`, rightCol - 220, yy, { align: "right" });
        doc.text(value, rightCol - 48, yy, { align: "right" });
    });

    // Addresses block
    y += 26;
    doc.setFontSize(12);
    doc.text("Bill To / Ship To:", left, y += 24);
    doc.setFontSize(11);
    const addrLines: string[] = [
        safestr(address?.fullName) || `${safestr(buyer?.firstName)} ${safestr(buyer?.lastName)}`.trim(),
        safestr(address?.line1) || safestr(address?.line2),
        [safestr(address?.postalCode), safestr(address?.city)].filter(Boolean).join(" "),
        [safestr(address?.region), safestr(address?.country)].filter(Boolean).join(", "),
        safestr(address?.phone),
    ].filter(Boolean);
    addrLines.forEach((line) => {
        doc.text(line, left, y += 14);
    });
    if (order.shippingMethod) {
        doc.setTextColor(120);
        doc.text(`Shipping: ${order.shippingMethod}`, left, y += 14);
        doc.setTextColor(0);
    }

    // Items table
    const money = (cents: number) => fmtMoney(cents / 100, currency, locale);

    const body = order.items.map((it) => [
        it.sku,
        it.name,
        String(it.qty),
        money(it.price),
        money(it.price * it.qty),
    ]);

    autoTable(doc, {
        startY: y + 22,
        head: [["SKU", "Item", "Qty", "Unit", "Total"]],
        body,
        styles: { fontSize: 10, cellPadding: 6, valign: "middle" },
        headStyles: { fillColor: [20, 20, 20] },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 220 },
            2: { halign: "right", cellWidth: 50 },
            3: { halign: "right", cellWidth: 80 },
            4: { halign: "right", cellWidth: 90 },
        },
        margin: { left, right: 48 },
    });

    // Summary (below table, aligned right)
    const afterTableY = (doc as any).lastAutoTable.finalY || y + 80;
    const summaryRows: [string, string][] = [];

    if (typeof order.subtotal === "number") summaryRows.push(["Subtotal", money(order.subtotal)]);
    if (typeof order.shippingCents === "number") {
        summaryRows.push([
            `Shipping${order.shippingMethod ? ` (${order.shippingMethod})` : ""}`,
            order.shippingCents === 0 ? "Free" : money(order.shippingCents),
        ]);
    }
    if ((order.discountCents ?? 0) > 0) {
        summaryRows.push([`Discount${order.promoCode ? ` (${order.promoCode})` : ""}`, `- ${money(order.discountCents!)}`]);
    }
    if (typeof order.vatCents === "number") {
        // вычислим ставку НДС, если можем
        const rate = order.subtotal && order.vatCents ? Math.round((order.vatCents / (order.total - order.vatCents)) * 100) : 19;
        summaryRows.push([`VAT (${rate}%)`, money(order.vatCents)]);
    }
    summaryRows.push(["Total", money(order.total)]);

    const xLabel = 595 - 48 - 200; // 200px ширина левой колонки
    let sy = afterTableY + 18;
    doc.setFontSize(11);
    summaryRows.forEach(([k, v], i) => {
        const isTotal = i === summaryRows.length - 1;
        if (isTotal) doc.setFont(undefined, "bold");
        doc.text(k, xLabel, sy);
        doc.text(v, 595 - 48, sy, { align: "right" });
        if (isTotal) doc.setFont(undefined, "normal");
        sy += 16;
    });

    // Footer note
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
        "Thank you for your purchase! This invoice is generated automatically and valid without signature.",
        left,
        842 - 48
    );

    // Save
    const fname = `invoice_${order.number.replace(/\s+/g, "-")}.pdf`;
    doc.save(fname);
}
