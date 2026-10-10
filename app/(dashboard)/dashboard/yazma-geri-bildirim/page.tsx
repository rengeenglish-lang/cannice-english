import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, PenLine } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { getWritingAllowance, listWritingFeedback, writingFeedbackConfigured } from "@/server/services/writing-feedback.service";
import { WritingFeedbackForm } from "@/components/writing/WritingFeedbackForm";
import { WRITING_FEEDBACK_KINDS, isWritingKind, type WritingKindKey } from "@/lib/writing-feedback";

export const metadata: Metadata = { title: "Yazma ve Çeviri Geri Bildirimi" };
// Grading runs inside the form's server action; Haiku usually answers in well under a minute.
export const maxDuration = 120;

const DEFAULT_KIND: Record<string, WritingKindKey> = {
  IELTS: "IELTS_TASK2",
  TOEFL: "TOEFL_DISCUSSION",
  PTE: "PTE_ESSAY",
  YDS: "TRANSLATION_EN_TR",
  YOKDIL_SOSYAL: "TRANSLATION_EN_TR",
  YOKDIL_SAGLIK: "TRANSLATION_EN_TR",
  YOKDIL_FEN: "TRANSLATION_EN_TR",
};

export default async function WritingFeedbackPage() {
  const user = await getAuthContext();
  if (!user) return null;
  const [goal, allowance, history] = await Promise.all([getActiveGoal(user.id), getWritingAllowance(user), listWritingFeedback(user.id)]);
  const defaultKind = (goal?.examType.code && DEFAULT_KIND[goal.examType.code]) || "IELTS_TASK2";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Yapay zekâ destekli</p>
      <h1 className="page-title">Yazma ve Çeviri Geri Bildirimi</h1>
      <p className="page-copy">
        IELTS, TOEFL veya PTE yazma cevabını ya da YDS/YÖKDİL çeviri denemeni yapıştır. Tahmini puanını, kriter kriter yorumları, hatalarının düzeltilmiş hâlini ve Türkçe açıklamalarını saniyeler içinde gör.
      </p>
      <p className="mt-3 text-xs leading-5 text-[color:var(--muted)]">
        Puanlar yapay zekâ tarafından verilen tahminlerdir; resmî sınav sonucu değildir. Metnin yalnızca değerlendirme için kullanılır ve hesabında saklanır.
      </p>

      {writingFeedbackConfigured() ? (
        <WritingFeedbackForm defaultKind={defaultKind} remaining={allowance.remaining} unlimited={allowance.unlimited} />
      ) : (
        <div className="learning-empty mt-6">
          <p className="font-bold">Yazma geri bildirimi şu anda kullanılamıyor.</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--muted)]">Kısa süre içinde yeniden açılacak.</p>
        </div>
      )}

      {!allowance.unlimited ? (
        <p className="mt-3 text-sm text-[color:var(--muted)]">
          Aylık hakkın: {allowance.limit} değerlendirme. Daha fazlası için{" "}
          <Link href="/planlar" className="font-bold text-[color:var(--accent-strong)] underline">planlara göz at</Link>.
        </p>
      ) : null}

      <section className="mt-10">
        <h2 className="section-title">Geçmiş değerlendirmelerin</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-[color:var(--muted)]">Henüz bir değerlendirme yok. İlk cevabını yukarıdan gönder.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {history.map((h) => {
              const kind = isWritingKind(h.kind) ? WRITING_FEEDBACK_KINDS[h.kind] : null;
              const score = h.status === "DONE" && h.result && typeof h.result === "object" && "overallScore" in h.result ? (h.result as { overallScore: number }).overallScore : null;
              return (
                <li key={h.id}>
                  <Link href={`/dashboard/yazma-geri-bildirim/${h.id}`} className="dashboard-panel flex items-center gap-4 !p-4 transition hover:border-[color:var(--accent)]">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[color:var(--brand-soft)] text-[color:var(--accent-strong)]"><PenLine size={18} aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{kind?.name ?? h.kind}</span>
                      <span className="block truncate text-sm text-[color:var(--muted)]">{h.answer.slice(0, 90)}</span>
                    </span>
                    <span className="shrink-0 text-right text-sm">
                      {score !== null ? <span className="block text-lg font-extrabold text-[color:var(--accent-strong)]">{score}</span> : <span className="block font-bold text-[color:var(--muted)]">{h.status === "FAILED" ? "Tamamlanamadı" : "Bekliyor"}</span>}
                      <span className="block text-xs text-[color:var(--muted)]">{h.createdAt.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</span>
                    </span>
                    <ChevronRight size={18} className="shrink-0 text-[color:var(--muted)]" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
