// src/utils/country.ts
// Нормализация страны → ISO-2. Поддержаны распространённые варианты на EN/DE/FR/ES/IT и др.
// Если не найдена — аккуратный фоллбэк: первые 2 буквы (DE для Deutschland и т.п.).

function norm(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // диакритика
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const MAP: Record<string, string> = {};

// helper to register many aliases
function reg(code: string, ...aliases: string[]) {
  for (const a of aliases) MAP[norm(a)] = code;
}

// --- EU & neighbors
reg("DE", "de", "germany", "deutschland", "alemania", "allemagne", "germania");
reg("AT", "at", "austria", "österreich", "osterreich");
reg("CH", "ch", "switzerland", "schweiz", "suisse", "svizzera");
reg("BE", "be", "belgium", "belgique", "belgie", "belgien", "belgia");
reg("NL", "nl", "netherlands", "nederland", "holland");
reg("FR", "fr", "france", "frankreich", "francia");
reg("ES", "es", "spain", "españa", "espana", "espagne", "spanien", "spagna");
reg("IT", "it", "italy", "italia");
reg("PT", "pt", "portugal", "portogallo");
reg("PL", "pl", "poland", "polska", "polen", "pologne", "polonia");
reg("CZ", "cz", "czechia", "czech republic", "cesko", "česko", "ceska republika", "česká republika");
reg("SK", "sk", "slovakia", "slovensko");
reg("HU", "hu", "hungary", "magyarorszag", "magyarország");
reg("RO", "ro", "romania", "românia", "romania");
reg("BG", "bg", "bulgaria", "bulgarien", "bulgarie");
reg("DK", "dk", "denmark", "danmark", "dänemark", "dinamarca");
reg("SE", "se", "sweden", "sverige", "schweden", "suede");
reg("NO", "no", "norway", "norge", "noreg", "norwegen", "norvege", "noruega");
reg("FI", "fi", "finland", "suomi", "finnland", "finlande");
reg("IE", "ie", "ireland", "eire", "éire");
reg("GB", "gb", "united kingdom", "uk", "great britain", "britain", "england", "vereinigtes konigreich", "royaume uni");
reg("LU", "lu", "luxembourg", "letzebuerg", "luxemburg");
reg("GR", "gr", "greece", "ellada", "ellada", "ελλάδα", "grecia", "griechenland");
reg("EE", "ee", "estonia", "eesti");
reg("LV", "lv", "latvia", "latvija");
reg("LT", "lt", "lithuania", "lietuva");
reg("SI", "si", "slovenia", "slovenija");
reg("HR", "hr", "croatia", "hrvatska");
reg("MT", "mt", "malta");
reg("CY", "cy", "cyprus", "kypros", "kipros", "kibris");

// Fallback for common language tags already in ISO-2 form
const ISO2_RE = /^[a-z]{2}$/i;

export function toISO2(input: string): string {
  const s = (input || "").trim();
  if (!s) return "DE";
  if (ISO2_RE.test(s)) return s.toUpperCase();

  const hit = MAP[norm(s)];
  if (hit) return hit;

  // мягкий фоллбэк: первые 2 буквы в upper
  return s.toUpperCase().slice(0, 2);
}

export const EUROPE_COUNTRIES: { code: string; name: string }[] = [
    { code: "AL", name: "Albania" }, { code: "AD", name: "Andorra" },
    { code: "AM", name: "Armenia" }, { code: "AT", name: "Austria" },
    { code: "AZ", name: "Azerbaijan" }, { code: "BY", name: "Belarus" },
    { code: "BE", name: "Belgium" }, { code: "BA", name: "Bosnia and Herzegovina" },
    { code: "BG", name: "Bulgaria" }, { code: "HR", name: "Croatia" },
    { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Czechia" },
    { code: "DK", name: "Denmark" }, { code: "EE", name: "Estonia" },
    { code: "FI", name: "Finland" }, { code: "FR", name: "France" },
    { code: "GE", name: "Georgia" }, { code: "DE", name: "Germany" },
    { code: "GR", name: "Greece" }, { code: "HU", name: "Hungary" },
    { code: "IS", name: "Iceland" }, { code: "IE", name: "Ireland" },
    { code: "IT", name: "Italy" }, { code: "KZ", name: "Kazakhstan" },
    { code: "LV", name: "Latvia" }, { code: "LI", name: "Liechtenstein" },
    { code: "LT", name: "Lithuania" }, { code: "LU", name: "Luxembourg" },
    { code: "MT", name: "Malta" }, { code: "MD", name: "Moldova" },
    { code: "MC", name: "Monaco" }, { code: "ME", name: "Montenegro" },
    { code: "NL", name: "Netherlands" }, { code: "MK", name: "North Macedonia" },
    { code: "NO", name: "Norway" }, { code: "PL", name: "Poland" },
    { code: "PT", name: "Portugal" }, { code: "RO", name: "Romania" },
    { code: "RU", name: "Russia" }, { code: "SM", name: "San Marino" },
    { code: "RS", name: "Serbia" }, { code: "SK", name: "Slovakia" },
    { code: "SI", name: "Slovenia" }, { code: "ES", name: "Spain" },
    { code: "SE", name: "Sweden" }, { code: "CH", name: "Switzerland" },
    { code: "TR", name: "Türkiye" }, { code: "UA", name: "Ukraine" },
    { code: "GB", name: "United Kingdom" }, { code: "VA", name: "Vatican City" },
];