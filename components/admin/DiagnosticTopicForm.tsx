"use client";

import { useActionState } from "react";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

const initialState: AdminFormState = { status: "idle" };

const KIND_OPTIONS = [
  { value: "SKILL", label: "Beceri (Skill)" },
  { value: "SUBSKILL", label: "Alt Beceri (Subskill)" },
  { value: "TOPIC", label: "Konu (Topic)" },
];

const FAMILY_OPTIONS = [
  { value: "ACADEMIC_SKILLS", label: "Akademik Beceriler (IELTS/TOEFL/PTE)" },
  { value: "TRANSLATION_GRAMMAR", label: "Çeviri & Dil Bilgisi (YDS/YÖKDİL)" },
];

type Topic = {
  slug: string;
  name: string;
  kind: string;
  examFamilies: string[];
  parent: { slug: string } | null;
  importanceWeight: number;
  estimatedMinutes: number | null;
  description: string | null;
  displayOrder: number;
  dependsOn: { dependsOnTopic: { slug: string } }[];
} | null;

export function DiagnosticTopicForm({
  topic,
  action,
}: {
  topic: Topic;
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="dashboard-panel space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Konu Adı</label>
          <input id="name" name="name" required defaultValue={topic?.name} className="auth-input" />
        </div>
        <div>
          <label className="label" htmlFor="slug">Slug</label>
          <input id="slug" name="slug" required defaultValue={topic?.slug} placeholder="edilgen-cati" className="auth-input" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="kind">Tür</label>
          <select id="kind" name="kind" defaultValue={topic?.kind ?? "TOPIC"} className="auth-input">
            {KIND_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="parentSlug">Üst Konu (opsiyonel, slug)</label>
          <input id="parentSlug" name="parentSlug" defaultValue={topic?.parent?.slug ?? ""} placeholder="dil-bilgisi" className="auth-input" />
        </div>
        <div>
          <label className="label" htmlFor="importanceWeight">Önem Ağırlığı (1-5)</label>
          <input id="importanceWeight" name="importanceWeight" type="number" min={1} max={5} defaultValue={topic?.importanceWeight ?? 1} className="auth-input" />
        </div>
      </div>

      <fieldset>
        <legend className="label">Sınav Ailesi</legend>
        <div className="mt-2 flex flex-wrap gap-4">
          {FAMILY_OPTIONS.map((o) => (
            <label key={o.value} className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" name="examFamilies" value={o.value} defaultChecked={topic?.examFamilies?.includes(o.value) ?? o.value === "TRANSLATION_GRAMMAR"} className="size-4" />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="label" htmlFor="description">Açıklama (öğrenciye gösterilir)</label>
        <textarea id="description" name="description" rows={3} defaultValue={topic?.description ?? ""} className="auth-input" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="estimatedMinutes">Tahmini Çalışma Süresi (dk)</label>
          <input id="estimatedMinutes" name="estimatedMinutes" type="number" min={0} defaultValue={topic?.estimatedMinutes ?? ""} className="auth-input" />
        </div>
        <div>
          <label className="label" htmlFor="displayOrder">Sıralama</label>
          <input id="displayOrder" name="displayOrder" type="number" defaultValue={topic?.displayOrder ?? 0} className="auth-input" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="dependsOnSlugs">Ön Koşul Konular (slug, virgülle ayırın)</label>
        <input
          id="dependsOnSlugs"
          name="dependsOnSlugs"
          defaultValue={topic?.dependsOn?.map((d) => d.dependsOnTopic.slug).join(", ") ?? ""}
          placeholder="zamanlar"
          className="auth-input"
        />
        <p className="mt-1 text-xs text-[color:var(--muted)]">Öğrenci bu konuları önce tamamlamalı.</p>
      </div>

      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      {state.status === "idle" && state.message ? <p className="text-sm font-semibold text-[color:var(--success)]">{state.message}</p> : null}

      <button type="submit" disabled={pending} className="primary-button">{pending ? "Kaydediliyor…" : "Konuyu Kaydet"}</button>
    </form>
  );
}
