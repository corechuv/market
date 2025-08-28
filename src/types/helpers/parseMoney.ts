// помощник: приводим денежную строку к числу
export function parseMoney(input: unknown): number {
    if (typeof input === "number") return input;
    if (input == null) return NaN;
    // убираем пробелы (в т.ч. неразрывные) и валюты
    let s = String(input)
        .replace(/\u00A0/g, " ")     // nbsp -> пробел
        .replace(/\s/g, "")          // все пробелы
        .replace(/[^\d.,-]/g, "");   // только цифры и разделители
    // определяем, что является десятичным разделителем: последняя запятая/точка в строке
    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");
    if (lastComma > lastDot) {
        // десятичная запятая: убираем все тысячи-точки и меняем запятую на точку
        s = s.replace(/\./g, "").replace(",", ".");
    } else {
        // десятичная точка или вовсе нет десятичной части: убираем все запятые (тысячи)
        s = s.replace(/,/g, "");
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
}
