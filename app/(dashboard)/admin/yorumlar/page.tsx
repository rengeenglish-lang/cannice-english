import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { forbidden } from "next/navigation";
import { requireStaff } from "@/server/auth/context";
import { db } from "@/server/db";
import { listSiteReviewsForAdmin, reviewPromotionOn, videoUploadsAvailable } from "@/server/services/site-reviews.service";
import { ReviewVideo } from "@/components/site-reviews/SiteReviewCard";
import { PromotionToggle, ReviewModeration } from "@/components/site-reviews/AdminReviewActions";
import { REWARD_PERCENT, TEXT_REWARD_MIN_CHARS, VIDEO_MAX_SECONDS } from "@/lib/site-reviews";

export const metadata: Metadata = { title: "Yorumlar" };

const TABS = [
  { status: "PENDING", label: "Onay bekleyen" },
  { status: "APPROVED", label: "Yayında" },
  { status: "REJECTED", label: "Reddedilen" },
] as const;

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  if ((await requireStaff()).role !== "ADMIN") forbidden();
  const { durum } = await searchParams;
  const status = TABS.find((t) => t.status === durum)?.status ?? "PENDING";
  const [reviews, promotionOn, counts] = await Promise.all([
    listSiteReviewsForAdmin(status),
    reviewPromotionOn(),
    db.siteReview.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0;
  const couponIds = reviews.flatMap((r) => (r.rewardCouponId ? [r.rewardCouponId] : []));
  const coupons = new Map((couponIds.length ? await db.coupon.findMany({ where: { id: { in: couponIds } } }) : []).map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Yönetim</p>
        <h1 className="page-title">Öğrenci yorumları</h1>
        <p className="page-copy">Yorumlar siz onaylayana kadar sitede görünmez. Onaylananlar ana sayfada ve /yorumlar sayfasında yayınlanır.</p>
      </div>

      <section className="dashboard-panel flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm">
          <p className="font-extrabold">Ödüllü yorum kampanyası: {promotionOn ? <span className="text-emerald-700">AÇIK</span> : <span className="text-[color:var(--muted)]">KAPALI</span>}</p>
          <p className="mt-1 text-[color:var(--muted)]">
            Açıkken: en az {TEXT_REWARD_MIN_CHARS} karakterlik yazılı yorum → %{REWARD_PERCENT.TEXT}, yayın izinli, en fazla {VIDEO_MAX_SECONDS} saniyelik video yorum → %{REWARD_PERCENT.VIDEO} plan kuponu (kişiye özel, tek kullanım, 90 gün). Kupon gönderimde verilir; reddedilen yorumun kullanılmamış kuponu iptal olur.
          </p>
          {!videoUploadsAvailable() ? <p className="mt-1 text-amber-700">Video yükleme bu ortamda kapalı (R2 ayarları yok); öğrenciler bağlantı paylaşabilir.</p> : null}
        </div>
        <PromotionToggle on={promotionOn} />
      </section>

      <nav className="flex flex-wrap gap-2" aria-label="Yorum durumu">
        {TABS.map((t) => (
          <Link
            key={t.status}
            href={`/admin/yorumlar?durum=${t.status}`}
            aria-current={t.status === status ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-bold ${t.status === status ? "bg-[color:var(--brand)] text-white" : "border border-[color:var(--border)]"}`}
          >
            {t.label} ({count(t.status)})
          </Link>
        ))}
      </nav>

      {reviews.length === 0 ? <p className="text-sm text-[color:var(--muted)]">Bu bölümde yorum yok.</p> : null}
      <div className="grid gap-5 lg:grid-cols-2">
        {reviews.map((r) => {
          const coupon = r.rewardCouponId ? coupons.get(r.rewardCouponId) : null;
          return (
            <article key={r.id} className="dashboard-panel space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-extrabold">
                    {r.displayName} <span className="text-xs font-normal text-[color:var(--muted)]">({r.user.name} · {r.user.email})</span>
                  </p>
                  <p className="text-xs text-[color:var(--muted)]">
                    {r.kind === "VIDEO" ? "Video" : "Yazılı"} · {r.createdAt.toLocaleString("tr-TR")} {r.examCode ? `· ${r.examCode}` : ""} {r.featured ? "· ⭐ Öne çıkan" : ""}
                  </p>
                </div>
                <span className="flex" aria-label={`${r.rating} / 5`}>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Star key={v} size={14} aria-hidden="true" className={r.rating >= v ? "fill-[color:var(--warning)] text-[color:var(--warning)]" : "text-[color:var(--border-strong)]"} />
                  ))}
                </span>
              </div>
              {r.kind === "VIDEO" ? <ReviewVideo review={r} /> : null}
              {r.body ? <p className="whitespace-pre-line text-sm">{r.body}</p> : null}
              {r.kind === "VIDEO" ? (
                <p className="text-xs text-[color:var(--muted)]">
                  Süre: {r.videoSeconds !== null ? `${r.videoSeconds} sn` : `bağlantı — ${VIDEO_MAX_SECONDS} saniyeyi geçmediğini kontrol edin`} · Yayın izni: {r.usageConsentAt ? `verildi (${r.usageConsentAt.toLocaleString("tr-TR")})` : "yok"}
                </p>
              ) : null}
              <p className="text-xs">
                Ödül:{" "}
                {coupon
                  ? `${coupon.code} · %${Number(coupon.value)} · ${coupon.redemptionCount > 0 ? "kullanıldı" : coupon.isActive ? "aktif" : "iptal"}`
                  : "yok"}
              </p>
              {r.status === "REJECTED" && r.rejectReason ? <p className="text-xs text-[color:var(--danger)]">Red nedeni: {r.rejectReason}</p> : null}
              <ReviewModeration id={r.id} status={r.status} featured={r.featured} />
            </article>
          );
        })}
      </div>
    </div>
  );
}
