import { CalendarDays, ArrowUpRight } from "lucide-react";
type LiveSessionData = {
  id: string;
  title: string;
  cohortLabel: string | null;
  startsAt: Date;
  timezone: string;
  meetingUrl?: string | null;
  endsAt?: Date;
};
export function LiveSessionSchedule({
  sessions,
  allowJoin = false,
  now,
}: {
  sessions: LiveSessionData[];
  allowJoin?: boolean;
  now?: number;
}) {
  if (!sessions.length) return null;
  return (
    <section
      id="live-schedule"
      className="panel scroll-mt-28"
      aria-labelledby="schedule-title"
    >
      <p className="eyebrow">BİRLİKTE ÖĞRENELİM</p>
      <h2 id="schedule-title" className="section-title !text-xl">
        Canlı ders programı
      </h2>
      <ul className="mt-5 space-y-3">
        {sessions.map((session) => {
          let timezone = session.timezone;
          try {
            new Intl.DateTimeFormat("tr-TR", { timeZone: timezone });
          } catch {
            timezone = "Europe/Istanbul";
          }
          const past =
            session.endsAt && now !== undefined
              ? session.endsAt.getTime() < now
              : false;
          const safeUrl =
            session.meetingUrl && /^https?:\/\//i.test(session.meetingUrl)
              ? session.meetingUrl
              : null;
          return (
            <li
              key={session.id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-[color:var(--border)] p-4"
            >
              <div className="learning-icon">
                <CalendarDays size={22} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold">{session.title}</h3>
                {session.cohortLabel ? (
                  <p className="mt-1 text-xs text-[color:var(--accent-strong)]">
                    {session.cohortLabel}
                  </p>
                ) : null}
                <p className="mt-2 text-xs leading-5 text-[color:var(--muted)]">
                  {new Intl.DateTimeFormat("tr-TR", {
                    dateStyle: "long",
                    timeStyle: "short",
                    timeZone: timezone,
                  }).format(session.startsAt)}{" "}
                  · {timezone}
                </p>
              </div>
              {allowJoin && safeUrl && !past ? (
                <a
                  href={safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="secondary-button text-xs"
                >
                  Derse katıl <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              ) : past ? (
                <span className="text-xs text-[color:var(--muted)]">
                  Tamamlandı
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
