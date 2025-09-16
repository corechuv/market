// src/types/address.ts
type UUID = string;

export type Address = {
  id: UUID;
  label: string; // "Дом", "Офис"
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string; // Bundesland / Region
  postalCode: string; // PLZ
  country: string; // country display name
  phone?: string;
  isDefault?: boolean;
};