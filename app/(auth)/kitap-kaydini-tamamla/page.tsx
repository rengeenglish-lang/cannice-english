import Link from "next/link";
import type { Metadata } from "next";
import { findNetfenerEbook } from "@/lib/netfener-ebooks";
import { ResendBookEmailForm } from "@/components/auth/BookEmailConfirmation";
export const metadata: Metadata = { title: "E-postanı kontrol et", robots: { index: false, follow: false } };
export default async function BookRegistrationCompletePage({ searchParams }: { searchParams: Promise<{ book?: string; gonderim?: string }> }) {
  const params = await searchParams;
  const book = findNetfenerEbook(params.book ?? "");
  return <div className="panel">
    <p className="eyebrow">Son bir adım</p><h1 className="page-title">E-postanı kontrol et.</h1>
    <p className="page-copy">{book ? `${book.title} hesabındaki Kitaplarım alanına kaydedildi. ` : ""}E-postandaki bağlantıya tıkladığında adresin doğrulanır ve kitabının bulunduğu panele giriş yaparsın.</p>
    {params.gonderim === "basarisiz" ? <p role="alert" className="mt-4 text-sm text-[color:var(--danger)]">Hesabın oluşturuldu ancak e-posta gönderilemedi. Aşağıdan yeniden deneyebilir veya şifrenle giriş yapabilirsin.</p> : <p className="mt-4 text-sm text-[color:var(--muted)]">Bağlantı 30 dakika geçerlidir. Gelen kutuna ulaşmadıysa spam klasörünü de kontrol et.</p>}
    <ResendBookEmailForm /><Link className="ghost-button mt-4" href="/sign-in?next=%2Fdashboard%2Fbooks">Şifremle giriş yap</Link>
  </div>;
}
