"use client";

import { useMemo, useState } from "react";

type Row = {
  id: string;
  minCorrect: number;
  maxCorrect: number;
  resultLabel: string;
  notes: string | null;
};
type ExamGroup = { id: string; name: string; solid: string; rows: Row[] };

export function ScoreCalculatorForm({ exams }: { exams: ExamGroup[] }) {
  const [examId, setExamId] = useState(exams[0]?.id ?? "");
  const [correct, setCorrect] = useState<string>("");

  const activeExam = exams.find((exam) => exam.id === examId) ?? exams[0];
  const correctNumber = Number(correct);
  const hasValidInput = correct !== "" && !Number.isNaN(correctNumber);

  const matchedRow = useMemo(() => {
    if (!activeExam || !hasValidInput) return null;
    return (
      activeExam.rows.find(
        (row) =>
          correctNumber >= row.minCorrect && correctNumber <= row.maxCorrect,
      ) ?? null
    );
  }, [activeExam, hasValidInput, correctNumber]);

  if (!activeExam) return null;

  return (
    <div className="panel">
      <div className="flex flex-wrap gap-2">
        {exams.map((exam) => (
          <button
            key={exam.id}
            type="button"
            onClick={() => setExamId(exam.id)}
            className={`pill-tab ${exam.id === activeExam.id ? "pill-tab-active" : ""}`}
            style={
              exam.id === activeExam.id
                ? { borderColor: exam.solid, backgroundColor: exam.solid }
                : undefined
            }
          >
            {exam.name}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="sm:flex-1">
          <label className="label" htmlFor="correct-count">
            Doğru Cevap Sayısı (0-100)
          </label>
          <input
            id="correct-count"
            type="number"
            min={0}
            max={100}
            value={correct}
            onChange={(event) => setCorrect(event.target.value)}
            placeholder="Örn. 72"
            className="auth-input"
          />
        </div>
      </div>

      {hasValidInput ? (
        matchedRow ? (
          <div
            className="mt-6 rounded-2xl p-5 text-white"
            style={{ backgroundColor: activeExam.solid }}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-white/70">
              Tahmini Sonucunuz
            </p>
            <p className="mt-1 text-3xl font-extrabold">
              {matchedRow.resultLabel}
            </p>
            {matchedRow.notes ? (
              <p className="mt-1 text-sm text-white/80">{matchedRow.notes}</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-6 text-sm font-semibold text-[color:var(--danger)]">
            Lütfen 0-100 arasında geçerli bir doğru sayısı girin.
          </p>
        )
      ) : null}

      <div
        className="overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label="Tabloyu yatay kaydırın"
      >
        <table className="dashboard-table mt-8">
          <thead>
            <tr>
              <th>Doğru Sayısı</th>
              <th>Tahmini Sonuç</th>
              <th>Not</th>
            </tr>
          </thead>
          <tbody>
            {activeExam.rows.map((row) => (
              <tr
                key={row.id}
                className={
                  matchedRow?.id === row.id
                    ? "bg-[color:var(--accent-soft)]"
                    : undefined
                }
              >
                <td>
                  {row.minCorrect}-{row.maxCorrect}
                </td>
                <td className="font-bold text-[color:var(--foreground)]">
                  {row.resultLabel}
                </td>
                <td className="text-[color:var(--muted)]">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
