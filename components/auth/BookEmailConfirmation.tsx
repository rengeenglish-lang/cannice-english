"use client";
import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { confirmBookEmailAction, resendBookEmailAction, type BookEmailState } from "@/app/actions/book-email";

export function BookEmailConfirmation({ token }: { token: string }) {
  const [state, action, pending] = useActionState(confirmBookEmailAction, {} as BookEmailState);
  const form = useRef<HTMLFormElement>(null);
  const started = useRef(false);
  useEffect(() => { if (!started.current) { started.current = true; form.current?.requestSubmit(); } }, []);
  return <form action={action} ref={form} className="panel space-y-4 text-center">
    <input type="hidden" name="token" value={token} />
    <p role="status">{state.message ?? "E-postan doğrulanıyor, kitaplarına yönlendiriliyorsun…"}</p>
    <button type="submit" disabled={pending} className="primary-button">{pending ? "Kitapların açılıyor…" : "Doğrula ve kitaplarımı aç"}</button>
    {state.message ? <><Link className="secondary-button" href="/kitap-kaydini-tamamla">Yeni bağlantı iste</Link><Link className="ghost-button" href="/sign-in?next=%2Fdashboard%2Fbooks">Şifremle giriş yap</Link></> : null}
  </form>;
}

export function ResendBookEmailForm({ email = "" }: { email?: string }) {
  const [state, action, pending] = useActionState(resendBookEmailAction, {} as BookEmailState);
  return <form action={action} className="mt-6 space-y-3">
    <label className="label" htmlFor="book-email">Kayıt olduğun e-posta</label>
    <input id="book-email" name="email" type="email" defaultValue={email} required className="auth-input" />
    <button type="submit" disabled={pending} className="secondary-button">Bağlantıyı yeniden gönder</button>
    {state.message ? <p role="status" className="text-sm">{state.message}</p> : null}
  </form>;
}
