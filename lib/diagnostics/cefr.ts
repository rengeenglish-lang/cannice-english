/**
 * Approximate CEFR band for an IELTS/TOEFL/PTE seviye tespit result. The level test is a short
 * diagnostic, not an official exam, so this is an indicative band from overall accuracy — the
 * results page says so explicitly rather than presenting it as a certified level.
 */
export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

const BANDS: { min: number; level: CefrLevel }[] = [
  { min: 90, level: "C2" },
  { min: 75, level: "C1" },
  { min: 60, level: "B2" },
  { min: 40, level: "B1" },
  { min: 20, level: "A2" },
  { min: 0, level: "A1" },
];

export function cefrFromPercentage(percentage: number): CefrLevel {
  return BANDS.find((band) => percentage >= band.min)!.level;
}

export const CEFR_DESCRIPTIONS: Record<CefrLevel, string> = {
  A1: "Başlangıç — temel ifadeleri anlayıp kullanabilirsin.",
  A2: "Temel — günlük konularda basit metinleri anlayabilirsin.",
  B1: "Orta — tanıdık konularda ana fikirleri kavrayabilirsin.",
  B2: "Orta üstü — akademik metinlerin çoğunu anlayabilirsin.",
  C1: "İleri — karmaşık akademik metinleri rahatça anlayabilirsin.",
  C2: "Ustalık — neredeyse her metni zahmetsizce anlayabilirsin.",
};
