import { notFound, redirect } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { formatTRY } from "@/lib/pricing";
import { PaypalCheckoutButton } from "@/components/checkout/PaypalCheckoutButton";
import { convertTryToUsd, getTryToUsdRate } from "@/server/services/settings.service";

export const metadata: Metadata = { title: "Ödeme" };

type Props = { params: Promise<{ orderId: string }> };

export default async function PayOrderPage({ params }: Props) {
  const { orderId } = await params;
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true, payment: true } });
  if (!order || !order.payment || order.payment.provider !== "PAYPAL") notFound();

  const session = await auth();
  const isOwner = order.userId ? session?.user?.id === order.userId : true;
  if (!isOwner) notFound();

  if (order.status === "PAID") redirect(`/checkout/received?order=${order.id}`);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  // Same conversion as createPaypalOrderAction, so the amount shown is the amount charged.
  const rate = await getTryToUsdRate();
  const usd = convertTryToUsd(Number(order.total), rate).toFixed(2);
  const tryPerUsd = (1 / rate).toLocaleString("tr-TR", { maximumFractionDigits: 2 });

  return (
    <main className="inner-page mx-auto w-full max-w-[700px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">Ödeme</p>
        <h1 className="page-title">Kartla Öde</h1>
      </PageHero>
      <div className="panel mt-8">
        <p className="text-sm font-bold text-slate-500">Sipariş No: {order.id}</p>
        <ul className="mt-4 space-y-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>{item.titleSnapshot} × {item.quantity}</span>
              <span className="font-bold">{formatTRY(String(item.lineTotal))}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-[color:var(--border)] pt-4 font-black text-[color:var(--brand)]">
          <span>Toplam (KDV Dahil)</span>
          <span>{formatTRY(String(order.total))}</span>
        </div>
      </div>
      <div className="panel mt-6">
        {clientId ? (
          <div className="mb-5 rounded-xl bg-[color:var(--brand-soft)] p-4 text-sm leading-6">
            <p>
              Ödenecek tutar: <strong>{formatTRY(String(order.total))}</strong> (KDV dahil)
            </p>
            <p className="mt-1">
              Kart ödeme altyapımız Türk lirası ile çalışmadığı için bu tutar kartından <strong>${usd}</strong> olarak çekilir
              (1 USD = {tryPerUsd} TL). Aşağıdaki formda görünen dolar tutarı, bu TL tutarının karşılığıdır.
            </p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">Bankan tutarı ekstrende TL&apos;ye çevirerek gösterir; kendi kurunu veya yurt dışı işlem ücreti uygulayabilir.</p>
          </div>
        ) : null}
        {clientId ? (
          <PaypalCheckoutButton orderId={order.id} clientId={clientId} />
        ) : (
          <p className="text-sm font-semibold text-[color:var(--danger)]">Kartla ödeme şu anda kullanılamıyor. Lütfen banka havalesi ile sipariş ver veya bize yaz.</p>
        )}
      </div>
    </main>
  );
}
