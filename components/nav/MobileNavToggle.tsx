"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { signOutAction } from "@/app/actions/sign-out";

export function MobileNavToggle({ links, isSignedIn, cartCount = 0, favoriteCount = 0, examLinks, yokdilLinks }: { links: readonly { href: string; label: string }[]; isSignedIn: boolean; cartCount?: number; favoriteCount?: number; examLinks: readonly { href: string; label: string }[]; yokdilLinks: readonly { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="xl:hidden">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Menüyü Kapat" : "Menüyü Aç"} className="ghost-button px-2.5">
        <span className="text-xl leading-none">{open ? "✕" : "☰"}</span>
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 top-[76px] z-40 bg-black/30" onClick={close} aria-hidden />
          <nav id="mobile-navigation" className="fixed inset-x-0 top-[76px] z-50 flex flex-col gap-1 border-b border-[color:var(--border)] bg-white px-4 py-4 shadow-lg">
            <details className="group rounded-xl">
              <summary className="cursor-pointer list-none rounded-xl px-3 py-3 text-sm font-bold text-[color:var(--foreground)] hover:bg-[color:var(--brand-soft)]">Sınavlar</summary>
              <div className="ml-3 border-l border-[color:var(--border)] pl-2">
                {examLinks.map((link) => <Link key={link.href} href={link.href} onClick={close} className="block rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-[color:var(--brand-soft)]">{link.label}</Link>)}
                <details><summary className="cursor-pointer list-none rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-[color:var(--brand-soft)]">YÖKDİL alanları</summary><div className="ml-3 border-l border-[color:var(--border)] pl-2">{yokdilLinks.map((link) => <Link key={link.href} href={link.href} onClick={close} className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-[color:var(--brand-soft)]">{link.label}</Link>)}</div></details>
              </div>
            </details>
            {links.filter((link) => link.href !== "/exams").map((link) => (
              <Link key={link.href} href={link.href} onClick={close} className="rounded-xl px-3 py-3 text-sm font-bold text-[color:var(--brand)] transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--accent-strong)]">
                {link.label}
              </Link>
            ))}
            <div className="my-2 border-t border-[color:var(--border)]" />
            <Link href="/dashboard/favoriler" onClick={close} className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-[color:var(--brand)] transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--accent-strong)]">
              <Heart size={18} aria-hidden="true" />
              Favorilerim
              {favoriteCount ? <span className="rounded-full bg-[color:var(--accent)] px-2 text-[11px] font-black leading-5 text-white">{favoriteCount}</span> : null}
            </Link>
            <Link href="/cart" onClick={close} className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-[color:var(--brand)] transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--accent-strong)]">
              <ShoppingCart size={18} aria-hidden="true" />
              Sepetim
              {cartCount ? <span className="rounded-full bg-[color:var(--accent)] px-2 text-[11px] font-black leading-5 text-white">{cartCount}</span> : null}
            </Link>
            {isSignedIn ? (
              <>
                <Link href="/dashboard" onClick={close} className="rounded-xl px-3 py-3 text-sm font-bold text-[color:var(--brand)] transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--accent-strong)]">
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
                <Link href="/sign-in" onClick={close} className="rounded-xl px-3 py-3 text-sm font-bold text-[color:var(--brand)] transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--accent-strong)]">
                  Üye Girişi
                </Link>
                <Link href="/register" onClick={close} className="primary-button mx-3 mt-2 justify-center">
                  Üye Ol
                </Link>
              </>
            )}
          </nav>
        </>
      ) : null}
    </div>
  );
}
