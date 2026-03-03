// src/types/address.ts
type UUID = string;

export type Address = {
  id: UUID;
  label: string; // "Дом", "Офис"
  firstName: string;
  lastName: string;
  line1: string;
  houseNo?: string;
  line2?: string;
  city: string;
  region?: string; // Bundesland / Region
  postalCode: string; // PLZ
  country: string; // country display name
  email?: string;
  phone?: string;
  isDefault?: boolean;
};
