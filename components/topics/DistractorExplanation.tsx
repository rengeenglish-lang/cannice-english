import { AlertTriangle } from "lucide-react";
import type { ParsedOption } from "@/components/topics/parseExampleBlock";

export function DistractorExplanation({ notes }: { notes: ParsedOption[] }) {
  return (
    <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-5">
      <p className="flex items-center gap-2 text-sm font-extrabold text-orange-800">
        <AlertTriangle className="size-4 shrink-0" />
        Diğer Seçeneklerin Anlamları
      </p>
      <ul className="mt-3 space-y-1.5">
        {notes.map((note) => (
          <li key={note.letter} className="text-sm text-orange-900">
            <span className="font-bold">{note.letter})</span> {note.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
