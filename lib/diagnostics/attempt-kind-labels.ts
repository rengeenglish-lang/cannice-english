import type { DiagnosticAttemptKind } from "@/lib/generated/prisma/client";

export const ATTEMPT_KIND_TITLES: Record<DiagnosticAttemptKind, string> = {
  FULL_DIAGNOSTIC: "Seviye Tespit Sınavı",
  MASTERY_CHECK: "Konu Kontrolü",
  PRACTICE: "Pratik Sorular",
  MOCK_EXAM: "Deneme Sınavı",
};

export const ATTEMPT_KIND_RESULT_TITLES: Record<DiagnosticAttemptKind, string> = {
  FULL_DIAGNOSTIC: "Seviye Tespit Sonucun",
  MASTERY_CHECK: "Konu Kontrolü Sonucun",
  PRACTICE: "Pratik Sonucun",
  MOCK_EXAM: "Deneme Sınavı Sonucun",
};
