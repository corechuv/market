// src/data/information/helper.ts
import type { ReactNode } from "react";
export type FaqItem = {
    id: string;
    question: string;
    answerText: string;   // для JSON-LD
    answerContent: ReactNode; // что реально рендерим в аккордеоне
};
