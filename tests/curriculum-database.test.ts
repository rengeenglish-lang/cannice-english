import { test, after } from "node:test";
import assert from "node:assert/strict";
import { db } from "../server/db";
import { approvedProgrammePlans } from "../lib/curriculum";
import { importApprovedProgrammePlans, listCurriculaForAdmin, addCurriculumUnit, addCurriculumLesson, saveCurriculumActivity, publishCurriculum, verifyActivityCompletion, getProgrammeProgress, revokeActivityCompletion } from "../server/services/curriculum.service";
import { addLesson, togglePublish } from "../server/services/admin-products.service";
const url = new URL(process.env.DATABASE_URL!);
if (!["127.0.0.1", "localhost"].includes(url.hostname) || !url.pathname.endsWith("_test")) throw new Error("Requires isolated local *_test database");
after(async () => db.$disconnect());

test("curriculum import, authorization, publication gate and evidence-backed completion", async () => {
  // Fixtures live only in the ephemeral CI database; published records are intentionally immutable.
  const stamp = `${Date.now()}-${Math.random()}`;
  const admin = await db.user.create({ data: { name: "Curriculum admin", email: `ca-${stamp}@example.test`, role: "ADMIN" } });
  const teacher = await db.user.create({ data: { name: "Unassigned teacher", email: `ct-${stamp}@example.test`, role: "TEACHER" } });
  const student = await db.user.create({ data: { name: "Student", email: `cs-${stamp}@example.test` } });
  const other = await db.user.create({ data: { name: "Other", email: `co-${stamp}@example.test` } });
  for (const plan of approvedProgrammePlans) await db.examType.upsert({ where: { code: plan.examCode }, update: {}, create: { code: plan.examCode, slug: plan.examCode.toLowerCase(), name: plan.name } });
  await assert.rejects(importApprovedProgrammePlans(teacher.id), /yönetici/);
  const [first, second] = await Promise.all([importApprovedProgrammePlans(admin.id), importApprovedProgrammePlans(admin.id)]);
  assert.deepEqual(first, second);
  const plans = await listCurriculaForAdmin(admin.id);
  assert.equal(plans.length, 7);
  for (const plan of plans) {
    assert.equal(plan.report.plannedMinutes, 15000);
    assert.equal(plan.report.totalMinutes, 0);
    assert.equal(plan.product.isPublished, false);
    assert.equal(plan.curriculumPublishedAt, null);
  }
  const course = plans.find((p) => p.product.examType?.code === "YDS")!;
  await assert.rejects(publishCurriculum(admin.id, course.id), /yayımlanamaz/);
  await assert.rejects(togglePublish(course.productId), /kohort/);
  await assert.rejects(addLesson(course.modules[0].id, { title: "Bypass" }), /müfredat/);
  await assert.rejects(addCurriculumUnit(teacher.id, course.modules[0].id, { title: "Unit", objective: "Understand clauses" }), /yönetici/);
  const unit = await addCurriculumUnit(admin.id, course.modules[0].id, { title: "Clauses", objective: "Identify relative clauses" });
  const lesson = await addCurriculumLesson(admin.id, unit.id, { title: "Relative clauses", description: "Compare restrictive clauses" });
  const raw = { title: "Sentence analysis", type: "INDEPENDENT_STUDY", durationMinutes: 45, instructions: "Analyse ten clauses and explain each choice", completionCriteria: "Reviewed analysis with corrections", assessment: { rubric: "Correctness and explanation", minimumScore: 60 } };
  await assert.rejects(saveCurriculumActivity(admin.id, lesson.id, { ...raw, durationMinutes: -1 }));
  const a = await saveCurriculumActivity(admin.id, lesson.id, raw);
  await assert.rejects(saveCurriculumActivity(admin.id, lesson.id, { ...raw, prerequisiteIds: [a.id] }, a.id), /Ön koşul/);
  const b = await saveCurriculumActivity(admin.id, lesson.id, { ...raw, title: "Revision", prerequisiteIds: [a.id] });
  const live = await saveCurriculumActivity(admin.id, lesson.id, { ...raw, title: "Live analysis", type: "LIVE_INSTRUCTION", assessment: null });
  const live2 = await saveCurriculumActivity(admin.id, lesson.id, { ...raw, title: "Second live activity", type: "LIVE_INSTRUCTION", assessment: null });
  const simulation = await saveCurriculumActivity(admin.id, lesson.id, { ...raw, title: "Simulation", type: "EXAM_SIMULATION" });
  const enrollment = await db.enrollment.create({ data: { userId: student.id, courseId: course.id, grantedAt: new Date(Date.now() - 86400000) } });
  const submission = await db.practiceSubmission.create({ data: { enrollmentId: enrollment.id, title: "Analysis", studentAnswer: "My clause analysis", status: "REVIEWED", reviewedAt: new Date(), teacherFeedback: "Accurate reasoning", score: 80 } });
  const evidence = { submissionId: submission.id, evidenceNote: "Reviewed against the activity rubric." };
  await assert.rejects(verifyActivityCompletion(admin.id, enrollment.id, a.id, evidence), /Taslak/);
  // Test-only publication fixture lets completion and immutability be tested independently
  // from the publication gate, which correctly refuses the incomplete real drafts above.
  await db.course.update({ where: { id: course.id }, data: { curriculumPublishedAt: new Date() } });
  await assert.rejects(saveCurriculumActivity(admin.id, lesson.id, raw), /değiştirilemez/);
  await assert.rejects(db.curriculumActivity.update({ where: { id: a.id }, data: { durationMinutes: 90 } }), /immutable/);
  await assert.rejects(verifyActivityCompletion(teacher.id, enrollment.id, a.id, evidence), /yönetici/);
  await assert.rejects(verifyActivityCompletion(student.id, enrollment.id, a.id, evidence), /yönetici/);
  await assert.rejects(verifyActivityCompletion(admin.id, enrollment.id, b.id, evidence), /Ön koşullar/);
  await db.practiceSubmission.update({ where: { id: submission.id }, data: { score: 10 } });
  await assert.rejects(verifyActivityCompletion(admin.id, enrollment.id, a.id, evidence), /eşiği/);
  await db.practiceSubmission.update({ where: { id: submission.id }, data: { score: 80, status: "PENDING" } });
  await assert.rejects(verifyActivityCompletion(admin.id, enrollment.id, a.id, evidence), /değerlendirilmiş/);
  await db.practiceSubmission.update({ where: { id: submission.id }, data: { status: "REVIEWED" } });
  await assert.rejects(verifyActivityCompletion(admin.id, enrollment.id, simulation.id, evidence), /simülasyon/);
  const results = await Promise.all([verifyActivityCompletion(admin.id, enrollment.id, a.id, evidence), verifyActivityCompletion(admin.id, enrollment.id, a.id, evidence)]);
  assert.equal(results[0].id, results[1].id);
  assert.equal((await getProgrammeProgress(student.id, enrollment.id)).completedMinutes, 45);
  await assert.rejects(getProgrammeProgress(other.id, enrollment.id), /yetkiniz/);
  await assert.rejects(getProgrammeProgress(teacher.id, enrollment.id), /yetkiniz/);
  await assert.rejects(verifyActivityCompletion(admin.id, enrollment.id, b.id, evidence)); // same submission cannot earn credit twice
  await db.enrollment.update({ where: { id: enrollment.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
  await assert.rejects(verifyActivityCompletion(admin.id, enrollment.id, b.id, evidence), /Aktif/);
  assert.equal((await getProgrammeProgress(student.id, enrollment.id)).completedMinutes, 45); // history preserved
  await revokeActivityCompletion(admin.id, results[0].id, "Incorrect evidence association; review required");
  assert.equal((await getProgrammeProgress(student.id, enrollment.id)).completedMinutes, 0);
  await db.enrollment.update({ where: { id: enrollment.id }, data: { expiresAt: null } });
  const session = await db.liveSession.create({ data: { courseId: course.id, title: "Completed lesson", startsAt: new Date(Date.now()-7200000), endsAt: new Date(Date.now()-3600000) } });
  const liveEvidence = { liveSessionId: session.id, evidenceNote: "Attendance verified by the administrator against the session register." };
  assert.equal((await getProgrammeProgress(student.id, enrollment.id)).completedMinutes, 0); // elapsed session time earns nothing
  await verifyActivityCompletion(admin.id, enrollment.id, live.id, liveEvidence);
  assert.equal((await getProgrammeProgress(student.id, enrollment.id)).completedMinutes, 45);
  await assert.rejects(verifyActivityCompletion(admin.id, enrollment.id, live2.id, liveEvidence)); // same live lesson cannot earn hours twice
  await db.liveSession.update({ where: { id: session.id }, data: { endsAt: new Date(Date.now()+3600000) } });
  await assert.rejects(verifyActivityCompletion(admin.id, enrollment.id, live2.id, liveEvidence), /tamamlanmış/);
});
