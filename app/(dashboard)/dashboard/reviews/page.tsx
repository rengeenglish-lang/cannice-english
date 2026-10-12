import type { Metadata } from "next";
import { Star } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { listPurchasedProductsForUser, listMyReviews } from "@/server/services/reviews.service";
import { upsertReviewAction, deleteReviewAction } from "@/app/actions/reviews";
import { AccountHeader } from "@/components/dashboard/AccountHeader";
import { AccountTabs } from "@/components/dashboard/AccountTabs";
import { ReviewForm } from "@/components/dashboard/ReviewForm";
import { SiteReviewForm } from "@/components/site-reviews/SiteReviewForm";
import { listMySiteReviews, myRewardCoupons, reviewPromotionOn, videoUploadsAvailable } from "@/server/services/site-reviews.service";
import { REWARD_PERCENT, defaultDisplayName } from "@/lib/site-reviews";
import Link from "next/link";

const STATUS_LABEL = { PENDING: "İncelemede", APPROVED: "Yayında", REJECTED: "Yayınlanmadı" } as const;

export const metadata: Metadata = { title: "Yorumlarım" };

export default async function ReviewsPage() {
  const user = await getAuthContext();
  if (!user) return null;

  const [products, reviews, siteReviews, coupons, promotionOn] = await Promise.all([
    listPurchasedProductsForUser(user.id),
    listMyReviews(user.id),
    listMySiteReviews(user.id),
    myRewardCoupons(user.id),
    reviewPromotionOn(),
  ]);
  const rewarded = { TEXT: siteReviews.some((r) => r.kind === "TEXT" && r.rewardCouponId), VIDEO: siteReviews.some((r) => r.kind === "VIDEO" && r.rewardCouponId) };
  const couponById = new Map(coupons.map((c) => [c.id, c]));
  const reviewByProductId = new Map(reviews.map((r) => [r.productId, r]));

  return (
    <div>
      <AccountHeader name={user.name} email={user.email} activeTabLabel="Yorumlarım" />
      <AccountTabs active="Yorumlarım" />

      <section id="netfener-yorumu" className="mt-8 scroll-mt-24 space-y-4">
        <div>
          <h2 className="text-xl font-extrabold">Netfener hakkında yorum yaz</h2>
          {promotionOn ? (
            <p className="mt-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
              🎁 <strong>Kampanya:</strong> kapsamlı yazılı yorumuna <strong>%{REWARD_PERCENT.TEXT}</strong>, video yorumuna <strong>%{REWARD_PERCENT.VIDEO}</strong> plan indirimi. Kupon yorumu gönderdiğin anda hesabına tanımlanır.
            </p>
          ) : (
            <p className="mt-1 text-sm text-[color:var(--muted)]">Deneyimini paylaş; yorumun incelendikten sonra sitede yayınlanır.</p>
          )}
        </div>
        <SiteReviewForm defaultName={defaultDisplayName(user.name)} promotionOn={promotionOn} rewarded={rewarded} emailVerified={Boolean(user.emailVerifiedAt)} uploadsAvailable={videoUploadsAvailable()} />
        {siteReviews.length ? (
          <div className="dashboard-panel">
            <h3 className="font-bold">Gönderdiğin yorumlar</h3>
            <ul className="mt-3 divide-y divide-[color:var(--border)] text-sm">
              {siteReviews.map((r) => {
                const coupon = r.rewardCouponId ? couponById.get(r.rewardCouponId) : null;
                return (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span>
                      {r.kind === "VIDEO" ? "Video yorum" : "Yazılı yorum"} · {r.createdAt.toLocaleDateString("tr-TR")} ·{" "}
                      <strong>{STATUS_LABEL[r.status]}</strong>
                      {r.status === "REJECTED" && r.rejectReason ? ` — ${r.rejectReason}` : ""}
                    </span>
                    {coupon ? (
                      <span className="text-xs">
                        Kupon <span className="select-all font-mono font-bold">{coupon.code}</span> (%{Number(coupon.value)}) —{" "}
                        {coupon.redemptionCount > 0 ? "kullanıldı" : !coupon.isActive ? "iptal edildi" : coupon.expiresAt && coupon.expiresAt < new Date() ? "süresi doldu" : <Link href="/planlar" className="underline">plan seç</Link>}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </section>

      <h2 className="mt-10 text-xl font-extrabold">Satın aldıklarını değerlendir</h2>
      <div className="mt-4 space-y-6">
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[color:var(--border-strong)] px-5 py-10 text-center">
            <p className="font-bold text-[color:var(--foreground)]">Henüz yorum yapabileceğiniz bir satın alımınız yok</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">Bir kurs veya materyal satın aldığınızda burada yorum bırakabilirsiniz.</p>
          </div>
        ) : (
          products.map((product) => {
            const existing = reviewByProductId.get(product.id);
            return (
              <section key={product.id} className="dashboard-panel">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-bold text-[color:var(--foreground)]">{product.title}</h2>
                  {existing ? (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <Star key={v} size={16} className={existing.rating >= v ? "fill-[color:var(--warning)] text-[color:var(--warning)]" : "text-[color:var(--border-strong)]"} />
                      ))}
                    </div>
                  ) : null}
                </div>
                <ReviewForm action={upsertReviewAction.bind(null, product.id)} existingRating={existing?.rating} existingComment={existing?.comment} />
                {existing ? (
                  <form action={deleteReviewAction.bind(null, existing.id)} className="mt-2">
                    <button type="submit" className="ghost-button text-xs text-[color:var(--danger)]">Yorumu Sil</button>
                  </form>
                ) : null}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
