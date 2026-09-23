"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

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

const PROPERTY_ID = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
const WIDGET_ID = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

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

  useEffect(() => {
    if (!isLiveChatConfigured || document.getElementById("tawk-script")) return;
    window.Tawk_API = window.Tawk_API ?? {};
    window.Tawk_LoadStart = new Date();
    const script = document.createElement("script");
    script.id = "tawk-script";
    script.async = true;
    script.src = `https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const api = window.Tawk_API;
    if (!api) return;
    const apply = () => (hiddenOn(pathname) ? api.hideWidget?.() : api.showWidget?.());
    if (api.hideWidget) apply();
    else api.onLoad = apply;
  }, [pathname]);

  return null;
}

/** Opens the chat window from a button (Yardım Masası page); falls back to e-mail when chat isn't set up. */
export function OpenLiveChatButton({ fallbackEmail, className }: { fallbackEmail: string; className?: string }) {
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
