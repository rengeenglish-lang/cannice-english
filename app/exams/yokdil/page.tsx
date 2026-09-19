import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/server/db";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import { EXAM_META } from "@/lib/exam-types";

export const metadata: Metadata = { title: "YÖKDİL" };

const BRANCHES = ["YOKDIL_SOSYAL", "YOKDIL_SAGLIK", "YOKDIL_FEN"] as const;

export default async function YokdilHubPage() {
  const branches = await db.examType.findMany({
    where: { code: { in: [...BRANCHES] } },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-[#071b34] text-white"><div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(91,79,224,.45),transparent_38%)]" /><div className="relative mx-auto w-full max-w-[1320px] px-4 py-20 sm:px-6 lg:px-8"><span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-blue-100">Üç alan · Tek hedef</span><h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-.04em] sm:text-6xl">YÖKDİL alanınızı seçin, hazırlığınızı özelleştirin.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Sosyal, Sağlık ve Fen Bilimleri için farklılaşan terminoloji ve metin yapılarıyla yalnızca kendi sınavınıza odaklanın.</p></div></section>
      <section className="mx-auto w-full max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8"><div className="mb-8"><p className="eyebrow">YÖKDİL branşları</p><h2 className="mt-2 text-3xl font-black">Hazırlanacağınız alanı seçin</h2></div><div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {branches.map((branch) => (
          <Link
            key={branch.id}
            href={`/exams/${branch.slug}`}
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(7,27,52,.08)] transition hover:-translate-y-1"
          >
            <span className="grid size-12 place-items-center rounded-2xl text-white" style={{ background: EXAM_META[branch.code].solid }}><BookOpenCheck /></span>
            <h2 className="text-xl font-black text-[color:var(--foreground)]">
              {branch.name}
            </h2>
            {branch.shortDescription ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {branch.shortDescription}
              </p>
            ) : null}
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold" style={{ color: EXAM_META[branch.code].solid }}>
              Sınav sayfasını aç <ArrowRight size={17} className="transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div></section>
    </main>
  );
}
