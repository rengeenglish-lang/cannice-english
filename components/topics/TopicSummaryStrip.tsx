import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Clock, Gauge, HelpCircle, StickyNote, Target } from "lucide-react";
import { ProgressRing } from "@/components/topics/ProgressRing";

/**
 * What used to be the right sidebar, as one compact strip above the lesson: overall progress,
 * facts about this topic, and the student's notes (opened in place).
 */
export function TopicSummaryStrip({
  percent,
  completedTopicCount,
  totalTopics,
  durationMinutes,
  questionCount,
  skillsTested,
  difficulty,
  isSignedIn,
  note,
  noteStatus,
  onNoteChange,
  onNoteSave,
}: {
  percent: number;
  completedTopicCount: number;
  totalTopics: number;
  durationMinutes: number;
  questionCount: number | null;
  skillsTested: string | null;
  difficulty: string | null;
  isSignedIn: boolean;
  note: string;
  noteStatus: "idle" | "saving" | "saved";
  onNoteChange: (value: string) => void;
  onNoteSave: () => void;
}) {
  const [notesOpen, setNotesOpen] = useState(false);
  const fact = "flex items-center gap-1.5 whitespace-nowrap";
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 text-sm">
        <div className="flex items-center gap-2.5" title="İlerleme Durumum">
          <ProgressRing percent={percent} size={44} compact />
          <span className="leading-tight">
            <span className="block text-[11px] font-bold uppercase tracking-wide text-[color:var(--muted)]">İlerleme</span>
            <span className="font-extrabold text-[color:var(--foreground)]">{completedTopicCount}/{totalTopics}</span>{" "}
            <span className="text-[color:var(--muted)]">konu</span>
          </span>
        </div>
        <span className="hidden h-8 w-px bg-[color:var(--border)] sm:block" aria-hidden="true" />
        <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[color:var(--foreground)]" aria-label="Bu konu hakkında">
          {durationMinutes ? (
            <div className={fact}>
              <dt><Clock size={15} className="text-[color:var(--accent)]" aria-label="Tahmini çalışma süresi" /></dt>
              <dd className="font-semibold">{durationMinutes} dk</dd>
            </div>
          ) : null}
          {questionCount ? (
            <div className={fact}>
              <dt><HelpCircle size={15} className="text-[color:var(--accent)]" aria-label="Sınavda soru sayısı" /></dt>
              <dd className="font-semibold">{questionCount} soru</dd>
            </div>
          ) : null}
          {difficulty ? (
            <div className={fact}>
              <dt><Gauge size={15} className="text-[color:var(--accent)]" aria-label="Zorluk seviyesi" /></dt>
              <dd className="font-semibold">{difficulty}</dd>
            </div>
          ) : null}
          {skillsTested ? (
            <div className="flex min-w-0 items-center gap-1.5">
              <dt><Target size={15} className="shrink-0 text-[color:var(--accent)]" aria-label="Ölçülen beceriler" /></dt>
              <dd className="max-w-[22rem] truncate font-semibold" title={skillsTested}>{skillsTested}</dd>
            </div>
          ) : null}
        </dl>
        <button
          type="button"
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] px-3 py-1 text-sm font-bold text-[color:var(--foreground)] transition hover:border-[color:var(--accent)]"
          aria-expanded={notesOpen}
          aria-controls="topic-notes"
          onClick={() => setNotesOpen((v) => !v)}
        >
          <StickyNote size={15} className="text-pink-500" aria-hidden="true" />
          Notlarım{note.trim() ? <span className="size-1.5 rounded-full bg-pink-500" aria-label="(not var)" /> : null}
          <ChevronDown size={15} className={`transition-transform ${notesOpen ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      </div>
      {notesOpen ? (
        <div id="topic-notes" className="border-t border-[color:var(--border)] px-4 py-3">
          {isSignedIn ? (
            <>
              <label htmlFor="topic-note" className="sr-only">Bu konuyla ilgili notların</label>
              <textarea
                id="topic-note"
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder="Bu konuyla ilgili notlarını buraya yaz…"
                rows={3}
                className="auth-input text-sm"
              />
              <div className="mt-2 flex items-center gap-3">
                <button type="button" onClick={onNoteSave} disabled={noteStatus === "saving"} className="secondary-button !min-h-9 !py-1.5 text-sm">
                  {noteStatus === "saving" ? "Kaydediliyor…" : "Notu Kaydet"}
                </button>
                {noteStatus === "saved" ? <span role="status" className="text-sm font-bold text-emerald-600">Kaydedildi ✓</span> : null}
              </div>
            </>
          ) : (
            <p className="text-sm">
              Not alabilmek için <Link href="/sign-in" className="font-bold text-[color:var(--accent)]">giriş yap</Link>.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
