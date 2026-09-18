import { PageHero } from "@/components/ui/PageHero";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getOrCreateCart } from "@/server/services/cart.service";
import { formatTRY } from "@/lib/pricing";
import { CheckoutForm } from "@/components/cart/CheckoutForm";

export const metadata: Metadata = { title: "Ödeme" };

export default async function CheckoutPage() {
  const session = await auth();
  const cart = await getOrCreateCart(session?.user?.id);
  const total = cart.items.reduce(
    (sum, item) => sum + Number(item.unitPriceSnapshot) * item.quantity,
    0,
  );

  return (
    <main className="inner-page mx-auto w-full max-w-[900px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">Ödeme</p>
        <h1 className="page-title">Siparişinizi Tamamlayın</h1>
      </PageHero>
      <div className="panel mt-8 flex items-center justify-between">
        <span className="font-bold text-slate-600">
          {cart.items.length} ürün
        </span>
        <div className="text-right">
          <span className="text-xl font-black text-[color:var(--brand)]">
            {formatTRY(total)}
          </span>
          <p className="text-xs text-[color:var(--muted)]">KDV Dahildir</p>
        </div>
      </div>
      <div className="mt-6">
        <CheckoutForm isGuest={!session?.user} />
      </div>
    </main>
  );
}
