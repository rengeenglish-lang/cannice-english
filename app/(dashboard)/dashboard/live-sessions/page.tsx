import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CalendarDays, Lock, MessageCircle, Video } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { listEnrollmentsForUser } from "@/server/services/learning.service";
import { LiveCalendar } from "@/components/dashboard/LiveCalendar";
import { MyGroupBookings } from "@/components/availability/MyGroupBookings";
import { renewGroupAction } from "@/app/actions/live-lessons";
import { RENEWAL_GRACE_MS, billingState, isMonthlyBilledCategory } from "@/lib/billing";
import { formatTRY } from "@/lib/pricing";

export const metadata: Metadata = { title: "Canlı Derslerim" };

/** The join link opens 30 minutes before a lesson and stays open until it ends. */
const JOIN_OPENS_MS = 30 * 60 * 1000;

function formatDateTime(date: Date) {
  return date.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

export default async function LiveSessionsPage() {
  const user = await getAuthContext();
  if (!user) return null;
  const now = new Date();
  const enrollments = await listEnrollmentsForUser(user.id);
  const liveEnrollments = enrollments.filter(
    (e) =>
      isMonthlyBilledCategory(e.course.product.category) ||
      e.course.liveSessions.length > 0 ||
      e.course.deliveryFormat !== "RECORDED_ONLY",
  );

  const calendarSessions = liveEnrollments
    .filter((e) => billingState(e.paidThrough, now) !== "LOCKED")
    .flatMap((e) =>
      e.course.liveSessions.map((s) => ({
        id: s.id,
        title: s.title,
        courseId: e.courseId,
        courseTitle: e.course.product.title,
        startsAt: s.startsAt.toISOString(),
      })),
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <p className="eyebrow">Birlikte Öğrenelim</p>
        <h1 className="page-title">Canlı Derslerim</h1>
        <p className="page-copy">Katıldığın grup dersleri, ödeme durumun ve yaklaşan canlı derslerin burada.</p>
      </div>

      <MyGroupBookings userId={user.id} showBookings={false} />

      {liveEnrollments.length === 0 ? (
        <div className="learning-empty">
          <CalendarDays size={32} className="mx-auto mb-4 text-[color:var(--accent)]" aria-hidden="true" />
          <h2 className="font-bold">Henüz bir canlı gruba katılmadın.</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[color:var(--muted)]">
            Haftalık grup takviminden sana uygun saati seç, &ldquo;Gruba Katıl&rdquo; ile ödemeni yap; grubun hemen burada görünsün.
          </p>
          <Link href="/group-lessons" className="primary-button mt-5">Grup derslerini incele</Link>
        </div>
      ) : (
        <div className="space-y-5">
          {liveEnrollments.map((e) => {
            const state = billingState(e.paidThrough, now);
            const monthly = isMonthlyBilledCategory(e.course.product.category);
            const lockAt = e.paidThrough ? new Date(e.paidThrough.getTime() + RENEWAL_GRACE_MS) : null;
            const upcoming = e.course.liveSessions.filter((s) => s.endsAt >= now && !s.cancelled).slice(0, 4);
            return (
              <article key={e.id} className="dashboard-panel">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold">{e.course.product.title}</h2>
                    {monthly && e.paidThrough ? (
                      <p className="mt-1 text-sm text-[color:var(--muted)]">
                        Aylık ücret: <strong>{formatTRY(String(e.course.product.salePrice))}</strong> · Ödenen dönem sonu:{" "}
                        <strong>{e.paidThrough.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })}</strong>
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      state === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : state === "PAYMENT_DUE" ? "bg-amber-50 text-amber-800" : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {state === "ACTIVE" ? "Aktif" : state === "PAYMENT_DUE" ? "Ödeme bekleniyor" : "Erişim durduruldu"}
                  </span>
                </div>

                {state === "PAYMENT_DUE" && lockAt ? (
                  <div role="status" className="mt-4 flex gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <p>
                      Bir aylık ödeme dönemin doldu. Derslerine kesintisiz devam etmek için <strong>{formatDateTime(lockAt)}</strong> tarihine kadar ödemeni yap; aksi hâlde canlı ders erişimin durdurulur.
                    </p>
                  </div>
                ) : null}
                {state === "LOCKED" ? (
                  <div role="alert" className="mt-4 flex gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-900">
                    <Lock size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <p>Aylık ödemen yapılmadığı için canlı ders erişimin durduruldu. Ödemeni yaptığın anda derslerine kaldığın yerden devam edebilirsin.</p>
                  </div>
                ) : null}

                <ul className="mt-5 divide-y divide-[color:var(--border)] rounded-2xl border border-[color:var(--border)]">
                  {upcoming.length ? (
                    upcoming.map((s) => {
                      const joinable = state !== "LOCKED" && s.meetingUrl && /^https:\/\//i.test(s.meetingUrl) && now.getTime() >= s.startsAt.getTime() - JOIN_OPENS_MS;
                      return (
                        <li key={s.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-bold">{s.title}</p>
                            <p className="mt-1 text-xs text-[color:var(--muted)]">{formatDateTime(s.startsAt)}</p>
                          </div>
                          {state === "LOCKED" ? (
                            <form action={renewGroupAction.bind(null, e.courseId)}>
                              <button type="submit" className="primary-button text-xs">Devam etmek için öde</button>
                            </form>
                          ) : joinable ? (
                            <a href={s.meetingUrl!} target="_blank" rel="noopener noreferrer" className="primary-button text-xs">
                              <Video size={16} aria-hidden="true" /> Derse Katıl
                            </a>
                          ) : (
                            <div className="text-right">
                              <button type="button" disabled className="primary-button text-xs">
                                <Video size={16} aria-hidden="true" /> Derse Katıl
                              </button>
                              <p className="mt-1 text-[11px] text-[color:var(--muted)]">
                                {s.meetingUrl ? "Bağlantı dersten 30 dk önce açılır" : "Bağlantı eğitmenin tarafından paylaşılacak"}
                              </p>
                            </div>
                          )}
                        </li>
                      );
                    })
                  ) : (
                    <li className="p-4 text-sm text-[color:var(--muted)]">
                      Yaklaşan canlı ders bulunmuyor. <Link href="/group-lessons" className="font-bold text-[color:var(--accent-strong)] underline">Haftalık takvimden</Link> ders saati seçebilirsin.
                    </li>
                  )}
                </ul>

                <div className="mt-5 flex flex-wrap gap-3">
                  {state === "PAYMENT_DUE" ? (
                    <form action={renewGroupAction.bind(null, e.courseId)}>
                      <button type="submit" className="primary-button">Ödemeyi yap</button>
                    </form>
                  ) : null}
                  <Link href={`/dashboard/mesajlar?course=${e.courseId}`} className="secondary-button">
                    <MessageCircle size={17} aria-hidden="true" /> Öğretmenine mesaj gönder
                  </Link>
                  <Link href={`/dashboard/courses/${e.courseId}`} className="ghost-button">Grup sayfasını aç</Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {calendarSessions.length ? (
        <LiveCalendar sessions={calendarSessions} today={now.toISOString()} />
      ) : null}
    </div>
  );
}
