/**
 * The certificate as HTML (landscape A4, laid out to PDF by server/certificates/pdf.ts). Pure, so
 * its content is unit-tested.
 */
export type CertificateView = { code: string; recipientName: string; title: string; lessonCount: number; issuedAt: Date; verifyUrl: string };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const date = (d: Date) => new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", year: "numeric" }).format(d);

export function renderCertificateHtml(c: CertificateView) {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>
body{font-family:sans-serif;color:#10291c;margin:0;text-align:center}
.frame{border:3pt solid #0b6b3a;padding:26pt 30pt}
.inner{border:0.75pt solid #9cc9ad;padding:34pt 24pt 22pt;height:385pt}
.brand{font-size:13pt;font-weight:bold;letter-spacing:4pt;color:#0b6b3a}
h1{font-size:30pt;margin:14pt 0 2pt;color:#0b6b3a;letter-spacing:1pt}
.sub{font-size:10pt;color:#55665c;letter-spacing:2pt}
.lead{font-size:11pt;margin-top:34pt;color:#55665c}
.name{font-size:28pt;font-weight:bold;margin:8pt 0 6pt;color:#10291c}
.what{font-size:12pt;line-height:17pt;color:#10291c}
.title{font-size:16pt;font-weight:bold;color:#0b6b3a}
.meta{margin-top:56pt;width:100%;font-size:9pt;color:#55665c}
.meta td{width:50%;padding:0 10pt}
.line{border-top:0.75pt solid #9cc9ad;padding-top:4pt}
</style></head><body><div class="frame"><div class="inner">
<div class="brand">NETFENER</div>
<h1>BAŞARI SERTİFİKASI</h1>
<div class="sub">CERTIFICATE OF COMPLETION</div>
<p class="lead">Bu sertifika</p>
<div class="name">${esc(c.recipientName)}</div>
<p class="what">adlı öğrencinin<br><span class="title">${esc(c.title)}</span><br>programındaki ${c.lessonCount} dersin tamamını başarıyla bitirdiğini belgeler.</p>
<table class="meta"><tr>
<td><div class="line"><b>${date(c.issuedAt)}</b><br>Veriliş tarihi / Date of issue</div></td>
<td><div class="line"><b>${esc(c.code)}</b><br>Doğrulama / Verify: ${esc(c.verifyUrl)}</div></td>
</tr></table>
</div></div></body></html>`;
}

/** LinkedIn "Add to profile → Licenses & certifications" link. */
export function linkedInAddUrl(c: Pick<CertificateView, "code" | "title" | "issuedAt" | "verifyUrl">) {
  const p = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: c.title,
    organizationName: "Netfener",
    issueYear: String(c.issuedAt.getUTCFullYear()),
    issueMonth: String(c.issuedAt.getUTCMonth() + 1),
    certUrl: c.verifyUrl,
    certId: c.code,
  });
  return `https://www.linkedin.com/profile/add?${p}`;
}
