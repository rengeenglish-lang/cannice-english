import Link from "next/link";
import { PLATFORM_EXAMS } from "@/lib/platform";
import { SOCIAL_LINKS } from "@/lib/social";
import { Logo } from "@/components/brand/Logo";

const LEGAL_LINKS = [
  { doc: "iade-politikasi", name: "İade Politikası" },
  { doc: "kullanim-kosullari", name: "Kullanım Koşulları" },
  { doc: "mesafeli-satis-sozlesmesi", name: "Mesafeli Satış Sözleşmesi" },
  { doc: "uyelik-sozlesmesi", name: "Üyelik Sözleşmesi" },
  { doc: "gizlilik-sozlesmesi", name: "Gizlilik Sözleşmesi" },
  { doc: "aydinlatma-metni", name: "Aydınlatma Metni" },
  { doc: "acik-riza-metni", name: "Açık Rıza Metni" },
];

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--brand-strong)] text-white/80">
      <div className="mx-auto grid w-full max-w-[1320px] grid-cols-2 gap-8 px-4 py-14 sm:grid-cols-3 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <Logo size={36} tone="dark" />
          <p className="mt-3 max-w-xs text-sm leading-6 text-white/55">
            İngilizce sınav hazırlığın için konu anlatımları, çalışma paketleri ve kitaplar. Doğru kaynağı kendi temponda keşfet.
          </p>

          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/70">
            <li><Link href="/about" className="transition hover:text-white">Hakkımızda</Link></li>
            <li><Link href="/yardim" className="transition hover:text-white">Yardım Masası</Link></li>
          </ul>

          <div className="mt-5 flex gap-3">
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Netfener Facebook sayfası" className="grid size-10 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" /></svg>
            </a>
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Netfener Instagram hesabı" className="grid size-10 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
            </a>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-white/35">İngilizce Sınavlar</p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {PLATFORM_EXAMS.map((exam) => (
              <li key={exam.slug}><Link href={`/exams/${exam.slug}`} className="transition hover:text-white">{exam.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-white/35">Çalışma Alanları</p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link href="/konu-anlatim" className="transition hover:text-white">Konu Anlatımları</Link></li>
            <li><Link href="/planlar" className="transition hover:text-white">Planlar</Link></li>
            <li><Link href="/kocluk" className="transition hover:text-white">Ücretsiz Öğrenci Koçluğu</Link></li>
            <li><Link href="/dashboard/mock-exam" className="transition hover:text-white">Deneme Sınavları</Link></li>
            <li><Link href="/group-lessons" className="transition hover:text-white">Canlı Grup Dersleri</Link></li>
            <li><Link href="/kaynaklar" className="transition hover:text-white">Kaynaklar</Link></li>
            <li><Link href="/packages" className="transition hover:text-white">Paketler</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-white/35">Faydalı Araçlar</p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link href="/tools/dictionary" className="transition hover:text-white">Sözlük</Link></li>
            <li><Link href="/tools/score-calculator" className="transition hover:text-white">Puan Hesaplama</Link></li>
            <li><Link href="/tools/guidance" className="transition hover:text-white">Rehberlik Aracı</Link></li>
            <li><Link href="/tools/exam-calendar" className="transition hover:text-white">ÖSYM Sınav Takvimi</Link></li>
            <li><Link href="/tools/free-resources" className="transition hover:text-white">Ücretsiz Kaynaklar</Link></li>
            <li><Link href="/blog" className="transition hover:text-white">Blog</Link></li>
            <li><Link href="/grammar" className="transition hover:text-white">İngilizce Gramer</Link></li>
          </ul>
        </div>
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-white/35">Yasal</p>
          <ul className="mt-4 grid grid-cols-1 gap-2 text-sm text-white/70 sm:grid-cols-2">
            {LEGAL_LINKS.map((legal) => (
              <li key={legal.doc}><Link href={`/legal/${legal.doc}`} className="transition hover:text-white">{legal.name}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/35 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Netfener. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
