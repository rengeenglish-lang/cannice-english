"use client";

import { useActionState, useState } from "react";
import { saveExamInterestsAction, type ExamInterestsState } from "@/app/actions/exam-interests";
import { INTEREST_EXAMS, MAX_EXAM_INTERESTS, type InterestCode } from "@/lib/exam-interests";

type Value = { code: InterestCode; examDate: string | null };

export function ExamInterestsForm({ values, today }: { values: Value[]; today: string }) {
  const [state, action, pending] = useActionState(saveExamInterestsAction, { status: "idle" } as ExamInterestsState);
  const [picked, setPicked] = useState<InterestCode[]>(values.map((v) => v.code));
  const dates = Object.fromEntries(values.map((v) => [v.code, v.examDate ?? ""]));
  const full = picked.length >= MAX_EXAM_INTERESTS;
  const toggle = (code: InterestCode, on: boolean) => setPicked((p) => (on ? [...p, code] : p.filter((c) => c !== code)));

  return (
    <form action={action} className="dashboard-panel space-y-4">
      <div>
        <h2 className="text-lg font-extrabold">Hazırlandığım sınavlar</h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          En fazla {MAX_EXAM_INTERESTS} sınav seç. Sitede bu sınavların geri sayımını görürsün ve konu anlatımları, kaynaklar ve pratikler bu sınavlara göre listelenir.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {INTEREST_EXAMS.map((e) => {
          const on = picked.includes(e.code);
          return (
            <div key={e.code} className={`rounded-xl border p-3 ${on ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5" : "border-[color:var(--border)]"}`}>
              <label className="flex items-center gap-2 text-sm font-bold">
                <input
                  type="checkbox"
                  name={`exam-${e.code}`}
                  checked={on}
                  disabled={!on && full}
                  onChange={(ev) => toggle(e.code, ev.target.checked)}
                  className="size-4"
                />
                {e.label}
              </label>
              {on ? (
                <label className="mt-2 block text-xs text-[color:var(--muted)]">
                  {e.osym ? "Kendi sınav tarihin (isteğe bağlı — boş bırakırsan ÖSYM takvimindeki en yakın sınav)" : "Sınav tarihin (randevu aldığın gün)"}
                  <input type="date" name={`date-${e.code}`} min={today} defaultValue={dates[e.code] ?? ""} className="auth-input mt-1 w-full" />
                </label>
              ) : null}
            </div>
          );
        })}
      </div>
      {full ? <p className="text-xs text-[color:var(--muted)]">İki sınav seçtin. Başka bir sınav eklemek için önce birini kaldır.</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending || !picked.length} className="primary-button text-sm">{pending ? "Kaydediliyor…" : "Kaydet"}</button>
        {state.message ? <p className={`text-sm font-semibold ${state.status === "error" ? "text-[color:var(--danger)]" : "text-emerald-700"}`}>{state.message}</p> : null}
      </div>
    </form>
  );
}
