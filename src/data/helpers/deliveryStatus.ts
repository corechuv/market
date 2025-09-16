// src/data/deliveryStatus.ts

export const STATUS_OPTIONS = [
    { value: "all", label: "Все статусы" },
    { value: "processing", label: "В обработке" },
    { value: "shipped", label: "Отгружен" },
    { value: "delivered", label: "Доставлен" },
    { value: "cancelled", label: "Отменён" },
    { value: "refunded", label: "Возврат" },
] as const;