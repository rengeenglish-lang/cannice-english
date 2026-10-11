"use client";

import { useSyncExternalStore } from "react";
import { COOKIE_CONSENT_MAX_AGE, COOKIE_CONSENT_NAME, parseCookieConsent, serializeCookieConsent, type CookieChoices, type CookieConsent } from "@/lib/consent";

/**
 * The visitor's cookie choice lives in one first-party cookie. Components subscribe through
 * useCookieConsent(); saving fires an event so the banner, the footer link and the live-chat
 * loader all update at once.
 */
const CHANGE = "nf-cookie-consent";
const OPEN = "nf-cookie-preferences";

function readRaw() {
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE_CONSENT_NAME}=`));
  return match ? match.slice(COOKIE_CONSENT_NAME.length + 1) : "";
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE, onChange);
  return () => window.removeEventListener(CHANGE, onChange);
}

/** undefined while rendering on the server; null when the visitor hasn't chosen yet. */
export function useCookieConsent(): CookieConsent | null | undefined {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "\u0000server");
  if (raw === "\u0000server") return undefined;
  return parseCookieConsent(raw);
}

export function saveCookieConsent(choices: CookieChoices) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_CONSENT_NAME}=${serializeCookieConsent(choices)}; Max-Age=${COOKIE_CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(CHANGE));
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN));
}

export function onOpenCookiePreferences(handler: () => void) {
  window.addEventListener(OPEN, handler);
  return () => window.removeEventListener(OPEN, handler);
}
