import type { LexiconEntry } from "./types";
import { A1_PART1 } from "./a1/part1";
import { A1_PART2 } from "./a1/part2";
import { A1_PART3 } from "./a1/part3";
import { A1_PART4 } from "./a1/part4";
import { A1_PART5 } from "./a1/part5";
import { A1_PART6 } from "./a1/part6";
import { A1_PART7 } from "./a1/part7";
import { A1_PART8 } from "./a1/part8";

/** A1 — 800 core words in 40 themed sets of 20. */
export const A1: LexiconEntry[] = [...A1_PART1, ...A1_PART2, ...A1_PART3, ...A1_PART4, ...A1_PART5, ...A1_PART6, ...A1_PART7, ...A1_PART8];
