import { PageHero } from "@/components/ui/PageHero";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/server/db";
import { formatTRY } from "@/lib/pricing";

export const metadata: Metadata = { title: "Siparişiniz Alındı" };

type Props = { searchParams: Promise<{ order?: string }> };

export default async function OrderReceivedPage({ searchParams }: Props) {
  const { order: orderId } = await searchParams;
  const order = orderId
    ? await db.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })
    : null;

  return (
    <main className="inner-page mx-auto w-full max-w-[700px] px-4 py-14 text-center sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">{order?.status === "PAID" ? "Ödemeniz alındı!" : "Talebiniz başarıyla gönderildi!"}</p>
        <h1 className="page-title">Siparişiniz Alındı</h1>
        <p className="page-copy mx-auto">
          {order?.status === "PAID"
            ? "Ödemeniz onaylandı, dersleriniz hesabınızda hazır."
            : "Ekibimiz ödeme adımlarını tamamlamak için sizinle en kısa sürede iletişime geçecek."}
        </p>
      </PageHero>
      {order ? (
        <div className="panel mt-8 text-left">
          <p className="text-sm font-bold text-slate-500">
            Sipariş No: {order.id}
          </p>
          <ul className="mt-4 space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.titleSnapshot} × {item.quantity}
                </span>
                <span className="font-bold">
                  {formatTRY(String(item.lineTotal))}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-[color:var(--border)] pt-4">
            <div className="flex justify-between text-sm text-[color:var(--muted)]">
              <span>Ara Toplam</span>
              <span>{formatTRY(String(order.subtotal))}</span>
            </div>
            {Number(order.discountTotal) > 0 ? (
              <div className="flex justify-between text-sm font-semibold text-[color:var(--success)]">
                <span>
                  İndirim{order.couponCode ? ` (${order.couponCode})` : ""}
                </span>
                <span>-{formatTRY(String(order.discountTotal))}</span>
              </div>
            ) : null}
            <div className="flex justify-between pt-1 font-black text-[color:var(--brand)]">
              <span>Toplam (KDV Dahil)</span>
              <span>{formatTRY(String(order.total))}</span>
            </div>
          </div>
        </div>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="primary-button inline-flex">
          Ana Sayfaya Dön
        </Link>
        {order ? (
          <Link
            href={`/orders/${order.id}/receipt`}
            className="secondary-button inline-flex"
          >
            Makbuzu Görüntüle
          </Link>
        ) : null}
      </div>
    </main>
  );
}
