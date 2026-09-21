"use client";

import Link from "next/link";

export function NotificationRow({
  id,
  title,
  body,
  href,
  isRead,
  createdAt,
  markReadAction,
}: {
  id: string;
  title: string;
  body: string | null;
  href: string | null;
  isRead: boolean;
  createdAt: string;
  markReadAction: (id: string) => Promise<void>;
}) {
  const handleClick = () => {
    if (!isRead) void markReadAction(id);
  };

  const content = (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <p className={`text-sm font-bold ${isRead ? "text-[color:var(--muted)]" : "text-[color:var(--foreground)]"}`}>{title}</p>
        {!isRead ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[color:var(--accent)]" aria-label="Okunmadı" /> : null}
      </div>
      {body ? <p className="mt-1 text-sm text-[color:var(--muted)]">{body}</p> : null}
      <p className="mt-2 text-xs text-[color:var(--muted)]">{new Date(createdAt).toLocaleString("tr-TR")}</p>
    </div>
  );

  return (
    <li>
      {href ? (
        <Link href={href} onClick={handleClick} className="block transition hover:bg-[color:var(--canvas)]">{content}</Link>
      ) : (
        <button type="button" onClick={handleClick} className="block w-full text-left transition hover:bg-[color:var(--canvas)]">{content}</button>
      )}
    </li>
  );
}
