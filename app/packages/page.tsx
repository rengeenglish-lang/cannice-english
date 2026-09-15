import type { Metadata } from "next";
import { listProducts, listExamTypes } from "@/server/services/catalog.service";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import Link from "next/link";

export const metadata: Metadata = { title: "Online Dersler ve Paketler" };

const CATEGORY_TABS: { value: "PREP_GROUP" | "MOCK_CAMP" | "STUDY_PACKAGE" | "TRANSLATION_SUPPORT" | undefined; label: string }[] = [
  { value: undefined, label: "Tümü" },
  { value: "PREP_GROUP", label: "Hazırlık Grupları" },
  { value: "MOCK_CAMP", label: "Soru & Deneme Grupları" },
  { value: "STUDY_PACKAGE", label: "Çalışma Paketleri" },
  { value: "TRANSLATION_SUPPORT", label: "Akademik Çeviri" },
];

type Props = { searchParams: Promise<{ category?: string; exam?: string }> };

export default async function PackagesPage({ searchParams }: Props) {
  const { category, exam } = await searchParams;
  const exams = await listExamTypes();
  const activeExam = exam ? exams.find((item) => item.slug === exam) : undefined;
  const products = await listProducts({
    category: category as "PREP_GROUP" | "MOCK_CAMP" | "STUDY_PACKAGE" | "TRANSLATION_SUPPORT" | undefined,
    examTypeId: activeExam?.id,
  });

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">Online Dersler</p>
      <h1 className="page-title">Hem sıfırdan başlayanlar hem de puanını artırmak isteyenler için</h1>
      <p className="page-copy">Kategoriye veya sınava göre filtreleyin, size uygun paketi bulun.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORY_TABS.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/packages?category=${tab.value}` : "/packages"}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
              category === tab.value || (!category && !tab.value)
                ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white"
                : "border-[color:var(--border-strong)] bg-white text-slate-600 hover:border-[color:var(--brand)]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/packages" className={`rounded-full px-3 py-1.5 text-xs font-bold ${!exam ? "bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]" : "text-slate-400 hover:text-[color:var(--brand)]"}`}>
          Tüm Sınavlar
        </Link>
        {exams.map((item) => (
          <Link
            key={item.id}
            href={`/packages?exam=${item.slug}${category ? `&category=${category}` : ""}`}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${exam === item.slug ? "bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]" : "text-slate-400 hover:text-[color:var(--brand)]"}`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <ProductGrid products={products} />
      </div>
    </main>
  );
}
