"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Archive, ArchiveRestore, Bell, BookOpen, CalendarDays, Check, CreditCard, GraduationCap, MessageCircle, RotateCcw, ShieldCheck, ShoppingBag, ShoppingCart, Trash2, Wrench, type LucideIcon } from "lucide-react";
import { deleteNotificationAction, setNotificationArchivedAction, setNotificationDoneAction } from "@/app/actions/notifications";

const CATEGORY: Record<string, { label: string; icon: LucideIcon; tone: string }> = {
  PURCHASE: { label: "Sipariş", icon: ShoppingBag, tone: "bg-emerald-100 text-emerald-800" },
  PAYMENT: { label: "Ödeme", icon: CreditCard, tone: "bg-amber-100 text-amber-800" },
  LESSON: { label: "Canlı ders", icon: CalendarDays, tone: "bg-sky-100 text-sky-800" },
  CART: { label: "Sepet", icon: ShoppingCart, tone: "bg-orange-100 text-orange-800" },
  COACHING: { label: "Koçluk", icon: GraduationCap, tone: "bg-violet-100 text-violet-800" },
  MESSAGE: { label: "Mesaj", icon: MessageCircle, tone: "bg-blue-100 text-blue-800" },
  RESULT: { label: "Sonuç", icon: BookOpen, tone: "bg-teal-100 text-teal-800" },
  ACCOUNT: { label: "Hesap", icon: ShieldCheck, tone: "bg-slate-100 text-slate-700" },
  ADMIN: { label: "Yönetim", icon: Wrench, tone: "bg-rose-100 text-rose-800" },
  SYSTEM: { label: "Bildirim", icon: Bell, tone: "bg-slate-100 text-slate-700" },
};

export function NotificationRow({
  id,
  category,
  title,
  body,
  href,
  isRead,
  archived,
  createdAt,
}: {
  id: string;
  category: string;
  title: string;
  body: string | null;
  href: string | null;
  isRead: boolean;
  archived: boolean;
  createdAt: string;
}) {
  const [pending, start] = useTransition();
  const meta = CATEGORY[category] ?? CATEGORY.SYSTEM;
  const Icon = meta.icon;
  const run = (fn: () => Promise<void>) => start(() => fn());
  const open = () => {
    if (!isRead) void setNotificationDoneAction(id, true);
  };

  const text = (
    <>
      <p className={`text-sm font-bold ${isRead ? "text-[color:var(--muted)]" : "text-[color:var(--foreground)]"}`}>
        {!isRead ? <span className="mr-2 inline-block size-2 rounded-full bg-[color:var(--accent)] align-middle" aria-label="Yeni" /> : null}
        {title}
      </p>
      {body ? <p className="mt-1 text-sm text-[color:var(--muted)]">{body}</p> : null}
      <p className="mt-1.5 text-xs text-[color:var(--muted)]">
        <span className={`mr-2 rounded px-1.5 py-0.5 font-semibold ${meta.tone}`}>{meta.label}</span>
        {new Date(createdAt).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })}
      </p>
    </>
  );

  const btn = "grid size-8 place-items-center rounded-md text-[color:var(--muted)] transition hover:bg-[color:var(--canvas)] hover:text-[color:var(--foreground)] disabled:opacity-40";
  return (
    <li className={`flex items-start gap-3 p-4 ${pending ? "opacity-60" : ""}`}>
      <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full ${meta.tone}`} aria-hidden="true">
        <Icon size={17} />
      </span>
      <div className="min-w-0 flex-1">
        {href ? (
          <Link href={href} onClick={open} className="block hover:underline">{text}</Link>
        ) : (
          text
        )}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {!archived ? (
          <button type="button" disabled={pending} onClick={() => run(() => setNotificationDoneAction(id, !isRead))} className={btn} title={isRead ? "Yeni olarak işaretle" : "Tamamlandı"} aria-label={isRead ? "Yeni olarak işaretle" : "Tamamlandı olarak işaretle"}>
            {isRead ? <RotateCcw size={16} /> : <Check size={16} />}
          </button>
        ) : null}
        <button type="button" disabled={pending} onClick={() => run(() => setNotificationArchivedAction(id, !archived))} className={btn} title={archived ? "Arşivden çıkar" : "Arşivle"} aria-label={archived ? "Arşivden çıkar" : "Arşivle"}>
          {archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
        </button>
        <button type="button" disabled={pending} onClick={() => run(() => deleteNotificationAction(id))} className={`${btn} hover:!text-rose-600`} title="Sil" aria-label="Sil">
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}
