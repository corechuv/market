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
      fullName: "Alex Müller",
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
      fullName: "Alex Müller",
      line1: "Leopoldstraße 25, Büro 302",
      city: "München",
      postalCode: "80802",
      country: "Германия",
    },
  ],
  orders: [
    {
      id: uid(),
      number: "MP-2025-000123",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
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
      items: [
        { sku: "SKU-1001", name: "Kopfhörer Pro", qty: 1, price: 9990 },
        { sku: "SKU-2001", name: "Hülle", qty: 1, price: 3000 },
      ],
      // deliveryAddressId оставляем пустым — модалка сападёт на адрес по умолчанию
    },
  ],
  settings: {
    emailNotifications: true,
    smsNotifications: false,
    marketingOptIn: false,
    language: "ru",
    currency: "EUR",
    theme: "system",
  },
  wishlist: [
    { id: uid(), sku: "SKU-5555", name: "Bluetooth Lautsprecher", price: 7990, addedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
    { id: uid(), sku: "SKU-7777", name: "Kabellose Maus", price: 3490, addedAt: new Date().toISOString() },
  ],
};