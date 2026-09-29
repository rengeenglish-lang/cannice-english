// Read-only production smoke check. No sign-in, order creation or payment calls.
import assert from "node:assert/strict";
const base = "https://netfener.com";
const pages = [
  ["/checkout", ["ÖDEME YÜKÜMLÜLÜĞÜ DOĞURAN SİPARİŞİ ONAYLA", 'name="agreementConsent"', '/legal/on-bilgilendirme-formu', '/legal/mesafeli-satis-sozlesmesi']],
  ["/legal/on-bilgilendirme-formu", ["Ön Bilgilendirme Formu"]],
  ["/legal/iade-politikasi", ['id="dijital-kaynaklar"', 'id="plan-iadeleri"', 'id="canli-grup-dersleri"']],
];
let lastError;
for (let attempt = 0; attempt < 16; attempt++) {
  try {
    for (const [path, markers] of pages) {
      const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(15000), headers: { "cache-control": "no-cache" } });
      assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
      const html = await response.text();
      for (const marker of markers) assert.ok(html.includes(marker), `${path}: expected release marker missing`);
    }
    console.log("Production checkout, legal document and all policy section anchors verified.");
    process.exit(0);
  } catch (error) { lastError = error; }
  await new Promise((resolve) => setTimeout(resolve, 15000));
}
throw lastError;
