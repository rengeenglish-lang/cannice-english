import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedLegalContent } from "@/server/services/legal-content.service";

type Props = { params: Promise<{ doc: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { doc } = await params;
  const { documents } = await getPublishedLegalContent();
  return { title: documents[doc]?.title ?? "Belge Bulunamadı" };
}

export default async function LegalDocPage({ params }: Props) {
  const { doc } = await params;
  const { documents } = await getPublishedLegalContent();
  const entry = documents[doc];
  if (!entry) notFound();

  return (
    <main className="inner-page mx-auto w-full max-w-[760px] px-4 py-14 sm:px-6 lg:px-8">
      {entry.draft !== false ? (
        <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-bold text-[color:var(--accent-strong)]">
          TASLAK
        </span>
      ) : null}
      <h1 className="page-title">{entry.title}</h1>
      {entry.updatedAt ? <p className="mt-2 text-sm text-slate-500">Son güncelleme: {entry.updatedAt}</p> : null}
      <p className="mt-6 text-base leading-7 text-slate-600">{entry.body}</p>
      {entry.sections?.map((section) => (
        <section key={section.heading} id={section.id} className="mt-8 scroll-mt-28 rounded-xl target:ring-2 target:ring-[color:var(--brand)] target:ring-offset-4">
          <h2 className="text-xl font-extrabold text-slate-900">{section.heading}</h2>
          {section.paragraphs.map((paragraph, i) => (
            <p key={i} className="mt-3 text-base leading-7 text-slate-600">{paragraph}</p>
          ))}
        </section>
      ))}
    </main>
  );
}
