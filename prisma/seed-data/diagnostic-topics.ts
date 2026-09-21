export type DiagnosticTopicSeed = {
  slug: string;
  name: string;
  kind: "SKILL" | "SUBSKILL" | "TOPIC";
  examFamilies: ("ACADEMIC_SKILLS" | "TRANSLATION_GRAMMAR")[];
  /** Scopes an ACADEMIC_SKILLS topic to one specific exam — IELTS/TOEFL/PTE each have their own
   *  distinct Reading question formats that must not mix. Omit for TRANSLATION_GRAMMAR topics,
   *  which are shared family-wide by design. */
  examTypeCode?: "IELTS" | "TOEFL" | "PTE";
  parentSlug?: string;
  importanceWeight?: number; // 1-5, 5 = highest priority when weak
  estimatedMinutes?: number; // realistic self-study time for this topic
  description?: string; // one Turkish sentence, shown to students
  displayOrder?: number;
  dependsOnSlugs?: string[]; // prerequisite topics — must be mastered first
};

export const DIAGNOSTIC_TOPICS: DiagnosticTopicSeed[] = [
  // --- 9 top-level SKILL nodes ---
  {
    slug: "kelime-bilgisi",
    name: "Kelime Bilgisi",
    kind: "SKILL",
    examFamilies: ["TRANSLATION_GRAMMAR"],
    importanceWeight: 4,
    estimatedMinutes: 600,
    description:
      "YDS'de karşınıza çıkabilecek akademik kelimeleri, eş anlamlıları ve kalıp ifadeleri bağlam içinde doğru kullanma becerinizi ölçer.",
    displayOrder: 1,
  },
  {
    slug: "dil-bilgisi",
    name: "Dil Bilgisi",
    kind: "SKILL",
    examFamilies: ["TRANSLATION_GRAMMAR"],
    importanceWeight: 5,
    estimatedMinutes: 900,
    description:
      "İngilizce dil bilgisinin YDS'de en sık test edilen yedi alt başlığını bir araya getiren üst kategoridir; bu konuya doğrudan soru bağlanmaz, alt beceriler üzerinden değerlendirilir.",
    displayOrder: 2,
  },
  {
    slug: "cloze-test",
    name: "Cloze Test / Boşluk Doldurma",
    kind: "SKILL",
    examFamilies: ["TRANSLATION_GRAMMAR"],
    importanceWeight: 3,
    estimatedMinutes: 240,
    description:
      "Kısa paragraflardaki boşlukları, cümleler arasındaki mantıksal ilişkiyi doğru okuyarak doldurma becerinizi ölçer.",
    displayOrder: 3,
  },
  {
    slug: "cumle-tamamlama",
    name: "Cümle Tamamlama",
    kind: "SKILL",
    examFamilies: ["TRANSLATION_GRAMMAR"],
    importanceWeight: 4,
    estimatedMinutes: 240,
    description:
      "Yarım bırakılan cümleleri hem dil bilgisi hem de anlam bakımından doğru şekilde tamamlama becerinizi ölçer.",
    displayOrder: 4,
  },
  {
    slug: "ceviri-en-tr",
    name: "İngilizce'den Türkçe'ye Çeviri",
    kind: "SKILL",
    examFamilies: ["TRANSLATION_GRAMMAR"],
    importanceWeight: 4,
    estimatedMinutes: 300,
    description:
      "İngilizce cümleleri yapısal ve anlamsal olarak en doğru Türkçe karşılığıyla eşleştirme becerinizi ölçer.",
    displayOrder: 5,
  },
  {
    slug: "ceviri-tr-en",
    name: "Türkçe'den İngilizce'ye Çeviri",
    kind: "SKILL",
    examFamilies: ["TRANSLATION_GRAMMAR"],
    importanceWeight: 4,
    estimatedMinutes: 300,
    description:
      "Türkçe cümleleri doğru İngilizce yapı ve anlamla ifade etme becerinizi ölçer.",
    displayOrder: 6,
  },
  {
    slug: "paragraf-tamamlama",
    name: "Paragraf Tamamlama",
    kind: "SKILL",
    examFamilies: ["TRANSLATION_GRAMMAR"],
    importanceWeight: 3,
    estimatedMinutes: 180,
    description:
      "Kısa akademik paragraflardaki boşluğu, paragrafın akışına ve iç mantığına en uygun cümleyle tamamlama becerinizi ölçer.",
    displayOrder: 7,
  },
  {
    slug: "okuma",
    name: "Okuma / Reading Comprehension",
    kind: "SKILL",
    examFamilies: ["TRANSLATION_GRAMMAR"],
    importanceWeight: 4,
    estimatedMinutes: 360,
    description:
      "Akademik metinleri ana fikir, çıkarım, detay, yazarın tutumu ve bağlamda kelime açısından anlama becerinizi ölçer.",
    displayOrder: 8,
  },
  {
    slug: "anlamda-en-yakin-cumle",
    name: "Anlamda En Yakın Cümle / Restatement",
    kind: "SKILL",
    examFamilies: ["TRANSLATION_GRAMMAR"],
    importanceWeight: 3,
    estimatedMinutes: 180,
    description:
      "Verilen bir cümleyle tam olarak aynı anlamı taşıyan, farklı sözcük ve yapılarla yeniden ifade edilmiş cümleyi seçme becerinizi ölçer.",
    displayOrder: 9,
  },

  // --- 7 SUBSKILL nodes (children of dil-bilgisi) ---
  {
    slug: "zamanlar",
    name: "Zamanlar / Tenses",
    kind: "SUBSKILL",
    examFamilies: ["TRANSLATION_GRAMMAR"],
    parentSlug: "dil-bilgisi",
    importanceWeight: 5,
    estimatedMinutes: 300,
    description:
      "İngilizce fiil zamanlarını cümledeki zaman ifadelerine ve bağlaçlara göre doğru seçme becerinizi ölçer; diğer gramer konularının temelini oluşturur.",
    displayOrder: 10,
  },
  {
    slug: "edilgen-cati",
    name: "Edilgen Çatı / Passive Voice",
    kind: "SUBSKILL",
    examFamilies: ["TRANSLATION_GRAMMAR"],
    parentSlug: "dil-bilgisi",
    importanceWeight: 5,
    estimatedMinutes: 240,
    description:
      "Edilgen çatı ve ettirgen (causative) yapıları doğru kurma ve tanıma becerinizi ölçer.",
    displayOrder: 11,
    dependsOnSlugs: ["zamanlar"],
  },
  {
    slug: "sifat-cumlecikleri",
    name: "Sıfat Cümlecikleri / Relative Clauses",
    kind: "SUBSKILL",
    examFamilies: ["TRANSLATION_GRAMMAR"],
    parentSlug: "dil-bilgisi",
    importanceWeight: 4,
    estimatedMinutes: 240,
    description:
      "Sıfat (ilgi) cümleciklerinde doğru ilgi zamirini, kısaltma biçimini ve dizilimi seçme becerinizi ölçer.",
    displayOrder: 12,
  },
  {
    slug: "kosul-cumleleri",
    name: "Koşul Cümleleri / Conditionals",
    kind: "SUBSKILL",
    examFamilies: ["TRANSLATION_GRAMMAR"],
    parentSlug: "dil-bilgisi",
    importanceWeight: 4,
    estimatedMinutes: 210,
    description:
      "Koşul cümlelerinin tiplerini, karışık (mixed) kalıpları ve devrik yapılarını doğru kurma becerinizi ölçer.",
    displayOrder: 13,
    dependsOnSlugs: ["zamanlar"],
  },
  {
    slug: "modal-fiiller",
    name: "Modal Fiiller / Modality",
    kind: "SUBSKILL",
    examFamilies: ["TRANSLATION_GRAMMAR"],
    parentSlug: "dil-bilgisi",
    importanceWeight: 3,
    estimatedMinutes: 240,
    description:
      "Kiplik fiillerin (modallerin) zorunluluk, olasılık, tavsiye ve geçmişe dönük çıkarım anlamlarını ayırt etme becerinizi ölçer.",
    displayOrder: 14,
  },
  {
    slug: "ulac-mastar",
    name: "Ulaç ve Mastar / Gerunds & Infinitives",
    kind: "SUBSKILL",
    examFamilies: ["TRANSLATION_GRAMMAR"],
    parentSlug: "dil-bilgisi",
    importanceWeight: 3,
    estimatedMinutes: 180,
    description:
      "Bir fiilden sonra gerund (Ving) mu yoksa infinitive (to V0) mu geleceğini doğru seçme becerinizi ölçer.",
    displayOrder: 15,
  },
  {
    slug: "baglaclar",
    name: "Bağlaçlar / Conjunctions",
    kind: "SUBSKILL",
    examFamilies: ["TRANSLATION_GRAMMAR"],
    parentSlug: "dil-bilgisi",
    importanceWeight: 3,
    estimatedMinutes: 210,
    description:
      "Bağlaçları, edatları ve cümle zarflarını cümledeki yapısal role ve anlam ilişkisine göre doğru seçme becerinizi ölçer.",
    displayOrder: 16,
  },

  // ============================================================
  // ACADEMIC_SKILLS starter content — IELTS / TOEFL / PTE Reading.
  // Listening is excluded (needs real audio assets this build has no pipeline for); Writing and
  // Speaking are excluded from the auto-graded diagnostic (no staff review UI exists for
  // free-response answers — Speaking already has its own dedicated AI Speaking Tutor feature).
  // ============================================================

  // --- IELTS Reading ---
  {
    slug: "ielts-reading",
    name: "IELTS Reading",
    kind: "SKILL",
    examFamilies: ["ACADEMIC_SKILLS"],
    examTypeCode: "IELTS",
    importanceWeight: 4,
    estimatedMinutes: 480,
    description: "IELTS Academic Reading bölümünde karşınıza çıkan dört soru tipini bir araya getiren üst kategoridir; bu konuya doğrudan soru bağlanmaz, alt beceriler üzerinden değerlendirilir.",
    displayOrder: 20,
  },
  {
    slug: "ielts-reading-tfng",
    name: "True / False / Not Given",
    kind: "SUBSKILL",
    examFamilies: ["ACADEMIC_SKILLS"],
    examTypeCode: "IELTS",
    parentSlug: "ielts-reading",
    importanceWeight: 5,
    estimatedMinutes: 150,
    description: "Bir ifadenin metindeki bilgiyle aynı, çelişkili ya da metinde hiç geçmeyen bir bilgi olduğunu ayırt etme becerinizi ölçer.",
    displayOrder: 21,
  },
  {
    slug: "ielts-reading-matching-headings",
    name: "Matching Headings",
    kind: "SUBSKILL",
    examFamilies: ["ACADEMIC_SKILLS"],
    examTypeCode: "IELTS",
    parentSlug: "ielts-reading",
    importanceWeight: 4,
    estimatedMinutes: 150,
    description: "Bir paragrafın ana fikrini yakalayıp ona en uygun başlığı seçme becerinizi ölçer.",
    displayOrder: 22,
  },
  {
    slug: "ielts-reading-mcq",
    name: "Reading Multiple Choice",
    kind: "SUBSKILL",
    examFamilies: ["ACADEMIC_SKILLS"],
    examTypeCode: "IELTS",
    parentSlug: "ielts-reading",
    importanceWeight: 4,
    estimatedMinutes: 120,
    description: "Metindeki detayları ve yazarın görüşünü doğru yorumlayarak çoktan seçmeli soruları yanıtlama becerinizi ölçer.",
    displayOrder: 23,
  },
  {
    slug: "ielts-reading-completion",
    name: "Sentence & Summary Completion",
    kind: "SUBSKILL",
    examFamilies: ["ACADEMIC_SKILLS"],
    examTypeCode: "IELTS",
    parentSlug: "ielts-reading",
    importanceWeight: 4,
    estimatedMinutes: 150,
    description: "Metinden alınan bilgiyi, verilen kelime sınırına uyarak cümle veya özet boşluklarına doğru şekilde yerleştirme becerinizi ölçer.",
    displayOrder: 24,
  },

  // --- TOEFL Reading ---
  {
    slug: "toefl-reading",
    name: "TOEFL Reading",
    kind: "SKILL",
    examFamilies: ["ACADEMIC_SKILLS"],
    examTypeCode: "TOEFL",
    importanceWeight: 4,
    estimatedMinutes: 480,
    description: "TOEFL iBT Reading bölümünde karşınıza çıkan dört soru tipini bir araya getiren üst kategoridir; bu konuya doğrudan soru bağlanmaz, alt beceriler üzerinden değerlendirilir.",
    displayOrder: 25,
  },
  {
    slug: "toefl-reading-vocabulary",
    name: "Vocabulary in Context",
    kind: "SUBSKILL",
    examFamilies: ["ACADEMIC_SKILLS"],
    examTypeCode: "TOEFL",
    parentSlug: "toefl-reading",
    importanceWeight: 4,
    estimatedMinutes: 120,
    description: "Akademik bir metindeki koyu renkli bir kelime veya ifadenin bağlamdaki anlamını doğru seçme becerinizi ölçer.",
    displayOrder: 26,
  },
  {
    slug: "toefl-reading-reference",
    name: "Reference",
    kind: "SUBSKILL",
    examFamilies: ["ACADEMIC_SKILLS"],
    examTypeCode: "TOEFL",
    parentSlug: "toefl-reading",
    importanceWeight: 3,
    estimatedMinutes: 90,
    description: "Bir zamir veya işaret sözcüğünün metinde hangi isme gönderme yaptığını doğru tespit etme becerinizi ölçer.",
    displayOrder: 27,
  },
  {
    slug: "toefl-reading-inference",
    name: "Inference",
    kind: "SUBSKILL",
    examFamilies: ["ACADEMIC_SKILLS"],
    examTypeCode: "TOEFL",
    parentSlug: "toefl-reading",
    importanceWeight: 5,
    estimatedMinutes: 150,
    description: "Metinde doğrudan söylenmeyen ama verilen bilgilerden mantıksal olarak çıkarılabilecek sonucu bulma becerinizi ölçer.",
    displayOrder: 28,
  },
  {
    slug: "toefl-reading-simplification",
    name: "Sentence Simplification",
    kind: "SUBSKILL",
    examFamilies: ["ACADEMIC_SKILLS"],
    examTypeCode: "TOEFL",
    parentSlug: "toefl-reading",
    importanceWeight: 4,
    estimatedMinutes: 120,
    description: "Karmaşık bir cümlenin, temel anlamını koruyan en sade yeniden ifadesini seçme becerinizi ölçer.",
    displayOrder: 29,
  },

  // --- PTE Reading ---
  {
    slug: "pte-reading",
    name: "PTE Reading",
    kind: "SKILL",
    examFamilies: ["ACADEMIC_SKILLS"],
    examTypeCode: "PTE",
    importanceWeight: 4,
    estimatedMinutes: 480,
    description: "PTE Academic Reading bölümünde karşınıza çıkan dört soru tipini bir araya getiren üst kategoridir; bu konuya doğrudan soru bağlanmaz, alt beceriler üzerinden değerlendirilir.",
    displayOrder: 30,
  },
  {
    slug: "pte-reading-mcq-single",
    name: "Multiple Choice, Single Answer",
    kind: "SUBSKILL",
    examFamilies: ["ACADEMIC_SKILLS"],
    examTypeCode: "PTE",
    parentSlug: "pte-reading",
    importanceWeight: 4,
    estimatedMinutes: 120,
    description: "Kısa bir metni okuyup tek doğru cevabı olan çoktan seçmeli soruyu yanıtlama becerinizi ölçer.",
    displayOrder: 31,
  },
  {
    slug: "pte-reading-mcq-multi",
    name: "Multiple Choice, Multiple Answers",
    kind: "SUBSKILL",
    examFamilies: ["ACADEMIC_SKILLS"],
    examTypeCode: "PTE",
    parentSlug: "pte-reading",
    importanceWeight: 3,
    estimatedMinutes: 90,
    description: "Birden fazla doğru seçeneği olabilecek bir soruda, hepsini eksiksiz ve doğru şekilde tespit etme becerinizi ölçer.",
    displayOrder: 32,
  },
  {
    slug: "pte-reading-reorder",
    name: "Re-order Paragraphs",
    kind: "SUBSKILL",
    examFamilies: ["ACADEMIC_SKILLS"],
    examTypeCode: "PTE",
    parentSlug: "pte-reading",
    importanceWeight: 4,
    estimatedMinutes: 120,
    description: "Karışık sırada verilen cümleleri, mantıksal akışa göre doğru paragraf sırasına dizme becerinizi ölçer.",
    displayOrder: 33,
  },
  {
    slug: "pte-reading-fill-blanks",
    name: "Reading Fill in the Blanks",
    kind: "SUBSKILL",
    examFamilies: ["ACADEMIC_SKILLS"],
    examTypeCode: "PTE",
    parentSlug: "pte-reading",
    importanceWeight: 4,
    estimatedMinutes: 150,
    description: "Bir metindeki boşluklara, dil bilgisi ve anlam bakımından en uygun kelimeyi yerleştirme becerinizi ölçer.",
    displayOrder: 34,
  },
];
