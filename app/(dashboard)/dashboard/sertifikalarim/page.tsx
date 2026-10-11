import type { Metadata } from "next";
import Link from "next/link";
import { Award, Download } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { listCertificates, syncCertificates, toCertificateView, trackProgress } from "@/server/services/certificates.service";
import { linkedInAddUrl } from "@/lib/certificates/render";
import { ShareCertificate } from "@/components/certificates/ShareCertificate";

export const metadata: Metadata = { title: "Sertifikalarım" };

export default async function CertificatesPage() {
  const user = await getAuthContext();
  if (!user) return null;
  await syncCertificates(user.id);
  const [certificates, tracks] = await Promise.all([listCertificates(user.id), trackProgress(user.id)]);
  const earned = new Set(certificates.map((c) => `${c.kind}:${c.refKey}`));
  const inProgress = tracks.filter((t) => t.done > 0 && !earned.has(`${t.kind}:${t.refKey}`));
  const date = (d: Date) => d.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <p className="eyebrow">Başarıların</p>
        <h1 className="page-title">Sertifikalarım</h1>
        <p className="page-copy">Bir sınavın Konu Anlatımı derslerinin ya da bir kursun kayıtlı derslerinin tamamını bitirdiğinde sertifikan otomatik olarak hazırlanır. İndirebilir, LinkedIn profiline ekleyebilir ve paylaşabilirsin.</p>
      </div>

      {certificates.length ? (
        <ul className="space-y-4">
          {certificates.map((c) => {
            const view = toCertificateView(c);
            return (
              <li key={c.id} className="dashboard-panel flex flex-col gap-4 sm:flex-row sm:items-center">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700"><Award size={24} aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold">{c.title}</p>
                  <p className="text-sm text-[color:var(--muted)]">{c.lessonCount} ders · {date(c.issuedAt)} · Kod {c.code}</p>
                  <div className="mt-3"><ShareCertificate url={view.verifyUrl} linkedIn={linkedInAddUrl(view)} title={c.title} /></div>
                </div>
                <div className="flex gap-2 sm:flex-col">
                  <a href={`/api/certificates/${c.code}`} target="_blank" className="primary-button text-sm"><Download size={16} aria-hidden="true" /> PDF</a>
                  <Link href={`/sertifika/${c.code}`} className="secondary-button text-sm">Doğrulama sayfası</Link>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="learning-empty">
          <Award size={32} className="mx-auto mb-3 text-amber-600" aria-hidden="true" />
          <p className="font-bold">Henüz sertifikan yok.</p>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Konu Anlatımı&apos;nda bir sınavın tüm derslerini tamamladığında ilk sertifikan burada olacak.</p>
        </div>
      )}

      {inProgress.length ? (
        <section className="space-y-3">
          <h2 className="section-title !text-lg">Devam eden programlar</h2>
          <ul className="space-y-3">
            {inProgress.map((t) => {
              const pct = Math.round((t.done / t.total) * 100);
              return (
                <li key={`${t.kind}:${t.refKey}`} className="dashboard-panel">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-bold">{t.title}</p>
                    <p className="text-sm text-[color:var(--muted)]">{t.done}/{t.total} ders · %{pct}</p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color:var(--canvas)]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full rounded-full bg-[color:var(--accent)]" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
