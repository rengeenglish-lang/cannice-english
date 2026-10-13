import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { listEnrollmentsForUser } from "@/server/services/learning.service";
import { summarizeLearning } from "@/lib/learning-overview";
import { StudentHome, type AgendaItem, type WeekTask } from "@/components/dashboard/StudentHome";
import { getSpeakingClubRooms, speakingLevel } from "@/server/services/speaking-club.service";
import { examCountdowns } from "@/server/services/exam-interests.service";
import { clubGroupName } from "@/lib/speaking-club";
import { addDays, dayKey, dayKeyToDate, DEFAULT_TIMEZONE, localTime, weekStartOf } from "@/lib/coaching/time";
import { coachingCopy } from "@/lib/coaching/i18n";

export const metadata: Metadata = { title: "Çalışma Alanım" };

export default async function StudentDashboardPage() {
  const user = await getAuthContext();
  if (!user) return null;

  const now = new Date();
  const [enrollments, groupBookings, { rooms, note }, level, profile, messages, unread, countdowns, avatar] = await Promise.all([
    listEnrollmentsForUser(user.id),
    db.groupLessonEnrollment.findMany({
      where: { studentId: user.id, status: "ACTIVE", slot: { cancelled: false, endsAt: { gte: now } } },
      include: { slot: true },
      orderBy: { slot: { startsAt: "asc" } },
      take: 10,
    }),
    getSpeakingClubRooms(),
    speakingLevel(user.id),
    db.coachingProfile.findUnique({ where: { userId: user.id }, select: { enabled: true, timezone: true, locale: true } }),
    db.teacherMessage.findMany({
      where: { studentId: user.id },
      select: { id: true, body: true, reply: true, createdAt: true, repliedAt: true, repliedBy: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    db.notification.count({ where: { userId: user.id, isRead: false, archivedAt: null } }),
    examCountdowns(user.id, now),
    db.user.findUnique({ where: { id: user.id }, select: { image: true } }),
  ]);
  // Speaking Club: the learner's level room, or null until their level is known (placement test).
  const room = level ? rooms.find((r) => r.key === level.group)! : null;
  const speakingClub = { note, level: level && room ? { cefr: level.cefr, groupName: clubGroupName(level.group), url: room.url, schedule: room.schedule } : null };

  const courses = enrollments.map((e) => ({
    id: e.courseId,
    title: e.course.product.title,
    ...summarizeLearning(e.course.modules, e.lessonProgresses),
  }));
  const completed = courses.reduce((n, c) => n + c.completed, 0);

  const sessions = [
    ...enrollments.flatMap((e) => e.course.liveSessions.map((s) => ({ startsAt: s.startsAt, endsAt: s.endsAt, title: s.title, group: false }))),
    ...groupBookings.map((b) => ({ startsAt: b.slot.startsAt, endsAt: b.slot.endsAt, title: b.slot.title, group: true })),
  ]
    .filter((s) => s.endsAt >= now)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  const resumeCourse = courses.find((c) => c.completed > 0 && c.nextLesson) ?? courses.find((c) => c.nextLesson) ?? null;

  // The week strip and agenda follow the learner's coaching time zone (Istanbul by default).
  const tz = profile?.timezone ?? DEFAULT_TIMEZONE;
  const today = dayKey(now, tz);
  const monday = weekStartOf(today);
  const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const coaching = profile?.enabled ? profile : null;
  const tasks = coaching
    ? await db.studyTask.findMany({
        where: { userId: user.id, date: { gte: dayKeyToDate(monday), lte: dayKeyToDate(week[6]) } },
        select: { id: true, date: true, title: true, kind: true, minutes: true, status: true, href: true },
        orderBy: [{ date: "asc" }, { position: "asc" }],
      })
    : [];
  const t = coachingCopy(profile?.locale);

  const weekTasks: WeekTask[] = tasks.map((task) => ({
    id: task.id,
    day: task.date.toISOString().slice(0, 10),
    title: task.title,
    kind: t.task.kinds[task.kind] ?? task.kind,
    minutes: task.minutes,
    status: task.status,
    href: task.href,
  }));

  const agenda: AgendaItem[] = [
    ...sessions
      .filter((s) => week.includes(dayKey(s.startsAt, tz)))
      .map((s) => ({
        key: `s-${s.startsAt.toISOString()}-${s.title}`,
        day: dayKey(s.startsAt, tz),
        title: s.title,
        time: `${localTime(s.startsAt, tz)}–${localTime(s.endsAt, tz)}`,
        type: s.group ? ("GROUP" as const) : ("LIVE" as const),
        href: "/dashboard/live-sessions",
      })),
    ...weekTasks
      .filter((x) => x.day === today && x.status === "PLANNED")
      .map((x) => ({ key: `t-${x.id}`, day: x.day, title: x.title, time: `${x.minutes} dk`, type: "TASK" as const, href: x.href ?? "/dashboard/kocluk" })),
  ];

  return (
    <StudentHome
      name={user.name}
      image={avatar?.image ?? null}
      userId={user.id}
      stats={{ courses: courses.length, lessonsDone: completed, upcoming: sessions.length }}
      resumeHref={resumeCourse?.nextLesson ? `/dashboard/courses/${resumeCourse.id}#lesson-${resumeCourse.nextLesson.id}` : null}
      speakingClub={speakingClub}
      unread={unread}
      countdowns={countdowns}
      messages={messages.map((m) => ({
        id: m.id,
        from: m.reply ? (m.repliedBy?.name ?? "Öğretmenin") : "Sen",
        text: m.reply ?? m.body,
        at: (m.repliedAt ?? m.createdAt).toISOString(),
        waiting: !m.reply,
      }))}
      coaching={coaching ? { started: true } : profile ? null : { started: false }}
      today={today}
      week={week}
      weekTasks={weekTasks}
      agenda={agenda}
    />
  );
}
