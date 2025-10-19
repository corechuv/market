// src/types/settings.ts
import type { Currency } from "./currency";
import type { Language } from "./language";
import type { Theme } from "./theme";

export type Settings = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingOptIn: boolean; // GDPR-friendly explicit toggle
  language: Language; // RU/EN
  currency: Currency; // EUR/USD
  theme: Theme; // light/dark
};