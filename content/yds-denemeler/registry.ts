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
  12: () => import("./deneme-12").then((m) => m.DENEME_12),
  13: () => import("./deneme-13").then((m) => m.DENEME_13),
  14: () => import("./deneme-14").then((m) => m.DENEME_14),
  15: () => import("./deneme-15").then((m) => m.DENEME_15),
  16: () => import("./deneme-16").then((m) => m.DENEME_16),
  17: () => import("./deneme-17").then((m) => m.DENEME_17),
  18: () => import("./deneme-18").then((m) => m.DENEME_18),
  19: () => import("./deneme-19").then((m) => m.DENEME_19),
};

/** How many online denemeler are planned in total (released in batches of ten). */
export const PLANNED_DENEME_COUNT = 100;

export const RELEASED_DENEME_COUNT = Object.keys(DENEME_LOADERS).length;
