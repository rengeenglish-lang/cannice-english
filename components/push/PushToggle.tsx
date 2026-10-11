"use client";

import { useEffect, useState } from "react";
import { BellRing, BellOff } from "lucide-react";
import { getPushPublicKeyAction, removePushSubscriptionAction, savePushSubscriptionAction } from "@/app/actions/push";

type State = "loading" | "unsupported" | "ios-install" | "blocked" | "off" | "on" | "busy";

function keyToBytes(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

/** "Telefon bildirimleri": turns Web Push on or off for this device. */
export function PushToggle() {
  const [state, setState] = useState<State>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let next: State;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) next = isIos() && !isStandalone() ? "ios-install" : "unsupported";
      else if (Notification.permission === "denied") next = "blocked";
      else {
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
        next = (await registration.pushManager.getSubscription()) ? "on" : "off";
      }
      if (!cancelled) setState(next);
    })().catch(() => !cancelled && setState("unsupported"));
    return () => {
      cancelled = true;
    };
  }, []);

  async function turnOn() {
    setState("busy");
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return setState(permission === "denied" ? "blocked" : "off");
      const key = await getPushPublicKeyAction();
      if (!key) throw new Error("no key");
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(key) });
      if (!(await savePushSubscriptionAction(JSON.parse(JSON.stringify(sub))))) throw new Error("save failed");
      setState("on");
    } catch {
      setError("Bildirimler açılamadı. Lütfen tekrar dene.");
      setState("off");
    }
  }

  async function turnOff() {
    setState("busy");
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    if (sub) {
      await removePushSubscriptionAction(sub.endpoint);
      await sub.unsubscribe();
    }
    setState("off");
  }

  const box = "flex flex-wrap items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-white p-4";
  if (state === "loading") return null;
  return (
    <div className={box}>
      {state === "on" ? <BellRing className="text-emerald-600" size={22} aria-hidden="true" /> : <BellOff className="text-[color:var(--muted)]" size={22} aria-hidden="true" />}
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-bold">Telefon bildirimleri</p>
        <p className="text-[color:var(--muted)]">
          {state === "on" && "Açık: bildirimlerin bu cihaza da geliyor."}
          {(state === "off" || state === "busy") && "Ders hatırlatmaları, sipariş ve koçluk bildirimleri telefonuna da gelsin."}
          {state === "blocked" && "Tarayıcı ayarlarında Netfener için bildirim izni kapalı. Açmak için adres çubuğundaki kilit simgesinden izin ver."}
          {state === "unsupported" && "Bu tarayıcı anlık bildirimleri desteklemiyor."}
          {state === "ios-install" && "iPhone/iPad'de önce Safari'de Paylaş → “Ana Ekrana Ekle” ile Netfener'i ekle, sonra uygulamadan bu sayfayı açıp bildirimleri aç."}
        </p>
        {error ? <p className="mt-1 font-semibold text-[color:var(--danger)]">{error}</p> : null}
      </div>
      {state === "off" || state === "busy" ? (
        <button type="button" onClick={turnOn} disabled={state === "busy"} className="primary-button text-sm">Bildirimleri aç</button>
      ) : state === "on" ? (
        <button type="button" onClick={turnOff} className="ghost-button text-sm">Kapat</button>
      ) : null}
    </div>
  );
}
