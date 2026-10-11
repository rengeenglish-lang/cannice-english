import type { Metadata } from "next";
import Link from "next/link";
import { forbidden } from "next/navigation";
import { CheckCircle2, CloudOff, ExternalLink, FileText } from "lucide-react";
import { requireStaff } from "@/server/auth/context";
import { driveFileLink, driveRedirectUri, driveStatus } from "@/server/google/drive";
import { getInvoiceSettings, listInvoices } from "@/server/services/invoices.service";
import { InvoiceSettingsForm } from "@/components/admin/invoices/InvoiceSettingsForm";
import { backfillInvoicesAction, disconnectDriveAction, setEtimsNumberAction, syncInvoiceAction, syncInvoicesAction } from "@/app/actions/admin-invoices";
import { db } from "@/server/db";
import { formatTRY } from "@/lib/pricing";

export const metadata: Metadata = { title: "Faturalar" };

const DRIVE_MESSAGES: Record<string, string> = {
  bagli: "Google Drive bağlandı. Bekleyen faturalar arşivleniyor.",
  hata: "Google Drive bağlantısı tamamlanamadı. Tekrar deneyin.",
  "ayar-eksik": "Önce Vercel'e GOOGLE_DRIVE_CLIENT_ID ve GOOGLE_DRIVE_CLIENT_SECRET eklenmeli (aşağıdaki adımlar).",
};

