import { PageHero } from "@/components/ui/PageHero";
import type { Metadata } from "next";
import { listExamTypes } from "@/server/services/catalog.service";
import { db } from "@/server/db";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { auth } from "@/auth";
import { favoriteProductIds } from "@/server/services/favorites.service";
import type { ProductLevel } from "@/lib/generated/prisma/enums";
import { NextStepCta } from "@/components/marketing/NextStepCta";

export const metadata: Metadata = { title: "Rehberlik Aracı" };

const GOAL_LEVELS: Record<string, ProductLevel[]> = {
  BEGINNER: ["BEGINNER_TO_ADVANCED", "JUNIOR"],
  ADVANCED: ["INTERMEDIATE_ADVANCED", "SENIOR"],
};

function fetchRecommended(examTypeId: string, levels: ProductLevel[]) {
  return db.product.findMany({
    where: { examTypeId, isPublished: true, level: { in: levels } },
    include: { examType: true },
    orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }],
    take: 3,
  });
}

type Props = { searchParams: Promise<{ exam?: string; goal?: string }> };

export default async function GuidancePage({ searchParams }: Props) {
  const favoriteIds = await favoriteProductIds((await auth())?.user?.id);
  const { exam: examId, goal } = await searchParams;
  const exams = await listExamTypes();

  let recommended: Awaited<ReturnType<typeof fetchRecommended>> = [];
  if (examId && goal)
    recommended = await fetchRecommended(examId, GOAL_LEVELS[goal] ?? []);

  return (
    <main className="inner-page mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">Faydalı Araçlar</p>
        <h1 className="page-title">
          YDS ve YÖKDİL&apos;e Hazırlananlar İçin Öneriler
        </h1>
        <p className="page-copy">
          Sınavını ve hedefini seç, sana en uygun paketi önerelim.
        </p>
      </PageHero>
      <form
        method="GET"
        className="panel mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end"
      >
        <div>
          <label className="label" htmlFor="exam">
            Sınavın
          </label>
          <select
            id="exam"
            name="exam"
            defaultValue={examId ?? ""}
            required
            className="auth-input"
          >
            <option value="" disabled>
              Seç
            </option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="goal">
            Hedefin
          </label>
          <select
            id="goal"
            name="goal"
            defaultValue={goal ?? ""}
            required
            className="auth-input"
          >
            <option value="" disabled>
              Seç
            </option>
            <option value="BEGINNER">Sıfırdan başlıyorum</option>
            <option value="ADVANCED">Puanımı artırmak istiyorum</option>
          </select>
        </div>
        <button type="submit" className="primary-button">
          Önerileri Göster
        </button>
      </form>

      {examId && goal ? (
        <div className="mt-10">
          <p className="eyebrow mb-4">Size Önerilen Paketler</p>
          <ProductGrid favoriteIds={favoriteIds}
            products={recommended}
            emptyLabel="Bu kriterlere uygun bir paket bulunamadı. Tüm paketlere göz atabilirsin."
          />
        </div>
      ) : null}
      <NextStepCta />
    </main>
  );
}
