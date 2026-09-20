import Link from "next/link";
import { BookOpen, CheckCircle2, CalendarDays, ArrowRight, ClipboardList, TrendingUp } from "lucide-react";
import { lessonDate, lessonTime } from "@/lib/availability";
import { PrepJourney } from "./PrepJourney";
import { TodayWidget } from "./TodayWidget";

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
}: {
  name: string;
  userId: string;
  activeCourseCount: number;
  completedLessonCount: number;
  upcomingSessionCount: number;
  resumeCourse: ResumeCourse;
  nextLesson: NextLesson;
}) {
  return (
    <div className="space-y-7">
      <header className="learning-welcome">
        <div>
          <p className="eyebrow">SİZİN ÖĞRENME YOLCULUĞUNUZ</p>
          <h1 className="page-title">Merhaba, {name.split(" ")[0]}.</h1>
          <p className="mt-4 text-sm leading-7 text-blue-100">
            {resumeCourse
              ? "Küçük adımlar, düzenli ilerleme. Çalışmanıza kaldığınız yerden devam edin."
              : "Çalışma alanınıza hoş geldiniz. Konuları keşfedin, hedefinize uygun bir başlangıç yapın."}
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
