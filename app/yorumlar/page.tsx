import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { SiteReviewCard } from "@/components/site-reviews/SiteReviewCard";
import { listPublishedSiteReviews } from "@/server/services/site-reviews.service";

export const metadata: Metadata = {
  title: "Öğrenci Yorumları",
  description: "Netfener öğrencilerinin yazılı ve video yorumları.",
};

export default async function ReviewsPage() {
  const reviews = await listPublishedSiteReviews(120);
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  return (
    <main className="inner-page mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">Öğrenci Yorumları</p>
        <h1 className="page-title">Netfener öğrencileri ne diyor?</h1>
        {reviews.length ? (
          <p className="page-copy">
            {reviews.length} yorum · ortalama {average.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} / 5. Tüm yorumlar gerçek öğrencilerden gelir ve yayından önce incelenir.
          </p>
        ) : null}
      </PageHero>
      {reviews.length ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <SiteReviewCard key={r.id} review={r} />
          ))}
        </div>
      ) : (
        <div className="panel mx-auto mt-8 max-w-xl text-center">
          <p className="font-bold">Henüz yayınlanmış yorum yok.</p>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Netfener&apos;i kullandıysan ilk yorumu sen yaz.</p>
          <Link href="/dashboard/reviews#netfener-yorumu" className="primary-button mt-5">İlk yorumu sen yaz</Link>
        </div>
      )}
      {reviews.length ? (
        <p className="mt-10 text-center">
          <Link href="/dashboard/reviews#netfener-yorumu" className="primary-button">Sen de yorum yaz</Link>
        </p>
      ) : null}
    </main>
  );
}
