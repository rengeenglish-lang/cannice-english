import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ListChecks } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { hasLiveDiagnostic, examFamilyForCode } from "@/lib/diagnostics/exam-family";
import { attemptConfigForExam } from "@/lib/diagnostics/attempt-config";
import { getMockExamSetsOverview } from "@/server/services/diagnostic-attempts.service";
import { startMockExamAction } from "@/app/actions/diagnostic-attempt";
import { PlanCards } from "@/components/plans/PlanCards";
import { getPlanAccess, listPlanProducts, remainingMockExamStarts } from "@/server/services/plans.service";
import { BASLANGIC_MOCK_EXAM_LIMIT, PLAN_NAMES } from "@/lib/plans";

export const metadata: Metadata = { title: "Deneme Sınavı" };

export default async function MockExamPage({ searchParams }: { searchParams: Promise<{ limit?: string }> }) {
  const user = await getAuthContext();
  if (!user) return null;
  const { limit } = await searchParams;
  const [access, planProducts, goal] = await Promise.all([getPlanAccess(user), listPlanProducts(), getActiveGoal(user.id)]);
  const remaining = access.can("MOCK_EXAMS") ? await remainingMockExamStarts(user.id, access) : 0;

  const plans = (
    <section id="planlar" className="scroll-mt-24">
      <p className="eyebrow">Deneme Sınavı Planları</p>
      <h1 className="page-title">{access.plan ? `${PLAN_NAMES[access.plan.tier]} planın aktif` : "Denemelere başlamak için planını seç"}</h1>
      <p className="page-copy mt-2">
        {access.plan
          ? remaining === null
            ? "Tüm deneme sınavlarına sınırsız erişimin var. Dilediğin zaman planını yükseltebilir veya süreni uzatabilirsin."
            : `Başlangıç planınla ${BASLANGIC_MOCK_EXAM_LIMIT} denemeden ${remaining} tanesi kaldı. Sınırsız deneme için Çırak veya Uzman plana geçebilirsin.`
          : access.isStaff
            ? "Eğitmen hesabıyla tüm denemelere erişimin var."
            : "Planlar tek seferlik ödemedir; otomatik yenilenmez. Satın alma sonrası 14 gün içinde iade talep edebilirsin."}
      </p>
      {limit ? (
        <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Başlangıç planındaki {BASLANGIC_MOCK_EXAM_LIMIT} deneme hakkının tamamını kullandın. Devam etmek için planını yükselt.
        </p>
      ) : null}
      <div className="mt-6">
        <PlanCards products={planProducts} currentTier={access.plan?.tier ?? null} currentExpiresAt={access.plan?.expiresAt} />
      </div>
    </section>
  );

  if (!access.can("MOCK_EXAMS")) {
    return <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">{plans}</main>;
  }

  if (!goal) {
    return (
      <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10 sm:px-6">
        <div className="dashboard-panel text-center">
          <p className="page-copy">Deneme sınavına girebilmek için önce hazırlandığın sınavı ve hedefini belirlemelisin.</p>
          <Link href="/seviye-tespit/hedef" className="primary-button mx-auto mt-6 inline-flex">Hedef Belirle</Link>
        </div>
        {plans}
      </main>
    );
  }

  const live = hasLiveDiagnostic(goal.examType.code);
  if (!live) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-14 text-center sm:px-6">
        <p className="eyebrow">{goal.examType.name}</p>
        <h1 className="page-title">Deneme sınavı yakında</h1>
        <p className="page-copy mt-4">{goal.examType.name} için deneme sınavımız yakında yayında olacak.</p>
      </main>
    );
  }

  const config = attemptConfigForExam(goal.examType.code);
  const isAcademicSkills = examFamilyForCode(goal.examType.code) === "ACADEMIC_SKILLS";
  const sets = await getMockExamSetsOverview(user.id, goal.examTypeId, examFamilyForCode(goal.examType.code));

  if (sets.length === 0) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-14 text-center sm:px-6">
        <p className="eyebrow">{goal.examType.name}</p>
        <h1 className="page-title">Deneme sınavı yakında</h1>
        <p className="page-copy mt-4">{goal.examType.name} için deneme sınavlarımız yakında yayında olacak.</p>
      </main>
    );
  }

  const outOfStarts = remaining !== null && remaining <= 0;
  return (
    <main className="mx-auto w-full max-w-6xl space-y-12 px-4 py-10 sm:px-6">
    {plans}
    <section className="mx-auto max-w-3xl">
      <p className="eyebrow">{goal.examType.name}</p>
      <h2 className="section-title">{isAcademicSkills ? "Reading bölümü denemeleri" : "Gerçek sınav formatında denemeler"}</h2>
      <p className="page-copy mt-4">
        {isAcademicSkills
          ? `Her deneme, gerçek ${goal.examType.name} Reading (Okuma) bölümüyle aynı soru sayısı ve sürede uygulanır. Listening, Writing ve Speaking bölümleri bu denemelere dahil değildir.`
          : `Her deneme, gerçek ${goal.examType.name} sınavıyla aynı soru sayısı ve süreyle uygulanır.`}{" "}
        Her deneme kendi içinde sabit bir soru setidir — istediğin kadar tekrar çözebilirsin.
      </p>

      <div className="mt-6 flex justify-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <span className="grid size-11 place-items-center rounded-2xl bg-[color:var(--brand-soft)] text-[color:var(--accent-strong)]">
            <ListChecks size={20} aria-hidden="true" />
          </span>
          <span className="text-sm font-bold text-[color:var(--foreground)]">{config.mockExamQuestionCount} Soru</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="grid size-11 place-items-center rounded-2xl bg-[color:var(--brand-soft)] text-[color:var(--accent-strong)]">
            <Clock size={20} aria-hidden="true" />
          </span>
          <span className="text-sm font-bold text-[color:var(--foreground)]">{config.mockExamTimeLimitMinutes} Dakika</span>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {sets.map((s) => {
          const isInProgress = Boolean(s.inProgressAttemptId);
          const isCompleted = s.completedCount > 0 && !isInProgress;
          return (
            <div key={s.setNumber} className="dashboard-panel flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-[color:var(--foreground)]">Deneme {s.setNumber}</p>
                <p className="mt-1 text-xs font-semibold text-[color:var(--muted)]">
                  {isInProgress
                    ? "Devam ediyor"
                    : isCompleted
                      ? `Tamamlandı${s.completedCount > 1 ? ` · ${s.completedCount} kez çözüldü` : ""}`
                      : "Başlanmadı"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {isCompleted && s.lastCompletedAttemptId ? (
                  <Link href={`/dashboard/sonuc/${s.lastCompletedAttemptId}`} className="ghost-button text-xs">Sonuç</Link>
                ) : null}
                <form action={startMockExamAction.bind(null, s.setNumber)}>
                  <button type="submit" disabled={outOfStarts && !isInProgress} className={isCompleted ? "secondary-button text-xs" : "primary-button text-xs"}>
                    {isInProgress ? "Devam Et" : isCompleted ? "Tekrar Çöz" : "Başlat"}
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </section>
    </main>
  );
}
