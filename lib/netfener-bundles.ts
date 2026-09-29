import { NETFENER_EBOOKS } from "@/lib/netfener-ebooks";

/**
 * Bundles are ordinary BOOK products whose slug is listed here. Buying one entitles the
 * buyer to every e-book in `books`, which is why hasPurchasedEbook reads this map.
 * List and sale prices live on the product row so they can be changed from the admin panel.
 */
export const NETFENER_BUNDLES = [
  {
    slug: "set-paragraf-serisi",
    title: "Paragraf Serisi",
    subtitle: "Paragrafın Işığını Yak 1 + 2",
    description:
      "Okuma bölümünün tamamı: temel paragraf becerilerinden iki metni karşılaştırmaya, varsayım ve argüman değerlendirmeye kadar 20 ünite, 80 özgün metin ve 400 soru.",
    books: ["paragrafin-isigini-yak", "paragrafin-isigini-yak-cilt-2"],
  },
  {
    slug: "set-yds-tam",
    title: "YDS Tam Set",
    subtitle: "Gramer + Kelime + Paragraf",
    description:
      "YDS'nin üç ayağını tek pakette toplar: cümle yapısını gören gramer kitabı, 125 kelime ailesi ve iki ciltlik paragraf serisi.",
    books: [
      "cumlenin-icini-gor",
      "kelimenin-izini-sur",
      "paragrafin-isigini-yak",
      "paragrafin-isigini-yak-cilt-2",
    ],
  },
  {
    slug: "set-yokdil-saglik",
    title: "YÖKDİL Sağlık Seti",
    subtitle: "Alan kitabı + Kelime + Paragraf",
    description:
      "Sağlık bilimleri alanına hazırlananlar için: alanın kendi kitabı, akademik kelime çalışması ve paragraf kararlarını öğreten okuma kitabı.",
    books: ["yokdil-saglik", "kelimenin-izini-sur", "paragrafin-isigini-yak"],
  },
  {
    slug: "set-yokdil-fen",
    title: "YÖKDİL Fen Seti",
    subtitle: "Alan kitabı + Kelime + Paragraf",
    description:
      "Fen bilimleri alanına hazırlananlar için: bilimsel metnin dili, akademik kelime çalışması ve paragrafta karar verme.",
    books: ["yokdil-fen", "kelimenin-izini-sur", "paragrafin-isigini-yak"],
  },
  {
    slug: "set-yokdil-sosyal",
    title: "YÖKDİL Sosyal Seti",
    subtitle: "Alan kitabı + Kelime + Paragraf",
    description:
      "Sosyal bilimler alanına hazırlananlar için: toplumsal metinde iddia ve kanıt, akademik kelime çalışması ve paragraf kararları.",
    books: ["yokdil-sosyal", "kelimenin-izini-sur", "paragrafin-isigini-yak"],
  },
  {
    slug: "set-netfener-kutuphanesi",
    title: "Netfener Kütüphanesi",
    subtitle: "Yedi kitabın tamamı",
    description:
      "Netfener'in bütün e-kitapları: gramer, kelime, iki ciltlik paragraf serisi ve üç YÖKDİL alan kitabı. Toplam 945 sayfa.",
    books: NETFENER_EBOOKS.map((book) => book.slug),
  },
] as const;

export type NetfenerBundle = (typeof NETFENER_BUNDLES)[number];

export function findNetfenerBundle(slug: string) {
  return NETFENER_BUNDLES.find((bundle) => bundle.slug === slug);
}

/** Bundle slugs whose purchase unlocks this e-book. */
export function bundlesContainingEbook(slug: string): string[] {
  return NETFENER_BUNDLES.filter((bundle) => (bundle.books as readonly string[]).includes(slug)).map(
    (bundle) => bundle.slug,
  );
}

export function bundleBooks(bundle: NetfenerBundle) {
  return bundle.books
    .map((slug) => NETFENER_EBOOKS.find((book) => book.slug === slug))
    .filter((book): book is (typeof NETFENER_EBOOKS)[number] => Boolean(book));
}
