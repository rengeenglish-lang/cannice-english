"use client";
import Link from "next/link";
import { useEffect } from "react";

/** Sends one aggregate view beacon per page load. Skipped when the browser signals DNT/GPC. */
export function ArticleViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.globalPrivacyControl || nav.doNotTrack === "1") return;
    let ref: string | undefined;
    try {
      ref = document.referrer ? new URL(document.referrer).origin : undefined;
    } catch {
      ref = undefined;
    }
    const body = JSON.stringify({ slug, ...(ref ? { ref } : {}) });
    if (!navigator.sendBeacon?.("/api/seo/view", new Blob([body], { type: "application/json" })))
      void fetch("/api/seo/view", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => undefined);
  }, [slug]);
  return null;
}

export function ArticleSignupCta({ slug }: { slug: string }) {
  return (
    <aside className="panel mt-8 space-y-3" aria-label="Netfener'e katıl">
      <h2 className="text-xl font-bold">Sınavına planlı hazırlan</h2>
      <p className="text-slate-700">Ücretsiz hesap oluştur; seviye tespiti ve konu anlatımlarının ilk bölümlerini dene.</p>
      <Link href={`/register?src=blog.${slug}`} className="primary-button inline-block">
        Ücretsiz üye ol
      </Link>
    </aside>
  );
}
