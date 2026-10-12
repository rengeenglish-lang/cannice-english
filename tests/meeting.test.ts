import { test } from "node:test";
import assert from "node:assert/strict";
import { newMeetingUrl } from "../lib/meeting";

test("meeting rooms: readable, dated, Turkish-safe and unguessable", () => {
  const a = newMeetingUrl("Canlı Soru-Cevap: Çeviri Teknikleri", new Date("2026-11-10T12:00:00Z"));
  assert.match(a, /^https:\/\/meet\.jit\.si\/netfener-canli-soru-cevap-ceviri-teknikleri-20261110-[0-9a-f]{10}$/);
  assert.notEqual(a, newMeetingUrl("Canlı Soru-Cevap: Çeviri Teknikleri", new Date("2026-11-10T12:00:00Z")));
  assert.match(newMeetingUrl("!!!", new Date("2026-10-13T09:00:00Z")), /netfener-ders-20261013-/);
});
