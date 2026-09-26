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
] as const;

export type NetfenerEbook = (typeof NETFENER_EBOOKS)[number];

export function findNetfenerEbook(slug: string) {
  return NETFENER_EBOOKS.find((book) => book.slug === slug);
}

export function netfenerEbooksForExam(exam: string) {
  return NETFENER_EBOOKS.filter((book) => (book.exams as readonly string[]).includes(exam));
}

export function ebookAction(book: NetfenerEbook, signedIn: boolean, canDownload: boolean) {
  if (signedIn && canDownload) return { href: `/api/ebooks/${book.slug}`, label: "PDF indir", download: true };
  if (!signedIn) return { href: "/sign-in?next=%2Fkaynaklar%2Fe-kitaplar", label: "Giriş yap", download: false };
  return { href: "/planlar", label: "Planları incele", download: false };
}
