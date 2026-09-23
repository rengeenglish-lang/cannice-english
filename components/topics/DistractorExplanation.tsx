import { Lightbulb } from "lucide-react";
import type { ParsedOption } from "@/components/topics/parseExampleBlock";

export function DistractorExplanation({ notes }: { notes: ParsedOption[] }) {
  return (
    <div className="mt-4 rounded-2xl border border-[color:var(--warning)]/30 bg-[color:var(--warning)]/10 p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[color:var(--warning)] text-white shadow-[0_8px_18px_rgba(224,138,31,.3)]">
          <Lightbulb className="size-5" />
        </span>
        <p className="text-sm font-black uppercase tracking-wide text-[color:var(--warning)]">
          Diğer Seçeneklerin Anlamları
        </p>
      </div>
      <ul className="mt-4 space-y-2">
        {notes.map((note) => (
          <li key={note.letter} className="text-base font-semibold leading-7 text-slate-900">
            <span className="font-extrabold text-[color:var(--warning)]">{note.letter})</span> {note.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
