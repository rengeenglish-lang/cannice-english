import { PageHero } from "@/components/ui/PageHero";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { findCart, refreshCartPrices } from "@/server/services/cart.service";
import { CART_COUPON_COOKIE } from "@/lib/cart";
import { formatTRY } from "@/lib/pricing";
import { isMonthlyBilledCategory } from "@/lib/billing";
import { CheckoutForm } from "@/components/cart/CheckoutForm";

export const metadata: Metadata = { title: "Ödeme" };

export default async function CheckoutPage() {
  const session = await auth();
  const cart = await findCart(session?.user?.id);
  if (cart) await refreshCartPrices(cart);
  const items = cart?.items ?? [];
  // Plans and group lessons attach to an account; send guests to the free sign-up first instead of
  // letting them fill the form only to be refused by placeOrderAction.
  if (!session?.user && items.some((item) => item.product.category === "PLAN" || item.product.category === "PREP_GROUP")) {
    redirect(`/register?next=${encodeURIComponent("/checkout")}`);
  }
  const couponCode = (await cookies()).get(CART_COUPON_COOKIE)?.value ?? "";
  const total = items.reduce(
    (sum, item) => sum + Number(item.unitPriceSnapshot) * item.quantity,
    0,
  );

  return (
    <main className="inner-page mx-auto w-full max-w-[900px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">Ödeme</p>
        <h1 className="page-title">Siparişini Tamamla</h1>
      </PageHero>
      <div className="panel mt-8">
        <div className="flex items-center justify-between">
          <p className="font-bold text-slate-600">Sipariş özeti</p>
          <Link href="/cart" className="text-sm font-bold underline">Sepeti düzenle</Link>
        </div>
        <ul className="mt-4 divide-y divide-[color:var(--border)]">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="font-semibold text-[color:var(--foreground)]">
                {item.product.title}
                {isMonthlyBilledCategory(item.product.category) ? <span className="ml-2 text-xs font-bold text-slate-500">aylık ödenir</span> : null}
              </span>
              <span className="shrink-0 font-bold">
                {formatTRY(Number(item.unitPriceSnapshot) * item.quantity)}
                {isMonthlyBilledCategory(item.product.category) ? <span className="text-xs font-bold text-slate-500"> / ay</span> : null}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center justify-between border-t border-[color:var(--border)] pt-4">
          <span className="font-bold text-slate-600">Toplam</span>
          <div className="text-right">
            <span className="text-xl font-black text-[color:var(--brand)]">{formatTRY(total)}</span>
            <p className="text-xs text-[color:var(--muted)]">KDV dahil</p>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <CheckoutForm isGuest={!session?.user} defaultCoupon={couponCode} />
      </div>
    </main>
  );
}
