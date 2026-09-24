import Link from "next/link";
import { BookOpen, CheckCircle2, CalendarDays, ArrowRight, ClipboardList, TrendingUp } from "lucide-react";
import { lessonDate, lessonTime } from "@/lib/availability";
import { PrepJourney } from "./PrepJourney";
import { TodayWidget } from "./TodayWidget";
import { CoachingWidget } from "./CoachingWidget";

type ResumeCourse = { id: string; nextLesson: { id: string; title: string } | null } | null;
type NextLesson = { title: string; startsAt: string } | null;

const QUICK_ACTIONS = [
  { href: "/dashboard/practice", label: "Pratik Sorular", icon: ClipboardList },
  { href: "/dashboard/progress", label: "İlerlemeyi Gör", icon: TrendingUp },
  { href: "/dashboard/lessons", label: "Derslerim", icon: BookOpen },
];

export function LearningDashboard({
  name,
  userId,
  activeCourseCount,
  completedLessonCount,
  upcomingSessionCount,
  resumeCourse,
  nextLesson,
  plan,
}: {
  name: string;
  userId: string;
  activeCourseCount: number;
  completedLessonCount: number;
  upcomingSessionCount: number;
  resumeCourse: ResumeCourse;
  nextLesson: NextLesson;
  /** The student's active plan; null shows the "choose a plan" prompt. */
  plan: { name: string; expiresAt: string } | null;
}) {
  return (
    <div className="space-y-7">
      <header className="learning-welcome">
        <div>
          <p className="eyebrow">ÖĞRENME YOLCULUĞUN</p>
          <h1 className="page-title">Merhaba, {name.split(" ")[0]}.</h1>
          <p className="mt-4 text-sm leading-7 text-blue-100">
            {resumeCourse
              ? "Küçük adımlar, düzenli ilerleme. Çalışmana kaldığın yerden devam et."
              : "Çalışma alanına hoş geldin. Konuları keşfet, hedefine uygun bir başlangıç yap."}
          </p>
        </div>
        <Link
          href={resumeCourse?.nextLesson ? `/dashboard/courses/${resumeCourse.id}#lesson-${resumeCourse.nextLesson.id}` : "/konu-anlatim"}
          className="primary-button shrink-0"
        >
          {resumeCourse ? "Çalışmaya devam et" : "Öğrenmeye başla"}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </header>

      {plan ? (
        <p className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
          <span>
            <strong>{plan.name} planın aktif</strong> · {new Date(plan.expiresAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} tarihine kadar
          </span>
          <Link href="/planlar" className="font-bold underline">Süreyi uzat veya yükselt</Link>
        </p>
      ) : (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[color:var(--border)] bg-white p-5 shadow-sm">
          <div>
            <p className="text-lg font-extrabold text-[color:var(--foreground)]">Henüz bir planın yok</p>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Deneme sınavları, tüm konu anlatımları ve pratik sorular planlarda. 14 gün iade hakkı.
            </p>
          </div>
          <Link href="/planlar" className="primary-button shrink-0">
            Planını seç <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { value: activeCourseCount, label: "Aktif kurs", icon: BookOpen },
          { value: completedLessonCount, label: "Tamamlanan ders", icon: CheckCircle2 },
          { value: upcomingSessionCount, label: "Yaklaşan canlı ders", icon: CalendarDays },
        ].map(({ value, label, icon: Icon }) => (
          <div key={label} className="learning-stat">
            <div className="learning-icon">
              <Icon size={23} aria-hidden="true" />
            </div>
            <div>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>

      <CoachingWidget userId={userId} />
      <PrepJourney userId={userId} />
      <TodayWidget userId={userId} />

      {nextLesson ? (
        <Link href="/dashboard/live-sessions" className="dashboard-panel flex items-center justify-between gap-4 transition hover:border-[color:var(--accent)]">
          <div>
            <p className="eyebrow">Yaklaşan Ders</p>
            <p className="mt-1 text-sm font-bold text-[color:var(--foreground)]">
              {lessonDate(new Date(nextLesson.startsAt))} · {lessonTime(new Date(nextLesson.startsAt))} — {nextLesson.title}
            </p>
          </div>
          <ArrowRight size={18} className="shrink-0 text-[color:var(--accent)]" aria-hidden="true" />
        </Link>
      ) : null}

      <section aria-labelledby="quick-actions-title">
        <p id="quick-actions-title" className="eyebrow">Hızlı Erişim</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="focus-ring flex items-center gap-3 rounded-xl border border-[color:var(--border)] p-4 font-bold text-[color:var(--foreground)] transition hover:border-[color:var(--accent)] hover:bg-[color:var(--brand-soft)]"
            >
              <Icon size={20} className="text-[color:var(--accent)]" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
