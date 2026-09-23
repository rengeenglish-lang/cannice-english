import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, PlusCircle, RotateCcw } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "Seviye Tespit" };

const ACTIONS = [
  { href: "/seviye-tespit/tekrar", title: "Tekrar Çöz", copy: "Daha önce çözdüğün bir seviye tespit sınavını aynı sorularla yeniden çöz ve gelişimini gör.", icon: RotateCcw },
  { href: "/seviye-tespit/yeni", title: "Yeni Test", copy: "IELTS / TOEFL / PTE (CEFR seviyesiyle) veya YDS & YÖKDİL için yeni bir seviye tespit sınavına başla.", icon: PlusCircle },
  { href: "/seviye-tespit/sonuclar", title: "Sonuçlar ve Analiz", copy: "Tüm seviye tespit sonuçlarını, konu bazlı güçlü ve zayıf yönlerini incele.", icon: BarChart3 },
] as const;

export default async function SeviyeTespitHubPage() {
  const user = await getAuthContext();
  if (!user) return null;
  const [inProgress, completedCount] = await Promise.all([
    db.diagnosticAttempt.findFirst({
      where: { userId: user.id, kind: "FULL_DIAGNOSTIC", status: "IN_PROGRESS" },
      include: { examType: true },
      orderBy: { startedAt: "desc" },
    }),
    db.diagnosticAttempt.count({ where: { userId: user.id, kind: "FULL_DIAGNOSTIC", status: "COMPLETED" } }),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Seviye Tespit</p>
      <h1 className="page-title">Seviyeni ölç, eksiklerini gör.</h1>
      <p className="page-copy">Seviye tespit sınavları ücretsizdir ve gerçek bir puan yerine eksiklerini bulmak için tasarlanmıştır.</p>

      {inProgress ? (
        <div className="dashboard-panel mt-6 flex flex-wrap items-center justify-between gap-3 border-2 border-[color:var(--brand)]">
          <p className="text-sm font-bold">Yarım kalan bir {inProgress.examType.name} seviye tespit sınavın var.</p>
          <Link href={`/dashboard/sinav/${inProgress.id}`} className="primary-button text-xs">Kaldığın Yerden Devam Et</Link>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {ACTIONS.map(({ href, title, copy, icon: Icon }) => (
          <Link key={href} href={href} className="dashboard-panel flex flex-col gap-3 transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]">
            <span className="grid size-12 place-items-center rounded-2xl bg-[color:var(--brand-soft)] text-[color:var(--accent-strong)]">
              <Icon size={22} aria-hidden="true" />
            </span>
            <span className="text-lg font-extrabold">{title}</span>
            <span className="text-sm leading-6 text-[color:var(--muted)]">{copy}</span>
            {href === "/seviye-tespit/tekrar" || href === "/seviye-tespit/sonuclar" ? (
              <span className="mt-auto text-xs font-bold text-[color:var(--accent-strong)]">{completedCount} tamamlanmış sınav</span>
            ) : null}
          </Link>
        ))}
      </div>
    </main>
  );
}
