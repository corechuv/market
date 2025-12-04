// src/specs/codebook.ts
import type { SpecDictionary } from "../components/Product/SpecTable";


export const codebook: SpecDictionary = {
    // Energy class
    "energy.class.arrow": { label: "Стрелка класса энергоэффективности", group: "Энергоэффективность", priority: 0 },
    "energy.class": { label: "Класс энергоэффективности", group: "Энергоэффективность", priority: 0,
        format: () => "SVG"
    },
    "docs.datasheet": {
        label: "Produktdatenblatt", group: "Документы", priority: 0,
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