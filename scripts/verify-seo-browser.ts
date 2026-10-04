/** CI-only visual/interaction checks. Never points at production or uses a real account. */
import { chromium, expect, type Browser } from "@playwright/test";
import { createServer as createHttpsServer } from "node:https";
import { request as httpRequest } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { hashPassword } from "../server/auth/password";

async function main() {
  const database = new URL(process.env.DATABASE_URL!);
  if (!["localhost", "127.0.0.1"].includes(database.hostname) || !database.pathname.endsWith("_test")) throw new Error("Local *_test database required");
  const key = await readFile("/tmp/seo-local-key.pem");
  const cert = await readFile("/tmp/seo-local-cert.pem");
  const proxy = createHttpsServer({ key, cert }, (req, res) => {
    const upstream = httpRequest({ hostname: "127.0.0.1", port: 3190, path: req.url, method: req.method, headers: { ...req.headers, "x-forwarded-proto": "https", "x-forwarded-host": "localhost:3191" } }, (reply) => {
      res.writeHead(reply.statusCode ?? 502, reply.headers); reply.pipe(res);
    });
    upstream.on("error", () => { res.writeHead(502); res.end(); }); req.pipe(upstream);
  });
  await new Promise<void>((resolve) => proxy.listen(3191, "127.0.0.1", resolve));
  const email = `seo-ui-${randomUUID()}@example.test`, password = randomUUID();
  const user = await db.user.create({ data: { email, password: await hashPassword(password), role: "ADMIN", name: "SEO UI Test" } });
  let browser: Browser | undefined;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("https://localhost:3191/sign-in?next=%2Fadmin%2Fseo%2Foverview");
    await page.getByLabel("E-posta", { exact: true }).fill(email);
    await page.getByLabel("Şifre", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Giriş Yap", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Netfener SEO başlangıç görünümü" })).toBeVisible({ timeout: 30000 });
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
    await mkdir("/tmp/seo-browser-artifacts", { recursive: true });
    await page.screenshot({ path: "/tmp/seo-browser-artifacts/overview-desktop.png", fullPage: true });
    await page.getByRole("navigation", { name: "SEO bölümleri" }).getByRole("link", { name: "Ayarlar", exact: true }).click();
    await page.getByLabel("Dil / bölge kodu", { exact: true }).fill("en-GB");
    await page.getByRole("button", { name: "Ayarları kaydet", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "Ayarlar kaydedildi" })).toBeVisible();
    await page.reload(); await expect(page.getByLabel("Dil / bölge kodu", { exact: true })).toHaveValue("en-GB");
    await page.screenshot({ path: "/tmp/seo-browser-artifacts/settings-desktop.png", fullPage: true });
    await page.getByRole("navigation", { name: "SEO bölümleri" }).getByRole("link", { name: "Mevcut içerik", exact: true }).click();
    await page.getByRole("button", { name: "İçerik envanterini tara", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "içerik kaydı güncellendi" })).toBeVisible({ timeout: 35000 });
    await page.getByLabel("Başlık veya URL", { exact: true }).fill("/tools/dictionary");
    await page.getByRole("button", { name: "Ara", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Sözlük", exact: true })).toBeVisible();
    await page.screenshot({ path: "/tmp/seo-browser-artifacts/inventory-desktop.png", fullPage: true });
    await page.getByRole("navigation", { name: "SEO bölümleri" }).getByRole("link", { name: "İşlem geçmişi", exact: true }).click();
    await expect(page.getByText("SEO UI Test", { exact: false }).first()).toBeVisible();
    await page.goto("https://localhost:3191/admin/seo/keywords");
    await page.getByText("Anahtar kelime ekle", {exact:true}).click();
    await page.getByLabel("Anahtar kelime", {exact:true}).fill("SEO browser fixture keyword");
    await page.getByLabel("Araştırma kaynağı ve öğrenci ihtiyacı").fill("Isolated browser verification research note");
    await page.getByRole("button", {name:"Anahtar kelimeyi kaydet",exact:true}).click();
    await expect(page.getByRole("heading", {name:"SEO browser fixture keyword",exact:true})).toBeVisible();
    await page.screenshot({path:"/tmp/seo-browser-artifacts/keywords-desktop.png",fullPage:true});
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("https://localhost:3191/admin/seo/opportunities");
    await expect(page.getByRole("heading", {name:"SEO browser fixture keyword",exact:true})).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({path:"/tmp/seo-browser-artifacts/opportunities-mobile.png",fullPage:true});
    await page.goto("https://localhost:3191/admin/seo/settings");
    await expect(page.getByRole("heading", { name: "SEO ayarları", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: "/tmp/seo-browser-artifacts/settings-mobile.png", fullPage: true });
    await page.getByRole("button", { name: "Autopilot'u duraklat", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "Autopilot duraklatıldı" })).toBeVisible();
    expect(errors).toEqual([]);
    console.log("SEO desktop/mobile interactions, persisted settings, inventory, audit, pause and browser errors verified.");
  } finally {
    if (browser) {
      const page = browser.contexts()[0]?.pages()[0];
      console.log("Final browser URL:", page?.url());
      console.log("Final browser text:", (await page?.locator("body").innerText().catch(() => "unavailable"))?.slice(0, 2000));
      await page?.screenshot({ path: "/tmp/seo-browser-artifacts/final-state.png", fullPage: true }).catch(() => undefined);
      await browser.close();
    }
    await db.seoKeyword.deleteMany({where:{keyword:"SEO browser fixture keyword"}});
    await db.user.delete({ where: { id: user.id } }); await db.$disconnect();
    await new Promise<void>((resolve) => proxy.close(() => resolve()));
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
