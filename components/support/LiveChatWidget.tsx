"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { openCookiePreferences, useCookieConsent } from "@/components/consent/cookie-consent-store";

type TawkApi = {
  onLoad?: () => void;
  hideWidget?: () => void;
  showWidget?: () => void;
  maximize?: () => void;
  customStyle?: Record<string, unknown>;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
  }
}

// Netfener's Tawk.to widget. These IDs are public (they appear in every visitor's page
// source); the env vars only exist to point a staging deploy at a different widget.
const PROPERTY_ID = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || "6ab37e2fd971a1344458da5c";
const WIDGET_ID = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || "1k36i9qc3";

/** Timed exam screens and the admin panel stay distraction-free — the bubble is hidden there. */
function hiddenOn(pathname: string) {
  return pathname.startsWith("/dashboard/sinav") || pathname.startsWith("/admin");
}

export const isLiveChatConfigured = Boolean(PROPERTY_ID && WIDGET_ID);

/**
 * Tawk.to live chat (Yardım Masası). Loads Tawk's own embed script once, site-wide, only when
 * NEXT_PUBLIC_TAWK_PROPERTY_ID / NEXT_PUBLIC_TAWK_WIDGET_ID are set. The widget's language and
 * greeting are configured in the Tawk.to dashboard (set it to Türkçe there).
 */
export function LiveChatWidget() {
  const pathname = usePathname();
  // Tawk.to sets its own cookies, so it only loads after "İşlevsel çerezler" is allowed.
  const allowed = useCookieConsent()?.functional === true;

  useEffect(() => {
    if (!allowed) {
      window.Tawk_API?.hideWidget?.(); // consent withdrawn after loading: at least take it off screen
      return;
    }
    if (!isLiveChatConfigured || document.getElementById("tawk-script")) {
      window.Tawk_API?.showWidget?.();
      return;
    }
    window.Tawk_API = window.Tawk_API ?? {};
    window.Tawk_LoadStart = new Date();
    const script = document.createElement("script");
    script.id = "tawk-script";
    script.async = true;
    script.src = `https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);
  }, [allowed]);

  useEffect(() => {
    const api = window.Tawk_API;
    if (!api || !allowed) return;
    const apply = () => (hiddenOn(pathname) ? api.hideWidget?.() : api.showWidget?.());
    if (api.hideWidget) apply();
    else api.onLoad = apply;
  }, [pathname, allowed]);

  return null;
}

/**
 * Opens the chat window from a button (Yardım Masası page); falls back to e-mail when chat isn't
 * set up, and asks for the functional-cookie permission when the visitor hasn't given it.
 */
export function OpenLiveChatButton({ fallbackEmail, className }: { fallbackEmail: string; className?: string }) {
  const allowed = useCookieConsent()?.functional === true;
  if (isLiveChatConfigured && !allowed) {
    return (
      <button type="button" className={className} onClick={openCookiePreferences} title="Canlı destek, işlevsel çerezlere izin verildiğinde açılır.">
        Canlı destek için çerez izni ver
      </button>
    );
  }
  if (!isLiveChatConfigured) {
    return (
      <a href={`mailto:${fallbackEmail}`} className={className}>
        E-posta ile yaz
      </a>
    );
  }
  return (
    <button type="button" className={className} onClick={() => window.Tawk_API?.maximize?.()}>
      Canlı destekle konuş
    </button>
  );
}
