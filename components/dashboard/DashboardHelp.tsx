"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Activity stays in this browser. One offer per dashboard session. */
export function DashboardHelp({ userKey, whatsappUrl, freeAccess = false }: { userKey: string; whatsappUrl: string; freeAccess?: boolean }) {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const lastActivity = useRef(0);
  const visits = useRef<number[]>([]);
  const offered = useRef(false);
  const storageKey = `dashboard-help:${userKey}`;

  useEffect(() => {
    function suppressed() {
      return document.visibilityState !== "visible" || document.activeElement?.matches("input, textarea, select, [contenteditable='true']") || document.querySelector("dialog[open], [role='dialog']") || [...document.querySelectorAll<HTMLMediaElement>("video,audio")].some(media => !media.paused && !media.ended);
    }
    function offer() {
      if (offered.current || suppressed()) return;
      try { if (sessionStorage.getItem(storageKey)) return; } catch { /* Session storage may be disabled. */ }
      if (!dialog.current) return;
      dialog.current.showModal();
      offered.current = true;
      try { sessionStorage.setItem(storageKey, "shown"); } catch { /* Memory guard still applies. */ }
    }
    const now = Date.now();
    visits.current = [...visits.current.filter(time => now - time < 20000), now];
    lastActivity.current = now;
    if (visits.current.length >= 6) offer();
    const activity = () => { lastActivity.current = Date.now(); };
    const events = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart", "focus", "visibilitychange"];
    for (const event of events) window.addEventListener(event, activity, { passive: true });
    const timer = window.setInterval(() => { if (Date.now() - lastActivity.current >= 30000) offer(); }, 1000);
    return () => { window.clearInterval(timer); for (const event of events) window.removeEventListener(event, activity); };
  }, [pathname, storageKey]);

  return <dialog ref={dialog} aria-labelledby="dashboard-help-title" className="fixed inset-0 m-auto w-[min(92vw,440px)] rounded-3xl border border-slate-200 bg-white p-7 text-slate-900 shadow-2xl backdrop:bg-slate-950/40">
    <h2 id="dashboard-help-title" className="text-xl font-semibold">Yardıma ihtiyacın var mı?</h2>
    <p className="mt-3 text-sm leading-7 text-slate-600">Panelde aradığını bulmana yardımcı olabiliriz.{freeAccess ? " Ücretsiz erişimin boyunca WhatsApp üzerinden ücretsiz destek alabilirsin." : " WhatsApp üzerinden bize yazabilirsin."}</p>
    <div className="mt-6 flex flex-wrap gap-3"><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => dialog.current?.close()} className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white">WhatsApp’tan yardım al</a><button type="button" onClick={() => dialog.current?.close()} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold">Şimdilik gerek yok</button></div>
  </dialog>;
}
