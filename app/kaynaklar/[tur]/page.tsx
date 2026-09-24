import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { RESOURCE_EXAMS, RESOURCE_TYPES } from "@/server/services/resources.service";

type Props = { params: Promise<{ tur: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tur } = await params;
  return { title: RESOURCE_TYPES.find((t) => t.slug === tur)?.label ?? "Kaynaklar" };
}

export default async function ResourceTypePage({ params }: Props) {
  const { tur } = await params;
  const type = RESOURCE_TYPES.find((t) => t.slug === tur);
  if (!type) notFound();
  return (
    <main className="inner-page mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <Link href="/kaynaklar" className="ghost-button mb-4 -ml-4">← Kaynaklar</Link>
      <PageHero>
        <p className="eyebrow">{type.label}</p>
        <h1 className="page-title">Hangi sınavın kaynaklarını arıyorsun?</h1>
        <p className="page-copy">{type.description}</p>
      </PageHero>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {RESOURCE_EXAMS.map((exam) => (
          <Link key={exam.slug} href={`/kaynaklar/${type.slug}/${exam.slug}`} className="panel text-lg font-extrabold transition hover:-translate-y-1 hover:border-[color:var(--brand)]">
            {exam.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
