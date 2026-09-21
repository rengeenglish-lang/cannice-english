import type { Metadata } from "next";
import { Star } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { listPurchasedProductsForUser, listMyReviews } from "@/server/services/reviews.service";
import { upsertReviewAction, deleteReviewAction } from "@/app/actions/reviews";
import { AccountHeader } from "@/components/dashboard/AccountHeader";
import { AccountTabs } from "@/components/dashboard/AccountTabs";
import { ReviewForm } from "@/components/dashboard/ReviewForm";

export const metadata: Metadata = { title: "Yorumlarım" };

export default async function ReviewsPage() {
  const user = await getAuthContext();
  if (!user) return null;

  const [products, reviews] = await Promise.all([listPurchasedProductsForUser(user.id), listMyReviews(user.id)]);
  const reviewByProductId = new Map(reviews.map((r) => [r.productId, r]));

  return (
    <div>
      <AccountHeader name={user.name} email={user.email} activeTabLabel="Yorumlarım" />
      <AccountTabs active="Yorumlarım" />

      <div className="mt-8 space-y-6">
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
