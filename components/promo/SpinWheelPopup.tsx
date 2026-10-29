"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useCookieConsent } from "@/components/consent/cookie-consent-store";
import { enterWheelAction } from "@/app/actions/wheel";
import { WHEEL_PRIZES } from "@/lib/wheel-prizes";

const SEEN_KEY = "netfener-wheel-seen";
const SHOW_AFTER_MS = 8000;
const SPIN_MS = 4600;
const SEGMENT = 360 / WHEEL_PRIZES.length;

function wasSeen() {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Private mode: the popup may show again on the next visit.
  }
}

/** Point on the wheel (viewBox 200×200, centre 100,100) at `angle` degrees clockwise from the top. */
function point(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180;
  return [100 + radius * Math.sin(rad), 100 - radius * Math.cos(rad)];
}

function slicePath(index: number) {
  const start = index * SEGMENT;
  const [x1, y1] = point(start, 100);
  const [x2, y2] = point(start + SEGMENT, 100);
  return `M100 100 L${x1} ${y1} A100 100 0 ${SEGMENT > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
}

export function SpinWheelPopup() {
  const consent = useCookieConsent();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  // Wait until the visitor has answered the cookie banner, so the two never overlap.
  useEffect(() => {
    if (!consent || wasSeen()) return;
    const timer = window.setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [consent]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard") || !open) return null;

  function close() {
    markSeen();
    setOpen(false);
  }

  function spin(prizeIndex: number) {
    // Turn so the winning slice's centre lands under the pointer at the top, after several full turns.
    const center = (prizeIndex + 0.5) * SEGMENT;
    const forward = (((-center - rotation) % 360) + 360) % 360;
    setRotation(rotation + forward + 5 * 360);
    setSpinning(true);
    window.setTimeout(() => {
      setSpinning(false);
      setWinner(prizeIndex);
    }, SPIN_MS);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await enterWheelAction({ email, consent: agreed });
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      markSeen();
      spin(result.prizeIndex);
    });
  }

  const prize = winner === null ? null : WHEEL_PRIZES[winner];
  const hasSpun = winner !== null || spinning;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4" role="presentation" onClick={(e) => { if (e.target === e.currentTarget && !spinning) close(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="wheel-title" className="relative grid w-full max-w-3xl gap-6 rounded-3xl bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,.35)] sm:p-8 md:grid-cols-2">
        <button type="button" onClick={close} disabled={spinning} aria-label="Kapat" className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-full text-2xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-40">
          ×
        </button>

        <div className="relative mx-auto aspect-square w-full max-w-[300px]">
          <div aria-hidden="true" className="absolute left-1/2 top-0 z-10 -translate-x-1/2" style={{ width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderTop: "24px solid #0f172a" }} />
          <svg viewBox="0 0 200 200" role="img" aria-label="Şans çarkı" className="size-full" style={{ transform: `rotate(${rotation}deg)`, transition: `transform ${SPIN_MS}ms cubic-bezier(.17,.67,.12,.99)` }}>
            {WHEEL_PRIZES.map((p, i) => {
              const center = (i + 0.5) * SEGMENT;
              const [lx, ly] = point(center, 62);
              return (
                <g key={p.id}>
                  <path d={slicePath(i)} fill={p.color} stroke="#ffffff" strokeWidth="1" />
                  <text x={lx} y={ly} transform={`rotate(${center - 90} ${lx} ${ly})`} textAnchor="middle" dominantBaseline="middle" fill="#ffffff" fontSize="10" fontWeight="700">
                    {p.label}
                  </text>
                </g>
              );
            })}
            <circle cx="100" cy="100" r="18" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
            <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" fill="#0f172a" fontSize="10" fontWeight="700">NF</text>
          </svg>
        </div>

        <div className="flex flex-col justify-center">
          {winner === null ? (
            <>
              <h2 id="wheel-title" className="text-2xl font-extrabold leading-tight text-slate-900">Çarkı çevir, ödülünü kap</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                E-posta adresini gir, çarkı bir kez çevir. Her e-posta adresi çarkı yalnızca bir kez çevirebilir.
              </p>

              {hasSpun ? (
                <p role="status" className="mt-6 text-base font-bold text-slate-800">Çark dönüyor…</p>
              ) : (
                <form onSubmit={submit} className="mt-5 space-y-3" noValidate>
                  <label className="block text-sm font-semibold text-slate-800">
                    E-posta
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@eposta.com"
                      autoComplete="email"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base font-normal outline-none focus:border-[color:var(--accent)]"
                    />
                  </label>
                  <label className="flex items-start gap-2 text-xs leading-5 text-slate-600">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
                    <span>
                      Kampanya e-postaları almak ve <Link href="/legal/aydinlatma-metni" className="font-semibold underline">Aydınlatma Metni</Link> kapsamında kişisel verilerimin işlenmesini onaylıyorum.
                    </span>
                  </label>
                  {error ? <p role="alert" className="text-sm font-semibold text-red-600">{error}</p> : null}
                  <button type="submit" disabled={pending} className="w-full rounded-lg bg-[color:var(--accent)] py-3 text-base font-extrabold text-white transition hover:bg-[color:var(--accent-strong)] disabled:opacity-60">
                    {pending ? "Kontrol ediliyor…" : "Çarkı çevir"}
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              <h2 id="wheel-title" className="text-2xl font-extrabold leading-tight text-slate-900">Tebrikler!</h2>
              <p className="mt-3 text-lg text-slate-800">
                Kazandığın ödül: <span className="font-extrabold">{prize?.title}</span>
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Ödülünün ayrıntılarını e-posta adresine göndereceğiz.</p>
              <button type="button" onClick={close} className="mt-6 w-full rounded-lg bg-[color:var(--accent)] py-3 text-base font-extrabold text-white transition hover:bg-[color:var(--accent-strong)]">
                Tamam
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
