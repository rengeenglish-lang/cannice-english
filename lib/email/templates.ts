/**
 * Account and order emails (password reset, verification, welcome, orders, reminders). Pure — no
 * DB, no network — so the wording and links are unit-tested; delivery lives in
 * server/email/transactional.ts. Coaching emails keep their own templates in lib/coaching/email.ts.
 */
import { BANK_IBAN } from "@/lib/bank-transfer";

export type EmailContent = { subject: string; html: string; text: string };

const GREEN = "#0b6b3a";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

type Frame = {
  heading: string;
  intro: string[];
  rows?: { label: string; value: string }[];
  cta?: { label: string; href: string };
  outro?: string[];
  siteUrl: string;
  /** Why the person got this email; shown small at the bottom. */
  footer: string;
  unsubscribe?: { label: string; href: string };
};

function frame(f: Frame): { html: string; text: string } {
  const p = (s: string) => `<p style="margin:0 0 14px;font-size:16px;line-height:24px;color:#10291c">${esc(s)}</p>`;
  const rows = f.rows?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 18px;border:1px solid #d8e8dd;border-radius:12px">${f.rows
        .map((r, i) => `<tr><td style="padding:10px 14px;font-size:14px;color:#55665c;${i ? "border-top:1px solid #d8e8dd;" : ""}">${esc(r.label)}</td><td style="padding:10px 14px;font-size:14px;font-weight:700;color:#10291c;text-align:right;${i ? "border-top:1px solid #d8e8dd;" : ""}">${esc(r.value)}</td></tr>`)
        .join("")}</table>`
    : "";
  const cta = f.cta
    ? `<p style="margin:22px 0 18px"><a href="${esc(f.cta.href)}" style="display:inline-block;background:${GREEN};color:#ffffff;font-weight:700;font-size:15px;padding:12px 22px;border-radius:10px;text-decoration:none">${esc(f.cta.label)}</a></p>`
    : "";
  const unsubscribe = f.unsubscribe ? `<br><a href="${esc(f.unsubscribe.href)}" style="color:#55665c">${esc(f.unsubscribe.label)}</a>` : "";
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(f.heading)}</title></head>
<body style="margin:0;padding:0;background:#f6faf7;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6faf7"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #d8e8dd;border-radius:16px">
<tr><td style="padding:22px 28px;border-bottom:1px solid #d8e8dd"><a href="${esc(f.siteUrl)}" style="font-size:20px;font-weight:700;color:${GREEN};text-decoration:none">Netfener</a></td></tr>
<tr><td style="padding:26px 28px 8px">
<h1 style="margin:0 0 16px;font-size:22px;line-height:28px;color:#10291c">${esc(f.heading)}</h1>
${f.intro.map(p).join("")}${rows}${cta}${(f.outro ?? []).map(p).join("")}
</td></tr>
<tr><td style="padding:18px 28px 24px;font-size:12px;line-height:18px;color:#55665c">${esc(f.footer)}${unsubscribe}</td></tr>
</table></td></tr></table></body></html>`;
  const text = [
    f.heading,
    "",
    ...f.intro,
    ...(f.rows?.length ? ["", ...f.rows.map((r) => `${r.label}: ${r.value}`)] : []),
    ...(f.cta ? ["", `${f.cta.label}: ${f.cta.href}`] : []),
    ...(f.outro?.length ? ["", ...f.outro] : []),
    "",
    "--",
    f.footer,
    ...(f.unsubscribe ? [`${f.unsubscribe.label}: ${f.unsubscribe.href}`] : []),
  ].join("\n");
  return { html, text };
}

const ACCOUNT_FOOTER = "Bu e-postayı Netfener hesabınla ilgili bir işlem yapıldığı için aldın.";
const ORDER_FOOTER = "Bu e-postayı Netfener'de verdiğin sipariş için aldın.";
const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;

