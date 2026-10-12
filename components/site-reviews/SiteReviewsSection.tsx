import Link from "next/link";
import { SiteReviewCard, type PublicReview } from "./SiteReviewCard";

/** Homepage block: the latest approved real reviews (featured first), or an invitation to write the first one. */
export function SiteReviewsSection({ reviews, className = "mt-20" }: { reviews: PublicReview[]; className?: string }) {
  return (
    <section id="yorumlar" className={`mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8 ${className}`}>
      <p className="eyebrow">Öğrenci Yorumları</p>
      <h2 className="section-title">Öğrencilerimiz ne diyor?</h2>
      {reviews.length ? (
        <>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <SiteReviewCard key={r.id} review={r} />
            ))}
          </div>
          <p className="mt-6 text-center">
            <Link href="/yorumlar" className="secondary-button">Tüm yorumlar</Link>
          </p>
        </>
      ) : (
        <div className="panel mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[color:var(--muted)]">Netfener&apos;i kullandıysan deneyimini paylaş; yorumun incelendikten sonra burada yayınlanır.</p>
          <Link href="/dashboard/reviews#netfener-yorumu" className="primary-button text-sm">İlk yorumu sen yaz</Link>
        </div>
      )}
    </section>
  );
}
