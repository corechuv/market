// FILE: src/specs/codebook.ts
import type { SpecDictionary } from "../components/Product/SpecTable";


export const codebook: SpecDictionary = {
    // Базовые поля
    name: { label: "Модель", group: "Общее", priority: 1 },
    price: { label: "Цена", group: "Общее", priority: 2 },
    available: { label: "Наличие", group: "Общее", priority: 3 },
    sku: { label: "Артикул", group: "Общее", priority: 4 },

    // Energy class
    "energy.class": { label: "Класс энергоэффективности", group: "Энергопотребление", priority: 0 },
    "docs.datasheet": {
        label: "Produktdatenblatt", group: "Документы", priority: 1,
        format: () => "PDF"
    }, // в ячейке будет "PDF", клик по строке откроет href

    // CPU — примеры кодов
    "cpu.cores": { label: "Ядер", group: "Процессор", priority: 1 },
    "cpu.threads": { label: "Потоков", group: "Процессор", priority: 2 },
    "freq.base": { label: "Базовая частота", unit: "ГГц", group: "Частоты", priority: 1 },
    "freq.boost": { label: "Boost до", unit: "ГГц", group: "Частоты", priority: 2 },
    "compat.socket": { label: "Сокет", group: "Совместимость", priority: 1 },
    "gpu.integrated": { label: "Встроенная графика", group: "Процессор", priority: 5 },
    "power.tdp": { label: "Мощность (TDP)", unit: "Вт", group: "Энергопотребление", priority: 1 },
    "process.node": { label: "Техпроцесс", group: "Процессор", priority: 6 },
    "mem.support": { label: "Поддержка памяти", group: "Совместимость", priority: 2 },
    "pcie.version": { label: "Версия PCIe", group: "Совместимость", priority: 3 },
    "bundle.cooler": { label: "Кулер в комплекте", group: "Комплектация", priority: 1 },
};