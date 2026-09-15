import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LEGAL_DOCS } from "@/content/legal-terms";

type Props = { params: Promise<{ doc: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { doc } = await params;
  return { title: LEGAL_DOCS[doc]?.title ?? "Belge Bulunamadı" };
}

export default async function LegalDocPage({ params }: Props) {
  const { doc } = await params;
  const entry = LEGAL_DOCS[doc];
  if (!entry) notFound();

  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-14 sm:px-6 lg:px-8">
      <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-bold text-[color:var(--accent-strong)]">TASLAK</span>
      <h1 className="page-title">{entry.title}</h1>
      <p className="mt-6 text-base leading-7 text-slate-600">{entry.body}</p>
    </main>
  );
}
