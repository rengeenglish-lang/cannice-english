import { PageHero } from "@/components/ui/PageHero";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "YÖKDİL" };

const BRANCHES = ["YOKDIL_SOSYAL", "YOKDIL_SAGLIK", "YOKDIL_FEN"] as const;

export default async function YokdilHubPage() {
  const branches = await db.examType.findMany({
    where: { code: { in: [...BRANCHES] } },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <main className="inner-page mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">YÖKDİL</p>
        <h1 className="page-title">
          Yükseköğretim Kurumları Yabancı Dil Sınavı
        </h1>
        <p className="page-copy">
          YÖKDİL, akademik personel ve lisansüstü eğitim adayları için üç ayrı
          alanda uygulanır. Alanınızı seçerek o alana özel hazırlık paketlerini
          görüntüleyin.
        </p>
      </PageHero>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {branches.map((branch) => (
          <Link
            key={branch.id}
            href={`/exams/${branch.slug}`}
            className="panel transition hover:-translate-y-1"
          >
            <h2 className="text-xl font-black text-[color:var(--foreground)]">
              {branch.name}
            </h2>
            {branch.shortDescription ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {branch.shortDescription}
              </p>
            ) : null}
            <span className="mt-4 inline-block text-sm font-bold text-[color:var(--accent-strong)]">
              Paketleri Gör →
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
