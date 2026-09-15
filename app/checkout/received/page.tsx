import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/server/db";
import { formatTRY } from "@/lib/pricing";

export const metadata: Metadata = { title: "Siparişiniz Alındı" };

type Props = { searchParams: Promise<{ order?: string }> };

export default async function OrderReceivedPage({ searchParams }: Props) {
  const { order: orderId } = await searchParams;
  const order = orderId ? await db.order.findUnique({ where: { id: orderId }, include: { items: true } }) : null;

  return (
    <main className="mx-auto w-full max-w-[700px] px-4 py-14 text-center sm:px-6 lg:px-8">
      <p className="eyebrow">Talebiniz başarıyla gönderildi!</p>
      <h1 className="page-title">Siparişiniz Alındı</h1>
      <p className="page-copy mx-auto">Ekibimiz ödeme adımlarını tamamlamak için sizinle en kısa sürede iletişime geçecek.</p>
      {order ? (
        <div className="panel mt-8 text-left">
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
            <span>Toplam</span>
            <span>{formatTRY(String(order.total))}</span>
          </div>
        </div>
      ) : null}
      <Link href="/" className="primary-button mt-8 inline-flex">Ana Sayfaya Dön</Link>
    </main>
  );
}
