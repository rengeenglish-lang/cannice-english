/**
 * Speaking Club groups by level, so learners practise with people at their level:
 * ELEMENTARY A (A1–A2), INTERMEDIATE B (B1–B2) and ADVANCED C (C1–C2). A learner's level comes from
 * the general English placement test (or, failing that, an IELTS/TOEFL/PTE level test's CEFR band).
 */
import { PLACEMENT_BANDS, PLACEMENT_QUESTIONS, type PlacementBand } from "@/content/english-placement";

export type ClubGroup = "A" | "B" | "C";
export const CLUB_GROUPS: { key: ClubGroup; name: string; bands: string }[] = [
  { key: "A", name: "ELEMENTARY A", bands: "A1–A2" },
  { key: "B", name: "INTERMEDIATE B", bands: "B1–B2" },
  { key: "C", name: "ADVANCED C", bands: "C1–C2" },
];
export const clubGroupName = (g: ClubGroup) => CLUB_GROUPS.find((x) => x.key === g)!.name;

export function groupForCefr(cefr: string): ClubGroup {
  if (cefr.startsWith("C")) return "C";
  if (cefr.startsWith("B")) return "B";
  return "A";
}

/** A band counts as reached with at least 3 of its 5 questions right. */
export const BAND_PASS_MARK = 3;

/**
 * Grades the placement test. The level is the highest band reached without skipping one: a learner
 * who passes A1–B1 but misses B2 is B1 even if they guess two C1 items. Unanswered = wrong.
 */
export function gradePlacement(answers: Record<string, number>) {
  const byBand = new Map<PlacementBand, number>();
  let correct = 0;
  for (const q of PLACEMENT_QUESTIONS) {
    if (answers[q.id] === q.answer) {
      correct += 1;
      byBand.set(q.band, (byBand.get(q.band) ?? 0) + 1);
    }
  }
  let cefr: PlacementBand = "A1";
  for (const band of PLACEMENT_BANDS) {
    if ((byBand.get(band) ?? 0) >= BAND_PASS_MARK) cefr = band;
    else break;
  }
  return { cefr, correct, total: PLACEMENT_QUESTIONS.length, group: groupForCefr(cefr) };
}
