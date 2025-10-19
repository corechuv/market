// src/types/return.ts
import type { Currency } from "./currency";
import type { Carriers } from "./delivery/carrier";
import { paymentMethodLabel, type PaymentMethod } from "./payment/payment";

type RefundBase = { label?: string };

export type RefundDestination =
  | (RefundBase & { kind: "original"; method: PaymentMethod })
  | (RefundBase & { kind: "bank"; ibanMasked: string; holder?: string })
  | (RefundBase & { kind: "store_credit" });

export function refundDestinationLabel(dest?: RefundDestination): string {
  if (!dest) return "—";
  switch (dest.kind) {
    case "original": return dest.label ?? paymentMethodLabel(dest.method);
    case "bank": return dest.label ?? `Bank transfer (${dest.ibanMasked})`;
    case "store_credit": return dest.label ?? "Store credit";
  }
}

export type ReturnReason =
  | "too_small"
  | "not_as_described"
  | "changed_mind"
  | "wrong_item"
  | "arrived_late"
  | "damaged"
  | "defective"
  | "other";

export type ReturnKind = "withdrawal" | "defect"; // Widerruf vs Gewährleistung

export type ReturnStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "label_issued"
  | "in_transit"
  | "received"
  | "refunded";

// Новый статус для СТРОКИ возврата (независимо от статуса всей заявки)
export type ReturnLineStatus =
  | "pending"      // создана/отправлена, ждёт решения
  | "approved"     // одобрена к возврату
  | "rejected"     // отклонена
  | "in_transit"   // отправлена покупателем
  | "received"     // получена на складе
  | "refunded";    // деньги возвращены

export type ReturnItemLine = {
  lineId: string;         // Уникальный ID строки (обязательно)
  sku: string;
  name: string;
  qty: number;            // сколько возвращаем именно в ЭТОЙ строке
  unitPriceCents: number;
  kind: ReturnKind;       // тип для конкретной строки
  reason: ReturnReason;   // причина в рамках kind
  note?: string;
  photos?: string[];      // dataURLы (демо)

  status?: ReturnLineStatus; // по умолчанию "pending" (если не задано)
};

export type ReturnLabelKind = "pdf" | "qr" | "link";

export type ReturnLabel = {
  kind: ReturnLabelKind;       // как выдаём: PDF-файл, QR или просто ссылка
  carrier: Carriers;
  createdAt: string;           // ISO
  expiresAt?: string;          // ISO (опционально)
  trackingNumber?: string;     // если есть от перевозчика
  // PDF/ссылка:
  labelUrl?: string;           // data:URL или https://… на PDF/PNG
  // QR:
  qrPayload?: string;          // сырая строка для кодирования
  qrDataUrl?: string;          // PNG dataURL уже сгенерированного QR (для предпросмотра/печати)
  dropoffHint?: string;        // подсказка: "Сдайте в DHL Filiale/Packstation"
};

export type ReturnRequest = {
  id: string;
  rma: string;
  // если все строки одного типа — "withdrawal" | "defect"; иначе "mixed"
  kind: ReturnKind | "mixed";
  status: ReturnStatus;           // логистический статус всей заявки
  createdAt: string;              // ISO
  orderId: string;
  orderNumber: string;

  currency: Currency;
  items: ReturnItemLine[];        // допускаем несколько строк на один SKU
  merchandiseTotalCents: number;

  customerNote?: string;
  deliveredAt?: string;           // фактическая дата получения (для окна 14 дней)
  label?: ReturnLabel;
  refund?: RefundDestination;
};

export function returnStatusLabel(s: ReturnStatus) {
  switch (s) {
    case "draft": return "Черновик";
    case "submitted": return "Отправлено на проверку";
    case "approved": return "Одобрено";
    case "rejected": return "Отклонено";
    case "label_issued": return "Этикетка сформирована";
    case "in_transit": return "В пути";
    case "received": return "Получено";
    case "refunded": return "Возвращено";
  }
}

// Отдельная локализация для статуса СТРОКИ
export function returnLineStatusLabel(s: ReturnLineStatus) {
  switch (s) {
    case "pending": return "В ожидании";
    case "approved": return "Одобрено";
    case "rejected": return "Отклонено";
    case "in_transit": return "В пути";
    case "received": return "Получено";
    case "refunded": return "Возвращено";
  }
}

export function returnKindLabel(k: ReturnKind | "mixed") {
  switch (k) {
    case "withdrawal": return "Widerruf (14 дней)";
    case "defect": return "Дефект (Gewährleistung)";
    case "mixed": return "Смешанный";
  }
}

export const RETURN_REASONS: Record<ReturnReason, string> = {
  too_small: "Размер/совместимость не подошли",
  not_as_described: "Не соответствует описанию",
  changed_mind: "Передумал(а) (Widerruf)",
  wrong_item: "Прислали не тот товар",
  arrived_late: "Опоздала доставка",
  damaged: "Повреждение при доставке",
  defective: "Неисправный товар (Gewährleistung)",
  other: "Другое",
};

// Допустимые причины по типу возврата
export const REASONS_BY_KIND: Record<ReturnKind, ReturnReason[]> = {
  withdrawal: ["changed_mind", "too_small", "not_as_described", "wrong_item", "arrived_late", "other"],
  defect: ["defective", "damaged", "not_as_described", "wrong_item", "other"],
};

// Утилиты сводки по строкам
export function lineCounts(r: ReturnRequest) {
  const total = r.items.length;
  const approved = r.items.filter(l => ["approved", "in_transit", "received", "refunded"].includes((l.status || "pending") as string)).length;
  const rejected = r.items.filter(l => (l.status || "pending") === "rejected").length;
  return { total, approved, rejected, pending: total - approved - rejected };
}

export function requestDecisionSummary(r: ReturnRequest): "all_pending" | "all_rejected" | "all_approved" | "partially_approved" {
  const { total, approved, rejected } = lineCounts(r);
  if (approved === 0 && rejected === 0) return "all_pending";
  if (rejected === total) return "all_rejected";
  if (approved === total) return "all_approved";
  return "partially_approved";
}
