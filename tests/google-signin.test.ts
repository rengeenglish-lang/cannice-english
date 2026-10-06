import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { resolveGoogleUser } from "../server/auth/google";

const url = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_test"))
  throw new Error("Requires isolated local *_test database");
after(() => db.$disconnect());

test("Google identities map to accounts by verified e-mail only", async () => {
  const stamp = randomUUID();
  const email = `Google-${stamp}@Example.TEST`;
  const created: string[] = [];
  try {
    assert.deepEqual(await resolveGoogleUser({ email, emailVerified: false, name: "X" }), { ok: false, reason: "unverified" });
    assert.deepEqual(await resolveGoogleUser({ email, emailVerified: null }), { ok: false, reason: "unverified" });
    assert.deepEqual(await resolveGoogleUser({ email: null, emailVerified: true }), { ok: false, reason: "unverified" });
    assert.equal(await db.user.count({ where: { email: email.toLowerCase() } }), 0);

    const first = await resolveGoogleUser({ email, emailVerified: true, name: "  Ayşe Yılmaz ", image: "https://lh3.example/a.png" });
    assert.ok(first.ok && first.created && !first.passwordCleared);
    if (first.ok) created.push(first.userId);
    const user = await db.user.findUniqueOrThrow({ where: { email: email.toLowerCase() } });
    assert.equal(user.role, "STUDENT");
    assert.equal(user.password, null);
    assert.equal(user.name, "Ayşe Yılmaz");

    const again = await resolveGoogleUser({ email: email.toUpperCase(), emailVerified: true, name: "Other Name" });
    assert.ok(again.ok && !again.created && again.userId === user.id);
    assert.equal(await db.user.count({ where: { email: email.toLowerCase() } }), 1);
    assert.equal((await db.user.findUniqueOrThrow({ where: { id: user.id } })).name, "Ayşe Yılmaz");

    // Deactivated accounts cannot sign in through Google.
    await db.user.update({ where: { id: user.id }, data: { isActive: false } });
    assert.deepEqual(await resolveGoogleUser({ email, emailVerified: true }), { ok: false, reason: "inactive" });
  } finally {
    await db.user.deleteMany({ where: { email: email.toLowerCase() } });
  }
});

test("linking to a password account removes the password and never changes the role", async () => {
  const stamp = randomUUID();
  const email = `linked-${stamp}@example.test`;
  const admin = await db.user.create({ data: { name: "Existing admin", email, role: "ADMIN", password: "scrypt$not-a-real-hash" } });
  try {
    const result = await resolveGoogleUser({ email, emailVerified: true, name: "Different", image: "https://lh3.example/b.png" });
    assert.ok(result.ok && !result.created && result.passwordCleared && result.userId === admin.id);
    const after = await db.user.findUniqueOrThrow({ where: { id: admin.id } });
    assert.equal(after.password, null);
    assert.equal(after.role, "ADMIN");
    assert.equal(after.name, "Existing admin");
    assert.equal(after.image, "https://lh3.example/b.png");
    const second = await resolveGoogleUser({ email, emailVerified: true });
    assert.ok(second.ok && !second.passwordCleared);
  } finally {
    await db.user.deleteMany({ where: { id: admin.id } });
  }
});

test("simultaneous first sign-ins create exactly one account", async () => {
  const email = `race-${randomUUID()}@example.test`;
  try {
    const results = await Promise.all(Array.from({ length: 4 }, () => resolveGoogleUser({ email, emailVerified: true, name: "Race" })));
    assert.ok(results.every((r) => r.ok));
    assert.equal(new Set(results.map((r) => (r.ok ? r.userId : ""))).size, 1);
    assert.equal(await db.user.count({ where: { email } }), 1);
  } finally {
    await db.user.deleteMany({ where: { email } });
  }
});
