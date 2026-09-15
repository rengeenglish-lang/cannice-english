type LiveSessionData = { id: string; title: string; cohortLabel: string | null; startsAt: Date; timezone: string };

export function LiveSessionSchedule({ sessions }: { sessions: LiveSessionData[] }) {
  if (sessions.length === 0) return null;
  const formatter = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeStyle: "short" });
  return (
    <div className="panel">
      <p className="eyebrow">Canlı Ders Takvimi</p>
      <ul className="mt-4 space-y-3">
        {sessions.map((session) => (
          <li key={session.id} className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] px-4 py-3">
            <div>
              <p className="font-bold text-[color:var(--foreground)]">{session.title}</p>
              {session.cohortLabel ? <p className="text-xs font-bold text-[color:var(--accent-strong)]">{session.cohortLabel}</p> : null}
            </div>
            <span className="text-sm text-slate-500">{formatter.format(session.startsAt)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
