"use client";

import { useState } from "react";
import Link from "next/link";
import { signOutAction } from "@/app/actions/sign-out";

type Role = "STUDENT" | "TEACHER" | "ADMIN";

export function DashboardShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const isStaff = role === "TEACHER" || role === "ADMIN";
  const close = () => setOpen(false);

  return (
    <div className="dashboard-frame lg:grid-cols-[280px_1fr]">
      {open ? <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={close} aria-hidden /> : null}

      <aside className={`dashboard-sidebar p-4 transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <Link href="/" className="mb-6 flex items-center gap-2 px-2" onClick={close}>
          <span className="grid size-9 place-items-center rounded-2xl bg-gradient-to-br from-[color:var(--accent)] to-[#0f9b8e] text-sm font-extrabold text-white">C</span>
          <span className="font-extrabold text-[color:var(--foreground)]">Cannice English</span>
        </Link>
        <nav className="space-y-1">
          <Link href="/dashboard" className="dashboard-nav-item" onClick={close}>Panelim</Link>
          <Link href="/packages" className="dashboard-nav-item" onClick={close}>Paketlere Göz At</Link>
          {isStaff ? (
            <>
              <p className="mb-1 mt-6 px-3 text-[10px] font-black uppercase tracking-[.2em] text-slate-400">Yönetim</p>
              <Link href="/admin" className="dashboard-nav-item" onClick={close}>Genel Bakış</Link>
              <Link href="/admin/orders" className="dashboard-nav-item" onClick={close}>Siparişler</Link>
              <Link href="/admin/coupons" className="dashboard-nav-item" onClick={close}>Kuponlar</Link>
              <Link href="/admin/products" className="dashboard-nav-item" onClick={close}>Ürünler</Link>
              <Link href="/admin/testimonials" className="dashboard-nav-item" onClick={close}>Katılımcı Görüşleri</Link>
              <Link href="/admin/blog" className="dashboard-nav-item" onClick={close}>Blog</Link>
              <Link href="/admin/submissions" className="dashboard-nav-item" onClick={close}>Değerlendirmeler</Link>
              <Link href="/admin/leads" className="dashboard-nav-item" onClick={close}>Gelen Talepler</Link>
            </>
          ) : null}
        </nav>
        <form action={signOutAction} className="mt-auto pt-4">
          <button type="submit" className="dashboard-nav-item w-full text-red-600 hover:bg-red-50 hover:text-red-700">
            Çıkış Yap
          </button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-col">
        <div className="flex h-14 items-center gap-3 border-b border-[color:var(--border)] bg-white px-4 lg:hidden">
          <button type="button" onClick={() => setOpen(true)} aria-label="Menüyü Aç" className="ghost-button px-2.5">
            <span className="text-xl leading-none">☰</span>
          </button>
          <span className="font-extrabold text-[color:var(--foreground)]">Cannice English</span>
        </div>
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}
