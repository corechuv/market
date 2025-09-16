// src/types/order.ts
import type { Settings } from "./settings";

type UUID = string;

export type OrderItem = {
  sku: string;
  name: string;
  qty: number;
  price: number; // per unit (in cents)

// +++ любое из полей ок, карточки берут первым попавшимся
  image?: string;     // основной кейс
  imageUrl?: string;
  images?: string[];
  thumb?: string;
};

export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

export type Order = {
  id: UUID;
  number: string;
  createdAt: string; // ISO
  status: OrderStatus;

  // totals (в центах)
  subtotal?: number;
  shippingCents?: number;
  discountCents?: number;
  vatCents?: number;
  total: number; // итог к оплате (в центах)

  // доп. сведения
  shippingMethod?: string;     // «Standard Versand», «Express» и т. п.
  promoCode?: string | null;
  currencyCode?: Settings["currency"]; // если нужно помнить валюту на момент заказа

  items: OrderItem[];
  deliveryAddressId?: UUID;    // слинкуется на Address
};

export function statusLabel(s: OrderStatus) {
  switch (s) {
    case "processing":
      return "В обработке";
    case "shipped":
      return "Отгружен";
    case "delivered":
      return "Доставлен";
    case "cancelled":
      return "Отменён";
    case "refunded":
      return "Возврат";
  }
}
