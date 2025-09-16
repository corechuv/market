// src/services/wishlistService.ts
// src/services/wishlistService.ts
export type UUID = string;

export type WishlistItem = {
  id: UUID;
  sku: string;
  name: string;
  price: number;   // cents
  addedAt: string; // ISO
};

// тот же ключ, что и в AccountPage
const PERSIST_KEY = "mp_account_demo_eu_v1";

type AccountShape = {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    birthday?: string;
    avatar?: string;
  };
  addresses: any[];
  orders: any[];
  settings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingOptIn: boolean;
    language: "ru" | "en";
    currency: "EUR" | "USD" | "RUB";
    theme: "system" | "light" | "dark";
  };
  wishlist: WishlistItem[];
};

function uid(): UUID {
  return Math.random().toString(36).slice(2, 10);
}

function loadAccount(): AccountShape | null {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    return raw ? (JSON.parse(raw) as AccountShape) : null;
  } catch {
    return null;
  }
}

function saveAccount(acc: AccountShape) {
  localStorage.setItem(PERSIST_KEY, JSON.stringify(acc));
}

function bootstrapIfMissing(): AccountShape {
  const existing = loadAccount();
  if (existing) return existing;
  // минимально безопасный аккаунт, чтобы AccountPage не падал
  const acc: AccountShape = {
    profile: {
      firstName: "Guest",
      lastName: "",
      email: "",
      phone: "",
      birthday: "",
      avatar: "",
    },
    addresses: [],
    orders: [],
    settings: {
      emailNotifications: true,
      smsNotifications: false,
      marketingOptIn: false,
      language: "ru",
      currency: "EUR",
      theme: "system",
    },
    wishlist: [],
  };
  saveAccount(acc);
  return acc;
}

export function getWishlist(): WishlistItem[] {
  const acc = loadAccount();
  return acc?.wishlist ?? [];
}

export function isInWishlist(sku: string): boolean {
  if (!sku) return false;
  const acc = loadAccount();
  return !!acc?.wishlist?.some((w) => w.sku === sku);
}

export function addWishlistItem(input: { sku: string; name: string; priceCents: number }): WishlistItem {
  if (!input.sku) throw new Error("SKU required");
  const acc = bootstrapIfMissing();
  const exists = acc.wishlist.find((w) => w.sku === input.sku);
  if (exists) return exists;

  const item: WishlistItem = {
    id: uid(),
    sku: input.sku,
    name: input.name,
    price: Math.max(0, Math.round(input.priceCents || 0)),
    addedAt: new Date().toISOString(),
  };

  acc.wishlist = [item, ...acc.wishlist];
  saveAccount(acc);
  return item;
}

export function removeWishlistItemBySku(sku: string) {
  const acc = bootstrapIfMissing();
  acc.wishlist = acc.wishlist.filter((w) => w.sku !== sku);
  saveAccount(acc);
}

export function toggleWishlistItem(input: { sku: string; name: string; priceCents: number }): boolean {
  // возвращает текущее состояние: true — в избранном, false — убран
  if (isInWishlist(input.sku)) {
    removeWishlistItemBySku(input.sku);
    return false;
    } else {
    addWishlistItem(input);
    return true;
  }
}
