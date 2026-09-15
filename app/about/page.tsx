import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hakkımızda" };

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">Hakkımızda</p>
      <h1 className="page-title">Cannice English</h1>
      <p className="page-copy">
        Cannice English, IELTS, TOEFL, PTE, YDS ve YÖKDİL sınavlarına hazırlanan öğrencilere tek bir öğretmenle,
        kişiselleştirilmiş bir hazırlık deneyimi sunmak için kuruldu.
      </p>
      <div className="panel mt-8 space-y-4 text-base leading-7 text-[color:var(--muted)]">
        <p>
          Yıllardır İngilizce sınav hazırlığı alanında çalışan kurucu öğretmenimiz, binlerce öğrencinin hedef
          puanına ulaşmasına yardımcı oldu. Cannice English, bu deneyimi kayıtlı ders modülleri, canlı dersler ve
          gerçek sınav formatında denemelerle birleştiren bir platform olarak tasarlandı.
        </p>
        <p>
          Büyük bir öğretmen kadrosu yerine, her öğrenciyi yakından tanıyan ve ilerlemesini takip eden tek bir
          öğretmen yaklaşımını benimsiyoruz. Bu sayede her öğrenci, kendi seviyesine ve hedefine uygun bir çalışma
          planıyla ilerleyebiliyor.
        </p>
        <p>
          Misyonumuz, İngilizce sınav hazırlığını karmaşık olmaktan çıkarıp; net, ulaşılabilir ve sonuç odaklı bir
          sürece dönüştürmek.
        </p>
      </div>
      <p className="mt-6 text-sm text-[color:var(--muted)]">
        Bu sayfa taslak içerik barındırmaktadır ve yakında gerçek ekip bilgileriyle güncellenecektir.
      </p>
    </main>
  );
}
