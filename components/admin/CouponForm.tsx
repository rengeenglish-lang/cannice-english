"use client";

import { useActionState } from "react";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

const initialState: AdminFormState = { status: "idle" };

type Coupon = {
  code: string; type: "PERCENT" | "FIXED"; value: unknown; description: string | null;
  isActive: boolean; isPublic: boolean; minOrderAmount: unknown; maxRedemptions: number | null;
  expiresAt: Date | null;
} | null;

export function CouponForm({
  coupon,
  action,
}: {
  coupon: Coupon;
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="panel space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="code">Kupon Kodu</label>
          <input id="code" name="code" required defaultValue={coupon?.code} placeholder="PASS25" className="auth-input uppercase" />
        </div>
        <div>
          <label className="label" htmlFor="description">Açıklama (opsiyonel)</label>
          <input id="description" name="description" defaultValue={coupon?.description ?? ""} className="auth-input" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="type">Tip</label>
          <select id="type" name="type" defaultValue={coupon?.type ?? "PERCENT"} className="auth-input">
            <option value="PERCENT">Yüzde (%)</option>
            <option value="FIXED">Sabit Tutar (TL)</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="value">Değer</label>
          <input id="value" name="value" type="number" step="0.01" required defaultValue={coupon ? String(coupon.value) : ""} className="auth-input" />
        </div>
        <div>
          <label className="label" htmlFor="minOrderAmount">Min. Sepet Tutarı (opsiyonel)</label>
          <input id="minOrderAmount" name="minOrderAmount" type="number" step="0.01" defaultValue={coupon?.minOrderAmount ? String(coupon.minOrderAmount) : ""} className="auth-input" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="maxRedemptions">Maksimum Kullanım (opsiyonel)</label>
          <input id="maxRedemptions" name="maxRedemptions" type="number" defaultValue={coupon?.maxRedemptions ?? ""} className="auth-input" />
        </div>
        <div>
          <label className="label" htmlFor="expiresAt">Son Kullanım Tarihi (opsiyonel)</label>
          <input id="expiresAt" name="expiresAt" type="date" defaultValue={coupon?.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 10) : ""} className="auth-input" />
        </div>
      </div>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-[color:var(--foreground)]">
          <input type="checkbox" name="isActive" defaultChecked={coupon?.isActive ?? true} className="size-4" /> Aktif
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-[color:var(--foreground)]">
          <input type="checkbox" name="isPublic" defaultChecked={coupon?.isPublic ?? false} className="size-4" /> Kampanyalar sayfasında göster
        </label>
      </div>
      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="primary-button">{pending ? "Kaydediliyor…" : "Kaydet"}</button>
    </form>
  );
}
