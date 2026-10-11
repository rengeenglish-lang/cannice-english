import type { Metadata } from "next";
import Link from "next/link";
import { getAuthContext } from "@/server/auth/context";
import { NOTIFICATION_RETENTION_DAYS, listNotificationsForUser } from "@/server/services/notifications.service";
import { AccountHeader } from "@/components/dashboard/AccountHeader";
import { AccountTabs } from "@/components/dashboard/AccountTabs";
import { NotificationRow } from "@/components/dashboard/NotificationRow";
import { NotificationBulkActions } from "@/components/dashboard/NotificationBulkActions";

export const metadata: Metadata = { title: "Bildirimlerim" };

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ arsiv?: string }> }) {
  const user = await getAuthContext();
  if (!user) return null;
  const archived = (await searchParams).arsiv === "1";

  const notifications = await listNotificationsForUser(user.id, { archived });
  const tab = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-bold transition ${active ? "bg-[color:var(--brand)] text-white" : "text-[color:var(--muted)] hover:bg-[color:var(--canvas)]"}`;

  return (
    <div>
      <AccountHeader name={user.name} email={user.email} activeTabLabel="Bildirim Ayarlarım" />
      <AccountTabs active="Bildirim Ayarlarım" />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Link href="/dashboard/notifications" className={tab(!archived)}>Gelen</Link>
          <Link href="/dashboard/notifications?arsiv=1" className={tab(archived)}>Arşiv</Link>
        </div>
        <NotificationBulkActions
          archived={archived}
          hasAny={notifications.length > 0}
          hasUnread={notifications.some((n) => !n.isRead)}
          hasRead={notifications.some((n) => n.isRead)}
        />
      </div>

      {notifications.length ? (
        <ul className="mt-4 divide-y divide-[color:var(--border)] rounded-2xl border border-[color:var(--border)] bg-white">
          {notifications.map((n) => (
            <NotificationRow
              key={n.id}
              id={n.id}
              category={n.category}
              title={n.title}
              body={n.body}
              href={n.href}
              isRead={n.isRead}
              archived={archived}
              createdAt={n.createdAt.toISOString()}
            />
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-[color:var(--border-strong)] px-5 py-10 text-center">
          <p className="font-bold text-[color:var(--foreground)]">{archived ? "Arşivin boş" : "Yeni bildirimin yok"}</p>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            {archived
              ? "Arşivlediğin bildirimler burada durur."
              : "Siparişlerin, canlı derslerin, koçluk hatırlatmaların ve mesajların burada görünür."}
          </p>
        </div>
      )}
      <p className="mt-4 text-xs text-[color:var(--muted)]">
        Aynı konudaki yeni bir bildirim eskisinin yerini alır. Sipariş bildirimleri dışındakiler {NOTIFICATION_RETENTION_DAYS} gün sonra otomatik silinir.
      </p>
    </div>
  );
}
