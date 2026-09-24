import { PageHero } from "@/components/ui/PageHero";
import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AlertTriangle, Heart, Info, ShoppingCart, Trash2, XCircle } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { findCart, refreshCartPrices } from "@/server/services/cart.service";
import { inspectCart, type CartIssue, type CartItemDetails } from "@/server/services/cart-checks.service";
import { validateCouponForOrder } from "@/server/services/coupons.service";
import { formatTRY } from "@/lib/pricing";
import { CART_COUPON_COOKIE } from "@/lib/cart";
import { clearCartAction, moveToFavoritesAction, removeCartItemAction, restoreCartItemAction } from "@/app/actions/cart";
import { CartCouponForm } from "@/components/cart/CartCouponForm";

export const metadata: Metadata = { title: "Sepetim" };

const ISSUE_STYLE = {
  error: { box: "bg-rose-50 text-rose-900", Icon: XCircle },
  warning: { box: "bg-amber-50 text-amber-900", Icon: AlertTriangle },
  info: { box: "bg-[color:var(--brand-soft)] text-[color:var(--brand)]", Icon: Info },
} as const;

function IssueNote({ issue }: { issue: CartIssue }) {
  const { box, Icon } = ISSUE_STYLE[issue.level];
  return (
    <p role={issue.level === "error" ? "alert" : "status"} className={`flex flex-wrap items-start gap-2 rounded-xl p-3 text-sm ${box}`}>
      <Icon size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1">{issue.message}</span>
      {issue.action ? <Link href={issue.action.href} className="font-bold underline">{issue.action.label}</Link> : null}
    </p>
  );
}

type Props = { searchParams: Promise<{ kaldirildi?: string; saat?: string; favori?: string }> };

