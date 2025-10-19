// src/types/delivery/carrier.ts
export type Carriers = "DHL" | "DPD" | "GLS" | "UPS" | "Hermes" | "Other";

export type Carrier = {
    name: string;
    code: string;
}