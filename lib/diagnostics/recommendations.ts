import "server-only";
import { db } from "@/server/db";
import { availability } from "@/lib/availability";
import { activeEnrollmentCourseIds } from "@/lib/diagnostics/access";

const MAX_FREE = 3;
const MAX_PREMIUM = 2;
const MAX_GROUP_LESSONS = 1;

const groupSlotInclude = {
  course: { include: { product: { include: { examType: true } } } },
  _count: { select: { bookings: { where: { status: "ACTIVE" as const } } } },
};

export type FreeRecommendation = {
  kind: "free";
  id: string;
  title: string;
  topicSlug: string;
  examSlug: string;
};

export type PremiumRecommendation = {
  kind: "premium";
  id: string;
  slug: string;
  title: string;
  category: string;
  hasAccess: boolean;
};

export type GroupLessonRecommendation = {
  kind: "group_lesson";
  slotId: string;
  title: string;
  startsAt: string;
  status: string;
  displayRemaining: number;
  capacity: number;
  productSlug: string;
  hasAccess: boolean;
};

export type TopicRecommendations = {
  topicId: string;
  free: FreeRecommendation[];
  premium: PremiumRecommendation[];
  groupLessons: GroupLessonRecommendation[];
};

/** Given ranked topic ids, find matching free/premium/group-lesson resources. Never fabricated — omits empty categories. */
export async function recommendationsForTopics(userId: string | null, topicIds: string[]): Promise<TopicRecommendations[]> {
  if (topicIds.length === 0) return [];

  const [lessons, products] = await Promise.all([
    db.topicLesson.findMany({
      where: { diagnosticTopicIds: { hasSome: topicIds } },
      include: { topic: { include: { examType: true } } },
    }),
    db.product.findMany({
      where: { diagnosticTopicIds: { hasSome: topicIds }, isPublished: true },
      include: { course: true },
    }),
  ]);

  const groupProducts = products.filter((p) => p.category === "PREP_GROUP" && p.course);
  const courseIds = groupProducts.map((p) => p.course!.id);
  const [enrolledCourseIds, upcomingSlots] = await Promise.all([
    userId ? activeEnrollmentCourseIds(userId, courseIds) : Promise.resolve(new Set<string>()),
    courseIds.length
      ? db.liveSession.findMany({
          where: {
            availabilityEnabled: true,
            cancelled: false,
            startsAt: { gte: new Date() },
            courseId: { in: courseIds },
            course: { product: { isPublished: true } },
          },
          include: groupSlotInclude,
          orderBy: { startsAt: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const otherCourseIds = products.filter((p) => p.category !== "PREP_GROUP" && p.course).map((p) => p.course!.id);
  const otherEnrolled = userId ? await activeEnrollmentCourseIds(userId, otherCourseIds) : new Set<string>();

  return topicIds.map((topicId) => {
    const free: FreeRecommendation[] = lessons
      .filter((l) => l.diagnosticTopicIds.includes(topicId))
      .slice(0, MAX_FREE)
      .map((l) => ({ kind: "free", id: l.id, title: l.title, topicSlug: l.topic.slug, examSlug: l.topic.examType.slug }));

    const premium: PremiumRecommendation[] = products
      .filter((p) => p.diagnosticTopicIds.includes(topicId))
      .slice(0, MAX_PREMIUM)
      .map((p) => ({
        kind: "premium",
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        hasAccess: p.course ? (p.category === "PREP_GROUP" ? enrolledCourseIds : otherEnrolled).has(p.course.id) : false,
      }));

    const groupLessons: GroupLessonRecommendation[] = upcomingSlots
      .filter((slot) => groupProducts.some((p) => p.course!.id === slot.courseId && p.diagnosticTopicIds.includes(topicId)))
      .slice(0, MAX_GROUP_LESSONS)
      .map((slot) => {
        const a = availability(slot, slot._count.bookings);
        const product = groupProducts.find((p) => p.course!.id === slot.courseId)!;
        return {
          kind: "group_lesson",
          slotId: slot.id,
          title: slot.title,
          startsAt: slot.startsAt.toISOString(),
          status: a.status,
          displayRemaining: a.displayRemaining,
          capacity: a.capacity,
          productSlug: product.slug,
          hasAccess: enrolledCourseIds.has(slot.courseId),
        };
      });

    return { topicId, free, premium, groupLessons };
  });
}
