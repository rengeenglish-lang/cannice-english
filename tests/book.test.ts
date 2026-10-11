import { test } from "node:test";
import assert from "node:assert/strict";
import { findPageForDay, paginateByDay } from "../lib/coaching/book";
import { buildBookPages, toBookCard, type BookCard } from "../lib/coaching/vocab-book";

const card = (id: string, addedDay: string): BookCard => ({ id, term: id, meaning: "m", example: null, source: "STUDENT", addedDay, nextReviewDay: addedDay });

test("cards are paged by the local day they were added, a busy day continuing over pages", () => {
  const cards = [card("a", "2026-10-03"), card("b", "2026-10-01"), card("c", "2026-10-03"), card("d", "2026-10-03")];
  const pages = buildBookPages(cards, 2);
  assert.deepEqual(pages.map((p) => [p.day, p.items.map((c) => c.id), `${p.part}/${p.parts}`]), [
    ["2026-10-01", ["b"], "1/1"],
    ["2026-10-03", ["a", "c"], "1/2"],
    ["2026-10-03", ["d"], "2/2"],
  ]);
});

test("the added day follows the student's timezone, and learned cards have no next review", () => {
  const c = toBookCard({ id: "x", term: "t", meaning: "m", example: null, source: "SITE", createdAt: new Date("2026-10-10T22:30:00Z"), dueAt: new Date("2026-10-12T09:00:00Z"), masteredAt: null }, "Europe/Istanbul");
  assert.equal(c.addedDay, "2026-10-11");
  assert.equal(c.nextReviewDay, "2026-10-12");
  assert.equal(toBookCard({ ...c, createdAt: new Date(), dueAt: new Date(), masteredAt: new Date() }, "Europe/Istanbul").nextReviewDay, null);
});

test("searching a date opens that day's first page, or the closest day when nothing was added", () => {
  const pages = buildBookPages([card("a", "2026-10-01"), card("b", "2026-10-05"), card("c", "2026-10-05"), card("d", "2026-10-09")], 1);
  assert.deepEqual(findPageForDay(pages, "2026-10-05"), { index: 1, exact: true });
  assert.deepEqual(findPageForDay(pages, "2026-10-08"), { index: 3, exact: false });
  assert.deepEqual(findPageForDay(pages, "2026-10-03"), { index: 0, exact: false }, "a tie opens the earlier day");
  assert.deepEqual(findPageForDay(pages, "2026-12-31"), { index: 3, exact: false });
  assert.equal(findPageForDay(pages, ""), null);
  assert.equal(findPageForDay([], "2026-10-05"), null);
});

test("the notebook pages any dated items the same way, items keeping their order within a day", () => {
  const items = [{ k: "q1", d: "2026-10-02" }, { k: "v1", d: "2026-10-01" }, { k: "w1", d: "2026-10-02" }];
  assert.deepEqual(paginateByDay(items, (i) => i.d, 5).map((p) => [p.day, p.items.map((i) => i.k)]), [["2026-10-01", ["v1"]], ["2026-10-02", ["q1", "w1"]]]);
});
