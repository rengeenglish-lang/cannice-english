import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Download } from "lucide-react";
import { certificateByCode, toCertificateView } from "@/server/services/certificates.service";
import { linkedInAddUrl } from "@/lib/certificates/render";
import { ShareCertificate } from "@/components/certificates/ShareCertificate";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cert = await certificateByCode((await params).code.toUpperCase());
  if (!cert) return { title: "Sertifika bulunamadı", robots: { index: false } };
  const title = `${cert.recipientName} — ${cert.title} sertifikası`;
  return { title, description: `${cert.recipientName}, Netfener'de ${cert.title} programının ${cert.lessonCount} dersini tamamladı.`, robots: { index: false }, openGraph: { title, type: "website", siteName: "Netfener" } };
}

/** Public verification page: proves a certificate is genuine and is what students share. */
export default async function CertificateVerifyPage({ params }: Props) {
  const cert = await certificateByCode((await params).code.toUpperCase());
  if (!cert) notFound();
  const view = toCertificateView(cert);
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6">
      <BadgeCheck size={44} className="mx-auto text-emerald-600" aria-hidden="true" />
      <p className="eyebrow mt-4">Doğrulanmış sertifika</p>
      <h1 className="page-title">{cert.recipientName}</h1>
      <p className="page-copy mx-auto">
        Netfener&apos;de <strong>{cert.title}</strong> programındaki {cert.lessonCount} dersin tamamını bitirdi.
      </p>
      <p className="mt-2 text-sm text-[color:var(--muted)]">
        Veriliş tarihi: {cert.issuedAt.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", year: "numeric" })} · Kod: {cert.code}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a href={`/api/certificates/${cert.code}`} target="_blank" className="primary-button"><Download size={16} aria-hidden="true" /> Sertifikayı görüntüle</a>
        <Link href="/konu-anlatim" className="secondary-button">Sen de başla</Link>
      </div>
      <div className="mt-6 flex justify-center"><ShareCertificate url={view.verifyUrl} linkedIn={linkedInAddUrl(view)} title={cert.title} /></div>
    </main>
  );
}
