"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { COOKIE_CATEGORIES, type CookieChoices } from "@/lib/consent";
import { onOpenCookiePreferences, openCookiePreferences, saveCookieConsent, useCookieConsent } from "@/components/consent/cookie-consent-store";

const ALL: CookieChoices = { functional: true, analytics: true, marketing: true };
const NONE: CookieChoices = { functional: false, analytics: false, marketing: false };

/**
 * KVKK-style cookie banner: "Tümünü reddet" and "Tümünü kabul et" are equally prominent,
 * non-essential categories start off, and the choice can be changed any time from the footer.
 */
export function CookieBanner() {
  const consent = useCookieConsent();
  const [reopened, setReopened] = useState(false);
  const [details, setDetails] = useState(false);
  const [draft, setDraft] = useState<CookieChoices | null>(null);

  useEffect(
    () =>
      onOpenCookiePreferences(() => {
        setReopened(true);
        setDetails(true);
        setDraft(null);
      }),
    [],
  );

  if (consent === undefined) return null; // server render: decide in the browser
  if (consent && !reopened) return null;

  const current: CookieChoices = draft ?? (consent ? { functional: consent.functional, analytics: consent.analytics, marketing: consent.marketing } : NONE);
  const choose = (choices: CookieChoices) => {
    saveCookieConsent(choices);
    setReopened(false);
    setDetails(false);
    setDraft(null);
  };
  const button = "inline-flex min-h-10 items-center justify-center rounded-lg border-2 border-[color:var(--brand)] px-4 text-sm font-bold transition";

  return (
    <div role="dialog" aria-modal="false" aria-labelledby="cookie-title" className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4 print:hidden">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[color:var(--border)] bg-white p-4 text-slate-800 shadow-[0_12px_40px_rgba(15,23,42,.18)] sm:p-5">
        <p id="cookie-title" className="font-extrabold">Çerez tercihlerin</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Netfener, sitenin çalışması için zorunlu çerezleri kullanır. İzin verirsen canlı destek için işlevsel çerezler de kullanılır. Tercihini istediğin zaman sayfanın altındaki “Çerez tercihleri” bağlantısından değiştirebilirsin.{" "}
          <Link href="/legal/cerez-politikasi" className="font-semibold underline">Çerez Politikası</Link>
        </p>

        {details ? (
          <div className="mt-3 space-y-2">
            {COOKIE_CATEGORIES.map((c) => {
              const locked = c.key === "necessary";
              const checked = locked ? true : current[c.key as keyof CookieChoices];
              return (
                <label key={c.key} className="flex items-start gap-3 rounded-lg border border-[color:var(--border)] p-3">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 shrink-0"
                    checked={checked}
                    disabled={locked}
                    onChange={(e) => !locked && setDraft({ ...current, [c.key]: e.target.checked })}
                  />
                  <span>
                    <span className="block text-sm font-bold">{c.title}{locked ? " (her zaman açık)" : ""}</span>
                    <span className="block text-xs leading-5 text-slate-600">{c.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => choose(NONE)} className={`${button} bg-white text-[color:var(--brand)] hover:bg-[color:var(--canvas)]`}>Tümünü reddet</button>
          <button type="button" onClick={() => choose(ALL)} className={`${button} bg-white text-[color:var(--brand)] hover:bg-[color:var(--canvas)]`}>Tümünü kabul et</button>
          {details ? (
            <button type="button" onClick={() => choose(current)} className={`${button} bg-[color:var(--brand)] text-white`}>Seçimlerimi kaydet</button>
          ) : (
            <button type="button" onClick={() => setDetails(true)} className="ml-auto text-sm font-bold text-[color:var(--brand)] underline">Tercihleri yönet</button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Footer link that reopens the banner with the current choices. */
export function CookiePreferencesLink({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={openCookiePreferences}>
      Çerez tercihleri
    </button>
  );
}
