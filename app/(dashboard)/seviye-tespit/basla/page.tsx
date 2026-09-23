import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { db } from "@/server/db";
import { hasLiveDiagnostic } from "@/lib/diagnostics/exam-family";
import { startFullDiagnosticAction } from "@/app/actions/diagnostic-attempt";

export const metadata: Metadata = { title: "Seviye Tespit Sınavı" };

export default async function StartDiagnosticPage() {
  const user = await getAuthContext();
  if (!user) return null;
  const goal = await getActiveGoal(user.id);
  if (!goal) redirect("/seviye-tespit/hedef");

  const live = hasLiveDiagnostic(goal.examType.code);
  const inProgress = live
    ? await db.diagnosticAttempt.findFirst({ where: { userId: user.id, goalId: goal.id, kind: "FULL_DIAGNOSTIC", status: "IN_PROGRESS" } })
    : null;

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-14 text-center sm:px-6">
      <p className="eyebrow">Hedefin Belli</p>
      <h1 className="page-title">Şimdi başlangıç noktanı bulalım.</h1>

      {live ? (
        <>
          <p className="page-copy mt-4">
            Sana doğru çalışma planını oluşturabilmemiz için seviye tespit sınavını tamamla. Bu sınav gerçek bir puan vermez; eksiklerini bulmak için tasarlanmıştır.
          </p>
          <form action={startFullDiagnosticAction} className="mt-8">
            <button type="submit" className="primary-button mx-auto">
              {inProgress ? "Kaldığın Yerden Devam Et" : "Seviye Tespit Sınavını Başlat"}
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="page-copy mt-4">
            {goal.examType.name} için seviye tespit sınavımız yakında yayında olacak. Bu sırada konu anlatımlarımızla çalışmaya başlayabilirsin.
          </p>
          <Link href="/konu-anlatim" className="primary-button mx-auto mt-8 inline-flex">
            Konu Anlatımlarına Git
          </Link>
        </>
      )}
    </main>
  );
}
