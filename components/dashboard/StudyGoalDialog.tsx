"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Target } from "lucide-react";
import { createStudyGoalAction, type StudyGoalItemInput } from "@/app/actions/study-goals";
import { PERIOD_LABEL, type StudyGoalPeriodKind } from "@/lib/study-goal-periods";

type Topic = { id: string; name: string };

const PERIODS: StudyGoalPeriodKind[] = ["DAY", "WEEK", "MONTH"];

function describeItem(item: StudyGoalItemInput, topics: Topic[]) {
  if (item.kind === "TOPIC") return topics.find((t) => t.id === item.examTopicId)?.name ?? "Konu";
  if (item.kind === "PRACTICE") return `${item.quantity} pratik soru seti`;
  if (item.kind === "MOCK_EXAM") return `${item.quantity} deneme`;
  return item.label;
}

export function StudyGoalDialog({ topics, triggerLabel = "Bugünkü hedeflerini belirle", defaultPeriod = "DAY", triggerClassName }: { topics: Topic[]; triggerLabel?: string; defaultPeriod?: StudyGoalPeriodKind; triggerClassName?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [period, setPeriod] = useState<StudyGoalPeriodKind>(defaultPeriod);
  const [items, setItems] = useState<StudyGoalItemInput[]>([]);
  const [topicId, setTopicId] = useState(topics[0]?.id ?? "");
  const [practiceQty, setPracticeQty] = useState(1);
  const [mockQty, setMockQty] = useState(1);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const close = () => dialog.current?.close();
  const reset = () => {
    setPeriod(defaultPeriod);
    setItems([]);
    setCustom("");
    setError(null);
  };

  const addItem = (item: StudyGoalItemInput) => setItems((prev) => [...prev, item]);
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const submit = () => {
    if (!items.length) {
      setError("En az bir hedef eklemelisin.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createStudyGoalAction(period, items);
      if (result.status === "error") {
        setError(result.message ?? "Hedef kaydedilemedi.");
        return;
      }
      close();
      reset();
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { reset(); dialog.current?.showModal(); }}
        className={triggerClassName ?? "flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left text-[#071b34] transition hover:bg-blue-50"}
      >
        <Target className="text-[color:var(--accent)]" />
        <div>
          <p className="text-sm font-black">{triggerLabel}</p>
          <p className="text-xs text-slate-500">Konu, pratik veya deneme seç ya da kendi hedefini yaz</p>
        </div>
      </button>

      <dialog
        ref={dialog}
        aria-label="Çalışma hedefi belirle"
        onClose={reset}
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        className="m-auto w-[min(560px,92vw)] rounded-3xl border-0 p-0 text-[color:var(--foreground)] shadow-2xl backdrop:bg-black/50"
      >
        <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Çalışma hedefi</p>
              <h2 className="mt-1 text-xl font-black">Hedeflerini belirle</h2>
            </div>
            <button type="button" onClick={close} aria-label="Kapat" className="grid size-9 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-100"><X size={18} /></button>
          </div>

          <div className="mt-5 flex gap-2">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${period === p ? "bg-[color:var(--brand)] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {PERIOD_LABEL[p]}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {topics.length ? (
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="label" htmlFor="study-goal-topic">Konu seç</label>
                  <select id="study-goal-topic" className="auth-input" value={topicId} onChange={(e) => setTopicId(e.target.value)}>
                    {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <button type="button" onClick={() => topicId && addItem({ kind: "TOPIC", examTopicId: topicId })} className="secondary-button shrink-0"><Plus size={16} /> Ekle</button>
              </div>
            ) : null}

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="label" htmlFor="study-goal-practice">Pratik soru seti</label>
                <input id="study-goal-practice" type="number" min={1} max={50} className="auth-input" value={practiceQty} onChange={(e) => setPracticeQty(Number(e.target.value) || 1)} />
              </div>
              <button type="button" onClick={() => addItem({ kind: "PRACTICE", quantity: practiceQty })} className="secondary-button shrink-0"><Plus size={16} /> Ekle</button>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="label" htmlFor="study-goal-mock">Deneme sayısı</label>
                <input id="study-goal-mock" type="number" min={1} max={20} className="auth-input" value={mockQty} onChange={(e) => setMockQty(Number(e.target.value) || 1)} />
              </div>
              <button type="button" onClick={() => addItem({ kind: "MOCK_EXAM", quantity: mockQty })} className="secondary-button shrink-0"><Plus size={16} /> Ekle</button>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="label" htmlFor="study-goal-custom">Kendi hedefini yaz</label>
                <input id="study-goal-custom" placeholder="örn. Writing task 2 çalış" className="auth-input" value={custom} onChange={(e) => setCustom(e.target.value)} />
              </div>
              <button
                type="button"
                onClick={() => { if (custom.trim()) { addItem({ kind: "CUSTOM", label: custom.trim() }); setCustom(""); } }}
                className="secondary-button shrink-0"
              >
                <Plus size={16} /> Ekle
              </button>
            </div>
          </div>

          {items.length ? (
            <ul className="mt-6 space-y-2">
              {items.map((item, index) => (
                <li key={index} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-bold">
                  {describeItem(item, topics)}
                  <button type="button" onClick={() => removeItem(index)} aria-label="Kaldır" className="text-slate-400 hover:text-[color:var(--danger)]"><X size={16} /></button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-[color:var(--muted)]">Henüz hedef eklemedin.</p>
          )}

          {error ? <p className="mt-4 text-sm font-semibold text-[color:var(--danger)]">{error}</p> : null}

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={close} className="ghost-button">Vazgeç</button>
            <button type="button" onClick={submit} disabled={pending} className="primary-button disabled:opacity-50">{pending ? "Kaydediliyor…" : "Hedefi Kaydet"}</button>
          </div>
        </div>
      </dialog>
    </>
  );
}
