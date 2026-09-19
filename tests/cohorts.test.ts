import { test } from "node:test";
import assert from "node:assert/strict";
import { cohortAvailability } from "../lib/cohorts";
test("real cohort counts drive capacity and minimum formation independently", () => {
  const cohort = { minimumCapacity: 5, maximumCapacity: 10, status: "OPEN" };
  assert.equal(cohortAvailability(cohort, 0).formation, "YENİ GRUP");
  assert.equal(cohortAvailability(cohort, 3).formation, "KAYIT TOPLANIYOR");
  assert.equal(cohortAvailability(cohort, 5).formation, "GRUP KESİNLEŞTİ");
  assert.equal(cohortAvailability(cohort, 8).capacity, "LIMITED");
  assert.equal(cohortAvailability(cohort, 10).canRegister, false);
  assert.equal(cohortAvailability(cohort, 10).canWaitlist, true);
  assert.equal(cohortAvailability({ ...cohort, status: "CLOSED" }, 1).canRegister, false);
});