export default async function AdminInvoicesPage({ searchParams }: { searchParams: Promise<{ drive?: string }> }) {
  const user = await requireStaff();
  if (user.role !== "ADMIN") forbidden();
  const { drive: driveParam } = await searchParams;
  const [drive, settings, invoices, unbilled] = await Promise.all([
    driveStatus(),
    getInvoiceSettings(),
    listInvoices(),
    db.order.count({ where: { status: "PAID", invoice: null } }),
  ]);
  const pending = invoices.filter((i) => i.driveDirty).length;
  const date = (d: Date) => d.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" });

  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow">Yönetim</p>
        <h1 className="page-title">Faturalar</h1>
        <p className="page-copy">
          Her ödenen sipariş için otomatik numaralı fatura (NF-yıl-sıra) kesilir. Faturalar sitede saklanır, öğrenci Siparişlerim sayfasından indirir ve Google Drive’da her müşteri için ayrı klasöre arşivlenir.
          Şirket Kenya’da kayıtlı olduğu için Türkiye e-Fatura/e-Arşiv (GİB) sistemi kullanılmaz.
        </p>
        {driveParam && DRIVE_MESSAGES[driveParam] ? <p className="mt-3 rounded-lg bg-[color:var(--canvas)] px-4 py-2 text-sm font-semibold">{DRIVE_MESSAGES[driveParam]}</p> : null}
      </div>

      <section className="space-y-3">
        <h2 className="section-title !text-lg">Google Drive arşivi</h2>
        {drive.connected ? (
          <div className="panel flex flex-wrap items-center gap-3">
            <CheckCircle2 className="text-emerald-600" size={20} aria-hidden="true" />
            <p className="flex-1 text-sm">
              Bağlı hesap: <strong>{drive.account || "Google hesabı"}</strong> — klasör: <strong>Netfener Faturalar</strong>
              {pending ? ` · ${pending} fatura arşivlenmeyi bekliyor` : " · tüm faturalar arşivde"}
            </p>
            {pending ? (
              <form action={syncInvoicesAction}><button className="secondary-button text-xs">Şimdi arşivle</button></form>
            ) : null}
            <form action={disconnectDriveAction}><button className="ghost-button text-xs">Bağlantıyı kes</button></form>
          </div>
        ) : drive.clientConfigured ? (
          <div className="panel flex flex-wrap items-center gap-3">
            <CloudOff className="text-amber-600" size={20} aria-hidden="true" />
            <p className="flex-1 text-sm">Drive bağlı değil. Faturalar sitede saklanıyor; bağladığınızda hepsi Drive’a aktarılır.</p>
            <a href="/api/admin/google-drive/connect" className="primary-button text-sm">Google Drive’ı bağla</a>
          </div>
        ) : (
          <div className="panel space-y-2 text-sm">
            <p className="font-bold">Drive bağlantısı için bir kerelik kurulum gerekli:</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>console.cloud.google.com → yeni proje → <strong>Google Drive API</strong>’yi etkinleştirin.</li>
              <li>OAuth consent screen: External, uygulama adı “Netfener”, kapsam <code>drive.file</code>; ardından <strong>Publish app</strong> (Testing modunda bağlantı 7 günde düşer).</li>
              <li>Credentials → OAuth client ID → Web application. Yetkili yönlendirme URI’si: <code>{driveRedirectUri()}</code></li>
              <li>Vercel → Settings → Environment Variables: <code>GOOGLE_DRIVE_CLIENT_ID</code> ve <code>GOOGLE_DRIVE_CLIENT_SECRET</code> (Production) ekleyip yeniden deploy edin.</li>
              <li>Bu sayfaya dönüp “Google Drive’ı bağla”ya tıklayın ve faturaların duracağı Gmail hesabını seçin.</li>
            </ol>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="section-title !text-lg">Faturada görünen şirket bilgileri</h2>
        <InvoiceSettingsForm seller={settings.seller} taxRate={settings.taxRate} />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title !text-lg">Kesilen faturalar ({invoices.length})</h2>
          {unbilled ? (
            <form action={backfillInvoicesAction}>
              <button className="secondary-button text-xs">Eski {unbilled} ödenmiş sipariş için fatura kes</button>
            </form>
          ) : null}
        </div>
        {invoices.length ? (
          <div className="overflow-x-auto rounded-2xl border border-[color:var(--border)] bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[color:var(--canvas)] text-left text-xs uppercase tracking-wide text-[color:var(--muted)]">
                <tr><th className="p-3">No</th><th className="p-3">Tarih</th><th className="p-3">Müşteri</th><th className="p-3 text-right">Tutar</th><th className="p-3">Drive</th><th className="p-3">KRA eTIMS no</th></tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {invoices.map((inv) => {
                  const buyer = inv.buyer as { name?: string; email?: string };
                  return (
                    <tr key={inv.id} className={inv.status === "VOID" ? "text-[color:var(--muted)] line-through" : undefined}>
                      <td className="p-3 font-semibold">
                        <Link href={`/api/invoices/${inv.id}`} target="_blank" className="inline-flex items-center gap-1 hover:underline"><FileText size={14} aria-hidden="true" />{inv.number}</Link>
                        {inv.status === "VOID" ? <span className="ml-2 rounded bg-rose-100 px-1.5 text-xs text-rose-700 no-underline">İPTAL</span> : null}
                      </td>
                      <td className="p-3">{date(inv.issuedAt)}</td>
                      <td className="p-3">{buyer.name}<br /><span className="text-xs text-[color:var(--muted)]">{buyer.email}</span></td>
                      <td className="p-3 text-right">{formatTRY(String(inv.total))}</td>
                      <td className="p-3">
                        {inv.driveFileId && !inv.driveDirty ? (
                          <a href={driveFileLink(inv.driveFileId)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[color:var(--brand)] hover:underline">Aç <ExternalLink size={12} aria-hidden="true" /></a>
                        ) : (
                          <form action={syncInvoiceAction.bind(null, inv.id)} className="inline">
                            <button className="text-xs font-bold text-amber-700 hover:underline" title={inv.driveError ?? undefined} disabled={!drive.connected}>{drive.connected ? "Yükle" : "Bekliyor"}</button>
                          </form>
                        )}
                      </td>
                      <td className="p-3">
                        <form action={setEtimsNumberAction.bind(null, inv.id)} className="flex gap-1">
                          <input name="etims" defaultValue={inv.etimsNumber ?? ""} className="auth-input !py-1 text-xs" placeholder="—" aria-label={`${inv.number} eTIMS numarası`} />
                          <button className="ghost-button text-xs">Kaydet</button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[color:var(--muted)]">Henüz fatura yok. İlk ödenen siparişte otomatik oluşturulur.</p>
        )}
      </section>
    </div>
  );
}
