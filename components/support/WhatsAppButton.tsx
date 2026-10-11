"use client";

import { usePathname } from "next/navigation";
import { WHATSAPP_NUMBER, whatsappLink } from "@/lib/social";

/** Logged-in areas and exam screens have their own support; the button is for visitors deciding to buy. */
function hiddenOn(pathname: string) {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/seviye-tespit") || pathname.startsWith("/checkout");
}

/**
 * Floating "WhatsApp'tan yaz" button on public pages (bottom left; live chat sits bottom right).
 * A plain wa.me link — no script, no cookies — with a prefilled message naming the page.
 */
export function WhatsAppButton() {
  const pathname = usePathname();
  if (!WHATSAPP_NUMBER || hiddenOn(pathname)) return null;
  return (
    <a
      href={whatsappLink(WHATSAPP_NUMBER, `netfener.com${pathname === "/" ? "" : pathname}`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp'tan yaz"
      className="group fixed bottom-5 left-4 z-50 flex items-center gap-2 rounded-full bg-[#25d366] py-3 pl-3 pr-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,.2)] transition hover:bg-[#1ebe5b] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25d366]/40 sm:pr-4 print:hidden"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" className="size-6 shrink-0 fill-current">
        <path d="M16.02 3.2c-7.06 0-12.8 5.7-12.8 12.73 0 2.25.6 4.45 1.72 6.38L3.12 28.8l6.67-1.75a12.85 12.85 0 0 0 6.23 1.6h.01c7.05 0 12.79-5.71 12.79-12.73 0-3.4-1.33-6.6-3.75-9A12.73 12.73 0 0 0 16.02 3.2Zm0 23.3h-.01a10.66 10.66 0 0 1-5.42-1.48l-.39-.23-3.96 1.04 1.06-3.85-.25-.4a10.5 10.5 0 0 1-1.63-5.65c0-5.85 4.77-10.6 10.62-10.6 2.84 0 5.5 1.1 7.5 3.1a10.5 10.5 0 0 1 3.1 7.5c0 5.85-4.77 10.57-10.62 10.57Zm5.83-7.92c-.32-.16-1.89-.93-2.18-1.03-.29-.11-.5-.16-.72.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.58a9.63 9.63 0 0 1-1.78-2.2c-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.72-.98-2.36-.26-.62-.52-.53-.72-.54h-.61c-.21 0-.56.08-.85.4-.29.31-1.12 1.09-1.12 2.66 0 1.57 1.14 3.09 1.3 3.3.16.21 2.25 3.42 5.45 4.8.76.33 1.36.52 1.82.67.77.24 1.46.2 2.01.12.61-.09 1.89-.77 2.15-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
      </svg>
      <span className="hidden sm:inline">WhatsApp&apos;tan yaz</span>
    </a>
  );
}
