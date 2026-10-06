import Link from "next/link";
import { getSeoCalendar } from "@/server/services/seo/publishing.service";
const when = (v: Date | null) =>
  v
    ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(v)
    : "—";
export async function SeoCalendarPage({ actorId }: { actorId: string }) {
  const rows = await getSeoCalendar(actorId);
  const groups = [
    ["Zamanlandı", rows.filter((r) => r.status === "DRAFT" && r.scheduledFor)],
    ["Yayın için onaylı", rows.filter((r) => r.status === "DRAFT" && !r.scheduledFor && r.approvedAt)],
    ["Yayında", rows.filter((r) => r.status === "PUBLISHED")],
  ] as const;
  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold">İçerik takvimi</h2>
      <p>
        Liste görünümü. Yalnızca bir yönetici tarafından onaylanan, zamanlanan veya yayınlanan
        makaleler görünür. Zamanlanan yayınlar günlük Vercel Cron çalışmasında (05:00 UTC)
        kapı yeniden denetlenerek yayınlanır. Ay/hafta görünümü ve sürükle-bırak sonraki
        aşamadadır.
      </p>
      {groups.map(([title, items]) => (
        <section key={title} className="dashboard-panel space-y-3 p-5" aria-label={title}>
          <h3 className="text-lg font-bold">
            {title} ({items.length})
          </h3>
          {items.length ? (
            <ul className="space-y-2">
              {items.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <Link className="font-semibold underline" href={`/admin/seo/studio/${r.id}`}>
                    {r.title}
                  </Link>
                  <span>
                    {title === "Zamanlandı"
                      ? when(r.scheduledFor)
                      : title === "Yayında"
                        ? when(r.publishedAt)
                        : `Onay: ${when(r.approvedAt)}`}
                  </span>
                  {r.scheduleError ? <span role="alert">Durduruldu: {r.scheduleError}</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>Kayıt yok.</p>
          )}
        </section>
      ))}
    </section>
  );
}
