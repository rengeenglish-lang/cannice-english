import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { getAuthContext } from "@/server/auth/context";
import { formatTRY } from "@/lib/pricing";
import { kdvIncludedIn, KDV_RATE_PERCENT } from "@/lib/tax";
import { PrintButton } from "@/components/orders/PrintButton";
import { Logo } from "@/components/brand/Logo";

export const metadata: Metadata = { title: "Sipariş Makbuzu" };

type Props = { params: Promise<{ id: string }> };

export default async function OrderReceiptPage({ params }: Props) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, user: true, payment: true },
  });
  if (!order) notFound();

  const session = await auth();
  const viewer = await getAuthContext();
  const isOwner = order.userId ? session?.user?.id === order.userId : true;
  const isStaff = viewer?.role === "TEACHER" || viewer?.role === "ADMIN";
  if (!isOwner && !isStaff) notFound();

  const kdvTotal = kdvIncludedIn(String(order.total));
  const formatter = new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <main className="inner-page mx-auto w-full max-w-[700px] px-4 py-14 sm:px-6 lg:px-8 print:py-6">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <p className="eyebrow">Sipariş Makbuzu</p>
          <h1 className="page-title">Makbuz</h1>
        </div>
        <PrintButton />
      </div>

      <div className="panel print:border-0 print:p-0 print:shadow-none">
        <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-5">
          <div>
            <Logo size={36} />
            <p className="text-xs text-[color:var(--muted)]">
              IELTS · TOEFL · PTE · YDS · YÖKDİL Online Dersler
            </p>
          </div>
          <div className="text-right text-xs text-[color:var(--muted)]">
            <p>Sipariş No: {order.id}</p>
            <p>{formatter.format(order.createdAt)}</p>
          </div>
        </div>

        <div className="mt-5 text-sm text-[color:var(--muted)]">
          <p className="font-bold text-[color:var(--foreground)]">
            Fatura Bilgileri
          </p>
          <p>{order.user?.name ?? order.guestName}</p>
          <p>{order.user?.email ?? order.guestEmail}</p>
        </div>

        <div
          className="overflow-x-auto"
          tabIndex={0}
          role="region"
          aria-label="Tabloyu yatay kaydırın"
        >
          <table className="dashboard-table mt-6">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Adet</th>
                <th>Tutar</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.titleSnapshot}</td>
                  <td>{item.quantity}</td>
                  <td>{formatTRY(String(item.lineTotal))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 space-y-1 border-t border-[color:var(--border)] pt-4 text-sm">
          <div className="flex justify-between text-[color:var(--muted)]">
            <span>Ara Toplam</span>
            <span>{formatTRY(String(order.subtotal))}</span>
          </div>
          {Number(order.discountTotal) > 0 ? (
            <div className="flex justify-between font-semibold text-[color:var(--success)]">
              <span>
                İndirim{order.couponCode ? ` (${order.couponCode})` : ""}
              </span>
              <span>-{formatTRY(String(order.discountTotal))}</span>
            </div>
          ) : null}
          {Number(order.shippingTotal) > 0 ? (
            <div className="flex justify-between text-[color:var(--muted)]">
              <span>Kargo</span>
              <span>{formatTRY(String(order.shippingTotal))}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-[color:var(--muted)]">
            <span>KDV (%{KDV_RATE_PERCENT}, fiyata dahildir)</span>
            <span>{formatTRY(kdvTotal)}</span>
          </div>
          <div className="flex justify-between border-t border-[color:var(--border)] pt-2 text-base font-extrabold text-[color:var(--foreground)]">
            <span>Genel Toplam (KDV Dahil)</span>
            <span>{formatTRY(String(order.total))}</span>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[color:var(--muted)]">
          Bu belge, resmi bir e-fatura/e-arşiv fatura değildir. Ödeme durumu:{" "}
          {order.payment?.status === "SUCCEEDED" ? "Ödendi" : "Beklemede"}.
        </p>
      </div>
    </main>
  );
}
