import "server-only";
import { db } from "@/server/db";
import { availability } from "@/lib/availability";
import { activeEnrollmentCourseIds } from "@/lib/diagnostics/access";
import { getPlanAccess } from "@/server/services/plans.service";

const MAX_FREE = 3;
const MAX_PREMIUM = 2;
const MAX_GROUP_LESSONS = 1;

const groupSlotInclude = {
  course: { include: { product: { include: { examType: true } } } },
  _count: { select: { bookings: { where: { status: "ACTIVE" as const } } } },
};

/**
 * A Konu Anlatımı lesson that teaches the topic. `access` says how the student can open it: the
 * exam's first topic is a free preview for everyone ("preview"); the rest are included in a plan,
 * so they are "open" for a plan holder (or staff) and "plan" (locked) for everyone else.
 */
export type FreeRecommendation = {
  kind: "free";
  id: string;
  title: string;
  topicSlug: string;
  examSlug: string;
  access: "preview" | "open" | "plan";
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

/**
 * Given ranked topic ids, find matching lesson/premium/group-lesson resources. Never fabricated —
 * omits empty categories. `examTypeId` keeps lessons to the student's own exam: YDS and the three
 * YÖKDİL branches share one diagnostic topic pool, so without it a YDS result could point at a
 * YÖKDİL lesson.
 */
export async function recommendationsForTopics(userId: string | null, topicIds: string[], examTypeId?: string | null): Promise<TopicRecommendations[]> {
  if (topicIds.length === 0) return [];

  const [lessons, products, user] = await Promise.all([
    db.topicLesson.findMany({
      where: { diagnosticTopicIds: { hasSome: topicIds }, ...(examTypeId ? { topic: { examTypeId } } : {}) },
      include: { topic: { include: { examType: true } } },
      orderBy: [{ topic: { displayOrder: "asc" } }, { position: "asc" }],
    }),
    db.product.findMany({
      where: { diagnosticTopicIds: { hasSome: topicIds }, isPublished: true },
      include: { course: true },
    }),
    userId ? db.user.findUnique({ where: { id: userId }, select: { id: true, role: true } }) : Promise.resolve(null),
  ]);

  // Konu Anlatımı access: every exam's first topic (lowest displayOrder) is a free preview.
  const lessonExamIds = [...new Set(lessons.map((l) => l.topic.examTypeId))];
  const [access, firstTopics] = await Promise.all([
    getPlanAccess(user),
    lessonExamIds.length
      ? db.examTopic.findMany({ where: { examTypeId: { in: lessonExamIds } }, orderBy: { displayOrder: "asc" }, distinct: ["examTypeId"], select: { id: true } })
      : Promise.resolve([]),
  ]);
  const previewTopicIds = new Set(firstTopics.map((t) => t.id));
  const canLessons = access.can("KONU_ANLATIMI");

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
      .map((l) => ({
        kind: "free",
        id: l.id,
        title: l.title,
        topicSlug: l.topic.slug,
        examSlug: l.topic.examType.slug,
        access: previewTopicIds.has(l.topicId) ? "preview" : canLessons ? "open" : "plan",
      }));

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
