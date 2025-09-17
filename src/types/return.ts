// src/types/return.ts
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

export type ReturnItemLine = {
  sku: string;
  name: string;
  qty: number;            // сколько возвращаем
  unitPriceCents: number;
  kind: ReturnKind;       // тип для конкретной строки
  reason: ReturnReason;   // причина в рамках kind
  note?: string;
  photos?: string[];      // dataURLы (демо)
};

export type ReturnRequest = {
  id: string;
  rma: string;
  // если все строки одного типа — "withdrawal" | "defect"; иначе "mixed"
  kind: ReturnKind | "mixed";
  status: ReturnStatus;
  createdAt: string;      // ISO
  orderId: string;
  orderNumber: string;

  currency: "EUR" | "USD" | "RUB";
  items: ReturnItemLine[];
  merchandiseTotalCents: number;

  customerNote?: string;
  deliveredAt?: string;   // фактическая дата получения (для окна 14 дней)
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
