"use client";

import { useState } from "react";
import { INTEREST_EXAMS, MAX_EXAM_INTERESTS, type InterestCode } from "@/lib/exam-interests";

/** Optional "which exams?" step on the sign-up form; the same choice can be changed later in Sınavlarım. */
export function RegisterExamPicker() {
  const [picked, setPicked] = useState<InterestCode[]>([]);
  const full = picked.length >= MAX_EXAM_INTERESTS;
  return (
    <fieldset>
      <legend className="label">Hangi sınavlara hazırlanıyorsun? <span className="font-normal text-[color:var(--muted)]">(en fazla {MAX_EXAM_INTERESTS}, isteğe bağlı)</span></legend>
      <div className="mt-1 flex flex-wrap gap-2">
        {INTEREST_EXAMS.map((e) => {
          const on = picked.includes(e.code);
          const disabled = !on && full;
          return (
            <label
              key={e.code}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                on ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white" : "border-[color:var(--border)]"
              } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
            >
              <input
                type="checkbox"
                name={`exam-${e.code}`}
                checked={on}
                disabled={disabled}
                onChange={(ev) => setPicked((p) => (ev.target.checked ? [...p, e.code] : p.filter((c) => c !== e.code)))}
                className="sr-only"
              />
              {e.label}
            </label>
          );
        })}
      </div>
      <p className="mt-1 text-xs text-[color:var(--muted)]">Seçtiğin sınavların geri sayımını görürsün ve içerikler bu sınavlara göre listelenir.</p>
    </fieldset>
  );
}
