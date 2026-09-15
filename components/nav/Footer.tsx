import Link from "next/link";

const EXAM_LINKS = [
  { slug: "ielts", name: "IELTS" },
  { slug: "toefl", name: "TOEFL" },
  { slug: "pte", name: "PTE" },
  { slug: "yds", name: "YDS" },
  { slug: "yokdil", name: "YÖKDİL" },
  { slug: "yokdil-sosyal-bilimler", name: "YÖKDİL Sosyal Bilimler" },
  { slug: "yokdil-saglik-bilimleri", name: "YÖKDİL Sağlık Bilimleri" },
  { slug: "yokdil-fen-bilimleri", name: "YÖKDİL Fen Bilimleri" },
];

const LEGAL_LINKS = [
  { doc: "mesafeli-satis-sozlesmesi", name: "Mesafeli Satış Sözleşmesi" },
  { doc: "uyelik-sozlesmesi", name: "Üyelik Sözleşmesi" },
  { doc: "gizlilik-sozlesmesi", name: "Gizlilik Sözleşmesi" },
  { doc: "aydinlatma-metni", name: "Aydınlatma Metni" },
  { doc: "acik-riza-metni", name: "Açık Rıza Metni" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[color:var(--border)] bg-[color:var(--brand-strong)] text-white/80">
      <div className="mx-auto grid w-full max-w-[1320px] grid-cols-2 gap-8 px-4 py-14 sm:grid-cols-3 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <span className="text-lg font-extrabold text-white">Cannice English</span>
          <p className="mt-3 max-w-xs text-sm leading-6 text-white/55">
            IELTS, TOEFL, PTE, YDS ve YÖKDİL sınavlarına tek bir öğretmenle, kayıtlı ve canlı derslerle hazırlanın.
          </p>
          <div className="mt-4 space-y-1 text-sm text-white/70">
            <p><span className="font-semibold text-white">Müşteri Hizmetleri:</span> 0 (850) 000 00 00</p>
            <p><span className="font-semibold text-white">WhatsApp:</span> 0 (5XX) XXX XX XX</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-white/35">İngilizce Sınavlar</p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {EXAM_LINKS.map((exam) => (
              <li key={exam.slug}><Link href={`/exams/${exam.slug}`} className="transition hover:text-white">{exam.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-white/35">Faydalı Araçlar</p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link href="/tools/dictionary" className="transition hover:text-white">Sözlük</Link></li>
            <li><Link href="/tools/score-calculator" className="transition hover:text-white">Puan Hesaplama</Link></li>
            <li><Link href="/tools/exam-calendar" className="transition hover:text-white">ÖSYM Sınav Takvimi</Link></li>
            <li><Link href="/tools/free-resources" className="transition hover:text-white">Ücretsiz Kaynaklar</Link></li>
            <li><Link href="/blog" className="transition hover:text-white">Blog</Link></li>
          </ul>
        </div>
        <div className="col-span-2 sm:col-span-3 lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-white/35">Yasal</p>
          <ul className="mt-4 grid grid-cols-1 gap-2 text-sm text-white/70 sm:grid-cols-2">
            {LEGAL_LINKS.map((legal) => (
              <li key={legal.doc}><Link href={`/legal/${legal.doc}`} className="transition hover:text-white">{legal.name}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/35 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Cannice English. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
