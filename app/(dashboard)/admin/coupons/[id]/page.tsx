import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCoupon } from "@/server/services/coupons.service";
import { updateCouponAction } from "@/app/actions/admin-coupons";
import { CouponForm } from "@/components/admin/CouponForm";

export const metadata: Metadata = { title: "Kuponu Düzenle" };

type Props = { params: Promise<{ id: string }> };

export default async function EditCouponPage({ params }: Props) {
  const { id } = await params;
  const coupon = await getCoupon(id);
  if (!coupon) notFound();

  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">Kuponu Düzenle</h1>
      <div className="mt-8 max-w-2xl">
        <CouponForm coupon={coupon} action={updateCouponAction.bind(null, id)} />
      </div>
    </div>
  );
}
