import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookMarked, CalendarCheck, CheckCircle2, ClipboardCheck, FileText, NotebookPen, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { getAuthContext } from "@/server/auth/context";
import { PATHWAYS, PATHWAY_CODES } from "@/lib/coaching/exams";

export const metadata: Metadata = {
  title: "Ücretsiz İngilizce Öğrenci Koçluğu",
  description: "Sınav hedefine uygun çalışma planını oluştur, ne çalışacağını bil ve ilerlemeni düzenli olarak takip et. IELTS, TOEFL, PTE, YDS, YÖKDİL ve YDT için ücretsiz.",
};

const STEPS = [
  { icon: ClipboardCheck, title: "Hedefini belirle", text: "Sınavını, hedef puanını, sınav tarihini ve haftada ne kadar çalışabileceğini birkaç soruda gir. İstersen ücretsiz seviye tespit sınavıyla başla." },
  { icon: CalendarCheck, title: "Haftalık planını al", text: "Plan, sitedeki konu anlatımlarına, pratik sorularına ve deneme sınavlarına bağlanır; yeni konu, tekrar ve pratik dengelenir. Görevleri dilediğin gibi düzenle." },
  { icon: BookMarked, title: "Her gün ne çalışacağını bil", text: "Bugünkü görevlerin, tekrar zamanı gelen kelimeler ve hata defterin tek ekranda. Yoğun bir günde planı tek dokunuşla hafiflet." },
  { icon: FileText, title: "İlerlemeni takip et", text: "Beceri ve soru tipine göre doğruluk, deneme sonuçları, haftalık ve aylık raporlar — yalnızca gerçek çalışma verilerinden." },
];

export default async function CoachingLandingPage() {
  const user = await getAuthContext();
  const cta = user ? "/dashboard/kocluk" : "/register?next=%2Fdashboard%2Fkocluk";
  return (
    <main className="inner-page mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">ÜCRETSİZ · TÜM ÖĞRENCİLER İÇİN</p>
        <h1 className="page-title">Ücretsiz İngilizce Öğrenci Koçluğu</h1>
        <p className="page-copy">Sınav hedefine uygun çalışma planını oluştur, ne çalışacağını bil ve ilerlemeni düzenli olarak takip et.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={cta} className="primary-button">
            {user ? "Koçluğuma git" : "Ücretsiz başla"} <ArrowRight size={18} aria-hidden="true" />
          </Link>
          {!user ? <Link href="/sign-in?next=%2Fdashboard%2Fkocluk" className="secondary-button">Giriş yap</Link> : null}
        </div>
      </PageHero>

      <section aria-labelledby="exams-title">
        <h2 id="exams-title" className="section-title">Hangi sınavlar için?</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PATHWAY_CODES.map((code) => (
            <li key={code} className="dashboard-panel">
              <p className="text-lg font-extrabold">{PATHWAYS[code].name}</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">{PATHWAYS[code].versions.map((v) => v.name.tr).join(" · ")}</p>
              <p className="mt-2 text-xs font-bold text-[color:var(--muted)]">{PATHWAYS[code].overall.label.tr}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-title" className="mt-12">
        <h2 id="how-title" className="section-title">Nasıl çalışır?</h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-2">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="dashboard-panel flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[color:var(--brand-soft)] text-[color:var(--accent)]"><Icon size={22} aria-hidden="true" /></span>
              <span>
                <strong className="block">{i + 1}. {title}</strong>
                <span className="mt-1 block text-sm leading-6 text-[color:var(--muted)]">{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="included-title" className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="dashboard-panel">
          <h2 id="included-title" className="section-title !text-xl">Koçlukta neler var?</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {["Sınava özel haftalık plan ve günlük görevler", "Aralıklı kelime tekrarı", "Kişisel hata defteri ve planlı yeniden deneme", "Haftalık değerlendirme ve plan önerileri (onayın olmadan değişmez)", "Site içi hatırlatmalar — sıklık, sessiz saatler ve duraklatma senin elinde", "Yazdırılabilir haftalık ve aylık raporlar"].map((x) => (
              <li key={x} className="flex items-start gap-2"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" /> {x}</li>
            ))}
          </ul>
        </div>
        <div className="dashboard-panel">
          <h2 className="section-title flex items-center gap-2 !text-xl"><ShieldCheck size={22} aria-hidden="true" /> Şeffaflık ve gizlilik</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-[color:var(--muted)]">
            <li>Koçluk otomatik, kural tabanlı bir sistemdir; öğretmen değerlendirmesi değildir ve yalnızca İngilizce öğrenimi ile sınav hazırlığını kapsar.</li>
            <li>Tahmini seviye ve puanlar sitedeki alıştırmalardan hesaplanır; resmî sınav sonucu değildir ve sonuç garantisi verilmez.</li>
            <li>Bilgilerin yalnızca sana görünür; sıralama veya herkese açık tablo yoktur. Koçluğu istediğin an kapatabilir, koçluk verilerini silebilirsin.</li>
            <li>18 yaşından küçük öğrenciler için veli onayı istenir. <Link href="/legal/aydinlatma-metni" className="font-bold underline">Aydınlatma Metni</Link></li>
          </ul>
          <p className="mt-4 flex items-center gap-2 text-sm font-bold"><NotebookPen size={16} aria-hidden="true" /> Koçluk ücretsizdir; plan, erişimin olan içeriklere ve ücretsiz etkinliklere göre hazırlanır.</p>
        </div>
      </section>
    </main>
  );
}
