import { test } from "node:test";
import assert from "node:assert/strict";
import { approvedProgrammePlans, curriculumReport, programmeProgress, type ModuleOutline, type ActivityOutline } from "../lib/curriculum";

const activity = (id: string, durationMinutes = 60): ActivityOutline => ({ id, title: id, type: "INDEPENDENT_STUDY", durationMinutes, instructions: "Read the assigned lesson and submit an analysis.", completionCriteria: "A reviewed written analysis.", simulationKey: null, prerequisites: [], assessment: { rubric: "Accuracy and reasoning", minimumScore: 60 } });
const moduleOf = (activities: ActivityOutline[]): ModuleOutline => ({ id: "module", title: "Reading", units: [{ id: "unit" }], durationBudgets: [{ type: "INDEPENDENT_STUDY", minutes: 15000 }], lessons: [{ unitId: "unit", activities }] });

test("seven distinct approved plans each total 15,000 minutes without converting budgets into activities", () => {
  assert.equal(approvedProgrammePlans.length, 7);
  assert.equal(new Set(approvedProgrammePlans.map((p) => p.examCode)).size, 7);
  for (const plan of approvedProgrammePlans) {
    const modules = plan.modules.map((m, i) => ({ id: String(i), title: m.title, durationBudgets: m.budgets, units: [], lessons: [] }));
    const report = curriculumReport(modules, false);
    assert.equal(report.plannedMinutes, 15000, plan.name);
    assert.equal(report.totalMinutes, 0);
    assert.equal(report.publishable, false);
    assert.equal(programmeProgress(modules, []).completedMinutes, 0);
  }
  const fields = approvedProgrammePlans.filter((p) => p.examCode.startsWith("YOKDIL"));
  assert.equal(new Set(fields.map((p) => p.modules[1].scope)).size, 3);
});
test("publication requires exact actual duration, complete structure, rubric and verified exam format", () => {
  const activities = Array.from({ length: 250 }, (_, i) => activity(`a${i}`));
  assert.equal(curriculumReport([moduleOf(activities)], true).publishable, true);
  assert.equal(curriculumReport([moduleOf(activities.slice(1))], true).publishable, false);
  assert.equal(curriculumReport([moduleOf([...activities, activity("extra")])], true).publishable, false);
  assert.equal(curriculumReport([moduleOf(activities)], false).publishable, false);
  assert.equal(curriculumReport([moduleOf([{ ...activities[0], assessment: null }, ...activities.slice(1)])], true).publishable, false);
});
test("simulations cannot be published by inventing an adapter key; cycles and cross-program prerequisites fail", () => {
  const a = { ...activity("a"), type: "EXAM_SIMULATION" as const, simulationKey: "fake-adapter" };
  assert.ok(curriculumReport([moduleOf([a])], true).issues.some((i) => i.includes("simülasyon bağlantısı")));
  const b = { ...activity("b"), prerequisites: [{ prerequisiteId: "b" }] };
  assert.ok(curriculumReport([moduleOf([b])], true).issues.some((i) => i.includes("ön koşul")));
});
test("progress counts verified activity credit once, ignores revocation, strangers and mismatched credit", () => {
  const modules = [moduleOf([activity("a"), activity("b")])];
  const completion = { activityId: "a", creditedMinutes: 60, revokedAt: null };
  const progress = programmeProgress(modules, [completion, completion, { ...completion, activityId: "foreign" }, { activityId: "b", creditedMinutes: 600, revokedAt: null }]);
  assert.equal(progress.completedMinutes, 60);
  assert.equal(progress.breakdown.INDEPENDENT_STUDY, 60);
  assert.equal(progress.roadmap[0].status, "CURRENT");
  assert.equal(programmeProgress(modules, [{ ...completion, revokedAt: new Date() }]).completedMinutes, 0);
  assert.equal(programmeProgress(modules, [completion, { ...completion, activityId: "b" }]).roadmap[0].status, "COMPLETED");
});
