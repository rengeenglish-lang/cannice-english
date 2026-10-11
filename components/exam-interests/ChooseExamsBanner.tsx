"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hourglass } from "lucide-react";

/** Dashboard nudge for learners who haven't picked their exams yet (hidden on the picker itself). */
export function ChooseExamsBanner() {
  if (usePathname() === "/dashboard/sinavlarim") return null;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[color:var(--brand)]/30 bg-[color:var(--brand)]/5 p-4 text-sm">
      <Hourglass size={18} aria-hidden="true" className="text-[color:var(--brand)]" />
      <p className="flex-1">
        <strong>Hangi sınava hazırlanıyorsun?</strong> En fazla 2 sınav seç; sınav geri sayımın görünsün ve içerikler sınavına göre listelensin.
      </p>
      <Link href="/dashboard/sinavlarim" className="primary-button text-sm">Sınavlarımı seç</Link>
    </div>
  );
}
