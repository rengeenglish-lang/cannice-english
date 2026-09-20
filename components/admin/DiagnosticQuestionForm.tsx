"use client";

import { useActionState } from "react";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

const initialState: AdminFormState = { status: "idle" };

const FAMILY_OPTIONS = [
  { value: "TRANSLATION_GRAMMAR", label: "Çeviri & Dil Bilgisi (YDS/YÖKDİL)" },
  { value: "ACADEMIC_SKILLS", label: "Akademik Beceriler (IELTS/TOEFL/PTE)" },
];

const TYPE_OPTIONS = [
  { value: "MCQ", label: "Çoktan Seçmeli" },
  { value: "LISTENING_MCQ", label: "Dinleme (Çoktan Seçmeli)" },
  { value: "CLOZE", label: "Cloze Test" },
  { value: "TRANSLATION_EN_TR", label: "Çeviri: İngilizce → Türkçe" },
  { value: "TRANSLATION_TR_EN", label: "Çeviri: Türkçe → İngilizce" },
  { value: "SENTENCE_COMPLETION", label: "Cümle Tamamlama" },
  { value: "PARAGRAPH_COMPLETION", label: "Paragraf Tamamlama" },
  { value: "READING_COMPREHENSION", label: "Okuduğunu Anlama" },
  { value: "RESTATEMENT", label: "Anlamda En Yakın Cümle" },
];

const DIFFICULTY_OPTIONS = [
  { value: "KOLAY", label: "Kolay" },
  { value: "ORTA", label: "Orta" },
  { value: "ZOR", label: "Zor" },
];

type Question = {
  examFamily: string;
  examTypeId: string | null;
  topic: { slug: string };
  secondaryTopicIds: string[];
  questionType: string;
  difficulty: string;
  prompt: string;
  passageText: string | null;
  audioUrl: string | null;
  options: unknown;
  correctAnswer: string | null;
  explanation: string | null;
  tags: string[];
  isActive: boolean;
} | null;

export function DiagnosticQuestionForm({
  question,
  exams,
  topicSlugById,
  action,
}: {
  question: Question;
  exams: { id: string; name: string }[];
  topicSlugById: Record<string, string>;
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const options = Array.isArray(question?.options) ? (question!.options as string[]) : [];
  const secondarySlugs = (question?.secondaryTopicIds ?? []).map((id) => topicSlugById[id]).filter(Boolean).join(", ");

  return (
    <form action={formAction} className="dashboard-panel space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="examFamily">Sınav Ailesi</label>
          <select id="examFamily" name="examFamily" defaultValue={question?.examFamily ?? "TRANSLATION_GRAMMAR"} className="auth-input">
            {FAMILY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="examTypeId">Sınav (opsiyonel, boş=tüm aile)</label>
          <select id="examTypeId" name="examTypeId" defaultValue={question?.examTypeId ?? ""} className="auth-input">
            <option value="">—</option>
            {exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="difficulty">Zorluk</label>
          <select id="difficulty" name="difficulty" defaultValue={question?.difficulty ?? "ORTA"} className="auth-input">
            {DIFFICULTY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="topicSlug">Ana Konu (slug)</label>
          <input id="topicSlug" name="topicSlug" required defaultValue={question?.topic.slug} placeholder="edilgen-cati" className="auth-input" />
        </div>
        <div>
          <label className="label" htmlFor="secondaryTopicSlugs">İkincil Konular (slug, virgülle)</label>
          <input id="secondaryTopicSlugs" name="secondaryTopicSlugs" defaultValue={secondarySlugs} placeholder="zamanlar" className="auth-input" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="questionType">Soru Türü</label>
        <select id="questionType" name="questionType" defaultValue={question?.questionType ?? "MCQ"} className="auth-input">
          {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="passageText">Okuma Parçası (opsiyonel)</label>
        <textarea id="passageText" name="passageText" rows={3} defaultValue={question?.passageText ?? ""} className="auth-input" />
      </div>

      <div>
        <label className="label" htmlFor="prompt">Soru Metni</label>
        <textarea id="prompt" name="prompt" required rows={3} defaultValue={question?.prompt} className="auth-input" />
      </div>

      <div>
        <label className="label" htmlFor="optionsRaw">Seçenekler (her satıra bir tane, tam 4 satır)</label>
        <textarea id="optionsRaw" name="optionsRaw" required rows={4} defaultValue={options.join("\n")} className="auth-input font-mono text-sm" />
      </div>

      <div>
        <label className="label" htmlFor="correctIndex">Doğru Seçenek</label>
        <select id="correctIndex" name="correctIndex" defaultValue={question?.correctAnswer ?? "0"} className="auth-input">
          <option value="0">A</option>
          <option value="1">B</option>
          <option value="2">C</option>
          <option value="3">D</option>
        </select>
      </div>

      <div>
        <label className="label" htmlFor="explanation">Açıklama</label>
        <textarea id="explanation" name="explanation" rows={3} defaultValue={question?.explanation ?? ""} className="auth-input" />
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-[color:var(--foreground)]">
        <input type="checkbox" name="isActive" defaultChecked={question?.isActive ?? false} className="size-4" /> Aktif (öğrencilere gösterilir)
      </label>

      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      {state.status === "idle" && state.message ? <p className="text-sm font-semibold text-[color:var(--success)]">{state.message}</p> : null}

      <button type="submit" disabled={pending} className="primary-button">{pending ? "Kaydediliyor…" : "Soruyu Kaydet"}</button>
    </form>
  );
}
