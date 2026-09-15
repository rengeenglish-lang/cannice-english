import Link from "next/link";
import type { Metadata } from "next";
import { listExamTypes } from "@/server/services/catalog.service";

export const metadata: Metadata = { title: "İngilizce Sınavlar" };

export default async function ExamsIndexPage() {
  const exams = await listExamTypes();
  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">İngilizce Sınavlar</p>
      <h1 className="page-title">Hangi sınava hazırlanıyorsunuz?</h1>
      <p className="page-copy">Her sınav için özel hazırlanmış paketler, ücretsiz kaynaklar ve puan hesaplama araçlarına göz atın.</p>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <Link key={exam.id} href={`/exams/${exam.slug}`} className="panel transition hover:-translate-y-1">
            <h2 className="text-xl font-black text-[color:var(--foreground)]">{exam.name}</h2>
            {exam.shortDescription ? <p className="mt-2 text-sm leading-6 text-slate-600">{exam.shortDescription}</p> : null}
            <span className="mt-4 inline-block text-sm font-bold text-[color:var(--accent-strong)]">Paketleri Gör →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
