import { Target } from "lucide-react";

export function MotivationCard({ quote }: { quote: string }) {
  return (
    <div className="relative isolate overflow-hidden rounded-2xl border-2 border-blue-300 bg-gradient-to-b from-blue-100 to-blue-50 p-5 text-center shadow-[0_1px_2px_rgba(15,23,42,.04),0_10px_24px_rgba(15,23,42,.06)]">
      <Target className="mx-auto size-7 text-blue-600" />
      <p className="mt-3 text-base italic leading-7 text-slate-800">&ldquo;{quote}&rdquo;</p>
      <p className="mt-2 text-sm font-extrabold text-blue-700">— Can Nice</p>
    </div>
  );
}
