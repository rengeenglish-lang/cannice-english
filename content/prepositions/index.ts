import type { Part, Unit } from "./types";
import { UNITS_01_05 } from "./units-01-05";
import { UNITS_06_10 } from "./units-06-10";
import { UNITS_11_15 } from "./units-11-15";
import { UNITS_16_20 } from "./units-16-20";
import { UNITS_21_25 } from "./units-21-25";
import { UNITS_26_30 } from "./units-26-30";

/** Prepositions Master Class: 30 units in book order. */
export const UNITS: Unit[] = [...UNITS_01_05, ...UNITS_06_10, ...UNITS_11_15, ...UNITS_16_20, ...UNITS_21_25, ...UNITS_26_30];

/** The five parts of the book, each a run of units. */
export const PARTS: (Part & { from: number; to: number })[] = [
  { title: "Yer", subtitle: "Nokta, yüzey, hacim; yukarı-aşağı; yakınlık; iç ve dış", units: UNITS.slice(0, 5), from: 1, to: 5 },
  { title: "Hareket ve Zaman", subtitle: "Hedef, yol, takvim, süre ve sıra", units: UNITS.slice(5, 10), from: 6, to: 10 },
  { title: "Mantık İlişkileri", subtitle: "Neden, zıtlık, ekleme, araç, amaç, konu, karşılaştırma, koşul, ölçü", units: UNITS.slice(10, 20), from: 11, to: 20 },
  { title: "Bağımlı Edatlar", subtitle: "Sıfat, fiil ve isimlerin istediği edatlar", units: UNITS.slice(20, 27), from: 21, to: 27 },
  { title: "Öbekler ve Dil Bilgisi", subtitle: "Sabit edat öbekleri ve sınav tuzakları", units: UNITS.slice(27, 30), from: 28, to: 30 },
];
