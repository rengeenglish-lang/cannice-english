"use client";

import { useState, useTransition } from "react";
import { approveSiteReviewAction, featureSiteReviewAction, rejectSiteReviewAction, toggleReviewPromotionAction } from "@/app/actions/site-reviews";

export function PromotionToggle({ on }: { on: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => toggleReviewPromotionAction(!on))}
      className={on ? "secondary-button text-sm" : "primary-button text-sm"}
    >
      {pending ? "Kaydediliyor…" : on ? "Kampanyayı durdur" : "Kampanyayı başlat"}
    </button>
  );
}

export function ReviewModeration({ id, status, featured }: { id: string; status: "PENDING" | "APPROVED" | "REJECTED"; featured: boolean }) {
  const [rejecting, setRejecting] = useState(false);
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "APPROVED" ? (
        <button type="button" disabled={pending} onClick={() => start(() => approveSiteReviewAction(id))} className="primary-button text-sm">Onayla ve yayınla</button>
      ) : (
        <button type="button" disabled={pending} onClick={() => start(() => featureSiteReviewAction(id, !featured))} className="secondary-button text-sm">
          {featured ? "Öne çıkarmayı kaldır" : "Ana sayfada öne çıkar"}
        </button>
      )}
      {status !== "REJECTED" ? (
        rejecting ? (
          <form action={(form) => start(() => rejectSiteReviewAction(id, form))} className="flex flex-wrap items-center gap-2">
            <input name="reason" placeholder="Neden (öğrenciye gösterilir)" className="auth-input !min-h-9 text-sm" />
            <button type="submit" disabled={pending} className="secondary-button text-sm text-[color:var(--danger)]">Reddet</button>
            <button type="button" onClick={() => setRejecting(false)} className="ghost-button text-sm">Vazgeç</button>
          </form>
        ) : (
          <button type="button" onClick={() => setRejecting(true)} className="ghost-button text-sm text-[color:var(--danger)]">{status === "APPROVED" ? "Yayından kaldır" : "Reddet"}</button>
        )
      ) : null}
    </div>
  );
}
