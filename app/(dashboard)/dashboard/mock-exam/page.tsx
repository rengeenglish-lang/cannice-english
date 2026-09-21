import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ListChecks } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { hasLiveDiagnostic, examFamilyForCode } from "@/lib/diagnostics/exam-family";
import { attemptConfigForExam } from "@/lib/diagnostics/attempt-config";
import { getMockExamSetsOverview } from "@/server/services/diagnostic-attempts.service";
import { startMockExamAction } from "@/app/actions/diagnostic-attempt";

export const metadata: Metadata = { title: "Deneme Sınavı" };

export default async function MockExamPage() {
  const user = await getAuthContext();
  if (!user) return null;
  const goal = await getActiveGoal(user.id);
  if (!goal) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-14 text-center sm:px-6">
        <p className="page-copy">Deneme sınavına girebilmek için önce hedefini belirlemelisin.</p>
        <Link href="/seviye-tespit/hedef" className="primary-button mx-auto mt-6 inline-flex">Hedef Belirle</Link>
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="eyebrow">{goal.examType.name}</p>
      <h1 className="page-title">{isAcademicSkills ? "Reading bölümü denemeleri" : "Gerçek sınav formatında denemeler"}</h1>
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
                  <button type="submit" className={isCompleted ? "secondary-button text-xs" : "primary-button text-xs"}>
                    {isInProgress ? "Devam Et" : isCompleted ? "Tekrar Çöz" : "Başlat"}
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
