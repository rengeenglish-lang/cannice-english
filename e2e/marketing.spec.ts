import { expect, test } from "@playwright/test";

// Run against a running local app or a deployed preview:
// NETFENER_E2E_BASE_URL=https://... npx playwright test e2e/marketing.spec.ts
const baseURL = process.env.NETFENER_E2E_BASE_URL ?? "http://localhost:3000";
test.use({ baseURL });

test("e-book preview displays one page with bounded keyboard and button navigation", async ({ page }) => {
  await page.goto("/kaynaklar/e-kitaplar/onizleme/yokdil-saglik");
  const reader = page.getByRole("region", { name: "YÖKDİL Sağlık: önizleme" });
  await expect(reader.locator("img")).toHaveCount(1);
  await expect(reader.getByText("Sayfa 1 / 10", { exact: true })).toBeVisible();
  await expect(reader.getByRole("button", { name: "Önceki sayfa", exact: true })).toBeDisabled();
  await reader.getByRole("button", { name: "Sonraki sayfa", exact: true }).click();
  await expect(reader.locator("img")).toHaveAttribute("src", /yokdil-saglik-2\.jpg/);
  await expect.poll(() => reader.locator("img").evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  const stage = reader.getByRole("group", { name: /Kitap sayfası/ });
  await stage.focus();
  await page.keyboard.press("End");
  await expect(reader.getByRole("button", { name: "Sonraki sayfa", exact: true })).toBeDisabled();
  await page.keyboard.press("ArrowRight");
  await expect(reader.getByText("Sayfa 10 / 10", { exact: true })).toBeVisible();
  await page.keyboard.press("Home");
  await expect(reader.getByText("Sayfa 1 / 10", { exact: true })).toBeVisible();
  await reader.getByLabel("Önizleme sayfası seç").selectOption("7");
  await expect(reader.locator("img")).toHaveAttribute("src", /yokdil-saglik-7\.jpg/);
  await expect(reader.locator("img")).toHaveCount(1);
});

test("resource tools remain accessible from the desktop dropdown", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Kaynaklar", exact: true });
  await trigger.click();
  const menu = page.locator("#resources-navigation");
  await expect(menu.getByRole("link", { name: "Sözlük", exact: true })).toHaveAttribute("href", "/sozluk");
  await expect(menu.getByRole("link", { name: "Thesaurus", exact: true })).toHaveAttribute("href", "/thesaurus");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("mobile preview fits horizontally and respects vertical gestures", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/kaynaklar/e-kitaplar/onizleme/yokdil-saglik");
  const reader = page.getByRole("region", { name: "YÖKDİL Sağlık: önizleme" });
  const stage = reader.getByRole("group", { name: /Kitap sayfası/ });
  await stage.evaluate(node => {
    const start = new Touch({ identifier: 1, target: node, clientX: 300, clientY: 100 });
    const end = new Touch({ identifier: 1, target: node, clientX: 100, clientY: 100 });
    node.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, touches: [start] }));
    node.dispatchEvent(new TouchEvent("touchend", { bubbles: true, touches: [], changedTouches: [end] }));
  });
  await expect(reader.getByText("Sayfa 2 / 10", { exact: true })).toBeVisible();
  await stage.evaluate(node => {
    const start = new Touch({ identifier: 1, target: node, clientX: 100, clientY: 100 });
    const end = new Touch({ identifier: 1, target: node, clientX: 110, clientY: 300 });
    node.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, touches: [start] }));
    node.dispatchEvent(new TouchEvent("touchend", { bubbles: true, touches: [], changedTouches: [end] }));
  });
  await expect(reader.getByText("Sayfa 2 / 10", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const image = await reader.locator("img").boundingBox();
  const viewport = await stage.boundingBox();
  expect(image!.height).toBeLessThanOrEqual(viewport!.height);
});

test("homepage preserves the hero and presents real book previews", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sınavına hazırlan.Hedefine ulaş.");
  await expect(page.getByText("İlk yorumu sen yaz", { exact: true })).toHaveCount(0);
  await expect(page.getByText("İlk katılan sen ol", { exact: true })).toHaveCount(0);
  const resources = page.getByRole("region", { name: "İçeriğini gör. Kaynağını seç." });
  await expect(resources.locator('a[href*="/onizleme/"] img').first()).toBeVisible();
});

test("desktop and mobile layouts in light and dark themes", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const rejectCookies = page.getByRole("button", { name: "Tümünü reddet", exact: true });
  if (await rejectCookies.isVisible()) await rejectCookies.click();
  await page.locator('section[aria-labelledby="resources-title"]').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('section[aria-labelledby="resources-title"] img').first().evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await page.screenshot({ path: testInfo.outputPath("resources-desktop.png") });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath("homepage-desktop-light.png"), fullPage: true });
  await page.evaluate(() => { document.documentElement.dataset.theme = "dark"; document.documentElement.dataset.palette = "purple"; });
  await page.screenshot({ path: testInfo.outputPath("homepage-desktop-dark-purple.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({ path: testInfo.outputPath("homepage-mobile.png"), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole("button", { name: "Menüyü Aç", exact: true }).click();
  await page.locator("#mobile-navigation summary").filter({ hasText: "Kaynaklar" }).click();
  await expect(page.locator("#mobile-navigation").getByRole("link", { name: "Sözlük", exact: true })).toBeVisible();
  await page.goto("/kaynaklar/e-kitaplar/onizleme/yokdil-saglik");
  await page.getByRole("region", { name: "YÖKDİL Sağlık: önizleme" }).scrollIntoViewIfNeeded();
  await expect.poll(() => page.getByRole("region", { name: "YÖKDİL Sağlık: önizleme" }).locator("img").evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await page.screenshot({ path: testInfo.outputPath("reader-mobile.png") });
  await page.screenshot({ path: testInfo.outputPath("preview-mobile.png"), fullPage: true });
});
