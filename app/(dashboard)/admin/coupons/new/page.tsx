import type { Metadata } from "next";
import { createCouponAction } from "@/app/actions/admin-coupons";
import { CouponForm } from "@/components/admin/CouponForm";

export const metadata: Metadata = { title: "Yeni Kupon" };

export default function NewCouponPage() {
  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">Yeni Kupon</h1>
      <div className="mt-8 max-w-2xl">
        <CouponForm coupon={null} action={createCouponAction} />
      </div>
    </div>
  );
}
