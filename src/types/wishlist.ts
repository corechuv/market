// src/types/wishlist.ts
type UUID = string;

export type Wishlist = {
  id: UUID;
  sku: string;
  name: string;
  price: number; // in cents
  addedAt: string; // ISO
};