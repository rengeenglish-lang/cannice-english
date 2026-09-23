"use client";

import { useActionState } from "react";
import { applyCartCouponAction, removeCartCouponAction, type CouponFormState } from "@/app/actions/cart";

export function CartCouponForm({ appliedCode }: { appliedCode: string | null }) {
  const [state, action, pending] = useActionState(applyCartCouponAction, { status: "idle" } as CouponFormState);
  if (appliedCode) {
    return (
      <form action={removeCartCouponAction} className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span>Kupon: <strong className="uppercase">{appliedCode}</strong></span>
        <button type="submit" className="ghost-button text-xs">Kuponu kaldır</button>
      </form>
    );
  }
  return (
    <form action={action} className="space-y-2">
      <label className="label" htmlFor="cartCoupon">Kupon kodun var mı?</label>
      <div className="flex gap-2">
        <input id="cartCoupon" name="couponCode" placeholder="PASS25" className="auth-input !mt-0 uppercase" />
        <button type="submit" disabled={pending} className="secondary-button shrink-0">{pending ? "…" : "Uygula"}</button>
      </div>
      {state.status === "error" ? <p role="alert" className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
    </form>
  );
}
