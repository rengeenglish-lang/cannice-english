import Link from "next/link";
import { SiteReviewCard, type PublicReview } from "./SiteReviewCard";

/** Only real approved reviews belong in the public homepage's social proof. */
export function SiteReviewsSection({ reviews, className = "mt-20" }: { reviews: PublicReview[]; className?: string }) {
  if (!reviews.length) return null;
  return (
    <section id="yorumlar" className={`mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8 ${className}`}>
      <p className="eyebrow">Öğrenci Yorumları</p>
      <h2 className="section-title">Öğrencilerimiz ne diyor?</h2>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map(review => <SiteReviewCard key={review.id} review={review} />)}
      </div>
      <p className="mt-6 text-center"><Link href="/yorumlar" className="secondary-button">Tüm yorumlar</Link></p>
    </section>
  );
}
