"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Pencil, Plus, Trash2, XCircle } from "lucide-react";
import { coachingCopy } from "@/lib/coaching/i18n";
import { addMistakeNoteAction, deleteMistakeAction, retryMistakeAction, updateMistakeNoteAction } from "@/app/actions/coaching";

const LETTERS = ["A", "B", "C", "D", "E"];

export function MistakeNoteEditor({ locale, id, note, tags }: { locale: string; id: string; note: string; tags: string[] }) {
  const t = coachingCopy(locale);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ note, tags: tags.join(", ") });
  const [pending, start] = useTransition();
  if (!open) {
    return (
      <div className="flex flex-wrap gap-3 text-xs font-bold">
        <button type="button" className="inline-flex items-center gap-1 text-[color:var(--accent)]" onClick={() => setOpen(true)}><Pencil size={13} aria-hidden="true" /> {note ? t.task.edit : t.notebook.addNote}</button>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-rose-700"
          disabled={pending}
          onClick={() => { if (window.confirm(t.task.deleteConfirm)) start(async () => { await deleteMistakeAction(id); }); }}
        >
          <Trash2 size={13} aria-hidden="true" /> {t.task.delete}
        </button>
      </div>
    );
  }
  return (
    <form className="mt-2 grid gap-2" onSubmit={(e) => { e.preventDefault(); start(async () => { await updateMistakeNoteAction(id, form); setOpen(false); }); }}>
      <label className="text-xs font-bold text-[color:var(--muted)]">{t.notebook.note}<textarea rows={2} maxLength={1000} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="auth-input mt-1" /></label>
      <label className="text-xs font-bold text-[color:var(--muted)]">{t.notebook.tags}<input maxLength={200} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="auth-input mt-1" /></label>
      <div className="flex gap-2">
        <button type="submit" className="secondary-button !min-h-10 !py-2 text-sm" disabled={pending}>{t.save}</button>
        <button type="button" className="ghost-button !min-h-10 !py-2 text-sm" onClick={() => setOpen(false)}>{t.cancel}</button>
      </div>
    </form>
  );
}

export function AddMistakeForm({ locale }: { locale: string }) {
  const t = coachingCopy(locale);
  const [form, setForm] = useState({ note: "", tags: "" });
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await addMistakeNoteAction(form);
          if (res.ok) { setForm({ note: "", tags: "" }); setSaved(true); }
        });
      }}
    >
      <label className="text-xs font-bold text-[color:var(--muted)]">{t.notebook.note}<textarea required rows={3} maxLength={1000} value={form.note} onChange={(e) => { setSaved(false); setForm({ ...form, note: e.target.value }); }} className="auth-input mt-1" /></label>
      <label className="text-xs font-bold text-[color:var(--muted)]">{t.notebook.tags}<input maxLength={200} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="auth-input mt-1" /></label>
      <div className="flex items-center gap-3">
        <button type="submit" className="secondary-button" disabled={pending}><Plus size={16} aria-hidden="true" /> {t.notebook.addManual}</button>
        {saved ? <span role="status" className="text-sm font-semibold text-emerald-700">{t.notebook.saved}</span> : null}
      </div>
    </form>
  );
}

type RetryQuestion = { entryId: string; prompt: string; passageText: string | null; audioUrl: string | null; options: string[]; topic: string; timesWrong: number; streak: number };

/** One notebook retry: answer, see the explanation and the related lesson, then move on. */
export function NotebookRetry({ locale, question, lesson }: { locale: string; question: RetryQuestion; lesson: { href: string; label: string } | null }) {
  const t = coachingCopy(locale);
  const router = useRouter();
  const [answer, setAnswer] = useState<string | null>(null);
  const [result, setResult] = useState<{ correct: boolean; mastered: boolean; correctAnswer: string | null; explanation: string | null } | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="dashboard-panel space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (result) { router.refresh(); return; }
        if (answer === null) return;
        start(async () => { setResult(await retryMistakeAction(question.entryId, answer)); });
      }}
    >
      <p className="text-xs font-bold text-[color:var(--muted)]">{question.topic} · {t.notebook.timesWrong(question.timesWrong)}{question.streak ? ` · ${t.notebook.streak(question.streak)}` : ""}</p>
      {question.passageText ? <details className="rounded-xl bg-slate-50 p-3 text-sm"><summary className="cursor-pointer font-bold">{t.notebook.passage}</summary><p lang="en" className="mt-2 whitespace-pre-wrap leading-6">{question.passageText}</p></details> : null}
      {question.audioUrl ? <audio controls src={question.audioUrl} className="w-full" /> : null}
      <p lang="en" className="whitespace-pre-line text-lg font-bold leading-8">{question.prompt}</p>
      <fieldset className="space-y-2" disabled={Boolean(result)}>
        <legend className="sr-only">{t.notebook.yourAnswer}</legend>
        {question.options.map((option, i) => {
          const isCorrect = result && result.correctAnswer === String(i);
          const isWrongPick = result && !result.correct && answer === String(i);
          return (
            <label key={i} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border p-3 text-sm font-semibold ${isCorrect ? "border-emerald-400 bg-emerald-50" : isWrongPick ? "border-rose-400 bg-rose-50" : "border-[color:var(--border)] hover:border-[color:var(--accent)]"}`}>
              <input type="radio" name="answer" value={String(i)} checked={answer === String(i)} onChange={() => setAnswer(String(i))} className="size-4" />
              <span className="grid size-7 shrink-0 place-items-center rounded-full border text-xs font-extrabold">{LETTERS[i]}</span>
              <span lang="en">{option}</span>
            </label>
          );
        })}
      </fieldset>
      {result ? (
        <div role="status" className={`rounded-2xl p-4 text-sm ${result.correct ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"}`}>
          <p className="flex items-center gap-2 font-bold">
            {result.correct ? <CheckCircle2 size={18} aria-hidden="true" /> : <XCircle size={18} aria-hidden="true" />}
            {result.mastered ? t.notebook.masteredNow : result.correct ? t.notebook.correct : t.notebook.wrong}
          </p>
          {result.explanation ? <p className="mt-2 whitespace-pre-wrap leading-6 text-[color:var(--foreground)]">{result.explanation}</p> : null}
          {lesson ? <Link href={lesson.href} className="mt-3 inline-block font-bold underline">{t.notebook.lesson}: {lesson.label}</Link> : null}
        </div>
      ) : null}
      <button type="submit" className="primary-button" disabled={pending || (!result && answer === null)}>{result ? t.notebook.next : t.notebook.submit}</button>
    </form>
  );
}
