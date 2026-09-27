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
    cover: "/ebooks/yokdil-sosyal.jpg",
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

