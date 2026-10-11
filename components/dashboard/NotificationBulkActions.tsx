"use client";

import { useTransition } from "react";
import { archiveReadNotificationsAction, clearNotificationsAction, markAllNotificationsReadAction } from "@/app/actions/notifications";

export function NotificationBulkActions({ archived, hasUnread, hasRead, hasAny }: { archived: boolean; hasUnread: boolean; hasRead: boolean; hasAny: boolean }) {
  const [pending, start] = useTransition();
  if (!hasAny) return null;
  const clear = () => {
    if (window.confirm(archived ? "Arşivdeki tüm bildirimler silinsin mi?" : "Gelen kutusundaki tüm bildirimler silinsin mi?")) start(() => clearNotificationsAction(archived));
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      {!archived && hasUnread ? (
        <button type="button" disabled={pending} onClick={() => start(() => markAllNotificationsReadAction())} className="ghost-button text-xs">Tümünü tamamlandı yap</button>
      ) : null}
      {!archived && hasRead ? (
        <button type="button" disabled={pending} onClick={() => start(() => archiveReadNotificationsAction())} className="ghost-button text-xs">Tamamlananları arşivle</button>
      ) : null}
      <button type="button" disabled={pending} onClick={clear} className="ghost-button text-xs !text-rose-700">{archived ? "Arşivi temizle" : "Tümünü temizle"}</button>
    </div>
  );
}
