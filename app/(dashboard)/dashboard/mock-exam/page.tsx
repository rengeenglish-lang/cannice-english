import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ListChecks } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { db } from "@/server/db";
import { hasLiveDiagnostic } from "@/lib/diagnostics/exam-family";
import { attemptConfigForExam } from "@/lib/diagnostics/attempt-config";
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
  const inProgress = await db.diagnosticAttempt.findFirst({
    where: { userId: user.id, examTypeId: goal.examTypeId, kind: "MOCK_EXAM", status: "IN_PROGRESS" },
  });

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-14 text-center sm:px-6">
      <p className="eyebrow">{goal.examType.name}</p>
      <h1 className="page-title">Gerçek sınav formatında deneme</h1>
      <p className="page-copy mt-4">
        Bu deneme, gerçek {goal.examType.name} sınavıyla aynı soru sayısı ve süreyle uygulanır. Süre dolduğunda sınav otomatik olarak
        teslim edilir.
      </p>

      <div className="mt-8 flex justify-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <span className="grid size-12 place-items-center rounded-2xl bg-[color:var(--brand-soft)] text-[color:var(--accent-strong)]">
            <ListChecks size={22} aria-hidden="true" />
          </span>
          <span className="text-sm font-bold text-[color:var(--foreground)]">{config.mockExamQuestionCount} Soru</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="grid size-12 place-items-center rounded-2xl bg-[color:var(--brand-soft)] text-[color:var(--accent-strong)]">
            <Clock size={22} aria-hidden="true" />
          </span>
          <span className="text-sm font-bold text-[color:var(--foreground)]">{config.mockExamTimeLimitMinutes} Dakika</span>
        </div>
      </div>

      <form action={startMockExamAction} className="mt-10">
        <button type="submit" className="primary-button mx-auto">
          {inProgress ? "Kaldığın Yerden Devam Et" : "Deneme Sınavını Başlat"}
        </button>
      </form>
    </main>
  );
}
