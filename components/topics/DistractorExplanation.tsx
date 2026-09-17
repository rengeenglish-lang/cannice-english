import { AlertTriangle } from "lucide-react";
import type { ParsedOption } from "@/components/topics/parseExampleBlock";

export function DistractorExplanation({ notes }: { notes: ParsedOption[] }) {
  return (
    <div className="mt-4 rounded-2xl border-2 border-orange-300 bg-orange-50 p-6">
      <p className="flex items-center gap-2 text-base font-extrabold text-orange-800">
        <AlertTriangle className="size-5 shrink-0" />
        Diğer Seçeneklerin Anlamları
      </p>
      <ul className="mt-3 space-y-2">
        {notes.map((note) => (
          <li key={note.letter} className="text-base text-orange-950">
            <span className="font-extrabold">{note.letter})</span> {note.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
