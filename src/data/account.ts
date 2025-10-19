// src/data/account.ts
import type { Account } from "../types/account";

export const uid = () => Math.random().toString(36).slice(2, 10);

export const account: Account = {
  profile: {
    firstName: "Alex",
    lastName: "Müller",
    email: "alex@example.de",
    phone: "+49 151 23456789",
    birthday: "1993-05-20",
    avatar: "",
  },
  addresses: [
    {
      id: uid(),
      label: "Дом",
      firstName: "Alex",
      lastName: "Müller",
      line1: "Musterstraße 10",
      city: "Berlin",
      postalCode: "10115",
      country: "Германия",
      phone: "+49 151 23456789",
      isDefault: true,
    },
    {
      id: uid(),
      label: "Офис",
      firstName: "Alex",
      lastName: "Müller",
      line1: "Leopoldstraße 25, Büro 302",
      city: "München",
      postalCode: "80802",
      country: "Германия",
    },
  ],
  /*
  orders: [
    {
      id: uid(),
      number: "MP-2025-000123",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      deliveredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      status: "delivered",
      // сводка:
      subtotal: 12990,
      shippingCents: 0,
      discountCents: 0,
      vatCents: 2075, // пример, не принципиально
      total: 12990,
      shippingMethod: "Standard Versand",
      promoCode: null,
      currencyCode: "EUR",
      payment: {
        method: { type: "card", brand: "visa", last4: "4242", holder: "Alex Müller" },
        amountCents: 12990,
        currency: "EUR",
        paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 10 * 60 * 1000).toISOString(),
        transactionId: `demo_${uid()}`
      },
      items: [
        { sku: "SKU-1001", name: "Kopfhörer Pro", qty: 1, price: 9990 },
        { sku: "SKU-2001", name: "Hülle", qty: 1, price: 3000 },
      ],
      // deliveryAddressId оставляем пустым — модалка сападёт на адрес по умолчанию
    },
  ],*/
  returns: [],
  settings: {
    emailNotifications: true,
    smsNotifications: false,
    marketingOptIn: false,
    language: "ru",
    currency: "EUR",
    theme: "system",
  },
};