import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { listNotificationsForUser } from "@/server/services/notifications.service";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/app/actions/notifications";
import { AccountHeader } from "@/components/dashboard/AccountHeader";
import { AccountTabs } from "@/components/dashboard/AccountTabs";
import { NotificationRow } from "@/components/dashboard/NotificationRow";

export const metadata: Metadata = { title: "Bildirimlerim" };

export default async function NotificationsPage() {
  const user = await getAuthContext();
  if (!user) return null;

  const notifications = await listNotificationsForUser(user.id);
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div>
      <AccountHeader name={user.name} email={user.email} activeTabLabel="Bildirim Ayarlarım" />
      <AccountTabs active="Bildirim Ayarlarım" />

      <div className="mt-8 flex items-center justify-between">
        <h2 className="section-title !text-lg">Bildirimlerim</h2>
        {hasUnread ? (
          <form action={markAllNotificationsReadAction}>
            <button type="submit" className="ghost-button text-xs">Tümünü okundu işaretle</button>
          </form>
        ) : null}
      </div>

      {notifications.length ? (
        <ul className="mt-4 divide-y divide-[color:var(--border)] rounded-2xl border border-[color:var(--border)]">
          {notifications.map((n) => (
            <NotificationRow
              key={n.id}
              id={n.id}
              title={n.title}
              body={n.body}
              href={n.href}
              isRead={n.isRead}
              createdAt={n.createdAt.toISOString()}
              markReadAction={markNotificationReadAction}
            />
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-[color:var(--border-strong)] px-5 py-10 text-center">
          <p className="font-bold text-[color:var(--foreground)]">Henüz bir bildiriminiz yok</p>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Sipariş durumunuz değiştiğinde veya bir öğretmen sınavınızı değerlendirdiğinde burada görünecek.</p>
        </div>
      )}
    </div>
  );
}
