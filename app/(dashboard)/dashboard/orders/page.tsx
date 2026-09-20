import Link from "next/link";
import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { formatTRY } from "@/lib/pricing";

export const metadata: Metadata = { title: "Siparişlerim" };

const STATUS: Record<string, string> = {
  PENDING: "Beklemede",
  AWAITING_PAYMENT: "Ödeme bekleniyor",
  PAID: "Ödendi",
  FAILED: "Başarısız",
  CANCELLED: "İptal edildi",
  REFUNDED: "İade edildi",
};

export default async function OrdersPage() {
  const user = await getAuthContext();
  if (!user) return null;
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Hesabınız</p>
      <h1 className="page-title">Siparişlerim</h1>
      <section className="dashboard-panel mt-6">
        {orders.length ? (
          <ul className="divide-y divide-[color:var(--border)]">
            {orders.map((order) => (
              <li key={order.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 sm:flex-1">
                  <p className="text-sm font-bold">{order.items.map((i) => i.titleSnapshot).join(", ")}</p>
                  <p className="mt-2 text-xs text-[color:var(--muted)]">{STATUS[order.status] ?? "Beklemede"}</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <strong className="text-sm">{formatTRY(String(order.total))}</strong>
                  <Link href={`/orders/${order.id}/receipt`} className="ghost-button text-xs">
                    Siparişi görüntüle
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-7 text-[color:var(--muted)]">
            Henüz bir siparişiniz yok. Seçtiğiniz kaynakların ve derslerin sipariş durumu burada görünür.
          </p>
        )}
      </section>
    </div>
  );
}
