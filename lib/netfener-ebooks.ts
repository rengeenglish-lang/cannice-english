/** Netfener's complete first-party books. PDFs are private server assets, never public URLs. */
export const NETFENER_EBOOKS = [
  {
    slug: "cumlenin-icini-gor",
    title: "Cümlenin İçini Gör",
    subtitle: "YDS ve YÖKDİL Grameri",
    description: "Cümle çözümleme, görsel dilbilgisi, sınav stratejileri ve açıklamalı uygulamalarla 17 modüllük çalışma kitabı.",
    pages: 144,
    cover: "/ebooks/cumlenin-icini-gor.jpg",
    filename: "netfener-cumlenin-icini-gor.pdf",
    exams: ["yds", "yokdil-fen-bilimleri", "yokdil-sosyal-bilimler", "yokdil-saglik-bilimleri"],
  },
  {
    slug: "kelimenin-izini-sur",
    title: "Kelimenin İzini Sür",
    subtitle: "Cilt 1 · Temel Akademik Kelimeler",
    description: "25 ünite, 125 kelime ailesi ve 250 çalışma sayfasıyla; her aileyi bağlam içinde okuma, cloze ve dilbilgisi uygulamaları ve çeldirici analizli özgün sorularla sınavda doğru biçimi seçme çalışması.",
    pages: 282,
    cover: "/ebooks/kelimenin-izini-sur.jpg",
    filename: "netfener-kelimenin-izini-sur.pdf",
    exams: ["yds", "yokdil-fen-bilimleri", "yokdil-sosyal-bilimler", "yokdil-saglik-bilimleri"],
  },
  {
    slug: "paragrafin-isigini-yak",
    title: "Paragrafın Işığını Yak 1",
    subtitle: "Cilt 1 · Akademik Paragraf",
    description: "10 ünite, 40 özgün akademik metin ve 200 soruyla; her metinde okuma rotası, paragraf izi, kanıtı taşıyan cümle ve çeldirici analizli çözümlerle YDS ve YÖKDİL paragraf sorularında doğru şıkka karar verme çalışması.",
    pages: 135,
    cover: "/ebooks/paragrafin-isigini-yak.jpg",
    filename: "netfener-paragrafin-isigini-yak.pdf",
    exams: ["yds", "yokdil-fen-bilimleri", "yokdil-sosyal-bilimler", "yokdil-saglik-bilimleri"],
  },
  {
    slug: "paragrafin-isigini-yak-cilt-2",
    title: "Paragrafın Işığını Yak 2",
    subtitle: "Cilt 2 · İleri Paragraf",
    description: "10 ünite, 40 özgün metin ve 200 soruyla ileri düzey paragraf: iki metni karşılaştırma, söylenmeyen varsayımı görünür kılma, argüman değerlendirme, süreç kurma, kavram tarihi, sayı yorumlama, tanım sınırı ve örneğin gücünü ölçme.",
    pages: 135,
    cover: "/ebooks/paragrafin-isigini-yak-cilt-2.jpg",
    filename: "netfener-paragrafin-isigini-yak-cilt-2.pdf",
    exams: ["yds", "yokdil-fen-bilimleri", "yokdil-sosyal-bilimler", "yokdil-saglik-bilimleri"],
  },
  {
    slug: "yokdil-saglik",
    title: "YÖKDİL Sağlık",
    subtitle: "Akademik Dil ve Sınav Uygulamaları",
    description: "16 bölüm, 201 özgün soru, 80 soruluk tam deneme ve Türkçe açıklamalı çözümlerle sağlık bilimleri için sınava hazırlık.",
    pages: 89,
    cover: "/ebooks/yokdil-saglik.jpg",
    filename: "netfener-yokdil-saglik.pdf",
    exams: ["yokdil-saglik-bilimleri"],
  },
  {
    slug: "yokdil-fen",
    title: "YÖKDİL Fen Bilimleri",
    subtitle: "Akademik Dil ve Sınav Uygulamaları",
    description: "16 bölüm, 155 özgün soru, 80 soruluk tam deneme, bilimsel kelime çalışmaları ve Türkçe açıklamalı çözümlerle fen bilimleri için sınava hazırlık.",
    pages: 100,
    cover: "/ebooks/yokdil-fen.jpg",
    filename: "netfener-yokdil-fen.pdf",
    exams: ["yokdil-fen-bilimleri"],
  },
  {
    slug: "yokdil-sosyal",
    title: "YÖKDİL Sosyal Bilimler",
    subtitle: "Akademik Dil ve Sınav Uygulamaları",
    description: "16 bölüm, 139 özgün soru, 80 soruluk tam deneme, bağlamsal kelime çalışmaları ve Türkçe açıklamalı çözümlerle sosyal bilimler için sınava hazırlık.",
    pages: 96,
    cover: "/ebooks/yokdil-sosyal-v2.jpg",
    filename: "netfener-yokdil-sosyal.pdf",
    exams: ["yokdil-sosyal-bilimler"],
  },
] as const;

export type NetfenerEbook = (typeof NETFENER_EBOOKS)[number];

export function findNetfenerEbook(slug: string) {
  return NETFENER_EBOOKS.find((book) => book.slug === slug);
}

export function netfenerEbooksForExam(exam: string) {
  return NETFENER_EBOOKS.filter((book) => (book.exams as readonly string[]).includes(exam));
}

