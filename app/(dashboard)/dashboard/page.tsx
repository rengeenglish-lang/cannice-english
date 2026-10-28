import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { listEnrollmentsForUser } from "@/server/services/learning.service";
import { summarizeLearning } from "@/lib/learning-overview";
import { LearningDashboard } from "@/components/dashboard/LearningDashboard";
import { getSpeakingClubRooms, speakingLevel } from "@/server/services/speaking-club.service";
import { clubGroupName } from "@/lib/speaking-club";
import { BooksSummary } from "@/components/dashboard/BooksSummary";

export const metadata: Metadata = { title: "Çalışma Alanım" };

export default async function StudentDashboardPage() {
  const user = await getAuthContext();
  if (!user) return null;

  const [enrollments, groupBookings, { rooms, note }, level] = await Promise.all([
    listEnrollmentsForUser(user.id),
    db.groupLessonEnrollment.findMany({
      where: { studentId: user.id, status: "ACTIVE", slot: { cancelled: false, endsAt: { gte: new Date() } } },
      include: { slot: true },
      orderBy: { slot: { startsAt: "asc" } },
      take: 1,
    }),
    getSpeakingClubRooms(),
    speakingLevel(user.id),
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

  const courseSessions = enrollments.flatMap((e) => e.course.liveSessions.map((s) => ({ startsAt: s.startsAt, title: s.title })));
  const groupSessions = groupBookings.map((b) => ({ startsAt: b.slot.startsAt, title: b.slot.title }));
  const upcomingCount = courseSessions.length + groupBookings.length;
  const nextLesson = [...courseSessions, ...groupSessions].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0] ?? null;

  const resumeCourse = courses.find((c) => c.completed > 0 && c.nextLesson) ?? courses.find((c) => c.nextLesson) ?? null;

  return (
    <><BooksSummary userId={user.id} />
    <LearningDashboard
      name={user.name}
      activeCourseCount={courses.length}
      completedLessonCount={completed}
      upcomingSessionCount={upcomingCount}
      resumeCourse={resumeCourse}
      nextLesson={nextLesson ? { title: nextLesson.title, startsAt: nextLesson.startsAt.toISOString() } : null}
      userId={user.id}
      speakingClub={speakingClub}
    /></>
  );
}
