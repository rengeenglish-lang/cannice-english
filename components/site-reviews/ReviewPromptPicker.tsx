"use client";
import { REVIEW_PROMPTS, toggleReviewLine } from "@/lib/review-prompts";

export function ReviewPromptPicker({ value, onChange }: { value: string; onChange: (body: string) => void }) {
  return <details className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--canvas)] p-4" open>
    <summary className="cursor-pointer font-semibold">Yorumunu kolayca oluştur</summary>
    <p className="mt-2 text-xs leading-6 text-[color:var(--muted)]">Yalnızca deneyimini yansıtan seçenekleri işaretle. Seçtiklerin yorumuna eklenir; aşağıdaki metni değiştirebilir veya tamamen kendi yorumunu yazabilirsin. Seçim yapmak yorumu yayınlamaz.</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">{REVIEW_PROMPTS.map(group => <fieldset key={group.category}>
      <legend className="mb-2 text-sm font-semibold">{group.category}</legend>
      <div className="space-y-2">{group.choices.map(choice => {
        const line = `${group.category}: ${choice.text}`;
        const checked = value.split("\n").includes(line);
        return <label key={choice.label} className="flex items-start gap-2 text-sm leading-6" title={choice.text}>
          <input type="checkbox" checked={checked} disabled={!checked && value.length + line.length + 1 > 4000} onChange={event => onChange(toggleReviewLine(value, line, event.target.checked))} className="mt-1 size-4 shrink-0" />{choice.label}
        </label>;
      })}</div>
    </fieldset>)}</div>
  </details>;
}
