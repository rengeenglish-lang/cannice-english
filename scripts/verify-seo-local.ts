/** Local-only HTTP integration check using the real Auth.js credentials flow. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { hashPassword } from "../server/auth/password";
const dbUrl = new URL(process.env.DATABASE_URL!);
const base = process.env.SEO_TEST_ORIGIN ?? "http://localhost:3190";
if (
  !["localhost", "127.0.0.1"].includes(dbUrl.hostname) ||
  !dbUrl.pathname.endsWith("_test") ||
  !["localhost", "127.0.0.1"].includes(new URL(base).hostname)
)
  throw new Error("Local test database and server required");
const users: string[] = [];
async function signIn(role: "ADMIN" | "TEACHER" | "STUDENT") {
  const email = `seo-http-${randomUUID()}@example.test`;
  const password = randomUUID();
  const user = await db.user.create({
    data: {
      email,
      password: await hashPassword(password),
      name: "SEO HTTP Test",
      role,
    },
  });
  users.push(user.id);
  const jar = new Map<string, string>();
  function accept(response: Response) {
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(";")[0];
      jar.set(pair.slice(0, pair.indexOf("=")), pair);
    }
  }
  const csrf = await fetch(`${base}/api/auth/csrf`);
  accept(csrf);
  const { csrfToken } = await csrf.json();
  const login = await fetch(`${base}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Cookie: [...jar.values()].join("; "),
    },
    body: new URLSearchParams({
      email,
      password,
      csrfToken,
      callbackUrl: `${base}/admin/seo/overview`,
    }),
  });
  accept(login);
  assert.ok(
    [...jar.keys()].some((key) => key.includes("session-token")),
    "Credentials login issued a session",
  );
  return { user, cookie: [...jar.values()].join("; ") };
}
async function main() {
  try {
    const guest = await fetch(`${base}/admin/seo/overview`, {
      redirect: "manual",
    });
    assert.equal(guest.status, 307);
    assert.match(guest.headers.get("location") ?? "", /sign-in/);
    const admin = await signIn("ADMIN");
    for (const [section, marker] of [
      ["overview", "Sıradaki işler"],
      ["inventory", "Mevcut içerik envanteri"],
      ["settings", "SEO ayarları"],
      ["activity", "İşlem geçmişi"],
    ]) {
      const response = await fetch(`${base}/admin/seo/${section}`, {
        headers: { Cookie: admin.cookie },
      });
      const html = await response.text();
      assert.equal(response.status, 200, section);
      assert.ok(html.includes(marker), section);
      assert.match(html, /name="robots" content="noindex, nofollow"/);
      assert.ok(!html.includes("SEO verileri yüklenemedi"));
    }
    for (const role of ["TEACHER", "STUDENT"] as const) {
      const session = await signIn(role);
      const response = await fetch(`${base}/admin/seo/settings`, {
        headers: { Cookie: session.cookie },
        redirect: "manual",
      });
      // Next may stream a 403 boundary after sending headers. Inspect semantic error boundary too.
      const html = await response.text();
      assert.ok(
        response.status === 403 ||
          html.includes("NEXT_HTTP_ERROR_FALLBACK;403"),
        `${role} forbidden`,
      );
      assert.ok(
        !html.includes('name="payload"'),
        "Settings payload is not exposed",
      );
    }
    await db.user.update({
      where: { id: admin.user.id },
      data: { isActive: false },
    });
    const disabled = await fetch(`${base}/admin/seo/settings`, {
      headers: { Cookie: admin.cookie },
      redirect: "manual",
    });
    const disabledHtml = await disabled.text();
    assert.ok(
      disabled.status === 307 ||
        disabledHtml.includes("NEXT_REDIRECT") ||
        disabled.status === 403,
    );
    console.log(
      "SEO HTTP check passed: credentials authentication, 4 admin pages, noindex, guest/teacher/student/disabled-account protection.",
    );
  } finally {
    await db.user.deleteMany({ where: { id: { in: users } } });
    await db.$disconnect();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
