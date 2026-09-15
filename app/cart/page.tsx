import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getOrCreateCart } from "@/server/services/cart.service";
import { formatTRY } from "@/lib/pricing";
import { removeFromCartAction } from "@/app/actions/cart";

export const metadata: Metadata = { title: "Sepetim" };

export default async function CartPage() {
  const session = await auth();
  const cart = await getOrCreateCart(session?.user?.id);
  const total = cart.items.reduce((sum, item) => sum + Number(item.unitPriceSnapshot) * item.quantity, 0);

  return (
    <main className="mx-auto w-full max-w-[900px] px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">Sepetim</p>
      <h1 className="page-title">Sepetiniz</h1>

      {cart.items.length === 0 ? (
        <div className="panel mt-8 text-center">
          <p className="text-slate-500">Sepetiniz şu an boş.</p>
          <Link href="/packages" className="primary-button mt-4 inline-flex">Paketleri İncele</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="panel flex items-center justify-between gap-4">
              <div>
                <p className="font-black text-[color:var(--foreground)]">{item.product.title}</p>
                <p className="text-sm text-slate-500">{item.quantity} adet · {formatTRY(String(item.unitPriceSnapshot))}</p>
              </div>
              <form action={async () => { "use server"; await removeFromCartAction(item.id); }}>
                <button type="submit" className="ghost-button text-[color:var(--danger)]">Kaldır</button>
              </form>
            </div>
          ))}
          <div className="panel flex items-center justify-between">
            <span className="font-bold text-slate-600">Toplam</span>
            <span className="text-2xl font-black text-[color:var(--brand)]">{formatTRY(total)}</span>
          </div>
          <Link href="/checkout" className="primary-button w-full justify-center">Ödemeye Geç</Link>
        </div>
      )}
    </main>
  );
}
