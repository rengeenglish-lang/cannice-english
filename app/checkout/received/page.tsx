import { PageHero } from "@/components/ui/PageHero";
import Link from "next/link";
import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { notFound, redirect } from "next/navigation";
import { db } from "@/server/db";
import { formatTRY } from "@/lib/pricing";
import { BankTransferDetails } from "@/components/checkout/BankTransferDetails";

export const metadata: Metadata = { title: "Siparişin Alındı" };

type Props = { searchParams: Promise<{ order?: string }> };

export default async function OrderReceivedPage({ searchParams }: Props) {
  const { order: orderId } = await searchParams;
  const order = orderId
    ? await db.order.findUnique({
        where: { id: orderId },
        include: { items: true, payment: true },
      })
    : null;

  if (order?.userId) {
    const viewer = await getAuthContext();
    if (viewer?.id !== order.userId) notFound();
    if (order.commercialKind) redirect(`/checkout/membership/${order.id}`);
  }

  return (
    <main className="inner-page mx-auto w-full max-w-[700px] px-4 py-14 text-center sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">{order?.status === "PAID" ? "Ödemen alındı!" : "Talebin başarıyla gönderildi!"}</p>
        <h1 className="page-title">Siparişin Alındı</h1>
        <p className="page-copy mx-auto">
          {order?.status === "PAID"
            ? "Ödemen onaylandı, derslerin hesabında hazır."
            : order?.payment?.provider === "MANUAL"
              ? "Ödemeyi aşağıdaki IBAN'a havale veya EFT ile yapabilirsin. Ödemen doğrulandığında erişimin açılır."
              : "Ekibimiz ödeme adımlarını tamamlamak için sizinle en kısa sürede iletişime geçecek."}
        </p>
      </PageHero>
      {order && order.status !== "PAID" && order.payment?.provider === "MANUAL" ? (
        <div className="mt-8">
          <BankTransferDetails orderId={order.id} />
        </div>
      ) : null}
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
            {Number(order.shippingTotal) > 0 ? (
              <div className="flex justify-between text-sm text-[color:var(--muted)]">
                <span>Kargo</span>
                <span>{formatTRY(String(order.shippingTotal))}</span>
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
