// src/services/checkoutApi.ts
const API = import.meta.env.VITE_API_BASE_URL; // e.g. "http://127.0.0.1:8000/api/v1"

import { toISO2 } from "../utils/country";

// ---- fetch helper
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    ...init,
  });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`${r.status} ${r.statusText}: ${text || path}`);
  }
  return r.json() as Promise<T>;
}

// ---- TYPES (минимально нужные под наш вызов)
export type CartLine = import("../context/CartContext").CartLine;

export type QuoteOut = {
  valid: boolean;
  reason?: string | null;
  discountCents: number;
  freeShipping: boolean;
  finalSubtotalCents: number;
  finalShippingCents: number;
  finalVatCents: number;
  finalTotalCents: number;
  snapshot?: Record<string, any> | null;
};

export type CustomerOut = { id: string; email?: string | null };

export type OrderOut = {
  id: string;
  number: string;
  status: string;
  currency: string;
  totalCents: number;
  shippingCents: number;
  items: Array<{ sku: string; name: string; qty: number; priceCents: number }>;
};

export type PaymentOut = {
  id: string;
  orderId: string;
  status: string;
  provider: string;
  amountCents: number;
  currency: string;
  providerPaymentId?: string;
  clientSecret?: string;
  approvalUrl?: string;
};

// --- TYPES ---
export type ShippingOption = {
  id: string;                 // "DHL:DHL_PAKET_EU"
  carrierCode: string;
  serviceCode: string;
  label: string;              // "DHL • DHL Paket EU"
  priceCents: number;
  effectivePriceCents: number;
  currency: string;
  etaMinDays?: number | null;
  etaMaxDays?: number | null;
  freeFromCents?: number | null;
};

// --- API calls ---
export async function listShippingOptions(params: {
  country: string;           // ISO-2
  subtotalCents: number;
}): Promise<ShippingOption[]> {
  const q = new URLSearchParams({
    country: (params.country || "DE").toUpperCase(),
    subtotalCents: String(Math.max(0, params.subtotalCents || 0)),
  });
  return api<ShippingOption[]>(`/shipping/options?${q.toString()}`);
}

// ---- helpers
export function toOrderItems(lines: CartLine[]) {
  return lines.map((l) => ({
    productId: l.productId || undefined,
    sku: l.variantId || l.productId || l.id,
    name: l.title,
    qty: l.qty,
    priceCents: l.priceCents,
    currency: "EUR",
  }));
}

export function toAddressIn(a: {
  firstName: string; lastName: string; email: string; phone: string;
  line1: string; line2?: string; city: string; postalCode: string; country: string;
}) {
  return {
    firstName: a.firstName, lastName: a.lastName,
    country: toISO2(a.country || "DE"),
    postalCode: a.postalCode, city: a.city,
    line1: a.line1, line2: a.line2 || undefined,
    phone: a.phone || undefined, email: a.email || undefined,
  };
}

// ---- API calls
export async function quoteTotals(params: {
  lines: CartLine[];
  shippingCents: number;
  promoCode?: string | null;
  country?: string;         // ISO2 или человекочитаемое, напр. "Deutschland"
  customerId?: string | null;
}): Promise<QuoteOut> {
  const body = {
    code: params.promoCode || null,
    country: toISO2(params.country || "DE"),
    customerId: params.customerId || null,
    items: params.lines.map((l) => ({
      productId: l.productId || null,
      sku: l.variantId || l.productId || l.id,
      qty: l.qty,
      priceCents: l.priceCents,
      vatClass: "standard", // сервер может подтянуть из products по productId; так безопаснее
    })),
    shippingCents: params.shippingCents || 0,
  };
  return api<QuoteOut>("/pricing/quote", { method: "POST", body: JSON.stringify(body) });
}

export async function upsertCustomer(payload: {
  email?: string; phone?: string; firstName?: string; lastName?: string;
}): Promise<CustomerOut> {
  return api<CustomerOut>("/customers/", { method: "POST", body: JSON.stringify(payload) });
}

export async function createOrder(payload: {
  customerId?: string | null;
  items: ReturnType<typeof toOrderItems>;
  currency: "EUR";
  shippingCents: number;
  shippingMethod?: string | null;
  selectedCarrierCode?: string | null;
  selectedServiceCode?: string | null;
  deliveryAddress: ReturnType<typeof toAddressIn>;
  billingAddress?: ReturnType<typeof toAddressIn> | null;
  promoCode?: string | null;
  // можно передать клиентские суммы, но serverCalculate=true — сервер пересчитает сам
  subtotalCents: number;
  discountCents: number;
  vatCents: number;
  totalCents: number;
  serverCalculate?: boolean;
}): Promise<OrderOut> {
  return api<OrderOut>("/orders/", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      serverCalculate: payload.serverCalculate ?? true,
    }),
  });
}

export async function createPaymentIntent(orderId: string, amountCents: number, provider: "manual" | "stripe" | "paypal" | "invoice" | "bank_transfer" = "manual") {
  return api<PaymentOut>(`/payments/orders/${orderId}/intent`, {
    method: "POST",
    body: JSON.stringify({ provider, amountCents, currency: "EUR" }),
  });
}

export async function confirmPayment(paymentId: string) {
  return api<PaymentOut>(`/payments/${paymentId}/confirm`, { method: "POST" });
}
