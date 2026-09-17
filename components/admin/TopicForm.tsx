"use client";

import { useActionState } from "react";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

const initialState: AdminFormState = { status: "idle" };

const CATEGORY_OPTIONS = [
  { value: "", label: "— (kategori yok, ör. YDS/YÖKDİL)" },
  { value: "SPEAKING", label: "Konuşma" },
  { value: "WRITING", label: "Yazma" },
  { value: "READING", label: "Okuma" },
  { value: "LISTENING", label: "Dinleme" },
];

const DIFFICULTY_OPTIONS = [
  { value: "", label: "— (belirtilmemiş)" },
  { value: "Kolay", label: "Kolay" },
  { value: "Orta", label: "Orta" },
  { value: "Zor", label: "Zor" },
];

type Topic = {
  name: string;
  slug: string;
  description: string | null;
  questionCount: number | null;
  category: string | null;
  skillsTested: string | null;
  difficulty: string | null;
  displayOrder: number;
} | null;

export function TopicForm({
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
          <label className="label" htmlFor="slug">Slug (URL)</label>
          <input id="slug" name="slug" required defaultValue={topic?.slug} placeholder="ornek-konu-adi" className="auth-input" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="description">Açıklama / Hazırlık İpucu</label>
        <textarea id="description" name="description" rows={5} defaultValue={topic?.description ?? ""} className="auth-input" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="questionCount">Sınavda Soru Sayısı</label>
          <input id="questionCount" name="questionCount" type="number" min={0} defaultValue={topic?.questionCount ?? ""} className="auth-input" />
        </div>
        <div>
          <label className="label" htmlFor="category">Beceri Kategorisi</label>
          <select id="category" name="category" defaultValue={topic?.category ?? ""} className="auth-input">
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="difficulty">Zorluk</label>
          <select id="difficulty" name="difficulty" defaultValue={topic?.difficulty ?? ""} className="auth-input">
            {DIFFICULTY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="skillsTested">Ölçülen Beceriler (virgülle ayırın)</label>
          <input id="skillsTested" name="skillsTested" defaultValue={topic?.skillsTested ?? ""} placeholder="Telaffuz, Akıcılık" className="auth-input" />
        </div>
        <div>
          <label className="label" htmlFor="displayOrder">Sıralama</label>
          <input id="displayOrder" name="displayOrder" type="number" defaultValue={topic?.displayOrder ?? 0} className="auth-input" />
        </div>
      </div>

      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      {state.status === "idle" && state.message ? <p className="text-sm font-semibold text-[color:var(--success)]">{state.message}</p> : null}

      <button type="submit" disabled={pending} className="primary-button">{pending ? "Kaydediliyor…" : "Konuyu Kaydet"}</button>
    </form>
  );
}
