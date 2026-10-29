import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeWheelEmail } from "@/lib/wheel-email";

test("gmail dots and plus tags resolve to the same address", () => {
  assert.equal(normalizeWheelEmail("Ali.Yilmaz+wheel@gmail.com"), "aliyilmaz@gmail.com");
  assert.equal(normalizeWheelEmail("aliyilmaz@googlemail.com"), "aliyilmaz@gmail.com");
});

test("plus tags are removed on other providers, dots are kept", () => {
  assert.equal(normalizeWheelEmail("ali.yilmaz+x@outlook.com"), "ali.yilmaz@outlook.com");
});

test("malformed input is only trimmed and lowercased", () => {
  assert.equal(normalizeWheelEmail("  NOT-AN-EMAIL "), "not-an-email");
});
