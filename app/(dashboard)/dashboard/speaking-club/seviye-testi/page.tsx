import type { Metadata } from "next";
import Link from "next/link";
import { getAuthContext } from "@/server/auth/context";
import { PLACEMENT_QUESTIONS } from "@/content/english-placement";
import { submitPlacementAction } from "@/app/actions/speaking-club";
import { CLUB_GROUPS } from "@/lib/speaking-club";

export const metadata: Metadata = { title: "Genel İngilizce Seviye Testi" };

/** 30 questions on one page; only prompts and options reach the browser, grading is server-side. */
export default async function PlacementTestPage() {
  const user = await getAuthContext();
  if (!user) return null;
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <p className="eyebrow">Speaking Club</p>
        <h1 className="page-title">Genel İngilizce Seviye Testi</h1>
        <p className="page-copy">
          Bu test, Speaking Club&apos;da <strong>seninle aynı seviyedeki öğrencilerle aynı gruba</strong> yerleşmen için var.
          Sonucuna göre {CLUB_GROUPS.map((g) => g.name).join(", ")} gruplarından birine katılırsın. Not verilmez, sınav değildir —
          bilmediğin soruyu boş bırakman en doğrusudur. 30 soru, yaklaşık 10 dakika.
        </p>
      </div>
      <form action={submitPlacementAction} className="space-y-4">
        {PLACEMENT_QUESTIONS.map((q, i) => (
          <fieldset key={q.id} className="dashboard-panel">
            <legend className="font-bold">
              {i + 1}. {q.prompt}
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {q.options.map((option, oi) => (
                <label key={oi} className="flex cursor-pointer items-center gap-2 rounded-xl border border-[color:var(--border)] px-3 py-2 text-sm has-[:checked]:border-[color:var(--brand)] has-[:checked]:bg-[color:var(--brand)]/5">
                  <input type="radio" name={`q_${q.id}`} value={oi} className="size-4" />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="primary-button">Testi bitir ve grubumu göster</button>
          <Link href="/dashboard/speaking-club" className="ghost-button">Vazgeç</Link>
        </div>
      </form>
    </div>
  );
}
