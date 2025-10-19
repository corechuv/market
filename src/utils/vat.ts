// src/utils/vat.ts
// Простейшая карта стандартных ставок НДС по ISO-2 (для fallback на фронте).
// Это ориентировочные ставки для физтоваров; истинный источник — бекенд.

const RATES: Record<string, number> = {
  DE: 0.19, AT: 0.20, CH: 0.081, BE: 0.21, NL: 0.21, FR: 0.20, ES: 0.21, IT: 0.22, PT: 0.23,
  PL: 0.23, CZ: 0.21, SK: 0.20, HU: 0.27, RO: 0.19, BG: 0.20, DK: 0.25, SE: 0.25, NO: 0.25,
  FI: 0.24, IE: 0.23, GB: 0.20, LU: 0.17, GR: 0.24, EE: 0.22, LV: 0.21, LT: 0.21, SI: 0.22,
  HR: 0.25, MT: 0.18, CY: 0.19,
};

export function vatRateFor(iso2: string | undefined | null): number {
  const k = String(iso2 || "DE").toUpperCase();
  return RATES[k] ?? 0.19; // дефолт Германия
}
