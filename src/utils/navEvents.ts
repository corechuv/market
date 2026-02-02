// src/utils/navEvents.ts
export const NAV_OPEN_SETTINGS = "nav:open_settings";

export function openSettingsPanel() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NAV_OPEN_SETTINGS));
}
