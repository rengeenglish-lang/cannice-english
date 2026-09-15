import type { Metadata } from "next";

export const metadata: Metadata = { title: "Soru & Cevap" };

const FAQ_ITEMS = [
  {
    question: "Hangi sınavlara hazırlık desteği veriyorsunuz?",
    answer: "IELTS, TOEFL, PTE, YDS ve YÖKDİL'in üç alanı (Sosyal, Sağlık, Fen Bilimleri) için hazırlık paketlerimiz mevcut.",
  },
  {
    question: "Derslere nasıl kayıt olabilirim?",
    answer: "İlgilendiğiniz paketi seçip sepete ekleyin, ödeme adımını tamamlayın. Ekibimiz onay sonrası size dönüş yaparak dersinize erişim sağlar.",
  },
  {
    question: "14 günlük ücretsiz deneme nasıl çalışıyor?",
    answer: "Ücretsiz hesap oluşturarak platformu ve örnek dersleri 14 gün boyunca inceleyebilirsiniz. Kredi kartı bilgisi gerekmez.",
  },
  {
    question: "Canlı dersleri kaçırırsam ne olur?",
    answer: "Canlı dersler kayıt altına alınır ve daha sonra kendi hızınızda izleyebilirsiniz.",
  },
  {
    question: "İade politikanız nedir?",
    answer: "Kurs içeriğine erişim sağlanmadan önce talep edilen iadeler değerlendirilir. Detaylar için Mesafeli Satış Sözleşmesi'ni inceleyebilir veya bizimle iletişime geçebilirsiniz.",
  },
  {
    question: "Bir öğretmenle mi çalışacağım?",
    answer: "Evet — Cannice English tek öğretmen modeliyle çalışır. Tüm dersler ve geri bildirimler aynı öğretmen tarafından hazırlanır.",
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">Soru & Cevap</p>
      <h1 className="page-title">Sıkça Sorulan Sorular</h1>
      <div className="mt-8 space-y-3">
        {FAQ_ITEMS.map((item) => (
          <details key={item.question} className="panel group">
            <summary className="cursor-pointer list-none font-bold text-[color:var(--foreground)]">
              {item.question}
            </summary>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{item.answer}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
