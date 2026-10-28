import { Star } from "lucide-react";
import { REWARD_DISCLOSURE, youtubeEmbedUrl } from "@/lib/site-reviews";
import { EBOOK_REVIEW_REWARD_DISCLOSURE } from "@/lib/ebook-review-reward";

const EXAM_LABEL: Record<string, string> = {
  YDS: "YDS",
  YOKDIL_SOSYAL: "YÖKDİL Sosyal",
  YOKDIL_SAGLIK: "YÖKDİL Sağlık",
  YOKDIL_FEN: "YÖKDİL Fen",
  IELTS: "IELTS",
  TOEFL: "TOEFL",
  PTE: "PTE",
};

export type PublicReview = {
  id: string;
  kind: "TEXT" | "VIDEO";
  rating: number;
  displayName: string;
  examCode: string | null;
  body: string;
  videoKey: string | null;
  videoUrl: string | null;
  rewardCouponId: string | null;
  ebookRewarded?: boolean;
};

export function ReviewVideo({ review }: { review: Pick<PublicReview, "id" | "videoKey" | "videoUrl"> }) {
  if (review.videoKey) {
    return <video src={`/api/reviews/${review.id}/video`} controls preload="metadata" playsInline className="aspect-video w-full rounded-xl bg-black" />;
  }
  if (!review.videoUrl) return null;
  const embed = youtubeEmbedUrl(review.videoUrl);
  return embed ? (
    <iframe src={embed} title="Video yorum" loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen className="aspect-video w-full rounded-xl" />
  ) : (
    <a href={review.videoUrl} target="_blank" rel="noopener noreferrer nofollow" className="secondary-button w-full justify-center text-sm">Videoyu izle ↗</a>
  );
}

export function SiteReviewCard({ review }: { review: PublicReview }) {
  return (
    <figure className="panel flex flex-col gap-3">
      {review.kind === "VIDEO" ? <ReviewVideo review={review} /> : null}
      <div className="flex items-center gap-0.5" aria-label={`${review.rating} / 5 puan`}>
        {[1, 2, 3, 4, 5].map((v) => (
          <Star key={v} size={15} aria-hidden="true" className={review.rating >= v ? "fill-[color:var(--warning)] text-[color:var(--warning)]" : "text-[color:var(--border-strong)]"} />
        ))}
      </div>
      {review.body ? <blockquote className="whitespace-pre-line text-sm leading-6 text-[color:var(--foreground)]">&ldquo;{review.body}&rdquo;</blockquote> : null}
      <figcaption className="mt-auto border-t border-[color:var(--border)] pt-3">
        <p className="text-sm font-extrabold">{review.displayName}</p>
        {review.examCode ? <p className="text-xs font-bold text-[color:var(--brand)]">{EXAM_LABEL[review.examCode] ?? review.examCode} öğrencisi</p> : null}
        {review.rewardCouponId ? <p className="mt-1 text-[11px] text-[color:var(--muted)]">{REWARD_DISCLOSURE}</p> : null}
        {review.ebookRewarded ? <p className="mt-1 text-[11px] text-[color:var(--muted)]">{EBOOK_REVIEW_REWARD_DISCLOSURE}</p> : null}
      </figcaption>
    </figure>
  );
}
