import { requireAdministrator } from "@/server/auth/context";
import type { Metadata } from "next";
import { listOrders } from "@/server/services/orders.service";
import { manageCommercialOrder } from "@/app/actions/commercial-checkout";
import { CommercialForm } from "@/components/checkout/CommercialForm";
import { formatTRY } from "@/lib/pricing";

export const metadata: Metadata = { title: "Siparişler" };

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Beklemede", className: "bg-slate-100 text-slate-600" },
  AWAITING_PAYMENT: { label: "Ödeme Bekleniyor", className: "bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]" },
  PAYMENT_REVIEW: { label: "Ödeme alındı — inceleme gerekli", className: "bg-amber-100 text-amber-900" },
  PAID: { label: "Ödendi", className: "bg-[color:var(--success-soft)] text-[color:var(--success)]" },
  FAILED: { label: "Başarısız", className: "bg-[color:var(--danger-soft)] text-[color:var(--danger)]" },
  CANCELLED: { label: "İptal", className: "bg-slate-100 text-slate-500" },
  REFUNDED: { label: "İade Edildi", className: "bg-slate-100 text-slate-500" },
};

export default async function AdminOrdersPage() {
  const actor = await requireAdministrator();
  const orders = await listOrders(actor.id);

  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">Siparişler</h1>
      <div className="dashboard-panel mt-8 overflow-x-auto">
        <table className="dashboard-table">
          <thead>
            <tr><th>Sipariş</th><th>Müşteri</th><th>Ürünler</th><th>Toplam</th><th>Durum</th><th></th></tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const status = STATUS_LABEL[order.status] ?? STATUS_LABEL.PENDING;
              const customerName = order.user?.name ?? order.guestName ?? "Misafir";
              const customerEmail = order.user?.email ?? order.guestEmail ?? "—";
              return (
                <tr key={order.id}>
                  <td className="font-mono text-xs text-[color:var(--muted)]">{order.id.slice(0, 10)}…</td>
                  <td>
                    <p className="font-bold text-[color:var(--foreground)]">{customerName}</p>
                    <p className="text-xs text-[color:var(--muted)]">{customerEmail}{!order.user ? " (misafir)" : ""}</p>
                  </td>
                  <td className="max-w-xs text-sm">{order.items.map((item) => item.titleSnapshot).join(", ")}</td>
                  <td className="font-bold text-[color:var(--foreground)]">{formatTRY(String(order.total))}</td>
                  <td>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
                  </td>
                  <td>
                    {order.status === "AWAITING_PAYMENT" || order.status === "PENDING" ? (
                      <CommercialForm action={manageCommercialOrder} label="Gerçek Ödemeyi Onayla">
                        <input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="operation" value="approve" />
                        <p className="text-xs">Yalnızca alınmış ve doğrulanmış ödemeleri onaylayın.</p>
                      </CommercialForm>
                    ) : null}
                    {order.commercialKind && ["AWAITING_PAYMENT", "PAID", "PAYMENT_REVIEW"].includes(order.status) ? <details className="mt-3"><summary className="cursor-pointer">İptal / iade kaydı</summary><CommercialForm action={manageCommercialOrder} label="Kaydı Güncelle">
                      <input type="hidden" name="orderId" value={order.id} />
                      <label className="block">İşlem<select name="operation" className="block rounded border p-2">{order.status === "AWAITING_PAYMENT" ? <><option value="CANCELLED">Talebi iptal et</option><option value="FAILED">Başarısız ödeme</option></> : <option value="REFUNDED">Gerçekleşmiş iadeyi kaydet</option>}</select></label>
                      <label className="block">Gerekçe<input name="reason" required minLength={3} maxLength={2000} className="block rounded border p-2" /></label><p className="text-xs">Bu işlem bankadan para iadesi başlatmaz. İadeyi önce ödeme kanalı üzerinden tamamlayın.</p>
                    </CommercialForm></details> : null}
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-slate-400">Henüz sipariş yok.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
