import type { Metadata } from "next";
import Link from "next/link";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { startNewLevelTestAction } from "@/app/actions/level-test";
import { hasLiveDiagnostic } from "@/lib/diagnostics/exam-family";

export const metadata: Metadata = { title: "Yeni Seviye Tespit Sınavı" };

const OPTIONS = [
  {
    title: "IELTS / TOEFL / PTE Seviye Testi",
    copy: "Akademik okuma becerini ölçer. Sonucun CEFR seviyesi (A1–C2) olarak gösterilir.",
    codes: ["IELTS", "TOEFL", "PTE"],
  },
  {
    title: "YDS & YÖKDİL Seviye Testi",
    copy: "Kelime, dil bilgisi, çeviri ve okuma sorularıyla eksik konularını belirler.",
    codes: ["YDS", "YOKDIL_SOSYAL", "YOKDIL_SAGLIK", "YOKDIL_FEN"],
  },
] as const;

export default async function NewLevelTestPage({ searchParams }: { searchParams: Promise<{ hata?: string }> }) {
  const user = await getAuthContext();
  if (!user) return null;
  const { hata } = await searchParams;
  const exams = await db.examType.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" } });

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/seviye-tespit" className="ghost-button mb-4 -ml-4">← Seviye Tespit</Link>
      <p className="eyebrow">Yeni Test</p>
      <h1 className="page-title">Hangi seviye testini çözmek istersin?</h1>
      {hata ? (
        <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Bu sınav için seviye tespit soruları henüz hazır değil. Lütfen başka bir sınav seç.
        </p>
      ) : null}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {OPTIONS.map((option) => (
          <section key={option.title} className="dashboard-panel flex flex-col">
            <h2 className="text-xl font-extrabold">{option.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{option.copy}</p>
            <div className="mt-5 grid gap-2">
              {exams
                .filter((exam) => (option.codes as readonly string[]).includes(exam.code))
                .map((exam) => (
                  <form key={exam.id} action={startNewLevelTestAction.bind(null, exam.slug)}>
                    <button type="submit" disabled={!hasLiveDiagnostic(exam.code)} className="secondary-button w-full justify-between">
                      {exam.name} <span aria-hidden="true">→</span>
                    </button>
                  </form>
                ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
