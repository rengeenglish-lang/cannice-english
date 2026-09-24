import type { Metadata } from "next";
import { loadCoaching } from "@/server/services/coaching/context";
import { OnboardingWizard, type OnboardingInitial } from "@/components/coaching/OnboardingWizard";
import { ageFrom, dateToDayKey } from "@/lib/coaching/time";
import { PATHWAY_CODES, type CoachingPathwayCode } from "@/lib/coaching/exams";

export const metadata: Metadata = { title: "Koçluk planını oluştur" };

export default async function CoachingOnboardingPage() {
  const { user, profile, t } = await loadCoaching();
  // Reuse the birth date already on the account (if any) instead of asking again.
  const age = ageFrom(user.birthDate);
  const initial: OnboardingInitial = profile
    ? {
        pathway: PATHWAY_CODES.includes(profile.pathway as CoachingPathwayCode) ? (profile.pathway as CoachingPathwayCode) : null,
        examVersion: profile.examVersion,
        targetScore: profile.targetScore ?? "",
        skillTargets: Object.fromEntries(Object.entries((profile.skillTargets as Record<string, unknown> | null) ?? {}).map(([k, v]) => [k, String(v)])),
        examDate: profile.examDate ? dateToDayKey(profile.examDate) : "",
        currentLevel: profile.currentLevel ?? "UNKNOWN",
        recentScore: profile.recentScore ?? "",
        recentScoreKind: profile.recentScoreKind === "OFFICIAL" ? "OFFICIAL" : "PRACTICE",
        studyDays: profile.studyDays,
        dailyMinutes: profile.dailyMinutes,
        commitment: profile.commitment ?? "",
        difficulties: profile.difficulties,
        reminderTime: profile.reminderTime,
        isMinor: age !== null ? age < 18 : profile.isMinor,
        guardianConsent: Boolean(profile.guardianConsentAt),
      }
    : {
        pathway: null,
        examVersion: "",
        targetScore: "",
        skillTargets: {},
        examDate: "",
        currentLevel: "UNKNOWN",
        recentScore: "",
        recentScoreKind: "PRACTICE",
        studyDays: [1, 2, 3, 4, 6],
        dailyMinutes: 45,
        commitment: "",
        difficulties: [],
        reminderTime: "19:00",
        isMinor: age !== null && age < 18,
        guardianConsent: false,
      };
  return <OnboardingWizard locale={t.locale} initial={initial} isEdit={Boolean(profile)} minorKnown={age !== null} />;
}
