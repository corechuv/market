// src/types/settings.ts
export type Settings = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingOptIn: boolean; // GDPR-friendly explicit toggle
  language: "ru" | "en"; // UI still in RU/EN (can be extended)
  currency: "RUB" | "USD" | "EUR";
  theme: "system" | "light" | "dark";
};