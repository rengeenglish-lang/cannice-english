import assert from "node:assert/strict";
import { test, after } from "node:test";
import { db } from "../server/db";
import {
  availability,
  occupancyStatus,
  dateAt,
  addDays,
  localDate,
  weekRange,
  slotReturnPath,
} from "../lib/availability";
import {
  saveGroupSlot,
  getGroupSlot,
  enrollGroupSlot,
  cancelGroupBooking,
  manageGroupSlot,
  createDemoGroupSlots,
  listGroupSlots,
} from "../server/services/group-availability.service";
import { getEnrollmentForCourse, listEnrollmentsForUser } from "../server/services/learning.service";
const url = new URL(process.env.DATABASE_URL!);
if (
  !["127.0.0.1", "localhost"].includes(url.hostname) ||
  !url.pathname.endsWith("_test")
)
  throw new Error("Tests require an isolated local *_test database");
after(async () => {
  await db.$disconnect();
});
test("thresholds, proportional capacity, demo occupancy, timezone and safe return path", () => {
  for (const [n, expected] of [
    [0, "AVAILABLE"],
    [6, "AVAILABLE"],
    [7, "ALMOST_FULL"],
    [9, "ALMOST_FULL"],
    [10, "FULL"],
  ] as const)
    assert.equal(occupancyStatus(n, 10), expected);
  assert.equal(occupancyStatus(5, 8), "AVAILABLE");
  assert.equal(occupancyStatus(6, 8), "ALMOST_FULL");
  const slot = {
    capacity: 10,
    enrollmentOpen: true,
    cancelled: false,
    startsAt: addDays(new Date(), 1),
    displayedOccupancy: 10,
    useDisplayedOccupancy: true,
  };
  assert.equal(availability(slot, 2).remaining, 8);
  assert.equal(availability(slot, 2).status, "FULL");
  assert.equal(availability(slot, 2).canEnroll, true);
  assert.equal(availability({ ...slot, cancelled: true }, 2).canEnroll, false);
  assert.equal(
    availability({ ...slot, enrollmentOpen: false }, 2).status,
    "CLOSED",
  );
  assert.equal(
    availability({ ...slot, startsAt: new Date(0) }, 0).canEnroll,
    false,
  );
  assert.equal(localDate(weekRange("2026-09-27").start), "2026-09-21");
  assert.equal(weekRange("2026-09-21").next, "2026-09-28");
  assert.equal(
    dateAt("2026-09-21", "18:00").toISOString(),
    "2026-09-21T15:00:00.000Z",
  );
  assert.throws(() => dateAt("2026-02-30"));
  assert.equal(slotReturnPath("https://evil.example"), undefined);
  assert.equal(slotReturnPath("//evil.example"), undefined);
  assert.equal(slotReturnPath("/group-lessons/abc"), "/group-lessons/abc");
});
test("database booking and admin lifecycle", async () => {
  const suffix = Date.now().toString();
  const product = await db.product.create({
    data: {
      slug: `test-${suffix}`,
      title: "Test group",
      category: "PREP_GROUP",
      basePrice: 0,
      salePrice: 0,
      course: { create: { deliveryFormat: "LIVE_ONLY" } },
    },
    include: { course: true },
  });
  const courseId = product.course!.id;
  const users = await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      db.user.create({
        data: {
          email: `seat-${suffix}-${i}@test.invalid`,
          name: `Test ${i}`,
          enrollments: { create: { courseId } },
        },
      }),
    ),
  );
  const base = {
    title: "Capacity test",
    courseId,
    date: localDate(addDays(new Date(), 2)),
    time: "18:00",
    duration: 60,
    capacity: 10,
    useDisplayedOccupancy: true,
    displayedOccupancy: 10,
    enrollmentOpen: true,
  };
  const id = await saveGroupSlot(base);
  try {
    assert.equal((await getEnrollmentForCourse(users[0].id, courseId))!.course.liveSessions.length, 0);
    for (let i = 0; i < 9; i++) await enrollGroupSlot(id, users[i].id);
    const results = await Promise.allSettled(
      users.slice(9).map((u) => enrollGroupSlot(id, u.id)),
    );
    assert.equal(
      results.filter((r) => r.status === "fulfilled").length,
      1,
      "exactly one final seat must be allocated",
    );
    assert.equal((await getGroupSlot(id))!.availability.actual, 10);
    await enrollGroupSlot(id, users[0].id);
    assert.equal((await getEnrollmentForCourse(users[0].id, courseId))!.course.liveSessions.length, 1);
    assert.equal(
      await db.groupLessonEnrollment.count({ where: { slotId: id } }),
      10,
      "retry is idempotent",
    );
    await assert.rejects(
      saveGroupSlot({ ...base, capacity: 9, displayedOccupancy: 9 }, id),
      /gerçek öğrenci/,
    );
    await cancelGroupBooking(id, users[0].id);
    assert.equal((await getGroupSlot(id))!.availability.remaining, 1);
    await manageGroupSlot(id, "close");
    await assert.rejects(enrollGroupSlot(id, users[0].id), /kayıt kapalı/);
    await manageGroupSlot(id, "open");
    await enrollGroupSlot(id, users[0].id);
    await manageGroupSlot(id, "cancel");
    assert.equal((await listEnrollmentsForUser(users[0].id))[0].course.liveSessions.length, 0);
    assert.equal((await getGroupSlot(id))!.availability.status, "CANCELLED");
    await assert.rejects(manageGroupSlot(id, "delete"), /silinemez/);
    await manageGroupSlot(id, "open");
    await cancelGroupBooking(id, users[0].id);
    const noAccess = await db.user.create({
      data: { email: `no-access-${suffix}@test.invalid`, name: "No access" },
    });
    try {
      await assert.rejects(enrollGroupSlot(id, noAccess.id), /paketine/);
    } finally {
      await db.user.delete({ where: { id: noAccess.id } });
    }
    const recurrence = await saveGroupSlot({
      ...base,
      title: "Weekly",
      repeatWeeks: 4,
    });
    const series = (await getGroupSlot(recurrence))!.recurringSeriesId!;
    let occurrences = await db.liveSession.findMany({
      where: { recurringSeriesId: series },
      orderBy: { startsAt: "asc" },
    });
    assert.equal(occurrences.length, 4);
    assert.equal(
      occurrences[1].startsAt.getTime() - occurrences[0].startsAt.getTime(),
      7 * 86400000,
    );
    const second = occurrences[1];
    await saveGroupSlot(
      {
        ...base,
        title: "Single edit",
        date: localDate(second.startsAt),
        time: "19:00",
      },
      second.id,
    );
    assert.equal((await getGroupSlot(recurrence))!.title, "Weekly");
    await saveGroupSlot(
      {
        ...base,
        title: "Future edit",
        date: localDate(second.startsAt),
        time: "20:00",
      },
      second.id,
      true,
    );
    occurrences = await db.liveSession.findMany({
      where: { recurringSeriesId: series },
      orderBy: { startsAt: "asc" },
    });
    assert.equal(occurrences[0].title, "Weekly");
    assert.ok(occurrences.slice(1).every((s) => s.title === "Future edit"));
    const copy = await manageGroupSlot(recurrence, "duplicate");
    assert.ok(copy);
    assert.equal((await getGroupSlot(copy))!.enrollmentOpen, false);
    assert.equal((await getGroupSlot(copy))!.availability.actual, 0);
    await manageGroupSlot(copy, "delete");
    assert.equal(await getGroupSlot(copy), null);
    await saveGroupSlot({ ...base, useDisplayedOccupancy: false }, recurrence);
    assert.equal((await getGroupSlot(recurrence))!.availability.displayed, 0);
    const range = weekRange(base.date);
    assert.ok(
      (await listGroupSlots(range.start, range.end)).some((s) => s.id === id),
    );
    const before = await db.groupLessonEnrollment.count();
    await createDemoGroupSlots(courseId);
    await createDemoGroupSlots(courseId);
    const demos = await db.liveSession.findMany({
      where: { recurringSeriesId: "availability-demo" },
      orderBy: { startsAt: "asc" },
    });
    assert.deepEqual(
      demos.map((s) => s.displayedOccupancy),
      [0, 2, 4, 7, 8, 9, 10],
    );
    assert.equal(await db.groupLessonEnrollment.count(), before);
  } finally {
    const slots = await db.liveSession.findMany({ where: { courseId } });
    await db.groupLessonEnrollment.deleteMany({
      where: { slotId: { in: slots.map((s) => s.id) } },
    });
    await db.liveSession.deleteMany({ where: { courseId } });
    await db.groupLessonSeries.deleteMany({
      where: {
        id: {
          in: slots.flatMap((s) =>
            s.recurringSeriesId ? [s.recurringSeriesId] : [],
          ),
        },
      },
    });
    await db.enrollment.deleteMany({ where: { courseId } });
    await db.user.deleteMany({ where: { id: { in: users.map((u) => u.id) } } });
    await db.course.delete({ where: { id: courseId } });
    await db.product.delete({ where: { id: product.id } });
  }
});
