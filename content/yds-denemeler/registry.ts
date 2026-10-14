import type { Deneme } from "./types";

/**
 * Online denemeler, loaded one file at a time so a sitting never pulls all 100 tests into memory.
 * Each batch of ten adds its lines here; the list page shows the rest as "yakında".
 */
export const DENEME_LOADERS: Record<number, () => Promise<Deneme>> = {
  1: () => import("./deneme-01").then((m) => m.DENEME_01),
  2: () => import("./deneme-02").then((m) => m.DENEME_02),
  3: () => import("./deneme-03").then((m) => m.DENEME_03),
  4: () => import("./deneme-04").then((m) => m.DENEME_04),
  5: () => import("./deneme-05").then((m) => m.DENEME_05),
  6: () => import("./deneme-06").then((m) => m.DENEME_06),
  7: () => import("./deneme-07").then((m) => m.DENEME_07),
  8: () => import("./deneme-08").then((m) => m.DENEME_08),
  9: () => import("./deneme-09").then((m) => m.DENEME_09),
  10: () => import("./deneme-10").then((m) => m.DENEME_10),
  11: () => import("./deneme-11").then((m) => m.DENEME_11),
};

/** How many online denemeler are planned in total (released in batches of ten). */
export const PLANNED_DENEME_COUNT = 100;

export const RELEASED_DENEME_COUNT = Object.keys(DENEME_LOADERS).length;
