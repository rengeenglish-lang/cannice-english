/** Verified existing routes. This is an inventory adapter, not a second product/pricing catalogue.
 * Dynamic URLs come from database records in inventory.service.ts. File paths are tested in CI.
 */
export const SEO_ROUTES = [
  ["/", "Netfener", "PUBLIC", "app/page.tsx"],
  ["/exams", "Sınavlar", "PUBLIC", "app/exams/page.tsx"],
  ["/blog", "Blog", "PUBLIC", "app/blog/page.tsx"],
  ["/tools", "Araçlar", "PUBLIC", "app/tools/page.tsx"],
  ["/tools/dictionary", "Sözlük", "PUBLIC", "app/tools/dictionary/page.tsx"],
  [
    "/tools/score-calculator",
    "Puan hesaplama",
    "PUBLIC",
    "app/tools/score-calculator/page.tsx",
  ],
  ["/tools/guidance", "Rehberlik", "PUBLIC", "app/tools/guidance/page.tsx"],
  [
    "/tools/exam-calendar",
    "Sınav takvimi",
    "PUBLIC",
    "app/tools/exam-calendar/page.tsx",
  ],
  [
    "/tools/free-resources",
    "Ücretsiz kaynaklar",
    "PUBLIC",
    "app/tools/free-resources/page.tsx",
  ],
  [
    "/konu-anlatim",
    "Konu anlatımı",
    "PREVIEW_OR_PLAN",
    "app/konu-anlatim/page.tsx",
  ],
  ["/group-lessons", "Canlı gruplar", "PUBLIC", "app/group-lessons/page.tsx"],
  ["/packages", "Paketler", "PUBLIC", "app/packages/page.tsx"],
  ["/books", "Kitaplar", "PUBLIC", "app/books/page.tsx"],
  ["/planlar", "Üyelik planları", "PUBLIC", "app/planlar/page.tsx"],
  ["/kaynaklar", "Kaynaklar", "PUBLIC", "app/kaynaklar/page.tsx"],
  ["/kocluk", "Ücretsiz öğrenci koçluğu", "PUBLIC", "app/kocluk/page.tsx"],
  ["/demo", "Örnek ders", "PUBLIC", "app/demo/page.tsx"],
  ["/grammar", "Gramer", "PUBLIC", "app/grammar/page.tsx"],
  [
    "/seviye-tespit",
    "Seviye tespit",
    "AUTH",
    "app/(dashboard)/seviye-tespit/page.tsx",
  ],
  [
    "/dashboard/practice",
    "Pratik bankası",
    "PLAN",
    "app/(dashboard)/dashboard/practice/page.tsx",
  ],
  [
    "/dashboard/mock-exam",
    "Deneme sınavı",
    "PLAN",
    "app/(dashboard)/dashboard/mock-exam/page.tsx",
  ],
  [
    "/dashboard/kelime-motoru",
    "Kelime motoru",
    "AUTH",
    "app/(dashboard)/dashboard/kelime-motoru/page.tsx",
  ],
] as const;
