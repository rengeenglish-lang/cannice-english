export type DiagnosticTopicSeed = {
  slug: string;
  name: string;
  kind: "SKILL" | "SUBSKILL" | "TOPIC";
  examFamilies: ("ACADEMIC_SKILLS" | "TRANSLATION_GRAMMAR")[];
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
];
