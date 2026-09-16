"use client";

import { useState } from "react";
import Link from "next/link";
import { signOutAction } from "@/app/actions/sign-out";

export function MobileNavToggle({ links, isSignedIn }: { links: { href: string; label: string }[]; isSignedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="xl:hidden">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Menüyü Kapat" : "Menüyü Aç"} className="ghost-button px-2.5">
        <span className="text-xl leading-none">{open ? "✕" : "☰"}</span>
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 top-[76px] z-40 bg-black/30" onClick={close} aria-hidden />
          <nav className="fixed inset-x-0 top-[76px] z-50 flex flex-col gap-1 border-b border-[color:var(--border)] bg-white px-4 py-4 shadow-lg">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={close} className="rounded-xl px-3 py-3 text-sm font-bold text-[color:var(--foreground)] transition hover:bg-[color:var(--brand-soft)]">
                {link.label}
              </Link>
            ))}
            <div className="my-2 border-t border-[color:var(--border)]" />
            <Link href="/cart" onClick={close} className="rounded-xl px-3 py-3 text-sm font-bold text-[color:var(--foreground)] transition hover:bg-[color:var(--brand-soft)]">
              Sepetim
            </Link>
            {isSignedIn ? (
              <>
                <Link href="/dashboard" onClick={close} className="rounded-xl px-3 py-3 text-sm font-bold text-[color:var(--foreground)] transition hover:bg-[color:var(--brand-soft)]">
                  Hesabım
                </Link>
                <form action={signOutAction}>
                  <button type="submit" onClick={close} className="w-full rounded-xl px-3 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50">
                    Çıkış Yap
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/sign-in" onClick={close} className="rounded-xl px-3 py-3 text-sm font-bold text-[color:var(--foreground)] transition hover:bg-[color:var(--brand-soft)]">
                  Üye Girişi
                </Link>
                <Link href="/register" onClick={close} className="primary-button mx-3 mt-2 justify-center">
                  Ücretsiz Dene
                </Link>
              </>
            )}
          </nav>
        </>
      ) : null}
    </div>
  );
}
