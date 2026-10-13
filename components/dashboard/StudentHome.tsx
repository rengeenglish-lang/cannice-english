import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, Bell, BookOpen, CalendarDays, CheckCircle2, CircleHelp, Clock3, Compass,
  MessageSquare, Users, User, Video, XCircle,
} from "lucide-react";
import type { Countdown } from "@/lib/exam-interests";
import { PrepJourney } from "./PrepJourney";
import { TodayWidget } from "./TodayWidget";
import { SpeakingClubButton, type SpeakingClubInfo } from "./SpeakingClubButton";

export type WeekTask = { id: string; day: string; title: string; kind: string; minutes: number; status: "PLANNED" | "DONE" | "SKIPPED"; href: string | null };
export type AgendaItem = { key: string; day: string; title: string; time: string; type: "LIVE" | "GROUP" | "TASK"; href: string };
type Message = { id: string; from: string; text: string; at: string; waiting: boolean };

const DAY_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const DAY_LONG = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

const STATUS = {
  DONE: { label: "Tamamlandı", icon: CheckCircle2, cls: "home-status-done" },
  PLANNED: { label: "Planlandı", icon: Clock3, cls: "home-status-planned" },
  SKIPPED: { label: "Atlandı", icon: XCircle, cls: "home-status-skipped" },
} as const;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toLocaleUpperCase("tr"))
    .join("");

/** "11:01" today, "Dün", or "12 Eki" — like a chat list. */
function when(iso: string, todayKey: string) {
  const d = new Date(iso);
  const key = d.toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
  if (key === todayKey) return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", timeZone: "Europe/Istanbul" });
}

function Avatar({ name, image, size = 40 }: { name: string; image?: string | null; size?: number }) {
  return image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span aria-hidden="true" className="home-avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials(name) || "?"}
    </span>
  );
}

