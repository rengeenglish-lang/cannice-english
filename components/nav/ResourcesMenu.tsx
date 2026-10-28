"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ResourcesMenu({ links }: { links: readonly { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return <div ref={root} className="relative" onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  }}>
    <button ref={trigger} type="button" aria-expanded={open} aria-controls="resources-navigation" onClick={() => setOpen(!open)} className="flex min-h-11 items-center gap-1 rounded-lg px-1 text-sm font-medium text-[color:var(--muted)] transition hover:text-[color:var(--brand-ink)] focus-visible:outline-2 focus-visible:outline-[color:var(--accent)]">Kaynaklar <ChevronDown size={15} aria-hidden="true" /></button>
    {open ? <div id="resources-navigation" className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-2 shadow-[var(--shadow-md)]">
      {links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--canvas)] focus-visible:outline-2 focus-visible:outline-[color:var(--accent)]">{link.label}</Link>)}
    </div> : null}
  </div>;
}
