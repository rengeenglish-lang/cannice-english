/**
 * Deneme Sınavı plans — the single source of truth for what each tier unlocks. Every site-wide
 * access check (server/services/plans.service.ts) and every plan card reads from here, so the
 * bullets a student pays for and what the code actually enforces can't drift apart.
 */

export const PLAN_TIERS = ["BASLANGIC", "CIRAK", "UZMAN"] as const;
export type PlanTierCode = (typeof PLAN_TIERS)[number];

export const PLAN_RANK: Record<PlanTierCode, number> = { BASLANGIC: 1, CIRAK: 2, UZMAN: 3 };

export type PlanFeature =
  /** Online Deneme Sınavları — Başlangıç is capped at BASLANGIC_MOCK_EXAM_LIMIT starts. */
  | "MOCK_EXAMS"
  /** Unlimited Deneme Sınavı starts. */
  | "UNLIMITED_MOCK_EXAMS"
  | "KONU_ANLATIMI"
  | "PRACTICE_QUESTIONS"
  /** Plan-included e-books/extra materials without a separate purchase. */
  | "FREE_MATERIALS"
  /** Uzman's free konuşma kulübü, sistematik canlı ders and seçmeli canlı ders. */
  | "LIVE_LESSON_PERKS";

const FEATURES: Record<PlanTierCode, PlanFeature[]> = {
  BASLANGIC: ["MOCK_EXAMS", "KONU_ANLATIMI"],
  CIRAK: ["MOCK_EXAMS", "UNLIMITED_MOCK_EXAMS", "KONU_ANLATIMI", "PRACTICE_QUESTIONS", "FREE_MATERIALS"],
  UZMAN: ["MOCK_EXAMS", "UNLIMITED_MOCK_EXAMS", "KONU_ANLATIMI", "PRACTICE_QUESTIONS", "FREE_MATERIALS", "LIVE_LESSON_PERKS"],
};

export const BASLANGIC_MOCK_EXAM_LIMIT = 10;

/** Default plan lengths, used when a PLAN product has no accessMonths set. */
export const DEFAULT_ACCESS_MONTHS: Record<PlanTierCode, number> = { BASLANGIC: 1, CIRAK: 4, UZMAN: 4 };

export function planAllows(tier: PlanTierCode | null | undefined, feature: PlanFeature): boolean {
  return Boolean(tier && FEATURES[tier].includes(feature));
}

/** The cheapest tier that unlocks a feature — what an upgrade prompt should point at. */
export function minimumTierFor(feature: PlanFeature): PlanTierCode {
  return PLAN_TIERS.find((tier) => FEATURES[tier].includes(feature)) ?? "UZMAN";
}

export const PLAN_NAMES: Record<PlanTierCode, string> = { BASLANGIC: "Başlangıç", CIRAK: "Çırak", UZMAN: "Uzman" };

export const PLAN_CARD_COPY: Record<PlanTierCode, { tagline: string; bullets: string[] }> = {
  BASLANGIC: {
    tagline: "Denemelerle tanışmak isteyenler için",
    bullets: ["10 deneme", "Ek materyal ve kitaplar ayrı satın alınır", "Konu anlatımı erişimi", "1 aylık erişim"],
  },
  CIRAK: {
    tagline: "Düzenli çalışan öğrenciler için",
    bullets: ["Tüm deneme sınavlarına erişim", "Ek materyal ücretsiz", "Konu anlatımı erişimi", "Pratik sorulara erişim", "4 aylık erişim"],
  },
  UZMAN: {
    tagline: "Hedefine canlı derslerle ulaşmak isteyenler için",
    bullets: [
      "Çırak paketindeki her şey dahil",
      "Tüm denemelere erişim",
      "Ücretsiz konuşma kulübü katılımı (1 ay)",
      "Ücretsiz sistematik canlı ders",
      "İstediğin canlı derse ücretsiz katılım",
      "Pratik sorulara erişim",
    ],
  },
};

export const PLAN_PERK_LABELS = {
  SPEAKING_CLUB: "Konuşma kulübü (1 ay)",
  SYSTEMATIC_LIVE: "Sistematik canlı ders (1 ay)",
  ELECTIVE_LIVE: "İstediğin canlı ders (1 ay)",
} as const;
export type PlanPerkCode = keyof typeof PLAN_PERK_LABELS;

/**
 * Which Uzman perk a live course can be claimed with, most specific first: a konuşma kulübü
 * uses the SPEAKING_CLUB perk, a hazırlık grubu the SYSTEMATIC_LIVE one, and ELECTIVE_LIVE
 * ("istediğin canlı ders") covers any live course as the fallback.
 */
export function perkCandidatesForCourse(course: { isSpeakingClub: boolean; category: string }): PlanPerkCode[] {
  if (course.isSpeakingClub) return ["SPEAKING_CLUB", "ELECTIVE_LIVE"];
  if (course.category === "PREP_GROUP") return ["SYSTEMATIC_LIVE", "ELECTIVE_LIVE"];
  return ["ELECTIVE_LIVE"];
}

/**
 * Adds calendar months, clamping to the target month's last day (31 Ocak + 1 ay = 28/29 Şubat),
 * so a "1 aylık" period is 30 or 31 days depending on the month rather than a flat 30.
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}