const tl = (amount: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(amount);

const when = (date: Date) =>
  new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(date);

/** Sent right after registration: welcome plus the verification link, in one email. */
export function renderWelcomeVerifyEmail(input: { name: string; verifyUrl: string; siteUrl: string }): EmailContent {
  const subject = "Netfener'e hoş geldin — e-posta adresini doğrula";
  return {
    subject,
    ...frame({
      heading: `Hoş geldin, ${firstName(input.name)}!`,
      intro: [
        "Netfener hesabın oluşturuldu. Son bir adım kaldı: aşağıdaki düğmeye tıklayarak bu e-posta adresinin sana ait olduğunu doğrula.",
        "Doğrulama, şifreni unutursan hesabına geri dönebilmen için gerekli.",
      ],
      cta: { label: "E-posta adresimi doğrula", href: input.verifyUrl },
      outro: [
        "Başlamak için önerimiz: Seviye Tespit Sınavı'nı çöz, sonra Ücretsiz Koçluk planını oluştur.",
        "Bu bağlantı 7 gün geçerlidir. Hesabı sen oluşturmadıysan bu e-postayı yok sayabilirsin.",
      ],
      siteUrl: input.siteUrl,
      footer: ACCOUNT_FOOTER,
    }),
  };
}

/** Sent when a student asks for a new verification link. */
export function renderVerifyEmail(input: { name: string; verifyUrl: string; siteUrl: string }): EmailContent {
  const subject = "E-posta adresini doğrula";
  return {
    subject,
    ...frame({
      heading: subject,
      intro: [`Merhaba ${firstName(input.name)}, Netfener hesabının e-posta adresini doğrulamak için aşağıdaki düğmeye tıkla.`],
      cta: { label: "E-posta adresimi doğrula", href: input.verifyUrl },
      outro: ["Bu bağlantı 7 gün geçerlidir. Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin."],
      siteUrl: input.siteUrl,
      footer: ACCOUNT_FOOTER,
    }),
  };
}

/** Sent after a first Google sign-in: the address is already verified by Google. */
export function renderWelcomeEmail(input: { name: string; siteUrl: string }): EmailContent {
  const subject = "Netfener'e hoş geldin";
  return {
    subject,
    ...frame({
      heading: `Hoş geldin, ${firstName(input.name)}!`,
      intro: [
        "Netfener hesabın hazır. Sınavına göre çalışma planını oluşturmak için Seviye Tespit Sınavı'nı çözebilir, ardından Ücretsiz Koçluk ile haftalık planını alabilirsin.",
      ],
      cta: { label: "Çalışma alanıma git", href: `${input.siteUrl}/dashboard` },
      outro: ["Sorun olursa bu e-postayı yanıtlaman yeterli; destek ekibimize ulaşır."],
      siteUrl: input.siteUrl,
      footer: ACCOUNT_FOOTER,
    }),
  };
}

export function renderPasswordResetEmail(input: { name: string; resetUrl: string; siteUrl: string }): EmailContent {
  const subject = "Netfener şifre sıfırlama";
  return {
    subject,
    ...frame({
      heading: "Şifreni sıfırla",
      intro: [`Merhaba ${firstName(input.name)}, hesabın için şifre sıfırlama isteği aldık. Yeni şifreni belirlemek için aşağıdaki düğmeye tıkla.`],
      cta: { label: "Yeni şifre belirle", href: input.resetUrl },
      outro: [
        "Bu bağlantı 1 saat geçerlidir ve yalnızca bir kez kullanılabilir.",
        "Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin; şifren değişmez.",
      ],
      siteUrl: input.siteUrl,
      footer: ACCOUNT_FOOTER,
    }),
  };
}

export type OrderSummary = {
  id: string;
  name: string;
  items: { title: string; quantity: number; lineTotal: number }[];
  total: number;
};

const orderNo = (id: string) => id.slice(-8).toUpperCase();
const itemRows = (o: OrderSummary) => [
  ...o.items.map((i) => ({ label: i.quantity > 1 ? `${i.title} × ${i.quantity}` : i.title, value: tl(i.lineTotal) })),
  { label: "Toplam", value: tl(o.total) },
];

/** Havale/EFT order placed: how to pay. */
export function renderOrderAwaitingTransferEmail(input: { order: OrderSummary; paymentUrl: string; siteUrl: string }): EmailContent {
  const o = input.order;
  const subject = `Siparişin alındı (#${orderNo(o.id)}) — havale bilgileri`;
  return {
    subject,
    ...frame({
      heading: "Siparişin alındı",
      intro: [
        `Merhaba ${firstName(o.name)}, siparişin bize ulaştı. Ödemeyi havale veya EFT ile yaptığında erişimin açılacak.`,
        `IBAN: ${BANK_IBAN}`,
        `Açıklama kısmına sipariş numaranı yaz: ${orderNo(o.id)}`,
      ],
      rows: itemRows(o),
      cta: { label: "Ödeme bilgilerini gör", href: input.paymentUrl },
      outro: ["Alıcı adı ödeme sayfasında yer alır. Ödemen doğrulandığında sana ayrıca e-posta göndereceğiz."],
      siteUrl: input.siteUrl,
      footer: ORDER_FOOTER,
    }),
  };
}

/** Payment confirmed (card capture or havale approved by staff). */
export function renderOrderPaidEmail(input: { order: OrderSummary; viaTransfer: boolean; receiptUrl: string; accessUrl: string; siteUrl: string }): EmailContent {
  const o = input.order;
  const subject = input.viaTransfer ? `Havalen onaylandı — siparişin hazır (#${orderNo(o.id)})` : `Ödemen alındı — siparişin hazır (#${orderNo(o.id)})`;
  return {
    subject,
    ...frame({
      heading: input.viaTransfer ? "Havalen onaylandı" : "Ödemen alındı",
      intro: [`Merhaba ${firstName(o.name)}, ${input.viaTransfer ? "havale/EFT ödemen doğrulandı" : "ödemen başarıyla alındı"}. Satın aldıkların hesabında hazır.`],
      rows: itemRows(o),
      cta: { label: "Satın aldıklarıma git", href: input.accessUrl },
      outro: [`Makbuzun: ${input.receiptUrl}`, "Basılı kitap siparişlerinde kargo bilgisi ayrıca iletilir."],
      siteUrl: input.siteUrl,
      footer: ORDER_FOOTER,
    }),
  };
}

export function renderSessionReminderEmail(input: {
  name: string;
  title: string;
  startsAt: Date;
  soon: boolean;
  meetingUrl: string | null;
  siteUrl: string;
}): EmailContent {
  const subject = input.soon ? `Dersin birazdan başlıyor: ${input.title}` : `Yarın dersin var: ${input.title}`;
  return {
    subject,
    ...frame({
      heading: input.soon ? "Dersin birazdan başlıyor" : "Yaklaşan dersin",
      intro: [`Merhaba ${firstName(input.name)}, ${input.title} dersin ${when(input.startsAt)} (Türkiye saati) başlıyor.`],
      cta: input.meetingUrl ? { label: "Derse katıl", href: input.meetingUrl } : { label: "Canlı derslerimi aç", href: `${input.siteUrl}/dashboard/live-sessions` },
      outro: input.meetingUrl ? ["Bağlantı ders saatinden birkaç dakika önce açılır. Ders bağlantısını Canlı Derslerim sayfasında da bulabilirsin."] : [],
      siteUrl: input.siteUrl,
      footer: "Bu e-postayı kayıtlı olduğun canlı ders için aldın.",
    }),
  };
}

export function renderCartReminderEmail(input: { name: string; items: { title: string; price: number }[]; siteUrl: string; unsubscribeUrl: string }): EmailContent {
  const subject = "Sepetinde seni bekleyenler var";
  return {
    subject,
    ...frame({
      heading: "Sepetini unutma",
      intro: [`Merhaba ${firstName(input.name)}, sepetine eklediğin ürünler hâlâ seni bekliyor.`],
      rows: input.items.slice(0, 6).map((i) => ({ label: i.title, value: tl(i.price) })),
      cta: { label: "Sepetime git", href: `${input.siteUrl}/cart` },
      outro: ["Sorun mu yaşadın? Bu e-postayı yanıtla, yardımcı olalım."],
      siteUrl: input.siteUrl,
      footer: "Bu e-postayı Netfener sepetinde ürün bıraktığın için aldın.",
      unsubscribe: { label: "Sepet hatırlatmalarını kapat", href: input.unsubscribeUrl },
    }),
  };
}
