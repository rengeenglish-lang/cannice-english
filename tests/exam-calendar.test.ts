import { test } from "node:test";
import assert from "node:assert/strict";
import { EXAM_CALENDAR, examStatus, splitCalendar } from "../content/exam-calendar";

test("exam calendar rows are well-formed and dates are in order", () => {
  const names = new Set<string>();
  for (const e of EXAM_CALENDAR) {
    assert.ok(!names.has(e.name), `duplicate ${e.name}`);
    names.add(e.name);
    for (const d of [e.applicationStart, e.applicationEnd, e.lateApplication, e.examDate, e.resultDate]) if (d) assert.match(d, /^\d{4}-\d{2}-\d{2}$/);
    if (e.applicationStart && e.applicationEnd) assert.ok(e.applicationStart <= e.applicationEnd, e.name);
    if (e.applicationEnd) assert.ok(e.applicationEnd < e.examDate, e.name);
    if (e.resultDate) assert.ok(e.resultDate >= e.examDate, e.name);
  }
});

test("an exam stays upcoming until its result is out; status follows the dates", () => {
  const { upcoming, past } = splitCalendar("2026-10-11");
  assert.equal(upcoming[0].name, "e-YDS 2026/11");
  assert.ok(upcoming.some((e) => e.name === "2026-YDS/2"));
  assert.equal(past[0].name, "e-YDS 2026/10", "most recent first");
  const yds2 = EXAM_CALENDAR.find((e) => e.name === "2026-YDS/2")!;
  assert.equal(examStatus(yds2, "2026-09-01"), "Başvurular yakında");
  assert.equal(examStatus(yds2, "2026-10-01"), "Başvurular açık");
  assert.equal(examStatus(yds2, "2026-10-11"), "Geç başvuru");
  assert.equal(examStatus(yds2, "2026-10-20"), "Sınav yaklaşıyor");
  assert.equal(examStatus(yds2, "2026-11-30"), "Sonuç bekleniyor");
  assert.equal(examStatus(yds2, "2026-12-10"), "Tamamlandı");
});
