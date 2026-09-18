import Link from "next/link";
import { StickyNote } from "lucide-react";

export function StudentNotesCard({
  isSignedIn,
  value,
  status,
  onChange,
  onSave,
}: {
  isSignedIn: boolean;
  value: string;
  status: "idle" | "saving" | "saved";
  onChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="relative isolate overflow-hidden rounded-2xl border-2 border-pink-300 bg-gradient-to-b from-pink-50 to-white p-5 shadow-[0_1px_2px_rgba(15,23,42,.04),0_10px_24px_rgba(15,23,42,.06)]">
      <p className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
        <StickyNote className="size-6 text-pink-500" />
        Notlarım
      </p>
      {isSignedIn ? (
        <>
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Bu konuyla ilgili notlarınızı buraya yazın..."
            rows={4}
            className="mt-3 block w-full resize-none rounded-xl border-2 border-pink-200 bg-white px-4 py-3 text-lg text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-pink-300 focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onSave}
              disabled={status === "saving"}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-pink-500 px-5 py-2.5 text-base font-bold text-pink-600 transition hover:bg-pink-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "saving" ? "Kaydediliyor…" : "Notu Kaydet"}
            </button>
            {status === "saved" ? (
              <span className="text-base font-bold text-emerald-600">
                Kaydedildi ✓
              </span>
            ) : null}
          </div>
        </>
      ) : (
        <p className="mt-3 text-lg text-slate-700">
          Not alabilmek için{" "}
          <Link
            href="/sign-in"
            className="font-bold text-[color:var(--accent)]"
          >
            giriş yapın
          </Link>
          .
        </p>
      )}
    </div>
  );
}
