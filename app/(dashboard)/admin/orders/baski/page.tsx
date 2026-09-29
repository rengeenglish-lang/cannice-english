import Link from "next/link";
import type { Metadata } from "next";
import { listPrintOrders } from "@/server/services/orders.service";
import { isShippedProduct, formatShippingAddress, parseShippingAddress } from "@/lib/shipping";

export const metadata: Metadata = { title: "Baskı Siparişleri" };

/** The queue the print partner works from: paid orders with a book to print and post. */
export default async function AdminPrintOrdersPage() {
  const orders = await listPrintOrders();

  return (
    <div>
      <p className="eyebrow">
        <Link href="/admin/orders" className="hover:underline">Siparişler</Link> › Baskı
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title">Baskı Siparişleri</h1>
        <a className="ghost-button" href="/api/admin/baski-siparisleri" download>CSV indir</a>
      </div>
      <p className="mt-3 text-sm text-[color:var(--muted)]">
        Ödemesi tamamlanmış, basılıp kargolanacak siparişler — en eskisi en üstte. Listeyi CSV olarak indirip
        baskı/kargo iş ortağına iletebilirsin.
      </p>

      <div className="dashboard-panel mt-6 overflow-x-auto">
        <table className="dashboard-table">
          <thead>
            <tr><th>Sipariş</th><th>Tarih</th><th>Basılacak kitaplar</th><th>Teslimat adresi</th></tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const address = parseShippingAddress(order.shippingAddress);
              const printed = order.items.filter((item) => isShippedProduct(item.product));
              return (
                <tr key={order.id}>
                  <td className="font-mono text-xs text-[color:var(--muted)]">
                    <Link href={`/admin/orders/${order.id}`} className="hover:underline">{order.id.slice(0, 10)}…</Link>
                  </td>
                  <td className="whitespace-nowrap text-sm">{order.createdAt.toLocaleDateString("tr-TR")}</td>
                  <td className="text-sm">
                    <ul>
                      {printed.map((item) => (
                        <li key={item.id}>{item.titleSnapshot}{item.quantity > 1 ? ` × ${item.quantity}` : ""}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="text-sm">
                    {address ? (
                      <address className="not-italic leading-6">
                        {formatShippingAddress(address).map((line) => <span key={line} className="block">{line}</span>)}
                      </address>
                    ) : (
                      <span className="font-semibold text-[color:var(--danger)]">Adres yok — müşteriyle iletişime geç</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-[color:var(--muted)]">Basılacak sipariş yok.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
