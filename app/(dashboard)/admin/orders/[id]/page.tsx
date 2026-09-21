import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrderForAdmin } from "@/server/services/orders.service";
import { markOrderPaidAction, markOrderCancelledAction, markOrderRefundedAction } from "@/app/actions/admin-orders";
import { formatTRY } from "@/lib/pricing";

export const metadata: Metadata = { title: "Sipariş Detayı" };

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Beklemede", className: "bg-slate-100 text-slate-600" },
  AWAITING_PAYMENT: { label: "Ödeme Bekleniyor", className: "bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]" },
  PAID: { label: "Ödendi", className: "bg-[color:var(--success-soft)] text-[color:var(--success)]" },
  FAILED: { label: "Başarısız", className: "bg-[color:var(--danger-soft)] text-[color:var(--danger)]" },
  CANCELLED: { label: "İptal", className: "bg-slate-100 text-slate-500" },
  REFUNDED: { label: "İade Edildi", className: "bg-slate-100 text-slate-500" },
};

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderForAdmin(id);
  if (!order) notFound();

  const status = STATUS_LABEL[order.status] ?? STATUS_LABEL.PENDING;
  const customerName = order.user?.name ?? order.guestName ?? "Misafir";
  const customerEmail = order.user?.email ?? order.guestEmail ?? "—";
  const canCancel = order.status === "PENDING" || order.status === "AWAITING_PAYMENT";
  const canMarkPaid = canCancel;
  const canRefund = order.status === "PAID";

  return (
    <div>
      <p className="eyebrow">
        <Link href="/admin/orders" className="hover:underline">Siparişler</Link> › {id.slice(0, 10)}…
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title">Sipariş Detayı</h1>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
      </div>

      <div className="dashboard-panel mt-6">
        <p className="eyebrow">Müşteri</p>
        <p className="mt-2 font-bold text-[color:var(--foreground)]">{customerName}</p>
        <p className="text-sm text-[color:var(--muted)]">{customerEmail}{!order.user ? " (misafir)" : ""}</p>
        {order.guestPhone ? <p className="text-sm text-[color:var(--muted)]">{order.guestPhone}</p> : null}
      </div>

      <div className="dashboard-panel mt-6">
        <p className="eyebrow">Ürünler</p>
        <ul className="mt-3 divide-y divide-[color:var(--border)]">
          {order.items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="font-semibold text-[color:var(--foreground)]">{item.titleSnapshot}{item.quantity > 1 ? ` × ${item.quantity}` : ""}</span>
              <span className="text-sm font-bold">{formatTRY(String(item.lineTotal))}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-[color:var(--border)] pt-4 text-sm">
          <div className="flex justify-between"><span className="text-[color:var(--muted)]">Ara Toplam</span><span>{formatTRY(String(order.subtotal))}</span></div>
          {Number(order.discountTotal) > 0 ? (
            <div className="flex justify-between text-[color:var(--success)]">
              <span>İndirim{order.couponCode ? ` (${order.couponCode})` : ""}</span>
              <span>-{formatTRY(String(order.discountTotal))}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-base font-bold text-[color:var(--foreground)]"><span>Toplam</span><span>{formatTRY(String(order.total))}</span></div>
        </div>
      </div>

      {order.payment ? (
        <div className="dashboard-panel mt-6">
          <p className="eyebrow">Ödeme</p>
          <p className="mt-2 text-sm">Yöntem: <span className="font-semibold">{order.payment.provider}</span></p>
          <p className="text-sm">Durum: <span className="font-semibold">{order.payment.status}</span></p>
          {order.payment.paidAt ? <p className="text-sm">Ödeme tarihi: {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(order.payment.paidAt)}</p> : null}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {canMarkPaid ? (
          <form action={async () => { "use server"; await markOrderPaidAction(order.id); }}>
            <button type="submit" className="primary-button">Ödemeyi Onayla</button>
          </form>
        ) : null}
        {canCancel ? (
          <form action={async () => { "use server"; await markOrderCancelledAction(order.id); }}>
            <button type="submit" className="ghost-button text-[color:var(--danger)]">Siparişi İptal Et</button>
          </form>
        ) : null}
        {canRefund ? (
          <form action={async () => { "use server"; await markOrderRefundedAction(order.id); }}>
            <button type="submit" className="ghost-button text-[color:var(--danger)]">İade Edildi Olarak İşaretle</button>
          </form>
        ) : null}
      </div>
      {canRefund ? (
        <p className="mt-2 text-xs text-[color:var(--muted)]">
          Bu, parayı iade etmez — ödeme altyapısı henüz kurulmadı (bkz. .env.example). İadeyi banka üzerinden siz yapın, ardından burada işaretleyin; bu, siparişe bağlı kurs erişimini de kaldırır.
        </p>
      ) : null}
    </div>
  );
}
