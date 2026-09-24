"use client";
import { useState, useTransition } from "react";
import { Check, Eye, Plus, Trash2, X } from "lucide-react";
import { coachingCopy } from "@/lib/coaching/i18n";
import { addCardAction, deleteCardAction, reviewCardAction } from "@/app/actions/coaching";

type Card = { id: string; term: string; meaning: string; example: string | null; source: string };

/** Flashcards for the cards due now. Answers are saved one by one, so a dropped connection loses nothing. */
export function VocabReview({ locale, cards: initial }: { locale: string; cards: Card[] }) {
  const t = coachingCopy(locale);
  // Snapshot of this session's deck: re-renders after each answer shouldn't reshuffle it.
  const [cards] = useState(initial);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const [pending, start] = useTransition();
  const card = cards[index];

  if (!card) {
    return <p className="rounded-2xl bg-emerald-50 p-5 text-sm font-bold text-emerald-900">{cards.length ? t.vocab.sessionDone(cards.length) : t.vocab.empty}</p>;
  }
  const answer = (knew: boolean) =>
    start(async () => {
      await reviewCardAction(card.id, knew);
      setShown(false);
      setIndex((i) => i + 1);
    });

  return (
    <div className="rounded-3xl border-2 border-[color:var(--brand)] bg-white p-6 text-center" aria-live="polite">
      <p className="text-xs font-bold text-[color:var(--muted)]">{index + 1} / {cards.length}{card.source === "SITE" ? ` · ${t.vocab.siteSource}` : ""}</p>
      <p lang="en" className="mt-4 text-3xl font-extrabold text-[color:var(--foreground)]">{card.term}</p>
      {shown ? (
        <div className="mt-4 space-y-2">
          <p className="text-lg font-bold">{card.meaning}</p>
          {card.example ? <p lang="en" className="text-sm italic text-[color:var(--muted)]">{card.example}</p> : null}
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" className="secondary-button" disabled={pending} onClick={() => answer(false)}><X size={16} aria-hidden="true" /> {t.vocab.didnt}</button>
            <button type="button" className="primary-button" disabled={pending} onClick={() => answer(true)}><Check size={16} aria-hidden="true" /> {t.vocab.knew}</button>
          </div>
        </div>
      ) : (
        <button type="button" className="primary-button mt-6" onClick={() => setShown(true)}><Eye size={16} aria-hidden="true" /> {t.vocab.showMeaning}</button>
      )}
    </div>
  );
}

export function AddCardForm({ locale }: { locale: string }) {
  const t = coachingCopy(locale);
  const [form, setForm] = useState({ term: "", meaning: "", example: "" });
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await addCardAction(form);
          if (res.ok) {
            setForm({ term: "", meaning: "", example: "" });
            setSaved(true);
          }
        });
      }}
    >
      <label className="text-xs font-bold text-[color:var(--muted)]">
        {t.vocab.term}
        <input lang="en" required maxLength={80} value={form.term} onChange={(e) => { setSaved(false); setForm({ ...form, term: e.target.value }); }} className="auth-input mt-1" />
      </label>
      <label className="text-xs font-bold text-[color:var(--muted)]">
        {t.vocab.meaning}
        <input required maxLength={200} value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} className="auth-input mt-1" />
      </label>
      <label className="text-xs font-bold text-[color:var(--muted)] sm:col-span-2">
        {t.vocab.example}
        <input lang="en" maxLength={300} value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} className="auth-input mt-1" />
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button type="submit" className="secondary-button" disabled={pending}><Plus size={16} aria-hidden="true" /> {t.vocab.add}</button>
        {saved ? <span role="status" className="text-sm font-semibold text-emerald-700">{t.vocab.added}</span> : null}
      </div>
    </form>
  );
}

export function DeleteCardButton({ locale, id }: { locale: string; id: string }) {
  const t = coachingCopy(locale);
  const [pending, start] = useTransition();
  return (
    <button type="button" className="text-[color:var(--muted)] hover:text-rose-700" aria-label={t.task.delete} disabled={pending} onClick={() => start(async () => { await deleteCardAction(id); })}>
      <Trash2 size={15} aria-hidden="true" />
    </button>
  );
}
