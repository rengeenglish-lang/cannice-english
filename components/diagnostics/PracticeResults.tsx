import Link from "next/link";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { startPracticeAction } from "@/app/actions/diagnostic-attempt";

const LETTERS = ["A", "B", "C", "D"];

type Item = {
  question: { id: string; questionType: string; prompt: string; options: unknown; correctAnswer: string | null; explanation: string | null };
  response: { answerRaw: string | null; isCorrect: boolean | null; gradingStatus: string | null; teacherFeedback: string | null; score: unknown } | null;
};

export function PracticeResults({
  topicName,
  topicId,
  items,
  total,
  correct,
  incorrect,
  pendingReview,
  unanswered,
  percentage,
}: {
  topicName: string | null;
  topicId: string | null;
  items: Item[];
  total: number;
  correct: number;
  incorrect: number;
  pendingReview: number;
  unanswered: number;
  percentage: number;
}) {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <p className="eyebrow">Pratik Sonucu</p>
        <h1 className="page-title">{topicName ?? "Karma Sorular"}</h1>
      </header>

      <section className="dashboard-panel">
        <div className={`grid grid-cols-2 gap-4 ${pendingReview > 0 ? "sm:grid-cols-6" : "sm:grid-cols-5"}`}>
          <div className="text-center">
            <p className="text-2xl font-black text-[color:var(--success)]">{correct}</p>
            <p className="text-xs font-bold text-[color:var(--muted)]">Doğru</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[color:var(--danger)]">{incorrect}</p>
            <p className="text-xs font-bold text-[color:var(--muted)]">Yanlış</p>
          </div>
          {pendingReview > 0 ? (
            <div className="text-center">
              <p className="text-2xl font-black text-[color:var(--accent-strong)]">{pendingReview}</p>
              <p className="text-xs font-bold text-[color:var(--muted)]">İnceleniyor</p>
            </div>
          ) : null}
          <div className="text-center">
            <p className="text-2xl font-black text-[color:var(--muted)]">{unanswered}</p>
            <p className="text-xs font-bold text-[color:var(--muted)]">Boş</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[color:var(--foreground)]">{total}</p>
            <p className="text-xs font-bold text-[color:var(--muted)]">Toplam</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[color:var(--brand)]">%{percentage}</p>
            <p className="text-xs font-bold text-[color:var(--muted)]">Başarı</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-title !text-lg">Soru İncelemesi</h2>
        {items.map(({ question, response }, index) => {
          const isFreeResponse = question.questionType === "WRITING_TASK";
          const options = Array.isArray(question.options) ? (question.options as string[]) : [];
          const correctIdx = question.correctAnswer !== null ? Number(question.correctAnswer) : null;
          const chosenIdx = response?.answerRaw !== null && response?.answerRaw !== undefined ? Number(response.answerRaw) : null;
          return (
            <div key={question.id} className="dashboard-panel">
              <div className="mb-3 flex items-center gap-2">
                {response?.isCorrect === true ? (
                  <CheckCircle2 size={18} className="text-[color:var(--success)]" aria-hidden="true" />
                ) : response?.isCorrect === false ? (
                  <XCircle size={18} className="text-[color:var(--danger)]" aria-hidden="true" />
                ) : (
                  <MinusCircle size={18} className="text-[color:var(--muted)]" aria-hidden="true" />
                )}
                <span className="text-xs font-bold text-[color:var(--muted)]">Soru {index + 1}</span>
              </div>
              <p className="font-bold text-[color:var(--foreground)]">{question.prompt}</p>
              {isFreeResponse ? (
                <div className="mt-3 space-y-3">
                  <div className="rounded-lg bg-[color:var(--brand-soft)] px-3 py-2 text-sm text-[color:var(--foreground)]">
                    <p className="mb-1 text-xs font-bold uppercase text-[color:var(--muted)]">Cevabınız</p>
                    <p className="whitespace-pre-wrap">{response?.answerRaw || "(Cevap verilmedi)"}</p>
                  </div>
                  {response?.gradingStatus === "PENDING" ? (
                    <p className="text-sm font-semibold text-[color:var(--accent-strong)]">Bu soru öğretmen tarafından inceleniyor.</p>
                  ) : response?.gradingStatus === "REVIEWED" ? (
                    <div className="rounded-lg bg-[color:var(--success-soft)] px-3 py-2 text-sm text-[color:var(--foreground)]">
                      <p className="mb-1 text-xs font-bold uppercase text-[color:var(--success)]">
                        Öğretmen Değerlendirmesi{response?.score !== null && response?.score !== undefined ? ` · Puan: ${response.score}` : ""}
                      </p>
                      <p className="whitespace-pre-wrap">{response?.teacherFeedback}</p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <ul className="mt-3 space-y-1.5 text-sm">
                  {options.map((option, i) => (
                    <li
                      key={i}
                      className={`rounded-lg px-3 py-2 ${i === correctIdx ? "bg-[color:var(--success-soft)] font-bold text-[color:var(--success)]" : i === chosenIdx ? "bg-[color:var(--danger-soft)] text-[color:var(--danger)]" : "text-[color:var(--muted)]"}`}
                    >
                      {LETTERS[i]}) {option}
                    </li>
                  ))}
                </ul>
              )}
              {question.explanation ? <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{question.explanation}</p> : null}
            </div>
          );
        })}
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <form action={startPracticeAction.bind(null, topicId)}>
          <button type="submit" className="primary-button">Tekrar Pratik Yap</button>
        </form>
        <Link href="/dashboard/practice" className="ghost-button">Pratik Sorulara Dön</Link>
      </div>
    </div>
  );
}
