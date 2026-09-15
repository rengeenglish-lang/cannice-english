import Link from "next/link";
import type { Metadata } from "next";
import { listCouponsForAdmin } from "@/server/services/coupons.service";
import { deleteCouponAction } from "@/app/actions/admin-coupons";
import { formatTRY } from "@/lib/pricing";

export const metadata: Metadata = { title: "Kuponlar" };

export default async function AdminCouponsPage() {
  const coupons = await listCouponsForAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Yönetim</p>
          <h1 className="page-title">Kuponlar</h1>
        </div>
        <Link href="/admin/coupons/new" className="primary-button">Yeni Kupon</Link>
      </div>
      <div className="dashboard-panel mt-8 overflow-x-auto">
        <table className="dashboard-table">
          <thead>
            <tr><th>Kod</th><th>İndirim</th><th>Kullanım</th><th>Durum</th><th></th></tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td className="font-mono font-bold text-[color:var(--foreground)]">{coupon.code}</td>
                <td>{coupon.type === "PERCENT" ? `%${coupon.value}` : formatTRY(String(coupon.value))}</td>
                <td>{coupon.redemptionCount}{coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ""}</td>
                <td>{coupon.isActive ? "Aktif" : "Pasif"}{coupon.isPublic ? " · Kampanyalarda" : ""}</td>
                <td className="whitespace-nowrap">
                  <Link href={`/admin/coupons/${coupon.id}`} className="ghost-button">Düzenle</Link>
                  <form action={async () => { "use server"; await deleteCouponAction(coupon.id); }} className="inline">
                    <button type="submit" className="ghost-button text-[color:var(--danger)]">Sil</button>
                  </form>
                </td>
              </tr>
            ))}
            {coupons.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-slate-400">Henüz kupon eklenmedi.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
