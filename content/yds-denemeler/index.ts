import type { Deneme } from "./types";
import { DENEME_01 } from "./deneme-01";
import { DENEME_02 } from "./deneme-02";
import { DENEME_03 } from "./deneme-03";
import { DENEME_04 } from "./deneme-04";
import { DENEME_05 } from "./deneme-05";
import { DENEME_06 } from "./deneme-06";
import { DENEME_07 } from "./deneme-07";
import { DENEME_08 } from "./deneme-08";
import { DENEME_09 } from "./deneme-09";
import { DENEME_10 } from "./deneme-10";

/** Set 1 = Deneme 1–5, Set 2 = Deneme 6–10. */
export const DENEMELER: Deneme[] = [DENEME_01, DENEME_02, DENEME_03, DENEME_04, DENEME_05, DENEME_06, DENEME_07, DENEME_08, DENEME_09, DENEME_10];

export const SETS = [
  { slug: "yds-denemeleri-set-1", set: 1, denemeler: DENEMELER.slice(0, 5) },
  { slug: "yds-denemeleri-set-2", set: 2, denemeler: DENEMELER.slice(5, 10) },
] as const;

export { LETTERS, ROMAN, printed, type Printed, type SectionKey } from "./paper";
