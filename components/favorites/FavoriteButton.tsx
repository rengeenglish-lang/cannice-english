"use client";

import { useOptimistic, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleFavoriteAction } from "@/app/actions/favorites";

/**
 * Favorilerim heart. `icon` sits on a product card; `full` is the labelled button on detail pages.
 * Logged-out visitors are sent to sign in and brought back here.
 */
export function FavoriteButton({ productId, initial, variant = "icon", title }: { productId: string; initial: boolean; variant?: "icon" | "full"; title: string }) {
  const pathname = usePathname();
  const [isFavorite, setFavorite] = useOptimistic(initial);
  const [pending, startTransition] = useTransition();
  const label = isFavorite ? `${title} favorilerden çıkar` : `${title} favorilere ekle`;

  const toggle = () =>
    startTransition(async () => {
      setFavorite(!isFavorite);
      await toggleFavoriteAction(productId, pathname);
    });

  if (variant === "full") {
    return (
      <button type="button" onClick={toggle} disabled={pending} aria-pressed={isFavorite} aria-label={label} className="ghost-button gap-2 border border-[color:var(--border)]">
        <Heart size={18} aria-hidden="true" className={isFavorite ? "fill-rose-500 text-rose-500" : ""} />
        {isFavorite ? "Favorilerde" : "Favorilere ekle"}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={isFavorite}
      aria-label={label}
      title={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
      className="grid size-10 place-items-center rounded-full bg-white/95 shadow-md transition hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--brand-soft)]"
    >
      <Heart size={19} aria-hidden="true" className={isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-500"} />
    </button>
  );
}