export function StudentHome({
  name, image, userId, stats, resumeHref, speakingClub, unread, countdowns, messages, coaching, today, week, weekTasks, agenda,
}: {
  name: string;
  image: string | null;
  userId: string;
  stats: { courses: number; lessonsDone: number; upcoming: number };
  resumeHref: string | null;
  speakingClub: SpeakingClubInfo;
  unread: number;
  countdowns: Countdown[];
  messages: Message[];
  /** null = the learner turned coaching off. */
  coaching: { started: boolean } | null;
  today: string;
  week: string[];
  weekTasks: WeekTask[];
  agenda: AgendaItem[];
}) {
  const first = name.split(" ")[0];
  const todayTasks = weekTasks.filter((t) => t.day === today);
  const openToday = todayTasks.filter((t) => t.status === "PLANNED");
  const doneWeek = weekTasks.filter((t) => t.status === "DONE").length;
  const busyDays = new Set(agenda.map((a) => a.day).concat(weekTasks.filter((t) => t.status === "PLANNED").map((t) => t.day)));
  const nextExam = countdowns.find((c) => c.state === "DATE");
  const daysLeft = nextExam?.state === "DATE" ? Math.max(0, Math.round((new Date(nextExam.dateKey).getTime() - new Date(today).getTime()) / 86_400_000)) : null;
  const todayAgenda = agenda.filter((a) => a.day === today);
  const laterAgenda = agenda.filter((a) => a.day > today && a.type !== "TASK");
  // Show today first, then what's coming later this week, so the list is never empty on a quiet day.
  const agendaShown = [...todayAgenda, ...laterAgenda].slice(0, 4);
  const tableRows = weekTasks.slice(0, 7);

  const cards = [
    { value: stats.courses, label: "Aktif kurs", icon: BookOpen, href: "/dashboard/lessons", tone: "home-tone-sun" },
    { value: stats.lessonsDone, label: "Tamamlanan ders", icon: CheckCircle2, href: "/dashboard/progress", tone: "home-tone-sky" },
    { value: stats.upcoming, label: "Yaklaşan canlı ders", icon: CalendarDays, href: "/dashboard/live-sessions", tone: "home-tone-lilac" },
  ];

  return (
    <div className="home-shell">
      <div className="home-main">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-[color:var(--foreground)] sm:text-[28px]">Tekrar hoş geldin, {first}!</h1>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              {resumeHref ? "Kaldığın yerden devam et, bu haftanın planını takip et." : "Konuları keşfet, hedefine uygun bir başlangıç yap."}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/yardim" className="home-icon-button" aria-label="Yardım">
              <CircleHelp size={18} aria-hidden="true" />
            </Link>
            <Link href="/dashboard/notifications" className="home-icon-button relative" aria-label={unread ? `Bildirimler, ${unread} yeni` : "Bildirimler"}>
              <Bell size={18} aria-hidden="true" />
              {unread ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#e5484d] ring-2 ring-[color:var(--surface)]" aria-hidden="true" /> : null}
            </Link>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-4">
          {cards.map(({ value, label, icon: Icon, href, tone }) => (
            <Link key={label} href={href} className={`home-stat ${tone}`}>
              <span className="text-xs font-semibold leading-snug sm:text-sm">{label}</span>
              <span className="mt-4 flex items-end justify-between gap-2 sm:mt-6">
                <strong className="text-3xl sm:text-4xl font-extrabold leading-none tracking-tight">{value}</strong>
                <span className="home-stat-icon max-sm:!h-7 max-sm:!w-7" aria-hidden="true">
                  <Icon size={14} />
                </span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="home-messages" className="min-w-0">
            <div className="flex items-center justify-between">
              <h2 id="home-messages" className="home-heading">Son Mesajlar</h2>
              <Link href="/dashboard/mesajlar" className="home-pill-link">Tümü</Link>
            </div>
            {messages.length ? (
              <ul className="mt-3 space-y-2.5">
                {messages.map((m) => (
                  <li key={m.id}>
                    <Link href="/dashboard/mesajlar" className="home-card flex items-center gap-3 !p-3.5">
                      <Avatar name={m.from === "Sen" ? name : m.from} image={m.from === "Sen" ? image : null} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <strong className="truncate text-sm">{m.from}</strong>
                          <span className="shrink-0 text-xs text-[color:var(--muted)]">{when(m.at, today)}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-[13px] text-[color:var(--muted)]">
                          {m.waiting ? <em className="not-italic font-semibold text-[#b45309] dark:text-amber-300">Yanıt bekleniyor · </em> : null}
                          {m.text}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="home-card mt-3 flex items-center gap-3">
                <span className="home-stat-icon !h-10 !w-10" aria-hidden="true"><MessageSquare size={18} /></span>
                <p className="flex-1 text-sm text-[color:var(--muted)]">Derslerinle ilgili bir sorun mu var? Öğretmenine yaz.</p>
                <Link href="/dashboard/mesajlar" className="home-pill-link">Sor</Link>
              </div>
            )}
          </section>

          <section aria-labelledby="home-coaching" className="min-w-0">
            <h2 id="home-coaching" className="home-heading">Koçluğum</h2>
            <div className="home-card mt-3">
              {coaching?.started ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong className="block text-5xl font-extrabold leading-none tracking-tight">{openToday.length}</strong>
                      <span className="mt-1 block text-sm text-[color:var(--muted)]">{openToday.length ? "görev bugün seni bekliyor" : "bugünkü görevlerin tamam"}</span>
                    </div>
                    <Link href="/dashboard/kocluk" className="home-pill-link">Planı aç</Link>
                  </div>
                  <div className="mt-4 flex items-center gap-2 border-t border-[color:var(--border)] pt-4 text-sm">
                    <span className="home-count">{weekTasks.length}</span>
                    <span>görev bu hafta</span>
                    <span className="ml-auto text-xs font-semibold text-[color:var(--muted)]">{doneWeek} tamamlandı</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[color:var(--canvas)]" role="progressbar" aria-label="Haftalık görev ilerlemesi" aria-valuemin={0} aria-valuemax={weekTasks.length || 1} aria-valuenow={doneWeek}>
                    <div className="h-full rounded-full bg-[color:var(--accent)]" style={{ width: `${weekTasks.length ? (doneWeek / weekTasks.length) * 100 : 0}%` }} />
                  </div>
                </>
              ) : coaching ? (
                <div className="flex items-start gap-3">
                  <span className="home-stat-icon !h-11 !w-11 shrink-0" aria-hidden="true"><Compass size={20} /></span>
                  <div className="flex-1">
                    <strong className="block">Ücretsiz Öğrenci Koçluğu</strong>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">Sınav tarihine göre günlük görevlerini planlayalım; her gün ne çalışacağını bil.</p>
                    <Link href="/dashboard/kocluk" className="primary-button mt-4 !min-h-0 !py-2 text-sm">Koçluğu başlat <ArrowRight size={16} aria-hidden="true" /></Link>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[color:var(--muted)]">
                  Koçluğu kapattın. <Link href="/dashboard/kocluk" className="font-bold text-[color:var(--accent)] underline">Yeniden aç</Link>
                </p>
              )}
            </div>
          </section>
        </div>

        {coaching?.started && tableRows.length ? (
          <section aria-labelledby="home-week" className="mt-8">
            <div className="flex items-center justify-between">
              <h2 id="home-week" className="home-heading">Bu Haftanın Görevleri</h2>
              <Link href="/dashboard/kocluk" className="home-pill-link">Tümü</Link>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="home-table">
                <thead>
                  <tr>
                    <th scope="col">Görev</th>
                    <th scope="col" className="max-sm:hidden">Gün</th>
                    <th scope="col" className="max-sm:hidden">Tür</th>
                    <th scope="col" className="text-right">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((task) => {
                    const s = STATUS[task.status];
                    const dayLabel = `${task.day === today ? "Bugün" : DAY_LONG[week.indexOf(task.day)]}, ${task.minutes} dk`;
                    return (
                      <tr key={task.id}>
                        <td>
                          {task.href ? <Link href={task.href} className="font-semibold hover:underline">{task.title}</Link> : <span className="font-semibold">{task.title}</span>}
                          <span className="mt-0.5 block text-xs text-[color:var(--muted)] sm:hidden">{dayLabel}</span>
                        </td>
                        <td className="whitespace-nowrap text-[color:var(--muted)] max-sm:hidden">{dayLabel}</td>
                        <td className="text-[color:var(--muted)] max-sm:hidden">{task.kind}</td>
                        <td className="text-right">
                          <span className={`home-status ${s.cls}`}>
                            <s.icon size={14} aria-hidden="true" /> {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <div className="mt-8 space-y-6">
          <TodayWidget userId={userId} />
          <PrepJourney userId={userId} />
        </div>
      </div>

      <aside className="home-aside" aria-label="Profilim ve ajandam">
        <div className="flex flex-col items-center text-center">
          <span className="relative">
            <Avatar name={name} image={image} size={88} />
            <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-[#22c55e] ring-[3px] ring-[color:var(--home-aside)]" aria-hidden="true" />
          </span>
          <strong className="mt-3 text-lg font-extrabold">{name}</strong>
          <span className="text-sm text-[color:var(--muted)]">
            {countdowns.length ? `${countdowns.map((c) => c.label).join(" · ")} adayı` : "Netfener öğrencisi"}
          </span>
          {nextExam?.state === "DATE" && daysLeft !== null ? (
            <Link href="/dashboard/sinavlarim" className="home-chip mt-3">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-[#22c55e] text-white" aria-hidden="true"><Clock3 size={12} /></span>
              {nextExam.label}: {daysLeft === 0 ? "bugün" : `${daysLeft} gün`}
            </Link>
          ) : (
            <Link href="/dashboard/sinavlarim" className="home-chip mt-3">Sınavını seç <ArrowUpRight size={14} aria-hidden="true" /></Link>
          )}
          <div className="mt-4 flex w-full flex-col gap-2">
            <Link href={resumeHref ?? "/konu-anlatim"} className="primary-button w-full justify-center !min-h-0 !py-2.5 text-sm">
              {resumeHref ? "Çalışmaya devam et" : "Öğrenmeye başla"} <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <SpeakingClubButton club={speakingClub} />
          </div>
        </div>

        <div className="my-6 border-t border-[color:var(--border)]" />

        <div className="flex items-center justify-between">
          <h2 className="home-heading">Ajandam</h2>
          <Link href="/dashboard/live-sessions" className="home-pill-link">Tümü</Link>
        </div>
        <ol className="mt-4 grid grid-cols-7 gap-1 text-center" aria-label="Bu hafta">
          {week.map((day, i) => {
            const isToday = day === today;
            return (
              <li key={day} className={`home-day ${isToday ? "home-day-today" : ""}`} aria-current={isToday ? "date" : undefined}>
                <span className="text-[11px] font-semibold">{DAY_SHORT[i]}</span>
                <span className="text-sm font-bold">{Number(day.slice(8))}</span>
                <span className={`h-1 w-1 rounded-full ${busyDays.has(day) ? (isToday ? "bg-white" : "bg-[color:var(--accent)]") : "bg-transparent"}`} aria-hidden="true" />
                {busyDays.has(day) ? <span className="sr-only">, planlı etkinlik var</span> : null}
              </li>
            );
          })}
        </ol>

        {agendaShown.length ? (
          <ul className="mt-4 space-y-2.5">
            {agendaShown.map((a) => {
              const Icon = a.type === "GROUP" ? Users : a.type === "LIVE" ? Video : User;
              const i = week.indexOf(a.day);
              return (
                <li key={a.key}>
                  <Link href={a.href} className="home-card flex items-center gap-3 !p-3.5">
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-bold">
                        <Icon size={15} className="shrink-0" aria-hidden="true" />
                        <span className="truncate">{a.title}</span>
                      </span>
                      <span className="mt-1 block text-[13px] text-[color:var(--muted)]">
                        {a.day === today ? "Bugün" : DAY_LONG[i]} · {a.time}
                      </span>
                    </span>
                    <span className="home-stat-icon !h-8 !w-8 shrink-0" aria-hidden="true"><ArrowUpRight size={14} /></span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="home-card mt-4 text-sm text-[color:var(--muted)]">Bu hafta planlı canlı dersin yok. Speaking Club&apos;a katılabilir ya da canlı derslere göz atabilirsin.</p>
        )}

        <Link href="/dashboard/live-sessions" className="home-outline-button mt-4">Tüm yaklaşan dersler</Link>
      </aside>
    </div>
  );
}
