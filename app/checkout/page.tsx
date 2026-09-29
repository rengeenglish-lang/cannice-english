import { getCheckoutConsentRequirements } from "@/server/services/checkout-consent.service";
import { getPublishedLegalContent } from "@/server/services/legal-content.service";
import { PageHero } from "@/components/ui/PageHero";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import Link from "next/link";
import { findCart, refreshCartPrices } from "@/server/services/cart.service";
import { CART_COUPON_COOKIE } from "@/lib/cart";
import { formatTRY } from "@/lib/pricing";
import { shippingTotalFor } from "@/lib/shipping";
import { CheckoutForm } from "@/components/cart/CheckoutForm";

export const metadata: Metadata = { title: "Ödeme" };

export default async function CheckoutPage() {
  const [session, legal] = await Promise.all([auth(), getPublishedLegalContent()]);
  const cart = await findCart(session?.user?.id);
  if (cart) await refreshCartPrices(cart);
  const items = cart?.items ?? [];
  const { requirements } = await getCheckoutConsentRequirements(items);
  const couponCode = (await cookies()).get(CART_COUPON_COOKIE)?.value ?? "";
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.unitPriceSnapshot) * item.quantity,
    0,
  );
  // A basket with a printed book in it is shipped, once, at a flat fee.
  const shippingTotal = shippingTotalFor(items.map((item) => item.product));
  const total = subtotal + shippingTotal;

  return (
    <main className="inner-page mx-auto w-full max-w-[900px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">Ödeme</p>
        <h1 className="page-title">Siparişinizi Tamamlayın</h1>
      </PageHero>
      <div className="panel mt-8 flex items-center justify-between">
        <span className="font-bold text-slate-600">
          {items.length} ürün · <Link href="/cart" className="underline">Sepeti düzenle</Link>
        </span>
        <div className="text-right">
          {shippingTotal > 0 ? (
            <p className="text-xs text-[color:var(--muted)]">
              Ürünler {formatTRY(subtotal)} + kargo {formatTRY(shippingTotal)}
            </p>
          ) : null}
          <span className="text-xl font-black text-[color:var(--brand)]">
            {formatTRY(total)}
          </span>
          <p className="text-xs text-[color:var(--muted)]">KDV Dahildir</p>
        </div>
      </div>
      <div className="mt-6">
        <CheckoutForm isGuest={!session?.user} defaultCoupon={couponCode} shippingTotal={shippingTotal} consentRequirements={requirements} consentConfiguration={legal.configuration} documentsDraft={["mesafeli-satis-sozlesmesi", "on-bilgilendirme-formu"].some((key) => legal.documents[key].draft !== false)} />
      </div>
    </main>
  );
}