export default async function CartPage({ searchParams }: Props) {
  const { kaldirildi, saat, favori } = await searchParams;
  const user = await getAuthContext();
  const cart = await findCart(user?.id);
  const priceChanges = cart ? await refreshCartPrices(cart) : [];
  const items = cart?.items ?? [];
  const { issues, details, blocking, needsAccount } = cart ? await inspectCart(cart, user) : { issues: [] as CartIssue[], details: new Map<string, CartItemDetails>(), blocking: false, needsAccount: false };

  const listTotal = items.reduce((sum, i) => sum + Math.max(Number(i.product.basePrice), Number(i.product.salePrice)) * i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + Number(i.unitPriceSnapshot) * i.quantity, 0);
  const productSavings = listTotal - subtotal;

  const couponCode = (await cookies()).get(CART_COUPON_COOKIE)?.value ?? null;
  const coupon = couponCode && items.length ? await validateCouponForOrder(couponCode, subtotal) : null;
  const couponDiscount = coupon?.ok ? coupon.discount : 0;
  const total = Math.max(0, subtotal - couponDiscount);

  const removedProduct = kaldirildi ? await db.product.findUnique({ where: { id: kaldirildi }, select: { id: true, title: true } }) : null;
  const removedStillGone = removedProduct && !items.some((i) => i.productId === removedProduct.id);
  const generalIssues = issues.filter((i) => !i.itemId);

  return (
    <main className="inner-page mx-auto w-full max-w-[1100px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">Sepetim</p>
        <h1 className="page-title">Sepetin</h1>
      </PageHero>

      <div className="mt-6 space-y-3">
        {removedStillGone ? (
          <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-100 p-4 text-sm">
            <span>“{removedProduct.title}” sepetten kaldırıldı.</span>
            <form action={restoreCartItemAction.bind(null, removedProduct.id, saat ?? null)}>
              <button type="submit" className="font-bold text-[color:var(--accent-strong)] underline">Geri al</button>
            </form>
          </div>
        ) : null}
        {favori ? (
          <p role="status" className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm text-rose-900">
            <Heart size={16} className="fill-rose-500 text-rose-500" aria-hidden="true" />
            “{favori}” favorilerine taşındı. <Link href="/dashboard/favoriler" className="font-bold underline">Favorilerim</Link>
          </p>
        ) : null}
        {priceChanges.map((c) => (
          <p key={c.title} role="status" className="flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
            “{c.title}” fiyatı sepete eklediğinden bu yana {formatTRY(c.oldPrice)} → {formatTRY(c.newPrice)} olarak güncellendi. Sepetin güncel fiyatla hesaplandı.
          </p>
        ))}
        {generalIssues.map((issue, i) => <IssueNote key={i} issue={issue} />)}
      </div>

      {items.length === 0 ? (
        <div className="panel mt-8 text-center">
          <ShoppingCart size={32} className="mx-auto text-[color:var(--accent)]" aria-hidden="true" />
          <p className="mt-3 text-slate-500">Sepetin şu an boş.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/planlar" className="primary-button">Planları incele</Link>
            <Link href="/kaynaklar" className="secondary-button">Kaynaklara göz at</Link>
            {user ? <Link href="/dashboard/favoriler" className="ghost-button">Favorilerim</Link> : null}
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            {items.map((item) => {
              const d = details.get(item.id);
              const itemIssues = issues.filter((i) => i.itemId === item.id);
              const base = Number(item.product.basePrice);
              const unit = Number(item.unitPriceSnapshot);
              return (
                <article key={item.id} className="panel space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="rounded-full bg-[color:var(--brand-soft)] px-3 py-1 text-[11px] font-black tracking-wide text-[color:var(--brand)]">
                        {d?.typeLabel.toLocaleUpperCase("tr-TR")}
                      </span>
                      <Link href={d?.href ?? "#"} className="mt-2 block font-black text-[color:var(--foreground)] hover:underline">
                        {item.product.title}
                      </Link>
                      {d?.notes.length ? (
                        <ul className="mt-1 space-y-0.5 text-sm text-slate-500">
                          {d.notes.map((note) => <li key={note}>{note}</li>)}
                        </ul>
                      ) : null}
                    </div>
                    <div className="text-right">
                      {base > unit ? <del className="block text-xs text-slate-400">{formatTRY(base * item.quantity)}</del> : null}
                      <p className="text-lg font-black text-[color:var(--brand)]">{formatTRY(unit * item.quantity)}</p>
                      {item.quantity > 1 ? <p className="text-xs text-slate-500">{item.quantity} adet × {formatTRY(unit)}</p> : null}
                    </div>
                  </div>
                  {itemIssues.map((issue, i) => <IssueNote key={i} issue={issue} />)}
                  <div className="flex flex-wrap gap-2 border-t border-[color:var(--border)] pt-3">
                    <form action={moveToFavoritesAction.bind(null, item.id)}>
                      <button type="submit" className="ghost-button gap-1.5 text-xs">
                        <Heart size={15} aria-hidden="true" /> Favorilere taşı
                      </button>
                    </form>
                    <form action={removeCartItemAction.bind(null, item.id)}>
                      <button type="submit" className="ghost-button gap-1.5 text-xs text-[color:var(--danger)]">
                        <Trash2 size={15} aria-hidden="true" /> Kaldır
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
            <details className="text-sm">
              <summary className="cursor-pointer font-bold text-slate-500">Sepeti boşalt</summary>
              <form action={clearCartAction} className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-rose-50 p-3">
                <span>Sepetindeki {items.length} ürünün tamamı kaldırılacak. Emin misin?</span>
                <button type="submit" className="destructive-button !min-h-9 !py-1.5 text-xs">Evet, sepeti boşalt</button>
              </form>
            </details>
          </div>

          <aside className="panel h-fit space-y-4 lg:sticky lg:top-24">
            <h2 className="text-lg font-black">Sipariş özeti</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Liste fiyatı</dt><dd>{formatTRY(listTotal)}</dd></div>
              {productSavings > 0 ? (
                <div className="flex justify-between font-semibold text-emerald-700">
                  <dt>İndirim (%{Math.round((productSavings / listTotal) * 100)})</dt><dd>-{formatTRY(productSavings)}</dd>
                </div>
              ) : null}
              {couponDiscount > 0 && coupon?.ok ? (
                <div className="flex justify-between font-semibold text-emerald-700"><dt>Kupon ({coupon.coupon.code})</dt><dd>-{formatTRY(couponDiscount)}</dd></div>
              ) : null}
              <div className="flex justify-between border-t border-[color:var(--border)] pt-2 text-base font-black text-[color:var(--brand)]">
                <dt>Toplam</dt><dd>{formatTRY(total)}</dd>
              </div>
              <p className="text-xs text-slate-500">KDV dahil</p>
              {productSavings + couponDiscount > 0 ? (
                <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">Bu siparişte {formatTRY(productSavings + couponDiscount)} tasarruf ediyorsun.</p>
              ) : null}
            </dl>
            <CartCouponForm appliedCode={coupon?.ok ? coupon.coupon.code : null} />
            {coupon && !coupon.ok ? <p className="text-sm font-semibold text-[color:var(--danger)]">“{couponCode}” kuponu uygulanamadı: {coupon.message}</p> : null}
            {blocking ? (
              <>
                <button type="button" disabled className="primary-button w-full justify-center">Ödemeye Geç</button>
                <p className="text-xs text-rose-700">Devam etmek için yukarıdaki kırmızı uyarıları çöz.</p>
              </>
            ) : needsAccount ? (
              <>
                <Link href={`/register?next=${encodeURIComponent("/checkout")}`} className="primary-button w-full justify-center">Ücretsiz Üye Ol ve Ödemeye Geç</Link>
                <p className="text-center text-sm text-slate-600">
                  Zaten üye misin? <Link href={`/sign-in?next=${encodeURIComponent("/checkout")}`} className="font-bold underline">Giriş yap</Link>
                </p>
              </>
            ) : (
              <Link href="/checkout" className="primary-button w-full justify-center">Ödemeye Geç</Link>
            )}
            <p className="text-xs text-slate-500">
              Satın alma sonrası 14 gün içinde iade talep edebilirsin. <Link href="/legal/iade-politikasi" className="underline">İade Politikası</Link>
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
