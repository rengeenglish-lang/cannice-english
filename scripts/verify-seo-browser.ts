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
  if (
    !["localhost", "127.0.0.1"].includes(database.hostname) ||
    !database.pathname.endsWith("_test")
  )
    throw new Error("Local *_test database required");
  const key = await readFile("/tmp/seo-local-key.pem");
  const cert = await readFile("/tmp/seo-local-cert.pem");
  const proxy = createHttpsServer({ key, cert }, (req, res) => {
    const upstream = httpRequest(
      {
        hostname: "127.0.0.1",
        port: 3190,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          "x-forwarded-proto": "https",
          "x-forwarded-host": "localhost:3191",
        },
      },
      (reply) => {
        res.writeHead(reply.statusCode ?? 502, reply.headers);
        reply.pipe(res);
      },
    );
    upstream.on("error", () => {
      res.writeHead(502);
      res.end();
    });
    req.pipe(upstream);
  });
  await new Promise<void>((resolve) =>
    proxy.listen(3191, "127.0.0.1", resolve),
  );
  const email = `seo-ui-${randomUUID()}@example.test`,
    password = randomUUID();
  const user = await db.user.create({
    data: {
      email,
      password: await hashPassword(password),
      role: "ADMIN",
      name: "SEO UI Test",
    },
  });
  let browser: Browser | undefined;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(
      "https://localhost:3191/sign-in?next=%2Fadmin%2Fseo%2Foverview",
    );
    await page.getByLabel("E-posta", { exact: true }).fill(email);
    await page.getByLabel("Şifre", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Giriş Yap", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Başlangıç", exact: true }),
    ).toBeVisible({ timeout: 30000 });
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
    await mkdir("/tmp/seo-browser-artifacts", { recursive: true });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: "/tmp/seo-browser-artifacts/overview-desktop.png",
      fullPage: true,
    });
    await page
      .getByRole("navigation", { name: "SEO bölümleri" })
      .getByRole("link", { name: "Ayarlar", exact: true })
      .click();
    await page.getByLabel("Dil / bölge kodu", { exact: true }).fill("en-GB");
    await page
      .getByRole("button", { name: "Ayarları kaydet", exact: true })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "Ayarlar kaydedildi" }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByLabel("Dil / bölge kodu", { exact: true }),
    ).toHaveValue("en-GB");
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: "/tmp/seo-browser-artifacts/settings-desktop.png",
      fullPage: true,
    });
    await page
      .getByRole("navigation", { name: "SEO bölümleri" })
      .getByRole("link", { name: "Mevcut içerik", exact: true })
      .click();
    await page
      .getByRole("button", { name: "İçerik envanterini tara", exact: true })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "içerik kaydı güncellendi" }),
    ).toBeVisible({ timeout: 35000 });
    await page
      .getByLabel("Başlık veya URL", { exact: true })
      .fill("/tools/dictionary");
    await page.getByRole("button", { name: "Ara", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Sözlük", exact: true }),
    ).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: "/tmp/seo-browser-artifacts/inventory-desktop.png",
      fullPage: true,
    });
    await page
      .getByRole("navigation", { name: "SEO bölümleri" })
      .getByRole("link", { name: "İşlem geçmişi", exact: true })
      .click();
    await expect(
      page.getByText("SEO UI Test", { exact: false }).first(),
    ).toBeVisible();
    await page.goto("https://localhost:3191/admin/seo/keywords");
    await page.getByText("Anahtar kelime ekle", { exact: true }).click();
    await page
      .getByLabel("Anahtar kelime", { exact: true })
      .fill("SEO browser fixture keyword");
    await page
      .getByLabel("Araştırma kaynağı ve öğrenci ihtiyacı")
      .fill("Isolated browser verification research note");
    await page
      .getByRole("button", { name: "Anahtar kelimeyi kaydet", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "SEO browser fixture keyword",
        exact: true,
      }),
    ).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: "/tmp/seo-browser-artifacts/keywords-desktop.png",
      fullPage: true,
    });
    const card = page.getByRole("listitem").filter({
      has: page.getByRole("heading", {
        name: "SEO browser fixture keyword",
        exact: true,
      }),
    });
    await card
      .getByRole("button", { name: "Brief oluştur / aç", exact: true })
      .click();
    await card
      .getByRole("link", { name: "Makale çalışma alanını aç", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "SEO browser fixture keyword",
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Bağlantı ekle", exact: true }).click();
    const blogChoice = await db.seoContentItem.findUniqueOrThrow({ where: { sourceKey: "ROUTE:/blog" } });
    await page.getByLabel("Hedef sayfa 1", { exact: true }).selectOption(blogChoice.id);
    await page.getByLabel("Bağlantı metni 1", { exact: true }).fill("İlgili blog yazıları");
    await page.getByRole("button", { name: "Bağlantıları onayla ve kaydet" }).click();
    await expect(page.getByRole("link", { name: "İlgili blog yazıları", exact: true })).toBeVisible();
    await page
      .getByLabel("Hedef okuyucu", { exact: true })
      .fill("Students preparing for an English exam");
    await page
      .getByLabel("Öğrencinin sorunu", { exact: true })
      .fill("Reading unfamiliar exam passages");
    await page
      .getByLabel("Öğrenme hedefi", { exact: true })
      .fill("Find the main argument using evidence");
    await page
      .getByLabel("Bölüm planı (her satıra bir başlık)", { exact: true })
      .fill("Read the question\nCompare the evidence");
    await page
      .getByLabel("Özgün katkı ve örnekler", { exact: true })
      .fill("Explain a short original example and answer");
    await page
      .getByLabel("Kaynaklar ve doğrulama notları", { exact: true })
      .fill("Editor checks the passage and the answer against the source");
    await page
      .getByLabel("Arama amacı", { exact: true })
      .selectOption("INFORMATIONAL");
    await page.getByLabel("En az kelime", { exact: true }).fill("100");
    await page.getByLabel("En çok kelime", { exact: true }).fill("300");
    await page.getByLabel("Brief tamamlandı; taslak yazmaya hazır").check();
    await page
      .getByRole("button", { name: "Briefi kaydet", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Taslağı ve metaverileri kaydet",
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByText("2. ChatGPT ile taslak hazırla", { exact: true })
      .click();
    await expect(
      page.getByLabel("ChatGPT için hazır istem", { exact: true }),
    ).toHaveValue(/SEO browser fixture keyword/);
    await page
      .getByLabel("URL kısa adı", { exact: true })
      .fill("seo-browser-private-draft");
    await page
      .getByLabel("Kısa özet", { exact: true })
      .fill("A draft used only for browser verification.");
    await page
      .getByLabel("SEO başlığı", { exact: true })
      .fill("A useful reading practice guide for students");
    await page
      .getByLabel("SEO açıklaması", { exact: true })
      .fill(
        "Explore practical reading strategies, review an example and learn to compare evidence before choosing your answer.",
      );
    const body = Array.from(
      { length: 4 },
      (_, i) =>
        `Section ${i + 1}\n` +
        Array.from({ length: 30 }, (_, j) => `example${i}word${j}`).join(" "),
    ).join("\n\n");
    await page
      .getByLabel("Makale metni (ChatGPT’den buraya yapıştırın)", {
        exact: true,
      })
      .fill(body);
    await db.blogPost.create({
      data: {
        title: "Collision fixture",
        slug: "seo-browser-slug-collision",
        excerpt: "Isolated test",
        content: "Isolated test",
        authorId: user.id,
        status: "DRAFT",
      },
    });
    await page
      .getByLabel("URL kısa adı", { exact: true })
      .fill("seo-browser-slug-collision");
    await page
      .getByRole("button", {
        name: "Taslağı ve metaverileri kaydet",
        exact: true,
      })
      .click();
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: "Bu URL başka bir yazıda kullanılıyor." }),
    ).toBeVisible();
    await expect(
      page.getByLabel("Makale metni (ChatGPT’den buraya yapıştırın)", {
        exact: true,
      }),
    ).toHaveValue(body);
    await page
      .getByLabel("URL kısa adı", { exact: true })
      .fill("seo-browser-private-draft");
    await page
      .getByRole("button", {
        name: "Taslağı ve metaverileri kaydet",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Editör incelemesini kaydet",
        exact: true,
      }),
    ).toBeEnabled();
    await page
      .getByLabel(
        "Kaydedilmiş yazının sınav bilgilerini, örneklerini, cevaplarını ve kaynaklarını kontrol ettim.",
        { exact: true },
      )
      .check();
    await page
      .getByRole("button", { name: "Editör incelemesini kaydet", exact: true })
      .click();
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: "Editör inceledi · yayınlanmadı" }),
    ).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: "/tmp/seo-browser-artifacts/studio-desktop.png",
      fullPage: true,
    });
    const draft = await db.blogPost.findUniqueOrThrow({
      where: { slug: "seo-browser-private-draft" },
    });
    expect(draft.status).toBe("DRAFT");
    expect(draft.publishedAt).toBeNull();
    const guest = await context.request.get(
      "https://localhost:3191/blog/seo-browser-private-draft",
    );
    // Next may stream a notFound boundary with HTTP 200; content/metadata must stay private either way.
    expect(await guest.text()).not.toContain(
      "A useful reading practice guide for students",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: "/tmp/seo-browser-artifacts/studio-mobile.png",
      fullPage: true,
    });
    // Phase 4: approval -> publish -> public structured data/sitemap -> unpublish.
    await page.setViewportSize({ width: 1440, height: 1000 });
    await expect(page.getByRole("heading", { name: "5. Yayın", exact: true })).toBeVisible();
    await page
      .getByLabel(
        "Metni, bağlantıları ve metaverileri yayınlanmaya hazır olarak onaylıyorum. Onay yazıyı yayınlamaz.",
        { exact: true },
      )
      .check();
    await page.getByRole("button", { name: "Yayın için onayla", exact: true }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Yayın için onaylandı · yayınlanmadı" }),
    ).toBeVisible();
    expect(
      (await db.blogPost.findUniqueOrThrow({ where: { slug: "seo-browser-private-draft" } })).status,
    ).toBe("DRAFT");
    await page
      .getByLabel("Yazı herkese açık olacak ve site haritasına girecek; bunu onaylıyorum.", { exact: true })
      .check();
    await page.getByRole("button", { name: "Şimdi yayınla", exact: true }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Yayında · salt okunur" }),
    ).toBeVisible();
    const live = await context.request.get("https://localhost:3191/blog/seo-browser-private-draft");
    const liveHtml = await live.text();
    expect(liveHtml).toContain("A useful reading practice guide for students");
    expect(liveHtml).toContain("application/ld+json");
    expect(liveHtml).toContain('"@type":"BlogPosting"');
    expect(liveHtml).toContain('rel="canonical"');
    const sitemap = await (await context.request.get("https://localhost:3191/sitemap.xml")).text();
    expect(sitemap).toContain("/blog/seo-browser-private-draft");
    await expect(page.getByRole("heading", { name: "Sürüm geçmişi", exact: true })).toBeVisible();
    await expect(page.getByText("Yayınlandı", { exact: false }).first()).toBeVisible();
    await page.goto("https://localhost:3191/admin/seo/calendar");
    await expect(page.getByRole("heading", { name: "Yayında (1)", exact: true })).toBeVisible();
    await page.goBack();
    await page
      .getByLabel("Yazının yayından kalkacağını ve bu adreste 404 döneceğini anlıyorum.", { exact: true })
      .check();
    await page.getByRole("button", { name: "Yayından kaldır ve düzenle", exact: true }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Taslak / inceleme bekliyor" }),
    ).toBeVisible();
    const gone = await context.request.get("https://localhost:3191/blog/seo-browser-private-draft");
    expect(await gone.text()).not.toContain("A useful reading practice guide for students");
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole("heading", { name: "İçerik bağlantı önerileri", exact: true })).toBeVisible();
    await page.goto("https://localhost:3191/admin/seo/topics");
    await expect(page.getByRole("heading", { name: "Editoryal konu haritası" })).toBeVisible();
    await expect(page.getByRole("link", { name: "SEO browser fixture keyword", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole("button", { name: "Konu kümesi ekle" }).click();
    await page.getByLabel("Küme adı 1", { exact: true }).fill("Browser konu kümesi");
    await page.getByLabel("Ana konu sayfası 1", { exact: true }).selectOption(blogChoice.id);
    await page.getByRole("checkbox", { name: "Sınavlar", exact: true }).check();
    await page.getByRole("button", { name: "Konu kümelerini kaydet" }).click();
    await expect.poll(async () => JSON.parse((await db.appSetting.findUnique({where:{key:"seo_clusters_v1"}}))?.value ?? '{"clusters":[]}').clusters.length).toBe(1);
    await page.reload();
    await expect(page.getByLabel("Küme adı 1", { exact: true })).toHaveValue("Browser konu kümesi");
    await page.getByRole("button", { name: "Kümeyi kaldır 1" }).click();
    await page.getByRole("button", { name: "Konu kümelerini kaydet" }).click();
    await expect.poll(async () => JSON.parse((await db.appSetting.findUnique({where:{key:"seo_clusters_v1"}}))?.value ?? '{"clusters":[]}').clusters.length).toBe(0);
    await page.screenshot({ path: "/tmp/seo-browser-artifacts/topics-mobile.png", fullPage: true });
    await page.goto("https://localhost:3191/admin/seo/opportunities");
    await expect(
      page.getByRole("heading", {
        name: "SEO browser fixture keyword",
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: "/tmp/seo-browser-artifacts/opportunities-mobile.png",
      fullPage: true,
    });
    await page.goto("https://localhost:3191/admin/seo/settings");
    await expect(
      page.getByRole("heading", { name: "SEO ayarları", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: "/tmp/seo-browser-artifacts/settings-mobile.png",
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Autopilot'u duraklat", exact: true })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "Autopilot duraklatıldı" }),
    ).toBeVisible();
    expect(errors).toEqual([]);
    console.log(
      "SEO desktop/mobile interactions, persisted settings, inventory, audit, pause and browser errors verified.",
    );
  } finally {
    if (browser) {
      const page = browser.contexts()[0]?.pages()[0];
      console.log("Final browser URL:", page?.url());
      console.log(
        "Final browser text:",
        (
          await page
            ?.locator("body")
            .innerText()
            .catch(() => "unavailable")
        )?.slice(0, 2000),
      );
      await page
        ?.screenshot({
          path: "/tmp/seo-browser-artifacts/final-state.png",
          fullPage: true,
        })
        .catch(() => undefined);
      await browser.close();
    }
    await db.blogPost.deleteMany({ where: { authorId: user.id } });
    await db.seoKeyword.deleteMany({
      where: { keyword: "SEO browser fixture keyword" },
    });
    await db.user.delete({ where: { id: user.id } });
    await db.$disconnect();
    await new Promise<void>((resolve) => proxy.close(() => resolve()));
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
