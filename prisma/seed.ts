import "dotenv/config";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const scrypt = promisify(scryptCallback);

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to seed");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

function formatExamples(examples) {
  return examples.map((example, index) => `Örnek ${index + 1}: ${example}`).join("\n\n");
}

const EXAM_TYPES = [
  { code: "IELTS", slug: "ielts", name: "IELTS", shortDescription: "Uluslararası İngilizce Dil Sınavı Sistemi — akademik ve genel modüller.", displayOrder: 1 },
  { code: "TOEFL", slug: "toefl", name: "TOEFL", shortDescription: "Yabancı Dil Olarak İngilizce Testi — akademik İngilizce yeterliliği.", displayOrder: 2 },
  { code: "PTE", slug: "pte", name: "PTE", shortDescription: "Pearson İngilizce Testi — bilgisayar tabanlı akademik İngilizce sınavı.", displayOrder: 3 },
  { code: "YDS", slug: "yds", name: "YDS", shortDescription: "Yabancı Dil Bilgisi Seviye Tespit Sınavı.", displayOrder: 4 },
  { code: "YOKDIL_SOSYAL", slug: "yokdil-sosyal-bilimler", name: "YÖKDİL Sosyal Bilimler", shortDescription: "Sosyal bilimler alanında akademik personel ve lisansüstü İngilizce sınavı.", displayOrder: 5 },
  { code: "YOKDIL_SAGLIK", slug: "yokdil-saglik-bilimleri", name: "YÖKDİL Sağlık Bilimleri", shortDescription: "Sağlık bilimleri alanında akademik personel ve lisansüstü İngilizce sınavı.", displayOrder: 6 },
  { code: "YOKDIL_FEN", slug: "yokdil-fen-bilimleri", name: "YÖKDİL Fen Bilimleri", shortDescription: "Fen bilimleri alanında akademik personel ve lisansüstü İngilizce sınavı.", displayOrder: 7 },
];

async function main() {
  console.log("Seeding Cannice English…");

  const examTypes = {};
  for (const exam of EXAM_TYPES) {
    const record = await db.examType.upsert({ where: { code: exam.code }, update: exam, create: exam });
    examTypes[exam.code] = record;
  }

  const teacherPassword = await hashPassword(process.env.CANNICE_TEACHER_PASSWORD || "CanniceTeacher2026!");
  const teacher = await db.user.upsert({
    where: { email: "hoca@canniceenglish.com" },
    update: {},
    create: { email: "hoca@canniceenglish.com", name: "Cannice Hoca", role: "TEACHER", password: teacherPassword },
  });

  const studentPassword = await hashPassword(process.env.CANNICE_STUDENT_PASSWORD || "CanniceStudent2026!");
  await db.user.upsert({
    where: { email: "ogrenci@canniceenglish.com" },
    update: {},
    create: { email: "ogrenci@canniceenglish.com", name: "Demo Öğrenci", role: "STUDENT", password: studentPassword },
  });

  // ---- Products: prep groups & mock camps ----
  const productDefs = [
    {
      slug: "yds-yokdil-hazirlik-grubu",
      title: "YDS+YÖKDİL Hazırlık Grubu",
      subtitle: "İki Sınav, Tek Çözüm!",
      category: "PREP_GROUP",
      examCode: "YDS",
      level: "BEGINNER_TO_ADVANCED",
      badgeLabel: "Özel İndirim 🔥",
      basePrice: "17999.00",
      salePrice: "11999.00",
      isFeatured: true,
      displayOrder: 1,
      shortDescription: "Sıfırdan ileri seviyeye YDS ve YÖKDİL için kapsamlı hazırlık.",
      description: "Kayıtlı ders modülleri ve haftalık canlı derslerle YDS ve YÖKDİL'e birlikte hazırlanın. Gramer, kelime, çeviri teknikleri ve deneme sınavları dahildir.",
      deliveryFormat: "HYBRID",
      modules: [
        { title: "Temel Gramer ve Cümle Yapısı", lessons: [
          { title: "Tenses'e Genel Bakış", durationMinutes: 32, isPreviewable: true },
          { title: "Modal Verbs ve Kullanım Alanları", durationMinutes: 28 },
          { title: "Cümle Çeşitleri ve Bağlaçlar", durationMinutes: 35 },
        ]},
        { title: "Kelime ve Çeviri Teknikleri", lessons: [
          { title: "Akademik Kelime Listesi 1", durationMinutes: 25 },
          { title: "Paragraf Çevirisi Stratejileri", durationMinutes: 40 },
        ]},
        { title: "Deneme Sınavları", lessons: [
          { title: "YDS Deneme Sınavı 1 — Değerlendirme", durationMinutes: 50 },
        ]},
      ],
      liveSessions: [
        { title: "Canlı Soru-Cevap: Gramer", cohortLabel: "Kasım 2026 Grubu", startsAt: "2026-11-03T18:00:00.000Z", endsAt: "2026-11-03T19:30:00.000Z" },
        { title: "Canlı Soru-Cevap: Çeviri Teknikleri", cohortLabel: "Kasım 2026 Grubu", startsAt: "2026-11-10T18:00:00.000Z", endsAt: "2026-11-10T19:30:00.000Z" },
      ],
    },
    {
      slug: "yokdil-hazirlik-grubu",
      title: "YÖKDİL Hazırlık Grubu",
      subtitle: "Kapsamlı Eğitim!",
      category: "PREP_GROUP",
      examCode: "YOKDIL_FEN",
      level: "BEGINNER_TO_ADVANCED",
      badgeLabel: "Özel İndirim 🔥",
      basePrice: "15999.00",
      salePrice: "9999.00",
      displayOrder: 2,
      isFeatured: true,
      shortDescription: "YÖKDİL formatına özel, sıfırdan ileri seviyeye hazırlık grubu.",
      deliveryFormat: "HYBRID",
      modules: [
        { title: "YÖKDİL Formatına Giriş", lessons: [
          { title: "Sınav Formatı ve Soru Tipleri", durationMinutes: 30, isPreviewable: true },
        ]},
        { title: "Bilimsel Metin Okuma Teknikleri", lessons: [
          { title: "Fen Bilimleri Terminolojisi", durationMinutes: 27 },
        ]},
      ],
      liveSessions: [],
    },
    {
      slug: "yds-express-grubu-yogun-ve-hizli-hazirlik",
      title: "YDS Express Grubu",
      subtitle: "Yoğun ve Hızlandırılmış Hazırlık!",
      category: "PREP_GROUP",
      examCode: "YDS",
      level: "BEGINNER_TO_ADVANCED",
      badgeLabel: "Özel İndirim 🔥",
      basePrice: "13999.00",
      salePrice: "9799.00",
      displayOrder: 3,
      shortDescription: "Sınava az kalanlar için yoğunlaştırılmış YDS programı.",
      deliveryFormat: "RECORDED_ONLY",
      modules: [
        { title: "Hızlı Tekrar Modülü", lessons: [{ title: "Gramer Hızlı Tekrar", durationMinutes: 45 }] },
      ],
      liveSessions: [],
    },
    {
      slug: "yds-yokdil-soru-deneme-grubu",
      title: "YDS+YÖKDİL Kampı",
      subtitle: "Puanını Yükselt!",
      category: "MOCK_CAMP",
      examCode: "YDS",
      level: "INTERMEDIATE_ADVANCED",
      badgeLabel: "Özel İndirim 🔥",
      basePrice: "24191.94",
      salePrice: "14999.00",
      displayOrder: 4,
      isFeatured: true,
      shortDescription: "Orta ve ileri düzey öğrenciler için yoğun soru ve deneme kampı.",
      deliveryFormat: "LIVE_ONLY",
      modules: [],
      liveSessions: [
        { title: "Deneme Sınavı Kampı — Hafta 1", cohortLabel: "Ocak 2027 Kampı", startsAt: "2027-01-12T17:00:00.000Z", endsAt: "2027-01-12T20:00:00.000Z" },
      ],
    },
    {
      slug: "yds-yokdil-akademik-ceviri-grubu",
      title: "Sıfırdan Akademik Çeviri Grubu",
      subtitle: "Okuduğunu Anla!",
      category: "TRANSLATION_SUPPORT",
      examCode: "YDS",
      level: "BEGINNER_TO_ADVANCED",
      badgeLabel: "Destekleyici Grup",
      basePrice: "10999.00",
      salePrice: "6999.00",
      displayOrder: 5,
      shortDescription: "Akademik metinleri anlama ve çeviri becerisini geliştiren destek grubu.",
      deliveryFormat: "RECORDED_ONLY",
      modules: [{ title: "Çeviri Temelleri", lessons: [{ title: "Cümle Analizi ile Çeviri", durationMinutes: 33 }] }],
      liveSessions: [],
    },
    {
      slug: "yds-junior-hazirlik-paketleri",
      title: "YDS Başlangıç Paketi",
      subtitle: "Çalışma Paketi",
      category: "STUDY_PACKAGE",
      examCode: "YDS",
      level: "JUNIOR",
      basePrice: "4999.00",
      salePrice: "3499.00",
      displayOrder: 6,
      shortDescription: "Yeni başlayanlar için kelime, gramer ve okuma çalışma seti.",
      deliveryFormat: "RECORDED_ONLY",
      modules: [{ title: "Başlangıç Seviyesi Kaynaklar", lessons: [{ title: "Temel Kelime Listesi Çalışması", durationMinutes: 20 }] }],
      liveSessions: [],
    },
    {
      slug: "yokdil-senior-paketleri",
      title: "YÖKDİL İleri Seviye Paketi",
      subtitle: "Çalışma Paketi",
      category: "STUDY_PACKAGE",
      examCode: "YOKDIL_SAGLIK",
      level: "SENIOR",
      basePrice: "5999.00",
      salePrice: "4299.00",
      displayOrder: 7,
      shortDescription: "Puanını artırmak isteyen ileri seviye öğrenciler için deneme ağırlıklı paket.",
      deliveryFormat: "RECORDED_ONLY",
      modules: [{ title: "İleri Seviye Denemeler", lessons: [{ title: "YÖKDİL Sağlık Deneme 1", durationMinutes: 60 }] }],
      liveSessions: [],
    },
  ];

  for (const def of productDefs) {
    const product = await db.product.upsert({
      where: { slug: def.slug },
      update: {
        title: def.title, subtitle: def.subtitle, category: def.category, examTypeId: examTypes[def.examCode].id,
        level: def.level, badgeLabel: def.badgeLabel ?? null, basePrice: def.basePrice, salePrice: def.salePrice,
        isFeatured: def.isFeatured ?? false, displayOrder: def.displayOrder, shortDescription: def.shortDescription ?? null, description: def.description ?? null,
      },
      create: {
        slug: def.slug, title: def.title, subtitle: def.subtitle, category: def.category, examTypeId: examTypes[def.examCode].id,
        level: def.level, badgeLabel: def.badgeLabel ?? null, basePrice: def.basePrice, salePrice: def.salePrice,
        isFeatured: def.isFeatured ?? false, displayOrder: def.displayOrder, shortDescription: def.shortDescription ?? null, description: def.description ?? null,
      },
    });

    const course = await db.course.upsert({
      where: { productId: product.id },
      update: { deliveryFormat: def.deliveryFormat },
      create: { productId: product.id, deliveryFormat: def.deliveryFormat },
    });

    let modulePosition = 0;
    for (const moduleDef of def.modules) {
      modulePosition += 1;
      const courseModule = await db.courseModule.upsert({
        where: { courseId_position: { courseId: course.id, position: modulePosition } },
        update: { title: moduleDef.title },
        create: { courseId: course.id, title: moduleDef.title, position: modulePosition },
      });
      let lessonPosition = 0;
      for (const lessonDef of moduleDef.lessons) {
        lessonPosition += 1;
        await db.recordedLesson.upsert({
          where: { moduleId_position: { moduleId: courseModule.id, position: lessonPosition } },
          update: { title: lessonDef.title, durationMinutes: lessonDef.durationMinutes, isPreviewable: !!lessonDef.isPreviewable },
          create: { moduleId: courseModule.id, title: lessonDef.title, position: lessonPosition, durationMinutes: lessonDef.durationMinutes, isPreviewable: !!lessonDef.isPreviewable },
        });
      }
    }

    for (const sessionDef of def.liveSessions) {
      const existing = await db.liveSession.findFirst({ where: { courseId: course.id, title: sessionDef.title } });
      if (!existing) {
        await db.liveSession.create({
          data: { courseId: course.id, title: sessionDef.title, cohortLabel: sessionDef.cohortLabel, startsAt: new Date(sessionDef.startsAt), endsAt: new Date(sessionDef.endsAt) },
        });
      }
    }
  }

  // ---- Books ----
  const bookDefs = [
    { slug: "yds-yokdil-kelime-defteri", title: "YDS - YÖKDİL Kelime Defteri", examCode: "YDS", basePrice: "349.00", salePrice: "249.00", author: "Cannice Hoca", format: "PRINT_AND_PDF", pageCount: 220 },
    { slug: "yds-deneme-sinavlari-kitabi", title: "YDS Deneme Sınavları", examCode: "YDS", basePrice: "399.00", salePrice: "299.00", author: "Cannice Hoca", format: "PRINT", pageCount: 180 },
    { slug: "the-ultimate-vocabulary-builder", title: "The Ultimate Vocabulary Builder", examCode: "YOKDIL_FEN", basePrice: "299.00", salePrice: "219.00", author: "Cannice Hoca", format: "PDF", pageCount: 150 },
  ];

  for (const def of bookDefs) {
    const product = await db.product.upsert({
      where: { slug: def.slug },
      update: { title: def.title, category: "BOOK", examTypeId: examTypes[def.examCode].id, basePrice: def.basePrice, salePrice: def.salePrice, displayOrder: 1 },
      create: { slug: def.slug, title: def.title, category: "BOOK", examTypeId: examTypes[def.examCode].id, basePrice: def.basePrice, salePrice: def.salePrice, displayOrder: 1 },
    });
    await db.book.upsert({
      where: { productId: product.id },
      update: { author: def.author, format: def.format, pageCount: def.pageCount },
      create: { productId: product.id, author: def.author, format: def.format, pageCount: def.pageCount },
    });
  }

  // ---- Testimonials ----
  const testimonialDefs = [
    { studentName: "Elif K.", examCode: "YDS", resultSummary: "YDS 92.5", quote: "Cannice English ile çalıştıktan sonra YDS'de hedeflediğim puanı ilk denemede aldım. Canlı derslerde sorularıma anında cevap bulabiliyordum." },
    { studentName: "Mert A.", examCode: "YOKDIL_SAGLIK", resultSummary: "YÖKDİL 88", quote: "Sağlık bilimleri terminolojisine özel hazırlanan içerikler gerçekten işe yaradı, deneme sınavları sınav formatına çok yakındı." },
    { studentName: "Priya S.", examCode: "IELTS", resultSummary: "IELTS 7.5", quote: "The recorded lessons combined with weekly live classes made it easy to fit my prep around a full-time job." },
    { studentName: "Ahmet Y.", examCode: "YDS", resultSummary: "YDS 85", quote: "Akademik çeviri grubu sayesinde okuduğumu anlama hızım ciddi şekilde arttı." },
  ];
  for (const [index, def] of testimonialDefs.entries()) {
    await db.testimonial.upsert({
      where: { id: `seed-testimonial-${index + 1}` },
      update: { studentName: def.studentName, examTypeId: examTypes[def.examCode].id, resultSummary: def.resultSummary, quote: def.quote, isFeatured: true, displayOrder: index },
      create: { id: `seed-testimonial-${index + 1}`, studentName: def.studentName, examTypeId: examTypes[def.examCode].id, resultSummary: def.resultSummary, quote: def.quote, isFeatured: true, displayOrder: index },
    });
  }

  // ---- Blog ----
  const category = await db.blogCategory.upsert({
    where: { slug: "sinav-hazirlik" },
    update: {},
    create: { name: "Sınav Hazırlık", slug: "sinav-hazirlik", displayOrder: 1 },
  });

  const blogDefs = [
    {
      slug: "yds-calisma-programi-nasil-hazirlanir",
      title: "YDS Çalışma Programı Nasıl Hazırlanır?",
      excerpt: "Sınava kalan süreye göre etkili bir çalışma programı oluşturmanın adımlarını anlatıyoruz.",
      content: "Etkili bir YDS çalışma programı, güçlü ve zayıf yönlerinizi belirlemekle başlar.\n\nHer hafta için gramer, kelime ve deneme sınavı zamanı ayırarak dengeli bir program oluşturun.\n\nDüzenli tekrar, YDS başarısının en önemli bileşenlerinden biridir.",
    },
    {
      slug: "sinav-kaygisini-yenmenin-5-yolu",
      title: "Sınav Kaygısını Yenmenin 5 Yolu",
      excerpt: "Sınav kaygısı, bilginizi doğru şekilde yansıtmanızı engelleyebilir. İşte pratik öneriler.",
      content: "Sınav kaygısı çoğu öğrencinin karşılaştığı yaygın bir durumdur.\n\nDüzenli deneme sınavı çözmek, gerçek sınav ortamına alışmanızı sağlar.\n\nNefes teknikleri ve olumlu iç konuşma da kaygıyı azaltmada etkilidir.",
    },
    {
      slug: "yokdil-ile-yds-arasindaki-farklar",
      title: "YÖKDİL ile YDS Arasındaki Farklar",
      excerpt: "İki sınav da benzer görünse de format ve içerik açısından önemli farklılıklar taşır.",
      content: "YÖKDİL, alan bazlı (sosyal, sağlık, fen) metinler içerirken YDS daha genel içeriklidir.\n\nHer iki sınav da dil bilgisi ve kelime bilgisi ölçse de YÖKDİL'de akademik terminoloji ön plandadır.",
    },
  ];

  for (const def of blogDefs) {
    await db.blogPost.upsert({
      where: { slug: def.slug },
      update: { title: def.title, excerpt: def.excerpt, content: def.content, categoryId: category.id, authorId: teacher.id, status: "PUBLISHED", publishedAt: new Date() },
      create: { slug: def.slug, title: def.title, excerpt: def.excerpt, content: def.content, categoryId: category.id, authorId: teacher.id, status: "PUBLISHED", publishedAt: new Date() },
    });
  }

  // ---- İngilizce Gramer ----
  const grammarCategory = await db.blogCategory.upsert({
    where: { slug: "ingilizce-gramer" },
    update: {},
    create: { name: "İngilizce Gramer", slug: "ingilizce-gramer", displayOrder: 2 },
  });

  const grammarDefs = [
    {
      slug: "present-perfect-tense-kullanimi",
      title: "Present Perfect Tense Ne Zaman Kullanılır?",
      excerpt: "YDS ve YÖKDİL'de sıkça çıkan present perfect tense'in kullanım alanlarını örneklerle inceliyoruz.",
      content: "Present perfect tense, geçmişte başlayıp etkisi hâlâ devam eden veya net bir zamanı belirtilmeyen eylemler için kullanılır.\n\nÖrnek: 'She has lived in London for five years.' cümlesinde eylem geçmişte başlamış ve hâlâ devam etmektedir.\n\nYDS ve YÖKDİL'de bu yapı genellikle 'since', 'for', 'already', 'yet' gibi zaman belirteçleriyle birlikte sorulur.",
    },
    {
      slug: "conditional-clauses-kosul-cumleleri",
      title: "Conditional Clauses (Koşul Cümleleri) Rehberi",
      excerpt: "Zero, first, second ve third conditional yapılarının farklarını ve sınavda nasıl karşımıza çıktığını anlatıyoruz.",
      content: "Koşul cümleleri, bir durumun gerçekleşmesi için gereken şartı ifade eder.\n\nZero conditional genel gerçekler için, first conditional gerçekleşmesi muhtemel durumlar için, second ve third conditional ise gerçek dışı veya geçmişte gerçekleşmemiş durumlar için kullanılır.\n\nSınavlarda genellikle cümlenin anlamına uygun doğru yapıyı seçmeniz istenir.",
    },
  ];

  for (const def of grammarDefs) {
    await db.blogPost.upsert({
      where: { slug: def.slug },
      update: { title: def.title, excerpt: def.excerpt, content: def.content, categoryId: grammarCategory.id, authorId: teacher.id, status: "PUBLISHED", publishedAt: new Date() },
      create: { slug: def.slug, title: def.title, excerpt: def.excerpt, content: def.content, categoryId: grammarCategory.id, authorId: teacher.id, status: "PUBLISHED", publishedAt: new Date() },
    });
  }

  // ---- Coupons ----
  const couponDefs = [
    { code: "HOSGELDIN10", type: "PERCENT", value: "10", description: "Yeni üyelere özel hoş geldin indirimi.", isPublic: true },
    { code: "PASS25", type: "PERCENT", value: "25", description: "Seçili paketlerde geçerli özel indirim kodu.", isPublic: true },
  ];
  for (const def of couponDefs) {
    await db.coupon.upsert({
      where: { code: def.code },
      update: { type: def.type, value: def.value, description: def.description, isPublic: def.isPublic, isActive: true },
      create: { code: def.code, type: def.type, value: def.value, description: def.description, isPublic: def.isPublic },
    });
  }

  // ---- Dictionary, score conversion, exam calendar, free resources ----
  const dictionaryDefs = [
    { term: "Coherence", definition: "Bir metindeki fikirlerin mantıklı ve akıcı biçimde birbirine bağlanması.", exampleSentence: "The essay lacked coherence between paragraphs.", examCode: "IELTS" },
    { term: "Paraphrase", definition: "Bir cümleyi ya da fikri farklı kelimelerle yeniden ifade etmek.", exampleSentence: "Try to paraphrase the question in your own words.", examCode: "YDS" },
    { term: "Skimming", definition: "Bir metnin genel fikrini hızlıca anlamak için göz gezdirme tekniği.", examCode: "YOKDIL_FEN" },
  ];
  for (const def of dictionaryDefs) {
    const existing = await db.dictionaryTerm.findFirst({ where: { term: def.term } });
    if (!existing) await db.dictionaryTerm.create({ data: { term: def.term, definition: def.definition, exampleSentence: def.exampleSentence, examTypeId: examTypes[def.examCode].id } });
  }

  const bandTable = (examCode) => [
    { minCorrect: 0, maxCorrect: 39, resultLabel: "0 - 49 puan", notes: "Temel seviye altı" },
    { minCorrect: 40, maxCorrect: 54, resultLabel: "50 - 64 puan", notes: "Temel seviye" },
    { minCorrect: 55, maxCorrect: 69, resultLabel: "65 - 79 puan", notes: "Orta seviye" },
    { minCorrect: 70, maxCorrect: 84, resultLabel: "80 - 89 puan", notes: "İleri seviye" },
    { minCorrect: 85, maxCorrect: 100, resultLabel: "90 - 100 puan", notes: "Üst düzey" },
  ].map((row, index) => ({ examCode, inputLabel: `${row.minCorrect}-${row.maxCorrect} doğru`, resultLabel: row.resultLabel, notes: row.notes, minCorrect: row.minCorrect, maxCorrect: row.maxCorrect, displayOrder: index + 1 }));

  const scoreRows = [...bandTable("YDS"), ...bandTable("YOKDIL_SOSYAL"), ...bandTable("YOKDIL_SAGLIK"), ...bandTable("YOKDIL_FEN")];
  for (const row of scoreRows) {
    const existing = await db.scoreConversionEntry.findFirst({ where: { examTypeId: examTypes[row.examCode].id, inputLabel: row.inputLabel } });
    const data = { examTypeId: examTypes[row.examCode].id, inputLabel: row.inputLabel, resultLabel: row.resultLabel, notes: row.notes, minCorrect: row.minCorrect, maxCorrect: row.maxCorrect, displayOrder: row.displayOrder };
    if (existing) await db.scoreConversionEntry.update({ where: { id: existing.id }, data });
    else await db.scoreConversionEntry.create({ data });
  }

  const calendarDefs = [
    { examCode: "YDS", title: "2027/1 Dönem", examDate: "2027-03-07T00:00:00.000Z", applicationDeadline: "2027-01-20T00:00:00.000Z", resultDate: "2027-04-02T00:00:00.000Z", year: 2027 },
    { examCode: "YOKDIL_FEN", title: "2027/1 Dönem", examDate: "2027-03-14T00:00:00.000Z", applicationDeadline: "2027-01-27T00:00:00.000Z", resultDate: "2027-04-09T00:00:00.000Z", year: 2027 },
  ];
  for (const entry of calendarDefs) {
    const existing = await db.examCalendarEntry.findFirst({ where: { examTypeId: examTypes[entry.examCode].id, year: entry.year, title: entry.title } });
    if (!existing) {
      await db.examCalendarEntry.create({
        data: { examTypeId: examTypes[entry.examCode].id, title: entry.title, examDate: new Date(entry.examDate), applicationDeadline: new Date(entry.applicationDeadline), resultDate: new Date(entry.resultDate), year: entry.year },
      });
    }
  }

  const resourceDefs = [
    { slug: "yds-onemli-kelimeler", title: "YDS Önemli Kelimeler", description: "En sık çıkan 200 kelimelik liste.", examCode: "YDS", fileUrl: "https://example.com/placeholder.pdf" },
    { slug: "yokdil-saglik-kelimeleri", title: "YÖKDİL Sağlık Kelimeleri", description: "Sağlık bilimleri terminoloji listesi.", examCode: "YOKDIL_SAGLIK", fileUrl: "https://example.com/placeholder.pdf" },
  ];
  for (const def of resourceDefs) {
    await db.freeResource.upsert({
      where: { slug: def.slug },
      update: { title: def.title, description: def.description, examTypeId: examTypes[def.examCode].id, fileUrl: def.fileUrl },
      create: { slug: def.slug, title: def.title, description: def.description, examTypeId: examTypes[def.examCode].id, fileUrl: def.fileUrl },
    });
  }

  const ydsTopicDefs = [
    { slug: "kelime-phrasal-verb", name: "Kelime – Phrasal Verb Soruları", questionCount: 6, difficulty: "Orta" },
    { slug: "tense-preposition-dilbilgisi", name: "Tense – Preposition – Dilbilgisi Soruları", questionCount: 10, difficulty: "Zor" },
    { slug: "cloze-test", name: "Cloze Test Soruları", questionCount: 10, difficulty: "Zor" },
    { slug: "cumle-tamamlama", name: "Cümle Tamamlama Soruları", questionCount: 10, difficulty: "Orta" },
    { slug: "ceviri", name: "Çeviri Soruları", questionCount: 6, difficulty: "Zor" },
    { slug: "paragraf", name: "Paragraf Soruları", questionCount: 20, difficulty: "Orta" },
    { slug: "diyalog-tamamlama", name: "Diyalog Tamamlama Soruları", questionCount: 5, difficulty: "Kolay" },
    { slug: "yakin-anlamli-cumle", name: "Yakın Anlamlı Cümle Soruları", questionCount: 4, difficulty: "Orta" },
    { slug: "paragraf-tamamlama", name: "Paragraf Tamamlama Soruları", questionCount: 4, difficulty: "Orta" },
    { slug: "anlatim-butunlugunu-bozan-cumle", name: "Anlatım Bütünlüğünü Bozan Cümle Soruları", questionCount: 5, difficulty: "Zor" },
  ];
  const ydsExamples = {
    "kelime-phrasal-verb": [
      "Örnek soru: \"The company had to ---- its plans due to unexpected budget cuts.\"\n(A) carry out (B) scale back (C) look into (D) come across\nDoğru cevap (B) 'scale back' (küçültmek/azaltmak) — cümledeki 'budget cuts' (bütçe kesintileri) ifadesi, planların küçültülmesi gerektiğini işaret eder; diğer phrasal verb'ler bağlamla uyuşmaz.",
      "Örnek soru: \"After months of research, the scientists finally ---- a cure for the rare disease.\"\n(A) came up with (B) gave up on (C) put off (D) went along with\nDoğru cevap (A) 'came up with' (bulmak/geliştirmek) — 'after months of research... finally' ifadesi bir buluşun sonunda ortaya çıktığını gösterir; diğer seçenekler 'vazgeçmek', 'ertelemek', 'katılmak' gibi bağlamla çelişen anlamlar taşır.",
      "Örnek soru: \"The manager asked the new intern to ---- the report before the meeting starts.\"\n(A) look up (B) hand in (C) turn down (D) break down\nDoğru cevap (B) 'hand in' (teslim etmek) — cümlede raporun toplantıdan önce TESLİM EDİLMESİ isteniyor; 'look up' (araştırmak), 'turn down' (reddetmek) ve 'break down' (bozulmak/ayrıntılara ayırmak) bağlama uymaz.",
      "Örnek soru: \"Because of the heavy traffic, we had to ---- our departure until the next morning.\"\n(A) put off (B) take after (C) show off (D) look down on\nDoğru cevap (A) 'put off' (ertelemek) — 'heavy traffic' nedeniyle hareketin ERTELENMESİ gerektiği anlatılıyor; diğer phrasal verb'ler 'birine benzemek', 'gösteriş yapmak', 'küçümsemek' gibi ilgisiz anlamlar taşır.",
      "Örnek soru: \"After weeks of protests, the government finally had to ---- to the workers' demands for higher wages.\"\n(A) look down (B) come across (C) give in (D) take after\nDoğru cevap (C) 'give in' (boyun eğmek/teslim olmak) — haftalarca süren protestolardan SONRA hükümetin taleplere BOYUN EĞDİĞİ anlatılıyor; diğer seçenekler 'küçümsemek', 'rastlamak', 'birine benzemek' gibi anlamsız/ilgisiz seçeneklerdir.",
      "Örnek soru: \"The customer service department promised to ---- the complaint and get back to the client within 48 hours.\"\n(A) show off (B) hold on (C) get away (D) look into\nDoğru cevap (D) 'look into' (araştırmak/incelemek) — bir şikayetin İNCELENECEĞİ ve sonrasında müşteriye dönüş yapılacağı belirtiliyor; diğer öbekler 'gösteriş yapmak', 'beklemek', 'kaçmak' anlamındadır ve bağlamla uyuşmaz.",
      "Örnek soru: \"The larger corporation announced plans to ---- its smaller competitor next quarter.\"\n(A) look up to (B) take over (C) get along with (D) run into\nDoğru cevap (B) 'take over' (devralmak/satın almak) — büyük bir şirketin küçük rakibini DEVRALMA planı anlatılıyor; 'look up to' (saygı duymak), 'get along with' (iyi geçinmek) ve 'run into' (rastlamak) bağlama uymaz.",
      "Örnek soru: \"The peace talks between the two countries ---- after neither side was willing to compromise.\"\n(A) came up (B) went off (C) broke down (D) turned up\nDoğru cevap (C) 'broke down' (çökmek/bozulmak) — 'neither side was willing to compromise' (hiçbir taraf taviz vermek istemedi) ifadesi görüşmelerin ÇÖKTÜĞÜNÜ gösterir; diğer seçenekler 'ortaya çıkmak', 'patlamak', 'gelmek' gibi anlamlarıyla bağlama uymaz.",
      "Örnek soru: \"Since she had been away on a business trip for two weeks, she spent the whole weekend trying to ---- her emails.\"\n(A) catch up on (B) do away with (C) stand up for (D) look down on\nDoğru cevap (A) 'catch up on' (geride kalınan bir şeyi tamamlamak) — iki hafta seyahatte olan birinin BİRİKEN e-postalarını YETİŞTİRMEYE çalışması anlatılıyor; diğer öbekler 'ortadan kaldırmak', 'savunmak', 'küçümsemek' anlamındadır.",
      "Örnek soru: \"If the construction crew doesn't speed up, they will ---- time before the contractual deadline.\"\n(A) keep up with (B) put up with (C) come up against (D) run out of\nDoğru cevap (D) 'run out of' (tükenmek/kalmamak) — inşaat ekibi hızlanmazsa sözleşme süresinden ÖNCE zamanlarının TÜKENECEĞİ anlatılıyor; 'keep up with' (yetişmek), 'put up with' (katlanmak) ve 'come up against' (bir engelle karşılaşmak) bağlamla tam örtüşmez."
    ],
    "tense-preposition-dilbilgisi": [
      "Örnek soru: \"By the time the ambulance arrived, the patient ---- already ---- consciousness.\"\n(A) has / lost (B) had / lost (C) was / losing (D) will / lose\nDoğru cevap (B) 'had lost' — 'by the time' ile geçmişte bir olaydan ÖNCE tamamlanmış başka bir eylemi anlatan Past Perfect zamanı kullanılır.",
      "Örnek soru: \"She ---- as a translator ---- she graduated from university five years ago.\"\n(A) has worked / since (B) worked / for (C) is working / since (D) had worked / for\nDoğru cevap (A) 'has worked / since' — eylem geçmişte başlayıp HALEN devam ettiği için Present Perfect kullanılır; başlangıç noktasını belirten bir zaman ifadesinden önce 'since' gelir, süre ifadesinden önce ise 'for' kullanılır.",
      "Örnek soru: \"----, we ---- more than five different suppliers this year.\"\n(A) Until December / contact (B) Since December / have contacted (C) By December / will have contacted (D) During December / were contacting\nDoğru cevap (C) 'By December / will have contacted' — 'by + zaman' ifadesi gelecekte bir noktaya KADAR tamamlanmış olacak bir eylemi anlatır, bu yüzden Future Perfect ('will have + V3') gerekir.",
      "Örnek soru: \"The board holds the CEO personally responsible ---- the company's declining profits.\"\n(A) of (B) with (C) about (D) for\nDoğru cevap (D) 'for' — 'responsible' sıfatı her zaman 'for' edatıyla kullanılır ('sorumlu olmak'); diğer edatlar bu sıfatla birlikte kullanılmaz.",
      "Örnek soru: \"The new regulations ---- strictly ---- by all employees starting next month.\"\n(A) must / follow (B) must / be followed (C) have to / following (D) should / followed\nDoğru cevap (B) 'must / be followed' — kurallar çalışanlar TARAFINDAN uygulanacağı için (edilgen anlam) modal + edilgen yapı ('must be followed') gerekir.",
      "Örnek soru: \"If the manager ---- the report more carefully last week, the error ---- before the client complained.\"\n(A) reviewed / would be caught (B) had reviewed / would have been caught (C) reviews / will be caught (D) would review / was caught\nDoğru cevap (B) 'had reviewed / would have been caught' — cümle GEÇMİŞTE gerçekleşmemiş bir koşulu (Type 3 Conditional) anlatır; koşul cümlesinde Past Perfect, sonuç cümlesinde ise 'would have + V3' edilgen yapısı kullanılır.",
      "Örnek soru: \"The conference is scheduled to take place ---- the morning ---- March 14th.\"\n(A) at / on (B) on / in (C) in / on (D) in / at\nDoğru cevap (C) 'in / on' — günün bölümlerinden bahsederken 'in the morning', belirli bir tarihten bahsederken ise 'on' edatı kullanılır.",
      "Örnek soru: \"The witness told the police that she ---- the suspect near the bank an hour before the robbery ----.\"\n(A) has seen / occurs (B) saw / has occurred (C) had seen / had occurred (D) sees / occurred\nDoğru cevap (C) 'had seen / had occurred' — dolaylı anlatımda, ana cümledeki 'told' geçmiş zaman olduğu için ve tanığın gördüğü olay soygundan da ÖNCE gerçekleştiği için her iki fiil de Past Perfect'e kaydırılır.",
      "Örnek soru: \"Despite ---- for the exam for over a month, she still felt unprepared on the day.\"\n(A) studying (B) study (C) to study (D) studied\nDoğru cevap (A) 'studying' — 'despite' edatından sonra isim ya da isim-fiil (gerund) gelir, mastar veya çekimli fiil formu kullanılamaz.",
      "Örnek soru: \"It is essential that every application ---- ---- before the deadline, otherwise it ---- automatically.\"\n(A) is submitted / in / will reject (B) submits / by / rejects (C) submitted / until / is rejected (D) be submitted / before / will be rejected\nDoğru cevap (D) 'be submitted / before / will be rejected' — 'it is essential that' gibi öneri/zorunluluk bildiren yapılardan sonra Subjunctive (yalın edilgen: be + V3) kullanılır; süre sınırından ÖNCE anlamı için 'before', otomatik ret sonucu için ise gelecek zaman edilgen yapısı ('will be rejected') gerekir."
    ],
    "cloze-test": [
      "Örnek metin: \"Climate change is one of the most pressing issues of our time. ---- its causes are complex, the solutions require immediate global cooperation.\"\n(A) Although (B) Because (C) Unless (D) Since\nDoğru cevap (A) 'Although' — cümle bir ZITLIK ilişkisi kuruyor (nedenlerin karmaşık olmasına RAĞMEN çözüm gerekiyor); 'because' nedensellik, 'unless' koşul anlamı verir ve bağlama uymaz.",
      "Örnek metin: \"Solar panel costs have fallen by more than eighty percent over the past decade. ----, more households are now able to switch to renewable energy.\"\n(A) However (B) As a result (C) Although (D) Unless\nDoğru cevap (B) 'As a result' — maliyetlerin düşmesi ile hanelerin yenilenebilir enerjiye GEÇEBİLMESİ arasında bir NEDEN-SONUÇ ilişkisi vardır; diğer bağlaçlar zıtlık veya koşul anlamı taşır ve bağlama uymaz.",
      "Örnek metin: \"The expedition faced extreme weather conditions and a severe shortage of supplies. ----, the team managed to reach the summit before winter set in.\"\n(A) Because (B) Since (C) Nevertheless (D) So that\nDoğru cevap (C) 'Nevertheless' — cümle zorlu koşullara RAĞMEN başarıya ulaşıldığını anlatan bir ZITLIK ilişkisi kurar; diğer bağlaçlar nedensellik veya amaç anlamı verir.",
      "Örnek metin: \"The new policy is expected to reduce traffic congestion in the city center. ----, it will lower air pollution levels significantly.\"\n(A) Otherwise (B) Whereas (C) Even though (D) Furthermore\nDoğru cevap (D) 'Furthermore' — cümle politikanın bir faydasına EK OLARAK ikinci bir fayda sıralıyor; diğer bağlaçlar zıtlık veya koşul anlamı taşıdığı için bağlama uymaz.",
      "Örnek metin: \"Coral reefs cannot survive prolonged exposure to warmer ocean temperatures. ---- global carbon emissions are reduced soon, many reef ecosystems could disappear within decades.\"\n(A) Although (B) Unless (C) Because (D) While\nDoğru cevap (B) 'Unless' — cümle bir KOŞUL bildiriyor: emisyonlar azaltılMAZSA resiflerin yok olacağı anlatılıyor; 'unless' olumsuz koşul anlamı taşıyan tek bağlaçtır.",
      "Örnek metin: \"Many companies invested heavily in employee training last year. ----, overall productivity levels remained largely unchanged.\"\n(A) Because of this (B) In order to (C) Despite this (D) As long as\nDoğru cevap (C) 'Despite this' — şirketlerin yatırım yapmasına RAĞMEN verimliliğin değişmemesi bir ZITLIK ilişkisi kurar; diğer seçenekler nedensellik veya koşul/amaç anlamı taşır.",
      "Örnek metin: \"The survey revealed that most employees felt overworked and undervalued. ----, the management decided to revise the company's workload policy.\"\n(A) Otherwise (B) Although (C) Whereas (D) Therefore\nDoğru cevap (D) 'Therefore' — anket sonuçları (sebep) ile politika değişikliği (sonuç) arasında bir NEDEN-SONUÇ ilişkisi vardır; diğer bağlaçlar bu ilişkiyi ifade etmez.",
      "Örnek metin: \"---- some economists predict a swift recovery, others warn that the effects of the recession could last for several more years.\"\n(A) Because (B) While (C) So that (D) As a result\nDoğru cevap (B) 'While' — cümle iki farklı görüş arasında bir KARŞITLIK kuruyor (bazı ekonomistler / diğerleri); 'while' bu tür eşzamanlı zıtlıkları ifade etmek için kullanılır.",
      "Örnek metin: \"Cognitive load refers to the amount of mental effort being used in the working memory. ----, when a task requires too much simultaneous processing, performance tends to decline.\"\n(A) On the contrary (B) Even so (C) In other words (D) In case\nDoğru cevap (C) 'In other words' — ikinci cümle, ilk cümledeki soyut tanımı daha somut bir şekilde YENİDEN İFADE ediyor; bu ilişkiyi kuran bağlaç 'in other words'tür.",
      "Örnek metin: \"The startup can secure the additional funding round ---- it demonstrates consistent revenue growth over the next two quarters.\"\n(A) provided that (B) even though (C) in spite of (D) as though\nDoğru cevap (A) 'provided that' — cümle finansmanın belirli bir KOŞULA bağlı olduğunu anlatıyor ('eğer... ise'); diğer bağlaçlar zıtlık veya varsayım anlamı taşır ve bağlama uymaz."
    ],
    "cumle-tamamlama": [
      "Örnek soru: \"Although the negotiations lasted for several hours, ----.\"\n(A) the two sides reached an agreement (B) no progress was made (C) it was a sunny day (D) the meeting room was small\nDoğru cevap, cümledeki 'although' (rağmen) bağlacıyla uyumlu bir ZITLIK içeren (B) 'no progress was made' olur.",
      "Örnek soru: \"As soon as the manager approved the budget, ----.\"\n(A) the project had been cancelled (B) the team started ordering the equipment (C) nobody noticed the mistake (D) the weather turned cold\nDoğru cevap (B) 'the team started ordering the equipment' — 'as soon as' (yapar yapmaz) bir eylemin hemen ARDINDAN başka bir eylemin gerçekleştiğini belirtir; bütçe onaylandıktan hemen sonra mantıklı bir sonraki adım ekipman siparişidir.",
      "Örnek soru: \"The teacher repeated the instructions twice ----.\"\n(A) although nobody was listening (B) because the bell had already rung (C) so that every student would understand them clearly (D) even though the lesson was over\nDoğru cevap (C) 'so that every student would understand them clearly' — 'so that' (amaç bildiren bağlaç) öğretmenin talimatları tekrarlamasının AMACINI açıklar; diğer seçenekler amaç değil zıtlık veya neden bildirir ve bağlamla çelişir.",
      "Örnek soru: \"----, the flight will be delayed by at least two hours.\"\n(A) Since the storm has already passed (B) Although the storm is over (C) Because the sky is clear (D) Unless the storm passes before midnight\nDoğru cevap (D) 'Unless the storm passes before midnight' — cümle bir KOŞULA bağlı bir gecikmeyi anlatıyor; fırtına GEÇMEZSE uçuşun gecikeceği mantığı yalnızca 'unless' ile kurulabilir, diğer seçenekler fırtınanın zaten geçtiğini varsayarak çelişki yaratır.",
      "Örnek soru: \"No sooner had the CEO announced the layoffs ----.\"\n(A) than the company's stock price began to fall (B) when the employees celebrated (C) than she regretted her decision instantly, before the investors reacted (D) the shareholders were pleased\nDoğru cevap (A) 'than the company's stock price began to fall' — 'no sooner... than' yapısı bir eylemin hemen ARDINDAN başka bir eylemin geldiğini anlatır ve devrik yapıdan sonra mutlaka 'than' bağlacı gelmelidir; bu nedenle mantıksal olarak tutarsız seçenekler elenir.",
      "Örnek soru: \"Even though the restaurant had received poor reviews online, ----.\"\n(A) it closed down within a month (B) it was fully booked every weekend (C) nobody wanted to eat there (D) the owners decided to shut it permanently\nDoğru cevap (B) 'it was fully booked every weekend' — 'even though' (kötü yorumlara RAĞMEN) bir ZITLIK kurar; olumsuz yorumlara rağmen beklenmedik şekilde OLUMLU bir durumun (dolu rezervasyon) yaşandığını belirten tek seçenek (B)'dir.",
      "Örnek soru: \"The bank agreed to extend the loan ----.\"\n(A) although the company had already repaid it (B) because the company refused to cooperate (C) provided that the company submitted updated financial statements (D) unless the company was profitable\nDoğru cevap (C) 'provided that the company submitted updated financial statements' — 'provided that' (şu şartla ki) bankanın kredi uzatmasının KOŞULUNU belirtir; diğer seçenekler mantıksal olarak cümleyle çelişir ya da anlamsızdır.",
      "Örnek soru: \"The organizers printed extra programs ----.\"\n(A) so that fewer guests would attend (B) although no one attended the event (C) because the printer was broken (D) in case more guests than expected showed up\nDoğru cevap (D) 'in case more guests than expected showed up' — 'in case' (ihtimale karşı) organizatörlerin önlem alma NEDENİNİ açıklar; diğer seçenekler mantıksal tutarlılık taşımaz.",
      "Örnek soru: \"The lecture was such a complex one ----.\"\n(A) that even the top students struggled to follow it (B) although everyone understood it easily (C) because the professor cancelled it (D) so no one attended the class\nDoğru cevap (A) 'that even the top students struggled to follow it' — 'such a + sıfat + isim... that' yapısı bir SONUÇ cümlesiyle tamamlanır; dersin karmaşıklığının doğal sonucu, en başarılı öğrencilerin bile zorlanmasıdır.",
      "Örnek soru: \"The new manager not only reorganized the entire department ----.\"\n(A) although productivity declined sharply (B) because the staff resigned immediately (C) but also improved employee morale within weeks (D) unless the results were disappointing\nDoğru cevap (C) 'but also improved employee morale within weeks' — 'not only... but also' yapısı iki OLUMLU/PARALEL eylemi birbirine bağlar; cümlenin ilk kısmındaki yapıcı eylemle uyumlu tek tamamlayıcı (C)'dir."
    ],
    ceviri: [
      "Örnek çeviri sorusu: \"Bilim insanları, yeni keşfedilen bu türün nesli tükenmekte olan hayvanlar listesine alınması gerektiğini savunuyor.\"\n→ \"Scientists argue that this newly discovered species should be added to the list of endangered animals.\"\nBu örnekte 'nesli tükenmekte olan' (endangered), 'savunmak' (argue) gibi akademik terimlerin doğru İngilizce karşılıklarını bilmek kilit önemdedir.",
      "Örnek çeviri sorusu: \"Araştırmacılar, düzenli egzersizin sadece fiziksel sağlığı değil, aynı zamanda zihinsel sağlığı da olumlu yönde etkilediğini ortaya koymuştur.\"\n→ \"Researchers have shown that regular exercise has a positive effect not only on physical health but also on mental health.\"\n'Ortaya koymak' (to show/demonstrate) ve 'sadece... değil, aynı zamanda...' yapısının İngilizce karşılığı olan 'not only... but also...' kalıbını doğru kullanmak cümlenin akıcılığı için önemlidir.",
      "Örnek çeviri sorusu: \"Hükümet, artan enflasyonla mücadele etmek amacıyla yeni ekonomik önlemler açıkladı.\"\n→ \"The government announced new economic measures in order to combat rising inflation.\"\n'Mücadele etmek' (to combat/tackle) ve 'amacıyla' (in order to) gibi amaç bildiren yapıların doğru İngilizce karşılıklarını bilmek, cümlenin anlamını bozmadan aktarmak için gereklidir.",
      "Örnek çeviri sorusu: \"Geçen yıl inşa edilen köprü, bölgedeki ulaşım sorununu büyük ölçüde çözmüştür.\"\n→ \"The bridge that was built last year has largely solved the transportation problem in the region.\"\n'İnşa edilen' edilgen yapılı sıfat-fiil öbeği 'that was built' ilgi cümleciğine, 'büyük ölçüde' zarfı ise 'largely/to a great extent' ifadesine karşılık gelir.",
      "Örnek çeviri sorusu: \"Uzmanlara göre, sosyal medyanın aşırı kullanımı gençler arasında kaygı düzeyini artırabilir.\"\n→ \"According to experts, excessive use of social media may increase anxiety levels among young people.\"\n'Uzmanlara göre' (according to experts), 'aşırı kullanım' (excessive use), 'kaygı düzeyi' (anxiety levels) gibi ifadelerin doğru terminolojik karşılıklarını bilmek bu tür sorularda kritik önem taşır.",
      "Örnek çeviri sorusu: \"Eğer küresel sıcaklıklar bu hızla artmaya devam ederse, birçok kıyı şehri gelecek yüzyılda su altında kalabilir.\"\n→ \"If global temperatures continue to rise at this rate, many coastal cities may be submerged within the next century.\"\n'Bu hızla' (at this rate) ve 'su altında kalmak' (to be submerged) gibi mecazi/teknik ifadelerin İngilizce'de doğal karşılıklarını bulmak, birebir çeviriden kaçınmayı gerektirir.",
      "Örnek çeviri sorusu: \"Şirket, müşteri memnuniyetini artırmak için yapay zeka destekli bir müşteri hizmetleri sistemi geliştirdi.\"\n→ \"The company developed an AI-powered customer service system to increase customer satisfaction.\"\n'Yapay zeka destekli' (AI-powered) ve 'müşteri memnuniyeti' (customer satisfaction) gibi güncel teknoloji terimlerinin doğru çevirisi bu tür cümlelerde belirleyicidir.",
      "Örnek çeviri sorusu: \"Bilim insanlarının onlarca yıldır araştırdığı bu hastalığın tedavisi, nihayet klinik deneylerde başarıyla test edildi.\"\n→ \"The treatment for this disease, which scientists have been researching for decades, has finally been successfully tested in clinical trials.\"\n'Onlarca yıldır araştırdığı' ifadesi İngilizce'de Present Perfect Continuous ('have been researching') ile ilgi cümleciği içinde aktarılır; 'nihayet' (finally) ve 'başarıyla test edildi' (has been successfully tested) edilgen yapıya dikkat gerektirir.",
      "Örnek çeviri sorusu: \"Öğrenciler, sınav sonuçlarının beklenenden daha geç açıklanmasından dolayı hayal kırıklığına uğradılar.\"\n→ \"The students were disappointed because the exam results were announced later than expected.\"\n'Hayal kırıklığına uğramak' (to be disappointed) ve '-dan dolayı' (because) gibi neden-sonuç bağlantılarının doğru aktarılması, cümlenin anlamsal bütünlüğü için gereklidir.",
      "Örnek çeviri sorusu: \"Küreselleşmenin getirdiği ekonomik fırsatlara rağmen, gelir eşitsizliğinin birçok ülkede giderek derinleştiği gözlemlenmektedir.\"\n→ \"Despite the economic opportunities brought about by globalization, it is observed that income inequality is deepening in many countries.\"\n'Rağmen' (despite) ve 'gözlemlenmektedir' gibi edilgen ve resmi/akademik ifadelerin ('it is observed that') İngilizce'ye doğru aktarılması, akademik çeviri sorularında sıkça test edilen bir beceridir."
    ],
    paragraf: [
      "Örnek soru tipi: Kısa bir paragraf okunur (örn. bir bilimsel keşfin tarihçesi) ve ardından 'Paragrafa göre aşağıdakilerden hangisi doğrudur/çıkarılabilir?' şeklinde bir soru sorulur. Paragrafta 'the discovery was initially met with skepticism but later confirmed by independent researchers' cümlesi geçiyorsa, doğru cevap keşfin ÖNCE şüpheyle karşılandığını ama SONRA doğrulandığını yansıtan seçenek olmalıdır.",
      "Örnek soru tipi: Bir paragrafta bir şehrin toplu taşıma sisteminin tarihsel gelişimi anlatılır ve 'Yazara göre, toplu taşımadaki en büyük değişim ne zaman gerçekleşmiştir?' sorusu sorulur. Paragrafta 'the most transformative shift occurred not with the introduction of the subway, but with the later integration of a unified payment system across all lines' cümlesi varsa, doğru cevap dönüşümün metronun açılmasıyla değil, ödeme sisteminin birleştirilmesiyle geldiğini yansıtan seçenek olmalıdır.",
      "Örnek soru tipi: Paragrafta bir şirketin başarısızlıktan nasıl toparlandığı anlatılır ve 'Paragrafın ana fikri aşağıdakilerden hangisidir?' diye sorulur. Paragrafın büyük kısmı şirketin karşılaştığı krizlere ayrılmış olsa da, son cümlede 'ultimately, it was the company's willingness to adapt its business model that ensured its survival' deniyorsa, doğru cevap krizlerin detayı değil, ADAPTASYONUN ÖNEMİNİ vurgulayan seçenek olmalıdır — ana fikir genellikle paragrafın sonundaki genelleme cümlesinde saklıdır.",
      "Örnek soru tipi: Paragrafta bir hayvan türünün göç davranışı anlatılır ve 'Paragraftan aşağıdakilerden hangisi çıkarılabilir?' sorusu sorulur. Metinde açıkça belirtilmese de, 'individuals that migrated in larger groups had significantly higher survival rates than those that traveled alone' cümlesinden, GRUP HALİNDE GÖÇ ETMENİN bir hayatta kalma avantajı sağladığı çıkarılabilir; bu tür sorularda metinde birebir yazmayan ama mantıksal olarak desteklenen seçenek doğru cevaptır.",
      "Örnek soru tipi: Paragrafta yeni bir teknolojinin hem faydaları hem riskleri tartışılır ve 'Yazarın konuya karşı tutumu nasıldır?' sorusu sorulur. Metin boyunca hem 'promising applications' hem de 'serious ethical concerns' ifadeleri dengeli şekilde kullanılıyorsa, doğru cevap yazarın TARAFSIZ/İHTİYATLI bir tutum sergilediğini belirten seçenek olmalıdır; aşırı olumlu veya aşırı olumsuz seçenekler yanıltıcıdır.",
      "Örnek soru tipi: Paragrafta geçen 'the phenomenon remained largely unnoticed until recent advances in imaging technology brought it to light' cümlesindeki 'brought it to light' ifadesinin paragraftaki anlamı sorulur. Cümle bağlamında bu ifade, önceden fark edilmeyen bir olgunun teknolojik gelişmelerle ORTAYA ÇIKARILDIĞINI anlatır; doğru cevap 'revealed/discovered' anlamına gelen seçenek olmalıdır.",
      "Örnek soru tipi: Paragrafta bir gölün su seviyesindeki azalmanın nedenleri sıralanır ve 'Paragrafa göre göldeki su azalmasının ana nedeni nedir?' sorusu sorulur. Paragrafta birden fazla neden sayılsa da 'while agricultural runoff and tourism have contributed, the primary driver has been decades of below-average rainfall' cümlesi geçiyorsa, doğru cevap YAĞIŞ AZLIĞINI ana neden olarak belirten seçenek olmalıdır; diğer nedenler yardımcı faktör olarak sunulmuştur.",
      "Örnek soru tipi: Paragrafta iki farklı eğitim modeli karşılaştırılır ve 'Paragrafa göre, geleneksel model ile yeni model arasındaki temel fark nedir?' sorusu sorulur. Metinde 'unlike the traditional model, which emphasizes standardized testing, the new approach prioritizes project-based assessment' cümlesi varsa, doğru cevap standart sınavlar ile proje tabanlı değerlendirme arasındaki karşıtlığı doğru yansıtan seçenek olmalıdır.",
      "Örnek soru tipi: Kısa bir paragrafta yazarın belirli istatistikler sunarak bir iddiayı desteklediği görülür ve 'Yazar bu paragrafı hangi amaçla yazmıştır?' sorusu sorulur. Paragraf boyunca sayısal veriler bir iddiayı DESTEKLEMEK için kullanıldığından, doğru cevap yazarın amacının bir görüşü kanıtlarla desteklemek olduğunu belirten seçenek olmalıdır; sadece 'bilgi vermek' ya da 'eğlendirmek' gibi genel seçenekler yanlış olur.",
      "Örnek soru tipi: Paragrafta bir bulaşıcı hastalığın önlenmesi için alınan dört farklı önlemden bahsedilir ve 'Aşağıdakilerden hangisi paragrafta bahsedilen önlemlerden biri DEĞİLDİR?' sorusu sorulur. Bu tür sorularda dört seçenekten üçü metinde açıkça geçen önlemlerle eşleşirken, doğru cevap metinde hiç geçmeyen veya metinle çelişen tek seçenek olur; metni satır satır seçeneklerle karşılaştırmak bu soru tipinde en güvenilir stratejidir."
    ],
    "diyalog-tamamlama": [
      "Örnek soru: \"A: I heard you're moving to a new city for your job. B: Yes, ----. A: That must be exciting but also a bit stressful.\"\n(A) I can't wait to get started (B) I don't have a job (C) the weather is nice there (D) I already live there\nDoğru cevap (A) — B'nin cevabı, A'nın taşınma haberine ve sonraki 'exciting but stressful' yorumuna mantıklı bir şekilde bağlanmalıdır.",
      "Örnek soru: \"A: Could you help me carry these boxes upstairs? B: ----. A: Thanks, I really appreciate it.\"\n(A) I'm afraid I can't right now (B) Sure, no problem at all (C) I already carried them yesterday (D) The boxes are too heavy for me\nDoğru cevap (B) 'Sure, no problem at all' — A'nın teşekkür etmesi ('Thanks, I really appreciate it'), B'nin yardım teklifini KABUL ETTİĞİNİ gösterir; bu nedenle olumlu bir yanıt gerekir.",
      "Örnek soru: \"A: I can't believe I forgot my presentation at home! B: ----. A: You're right, I'll email it to myself right now.\"\n(A) Don't worry, you can just email it to the office (B) That's a great presentation (C) I forgot mine too, once (D) The meeting was cancelled anyway\nDoğru cevap (A) — A'nın 'I'll email it to myself right now' şeklindeki tepkisi, B'nin önerdiği ÇÖZÜMÜ (e-posta ile göndermeyi) kabul ettiğini gösterir; bu nedenle B'nin cevabı bu çözümü öneren seçenek olmalıdır.",
      "Örnek soru: \"A: Do you think it's a good idea to invest in the stock market right now? B: ----. A: I see your point, maybe I should wait a bit longer.\"\n(A) Absolutely, now is the perfect time (B) I have never invested in anything (C) I don't understand what stocks are (D) The market has been quite unpredictable lately\nDoğru cevap (D) 'The market has been quite unpredictable lately' — A'nın cevabı ('maybe I should wait a bit longer') B'nin TEDBİRLİ/OLUMSUZ bir uyarı yaptığını gösterir; bu nedenle net bir 'evet' ya da konudan tamamen kopuk bir cevap bağlama uymaz.",
      "Örnek soru: \"A: I heard the new café downtown has amazing coffee. B: ----. A: Great, let's go there this weekend then.\"\n(A) I've never liked coffee, to be honest (B) The café closed down last month (C) I don't know where downtown is (D) Yes, I tried it last week and loved it\nDoğru cevap (D) 'Yes, I tried it last week and loved it' — A'nın 'Great, let's go there' tepkisi, B'nin kafeyi OLUMLU bir şekilde ONAYLADIĞINI gösterir; diğer seçenekler bu olumlu devam cümlesiyle çelişir.",
      "Örnek soru: \"A: Why didn't you attend the meeting yesterday? B: ----. A: Oh, I hope you're feeling better now.\"\n(A) I was stuck in traffic for hours (B) I forgot about it completely (C) I wasn't feeling well (D) I didn't think it was important\nDoğru cevap (C) 'I wasn't feeling well' — A'nın 'I hope you're feeling better' cevabı, B'nin bir SAĞLIK sorunundan bahsettiğini gösterir; bu nedenle sadece hastalıkla ilgili seçenek bağlama uyar.",
      "Örnek soru: \"A: I'm thinking of quitting my job to start my own business. B: ----. A: I know it's risky, but I've saved enough to get started.\"\n(A) That sounds like a big decision, are you sure you're ready? (B) I'm sure your boss will be happy to hear that (C) Congratulations on your promotion (D) I didn't know you had a job\nDoğru cevap (A) — A'nın 'I know it's risky' şeklindeki cevabı, B'nin bu kararla ilgili bir ENDİŞE/SORU dile getirdiğini gösterir; bu nedenle B'nin cevabı riski sorgulayan bir ifade olmalıdır.",
      "Örnek soru: \"A: This restaurant is much more expensive than I expected. B: ----. A: In that case, let's just order appetizers.\"\n(A) Yes, but the portions are quite large (B) I love the decoration here (C) The service is very slow tonight (D) I already paid the bill\nDoğru cevap (A) 'Yes, but the portions are quite large' — A'nın 'let's just order appetizers' önerisi, fiyatların yüksek olduğu konusunda bir UZLAŞMA arandığını gösterir; B'nin cevabı bu duruma bir gerekçe (porsiyonların büyük olması) sunarak tutarlı bir geçiş sağlar.",
      "Örnek soru: \"A: We really need the shipment to arrive by Friday. B: ----. A: I understand, but is there any way to expedite it?\"\n(A) That should be possible with our standard delivery (B) The shipment already arrived yesterday (C) I'm afraid our earliest delivery date is next Tuesday (D) We don't ship internationally\nDoğru cevap (C) 'I'm afraid our earliest delivery date is next Tuesday' — A'nın 'is there any way to expedite it?' sorusu, B'nin önceki cevabında bir GECİKME/SORUN belirttiğini gösterir; bu nedenle teslim tarihinin istenenden GEÇ olduğunu belirten seçenek doğrudur.",
      "Örnek soru: \"A: How was the flight? B: ----. A: Oh no, I'm sorry to hear that. At least you're finally home.\"\n(A) It was smooth and relaxing (B) We landed three hours late and lost my luggage (C) I love flying long distances (D) The flight was cancelled before it started, so I never boarded\nDoğru cevap (B) 'We landed three hours late and lost my luggage' — A'nın 'I'm sorry to hear that... at least you're finally home' cevabı, B'nin olumsuz ve uzun bir deneyim yaşadığını ama sonunda eve VARDIĞINI gösterir; (D) ise hiç uçuşun gerçekleşmediğini ima ettiği için 'finally home' ifadesiyle çelişir."
    ],
    "yakin-anlamli-cumle": [
      "Örnek soru: \"Despite his lack of experience, he managed to complete the project successfully.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"Although he was not experienced, he still completed the project successfully.\" — 'despite' ve 'although' aynı zıtlık ilişkisini farklı yapılarla ifade eder, cümlenin temel anlamı korunur.",
      "Örnek soru: \"The negotiations were called off at the last minute due to unresolved disagreements.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"The talks were cancelled just before they were due to end because certain issues had not been settled.\" — 'called off' (iptal edilmek) ve 'unresolved disagreements' (çözülmemiş anlaşmazlıklar) ifadeleri, hedef cümlede eşdeğer sözcüklerle korunmuştur.",
      "Örnek soru: \"It is highly unlikely that the committee will approve the proposal without further revisions.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"The committee will almost certainly reject the proposal unless it is revised further.\" — 'highly unlikely... without' yapısı, 'almost certainly reject unless' ifadesiyle aynı olasılık derecesini korur.",
      "Örnek soru: \"No matter how hard she tried, she could not convince her colleagues to adopt the new system.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"Despite her best efforts, she failed to persuade her colleagues to accept the new system.\" — 'no matter how hard she tried' ifadesi 'despite her best efforts' ile, 'could not convince' ise 'failed to persuade' ile eşdeğerdir.",
      "Örnek soru: \"The company's profits have increased steadily since it launched its online store.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"Ever since the online store was launched, the company's profits have been rising consistently.\" — 'since it launched' ile 'ever since... was launched' aynı zaman ilişkisini korur; 'increased steadily' ve 'rising consistently' eşanlamlı ifadelerdir.",
      "Örnek soru: \"The findings of the study suggest that sleep deprivation has a detrimental effect on decision-making.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"According to the study's findings, a lack of sleep negatively affects the ability to make decisions.\" — 'sleep deprivation' ile 'a lack of sleep', 'detrimental effect on' ile 'negatively affects' eşdeğer anlam taşır.",
      "Örnek soru: \"Unless the government intervenes soon, the crisis is likely to worsen significantly.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"If the government does not take action soon, the crisis will probably get much worse.\" — 'unless... intervenes' ile 'if... does not take action', 'worsen significantly' ile 'get much worse' anlamca örtüşür.",
      "Örnek soru: \"Although the museum's new exhibit received mixed reviews, attendance numbers have remained high.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"Even though critics were divided about the new exhibit, the museum has continued to attract large numbers of visitors.\" — 'mixed reviews' ifadesi 'critics were divided' ile, 'attendance numbers have remained high' ise 'continued to attract large numbers of visitors' ile aynı anlamı taşır; ZITLIK ilişkisinin ('although/even though') korunması önemlidir.",
      "Örnek soru: \"The new regulation requires all manufacturers to disclose the full list of ingredients used in their products.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"Under the new regulation, manufacturers are obliged to reveal every ingredient contained in their products.\" — 'requires... to disclose' ile 'are obliged to reveal' aynı zorunluluk anlamını taşır.",
      "Örnek soru: \"Had the engineers detected the structural flaw earlier, the collapse could have been prevented.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"If the engineers had noticed the structural flaw sooner, the collapse would not have happened.\" — cümle geçmişte gerçekleşmemiş bir koşulu (Type 3 Conditional, devrik yapı 'Had the engineers detected...') anlatır; hedef cümle aynı zaman ve koşul ilişkisini standart 'if' yapısıyla korumalıdır."
    ],
    "paragraf-tamamlama": [
      "Örnek: Bir paragrafın ortasında bir cümle eksik bırakılmıştır; paragrafın öncesi teknolojinin eğitimdeki olumlu etkilerinden, sonrası ise bunun getirdiği zorluklardan bahsediyorsa, doğru tamamlayıcı cümle bu iki fikir arasında bir GEÇİŞ sağlamalıdır (örn. \"However, this rapid adoption of technology has not been without its challenges.\").",
      "Örnek: Bir paragrafın başında bir şehrin nüfus artışından, ortasından itibaren ise bu artışın yarattığı konut sıkıntısından bahsedilmektedir; ancak bu iki fikir arasındaki geçiş cümlesi eksiktir. Doğru tamamlayıcı cümle nüfus artışını konut sorunuyla ilişkilendiren bir GEÇİŞ sağlamalıdır (örn. \"This rapid population growth has, in turn, placed enormous pressure on the city's already limited housing supply.\").",
      "Örnek: Bir paragrafta önce bir şirketin yıllar içindeki başarılarından bahsedilir, ardından son bölümde karşılaştığı ciddi bir skandaldan söz edilir; ancak aradaki cümle eksiktir. Doğru cümle, önceki başarılı imajdan SONRAKİ olumsuz gelişmeye doğal bir GEÇİŞ yapmalıdır (örn. \"However, this reputation for excellence was seriously damaged when the scandal came to light.\").",
      "Örnek: Bir paragrafta bir nehrin kirlilik seviyesindeki artıştan bahsedilir, hemen ardından ise balık popülasyonundaki keskin düşüşten söz edilir; ancak aralarındaki NEDEN-SONUÇ cümlesi eksiktir. Doğru tamamlayıcı cümle kirliliği balık ölümlerine bağlamalıdır (örn. \"As a direct result, the levels of dissolved oxygen in the water dropped sharply, making survival difficult for most fish species.\").",
      "Örnek: Bir paragrafın giriş cümlesi genel bir iddiayı ortaya koyar (örn. bilgisayar oyunlarının bilişsel becerileri geliştirebileceği), ancak bu iddiayı destekleyecek somut kanıt cümlesi eksiktir. Doğru tamamlayıcı cümle iddiaya somut bir KANIT/ÖRNEK sunmalıdır (örn. \"For instance, a recent study found that players who regularly engaged in strategy games showed measurable improvements in problem-solving speed.\").",
      "Örnek: Bir paragrafta önce yenilenebilir enerjinin avantajları uzun uzun anlatılır, ancak paragrafın sonunda konuya dengeli bir bakış açısı katan bir cümle eksiktir. Doğru tamamlayıcı cümle bir KARŞIT görüşü ya da SINIRLILIĞI tanıtmalıdır (örn. \"Nevertheless, the high initial cost of installation remains a significant barrier for many households.\").",
      "Örnek: Bir paragrafta bir tarihi olayın kronolojik anlatımı verilir; olayların ortasında beklenmedik bir gelişmeyi tanıtan cümle eksiktir. Doğru tamamlayıcı cümle önceki durumu ters yüz eden bir GELİŞMEYİ tanıtmalıdır (örn. \"Unexpectedly, a sudden shift in public opinion forced the government to abandon the policy altogether.\").",
      "Örnek: Bir paragrafta karmaşık bir bilimsel terim (örn. 'epigenetics') ilk kez kullanılır, ancak okuyucunun terimi anlaması için gereken tanım cümlesi eksiktir. Doğru tamamlayıcı cümle terimi AÇIKLAYAN/TANIMLAYAN bir cümle olmalıdır (örn. \"In simple terms, this refers to changes in gene activity that do not involve alterations to the underlying DNA sequence.\").",
      "Örnek: Bir paragrafta bir şirketin müşteri şikayetlerindeki artıştan bahsedilir, paragrafın sonunda ise şirketin aldığı önlemlerden söz edilir; ancak aradaki SONUÇ cümlesi eksiktir. Doğru tamamlayıcı cümle şikayetlerin şirketi harekete GEÇİRDİĞİNİ belirtmelidir (örn. \"Faced with mounting complaints, the company was compelled to overhaul its entire customer service process.\").",
      "Örnek: Bir paragrafta bir araştırmanın farklı bulguları sırayla sunulur, ancak paragrafın sonunda tüm bulguları bir araya getiren bir SONUÇ cümlesi eksiktir. Doğru tamamlayıcı cümle, önceki bulguların tümünü kapsayan bir GENELLEME yapmalıdır (örn. \"Taken together, these findings suggest that early intervention plays a far greater role in long-term recovery than previously assumed.\")."
    ],
    "anlatim-butunlugunu-bozan-cumle": [
      "Örnek paragraf: (1) Bees play a crucial role in pollinating crops worldwide. (2) Their population has been declining due to pesticide use and habitat loss. (3) Many people keep bees as a hobby in their backyards. (4) Scientists warn that this decline could have severe consequences for global food security.\nCümle (3), paragrafın ana konusu olan 'arı popülasyonundaki azalma ve sonuçları' ile ilgisiz, konu dışı bir bilgi içerdiği için anlatım bütünlüğünü bozar ve çıkarılmalıdır.",
      "Örnek paragraf: (1) The Amazon rainforest produces approximately twenty percent of the world's oxygen. (2) It is also home to millions of species of plants and animals found nowhere else on Earth. (3) Brazil is the largest country in South America by both area and population. (4) Deforestation in the region threatens this delicate and irreplaceable ecosystem.\nCümle (3), paragrafın ana konusu olan 'Amazon yağmur ormanının önemi ve tehdit altında olması' ile ilgisiz, Brezilya'nın coğrafi büyüklüğüyle ilgili konu dışı bir bilgi içerdiği için anlatım bütünlüğünü bozar ve çıkarılmalıdır.",
      "Örnek paragraf: (1) Remote work has become increasingly common since the pandemic began. (2) Many employees report higher job satisfaction when given the flexibility to work from home. (3) Video conferencing software has improved dramatically over the past few years. (4) However, some managers worry that remote work reduces team collaboration and creativity.\nCümle (3), paragrafın ana konusu olan 'uzaktan çalışmanın çalışan memnuniyeti ve ekip iş birliği üzerindeki etkileri' ile doğrudan ilgili olmayıp, video konferans yazılımının teknik gelişimine odaklandığı için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) The human brain continues to develop well into a person's mid-twenties. (2) The prefrontal cortex, responsible for decision-making and impulse control, is among the last regions to fully mature. (3) Many people choose to pursue graduate degrees in their mid-twenties. (4) This delayed development helps explain why adolescents are often more prone to risk-taking behavior.\nCümle (3), paragrafın odağı olan 'beynin gelişimi ve bunun davranışlara etkisi' konusuyla ilgisiz, kişisel eğitim tercihleri hakkında konu dışı bir bilgi sunduğu için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Honeybee populations have declined sharply over the past two decades. (2) Pesticide exposure and habitat loss are considered the primary causes of this decline. (3) Honey has been used as a natural sweetener and remedy for thousands of years. (4) Without bees to pollinate crops, global food production could face serious disruptions.\nCümle (3), paragrafın odağı olan 'arı popülasyonundaki azalma ve bunun sonuçları' ile ilgisiz, balın tarihsel kullanımına dair konu dışı bir bilgi içerdiği için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Electric vehicles are rapidly gaining popularity among urban commuters. (2) Governments in several countries now offer tax incentives to encourage their adoption. (3) The first electric cars were actually developed in the late nineteenth century. (4) As charging infrastructure continues to expand, this trend is expected to accelerate further.\nCümle (3), paragrafın odağı olan elektrikli araçların GÜNÜMÜZDEKİ yaygınlaşması ile ilgili olmayıp, konunun TARİHSEL kökenine değindiği için (paragrafın zaman odağıyla uyuşmadığı için) anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Sleep plays a critical role in consolidating memories formed during the day. (2) Studies show that students who sleep well before an exam perform better than those who pull all-nighters. (3) Caffeine is one of the most widely consumed substances in the world. (4) Experts therefore recommend prioritizing consistent sleep schedules during exam periods.\nCümle (3), paragrafın odağı olan 'uykunun hafıza ve sınav performansı üzerindeki etkisi' ile ilgisiz, kafein tüketimi hakkında konu dışı bir bilgi içerdiği için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) The novel was praised by critics for its innovative narrative structure. (2) It shifts between three different narrators, each offering a distinct perspective on the same events. (3) The author had previously worked as a journalist for over a decade. (4) This layered storytelling technique allows readers to piece together the full picture gradually.\nCümle (3), paragrafın odağı olan 'romanın anlatım tekniği' ile ilgisiz, yazarın önceki mesleki geçmişine dair konu dışı bir bilgi sunduğu için anlatım bütünlüğünü bozar; bu tür sorularda yazarla ilgili biyografik ayrıntılar sıkça dikkat dağıtıcı olarak kullanılır.",
      "Örnek paragraf: (1) The city council approved a plan to expand the public bicycle-sharing program. (2) Officials hope the initiative will reduce traffic congestion and lower carbon emissions. (3) Bicycle helmets significantly reduce the risk of head injury in accidents. (4) The program is expected to add over two thousand new bicycles across the city by next year.\nCümle (3), paragrafın odağı olan 'bisiklet paylaşım programının genişletilmesi' ile ilgisiz, bisiklet kasklarının güvenlik faydalarına dair genel bir bilgi içerdiği için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Museums around the world have begun digitizing their collections to improve accessibility. (2) This process allows researchers and the public to view rare artifacts without physically visiting the museum. (3) Some museums also offer virtual reality tours of their galleries. (4) Ticket prices for major museums have risen considerably over the past decade.\nCümle (4), paragrafın odağı olan 'müzelerin koleksiyonlarını dijitalleştirerek erişilebilirliği artırması' ile ilgisiz, bilet fiyatlarındaki artış gibi FARKLI bir konuya (finansal erişilebilirlik) değindiği için anlatım bütünlüğünü bozar; cümle (3) ise dijitalleşme temasıyla hâlâ ilişkili olduğundan yanıltıcı bir seçenek olarak düşünülebilir ama doğru cevap değildir."
    ]
  };

  const phrasalVerbIntro =
    'Phrasal verb (deyimsel fiil), bir fiil ile "up, on, in, out, down, through, over" gibi bir veya birden fazla particle\'ın (edat/zarf) birleşmesiyle oluşur ve çoğu zaman kendisini oluşturan fiilden tamamen farklı bir anlam kazanır. Örneğin "look" (bakmak) fiili tek başınayken, "look after" (ilgilenmek), "look into" (araştırmak) ve "look down on" (küçümsemek) particle\'larla tamamen farklı anlamlara bürünür. YDS\'de bu konudan ortalama 6 soru gelir ve genellikle bir cümledeki boşluğa anlamca uygun phrasal verb\'ün seçilmesi istenir.\n\n' +
    "Geçişli mi, geçişsiz mi?\nPhrasal verb'ler nesne alıp almamasına göre ikiye ayrılır. \"Grow up\" (büyümek) fiiline \"onu büyümek\" diyemediğimiz için bu geçişsiz (intransitive) bir phrasal verb'dür ve nesne almaz. \"Look for\" (aramak) fiiline ise \"onu ararız\" diyebildiğimiz için bu geçişli (transitive) bir phrasal verb'dür ve mutlaka bir nesne ister. Geçişli phrasal verb'lerin bir kısmı ayrılabilir (separable): nesne fiil ile particle arasına girebilir (\"turn off the radio\" / \"turn the radio off\"). Bir kısmı ise ayrılamaz (inseparable): nesne her zaman particle'dan sonra gelir (\"look after my dog\" doğrudur, \"look my dog after\" denemez).\n\n" +
    "Particle'ın anlamı tamamen rastgele değildir\nYDS'de karşınıza çıkan bir phrasal verb'ün tam anlamını bilmeseniz bile, particle'ın kattığı genel anlam yönünü bilmek doğru seçeneğe ulaşmanızı kolaylaştırabilir:\n" +
    "• ON: temas, destek veya ilerleme/devam bildirir (hold on: tutunmak, count on: güvenmek, go on: devam etmek).\n" +
    "• IN: bir sınırın içine girmeyi, dahil olmayı veya anlamayı bildirir (join in: katılmak, fill in: doldurmak, take in: özümsemek).\n" +
    "• OUT: dışarı çıkmayı, eksikliği veya bir şeyi çözüp ortaya çıkarmayı bildirir (run out: tükenmek, find out: öğrenmek, figure out: çözmek).\n" +
    "• UP: bir noktaya ulaşmayı, tamamlamayı veya artışı bildirir; bazen parçalanma/durma anlamı da taşır (finish up: bitirmek, break up: ayrılmak, give up: vazgeçmek).\n" +
    "• DOWN: azalmayı, durmayı/hastalanmayı veya küçümsemeyi bildirir (calm down: sakinleşmek, break down: bozulmak, look down on: küçümsemek).\n" +
    "• THROUGH: bir engelden geçmeyi veya zorlu bir süreci atlatmayı bildirir (get through: atlatmak, go through: yaşamak/geçirmek).\n" +
    "• OVER: bir şeyin üzerinden (temas olmadan) geçmeyi, engelleri aşıp bir noktaya varmayı veya bir konuyu yeniden gözden geçirmeyi bildirir (go over: gözden geçirmek, get over: atlatmak).\n\n" +
    "Bu particle mantığı bir formül değildir; her phrasal verb'ü tek tek öğrenmeniz gerekir. Ancak bilmediğiniz bir phrasal verb'le karşılaştığınızda particle'ın genel yönünü hatırlamak, YDS'nin çoktan seçmeli formatında yanlış seçenekleri elemenize yardımcı olabilir.";

  const phrasalVerbGlossary =
    "Aşağıdaki liste, YDS'de sıkça karşılaşılan phrasal verb'leri particle'larına göre gruplandırır. Her grubu yukarıdaki particle mantığıyla birlikte çalışırsanız kalıcılığı artar.\n\n" +
    "ON (temas, destek, ilerleme)\n" +
    "hold on – tutunmak, beklemek\ncount on – güvenmek\nrely on – güvenmek, bağlı olmak\ngo on – devam etmek\ncarry on – sürdürmek\nput on – giymek, takmak\nturn on – açmak (cihaz)\ntake on – üstlenmek, işe almak\n\n" +
    "IN (içine girme, dahil olma, anlama)\n" +
    "fill in – doldurmak\njoin in – katılmak\ntake in – özümsemek, içine almak\nmove in – taşınmak\ncheck in – giriş yapmak\nbring in – dahil etmek, içeri getirmek\nhand in – teslim etmek\ngive in – boyun eğmek, pes etmek\n\n" +
    "OUT (dışarı çıkma, eksiklik, çözme/keşfetme)\n" +
    "find out – öğrenmek\nfigure out – çözmek, anlamak\nwork out – çözmek, halletmek\nrun out (of) – tükenmek\npoint out – belirtmek, dikkat çekmek\ncarry out – yürütmek, gerçekleştirmek\nturn out – ortaya çıkmak, sonuçlanmak\nleave out – dışarıda bırakmak, atlamak\n\n" +
    "UP (hedefe ulaşma, tamamlama, artış)\n" +
    "give up – vazgeçmek\nset up – kurmak\ncome up with – bulmak, ortaya çıkarmak\nbring up – gündeme getirmek, yetiştirmek\nbreak up – ayrılmak, dağılmak\nend up – sonunda bir durumda bulunmak\ncatch up (with) – yetişmek, yakalamak\nspeak up – yüksek sesle konuşmak\n\n" +
    "DOWN (azalma, durma/hastalanma, küçümseme)\n" +
    "calm down – sakinleşmek\nbreak down – bozulmak, sinir krizi geçirmek\nturn down – reddetmek, sesini kısmak\nlet down – hayal kırıklığına uğratmak\ncut down (on) – azaltmak\ncome down with – bir hastalığa yakalanmak\nlook down on – küçümsemek\nwrite down – not almak, yazmak\n\n" +
    "THROUGH (bir engelden geçme, zorlu süreci atlatma)\n" +
    "get through – atlatmak, tamamlamak\ngo through – yaşamak, bir süreçten geçmek\nsee through – sonuna kadar götürmek\nthink through – enine boyuna düşünmek\nbreak through – bir engeli aşmak, çığır açmak\nfollow through – sonunu getirmek\nget through to – birine ulaşmak, anlatabilmek\n\n" +
    "OVER (üzerinden geçme, engelleri aşma, tekrar gözden geçirme)\n" +
    "go over – gözden geçirmek\nget over – atlatmak, üstesinden gelmek\ntake over – devralmak, yönetimi ele geçirmek\nhand over – devretmek\nthink over – iyice düşünmek\nmove over – kenara çekilmek\nlook over – gözden geçirmek";

  for (const [index, def] of ydsTopicDefs.entries()) {
    const topic = await db.examTopic.upsert({
      where: { examTypeId_slug: { examTypeId: examTypes.YDS.id, slug: def.slug } },
      update: { name: def.name, questionCount: def.questionCount, difficulty: def.difficulty, displayOrder: index },
      create: { examTypeId: examTypes.YDS.id, slug: def.slug, name: def.name, questionCount: def.questionCount, difficulty: def.difficulty, displayOrder: index },
    });

    const lessonDefs =
      def.slug === "kelime-phrasal-verb"
        ? [
            {
              title: `${def.name} – Konuya Giriş`,
              durationMinutes: 12,
              contentBody: phrasalVerbIntro,
            },
            {
              title: `${def.name} – Sık Kullanılan Phrasal Verb'ler Sözlüğü`,
              durationMinutes: 15,
              contentBody: phrasalVerbGlossary,
            },
            {
              title: `${def.name} – Örnek Sorular ve Çözümler`,
              durationMinutes: 12,
              contentBody: formatExamples(ydsExamples[def.slug]),
            },
          ]
        : [
            {
              title: `${def.name} – Konuya Giriş`,
              durationMinutes: 8,
              contentBody: `Bu bölümde "${def.name}" kategorisinde YDS'de karşınıza çıkabilecek soru tiplerini ve temel çözüm stratejilerini öğreneceksiniz. Sınavda bu konudan ortalama ${def.questionCount} soru gelmektedir.`,
            },
            {
              title: `${def.name} – Örnek Sorular ve Çözümler`,
              durationMinutes: 12,
              contentBody: formatExamples(ydsExamples[def.slug]),
            },
          ];
    for (const [lessonIndex, lessonDef] of lessonDefs.entries()) {
      const existingLesson = await db.topicLesson.findFirst({ where: { topicId: topic.id, position: lessonIndex } });
      if (existingLesson) {
        await db.topicLesson.update({ where: { id: existingLesson.id }, data: { title: lessonDef.title, durationMinutes: lessonDef.durationMinutes, contentBody: lessonDef.contentBody } });
      } else {
        await db.topicLesson.create({ data: { topicId: topic.id, position: lessonIndex, title: lessonDef.title, durationMinutes: lessonDef.durationMinutes, contentBody: lessonDef.contentBody } });
      }
    }
  }

  const yokdilAltTestDefs = [
    {
      slug: "paragraf-okuma-anlama",
      name: "Paragraf Okuma Anlama (Reading Comprehension)",
      questionCount: 15,
      description:
        "Paragraf Okuma Anlama, YÖKDİL'de en yüksek soru payına sahip alandır (%18,75). Adayların akademik metinleri anlama, ana fikri bulma, çıkarım yapma ve detay soruları cevaplayabilme becerilerini ölçer.\n\nHazırlık İpucu: Her gün en az 2-3 akademik paragraf okuyun. Ana fikir, destekleyici detay ve çıkarım sorularına odaklanın. Kendi alanınızdaki İngilizce makaleleri düzenli okumak büyük avantaj sağlar.",
      subtopics: ["Main Idea (Ana Fikir)", "Supporting Details (Destekleyici Detaylar)", "Inference (Çıkarım Yapma)", "Vocabulary in Context (Bağlamda Kelime)", "Author's Purpose (Yazarın Amacı)"],
    },
    {
      slug: "dilbilgisi",
      name: "Dilbilgisi (Grammar)",
      questionCount: 14,
      description:
        "Dilbilgisi bölümü, İngilizce gramer kurallarının akademik bağlamda uygulanmasını test eder. Zamanlar, kiplik fiiller, koşul cümleleri ve bağlaçlar en sık sorulan konulardır.\n\nHazırlık İpucu: Tenses, modals, conditionals ve passive voice konularını sağlam öğrenin. Her konudan en az 50 soru çözün. Relative clauses ve bağlaçlar sıklıkla çıkmaktadır.",
      subtopics: [
        "Tenses (Zamanlar)",
        "Modals (Kiplik Fiiller)",
        "Conditionals (Koşul Cümleleri)",
        "Passive Voice (Edilgen Çatı)",
        "Reported Speech (Dolaylı Anlatım)",
        "Relative Clauses (Sıfat Cümlecikleri)",
        "Conjunctions & Connectors (Bağlaçlar)",
        "Gerunds & Infinitives",
        "Subject-Verb Agreement (Özne-Yüklem Uyumu)",
        "Comparatives & Superlatives",
      ],
    },
    {
      slug: "ceviri",
      name: "Çeviri (İngilizce↔Türkçe Translation)",
      questionCount: 12,
      description:
        "Çeviri bölümü, İngilizce-Türkçe ve Türkçe-İngilizce çeviri becerilerini ölçer. Akademik metin çevirisi ve teknik terim bilgisi önemlidir.\n\nHazırlık İpucu: Her gün bir paragraf İngilizce-Türkçe çeviri pratiği yapın. Akademik terminolojiyi kendi alanınızda geliştirin. Anlam odaklı çeviri yapın, sözcüğü sözcüğüne çeviriden kaçının.",
      subtopics: ["İngilizceden Türkçeye Çeviri", "Türkçeden İngilizceye Çeviri", "Akademik Metin Çevirisi", "Teknik Terim Çevirisi", "Paragraf Düzeyinde Anlam Aktarımı"],
    },
    {
      slug: "cumle-tamamlama",
      name: "Cümle Tamamlama (Sentence Completion)",
      questionCount: 11,
      description:
        "Cümle Tamamlama bölümü, yarım bırakılmış cümlelerin anlam ve yapı uyumuna göre tamamlanmasını gerektirir.\n\nHazırlık İpucu: Cümlenin başındaki veya sonundaki ipuçlarına dikkat edin. Bağlaçları ve geçiş ifadelerini öğrenmek bu bölümde çok faydalıdır.",
      subtopics: ["Cümle Başı Tamamlama", "Cümle Sonu Tamamlama", "Yakın Anlamlı Cümle Seçimi", "Akademik Bağlam Tamamlama"],
    },
    {
      slug: "cloze-test",
      name: "Cloze Test (Boşluk Doldurma)",
      questionCount: 10,
      description:
        "Cloze Test, bir akademik metnin içindeki boşluklara uygun kelime veya yapıyı seçmeyi gerektiren soru tipidir.\n\nHazırlık İpucu: Önce metnin tamamını okuyarak genel konuyu kavrayın. Boşluğun çevresindeki cümlelere dikkat edin. Mantıksal bağlaçları (however, moreover, therefore) öğrenin.",
      subtopics: ["Grammar-based Cloze (Dilbilgisi Odaklı)", "Vocabulary-based Cloze (Kelime Odaklı)", "Context Clues (Bağlamsal İpuçları)", "Logical Connectors (Mantıksal Bağlaçlar)", "Academic Text Completion (Akademik Metin)"],
    },
    {
      slug: "kelime-bilgisi",
      name: "Kelime Bilgisi (Vocabulary)",
      questionCount: 6,
      description:
        "Kelime Bilgisi bölümü, adayların akademik kelime hazinesini, eş-zıt anlamlıları ve sözcük türetme becerilerini ölçer.\n\nHazırlık İpucu: Academic Word List (AWL) çalışın. Her gün 30-40 yeni kelime öğrenin. Collocations ve word formation kalıplarını tablolarla öğrenin.",
      subtopics: ["Academic Word List (AWL)", "Synonyms & Antonyms (Eş ve Zıt Anlam)", "Word Formation (Sözcük Türetme)", "Collocations (Eşdizimlilik)", "Field-Specific Terminology (Alana Özgü Terimler)"],
    },
    {
      slug: "paragraf-tamamlama",
      name: "Paragraf Tamamlama",
      questionCount: 6,
      description:
        "Paragraf Tamamlama bölümü, bir paragraftaki eksik cümlenin bulunmasını veya paragrafı tamamlayacak en uygun cümlenin seçilmesini gerektirir.\n\nHazırlık İpucu: Paragrafın genel akışını kavrayın. Konu cümlesi ve sonuç cümlesi arasındaki mantıksal bağı arayın.",
      subtopics: ["Paragraf İçi Boşluk Tamamlama", "Paragraf Sonuç Cümlesi Seçimi", "Metin Akışına Uygun Cümle"],
    },
    {
      slug: "anlam-butunlugunu-bozan-cumle",
      name: "Anlam Bütünlüğünü Bozan Cümle",
      questionCount: 6,
      description:
        "Bu bölümde bir paragraftaki anlam bütünlüğünü bozan (konu dışı) cümlenin tespit edilmesi istenmektedir.\n\nHazırlık İpucu: Paragraftaki her cümleyi konu cümlesiyle karşılaştırın. Konudan sapan, farklı bir yöne giden cümleyi belirleyin.",
      subtopics: ["Paragrafta Konu Dışı Cümle Tespiti", "Anlam Tutarlılığı Analizi", "Bağlam ve Akış Kontrolü"],
    },
  ];
  const yokdilDifficulty = {
    "paragraf-okuma-anlama": "Zor",
    dilbilgisi: "Orta",
    ceviri: "Zor",
    "cumle-tamamlama": "Orta",
    "cloze-test": "Zor",
    "kelime-bilgisi": "Kolay",
    "paragraf-tamamlama": "Orta",
    "anlam-butunlugunu-bozan-cumle": "Zor",
  };
  const yokdilExamples = {
    "paragraf-okuma-anlama": [
      "Örnek: Akademik bir paragraf, bir tıbbi tedavinin tarihçesini ve etkinliğini tartışıyor.\nSoru: \"What is the main purpose of the passage?\"\nDoğru cevap, paragrafın GENEL amacını yansıtmalıdır (örn. 'to describe the development and effectiveness of a treatment'), tek bir detayı değil.",
      "Örnek: Bir paragraf, şehir merkezlerindeki yeşil alanların azalmasının hem hava kalitesi hem de ruh sağlığı üzerindeki etkilerini anlatıyor ve yerel yönetimlere öneriler sunuyor.\nSoru: \"What is the author's main purpose in writing this passage?\"\n(A) to criticize past urban policies (B) to persuade local governments to increase green spaces (C) to compare two cities' park systems (D) to describe the history of urban planning\nDoğru cevap (B) — paragraf sorunu tanımlamakla kalmayıp yerel yönetimlere ÖNERİLER sunduğu için amacı ikna etmektir, sadece betimleme değil.",
      "Örnek: Bir paragrafta, artan deniz sıcaklıklarının göçmen kuşların beslenme alanlarına ulaşma zamanlamasını bozduğu, ancak bazı türlerin göç rotalarını değiştirerek uyum sağladığı anlatılıyor.\nSoru: \"It can be inferred from the passage that ----.\"\n(A) all migratory species are equally affected by climate change (B) some species show behavioral flexibility in response to environmental change (C) sea temperatures have stopped rising in recent years (D) migration has become unnecessary for most bird species\nDoğru cevap (B) — paragraf açıkça söylemese de, rota değiştiren türlerin varlığından ÇIKARIM yoluyla davranışsal esneklik sonucuna ulaşılır.",
      "Örnek: Bir paragraf, aşı geliştirme sürecinin 18. yüzyıldaki çiçek hastalığı deneyleriyle başladığını ve modern biyoteknolojiyle nasıl geliştiğini anlatıyor.\nSoru: \"According to the passage, the earliest experiments mentioned took place in ----.\"\n(A) the 21st century (B) the 19th century (C) the 18th century (D) ancient times\nDoğru cevap (C) — bu bir DETAY sorusudur; paragrafta açıkça '18. yüzyıl' ifadesi geçmektedir, çıkarım gerektirmez.",
      "Örnek: Bir paragraf, beynin yeni deneyimlere göre yeniden yapılanma kapasitesinin, özellikle çocukluk döneminde, oldukça 'pronounced' olduğunu belirtiyor.\nSoru: \"The word 'pronounced' in the passage is closest in meaning to ----.\"\n(A) noticeable (B) silent (C) accidental (D) temporary\nDoğru cevap (A) 'noticeable' — bağlamda 'pronounced', bir özelliğin BELİRGİN veya göze çarpan olduğunu ifade eder.",
      "Örnek: Bir paragraf, İpek Yolu'nun sadece mal ticaretini değil, aynı zamanda fikirlerin, dinlerin ve teknolojilerin de kıtalar arasında yayılmasını sağladığını anlatıyor.\nSoru: \"What is the main idea of the passage?\"\n(A) The Silk Road was primarily a military route (B) The Silk Road facilitated the exchange of goods and ideas across continents (C) Trade routes no longer exist today (D) Religion spread only through military conquest\nDoğru cevap (B) — paragrafın tamamı, ticaretin ötesinde fikir ve teknoloji alışverişine vurgu yaptığından ana fikir budur.",
      "Örnek: Bir paragraf, yenilenebilir enerjiye geçişin maliyetlerini kabul etmekle birlikte, uzun vadeli çevresel faydalarının bu maliyetleri fazlasıyla dengelediğini savunuyor.\nSoru: \"What is the author's attitude toward the transition to renewable energy?\"\n(A) strongly opposed (B) cautiously supportive (C) completely indifferent (D) uncertain and confused\nDoğru cevap (B) — yazar maliyetleri kabul etse de genel olarak DESTEKLEYİCİ bir tavır sergilemektedir, bu da 'cautiously supportive' ifadesiyle örtüşür.",
      "Örnek: Bir paragraf, uykusuzluğun kısa vadeli bilişsel performansı etkilediğini, ancak uzun vadeli etkilerinin bireyler arasında farklılık gösterdiğini anlatıyor.\nSoru: \"It can be inferred that ----.\"\n(A) sleep deprivation affects everyone in exactly the same way (B) individual differences play a role in how sleep loss impacts long-term health (C) short-term cognitive effects are more severe than long-term ones (D) sleep has no measurable effect on cognition\nDoğru cevap (B) — 'bireyler arasında farklılık gösterdiği' ifadesinden bireysel farklılıkların rol oynadığı ÇIKARIMI yapılır.",
      "Örnek: Bir paragraf, dünya genelinde konuşulan dillerin yaklaşık yarısının bu yüzyıl sonuna kadar yok olma riski taşıdığını ve bunun kültürel çeşitlilik açısından önemli bir kayıp olduğunu belirtiyor.\nSoru: \"According to the passage, what proportion of the world's languages are at risk of disappearing?\"\n(A) about a quarter (B) nearly all of them (C) approximately half (D) a very small fraction\nDoğru cevap (C) — paragrafta doğrudan 'yaklaşık yarısı' ifadesi geçmektedir, bu bir DETAY sorusudur.",
      "Örnek: Bir paragraf, yapay zeka sistemlerinin karar alma süreçlerindeki 'şeffaflık eksikliğini', bir örnek olay üzerinden (bir kredi başvurusu reddi) tartışıyor ve ardından bu sorunun düzenleyici çerçevelerle nasıl ele alınabileceğini öneriyor.\nSoru: \"Which of the following best expresses the main idea of the passage, as opposed to a supporting detail?\"\n(A) A loan application was rejected by an AI system (B) The lack of transparency in AI decision-making requires regulatory solutions (C) Credit scoring algorithms use financial data (D) One case study involved a rejected application\nDoğru cevap (B) — (A), (C) ve (D) paragrafı desteklemek için kullanılan DETAYLARDIR; (B) ise paragrafın genel çerçevesini oluşturan ANA FİKİRDİR, bu ayrımı yapabilmek ileri düzey bir beceridir.",
    ],
    dilbilgisi: [
      "Örnek soru: \"If the researchers ---- more time, they ---- the experiment differently.\"\n(A) had / would have designed (B) have / will design (C) had had / would have designed (D) have had / design\nDoğru cevap (C) — bu bir Type 3 (geçmişe yönelik gerçek dışı) koşul cümlesidir: 'had had' + 'would have designed' yapısı gerekir.",
      "Örnek soru: \"Scientists ---- the effects of this compound since the early 2000s, but they ---- a definitive conclusion yet.\"\n(A) studied / didn't reach (B) have been studying / haven't reached (C) study / don't reach (D) had studied / hadn't reached\nDoğru cevap (B) — 'since the early 2000s' ifadesi geçmişten günümüze devam eden bir eylemi işaret eder, bu yüzden present perfect continuous ('have been studying') ve present perfect ('haven't reached') gerekir.",
      "Örnek soru: \"The results were so inconsistent that the equipment ---- properly calibrated before the experiment.\"\n(A) mustn't have been (B) can't have been (C) should have been (D) needn't have been\nDoğru cevap (B) — 'can't have been' geçmişe yönelik OLUMSUZ bir çıkarım ifade eder; tutarsız sonuçlar, ekipmanın doğru kalibre EDİLMEMİŞ OLDUĞUNA dair güçlü bir çıkarımı destekler.",
      "Örnek soru: \"The new vaccine ---- extensively before it was approved for public use.\"\n(A) tested (B) has tested (C) was being tested (D) had been tested\nDoğru cevap (D) — onaydan ÖNCE tamamlanmış bir eylem söz konusu olduğundan, past perfect passive ('had been tested') gerekir.",
      "Örnek soru: \"The professor said that the findings ---- published in the following year's journal.\"\n(A) will be (B) would be (C) are (D) have been\nDoğru cevap (B) — dolaylı anlatımda 'will' kipi, aktarma fiili geçmiş zaman ('said') olduğunda 'would' şeklinde geriye kayar.",
      "Örnek soru: \"The theory, ---- was first proposed in the 1920s, remains influential in the field today.\"\n(A) that (B) which (C) who (D) whose\nDoğru cevap (B) — virgüllerle ayrılmış (non-defining) bir sıfat cümleciğinde 'that' KULLANILAMAZ; nesne bir şey (theory) olduğu için 'which' doğru seçenektir.",
      "Örnek soru: \"The initial results were promising; ----, further trials revealed significant limitations.\"\n(A) moreover (B) however (C) therefore (D) similarly\nDoğru cevap (B) — 'however' iki cümle arasındaki ZIT bir ilişkiyi (umut verici sonuçlar vs. sınırlamalar) doğru şekilde bağlar.",
      "Örnek soru: \"The committee recommended ---- the proposal before making a final decision.\"\n(A) to revise (B) revising (C) revise (D) revised\nDoğru cevap (B) — 'recommend' fiilinden sonra GERUND ('revising') kullanılır, infinitive değil.",
      "Örnek soru: \"The number of students enrolling in online courses ---- significantly over the past decade.\"\n(A) have increased (B) has increased (C) increasing (D) are increasing\nDoğru cevap (B) — 'the number of' ifadesiyle başlayan öznelerde fiil TEKİL olur ('has increased'), 'a number of' ile karıştırılmamalıdır.",
      "Örnek soru: \"---- researchers analyzed the data, ---- it became that the initial hypothesis was flawed.\"\n(A) The more / the clearer (B) More / clearer (C) The most / the clearest (D) As more / as clear\nDoğru cevap (A) — 'the + comparative ..., the + comparative ...' kalıbı, iki durumun BİRLİKTE değiştiğini ifade eden ileri düzey bir yapıdır ('ne kadar çok ... o kadar ...').",
    ],
    ceviri: [
      "Örnek: \"Yapılan araştırmalar, düzenli egzersizin bilişsel işlevleri iyileştirdiğini göstermektedir.\"\n→ \"Studies conducted show that regular exercise improves cognitive functions.\"\nAkademik çeviride 'bilişsel işlevler' (cognitive functions), 'göstermektedir' (show/demonstrate) gibi terimlerin doğru akademik karşılıklarını kullanmak önemlidir.",
      "Örnek: \"İklim değişikliğinin deniz seviyesindeki yükselişi hızlandırdığı düşünülmektedir.\"\n→ \"Climate change is believed to be accelerating the rise in sea levels.\"\n'Düşünülmektedir' gibi edilgen yapılar, akademik İngilizcede 'is/are believed to' kalıbıyla doğal bir şekilde karşılanır; birebir 'it is thought that' de kabul edilebilir ama akıcılık açısından bu yapı tercih edilir.",
      "Örnek: \"Enflasyondaki ani artış, tüketici harcamalarını önemli ölçüde azaltmıştır.\"\n→ \"The sudden rise in inflation has significantly reduced consumer spending.\"\nBurada 'önemli ölçüde' ifadesinin 'significantly' ile, 'azaltmıştır' ifadesinin ise present perfect ('has reduced') ile karşılanması, Türkçedeki sonucun GÜNCEL etkisini yansıtır.",
      "Örnek: \"Artificial intelligence systems are increasingly being used to detect patterns that would otherwise go unnoticed.\"\n→ \"Yapay zeka sistemleri, aksi takdirde fark edilmeyecek örüntüleri tespit etmek için giderek daha fazla kullanılmaktadır.\"\nİngilizce'den Türkçeye çeviride 'are increasingly being used' pasif yapısının 'giderek daha fazla kullanılmaktadır' şeklinde doğal bir Türkçe pasif yapıyla aktarılması önemlidir, kelime kelime çeviri akıcılığı bozar.",
      "Örnek: \"Bellek, deneyimlerin nasıl kodlandığına bağlı olarak zamanla yeniden şekillenebilir.\"\n→ \"Memory can be reshaped over time depending on how experiences are encoded.\"\n'Kodlandığına bağlı olarak' ifadesi, 'depending on how ... are encoded' şeklinde bir bağlaç yapısıyla akademik İngilizceye uygun şekilde aktarılmalıdır.",
      "Örnek: \"Recent studies suggest that collaborative learning environments foster critical thinking skills more effectively than traditional lecture-based methods.\"\n→ \"Son çalışmalar, işbirlikçi öğrenme ortamlarının eleştirel düşünme becerilerini geleneksel ders anlatımı yöntemlerinden daha etkili bir şekilde geliştirdiğini göstermektedir.\"\nBurada 'suggest that' ifadesinin 'göstermektedir/ileri sürmektedir' gibi akademik bir Türkçe fiille karşılanması ve karşılaştırma yapısının ('more effectively than') doğru sırayla aktarılması önemlidir.",
      "Örnek: \"Ormansızlaşma yalnızca karbon emisyonlarını artırmakla kalmaz, aynı zamanda sayısız türün yaşam alanını da yok eder.\"\n→ \"Deforestation not only increases carbon emissions but also destroys the habitats of countless species.\"\n'Yalnızca ... kalmaz, aynı zamanda ...' kalıbı, İngilizcede 'not only ... but also ...' yapısıyla birebir ve doğal bir şekilde karşılanır.",
      "Örnek: \"The immune system's response to the pathogen was found to vary considerably depending on the patient's age.\"\n→ \"Bağışıklık sisteminin patojene verdiği yanıtın, hastanın yaşına bağlı olarak önemli ölçüde değiştiği tespit edilmiştir.\"\n'Was found to vary' gibi edilgen bir yapı, Türkçede 'değiştiği tespit edilmiştir' şeklinde doğal bir edilgen çatıyla aktarılmalıdır; 'considerably' ifadesi 'önemli ölçüde' ile karşılanır.",
      "Örnek: \"Hızlı kentleşme, altyapı sistemlerinin mevcut nüfus artışıyla baş edemediği birçok bölgede ciddi sorunlara yol açmaktadır.\"\n→ \"Rapid urbanization is causing serious problems in many regions where infrastructure systems cannot keep pace with population growth.\"\n'Baş edemediği' ifadesinin 'cannot keep pace with' gibi bir deyimsel yapıyla karşılanması, akademik çeviride doğallığı artırır; birebir çeviri ('cannot cope with') de kabul edilebilir bir alternatiftir.",
      "Örnek: \"Although the initial trial produced encouraging results, researchers caution that the sample size was too small to draw definitive conclusions, and that further studies involving more diverse populations are needed before the treatment can be recommended for widespread use.\"\n→ \"İlk deneme cesaret verici sonuçlar üretmiş olsa da, araştırmacılar örneklem büyüklüğünün kesin sonuçlara varmak için çok küçük olduğu konusunda uyarıyor ve tedavinin yaygın kullanım için önerilebilmesinden önce daha çeşitli popülasyonları içeren ek çalışmalara ihtiyaç duyulduğunu belirtiyor.\"\nBu tür çok cümlecikli akademik paragraflarda, 'although' ile başlayan zıtlık yapısının ve iki ayrı 'that' cümleciğinin (uyarı ve ihtiyaç) anlam kaybı olmadan sırasıyla aktarılması, ileri düzey çeviri becerisi gerektirir.",
    ],
    "cumle-tamamlama": [
      "Örnek soru: \"Since the new policy was implemented, ----.\"\n(A) productivity has increased significantly (B) the policy will be implemented next year (C) employees were unaware of any changes (D) the company had no policies before\nDoğru cevap (A) — 'since' (-dığından beri) bir zaman ilişkisi kurar ve cümlenin geri kalanı bu politikanın SONUCUNU (present perfect ile) yansıtmalıdır.",
      "Örnek soru: \"Although the surgery was considered high-risk, ----.\"\n(A) the patient decided to postpone it indefinitely (B) it was performed successfully with no complications (C) doctors refused to perform any operation (D) the hospital lacked the necessary equipment\nDoğru cevap (B) — 'although' bir ZITLIK bağlacıdır; yüksek riskli olmasına RAĞMEN olumlu bir sonucun gelmesi beklenir, bu da (B) ile örtüşür.",
      "Örnek soru: \"Because the sample had been contaminated during storage, ----.\"\n(A) the results were considered unreliable (B) the experiment was completed ahead of schedule (C) the researchers received an award (D) the funding was doubled the following year\nDoğru cevap (A) — kirlenmiş bir örneklem, mantıksal olarak sonuçların GÜVENİLMEZ sayılmasına yol açar; bu bir neden-sonuç ilişkisidir.",
      "Örnek soru: \"The committee will approve the research grant, provided that ----.\"\n(A) the applicant submitted the form last year (B) the proposal meets the required ethical standards (C) the funding has already been spent (D) no researchers were involved in the project\nDoğru cevap (B) — 'provided that' (şu şartla ki) bir KOŞUL bildirir ve devamında mantıksal bir gelecek koşulu gelmelidir, geçmiş bir eylem değil.",
      "Örnek soru: \"Unless the government invests more in public transportation, ----.\"\n(A) traffic congestion will continue to worsen (B) traffic congestion has already disappeared (C) citizens stopped using their cars entirely (D) the investment was made decades ago\nDoğru cevap (A) — 'unless' (eğer ... olmazsa) olumsuz bir koşul bildirir; yatırım YAPILMAZSA, sorunun devam edeceği mantıksal sonuçtur.",
      "Örnek soru: \"No sooner had the results been published ---- other researchers began questioning the methodology.\"\n(A) than (B) when (C) that (D) then\nDoğru cevap (A) — 'no sooner ... than' kalıbı, iki olayın birbirini HIZLA takip ettiğini belirten sabit bir yapıdır; devrik cümle yapısıyla ('no sooner had...') birlikte kullanılır.",
      "Örnek soru: \"Not only did the new drug reduce symptoms, but it also ----.\"\n(A) failed every clinical trial conducted (B) improved patients' overall quality of life (C) was withdrawn from the market immediately (D) had no measurable effect whatsoever\nDoğru cevap (B) — 'not only ... but also' yapısı iki OLUMLU sonucu birbirine bağlar; ilk kısım olumluysa ikinci kısım da tutarlı şekilde olumlu olmalıdır.",
      "Örnek soru: \"As long as the data collection methods remain consistent, ----.\"\n(A) the comparison between the two studies will be valid (B) the researchers had already abandoned the project (C) the methods were inconsistent from the start (D) no data has ever been collected\nDoğru cevap (A) — 'as long as' (... olduğu sürece) bir koşulu belirtir; tutarlılık SÜRDÜĞÜ sürece geçerli bir karşılaştırma yapılabileceği mantıksal sonuçtur.",
      "Örnek soru: \"Given that the majority of participants dropped out before the study's conclusion, ----.\"\n(A) the findings should be interpreted with caution (B) the results are considered entirely conclusive (C) no participants were originally recruited (D) the study was extended by another five years\nDoğru cevap (A) — 'given that' (göz önüne alındığında) bir gerekçe sunar; katılımcı kaybı YÜKSEKSE, sonuçların dikkatli yorumlanması gerektiği mantıksal bir sonuçtur.",
      "Örnek soru: \"Not until the final stage of the experiment ---- the true significance of their discovery.\"\n(A) did the researchers realize (B) the researchers realized (C) had the researchers realized (D) the researchers had realized\nDoğru cevap (A) — olumsuz bir zaman ifadesiyle ('not until') başlayan cümlelerde ÖZNE-YÜKLEM DEVRİĞİ yapılır ve yardımcı fiil öne alınır ('did the researchers realize'); bu ileri düzey bir devrik cümle yapısıdır.",
    ],
    "cloze-test": [
      "Örnek metin: \"The findings of this study, ---- limited by a small sample size, provide valuable insights into the phenomenon.\"\n(A) despite being (B) because of being (C) in spite (D) although\nDoğru cevap (A) 'despite being' — bir isim öbeği önce edat gerektirir; 'despite' + gerund yapısı burada dilbilgisel olarak doğru işler.",
      "Örnek metin: \"The experiment produced consistent results across three separate trials. ----, the sample size remained too small to generalize the findings to the wider population.\"\n(A) Similarly (B) However (C) Furthermore (D) Consequently\nDoğru cevap (B) — 'consistent results' (olumlu) ile 'too small to generalize' (sınırlayıcı) arasında bir ZITLIK vardır, bu yüzden 'however' doğru bağlaçtır.",
      "Örnek metin: \"The theory has been subject ---- considerable revision since it was first introduced in the 1980s.\"\n(A) at (B) to (C) with (D) for\nDoğru cevap (B) — 'subject to' sabit bir edat kalıbıdır ve 'maruz kalmak/tabi olmak' anlamında akademik metinlerde sıkça kullanılır.",
      "Örnek metin: \"---- by a team of international scientists, the study examined the long-term effects of microplastic pollution on marine ecosystems.\"\n(A) Conducting (B) Conducted (C) Having conducted (D) To conduct\nDoğru cevap (B) — özne ('the study') eylemi kendisi YAPMADIĞI (edilgen) için past participle ('Conducted') kullanılmalıdır.",
      "Örnek metin: \"---- little attention has been paid to the psychological effects of remote work, despite its rapid rise in popularity.\"\n(A) A (B) The (C) Many (D) Few\nDoğru cevap (A) — 'a little' (bir miktar/az da olsa) sayılamayan isimlerle olumlu bir miktarı ifade eder; 'little' tek başına olumsuz bir anlam taşır ve cümlenin devamıyla ('despite its rapid rise') tutarsız olur.",
      "Örnek metin: \"Researchers identified several genes ---- expression levels appeared to correlate with increased resistance to the disease.\"\n(A) who (B) which (C) whose (D) that\nDoğru cevap (C) — 'whose' iyelik ilişkisini gösterir ('genlerin ifade düzeyleri'); genlerin kendisine ait bir özellik anlatıldığı için bu ilgi zamiri gerekir.",
      "Örnek metin: \"Many economists predicted a rapid recovery following the policy change. The recovery, ----, took nearly three years to materialize.\"\n(A) therefore (B) in addition (C) nevertheless (D) similarly\nDoğru cevap (C) — beklenen 'hızlı toparlanma' ile gerçekleşen 'üç yıl süren toparlanma' arasında bir ZITLIK olduğundan 'nevertheless' en uygun bağlaçtır.",
      "Örnek metin: \"The panel recommended ---- additional safety measures before the drug could be approved for public distribution.\"\n(A) implement (B) implementing (C) to implement (D) implemented\nDoğru cevap (B) — 'recommend' fiilinden sonra gerund yapısı ('implementing') gelmelidir, bu YÖKDİL'de sıkça test edilen bir kalıptır.",
      "Örnek metin: \"If greenhouse gas emissions ---- at current rates, average global temperatures could rise by more than two degrees by the end of the century.\"\n(A) continue (B) continued (C) had continued (D) will continue\nDoğru cevap (A) — bu bir Type 1 (gerçek/olası) koşul cümlesidir; if cümleciğinde SIMPLE PRESENT ('continue') kullanılır, ana cümlede ise 'could rise' gelir.",
      "Örnek metin: \"The hypothesis, ---- initially dismissed by the scientific community, has since gained considerable support ---- a series of independent studies replicated the original findings.\"\n(A) which was / after (B) that being / because (C) being / despite (D) it was / since\nDoğru cevap (A) — ilk boşlukta özneyi ('the hypothesis') tanımlayan bir ilgi cümleciği ('which was initially dismissed') gerekir; ikinci boşlukta ise zaman sırasını belirten 'after' bağlacı, bağımsız çalışmaların hipotezi doğrulamasının DESTEĞİN kazanılmasından ÖNCE gerçekleştiğini gösterir.",
    ],
    "kelime-bilgisi": [
      "Örnek soru: \"The professor's argument was so ---- that even his critics found it difficult to disagree.\"\n(A) compelling (B) trivial (C) redundant (D) ambiguous\nDoğru cevap (A) 'compelling' (ikna edici) — cümledeki 'even his critics found it difficult to disagree' ifadesi, argümanın güçlü olduğunu işaret eder.",
      "Örnek soru: \"Smartphones have become so ---- in modern society that it is difficult to imagine daily life without them.\"\n(A) scarce (B) ubiquitous (C) obsolete (D) controversial\nDoğru cevap (B) 'ubiquitous' (her yerde bulunan/yaygın) — 'difficult to imagine daily life without them' ifadesi, akıllı telefonların YAYGINLIĞINI vurgular.",
      "Örnek soru: \"The researcher's ---- attention to detail ensured that even the smallest measurement errors were identified and corrected.\"\n(A) careless (B) meticulous (C) superficial (D) arbitrary\nDoğru cevap (B) 'meticulous' (titiz) — 'even the smallest measurement errors were identified' ifadesi, araştırmacının son derece dikkatli olduğunu gösterir.",
      "Örnek soru: \"Although the theory seemed ---- at first, further evidence revealed several inconsistencies that undermined its credibility.\"\n(A) implausible (B) plausible (C) irrelevant (D) redundant\nDoğru cevap (B) 'plausible' (makul/inandırıcı) — 'although' bir ZITLIK kurduğundan, 'başlangıçta makul görünmesine rağmen sonradan tutarsızlıklar ortaya çıktı' anlamı doğru olur.",
      "Örnek soru: \"Excessive exposure to blue light before bedtime has been shown to have a ---- effect on sleep quality.\"\n(A) beneficial (B) negligible (C) detrimental (D) neutral\nDoğru cevap (C) 'detrimental' (zararlı) — 'excessive exposure' (aşırı maruziyet) genellikle olumsuz bir sonuçla ilişkilendirilir, bu da uyku kalitesi üzerindeki ZARARLI etkiyi işaret eder.",
      "Örnek soru: \"The wording of the survey question was so ---- that respondents interpreted it in several different ways.\"\n(A) precise (B) ambiguous (C) concise (D) straightforward\nDoğru cevap (B) 'ambiguous' (belirsiz/çok anlamlı) — 'interpreted it in several different ways' ifadesi, sorunun net olmadığını, yani BELİRSİZ olduğunu gösterir.",
      "Örnek soru: \"Once the new software update automated the process, the manual data entry step became entirely ----.\"\n(A) essential (B) redundant (C) efficient (D) mandatory\nDoğru cevap (B) 'redundant' (gereksiz/fazlalık) — otomasyon sağlandığında, elle veri girişi artık GEREKSİZ hale gelir.",
      "Örnek soru: \"The new policy resulted in a ---- reduction in emissions, far exceeding what analysts had initially predicted.\"\n(A) negligible (B) substantial (C) marginal (D) questionable\nDoğru cevap (B) 'substantial' (önemli/büyük ölçüde) — 'far exceeding what analysts had initially predicted' ifadesi, azalmanın BÜYÜK ölçekte olduğunu gösterir.",
      "Örnek soru: \"Critics argued that the committee's decision to reject the proposal was entirely ----, lacking any clear justification.\"\n(A) systematic (B) arbitrary (C) well-reasoned (D) transparent\nDoğru cevap (B) 'arbitrary' (keyfi) — 'lacking any clear justification' ifadesi, kararın belirli bir mantığa dayanmadığını, yani KEYFİ olduğunu gösterir.",
      "Örnek soru: \"The clinical trial results were ---- at best, with some patients showing improvement while others experienced no change or even worsening symptoms.\"\n(A) conclusive (B) equivocal (C) unanimous (D) definitive\nDoğru cevap (B) 'equivocal' (belirsiz/çelişkili sonuçlu) — hastalar arasında birbirinden FARKLI ve tutarsız sonuçların görülmesi, bulguların net bir sonuca varmadığını, yani ÇELİŞKİLİ olduğunu gösterir; bu kelime YÖKDİL'de sık çıkan ileri düzey akademik sözcüklerdendir.",
    ],
    "paragraf-tamamlama": [
      "Örnek: Bir paragrafın sonunda eksik bırakılan sonuç cümlesi için, paragraf boyunca bir teorinin hem güçlü hem zayıf yönlerinden bahsedilmişse, doğru tamamlayıcı cümle bu DENGELİ değerlendirmeyi yansıtmalıdır (örn. \"Therefore, while the theory offers valuable insights, further research is needed to address its limitations.\").",
      "Örnek: Bir paragraf, artan şehir nüfusunun trafik sıkışıklığına ve hava kirliliğine nasıl yol açtığını ayrıntılarıyla anlatıyor. Paragrafı tamamlayacak en uygun cümle, bu NEDEN-SONUÇ zincirinin doğal bir devamı olmalıdır (örn. \"Consequently, urban planners are increasingly prioritizing public transportation over road expansion.\").",
      "Örnek: Bir paragraf, hayvanların doğal ortamlarında kullandıkları kamuflaj tekniklerini genel olarak tanıtıyor ve ardından bir boşluk bırakılıyor. Doğru tamamlayıcı cümle, bu genel ifadeyi desteklemek için SOMUT BİR ÖRNEK sunmalıdır (örn. \"The stick insect, for instance, closely resembles the twigs of the plants it inhabits.\").",
      "Örnek: Bir paragraf, bir şirketin yeni ürününün beklenenden çok daha başarılı satışlara ulaştığını anlatıyor, ancak boşluk paragrafın ortasında bırakılmış ve bir önceki cümlede rakip şirketlerin benzer ürünlerinin başarısız olduğu belirtilmiş. Doğru tamamlayıcı cümle bu ZITLIĞI netleştirmelidir (örn. \"Unlike its competitors, however, the company invested heavily in user feedback before launch.\").",
      "Örnek: Bir paragraf, bir bilimsel tartışmanın farklı taraflarının argümanlarını sırayla sunuyor ve sonunda bir boşluk bırakılıyor. Doğru tamamlayıcı cümle, sunulan tüm argümanları kısaca ÖZETLEMELİ ve tartışmanın genel durumunu yansıtmalıdır (örn. \"In light of these conflicting findings, no clear scientific consensus has yet been reached.\").",
      "Örnek: Bir paragrafın başındaki boşluk, paragrafın geri kalanında ayrıntılı olarak açıklanacak bir kavramı TANITAN bir giriş cümlesi gerektirir (örn. bir paragraf 'confirmation bias'ın günlük hayattaki örneklerini anlatıyorsa, giriş cümlesi bu kavramı tanımlamalıdır: \"Confirmation bias refers to the tendency to favor information that supports one's existing beliefs.\").",
      "Örnek: Bir paragraf, bir ilacın klinik denemelerde umut verici sonuçlar gösterdiğini, ancak yan etkilerinin de gözlemlendiğini anlatıyor ve boşluk son cümlede bırakılıyor. Doğru tamamlayıcı cümle, hem olumlu hem olumsuz bulguları dengeleyerek MANTIKSAL bir sonuca varmalıdır (örn. \"As a result, regulatory approval remains pending further safety evaluations.\").",
      "Örnek: Bir paragraf, bir bilimsel keşfin kronolojik gelişimini anlatıyor (ilk gözlem, hipotez, deney) ve son aşama için bir boşluk bırakılmış. Doğru tamamlayıcı cümle, bu SIRALI anlatımın mantıksal son adımını yansıtmalıdır (örn. \"Finally, the results were peer-reviewed and published in a leading scientific journal.\").",
      "Örnek: Bir paragraf, bir politikanın savunucularının argümanlarını sunuyor ve ardından bir boşluk bırakarak karşıt görüşe geçiş yapıyor. Doğru tamamlayıcı cümle, bu geçişi bir KARŞIT ARGÜMANLA başlatmalıdır (örn. \"Opponents, however, contend that the policy places an unfair burden on small businesses.\").",
      "Örnek: Bir paragraf, bir araştırmanın metodolojisini detaylıca anlatıyor, ardından bulgulara geçmeden önce ORTADA bir boşluk bırakılmış; bir önceki cümlede örneklem seçiminin rastgele olmadığı, bir sonraki cümlede ise bulguların dikkatli yorumlanması gerektiği belirtiliyor. Doğru tamamlayıcı cümle, bu iki cümle arasındaki MANTIKSAL KÖPRÜYÜ kurmalıdır (örn. \"This non-random sampling method may therefore limit the generalizability of the results.\") — bu tip sorular, paragrafın sadece önceki değil SONRAKİ cümleyle de uyumunu kontrol etmeyi gerektirdiği için en zorlayıcı türdendir.",
    ],
    "anlam-butunlugunu-bozan-cumle": [
      "Örnek paragraf: (1) Renewable energy sources are gaining popularity worldwide. (2) Solar panels have become significantly cheaper over the past decade. (3) Many countries offer tax incentives for renewable energy adoption. (4) Fossil fuels have been used for centuries as the primary energy source.\nCümle (4), paragrafın ana odağı olan 'yenilenebilir enerjinin yükselişi' ile ilgisiz, tamamen KONUDIŞI bir geçmiş bilgisi sunduğu için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) A balanced diet plays a crucial role in maintaining overall health. (2) Consuming adequate amounts of fruits and vegetables strengthens the immune system. (3) Whole grains provide sustained energy throughout the day. (4) Many restaurants have expanded their menus to include vegetarian options.\nCümle (4), paragrafın konusu olan 'dengeli beslenmenin sağlık üzerindeki etkisi' yerine restoran menülerinden bahsettiği için akışı bozar ve KONUDIŞIDIR.",
      "Örnek paragraf: (1) Space exploration has advanced rapidly over the past two decades. (2) Private companies now play a major role in launching satellites and spacecraft. (3) The cost of reaching orbit has decreased significantly due to reusable rocket technology. (4) Many science fiction films depict humans colonizing distant planets.\nCümle (4), paragrafın GERÇEK gelişmelerden bahsettiği bağlamda kurgusal filmlere değindiği için konu bütünlüğünü bozar.",
      "Örnek paragraf: (1) Learning a second language offers numerous cognitive benefits. (2) Bilingual individuals often demonstrate improved problem-solving skills. (3) Some studies suggest that bilingualism may delay the onset of dementia. (4) English is currently the most widely taught foreign language in schools worldwide.\nCümle (4), paragrafın odağı olan 'iki dilliliğin bilişsel faydaları' yerine hangi dilin en çok öğretildiğinden bahsettiği için KONUDAN SAPMIŞTIR.",
      "Örnek paragraf: (1) Coral reefs support an extraordinary diversity of marine life. (2) Rising ocean temperatures have caused widespread coral bleaching events. (3) Bleached corals become more vulnerable to disease and eventually die if conditions do not improve. (4) Many tourists visit tropical destinations to go scuba diving every year.\nCümle (4), paragrafın odaklandığı 'mercan resiflerinin sağlığı üzerindeki tehditler' konusuyla ilgisiz bir turizm bilgisi sunduğu için anlam bütünlüğünü bozar.",
      "Örnek paragraf: (1) The discovery of penicillin revolutionized the treatment of bacterial infections. (2) Alexander Fleming noticed the antibacterial effect almost by accident in 1928. (3) It took over a decade for penicillin to be mass-produced for widespread medical use. (4) Modern hospitals rely heavily on electronic health records for patient management.\nCümle (4), paragrafın tarihsel anlatımı olan 'penisilinin keşfi ve yaygınlaşması' ile hiçbir ilgisi olmayan güncel bir bilgi sunduğu için KONUDIŞIDIR.",
      "Örnek paragraf: (1) Behavioral economics challenges the assumption that individuals always act rationally. (2) People often make decisions based on emotional impulses rather than careful calculation. (3) Cognitive biases, such as loss aversion, frequently distort financial decision-making. (4) Classical economic theory was first developed in the eighteenth century.\nCümle (4), paragrafın odağı olan 'davranışsal ekonominin rasyonellik varsayımına itirazı' yerine klasik ekonominin tarihinden bahsettiği için anlatım akışını bozar.",
      "Örnek paragraf: (1) Recent excavations have uncovered evidence of a previously unknown settlement. (2) Pottery fragments found at the site suggest trade connections with distant regions. (3) Radiocarbon dating places the settlement's origins at over three thousand years ago. (4) Museums often struggle to secure adequate funding for long-term preservation projects.\nCümle (4), paragrafın odağı olan 'yeni keşfedilen yerleşimin bulguları' ile ilgisiz, müzelerin finansman sorunlarından bahsettiği için KONU BÜTÜNLÜĞÜNÜ bozar.",
      "Örnek paragraf: (1) Chronic stress has been linked to a range of physical health problems, including cardiovascular disease. (2) Prolonged exposure to stress hormones can weaken the immune system over time. (3) Mindfulness practices have gained popularity as a means of managing daily stress. (4) Regular mindfulness practice has also been shown to reduce cortisol levels significantly.\nCümle (3), paragrafın odağı olan 'kronik stresin fiziksel sağlık üzerindeki etkileri' yerine mindfulness'ın POPÜLERLİĞİNDEN bahsederek konuyu değiştirir; oysa cümle (4) doğrudan stres yönetimiyle ilişkili somut bir bulgu sunduğundan paragrafla tutarlıdır — bu, en yakın çeldiricinin ayırt edilmesini gerektiren İNCE bir örnektir.",
      "Örnek paragraf: (1) Artificial sweeteners were developed as low-calorie alternatives to sugar. (2) Some research suggests that certain artificial sweeteners may alter gut bacteria composition. (3) Changes in gut bacteria have been associated with metabolic changes in several studies. (4) Sugar consumption has risen steadily worldwide over the past half-century. (5) These findings have prompted calls for more long-term research into the safety of artificial sweeteners.\nCümle (4), yüzeysel olarak konuyla ilişkili görünse de (şeker/tatlandırıcı teması), paragrafın asıl odağı olan 'yapay tatlandırıcıların bağırsak bakterileri ve metabolizma üzerindeki etkisi' zincirini kırar ve konudan sapar; bu tür sorularda, TEMA OLARAK yakın ama MANTIK ZİNCİRİNE dahil olmayan cümleyi ayırt edebilmek gerekir.",
    ],
  };
  const yokdilExamCodes = ["YOKDIL_SOSYAL", "YOKDIL_SAGLIK", "YOKDIL_FEN"];
  for (const examCode of yokdilExamCodes) {
    for (const [index, def] of yokdilAltTestDefs.entries()) {
      const difficulty = yokdilDifficulty[def.slug];
      const topic = await db.examTopic.upsert({
        where: { examTypeId_slug: { examTypeId: examTypes[examCode].id, slug: def.slug } },
        update: { name: def.name, description: def.description, questionCount: def.questionCount, difficulty, displayOrder: index },
        create: { examTypeId: examTypes[examCode].id, slug: def.slug, name: def.name, description: def.description, questionCount: def.questionCount, difficulty, displayOrder: index },
      });

      for (const [lessonIndex, subtopic] of def.subtopics.entries()) {
        const contentBody = `Bu derste "${subtopic}" konusunu YÖKDİL "${def.name}" bölümü kapsamında örneklerle inceleyeceğiz.`;
        const existingLesson = await db.topicLesson.findFirst({ where: { topicId: topic.id, position: lessonIndex } });
        if (existingLesson) {
          await db.topicLesson.update({ where: { id: existingLesson.id }, data: { title: subtopic, durationMinutes: 7, contentBody } });
        } else {
          await db.topicLesson.create({ data: { topicId: topic.id, position: lessonIndex, title: subtopic, durationMinutes: 7, contentBody } });
        }
      }

      const exampleLessonPosition = def.subtopics.length;
      const exampleLesson = {
        title: "Örnek Sorular ve Çözümler",
        durationMinutes: 8,
        contentBody: formatExamples(yokdilExamples[def.slug]),
      };
      const existingExampleLesson = await db.topicLesson.findFirst({ where: { topicId: topic.id, position: exampleLessonPosition } });
      if (existingExampleLesson) {
        await db.topicLesson.update({ where: { id: existingExampleLesson.id }, data: exampleLesson });
      } else {
        await db.topicLesson.create({ data: { topicId: topic.id, position: exampleLessonPosition, ...exampleLesson } });
      }
    }
  }

  const pteTopicDefs = [
    {
      slug: "read-aloud",
      name: "Read Aloud",
      questionCount: 7,
      description:
        "Read Aloud, PTE Konuşma bölümünün ilk soru tipidir. Ekranda 60 kelimeye kadar bir metin belirir; bu metni 40 saniye içinde doğal ve akıcı bir şekilde sesli okumanız beklenir. Hem okuma hem konuşma becerinizi ölçer.\n\nHazırlık İpucu: Metni okumaya başlamadan önce hızlıca göz gezdirin, vurgulanması gereken anahtar kelimeleri belirleyin. Doğal tonlama ve uygun duraklamalarla, sabit bir hızda okuyun; çok hızlı okumak telaffuz hatalarına yol açar.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 5, contentBody: "Read Aloud sorusunda ekranda kısa bir akademik metin (genellikle 30-60 kelime) belirir. Metni sessizce okumanız için birkaç saniyeniz olur, ardından mikrofon otomatik olarak açılır ve 40 saniye içinde metni sesli okumanız istenir. Bu soru tipi hem 'Reading' hem 'Speaking' puanına katkı sağlar; ayrıca telaffuz ve akıcılık (oral fluency) gibi yetkinlik puanlarını da besler." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Puanlama, okuduğunuz kelimelerin ekrandaki metinle birebir örtüşmesine dayanır: atladığınız, eklediğiniz veya yanlış telaffuz ettiğiniz her kelime içerik puanınızı düşürür. Doğal bir tempoda, kelimeleri anlam gruplarına ayırarak (chunking) okuyun; virgül ve noktalarda kısa duraklamalar yapın. Bilmediğiniz bir kelimeyle karşılaşırsanız bile durmayın, en yakın tahmini telaffuzla devam edin — durmak akıcılık puanınızı ciddi şekilde düşürür." },
      ],
    },
    {
      slug: "repeat-sentence",
      name: "Repeat Sentence",
      questionCount: 12,
      description:
        "Repeat Sentence sorusunda 3-9 saniye uzunluğunda bir cümle dinletilir; cümleyi duyduğunuz gibi, kelimesi kelimesine tekrar etmeniz beklenir. Dinleme ve konuşma becerinizi birlikte ölçer, cümle uzadıkça zorluk artar.\n\nHazırlık İpucu: Cümleyi ezberlemeye değil, anlamına odaklanarak dinleyin — anlamı kavradığınızda kelimeleri hatırlamak çok daha kolaylaşır. Cümlenin tamamını hatırlayamasanız bile duyduğunuz kadarını, doğru tonlamayla tekrar edin; kısmi puan almak, hiç cevap vermemekten çok daha iyidir.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 5, contentBody: "Kulaklıktan tek seferlik olarak kısa bir cümle çalınır (3-9 saniye). Kayıt bittikten hemen sonra mikrofon açılır ve 15 saniye içinde cümleyi aynen tekrar etmeniz istenir. Bu soru tipinde toplam 10-12 soru sorulur ve sınavın en çok soru içeren bölümlerinden biridir." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Puanlama, orijinal cümledeki kelimelerle söylediğiniz kelimelerin örtüşme oranına göre yapılır; doğru sırayla söylenen her kelime puan kazandırır. Uzun cümlelerde cümleyi anlam bloklarına (örneğin özne-fiil grubu, zaman/yer ifadesi) ayırarak hafızada tutmayı deneyin. Kelime kelime ezberlemek yerine cümlenin genel akışını ve vurgusunu yakalamak, özellikle uzun cümlelerde çok daha etkilidir." },
      ],
    },
    {
      slug: "describe-image",
      name: "Describe Image",
      questionCount: 7,
      description:
        "Describe Image sorusunda ekranda bir grafik, tablo, harita veya diyagram belirir; bu görseli 40 saniye boyunca detaylı şekilde sözlü olarak anlatmanız beklenir. Yalnızca konuşma becerinizi ölçen, içerik odaklı bir soru tipidir.\n\nHazırlık İpucu: Görseli betimlerken önce genel başlığı/konusunu belirtin, ardından en dikkat çekici eğilimi veya en yüksek/en düşük değeri vurgulayın, son olarak kısa bir genel değerlendirme ile bitirin. Sayıları tek tek okumak yerine 'kabaca', 'yaklaşık', 'en belirgin şekilde' gibi ifadelerle genel eğilimlere odaklanın.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 5, contentBody: "Ekranda bir çizgi/çubuk/pasta grafik, tablo, harita veya süreç diyagramı belirir. Görseli inceleme süresinin ardından 40 saniye içinde detaylı bir sözlü açıklama yapmanız istenir. Bu soru tipinden sınavda genellikle 6-7 soru sorulur ve yalnızca Speaking puanına katkı sağlar." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Puanlama, görseldeki anahtar unsurların (başlık, eksenler, en yüksek/en düşük noktalar, genel eğilim) cevabınızda ne kadar yer aldığına bakılarak yapılır. 40 saniyenin tamamını konuşarak doldurun; sessiz kalmak akıcılık puanınızı düşürür. Grafik türüne göre standart bir şablon kullanmak (çizgi grafikte 'artış/azalış/dalgalanma', pasta grafikte 'en büyük/en küçük dilim' kalıpları) hazırlığınızı hızlandırır." },
      ],
    },
    {
      slug: "retell-lecture",
      name: "Re-tell Lecture",
      questionCount: 4,
      description:
        "Re-tell Lecture sorusunda akademik bir konuşma veya ders kaydı dinletilir; dinlediğiniz dersi kendi cümlelerinizle özetleyerek 40 saniye içinde yeniden anlatmanız beklenir. Dinleme ve konuşma becerisini birlikte ölçen, en uzun soru tipidir.\n\nHazırlık İpucu: Dinlerken not alın — ana konu, 2-3 önemli alt başlık ve varsa örnek/sayısal veriler yeterlidir, her kelimeyi yazmaya çalışmayın. Yeniden anlatırken dersin orijinal cümlelerini birebir tekrarlamak yerine kendi kelimelerinizle, mantıklı bir sırayla aktarın.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 5, contentBody: "60-90 saniye uzunluğunda bir akademik ders/konuşma kaydı dinletilir (bazen ekranda ilgili bir görsel de gösterilir). Kayıt bittikten sonra kısa bir hazırlık süresi ve ardından cevap vermeniz için 40 saniye verilir. Bu soru tipinden sınavda genellikle 3-4 soru sorulur." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "İçerik puanı, dersin ana fikrini ve kilit noktalarını ne kadar kapsamlı aktardığınıza göre belirlenir; birebir kelime eşleşmesi aranmaz, anlam bütünlüğü önemlidir. Notlarınızdaki ana başlıkları sırayla kullanarak akıcı, tam cümlelerle konuşun; 'The lecture talks about...', 'It also mentions that...', 'In conclusion...' gibi bağlayıcı kalıplar cevabınızı daha organize gösterir." },
      ],
    },
    {
      slug: "answer-short-question",
      name: "Answer Short Question",
      questionCount: 12,
      description:
        "Answer Short Question, PTE'nin en kısa soru tipidir: kısa bir soru dinletilir ve cevabınızı tek bir kelime veya çok kısa bir ifadeyle vermeniz beklenir. Genel kültür ve temel kelime bilginizi hızlıca ölçer.\n\nHazırlık İpucu: Soruyu dikkatle dinleyin ve olabildiğince kısa, net cevap verin — uzun cümleler kurmaya çalışmak zaman kaybettirir ve gereksizdir. Emin olmasanız bile en olası cevabı hemen söyleyin; boş bırakmak yerine tahmin etmek her zaman daha avantajlıdır.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 5, contentBody: "Kulaklıktan kısa bir soru dinletilir (örneğin 'What do we call a doctor who treats children?'). Kayıt bittikten hemen sonra mikrofon açılır ve 10 saniye içinde tek kelime veya çok kısa bir ifadeyle cevap vermeniz beklenir. Bu soru tipi sınavda en çok soru içeren tiplerden biridir (10-12 soru)." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Puanlama tamamen doğru/yanlış esasına dayanır; doğru cevap tam puan, yanlış veya boş cevap sıfır puan getirir. Genel akademik kelime dağarcığınızı (meslekler, bilim terimleri, günlük kavramlar) düzenli tekrar ederek genişletmek bu bölümde en etkili hazırlık yöntemidir." },
      ],
    },
    {
      slug: "summarize-written-text",
      name: "Summarize Written Text",
      questionCount: 3,
      description:
        "Summarize Written Text, Konuşma bölümünden Yazma bölümüne geçişte ilk soru tipidir. Ekranda 300 kelimelik bir akademik metin belirir; bu metni 10 dakika içinde TEK bir cümlede, 5-75 kelime arasında özetlemeniz beklenir.\n\nHazırlık İpucu: Özet cümlenizi mutlaka bağlaçlarla (although, because, which, and) birleştirilmiş TEK bir cümle olarak yazın — iki cümle yazarsanız puan alamazsınız. Metnin ana fikrini ve en önemli 2-3 destekleyici noktayı yakalamaya odaklanın, küçük detayları atlayın.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Yaklaşık 300 kelimelik akademik bir metin okursunuz ve bunu 5-75 kelime aralığında, gramer açısından doğru TEK bir cümleyle özetlemeniz istenir. Görev için 10 dakikanız vardır. Sınavda genellikle 2-3 soru bu formatta sorulur." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Puanlama üç ayrı kritere göre yapılır: içerik (ana fikri doğru yakalama), form (tek cümle, 5-75 kelime sınırına uyma) ve dilbilgisi/kelime/yazım gibi yetkinlik puanları. Kelime sınırının dışına çıkan veya birden fazla cümleden oluşan cevaplar form puanını sıfırlar, bu yüzden yazdıktan sonra mutlaka kelime sayınızı kontrol edin." },
      ],
    },
    {
      slug: "write-essay",
      name: "Write Essay",
      questionCount: 2,
      description:
        "Write Essay, PTE'nin en uzun süreli görevlerinden biridir. Verilen bir konu hakkında 200-300 kelimelik, tartışmacı (argumentative) bir kompozisyon yazmanız için 20 dakikanız vardır.\n\nHazırlık İpucu: Klasik giriş-gelişme-sonuç yapısını kullanın: girişte konuya ve kendi görüşünüze yer verin, gelişme paragraflarında 2-3 gerekçe ve örnekle görüşünüzü destekleyin, sonuçta görüşünüzü kısaca tekrarlayın. Kelime sayınızı 200-300 aralığında tutmaya özellikle dikkat edin.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Ekranda genellikle güncel veya akademik bir tartışma konusu belirir (örneğin teknolojinin eğitime etkisi). 200-300 kelime aralığında, açık bir tez cümlesi içeren bir deneme yazmanız için 20 dakikanız vardır. Sınavda bu formatta genellikle 1-2 soru sorulur." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Puanlama; içerik, form (200-300 kelime aralığı), gelişim/yapı/tutarlılık, dilbilgisi, kelime ve yazım olmak üzere birçok alt kritere göre yapılır. Paragraflar arasında açık geçiş ifadeleri (furthermore, on the other hand, in conclusion) kullanmak, yapı ve tutarlılık puanınızı doğrudan yükseltir." },
      ],
    },
    {
      slug: "reading-mcq-single",
      name: "Multiple-choice (Tek Cevap)",
      questionCount: 3,
      description:
        "Bu soru tipinde kısa bir akademik metin (110 kelimeye kadar) okur ve metinle ilgili çoktan seçmeli bir soruyu, verilen seçeneklerden YALNIZCA birini işaretleyerek cevaplarsınız. Metni anlama ve çıkarım yapma becerinizi ölçer.\n\nHazırlık İpucu: Önce soruyu okuyup ne arandığını belirleyin, sonra metni o soruya odaklanarak tarayın. Bu soru tipinde yanlış cevap için puan kırılmaz, bu yüzden emin olmasanız bile mutlaka bir seçenek işaretleyin.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Ekranda kısa bir paragraf (110 kelimeye kadar) ve altında 3-5 seçenekli bir soru bulunur; doğru seçeneği tek bir radyo düğmesiyle işaretlersiniz. Doğru cevap tam puan, yanlış cevap sıfır puan getirir — negatif puanlama yoktur, bu yüzden boş bırakmak yerine her zaman bir tahminde bulunun." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Önce metni hızlıca tarayarak ana fikri kavrayın, ardından soruyu ve seçenekleri okuyun; sonra metne dönüp cevabı arayın. Emin değilseniz her seçeneği metinle 'evet/hayır' mantığıyla karşılaştırarak eleyin — yanlış olduğunu düşündüklerinizi sırayla çıkarın, geriye kalan doğru cevabınızdır. Bilmediğiniz kelimelerle çok fazla vakit kaybetmeyin; metnin genel akışından anlamını tahmin etmeye çalışın." },
      ],
    },
    {
      slug: "reading-mcq-multiple",
      name: "Multiple-choice (Çoklu Cevap)",
      questionCount: 3,
      description:
        "Bu soru tipinde bir metinle (300 kelimeye kadar) ilgili sorunun BİRDEN FAZLA doğru cevabı olabilir; doğru gördüğünüz TÜM seçenekleri işaretlemeniz gerekir. Reading bölümünde negatif puanlamanın uygulandığı tek soru tipidir.\n\nHazırlık İpucu: Her seçeneği metinle tek tek karşılaştırın ve yalnızca metinde açıkça desteklenen seçenekleri işaretleyin. Emin olmadığınız seçenekleri işaretlememek, yanlış tahminle puan kaybetmekten daha güvenlidir.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Ekranda bir metin (300 kelimeye kadar) ve altında birden fazla doğru cevabı olabilecek, kutucuklu (checkbox) bir soru bulunur. Doğru işaretlenen her seçenek +1, yanlış işaretlenen her seçenek -1 puan getirir (bir soru için toplam puanınız en az sıfırdır); bu yüzden metinde açıkça geçmeyen veya metinle çelişen seçenekleri asla işaretlemeyin." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Bir soru için toplam puanınız asla sıfırın altına düşmez, bu yüzden emin olduğunuz seçenekleri cesurca işaretleyin. Genellikle 5 seçenekten en fazla ikisi ya da üçü doğrudur; metinde açıkça desteklenmeyen, 'eksik' bilgi içeren veya kayıttaki/metindeki bağlamı değiştiren çeldiricileri eleyin. Şüpheli seçenekleri boş bırakmak, yanlış işaretleyip puan kaybetmekten daha güvenlidir." },
      ],
    },
    {
      slug: "reading-reorder-paragraphs",
      name: "Re-order Paragraphs",
      questionCount: 3,
      description:
        "Bu soru tipinde birbirine karışmış halde verilen metin parçalarını (150 kelimeye kadar), sürükle-bırak yöntemiyle mantıklı ve akıcı bir sıraya koymanız istenir. Metin bütünlüğü ve bağlaç kullanımını anlama becerinizi ölçer.\n\nHazırlık İpucu: Önce 'konu cümlesini' (genel bir ifade içeren, başka bir cümleye referans vermeyen paragrafı) bulun — bu genellikle ilk sıradadır. Ardından 'this', 'these', 'however', 'therefore' gibi bağlaç ve zamirleri takip ederek hangi cümlenin hangisinden sonra geldiğini belirleyin.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Ekranın solunda karışık sırada metin kutuları, sağında ise boş bir sıralama alanı bulunur; kutuları doğru sıraya göre sağ tarafa sürüklersiniz. Puanlama, doğru sıralanan her 'ardışık çift' için verilir — tamamını mükemmel sıralayamasanız bile bazı çiftleri doğru yaparsanız kısmi puan alırsınız, bu yüzden emin olduğunuz çiftleri önce yerleştirin." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Önce hangi cümlenin diğerinden SONRA geldiğini gösteren ikili eşleşmeler kurmaya çalışın; zamirler (this, these, it), bağlaçlar (however, therefore, moreover) ve artikeller (the) genellikle önceki cümleye referans verir. Genel kural: A cümlesi B'den sonra geliyorsa sıra BA, BCA veya BDA olabilir — yani aralarına başka cümleler girebilir, bitişik olmaları şart değildir. Sıralamayı bitirdikten sonra mutlaka baştan sona okuyup anlam bütünlüğünü kontrol edin." },
      ],
    },
    {
      slug: "reading-fill-in-blanks",
      name: "Fill in the Blanks",
      questionCount: 5,
      description:
        "Bu soru tipinde bir metin (80 kelimeye kadar) içindeki birkaç boşluğa, ekranın üst kısmında verilen kelime havuzundan sürükle-bırak yöntemiyle uygun kelimeyi yerleştirmeniz istenir. Dilbilgisi ve kelime bilgisini bağlam içinde ölçer.\n\nHazırlık İpucu: Önce metnin tamamını hızlıca okuyarak genel anlamı kavrayın, sonra her boşluğu tek tek doldurun. Boşluğun etrafındaki kelimelere (edatlar, fiil çekimleri, eş dizim kalıpları) dikkat edin; çoğu zaman doğru cevap dilbilgisel uyuma bakılarak bulunabilir.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Metindeki her boşluk için ekranın üst kısmında sürüklenebilir kelime seçenekleri bulunur; her kelime yalnızca bir kez kullanılabilir. Doğru yerleştirilen her kelime için 1 puan, yanlış yerleştirilen için 0 puan alırsınız (negatif puanlama yoktur); emin olmadığınız boşluklarda bile en mantıklı seçeneği yerleştirin." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Önce emin olduğunuz boşlukları doldurun; her doldurduğunuz kelime havuzdan çıkacağı için kalan boşluklar giderek kolaylaşır. Eş dizim (collocation) bilginizi kullanın — İngilizce'de bazı kelimeler belirli kelimelerle birlikte kullanılır (örn. 'make a decision', 'heavy rain'); boşluğun gerektirdiği kelime türünü (isim, fiil, sıfat) belirlemek de doğru seçeneği hızlıca bulmanızı sağlar." },
      ],
    },
    {
      slug: "reading-writing-fill-in-blanks",
      name: "Fill in the Blanks (Okuma-Yazma)",
      questionCount: 6,
      description:
        "Bu soru tipi, Reading: Fill in the Blanks'e benzer ancak kelime havuzu yerine her boşluk için ayrı bir AÇILIR MENÜ (dropdown) sunulur; metin 300 kelimeye kadar uzayabilir ve seçenekler genellikle birbirine anlamca veya biçimce çok yakın kelimelerden oluşur. Hem okuma hem yazma/dilbilgisi becerisini ölçer.\n\nHazırlık İpucu: Her açılır menüdeki seçenekleri dikkatle karşılaştırın — genellikle aynı kelimenin farklı biçimleri veya birbirine yakın anlamlı kelimeler arasından seçim yaparsınız. Cümlenin gramer yapısına (zaman, özne-yüklem uyumu) odaklanmak doğru seçeneği bulmanın en hızlı yoludur.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Metindeki her boşluğun yanında küçük bir açılır menü ikonu bulunur; tıkladığınızda 3-4 seçenek arasından birini seçersiniz. Bu soru tipi sınavda genellikle en fazla boşluk içeren (5-6) sorulardan biridir ve her doğru seçim ayrı ayrı puanlanır (negatif puanlama yoktur)." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Açılır menüdeki seçenekler genellikle aynı kelimenin farklı biçimleri (fiil zamanı, tekil/çoğul) veya birbirine anlamca çok yakın kelimelerdir; cümlenin öznesine, zamanına ve önceki/sonraki kelimelere dikkat ederek dilbilgisel olarak en uygun seçeneği bulun. Metnin genel akışını bozan veya mantıksal olarak uymayan seçenekleri kolayca eleyebilirsiniz." },
      ],
    },
    {
      slug: "listening-summarize-spoken-text",
      name: "Summarize Spoken Text",
      questionCount: 3,
      description:
        "Listening bölümünün ilk ve en uzun süreli soru tipidir. 60-90 saniyelik akademik bir konuşma dinletilir; dinlediğinizi 50-70 kelimelik bir paragrafla özetlemeniz için 10 dakikanız vardır.\n\nHazırlık İpucu: Dinlerken ana fikri ve 3-4 önemli destekleyici noktayı not alın. Özetinizi yazarken notlarınızı tam cümlelere dönüştürün ve kelime sayısını (50-70) mutlaka kontrol edin; hem çok kısa hem çok uzun özetler form puanınızı düşürür.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "60-90 saniyelik bir ders/konuşma kaydı bir kez dinletilir. Dinledikten sonra 50-70 kelimelik bir paragrafla konuşmayı özetlemeniz için 10 dakikanız vardır. Bu soru tipi hem Listening hem Writing puanına katkı sağlar." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Puanlama; içerik (konuşmanın ana noktalarını kapsama), form (kelime sayısı ve paragraf yapısı) ve dilbilgisi/kelime/yazım gibi yetkinlik kriterlerine göre yapılır. Not alırken kısaltmalar ve semboller kullanmak (örn. 'w/' = with, '→' = leads to), dinlerken hem anlamaya hem yazmaya zaman ayırmanızı kolaylaştırır." },
      ],
    },
    {
      slug: "listening-mcq-multiple",
      name: "Multiple-choice (Çoklu Cevap)",
      questionCount: 3,
      description:
        "Kısa bir ses kaydı (40-90 saniye) dinletildikten sonra, birden fazla doğru cevabı olabilecek bir soru sorulur; doğru gördüğünüz tüm seçenekleri işaretlemeniz gerekir. Listening bölümünde negatif puanlamanın uygulandığı iki soru tipinden biridir.\n\nHazırlık İpucu: Kaydı dinlerken seçeneklerle örtüşen bilgileri not alın. Sadece kayıtta açıkça belirtilen seçenekleri işaretleyin; kayıtta geçmeyen veya çelişen seçenekleri işaretlemek -1 puan getirir.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Kısa bir ses kaydı (40-90 saniye) dinletilir, ardından ekranda birden fazla doğru cevabı olabilecek kutucuklu bir soru belirir. Doğru işaretlenen her seçenek +1, yanlış işaretlenen her seçenek -1 puan getirir; bu yüzden yalnızca kayıtta net şekilde desteklenen seçenekleri işaretlemek en güvenli stratejidir." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Kayıt başlamadan önce soru ve seçenekleri hızlıca gözden geçirin; bu neye odaklanmanız gerektiği konusunda güçlü bir ipucu verir. Dinlerken Erasable Note Pad'e tam cümle değil, sadece anahtar kelimeler yazın. Bir soru için toplam puanınız en az sıfırdır, bu yüzden sadece kayıtta net biçimde belirtilen seçenekleri işaretleyin; eksik bilgi içeren veya bağlamı değiştirilmiş çeldiricilere dikkat edin." },
      ],
    },
    {
      slug: "listening-fill-in-blanks",
      name: "Fill in the Blanks",
      questionCount: 3,
      description:
        "Bir ses kaydı (30-60 saniye) dinlerken, ekranda kaydın yazıya dökülmüş hali (transkript) belirir ve bu transkriptteki bazı kelimeler eksiktir. Dinlediğiniz kelimeleri doğru yazarak boşlukları doldurmanız gerekir.\n\nHazırlık İpucu: Kaydı dinlerken transkripti takip edin ve duyduğunuz kelimeyi anında yazın — kaydı durdurma veya geri sarma imkanınız yoktur. Kelimeleri doğru yazmak (imla) önemlidir, bu yüzden düzenli dikte pratiği yapmak bu bölüm için çok faydalıdır.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Ekranda kaydın metni belirir, bazı kelimeler boş bırakılmıştır; kayıt (30-60 saniye) çalarken bu boşluklara doğru kelimeyi yazarsınız. Doğru yazılan her kelime için 1 puan alırsınız (negatif puanlama yoktur); imla hatası olan cevaplar yanlış sayılır, bu yüzden yaygın akademik kelimelerin yazımını tekrar etmek önemlidir." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Kayıt başlamadan önce transkripti inceleyip bağlam ipuçlarını not edin — eksik kelime metnin başka bir yerinde tekrar geçmiş olabilir. İmleci ilk boşlukta tutup Tab tuşuyla bir sonrakine geçin ve okumanızın kayıtla aynı hızda ilerlemesine dikkat edin. Bir kelimeyi kaçırsanız bile metnin akışından tahmin ederek geri dönüp doldurabilirsiniz — göndermeden önce mutlaka kontrol edin." },
      ],
    },
    {
      slug: "listening-highlight-correct-summary",
      name: "Highlight Correct Summary",
      questionCount: 3,
      description:
        "Bir ses kaydı (30-90 saniye) dinlettikten sonra, ekranda kaydı özetleyen birkaç paragraf seçeneği sunulur; bunlardan kaydı EN DOĞRU şekilde özetleyen paragrafı seçmeniz istenir. Genel anlama ve özetleme becerinizi ölçer.\n\nHazırlık İpucu: Kaydı dinlerken ana fikri not alın, ardından her seçenek paragrafı bu ana fikirle karşılaştırın. Yanıltıcı seçenekler genellikle doğru ayrıntıları yanlış bir sonuçla birleştirir; her paragrafı kaydın gerçek mesajıyla karşılaştırarak okuyun.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Kayıt (30-90 saniye) dinletildikten sonra ekranda 3-5 paragraf seçeneği belirir; kaydı en iyi özetleyen TEK paragrafı seçersiniz. Doğru cevap tam puan, yanlış cevap sıfır puan getirir — negatif puanlama yoktur, bu yüzden emin olmasanız bile en olası seçeneği işaretleyin." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Kayıt başlamadan önce seçenekleri gözden geçirin ama dinlerken okumayın, sadece dinlemeye odaklanın. Yanlış seçenekler genellikle ya önemli bir unsuru atlar, ya bir unsuru farklı bir bağlamda sunar ya da kayıtta olmayan fazladan bir detay ekler. Dinledikten sonra kendi özetinizi zihninizde oluşturup bu üç hata türüne dikkat ederek seçenekleri eleyin." },
      ],
    },
    {
      slug: "listening-mcq-single",
      name: "Multiple-choice (Tek Cevap)",
      questionCount: 3,
      description:
        "Bir ses kaydı (30-60 saniye) dinlettikten sonra, kayıtla ilgili bir soru sorulur ve verilen seçeneklerden yalnızca BİRİNİ işaretlemeniz istenir. Kaydı genel olarak anlama ve detay yakalama becerinizi ölçer.\n\nHazırlık İpucu: Soruyu dinlemeden önce ekranda görünen seçeneklere göz atarak neye odaklanmanız gerektiğini tahmin edin. Genellikle doğru cevap kayıtta geçen ifadenin eş anlamlısı şeklinde sunulur, birebir aynı kelimeler aranmaz.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Kısa bir ses kaydı (30-60 saniye) dinletilir, ardından 3-5 seçenekli bir soru belirir ve yalnızca bir seçeneği işaretlersiniz. Doğru cevap tam puan, yanlış cevap sıfır puan getirir; negatif puanlama olmadığı için her zaman bir seçenek işaretlemelisiniz." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Kayıt başlamadan önce soru ve seçenekleri okuyun; bu neyi dinlemeniz gerektiğine dair güçlü bir ipucu verir. Dinlerken anahtar kelimeleri not alın ve eksik veya ilgisiz bilgi içeren seçenekleri eleyin. Doğru cevabı seçerken kayıtta geçen KELİMELERE değil ANLAMA odaklanın — doğru seçenek çoğu zaman kayıttaki ifadenin farklı kelimelerle yeniden yazılmış halidir." },
      ],
    },
    {
      slug: "listening-select-missing-word",
      name: "Select Missing Word",
      questionCount: 3,
      description:
        "Bu soru tipinde bir ses kaydı (20-70 saniye) dinletilir, ancak kaydın SON kelimesi veya son birkaç kelimesi bir 'bip' sesiyle değiştirilmiştir. Kaydın bağlamına göre, o son kısımda ne söylenmiş olabileceğini seçenekler arasından bulmanız istenir.\n\nHazırlık İpucu: Kaydın son cümlesine ve genel bağlamına özellikle dikkat edin; cevabı bulmak için kaydın tamamının anlamını kavramış olmanız gerekir. Seçenekler genellikle dilbilgisel olarak doğru ama anlamca yanlış olacak şekilde tasarlanır.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Kayıt (20-70 saniye) normal şekilde başlar ancak son kelime(ler) bir bip sesiyle kapatılır; ardından 3-4 seçenek arasından kaydın bağlamına en uygun tamamlayıcıyı seçersiniz. Doğru cevap tam puan, yanlış cevap sıfır puan getirir; negatif puanlama yoktur." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Kayıt başlamadan önce seçenekleri okuyarak konunun ne olabileceğini tahmin edin. Dinlerken genel argümanın akışını takip edin ve özellikle kaydın SON KISMINA dikkat kesilin — bip sesinden hemen önceki cümleler eksik kelime için en güçlü ipucunu verir. Ses göstergesini takip ederek kaydın ne zaman biteceğini önceden kestirebilirsiniz." },
      ],
    },
    {
      slug: "listening-highlight-incorrect-words",
      name: "Highlight Incorrect Words",
      questionCount: 3,
      description:
        "Bir ses kaydı (15-50 saniye) dinlerken, ekranda kaydın yazıya dökülmüş hali belirir; ancak bu transkriptte kayıtta söylenenle UYUŞMAYAN bazı kelimeler bulunur. Bu farklı kelimeleri tıklayarak işaretlemeniz istenir. Listening bölümünde negatif puanlamanın uygulandığı ikinci soru tipidir.\n\nHazırlık İpucu: Transkripti kayıtla eş zamanlı, kelime kelime takip edin; duyduğunuz kelime ile ekrandaki kelime uyuşmadığı anda tıklayın. Emin olmadığınız kelimeleri işaretlememek daha güvenlidir, çünkü yanlış işaretlenen her doğru kelime -1 puan getirir.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Ekranda kaydın metni belirir; kayıt (15-50 saniye) çalarken metindeki bazı kelimeler aslında kayıtta söylenenden farklıdır ve bu kelimeleri fare ile tıklayarak seçmeniz gerekir. Doğru işaretlenen her farklı kelime +1, yanlış işaretlenen (aslında doğru olan) her kelime -1 puan getirir." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Kayıt başlamadan önce metni gözden geçirin; bazı uyumsuz kelimeler ilk bakışta fark edilebilir. Kayıt başladığında imleci metinle birlikte kelime kelime takip edin — uyumsuz kelimeler genellikle söylenen kelimeyle kulağa benzer gelir (örn. 'stationery' yerine 'stationary'). Bu soruda da negatif puanlama vardır, bu yüzden yalnızca emin olduğunuz kelimeleri işaretleyin." },
      ],
    },
    {
      slug: "listening-write-from-dictation",
      name: "Write from Dictation",
      questionCount: 4,
      description:
        "Listening bölümünün son ve en kısa soru tipidir. Kısa bir cümle (3-5 saniye, yaklaşık 10 kelime) bir kez dinletilir; duyduğunuz cümleyi harfi harfine, doğru yazımla yazmanız istenir.\n\nHazırlık İpucu: Cümleyi dinlerken zihninizde tekrar edin ve hemen ardından yazmaya başlayın — kaydı tekrar dinleme imkanınız yoktur. Büyük harf, noktalama ve yaygın kelimelerin doğru yazımına dikkat edin; bu soru tipi aynı zamanda dilbilgisi ve yazım puanınıza da katkı sağlar.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Kısa bir cümle (3-5 saniye, yaklaşık 10 kelime) bir kez dinletilir, ardından boş bir metin kutusuna duyduğunuz cümleyi yazarsınız. Doğru yazılan her kelime için 1 puan alırsınız; kelime sırası ve imla önemlidir, bu yüzden düzenli dikte alıştırması yapmak bu soru tipi için en etkili hazırlık yöntemidir." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Duyar duymaz yazmaya başlayın; bir kelimeyi hatırlayamasanız bile cümlenin akışını bozmadan devam edin, dilbilgisi bilginizi kullanarak boşluğu daha sonra mantıklı bir kelimeyle tamamlayabilirsiniz. Kaçırdığınız veya yanlış yazdığınız her kelime bir puan kaybettirir, ancak fazladan eklediğiniz bir kelime (örneğin bir artikel) puan kırmaz. Cümleyi yazdıktan sonra kalan sürede mutlaka yazım hatalarını kontrol edin — akıcılığı bozmadan, cümlenin sonunda düzeltme yapmak en güvenlisidir." },
      ],
    },
  ];
  const pteTopicMeta = {
    "read-aloud": { category: "SPEAKING", skillsTested: "Telaffuz, Akıcılık, Okuma", difficulty: "Orta" },
    "repeat-sentence": { category: "SPEAKING", skillsTested: "Dinleme, Hafıza, Telaffuz", difficulty: "Zor" },
    "describe-image": { category: "SPEAKING", skillsTested: "Akıcılık, Kelime Bilgisi", difficulty: "Orta" },
    "retell-lecture": { category: "SPEAKING", skillsTested: "Dinleme, Özetleme, Akıcılık", difficulty: "Zor" },
    "answer-short-question": { category: "SPEAKING", skillsTested: "Genel Kültür, Kelime Bilgisi", difficulty: "Kolay" },
    "summarize-written-text": { category: "WRITING", skillsTested: "Okuduğunu Anlama, Yazma, Dilbilgisi", difficulty: "Orta" },
    "write-essay": { category: "WRITING", skillsTested: "Yazma, Dilbilgisi, Fikir Geliştirme", difficulty: "Zor" },
    "reading-mcq-single": { category: "READING", skillsTested: "Okuduğunu Anlama, Çıkarım", difficulty: "Kolay" },
    "reading-mcq-multiple": { category: "READING", skillsTested: "Okuduğunu Anlama, Detay Analizi", difficulty: "Zor" },
    "reading-reorder-paragraphs": { category: "READING", skillsTested: "Metin Bütünlüğü, Bağlaçlar", difficulty: "Zor" },
    "reading-fill-in-blanks": { category: "READING", skillsTested: "Dilbilgisi, Kelime Bilgisi", difficulty: "Orta" },
    "reading-writing-fill-in-blanks": { category: "READING", skillsTested: "Dilbilgisi, Eş Dizim", difficulty: "Orta" },
    "listening-summarize-spoken-text": { category: "LISTENING", skillsTested: "Dinleme, Not Alma, Yazma", difficulty: "Zor" },
    "listening-mcq-multiple": { category: "LISTENING", skillsTested: "Dinleme, Detay Analizi", difficulty: "Zor" },
    "listening-fill-in-blanks": { category: "LISTENING", skillsTested: "Dinleme, Yazım", difficulty: "Orta" },
    "listening-highlight-correct-summary": { category: "LISTENING", skillsTested: "Dinleme, Özetleme", difficulty: "Orta" },
    "listening-mcq-single": { category: "LISTENING", skillsTested: "Dinleme, Anlama", difficulty: "Kolay" },
    "listening-select-missing-word": { category: "LISTENING", skillsTested: "Dinleme, Bağlam Analizi", difficulty: "Orta" },
    "listening-highlight-incorrect-words": { category: "LISTENING", skillsTested: "Dinleme, Dikkat", difficulty: "Zor" },
    "listening-write-from-dictation": { category: "LISTENING", skillsTested: "Dinleme, Yazım, Dilbilgisi", difficulty: "Orta" },
  };
  const pteExamples = {
    "read-aloud": [
      `Örnek metin: "Regular exercise not only strengthens the body but also improves mood and reduces stress levels."\nBu cümleyi okurken 'regular exercise', 'improves mood' ve 'reduces stress levels' öbeklerini tek nefeste okuyup virgülden önce kısa bir duraklama yapın; 'not only... but also' yapısında vurguyu her iki bağlaca da verin.`,
      `Örnek metin: "Museums play a crucial role in preserving cultural heritage for future generations."\nMetni okurken 'crucial role' ve 'cultural heritage' gibi öbekleri net telaffuz edin; 'for future generations' ifadesini cümlenin sonunda hafif alçalan bir tonlamayla bitirin.`,
      `Örnek metin: "Many coastal cities face the growing threat of rising sea levels caused by climate change."\n'Coastal cities', 'rising sea levels' ve 'climate change' terimlerini vurgulu ama doğal bir tempoda okuyun; 'caused by' öbeğinden önce çok kısa bir nefes alın.`,
      `Örnek metin: "The invention of the printing press dramatically changed the way information was shared across Europe."\nBu cümlede 'printing press', 'dramatically changed' ve 'shared across Europe' anahtar öbeklerdir; 'dramatically' kelimesindeki vurguyu abartmadan, doğal bir tonlamayla okuyun.`,
      `Örnek metin: "Although artificial intelligence offers many benefits, it also raises serious ethical questions about privacy."\n'Although' ile başlayan yan cümleden sonra kısa bir duraklama yapın, ardından 'raises serious ethical questions' öbeğini tek bir nefeste, net bir vurguyla tamamlayın.`,
      `Örnek metin: "Deforestation in tropical regions contributes significantly to the loss of biodiversity worldwide."\n'Deforestation', 'tropical regions' ve 'biodiversity' gibi çok heceli kelimelerin telaffuzuna özellikle dikkat edin; kelimeleri yavaşlatmadan, hece hece net söyleyin.`,
      `Örnek metin: "Despite significant advances in medicine, access to healthcare remains unequal in many parts of the world."\n'Despite' ile başlayan zıtlık ifadesinden sonra ses tonunuzu hafifçe değiştirin; 'remains unequal' öbeğini cümlenin ana vurgusu olarak öne çıkarın.`,
      `Örnek metin: "The committee's decision to postpone the conference was met with considerable disappointment among the delegates."\n'Postpone', 'considerable' ve 'delegates' kelimelerinin telaffuzuna hazırlıklı olun; iyelik eki olan "committee's" ifadesini tek kelime gibi akıcı okuyun.`,
      `Örnek metin: "Quantum computing has the potential to revolutionize fields ranging from cryptography to drug discovery."\n'Quantum computing', 'revolutionize' ve 'cryptography' gibi teknik terimleri net ama akıcı şekilde telaffuz edin; 'ranging from... to...' yapısını tek bir bütün öbek olarak okuyun.`,
      `Örnek metin: "Notwithstanding the criticism it initially received, the policy has proven remarkably effective in reducing unemployment."\n'Notwithstanding' gibi resmi bir bağlacı doğru telaffuz etmek zorluk yaratabilir; cümleyi anlam bloklarına ayırıp ('Notwithstanding the criticism it initially received' / 'the policy has proven remarkably effective') iki büyük öbek halinde okumak akıcılığınızı artırır.`,
    ],
    "repeat-sentence": [
      `Örnek cümle (dinletilen): "The train departs at nine o'clock."\nBu kısa cümlede sadece üç anahtar bilgi vardır: ne, ne zaman, ne yapıyor; bu üçünü doğru sırayla söylemek yeterlidir.`,
      `Örnek cümle (dinletilen): "She forgot her umbrella at the office."\nCümlenin anlamına odaklanın (kim, neyi, nerede unuttu); kelimeleri ezberlemek yerine bu üç bilgiyi bir araya getirerek tekrar edin.`,
      `Örnek cümle (dinletilen): "The new policy will take effect starting next month."\n'Take effect' gibi kalıp ifadeleri tek bir birim olarak hafızanızda tutun; 'starting next month' zaman ifadesini cümlenin sonuna doğru vurgulayın.`,
      `Örnek cümle (dinletilen): "Researchers discovered a previously unknown species of frog in the rainforest."\nCümleyi 'kim buldu – neyi buldu – nerede buldu' şeklinde üç bloğa ayırarak dinleyin ve bu sırayla tekrar edin.`,
      `Örnek cümle (dinletilen): "Although the meeting ran late, everyone stayed until the final decision was made."\n'Although' ile başlayan zıtlık yapısını fark edin; iki yarı cümleyi birbirine bağlayan mantığı kavradığınızda kelimeleri hatırlamak kolaylaşır.`,
      `Örnek cümle (dinletilen): "The professor asked the students to submit their assignments electronically by Friday."\nCümledeki dört bilgiyi (kim istedi, ne istedi, nasıl, ne zamana kadar) sırayla zihninizde canlandırarak tekrar edin.`,
      `Örnek cümle (dinletilen): "Unless the weather improves significantly, the outdoor ceremony will be moved indoors."\n'Unless' koşul yapısını doğru vurgulayın; cümlenin sonundaki 'moved indoors' ifadesini net bir şekilde tamamlayın.`,
      `Örnek cümle (dinletilen): "The company's quarterly earnings exceeded analysts' expectations for the third consecutive year."\nUzun ve sayısal detay içeren bu cümlede 'exceeded expectations' ve 'third consecutive year' öbeklerini ayrı ayrı hafızada tutmaya çalışın.`,
      `Örnek cümle (dinletilen): "Had the government invested earlier in renewable infrastructure, the energy crisis might have been avoided."\nBu tür devrik (inverted conditional) yapılarda önce cümlenin genel mantığını kavrayın, ardından kelimeleri bu çerçeveye yerleştirin.`,
      `Örnek cümle (dinletilen): "Notwithstanding several logistical setbacks, the research team managed to complete the expedition ahead of schedule."\nBu uzun ve resmi cümlede 'notwithstanding setbacks' ve 'ahead of schedule' gibi zıt anlamlı iki öbeği ayırt ederek hafızanızda iki ayrı blok halinde tutun.`,
    ],
    "describe-image": [
      `Örnek görsel: Bir kafenin haftalık kahve satışlarını gösteren basit bir çubuk grafik.\nÖrnek cevap: "This bar chart shows the café's coffee sales throughout the week. Overall, sales were highest on Saturday and lowest on Monday, with a gradual increase from the start of the week."\nBaşlık, en yüksek/en düşük gün ve genel eğilimle cevabınızı bu sırayla yapılandırın.`,
      `Örnek görsel: Üç farklı ülkede cep telefonu kullanım oranlarını karşılaştıran çubuk grafik.\nÖrnek cevap: "This bar graph compares mobile phone usage rates across three countries. Country A has the highest usage rate at around 85%, while Country C lags behind at just 60%."\nKarşılaştırma yaparken 'compared to', 'whereas', 'while' gibi bağlaçları kullanın.`,
      `Örnek görsel: Bir şehrin toplu taşıma ile özel araç kullanım oranlarının yıllar içindeki değişimini gösteren çizgi grafik.\nÖrnek cevap: "This line graph illustrates the change in public transport versus private car usage between 2010 and 2022. Public transport usage rose steadily, while private car usage showed a slight decline after 2015."\nİki farklı eğilimi ayrı ayrı ama bağlantılı şekilde anlatın.`,
      `Örnek görsel: Bir şirketin pazar payını rakipleriyle karşılaştıran pasta grafik.\nÖrnek cevap: "This pie chart displays market share among four competing companies. Company X dominates the market with 45%, more than double the share of its nearest competitor."\nEn büyük ve en küçük dilimleri mutlaka belirtin, oranları yaklaşık olarak ifade edin.`,
      `Örnek görsel: Bir fabrikanın üretim sürecini gösteren beş aşamalı bir akış diyagramı.\nÖrnek cevap: "This diagram outlines the five stages of the manufacturing process, beginning with raw material collection and ending with quality control before distribution."\nSüreç diyagramlarında aşamaları 'first, then, next, finally' gibi sıralama bağlaçlarıyla anlatın.`,
      `Örnek görsel: Bir üniversite kampüsünün haritası, ana binaların konumlarını gösteriyor.\nÖrnek cevap: "This map shows the layout of the university campus. The library is located at the center, with the science building to the north and the sports complex to the south."\nKonum bildiren 'to the north/south/east/west of' ifadelerini doğru kullanın.`,
      `Örnek görsel: Dört farklı yaş grubunun sosyal medya kullanım alışkanlıklarını karşılaştıran karmaşık bir tablo.\nÖrnek cevap: "This table compares social media habits across four age groups. Notably, the 18-24 age group spends the most time online, averaging over four hours daily, whereas users over 55 average less than one hour."\nKarmaşık tablolarda en çarpıcı 2-3 karşılaştırmaya odaklanın, her hücreyi okumaya çalışmayın.`,
      `Örnek görsel: Bir ülkenin 1990-2020 arası karbon emisyonlarını sektörlere göre gösteren yığılmış çubuk grafik.\nÖrnek cevap: "This stacked bar chart breaks down carbon emissions by sector from 1990 to 2020. While emissions from the energy sector have declined, transportation emissions have risen sharply, becoming the dominant contributor by 2020."\nYığılmış grafiklerde hem toplam eğilimi hem de en çok değişen katmanı belirtin.`,
      `Örnek görsel: Bir hastanenin acil servis bekleme sürelerini gün içindeki saatlere göre gösteren dalgalı bir çizgi grafik.\nÖrnek cevap: "This line graph tracks emergency room waiting times throughout a 24-hour period. Waiting times peak sharply between 6 PM and 9 PM before dropping to their lowest point in the early morning hours."\nDalgalanan grafiklerde tepe ve dip noktalarını olası nedenleriyle birlikte yorumlamak cevabınızı zenginleştirir.`,
      `Örnek görsel: Beş değişkeni (fiyat, kalite, hız, güvenilirlik, müşteri hizmeti) karşılaştıran bir örümcek ağı (radar) grafiği ile iki rakip şirketi kıyaslıyor.\nÖrnek cevap: "This radar chart compares two companies across five performance criteria. Company A outperforms Company B in reliability and customer service, but falls behind in price competitiveness."\nAlışılmadık grafik türlerinde önce grafiğin neyi ölçtüğünü açıkça tanımlayın, ardından en belirgin farkı vurgulayın.`,
    ],
    "retell-lecture": [
      `Örnek: Bir öğretim üyesi, bal arılarının çiçek tozu taşıma davranışının tarımdaki önemini anlatıyor.\nÖrnek cevap: "The lecture explains how bees transfer pollen between flowers as they collect nectar, a process essential for the reproduction of many crops. The professor emphasizes that declining bee populations could threaten global food production."\nNotlarınızdaki 'ne, neden önemli, sonuç' başlıklarını bu sırayla cümlelere dökün.`,
      `Örnek: Bir konuşmacı, uyku eksikliğinin bilişsel performansa etkilerini ele alıyor.\nÖrnek cevap: "The speaker discusses how sleep deprivation impairs memory, concentration, and decision-making. She also mentions that even a single night of poor sleep can measurably reduce cognitive performance the following day."\nAna etkiyi ve destekleyici üç örneği sırayla aktarın.`,
      `Örnek: Bir profesör, 'confirmation bias' (doğrulama yanlılığı) kavramını günlük hayattan örneklerle anlatıyor.\nÖrnek cevap: "The lecture introduces confirmation bias, the tendency to favor information that confirms our existing beliefs. The professor gives the example of people only reading news sources that align with their political views."\nKavramı tanımlayıp ardından verilen örneği kısaca özetleyin.`,
      `Örnek: Bir ders, mercan resiflerinin beyazlaşmasının nedenlerini ve okyanuslar üzerindeki etkisini anlatıyor.\nÖrnek cevap: "The lecture explains that coral bleaching occurs when rising sea temperatures cause corals to expel the algae living in their tissues, turning them white and vulnerable to disease. This threatens the entire marine ecosystem that depends on reefs."\nNeden-sonuç ilişkisini açıkça kurun.`,
      `Örnek: Bir konuşmacı, Sanayi Devrimi'nin şehirleşme üzerindeki etkisini üç aşamada anlatıyor: göç, konut sorunları, halk sağlığı önlemleri.\nÖrnek cevap: "The lecture traces how industrialization triggered mass migration to cities, which in turn caused severe housing shortages and public health problems, eventually prompting the first urban sanitation reforms."\nÜç aşamalı bir süreci sırayla ve bağlaçlarla birbirine bağlayın.`,
      `Örnek: Bir ders, yapay tatlandırıcıların vücut üzerindeki tartışmalı etkilerine dair iki farklı araştırma bulgusunu karşılaştırıyor.\nÖrnek cevap: "The lecture presents conflicting research on artificial sweeteners: one study found no negative health effects, while another linked them to changes in gut bacteria. The professor concludes that more long-term research is needed."\nÇelişen iki görüşü dengeli şekilde aktarın.`,
      `Örnek: Bir profesör, evrensel temel gelir politikasının artılarını ve eksilerini tartışıyor.\nÖrnek cevap: "The lecture examines universal basic income, noting its potential to reduce poverty but also raising concerns about funding and its possible effect on work incentives. The professor remains neutral, presenting both perspectives without endorsing either."\nTartışmalı konularda konuşmacının taraf tutup tutmadığını da belirtmek cevabınızı daha eksiksiz gösterir.`,
      `Örnek: Bir ders, kuantum dolanıklığının temel prensiplerini ve olası teknolojik uygulamalarını anlatıyor.\nÖrnek cevap: "The lecture explains quantum entanglement, a phenomenon where two particles remain connected regardless of distance, and discusses its potential to revolutionize computing by enabling vastly faster processing than classical computers."\nKarmaşık teknik konularda kavramı basitçe tanımlamak, sonra uygulamasını belirtmek yeterlidir.`,
      `Örnek: Bir konuşmacı, dilin yok olma sürecini ve bunun kültürel çeşitlilik açısından sonuçlarını tartışıyor, ayrıca dijital arşivleme çabalarından bahsediyor.\nÖrnek cevap: "The lecture warns that nearly half of the world's languages could disappear by the end of the century, resulting in an irreversible loss of cultural knowledge. It also highlights ongoing efforts to digitally document endangered languages before they vanish."\nSorunu, sonucunu ve çözüm çabasını üç ayrı cümlede dengeli biçimde sunun.`,
      `Örnek: Uzun ve teknik bir ders, epigenetik mekanizmaların çevresel faktörler yoluyla gen ifadesini nasıl değiştirebildiğini ve bunun nesiller arası kalıtım üzerindeki tartışmalı etkilerini ele alıyor.\nÖrnek cevap: "The lecture explores epigenetics, explaining how environmental factors can alter gene expression without changing the underlying DNA sequence. The professor notes that some of these changes may even be passed to future generations, though this remains a contested and actively researched area."\nYoğun teknik derslerde her detayı değil, ana mekanizmayı ve en tartışmalı noktayı seçip aktarmak öncelikli olmalıdır.`,
    ],
    "answer-short-question": [
      `Örnek soru (dinletilen): "What do we call a person who studies the weather?"\nBeklenen cevap: "A meteorologist." Kısa ve net, tek terimle cevap verin.`,
      `Örnek soru (dinletilen): "What is the opposite of 'transparent'?"\nBeklenen cevap: "Opaque." Zıt anlamlı kelime sorularında ilk aklınıza gelen en yaygın kelimeyi söyleyin.`,
      `Örnek soru (dinletilen): "What do you call a baby kangaroo?"\nBeklenen cevap: "A joey." Hayvan yavrularına özgü özel isimler sık sorulur; bu tür kelime listelerini önceden gözden geçirmek faydalıdır.`,
      `Örnek soru (dinletilen): "If you want to borrow books, where would you go?"\nBeklenen cevap: "A library." Günlük hayat senaryolarında en mantıklı yeri veya kişiyi doğrudan söyleyin.`,
      `Örnek soru (dinletilen): "What do we call the instrument used to measure atmospheric pressure?"\nBeklenen cevap: "A barometer." Bilimsel aletlerin isimlerini konu bazlı listeler halinde çalışmak bu tür sorularda işinizi kolaylaştırır.`,
      `Örnek soru (dinletilen): "What term describes a word that is spelled the same forwards and backwards?"\nBeklenen cevap: "A palindrome." Dilbilgisi ve edebiyat terimlerine aşina olmak bu soru tipinde avantaj sağlar.`,
      `Örnek soru (dinletilen): "What do we call a shape with eight sides?"\nBeklenen cevap: "An octagon." Geometrik şekil isimlerini sayılarıyla birlikte ezberlemek hızlı cevap vermenizi sağlar.`,
      `Örnek soru (dinletilen): "What is the term for a doctor who specializes in treating skin conditions?"\nBeklenen cevap: "A dermatologist." Meslek isimlerinde '-ologist' ekiyle biten kelimeler sıkça sorulur; bu kalıba aşina olmak tahmin gücünüzü artırır.`,
      `Örnek soru (dinletilen): "What do we call the fear of enclosed spaces?"\nBeklenen cevap: "Claustrophobia." Fobi isimleri gibi daha az yaygın akademik kelimeler zorlayıcı olabilir; emin değilseniz en yakın tahmininizi hemen söyleyin.`,
      `Örnek soru (dinletilen): "What is the collective noun for a group of crows?"\nBeklenen cevap: "A murder." Hayvan grupları için kullanılan alışılmadık toplu isimler en zor soru türlerindendir; bilmiyorsanız bile en mantıklı tahmini boş bırakmadan söyleyin.`,
    ],
    "summarize-written-text": [
      `Örnek metin (kısaltılmış): "Urban green spaces, such as parks and community gardens, provide numerous benefits beyond aesthetic appeal. They improve air quality, reduce urban heat, and offer residents opportunities for physical activity and social interaction."\nÖrnek özet cümlesi: "Urban green spaces improve air quality and reduce heat while also promoting physical activity and social interaction, which together enhance residents' mental and physical well-being." (Tek cümle, 5-75 kelime aralığında.)`,
      `Örnek metin (kısaltılmış): "Coffee cultivation began in Ethiopia before spreading to the Arabian Peninsula, where it became central to social and religious life. By the seventeenth century, coffeehouses had emerged across Europe as hubs of intellectual exchange."\nÖrnek özet cümlesi: "Coffee cultivation, which began in Ethiopia and spread through the Arabian Peninsula, eventually led to European coffeehouses and a global trade network that continues to this day." (Tek cümle, 5-75 kelime aralığında.)`,
      `Örnek metin (kısaltılmış): "Studies on remote work have produced mixed findings regarding productivity. While some employees report fewer distractions and greater autonomy, others struggle with isolation and blurred boundaries between work and personal life."\nÖrnek özet cümlesi: "Research on remote work shows mixed results, as some employees benefit from fewer distractions and more autonomy while others face isolation, indicating that its effectiveness depends on individual circumstances." (Tek cümle, 5-75 kelime aralığında.)`,
      `Örnek metin (kısaltılmış): "Microplastics, tiny fragments of degraded plastic waste, have been found in nearly every ocean environment. Scientists warn that these particles can enter the food chain through marine organisms."\nÖrnek özet cümlesi: "Microplastics have contaminated ocean environments from surface waters to deep-sea sediments and can enter the food chain, posing potential health risks to humans who consume affected seafood." (Tek cümle, 5-75 kelime aralığında.)`,
      `Örnek metin (kısaltılmış): "Children raised in bilingual households often demonstrate enhanced cognitive flexibility compared to their monolingual peers. This advantage is thought to stem from the constant mental effort required to switch between two linguistic systems."\nÖrnek özet cümlesi: "Bilingual children tend to show greater cognitive flexibility than monolingual peers because switching between two languages strengthens executive function skills like attention control and problem-solving." (Tek cümle, 5-75 kelime aralığında.)`,
      `Örnek metin (kısaltılmış): "Soil erosion, accelerated by deforestation, overgrazing, and intensive farming practices, has degraded vast areas of previously fertile land worldwide. Left unaddressed, this degradation threatens agricultural productivity and increases flooding."\nÖrnek özet cümlesi: "Soil erosion, driven by deforestation, overgrazing, and intensive farming, degrades fertile land and, if unaddressed, threatens agricultural productivity while increasing flooding and displacing communities dependent on the land." (Tek cümle, 5-75 kelime aralığında.)`,
      `Örnek metin (kısaltılmış): "Social media algorithms are designed to maximize engagement by showing users content that aligns with their existing preferences. Critics argue that this creates filter bubbles which reinforce pre-existing beliefs."\nÖrnek özet cümlesi: "Because social media algorithms maximize engagement by reinforcing users' existing preferences, they create filter bubbles that limit exposure to differing viewpoints and deepen political polarization." (Tek cümle, 5-75 kelime aralığında.)`,
      `Örnek metin (kısaltılmış): "The human body's circadian rhythm regulates sleep, hormone release, and metabolism according to a roughly twenty-four-hour cycle. Shift workers, whose schedules frequently conflict with this rhythm, face higher health risks."\nÖrnek özet cümlesi: "Because shift workers' schedules often conflict with the body's natural circadian rhythm, they face a higher risk of sleep disorders, cardiovascular disease, and metabolic conditions such as obesity and diabetes." (Tek cümle, 5-75 kelime aralığında.)`,
      `Örnek metin (kısaltılmış): "Although the upfront costs of renewable energy infrastructure remain higher than fossil fuel plants in many regions, falling technology prices and long-term operational savings are steadily narrowing this gap."\nÖrnek özet cümlesi: "Although renewable energy infrastructure still costs more upfront than fossil fuel plants in many regions, falling technology prices and long-term savings make the transition increasingly favorable even in the short term." (Tek cümle, 5-75 kelime aralığında.)`,
      `Örnek metin (kısaltılmış): "For much of the twentieth century, scientists believed the adult brain was largely fixed. Recent research on neuroplasticity has demonstrated that adult brains can form new neural connections in response to learning, environmental change, and even injury."\nÖrnek özet cümlesi: "Although twentieth-century scientists believed the adult brain was largely fixed, recent neuroplasticity research shows that adult brains can form new neural connections in response to learning, environmental change, and injury." (Tek cümle, 5-75 kelime aralığında.)`,
    ],
    "write-essay": [
      `Örnek konu: "Some people think that children should begin learning a foreign language as early as possible, while others believe it is better to wait until they are older. Discuss both views and give your opinion."\nÖrnek giriş cümlesi: "Although some argue that delaying foreign language instruction allows children to first master their native tongue, I believe that early exposure to a second language offers cognitive and social advantages that far outweigh this concern."`,
      `Örnek konu: "In many countries, university education is becoming increasingly expensive. Do the benefits of a university degree still justify the cost?"\nÖrnek giriş cümlesi: "While rising tuition fees have led many to question the value of a university degree, I contend that the long-term career and personal development benefits still justify the financial investment for most students."`,
      `Örnek konu: "Some believe that governments should invest more in public transportation rather than road infrastructure for private vehicles. To what extent do you agree or disagree?"\nÖrnek giriş cümlesi: "I strongly agree that governments should prioritize public transportation investment, as it addresses congestion, pollution, and equity concerns more effectively than continued spending on roads for private vehicles."`,
      `Örnek konu: "Many people believe that social media has made society more connected, while others argue it has made people more isolated. Discuss both views and give your opinion."\nÖrnek giriş cümlesi: "Although social media undeniably allows people to stay in touch across great distances, I believe its overall effect has been to foster a superficial sense of connection that masks growing social isolation."`,
      `Örnek konu: "Some argue that zoos are cruel and should be abolished, while others believe they play an important role in conservation and education. Discuss both views and give your opinion."\nÖrnek giriş cümlesi: "While concerns about animal welfare in zoos are legitimate, I believe that well-regulated zoos serve an indispensable role in species conservation and public education that outweighs these ethical objections."`,
      `Örnek konu: "In the modern workplace, some believe that a four-day work week would improve employee well-being and productivity, while others think it would harm business competitiveness. Discuss both views and give your opinion."\nÖrnek giriş cümlesi: "Although critics warn that a shortened work week could reduce output and competitiveness, I believe that the resulting gains in employee well-being and productivity make it a change worth pursuing."`,
      `Örnek konu: "Some people believe that space exploration is a waste of resources that could be better spent solving problems on Earth. To what extent do you agree or disagree?"\nÖrnek giriş cümlesi: "I disagree with the view that space exploration wastes valuable resources, as the scientific and technological advances it generates ultimately contribute to solving many of the very problems critics cite."`,
      `Örnek konu: "Some believe that standardized testing is the fairest way to evaluate student performance, while others argue it fails to capture true ability. Discuss both views and give your opinion."\nÖrnek giriş cümlesi: "Although standardized tests offer an objective and easily comparable measure of performance, I believe they fail to capture the full range of student abilities and should be supplemented with other forms of assessment."`,
      `Örnek konu: "As artificial intelligence becomes more capable, some argue it will eliminate more jobs than it creates, while others believe it will ultimately generate new forms of employment. Discuss both views and give your opinion."\nÖrnek giriş cümlesi: "While it is true that artificial intelligence will displace certain categories of jobs in the short term, historical precedent suggests that it will also create new industries and roles that offset these losses over time."`,
      `Örnek konu: "Some argue that international cooperation is the only effective way to address global challenges such as climate change and pandemics, while others believe that individual nations should prioritize their own interests first."\nÖrnek giriş cümlesi: "Although national governments understandably prioritize their own citizens' immediate interests, I believe that challenges as interconnected as climate change and pandemics can only be resolved through sustained international cooperation, even when it requires short-term domestic sacrifice."`,
    ],
    "reading-mcq-single": [
      `Örnek metin: "The Great Barrier Reef, located off the coast of Australia, is the largest living structure on Earth, stretching over 2,300 kilometers."\nSoru: "According to the passage, the Great Barrier Reef is remarkable for its..." (A) age (B) size (C) color (D) depth\nDoğru cevap (B) 'size' — metin açıkça uzunluğunu vurguluyor, diğer özellikler metinde geçmiyor.`,
      `Örnek metin: "Honey never spoils if stored properly, as its low moisture content and acidic pH create an environment where bacteria cannot survive."\nSoru: "Why does honey not spoil, according to the passage?" (A) It is heated during production. (B) It contains natural preservatives. (C) Its low moisture and acidity prevent bacterial growth. (D) It is stored in sealed containers.\nDoğru cevap (C) — metinde nedensellik açıkça 'low moisture content and acidic pH' ifadesiyle belirtiliyor.`,
      `Örnek metin: "While early automobiles were prohibitively expensive, Henry Ford's assembly line drastically reduced production costs, making car ownership accessible to the average American family."\nSoru: "What was the main effect of the assembly line, according to the passage?" (A) It improved car safety. (B) It made cars more affordable. (C) It increased fuel efficiency. (D) It shortened delivery times.\nDoğru cevap (B) — 'drastically reduced production costs' ve 'accessible to the average family' ifadeleri doğrudan bunu destekliyor.`,
      `Örnek metin: "Although vitamin D can be obtained through diet, the majority of the body's supply is synthesized in the skin following exposure to sunlight."\nSoru: "According to the passage, how is most vitamin D obtained?" (A) Through dietary supplements. (B) Through sunlight exposure. (C) Through dairy products. (D) Through synthetic medication.\nDoğru cevap (B) — metin 'the majority... synthesized in the skin following exposure to sunlight' diyor; diyet sadece küçük bir alternatif olarak geçiyor.`,
      `Örnek metin: "Contrary to popular belief, the Great Wall of China is not visible from space with the naked eye; this widely repeated claim has been debunked by numerous astronauts."\nSoru: "What does the passage suggest about the claim that the Great Wall is visible from space?" (A) It is scientifically accurate. (B) It has been confirmed by astronauts. (C) It is a common misconception. (D) It applies only at night.\nDoğru cevap (C) — 'contrary to popular belief' ve 'debunked' ifadeleri bu iddianın yanlış bir inanç olduğunu açıkça belirtiyor.`,
      `Örnek metin: "The phenomenon of bioluminescence, observed in organisms ranging from deep-sea fish to fireflies, results from a chemical reaction involving a light-emitting molecule called luciferin."\nSoru: "What causes bioluminescence, according to the passage?" (A) Reflection of external light sources. (B) A chemical reaction involving luciferin. (C) Absorption of ultraviolet radiation. (D) Electrical impulses in the nervous system.\nDoğru cevap (B) — metin nedeni açıkça 'a chemical reaction involving a light-emitting molecule called luciferin' olarak tanımlıyor.`,
      `Örnek metin: "Behavioral economists have found that people tend to value a potential loss more heavily than an equivalent gain, a bias known as loss aversion."\nSoru: "What is loss aversion, as described in the passage?" (A) A tendency to avoid financial investments. (B) A tendency to weigh losses more heavily than equivalent gains. (C) A preference for saving over spending. (D) An inability to make quick decisions.\nDoğru cevap (B) — tanım metinde birebir bu şekilde veriliyor.`,
      `Örnek metin: "Although permafrost has remained frozen for thousands of years in parts of the Arctic, rising global temperatures are now causing it to thaw at unprecedented rates, releasing trapped methane and carbon dioxide into the atmosphere."\nSoru: "What is implied about the consequence of permafrost thawing?" (A) It will have no significant environmental impact. (B) It may accelerate climate change further. (C) It will only affect Arctic wildlife. (D) It has already stopped due to conservation efforts.\nDoğru cevap (B) — metinde açıkça belirtilmese de 'releasing trapped methane and carbon dioxide' ifadesinden bu çıkarım yapılabilir; bu bir çıkarım (inference) sorusudur.`,
      `Örnek metin: "Critics of the proposed tax reform argue that, while it may reduce the deficit in the short term, its long-term reliance on consumption taxes disproportionately burdens lower-income households."\nSoru: "What is the main criticism of the tax reform mentioned in the passage?" (A) It fails to reduce the deficit. (B) It disproportionately affects lower-income households over time. (C) It increases taxes on wealthy corporations. (D) It has no long-term economic effects.\nDoğru cevap (B) — bu soru metnin ana eleştirisini birden fazla detay arasından ayırt etmeyi gerektirir.`,
      `Örnek metin: "Some historians contend that the fall of the Roman Empire resulted primarily from internal political corruption, while others emphasize external pressures; a growing consensus, however, suggests that no single factor can fully account for such a complex historical process."\nSoru: "What position does the passage ultimately suggest regarding the fall of the Roman Empire?" (A) It was caused solely by political corruption. (B) It resulted only from external invasions. (C) It cannot be attributed to any single cause. (D) Historians universally agree on its cause.\nDoğru cevap (C) — bu, birden fazla görüşün sunulduğu ve metnin dengelenmiş bir sonuca vardığı zor bir sentezleme sorusudur.`,
    ],
    "reading-mcq-multiple": [
      `Örnek metin bir bitkinin (venüs sinekkapanı) böcek yakalama mekanizmasını anlatıyor: hızlı yaprak kapanması, sindirim enzimleri salgılama, nadir görülen bir toprak türünde büyüme.\nSoru: "Which TWO of the following are mentioned as features of the Venus flytrap?"\nDoğru seçenekler metinde AÇIKÇA geçen 'hızlı yaprak kapanması' ve 'sindirim enzimi salgılama' olur; metinde geçmeyen bir seçenek asla işaretlenmemelidir.`,
      `Örnek metin bir şehrin bisiklet paylaşım programının faydalarını anlatıyor: trafik sıkışıklığının azalması, hava kirliliğinin düşmesi, program maliyetinin yüksekliği.\nSoru: "Which TWO benefits of the bike-sharing program does the passage mention?"\nDoğru seçenekler 'trafik sıkışıklığının azalması' ve 'hava kirliliğinin düşmesi' olur; maliyet bir dezavantaj olarak geçtiği için bu seçenek işaretlenmemelidir.`,
      `Örnek metin göçmen kuşların yön bulma yöntemlerini anlatıyor: yıldızları kullanma, Dünya'nın manyetik alanını algılama, koku duyusunu kullanma.\nSoru: "Which TWO navigation methods are explicitly mentioned in the passage?"\nMetinde açıkça belirtilen iki yöntem işaretlenmeli; sadece 'tartışmalı bir teori' olarak geçen bir üçüncü seçenek dikkatle değerlendirilmelidir.`,
      `Örnek metin bir şirketin uzaktan çalışma politikasının sonuçlarını anlatıyor: çalışan memnuniyetinin artması, ofis maliyetlerinin düşmesi, ekip içi iletişimin zayıflaması.\nSoru: "Which TWO outcomes does the passage describe as positive?"\nDoğru seçenekler 'çalışan memnuniyeti' ve 'düşen ofis maliyetleri' olur; iletişim zayıflaması olumsuz bir sonuç olduğu için işaretlenmemelidir.`,
      `Örnek metin, antik Mısır'da papirüs üretiminin üç aşamasını anlatıyor: bitki saplarının şeritlere ayrılması, şeritlerin çapraz katmanlar halinde dizilmesi, baskı altında kurutulması.\nSoru: "Which TWO steps in papyrus production are mentioned in the passage?"\nMetni dikkatle tarayıp yalnızca AÇIKÇA belirtilen adımları işaretleyin, çıkarım yapmayın.`,
      `Örnek metin bir ilacın klinik deneylerindeki yan etkilerini anlatıyor: hafif baş ağrısı, mide bulantısı, çok nadir görülen alerjik reaksiyon.\nSoru: "Which TWO side effects are described as common in the passage?"\n'Hafif baş ağrısı' ve 'mide bulantısı' sık görülen yan etkiler olarak tanımlanırken, alerjik reaksiyon 'çok nadir' olarak nitelendiriliyor; bu ayrımı kaçırmak yanlış seçime yol açar.`,
      `Örnek metin, bir ülkenin yenilenebilir enerjiye geçiş sürecinde karşılaştığı zorlukları anlatıyor: depolama teknolojisinin yetersizliği, kamuoyu desteğinin güçlü olması, şebeke altyapısının eskiliği.\nSoru: "Which TWO challenges does the passage identify?"\nDoğru seçenekler 'depolama teknolojisi yetersizliği' ve 'eski şebeke altyapısı' olur; kamuoyu desteği bir zorluk değil, olumlu bir faktör olarak sunuluyor — bu tür 'ters çeldirici' seçeneklere dikkat edin.`,
      `Örnek metin, bir araştırmanın metodolojisindeki sınırlamaları anlatıyor: küçük örneklem büyüklüğü, kısa gözlem süresi, sonuçların istatistiksel olarak anlamlı olması.\nSoru: "Which TWO limitations of the study are mentioned?"\n'Küçük örneklem' ve 'kısa gözlem süresi' birer sınırlamayken, istatistiksel anlamlılık aslında çalışmanın bir güçlü yönü olarak sunulmuştur; metindeki her ifadenin olumlu mu olumsuz mu olduğunu dikkatle ayırt edin.`,
      `Örnek metin, bir şehir planlama projesinin hem desteklenen hem eleştirilen yönlerini karışık sırada sunuyor: yaya bölgelerinin genişletilmesi (destek), kira artışı şikayeti (eleştiri), yeşil alan artışı (destek), inşaatın trafiği aksatması (eleştiri).\nSoru: "Which TWO aspects of the project have received public support, according to the passage?"\nBu soru dört karışık noktadan yalnızca DESTEKLENEN ikisini ayırt etmenizi gerektirir; eleştirilen noktaları işaretlemek puan kaybettirir.`,
      `Örnek metin, bir ekonomik teorinin farklı okullar tarafından nasıl yorumlandığını, hangi varsayımların ortak kabul gördüğünü ve hangilerinin hâlâ tartışmalı olduğunu ele alan yoğun akademik bir metin.\nSoru: "Which TWO assumptions does the passage indicate are widely accepted among economists?"\nMetindeki 'widely accepted' ve 'still debated' şeklinde ayrılan varsayımları birbirine karıştırmamak gerekir; yalnızca ortak kabul gören ikisini seçin.`,
    ],
    "reading-reorder-paragraphs": [
      `Örnek 4 cümle (karışık sırada): (1) "This made it possible to produce goods faster and at a lower cost." (2) "The steam engine was one of the most important inventions of the Industrial Revolution." (3) "As a result, factories could operate independently of rivers and wind." (4) "It allowed machines to run without relying on water or wind power."\nDoğru sıra: 2-4-3-1 — cümle 2 konuyu tanıtır, 4 icadın temel özelliğini açıklar, 3 bunun sonucunu 'as a result' ile sunar, 1 nihai faydayı özetler.`,
      `Örnek 4 cümle (karışık sırada): (1) "Consequently, many species now face an increased risk of extinction." (2) "Coral reefs support roughly a quarter of all marine species despite covering less than one percent of the ocean floor." (3) "However, rising ocean temperatures are causing widespread coral bleaching." (4) "This makes them one of the most biodiverse ecosystems on Earth."\nDoğru sıra: 2-4-3-1 — 2 konuyu tanıtır, 4 'this' ile 2'ye referans verir, 3 zıt gelişmeyi sunar, 1 nihai sonucu bağlar.`,
      `Örnek 4 cümle (karışık sırada): (1) "These early systems relied entirely on human operators to connect calls manually." (2) "The telephone exchange system was first introduced in the late nineteenth century." (3) "Automatic switching technology eventually replaced this labor-intensive method." (4) "By the mid-twentieth century, manual operators had become largely obsolete."\nDoğru sıra: 2-1-3-4 — 2 konuyu tanıtır, 1 'these early systems' ile 2'ye referans verir, 3 gelişmeyi sunar, 4 sonucu özetler.`,
      `Örnek 5 cümle (karışık sırada): (1) "This shift has had significant implications for how companies structure their teams." (2) "Remote work became far more common following the global disruptions of the early 2020s." (3) "Some organizations, for instance, have abandoned traditional office spaces altogether." (4) "Others, however, have adopted a hybrid model combining in-person and remote work." (5) "Both approaches reflect an ongoing search for balance."\nDoğru sıra: 2-1-3-4-5 — 2 konuyu tanıtır, 1 genel sonucu belirtir, 3 ve 4 iki karşıt örnek sunar, 5 birleştiren bir sonuçla biter.`,
      `Örnek 4 cümle (karışık sırada): (1) "Nevertheless, subsequent excavations revealed that the site was far older than initially estimated." (2) "Archaeologists first discovered the ancient settlement in the 1960s." (3) "This discovery forced historians to revise their timeline of early human migration." (4) "At the time, researchers believed it dated back only a few centuries."\nDoğru sıra: 2-4-1-3 — 2 konuyu tanıtır, 4 ilk varsayımı belirtir, 1 'nevertheless' ile bunu çürüten bulguyu sunar, 3 sonucu özetler.`,
      `Örnek 4 cümle (karışık sırada): (1) "Opponents, on the other hand, warn that it could lead to job losses in traditional industries." (2) "The debate over automation in manufacturing has intensified in recent years." (3) "Ultimately, the outcome will likely depend on how quickly workers can be retrained." (4) "Proponents argue that automation increases efficiency and reduces production costs."\nDoğru sıra: 2-4-1-3 — 2 konuyu tanıtır, 4 bir tarafı, 1 karşı tarafı sunar, 3 dengeleyici bir sonuçla biter.`,
      `Örnek 5 cümle (karışık sırada), bilimsel bir süreç anlatan zor bir metin: (1) "It is this pressure differential that ultimately generates the lifting force needed for flight." (2) "The shape of an airplane wing causes air to travel faster over its curved upper surface." (3) "Understanding this principle, engineers have continually refined wing designs." (4) "According to Bernoulli's principle, faster-moving air exerts less pressure than slower-moving air." (5) "As a result, the air above the wing exerts less pressure than the air below it."\nDoğru sıra: 2-4-5-1-3 — 2 durumu tanımlar, 4 prensibi açıklar, 5 prensibi kanada uygular, 1 sonucu belirtir, 3 pratik uygulamayla biter.`,
      `Örnek 4 cümle (karışık sırada): (1) "For example, many now offer curbside pickup and same-day delivery services." (2) "Traditional retail stores have had to adapt significantly to compete with online shopping." (3) "Despite these efforts, many smaller retailers continue to struggle against larger e-commerce platforms." (4) "Such changes aim to combine the convenience of online shopping with the immediacy of physical stores."\nDoğru sıra: 2-1-4-3 — 2 konuyu tanıtır, 1 örnek sunar, 4 amacı açıklar, 3 zıt bir sonuçla biter.`,
      `Örnek 5 cümle (karışık sırada), soyut bir felsefi tartışma: (1) "Critics of this view argue that free will is entirely compatible with a deterministic universe." (2) "Philosophers have long debated whether human free will can coexist with scientific determinism." (3) "Some argue that if every event has a prior cause, genuine free choice becomes impossible." (4) "This position, known as compatibilism, redefines freedom as acting according to one's own motivations." (5) "The debate therefore hinges largely on how one chooses to define freedom itself."\nDoğru sıra: 2-3-1-4-5 — 2 konuyu tanıtır, 3 bir görüşü, 1 karşıt görüşü tanıtır, 4 bunu detaylandırır, 5 genel bir sonuçla biter; soyut referansları takip etmeyi gerektiren zor bir örnektir.`,
      `Örnek 5 cümle (karışık sırada), çok soyut bir ekonomi metni: (1) "This asymmetry can lead markets to systematically misprice risk." (2) "Traditional economic models often assume that all market participants have access to the same information." (3) "In reality, however, information is frequently distributed unevenly among buyers and sellers." (4) "Behavioral economists have therefore proposed models that account for such imperfections." (5) "These revised models offer a more realistic, if more complex, picture of market behavior."\nDoğru sıra: 2-3-1-4-5 — ardışık zamir referanslarını ('this asymmetry', 'these revised models') takip etmek bu zor soruda anahtardır.`,
    ],
    "reading-fill-in-blanks": [
      `Örnek cümle: "The scientist conducted a series of __________ to test her hypothesis." Kelime havuzu: [experiment, experiments, experimental, experimentally].\nBoşluktan önce 'a series of' ifadesi çoğul bir isim gerektirir, doğru cevap 'experiments'.`,
      `Örnek cümle: "The novel was praised for its __________ portrayal of wartime hardship." Kelime havuzu: [vivid, vividly, vividness, vivider].\nBoşluk 'portrayal' isminden önce geldiği için sıfat formu gerekir: doğru cevap 'vivid'.`,
      `Örnek cümle: "Employees are __________ required to complete the safety training before starting work." Kelime havuzu: [strict, strictly, stricter, strictness].\nBoşluk bir fiili ('required') değiştiriyor, bu yüzden zarf formu gerekir: doğru cevap 'strictly'.`,
      `Örnek cümle: "The __________ of the ancient manuscript remains a mystery to historians." Kelime havuzu: [origin, original, originally, originate].\nBoşluktan sonra 'of the ancient manuscript' tamlaması geldiği için bir isim gerekir: doğru cevap 'origin'.`,
      `Örnek cümle: "Despite __________ criticism from the press, the mayor refused to change her policy." Kelime havuzu: [widespread, widely, wide, widen].\n'Criticism' isminden önce bir sıfat gerekir: doğru cevap 'widespread'.`,
      `Örnek cümle: "The committee's __________ to postpone the vote surprised many observers." Kelime havuzu: [decide, decision, decisive, decisively].\nBoşluktan sonra 'to postpone' mastar yapısı bir isimle birlikte kullanılır: doğru cevap 'decision'.`,
      `Örnek cümle: "The medication should be taken __________ before meals for maximum effectiveness." Kelime havuzu: [immediate, immediately, immediacy, immediateness].\nBoşluk bir fiil ifadesini değiştiriyor, bu yüzden zarf gerekir: doğru cevap 'immediately'.`,
      `Örnek cümle: "The report highlighted a growing __________ between public expectations and government policy." Kelime havuzu: [discrepancy, discrepant, discrepantly, discrepancies].\n'A growing' tekil bir isim tamlaması gerektirir, bu yüzden doğru cevap tekil 'discrepancy' olur, çoğul 'discrepancies' değil.`,
      `Örnek cümle: "The researchers were __________ surprised by how quickly the population recovered." Kelime havuzu: [genuine, genuinely, genuineness, genuinity].\nBoşluk 'surprised' sıfatını değiştiriyor, bu yüzden zarf gerekir: doğru cevap 'genuinely'; 'genuinity' İngilizcede standart bir kelime değildir ve çeldirici olarak eklenmiştir.`,
      `Örnek cümle: "Had the funding not been __________, the research project would have been abandoned entirely." Kelime havuzu: [secure, secured, securing, security].\nBu cümle devrik bir koşul yapısı içerir ve pasif yapı gerektirir: doğru cevap 'secured' (been secured).`,
    ],
    "reading-writing-fill-in-blanks": [
      `Örnek cümle: "The findings of the study __________ (surprise/surprised/surprising/surprisingly) many experts in the field."\nCümle geçmiş zamanda anlatılan bir olayı ifade ediyor ve özne çoğul; doğru seçenek basit geçmiş zaman fiili 'surprised'.`,
      `Örnek cümle: "By the time the ship reached the harbor, the storm __________ (already pass/already passed/had already passed/has already passed)."\nCümlede iki geçmiş olay arasında bir öncelik ilişkisi var, bu yüzden past perfect gerekir: doğru cevap 'had already passed'.`,
      `Örnek cümle: "The number of students __________ (enrolling/enrolled/who enrolling/enroll) in online courses has tripled since 2019."\nÖzne 'the number' tekildir; boşluk özneyi tanımlayan bir sıfat-fiil gerektirir: doğru cevap 'enrolled' (pasif anlam).`,
      `Örnek cümle: "__________ (Despite/Although/However/Nevertheless) the initial setbacks, the project was completed on schedule."\nBoşluktan sonra bir isim tamlaması geldiği için edat gerekir, bağlaç değil: doğru cevap 'Despite'.`,
      `Örnek cümle: "The committee recommended that the new policy __________ (is/be/was/being) implemented immediately."\n'Recommend that' yapısından sonra subjunctive (dilek kipi) kullanılır ve fiil çekimsiz haliyle gelir: doğru cevap 'be'.`,
      `Örnek cümle: "Not only __________ (the company reduced/did the company reduce/the company did reduce/reduced the company) its emissions, but it also increased overall efficiency."\nCümle 'Not only' ile başladığında devrik yapı gerekir: doğru cevap 'did the company reduce'.`,
      `Örnek cümle: "The bridge, __________ (which construction/construction of which/whose construction/that construction) took nearly a decade, is now considered an engineering marvel."\nBu ilişki cümlesinde iyelik anlamı gerekir, bu yüzden doğru seçenek 'whose construction'.`,
      `Örnek cümle: "It is essential that every participant __________ (follows/follow/followed/following) the safety guidelines without exception."\n'It is essential that' yapısından sonra da subjunctive kullanılır ve fiil çekimsiz kalır: doğru cevap 'follow'.`,
      `Örnek cümle: "__________ (Had the researchers/If the researchers had/The researchers had/Should the researchers have) had access to more funding, the study could have included a larger sample size."\nBu cümle 'if' olmadan devrik bir üçüncü tip koşul cümlesidir; doğru cevap 'Had the researchers'.`,
      `Örnek cümle: "Rarely __________ (a discovery has/has a discovery/a discovery had/had a discovery) generated as much scientific debate as this one has in recent years."\nOlumsuz anlam taşıyan bir zarfla başlayan cümlelerde devrik yapı gerekir; doğru cevap 'has a discovery'. Bu, ileri seviye bir devrik yapı sorusudur.`,
    ],
    "listening-summarize-spoken-text": [
      `Örnek: 65 saniyelik bir ders, bal arısı kolonilerinin karar verme sürecinde 'waggle dance' kullanımını anlatıyor.\nÖrnek özet (60 kelime): "The lecture explains how honeybees use a movement called the waggle dance to communicate the location and quality of food sources to other members of the colony. The professor notes that the angle and duration of the dance encode precise directional and distance information."`,
      `Örnek: 80 saniyelik bir ders, şehir plancılarının 'walkability' kavramını nasıl ölçtüğünü anlatıyor.\nÖrnek özet (65 kelime): "The lecture discusses how urban planners measure walkability by assessing factors such as sidewalk quality, street connectivity, and proximity to amenities. The speaker argues that cities with higher walkability scores tend to report better public health outcomes."`,
      `Örnek: 70 saniyelik bir ders, 'confirmation bias' ile 'availability heuristic' arasındaki farkı örneklerle açıklıyor.\nÖrnek özet (65 kelime): "The lecture distinguishes between confirmation bias, the tendency to favor information supporting existing beliefs, and the availability heuristic, which involves judging probability based on how easily examples come to mind."`,
      `Örnek: 90 saniyelik bir ders, deniz seviyesindeki yükselişin ada topluluklarını nasıl etkilediğini ve göç planlarını anlatıyor.\nÖrnek özet (70 kelime): "The lecture examines how rising sea levels threaten low-lying island communities, forcing some governments to develop relocation plans. The speaker highlights the cultural and economic challenges of these plans, noting that displaced communities often struggle to preserve their traditions after resettlement."`,
      `Örnek: 60 saniyelik kısa bir ders, plasebo etkisinin ağrı yönetimindeki rolünü anlatıyor.\nÖrnek özet (55 kelime): "The lecture explains that the placebo effect can genuinely reduce perceived pain, even when patients receive treatments with no active medical ingredients. The professor attributes this to the brain's release of natural pain-relieving chemicals triggered by expectation."`,
      `Örnek: 85 saniyelik bir ders, mikrobiyomun bağışıklık sistemi üzerindeki etkisini ve antibiyotik kullanımının olası zararlarını anlatıyor.\nÖrnek özet (68 kelime): "The lecture explores how the gut microbiome plays a crucial role in regulating immune function. The speaker warns that overuse of antibiotics can disrupt this delicate microbial balance, potentially weakening immune responses and increasing susceptibility to certain diseases."`,
      `Örnek: 75 saniyelik bir ders, karar yorgunluğunun günlük hayattaki etkilerini ve bunu azaltmanın yollarını anlatıyor.\nÖrnek özet (62 kelime): "The lecture describes decision fatigue, the decline in the quality of decisions after a long session of decision-making. The professor explains that this affects everyone from judges to shoppers, and suggests strategies such as reducing daily choices."`,
      `Örnek: 95 saniyelik yoğun bir ders, kuantum hesaplamanın klasik hesaplamadan farkını ve kübitlerin süperpozisyon özelliğini teknik detaylarla anlatıyor.\nÖrnek özet (70 kelime): "The lecture contrasts quantum computing with classical computing, focusing on how qubits can exist in a superposition of states rather than being limited to a single binary value, allowing certain calculations to run exponentially faster than on classical machines."`,
      `Örnek: 100 saniyelik zor ve teknik bir ders, epigenetik değişikliklerin nesiller arası kalıtımı ve bunun evrim teorisiyle ilişkisini tartışıyor.\nÖrnek özet (70 kelime): "The lecture explores how epigenetic modifications, changes in gene expression that do not alter the underlying DNA sequence, may sometimes be inherited across generations, challenging traditional views of evolution based solely on genetic mutation."`,
      `Örnek: 100 saniyelik çok yoğun bir ders, merkez bankalarının faiz oranı kararlarının enflasyon beklentileri üzerindeki dolaylı etkisini ve ölçüm zorluklarını tartışıyor.\nÖrnek özet (70 kelime): "The lecture examines how central bank interest rate decisions influence inflation not only directly but also indirectly by shaping public expectations about future prices, and argues that measuring this expectation channel remains methodologically difficult for economists."`,
    ],
    "listening-mcq-multiple": [
      `Örnek kayıt: Bir profesör, deprem erken uyarı sistemlerinin iki temel bileşenini (sismik sensörler, otomatik alarm ağı) anlatıyor.\nSoru: "Which TWO components of earthquake early warning systems does the professor mention?"\nDoğru cevaplar kayıtta AÇIKÇA belirtilen iki bileşen olur; kayıtta geçmeyen bir bileşen asla işaretlenmemelidir.`,
      `Örnek kayıt: Bir öğrenci ve danışmanı, burs başvurusu için gereken iki belgeyi (transkript, referans mektubu) tartışıyor.\nSoru: "Which TWO documents does the advisor say are required for the scholarship application?"\nKayıtta net biçimde istenen iki belge işaretlenmeli; 'isteğe bağlı' denen bir belge asla seçilmemelidir.`,
      `Örnek kayıt: Bir konuşmacı, sürdürülebilir tarımın iki temel prensibini (toprak sağlığını koruma, su kullanımını azaltma) anlatıyor.\nSoru: "Which TWO principles of sustainable agriculture are mentioned?"\nDoğru cevaplar kayıtta açıkça geçen iki prensip olur; konuşmacının 'gelecekte önemli olabilir' dediği bir üçüncü nokta işaretlenmemelidir.`,
      `Örnek kayıt: Bir profesör, iklim modellerindeki belirsizliğin iki kaynağını (veri eksikliği, bulut oluşumunun karmaşıklığı) tartışıyor.\nSoru: "Which TWO sources of uncertainty in climate models does the professor identify?"\nNegatif puanlama olduğu için emin olmadığınız bir seçeneği işaretlememek daha güvenlidir.`,
      `Örnek kayıt: İki öğrenci, grup projesi için işbölümü yaparken kimin sunumu, kimin raporu hazırlayacağını tartışıyor; veri toplama görevi henüz kimseye atanmamış.\nSoru: "Which TWO tasks have already been assigned, according to the conversation?"\n'Sunum' ve 'rapor' zaten atanmış görevlerdir; veri toplama henüz atanmadığı için bu seçenek işaretlenmemelidir.`,
      `Örnek kayıt: Bir doktor, yeni bir diyetin iki kanıtlanmış faydasını (kolesterol düşürme, enerji artışı) ve henüz kanıtlanmamış bir iddiayı (kilo kaybı garantisi) ayırt ederek anlatıyor.\nSoru: "Which TWO benefits does the doctor describe as scientifically supported?"\nDoktorun 'henüz yeterli kanıt yok' dediği kilo kaybı iddiası işaretlenmemelidir.`,
      `Örnek kayıt: Bir profesör, iki tarihsel imparatorluğun çöküş nedenleri arasındaki ortak iki faktörü karşılaştırmalı olarak anlatıyor, ayrıca sadece birine özgü üçüncü bir faktörden bahsediyor.\nSoru: "Which TWO factors does the professor say were common to both empires' decline?"\nBu soru, 'ortak' olanları 'sadece birine özgü' olandan ayırt etmenizi gerektirir; dikkatli not almak burada kritik önem taşır.`,
      `Örnek kayıt: Bir mühendis, bir köprünün yenilenme projesindeki iki ana zorluğu (bütçe kısıtlaması, trafik yönetimi) anlatırken, artık çözülmüş olan bir üçüncü zorluktan (malzeme tedariki) da bahsediyor.\nSoru: "Which TWO challenges does the engineer say are currently affecting the project?"\nMalzeme tedariki sorunu artık çözüldüğü için bu seçenek işaretlenmemeli; zaman ifadelerini dikkatle takip etmeyi gerektiren zor bir sorudur.`,
      `Örnek kayıt: Bir ekonomist, enflasyonun iki ana nedenini (arz zinciri aksaklıkları, artan tüketici talebi) açıklarken, sunucunun öne sürdüğü ama kendisinin reddettiği üçüncü bir nedeni (döviz kuru dalgalanması) de tartışıyor.\nSoru: "Which TWO causes of inflation does the economist agree are significant?"\nSunucunun önerdiği ama ekonomistin reddettiği seçenek işaretlenmemelidir; konuşmacılar arasındaki fikir ayrılığını takip etmek bu soruyu zorlaştırır.`,
      `Örnek kayıt: Uzun ve teknik bir panelde, iki uzman yapay zeka düzenlemesinin gerekliliği konusunda hemfikirken, düzenlemenin kapsamı konusunda ayrılığa düşüyor; kayıt ayrıca ikisinin de reddettiği aşırı bir görüşten bahsediyor.\nSoru: "Which TWO points do both experts agree on regarding AI regulation?"\nBu en zor örnekte, ortak kabul edilen noktaları anlaşmazlık noktalarından ve reddedilen üçüncü görüşten ayırt etmeniz gerekir; 'we both agree that...' gibi açık uzlaşma ifadelerine odaklanmak en güvenilir stratejidir.`,
    ],
    "listening-fill-in-blanks": [
      `Örnek transkript: "The conference will be held in the __________ hall on the third floor."\nDinlenen kayıtta 'main' kelimesi duyulur. Kısa ve yaygın bir kelime olduğu için imla hatası yapmamaya dikkat edin.`,
      `Örnek transkript: "Photosynthesis allows plants to convert sunlight into chemical __________."\nDinlenen kayıtta 'energy' kelimesi duyulur. Bilimsel terimlerin doğru yazımını bilmek bu soru tipinde kritik önem taşır.`,
      `Örnek transkript: "The company announced a significant __________ in its annual profits."\nDinlenen kayıtta 'increase' kelimesi duyulur. Bağlamdan ayırt edilebilir olsa da imlasına dikkat edilmelidir.`,
      `Örnek transkript: "The professor emphasized the __________ of peer review in scientific publishing."\nDinlenen kayıtta 'importance' kelimesi duyulur. Çok heceli akademik kelimelerin yazımını düzenli tekrar etmek faydalıdır.`,
      `Örnek transkript: "Researchers used a controlled __________ to test the new hypothesis."\nDinlenen kayıtta 'experiment' kelimesi duyulur. Doğru sesli harfe dikkat edin; sık yapılan bir yazım hatası vardır.`,
      `Örnek transkript: "The negotiations reached an unexpected __________ after months of disagreement."\nDinlenen kayıtta 'breakthrough' kelimesi duyulur. Birleşik kelimelerin standart yazımına dikkat edin.`,
      `Örnek transkript: "The committee's recommendations were largely __________ by the board of directors."\nDinlenen kayıtta 'endorsed' kelimesi duyulur. Daha az yaygın akademik fiillerin yazımını önceden çalışmak dikte sırasında tereddüdü azaltır.`,
      `Örnek transkript: "The archaeological findings suggest a level of technological __________ previously unknown in the region."\nDinlenen kayıtta 'sophistication' kelimesi duyulur. Uzun ve çok heceli kelimelerde her heceyi net duyup birleştirmek doğru yazmanın anahtarıdır.`,
      `Örnek transkript: "The study's conclusions were later found to be __________ by a methodological flaw in the sampling process."\nDinlenen kayıtta 'undermined' kelimesi duyulur. Bağlamdan kelimenin olumsuz bir anlam taşıdığını tahmin edebilirsiniz.`,
      `Örnek transkript: "The negotiators ultimately reached a compromise that neither side considered entirely __________."\nDinlenen kayıtta 'satisfactory' kelimesi duyulur. Kelime cümlenin sonunda geldiği için transkriptin sonuna kadar dikkatinizi tam olarak korumanız gerekir.`,
    ],
    "listening-highlight-correct-summary": [
      `Örnek kayıt: Bir konuşmacı, bal arısı popülasyonlarındaki azalmanın hem pestisit kullanımından hem de habitat kaybından kaynaklandığını anlatıyor.\nDoğru özet seçeneği HEM pestisit HEM habitat kaybı nedenini kapsayan seçenek olur; yalnızca birini içeren veya kayıtta geçmeyen bir üçüncü neden ekleyen seçenekler yanıltıcıdır.`,
      `Örnek kayıt: Bir profesör, üniversite kütüphanesinin yeni dijital arşiv sisteminin hem araştırmacılara hem öğrencilere sağladığı iki farklı faydayı anlatıyor.\nDoğru özet seçeneği HER İKİ fayda grubunu da dengeli şekilde yansıtan seçenek olur; sadece araştırmacılara odaklanan bir seçenek eksik bilgi içerdiği için yanlıştır.`,
      `Örnek kayıt: Bir konuşmacı, şehir merkezindeki hava kirliliğinin azalmasının hem yeni toplu taşıma yatırımlarına hem de sanayi bölgelerinin taşınmasına bağlı olduğunu anlatıyor.\nDoğru özet, HER İKİ nedeni de içeren seçenek olur; kayıtta geçmeyen bir üçüncü neden ekleyen seçenekler çeldiricidir.`,
      `Örnek kayıt: Bir doktor, düzenli uykunun hem fiziksel hem zihinsel sağlık üzerindeki etkilerini, ayrıca uyku düzensizliğinin kısa vadeli belirtilerini anlatıyor.\nDoğru özet seçeneği, kaydın ana vurgusu olan 'düzenli uykunun faydaları' konusuna odaklanmalı; yan bir detayı ana fikirmiş gibi sunan seçenekler yanlıştır.`,
      `Örnek kayıt: Bir konuşmacı, bir şirketin yapay zeka destekli müşteri hizmetleri sisteminin hem hız avantajını hem de bazı müşterilerin insan temsilciyi tercih etmeye devam ettiğini dengeli şekilde anlatıyor.\nDoğru özet seçeneği HEM avantajı HEM sınırlılığı yansıtmalı; sadece olumlu yönü vurgulayan tek taraflı bir seçenek yanlıştır.`,
      `Örnek kayıt: Bir profesör, bir tarihi olayın hem kısa vadeli hem uzun vadeli sonuçlarını ayrıntılı biçimde anlatıyor.\nDoğru özet seçeneği HER İKİ zaman dilimini de kapsamalı; yalnızca kısa vadeli sonuçlara odaklanan bir seçenek eksik kalır.`,
      `Örnek kayıt: Bir konuşmacı, bir aşının geliştirilme sürecindeki üç aşamayı sırasıyla ve aralarındaki nedensel bağlantıyı vurgulayarak anlatıyor.\nDoğru özet seçeneği bu üç aşamayı doğru SIRAYLA ve nedensel bağlantılarıyla birlikte özetleyen seçenek olur; yanlış sırada sunan bir seçenek kaydın mantığını çarpıttığı için yanlıştır.`,
      `Örnek kayıt: Bir ekonomist, bir ülkenin para biriminin değer kaybetmesinin hem ihracatçılara faydalı hem ithalatçılara zararlı olduğunu, ayrıca bu etkinin sektöre göre değiştiğini anlatıyor.\nDoğru özet seçeneği bu karmaşık dengeyi doğru yansıtmalı; aşırı basitleştirilmiş bir seçenek yanlıştır.`,
      `Örnek kayıt: Bir felsefeci, özgür irade tartışmasında üç farklı görüşü tarafsız biçimde sunuyor ve hiçbirini desteklemediğini açıkça belirtiyor.\nDoğru özet seçeneği bu tarafsızlığı yansıtan, üç görüşü de dengeli şekilde özetleyen seçenek olur; konuşmacının belirli bir görüşü desteklediğini iddia eden bir seçenek kaydı yanlış yorumladığı için hatalıdır.`,
      `Örnek kayıt: Çok yoğun bir tartışmada, iki uzman iklim politikasının maliyet-fayda analizinde farklı varsayımlar kullandıklarını, ancak ikisinin de belirsizliğin dikkate alınması gerektiği konusunda hemfikir olduğunu anlatıyor.\nDoğru özet seçeneği hem ayrılık noktasını hem de ortak noktayı doğru şekilde yansıtmalı; seçeneklerden yalnızca birini vurgulayanlar eksik kalır — TAM ve DENGELİ olan seçenek doğru cevaptır.`,
    ],
    "listening-mcq-single": [
      `Örnek kayıt: Bir öğrenci, hocasına ödev teslim tarihini uzatıp uzatamayacağını soruyor; hoca sağlık raporu sunması koşuluyla üç gün ek süre veriyor.\nSoru: "What does the professor require from the student?"\nDoğru cevap, hocanın AÇIKÇA istediği koşulu (sağlık raporu) yansıtan seçenek olur, öğrencinin sorununu tekrar eden bir seçenek değil.`,
      `Örnek kayıt: Bir müşteri, bir mağazada iade etmek istediği bir ürünün faturasını kaybettiğini söylüyor; görevli, banka ekstresiyle de iade yapılabileceğini belirtiyor.\nSoru: "What alternative does the clerk offer the customer?"\nDoğru cevap 'banka ekstresi ile iade' seçeneğidir; müşterinin başlangıçtaki sorununu tekrar eden bir seçenek yanlıştır.`,
      `Örnek kayıt: İki meslektaş, bir toplantının saatinin değiştirilip değiştirilemeyeceğini tartışıyor; biri müsait olmadığını söylüyor, diğeri e-posta ile herkese danışmayı öneriyor.\nSoru: "What does the second speaker suggest?"\nDoğru cevap 'herkese e-posta ile danışma' önerisidir.`,
      `Örnek kayıt: Bir profesör, öğrencilerine final sınavının formatının bu yıl değiştiğini, artık çoktan seçmeli yerine açık uçlu sorular içereceğini duyuruyor.\nSoru: "What has changed about the final exam this year?"\nDoğru cevap format değişikliğini doğru tanımlayan seçenektir; sınav tarihiyle ilgili bir seçenek kayıtta hiç geçmediği için yanlıştır.`,
      `Örnek kayıt: Bir turist rehberi, bir müzenin belirli bir kanadının restorasyon nedeniyle geçici olarak kapalı olduğunu, ancak diğer kanatların normal saatlerde ziyaret edilebileceğini anlatıyor.\nSoru: "According to the guide, what is currently unavailable to visitors?"\nDoğru cevap, sadece belirli bir kanadın kapalı olduğunu belirten seçenek olur; 'müzenin tamamı kapalı' diyen bir seçenek yanlıştır.`,
      `Örnek kayıt: Bir radyo programında, bir uzman yeni bir ekonomik verinin beklentilerin üzerinde çıktığını, ancak bunun kalıcı bir eğilim olup olmadığının belirsiz olduğunu belirtiyor.\nSoru: "What does the expert say about the recent economic data?"\nDoğru cevap, verinin beklentileri aştığını ama kalıcılığının belirsiz olduğunu yansıtan dengeli seçenek olur.`,
      `Örnek kayıt: Bir öğrenci danışmanlık ofisine geliyor ve bölüm değiştirmek istediğini söylüyor; danışman önce mevcut bölümdeki derslerin ne kadarının sayılacağını kontrol etmesi gerektiğini belirtiyor.\nSoru: "What does the advisor say the student should check first?"\nDoğru cevap, danışmanın öncelikli olarak önerdiği adımı yansıtan seçenektir; öğrencinin nihai hedefini tekrar eden bir seçenek soruyu yanıtlamaz.`,
      `Örnek kayıt: Bir laboratuvar teknisyeni, bir deneyin sonuçlarının beklenenden farklı çıktığını, ancak bunun ekipman hatasından mı yoksa yeni bir bulgudan mı kaynaklandığının henüz belirsiz olduğunu meslektaşına anlatıyor.\nSoru: "What is the technician uncertain about?"\nDoğru cevap, belirsizliğin KAYNAĞI olduğunu yansıtan seçenektir; sonucun kendisiyle ilgili basit bir seçenek bu inceliği yakalayamaz.`,
      `Örnek kayıt: Bir üniversite yönetim kurulu toplantısında, bir üye bütçe kesintisinin hangi departmanları etkileyeceği konusunda diğer üyelerle aynı fikirde değil; kayıt, tartışmanın sonunda kesin bir karara varılmadığını belirtiyor.\nSoru: "What can be inferred about the outcome of the meeting?"\nDoğru cevap, kararın henüz verilmediğini belirten bir çıkarım seçeneğidir; kayıtta açıkça söylenmeyen ama ima edilen bu sonucu yakalamak gerekir.`,
      `Örnek kayıt: Uzun ve resmi bir üniversite senato tartışmasında, bir üye önerilen müfredat değişikliğini destekliyor ama uygulama takviminin gerçekçi olmadığını düşünüyor.\nSoru: "What is the speaker's main concern about the proposed change?"\nBu zor örnekte doğru cevap, konuşmacının değişikliğin içeriğini değil UYGULAMA TAKVİMİNİ eleştirdiğini ayırt eden seçenektir; değişikliğe tamamen karşı olduğunu iddia eden bir seçenek bu inceliği kaçırdığı için yanlıştır.`,
    ],
    "listening-select-missing-word": [
      `Örnek kayıt: "...and after reviewing all the applications, the committee decided to hire the candidate with the most relevant [BIP]." Seçenekler: experience, appearance, confidence, punctuality.\n'Relevant' kelimesi iş başvurusu bağlamında en doğal şekilde 'experience' ile eşleşir; doğru cevap 'experience'.`,
      `Örnek kayıt: "...the volcano had been dormant for centuries before suddenly becoming [BIP] again last year." Seçenekler: active, silent, invisible, distant.\n'Dormant' kelimesinin zıttı bağlamda aranır; doğru cevap 'active'.`,
      `Örnek kayıt: "...despite repeated warnings from environmental groups, the factory continued to operate without proper [BIP]." Seçenekler: regulation, celebration, permission, appreciation.\nBağlamda çevre gruplarının uyarısı bir düzenleme eksikliğine işaret eder; doğru cevap 'regulation'.`,
      `Örnek kayıt: "...although the negotiations lasted for hours, the two sides failed to reach a [BIP]." Seçenekler: compromise, conflict, celebration, complaint.\nUzun müzakerelerin doğal beklenen sonucu bir uzlaşma olur; doğru cevap 'compromise'.`,
      `Örnek kayıt: "...the museum's new exhibit has attracted far more visitors than curators had originally [BIP]." Seçenekler: anticipated, ignored, prevented, rejected.\nBağlamda bir tahmin/beklenti kavramı aranıyor; doğru cevap 'anticipated'.`,
      `Örnek kayıt: "...even though the evidence seemed overwhelming, the jury remained surprisingly [BIP] about the defendant's guilt." Seçenekler: skeptical, confident, aware, informed.\n'Even though... overwhelming' zıtlık ifadesi jürinin beklenmedik şekilde şüpheci kaldığını işaret eder; doğru cevap 'skeptical'.`,
      `Örnek kayıt: "...the startup's rapid growth eventually attracted the attention of several major [BIP]." Seçenekler: investors, critics, regulators, competitors.\nBu cümlede birden fazla makul seçenek mantıklı görünebilir; ancak 'rapid growth' ifadesinin en doğal sonucu 'investors' çekmesidir; kayıttaki önceki cümlelerdeki bağlamı da dinlemek gerekir.`,
      `Örnek kayıt: "...the research team's initial findings were later called into question due to a flaw in their [BIP]." Seçenekler: methodology, funding, reputation, timeline.\n'Called into question' ifadesi bilimsel bir çalışmanın güvenilirliğiyle ilgilidir; en doğrudan ilişkili kelime 'methodology'dir.`,
      `Örnek kayıt: "...and so, despite the committee's best efforts to remain impartial, critics accused them of [BIP]." Seçenekler: bias, generosity, transparency, efficiency.\n'Despite... impartial' zıtlık ifadesi, eleştirinin tam tersi bir kavrama işaret ettiğini gösterir; doğru cevap 'bias'.`,
      `Örnek kayıt: "...although the treaty was initially hailed as a diplomatic triumph, historians now regard it as a largely symbolic [BIP] that failed to resolve the underlying tensions." Seçenekler: gesture, victory, solution, agreement.\nBu zor örnekte 'symbolic' kelimesinden sonra gelen ve 'failed to resolve' ile çelişmeyen tek seçenek 'gesture'dır; 'solution' ve 'victory' bu ifadeyle çeliştiği için elenir.`,
    ],
    "listening-highlight-incorrect-words": [
      `Örnek: Ekrandaki metinde "The lecture starts at nine o'clock" yazarken, kayıtta aslında "The lecture starts at noon" söyleniyor.\n'Nine o'clock' kelimesi tıklanarak işaretlenmelidir; sayısal ifadelerdeki farklılıklar genellikle en kolay fark edilen uyumsuzluklardır.`,
      `Örnek: Ekrandaki metinde "Scientists discovered a rare mineral" yazarken, kayıtta aslında "Scientists discovered a rare fossil" söyleniyor.\n'Mineral' kelimesi işaretlenmelidir; anlamca ilgili ama farklı iki isim arasındaki fark dikkatli dinleme gerektirir.`,
      `Örnek: Ekrandaki metinde "The company reported a slight increase in profits" yazarken, kayıtta aslında "a slight decrease" söyleniyor.\n'Increase' kelimesi işaretlenmelidir; zıt anlamlı kelimeler arasındaki bu tür değişiklikler anlamı tamamen tersine çevirir.`,
      `Örnek: Ekrandaki metinde "The bridge was constructed using traditional methods" yazarken, kayıtta aslında "innovative methods" söyleniyor.\n'Traditional' kelimesi işaretlenmelidir; kelimeler kulağa benzer gelmese de anlamca zıt olabilir.`,
      `Örnek: Ekrandaki metinde "The survey included over five hundred participants" yazarken, kayıtta aslında "over five thousand participants" söyleniyor.\n'Hundred' kelimesi işaretlenmelidir; sayısal büyüklük ifadelerindeki benzer sesli ama farklı anlamlı kelimelere dikkat edin.`,
      `Örnek: Ekrandaki metinde "The vaccine proved effective against the virus" yazarken, kayıtta aslında "proved partially effective" söyleniyor; metinde 'partially' kelimesi eksik olduğu için bu, eksik kelime değil, yanlış aktarılmış bir nüans örneğidir.\nBu tür ince farkları ayırt edebilmek için tam cümleyi dikkatle takip etmek gerekir.`,
      `Örnek: Ekrandaki metinde "The stationary shop sells notebooks and pens" yazarken, kayıtta aslında "stationery shop" söyleniyor (aynı telaffuz, farklı yazım/anlam).\nBu tür sesteş kelimelerde işaretleme genellikle yapılmaz çünkü telaffuz aynıdır; bu örnek, sadece anlamca farklı olan ama farklı telaffuz edilen kelimelerin arandığını hatırlatan bir çeldiricidir.`,
      `Örnek: Ekrandaki metinde "The policy will affect approximately ten percent of employees" yazarken, kayıtta aslında "ninety percent" söyleniyor.\n'Ten' kelimesi işaretlenmelidir; büyük sayısal farklılıklar cümlenin anlamını kökten değiştirdiği için önceliklidir.`,
      `Örnek: Ekrandaki metinde "The committee unanimously approved the proposal" yazarken, kayıtta aslında "reluctantly approved" söyleniyor.\n'Unanimously' kelimesi işaretlenmelidir; soyut zarfların benzer cümle yapısı içinde nasıl farklı bir tutum ima edebileceğini gösterir.`,
      `Örnek: Uzun ve hızlı okunan bir kayıtta, ekrandaki metinde art arda üç kelime ('significant', 'temporary', 'widespread') değiştirilmiş halde bulunuyor ve konuşmacının hızlı temposu bu farkları ayırt etmeyi zorlaştırıyor.\nBu en zor örnekte, metni kelime kelime takip ederken duraksamamak ve şüpheli gördüğünüz her kelimeyi hemen işaretlemek en güvenli stratejidir; negatif puanlama olduğu için sadece gerçekten emin olduğunuz kelimeleri işaretleyin.`,
    ],
    "listening-write-from-dictation": [
      `Örnek dinletilen cümle: "The library closes at eight on weekdays."\nBu kısa ve basit cümlede kelime sırasını ve büyük harfleri doğru yazmaya dikkat edin.`,
      `Örnek dinletilen cümle: "Please submit your application before the deadline."\nCümledeki 'application' ve 'deadline' kelimelerinin yazımına özellikle dikkat edin.`,
      `Örnek dinletilen cümle: "The results were published in a scientific journal."\n'Scientific' ve 'journal' gibi kelimelerin yazımını önceden çalışmak faydalı olur.`,
      `Örnek dinletilen cümle: "Employees must wear protective equipment at all times."\nBu cümlede 'protective equipment' öbeğini bir bütün olarak hafızada tutmaya çalışın.`,
      `Örnek dinletilen cümle: "The negotiations resumed after a brief recess."\n'Negotiations' ve 'recess' gibi daha az sık kullanılan kelimelerin yazımına dikkat edin.`,
      `Örnek dinletilen cümle: "Researchers are investigating the cause of the outbreak."\nCümleyi dinledikten hemen sonra yazmaya başlayın; bir kelimeyi hatırlamakta zorlanırsanız cümlenin geri kalanını yazıp sonradan dönebilirsiniz.`,
      `Örnek dinletilen cümle: "The committee unanimously approved the revised budget proposal."\nUzun bu cümlede kelime sayısı fazladır; anahtar kelimeleri doğru sırayla yazmaya odaklanın.`,
      `Örnek dinletilen cümle: "Despite the setback, the team remained optimistic about the outcome."\n'Despite' ile başlayan bu cümlede virgülden sonraki kısmı kaçırmamak için cümlenin tamamına odaklanın.`,
      `Örnek dinletilen cümle: "The archaeological discovery challenged previously held assumptions."\nBu cümlede 'archaeological' gibi uzun ve zor yazılan bir kelime bulunur; kelimeyi hatırlayamasanız bile cümlenin geri kalanını doğru yazmak kısmi puan kazandırır.`,
      `Örnek dinletilen cümle: "Notwithstanding the initial skepticism, the proposal ultimately gained widespread support."\nBu en zor örnekte 'notwithstanding' gibi resmi ve az kullanılan bir bağlaç bulunur; bu kelimeyi tam hatırlayamasanız bile cümlenin geri kalanını doğru yazıp boşluk bırakmak, tüm cümleyi boş bırakmaktan daha iyi bir stratejidir.`,
    ],
  };
  for (const [index, def] of pteTopicDefs.entries()) {
    const meta = pteTopicMeta[def.slug];
    const topic = await db.examTopic.upsert({
      where: { examTypeId_slug: { examTypeId: examTypes.PTE.id, slug: def.slug } },
      update: { name: def.name, description: def.description, questionCount: def.questionCount, displayOrder: index, ...meta },
      create: { examTypeId: examTypes.PTE.id, slug: def.slug, name: def.name, description: def.description, questionCount: def.questionCount, displayOrder: index, ...meta },
    });

    const pteLessons = [...def.lessons, { title: "Örnek Sorular", durationMinutes: 6, contentBody: formatExamples(pteExamples[def.slug]) }];
    for (const [lessonIndex, lessonDef] of pteLessons.entries()) {
      const existingLesson = await db.topicLesson.findFirst({ where: { topicId: topic.id, position: lessonIndex } });
      if (existingLesson) {
        await db.topicLesson.update({ where: { id: existingLesson.id }, data: { title: lessonDef.title, durationMinutes: lessonDef.durationMinutes, contentBody: lessonDef.contentBody } });
      } else {
        await db.topicLesson.create({ data: { topicId: topic.id, position: lessonIndex, title: lessonDef.title, durationMinutes: lessonDef.durationMinutes, contentBody: lessonDef.contentBody } });
      }
    }
  }

  const toeflTopicDefs = [
    {
      slug: "toefl-vocabulary",
      name: "Kelime (Vocabulary)",
      questionCount: 3,
      description:
        "Bu soru tipinde metinde koyu renkle vurgulanmış bir kelime veya ifadenin metindeki anlamına en yakın seçeneği bulmanız istenir. Her okuma parçasında birkaç kez karşınıza çıkar. (Not: TOEFL, PTE/YDS gibi sabit bir soru dağılımı yayınlamaz; buradaki sayılar tipik bir okuma parçasındaki ortalama sıklığı gösterir.)\n\nHazırlık İpucu: Kelimeyi bulunduğu cümle ve bir önceki/sonraki cümledeki bağlamla birlikte okuyun; çoğu zaman kelimenin tam anlamını bilmeseniz bile bağlamdan doğru seçeneği çıkarabilirsiniz.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Ekranda metindeki koyu renkli bir kelime/ifade ile 4 seçenek belirir; anlamca en yakın olanı seçersiniz. Kelimeyi doğrudan tercüme etmeye çalışmak yerine, cümledeki rolüne (isim mi, fiil mi, olumlu mu olumsuz mu) bakın ve bu rolü koruyan seçeneği bulun. Düzenli okuma yapmak ve kök/ek (prefix/suffix) bilginizi geliştirmek bu soru tipi için en kalıcı hazırlık yöntemidir." },
      ],
    },
    {
      slug: "toefl-reference",
      name: "Referans / Bağlaşıklık (Reference)",
      questionCount: 1,
      description:
        "Bu soru tipinde metindeki bir zamirin (it, they, this, these vb.) veya işaret sözcüğünün metindeki hangi isme/ifadeye atıfta bulunduğunu bulmanız istenir.\n\nHazırlık İpucu: Zamirden geriye doğru okuyarak, cümle yapısı ve sayı (tekil/çoğul) uyumuna dikkat ederek en yakın uygun adayı bulun.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Referans kelimesi genellikle koyu renkle vurgulanır; seçenekler metindeki farklı isim öbekleridir. Doğru cevap, zamirle sayı (tekil/çoğul) ve anlam bakımından tam uyumlu olan isimdir — çoğunlukla zamirden hemen önceki cümlelerde yer alır. Bu soru tipini çözerken adayları tek tek zamirin yerine koyarak cümlenin anlamlı olup olmadığını kontrol edin." },
      ],
    },
    {
      slug: "toefl-sentence-simplification",
      name: "Cümle Sadeleştirme (Sentence Simplification)",
      questionCount: 1,
      description:
        "Metindeki karmaşık ve koyu renkle vurgulanmış bir cümlenin, aynı temel anlamı taşıyan ama daha sade bir şekilde yeniden ifade edilmiş halini 4 seçenek arasından bulmanız istenir.\n\nHazırlık İpucu: Doğru cevap orijinal cümledeki TÜM önemli bilgiyi korumalıdır; yanlış seçenekler genellikle bir detayı atlar, çarpıtır veya orijinalde olmayan yeni bir bilgi ekler.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Bu soru tipi her okuma parçasında yalnızca 1 kez sorulur ve doğrudan metinden bağımsız olarak, verilen karmaşık cümleyi anlama becerinizi ölçer. Seçenekleri tek tek orijinal cümleyle karşılaştırın: anlamı değiştiren, önemli bir bilgiyi çıkaran veya metinde olmayan bir iddia ekleyen seçenekleri eleyin. Doğru cevap, orijinal cümleyle aynı mantıksal ilişkiyi (neden-sonuç, karşıtlık vb.) farklı kelimelerle koruyandır." },
      ],
    },
    {
      slug: "toefl-insert-text",
      name: "Cümle Yerleştirme (Insert Text)",
      questionCount: 1,
      description:
        "Metinde dört yere yerleştirilmiş kare işaretleri (■) bulunur; verilen yeni bir cümlenin bu dört konumdan hangisine en uygun şekilde yerleştirileceğini bulmanız istenir.\n\nHazırlık İpucu: Verilen cümledeki bağlaç ve zamirlere (however, this, therefore, such) dikkat edin — bu kelimeler cümlenin hangi fikirden sonra geleceğine dair güçlü ipucu verir.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Ekranda metnin dört farklı noktasında kare işaretleri belirir; fareyle tıklayarak verilen cümleyi seçtiğiniz konuma yerleştirirsiniz. Her aday konumu sırayla deneyin: cümleyi oraya yerleştirdiğinizde paragrafın akışı bozulmadan, mantıklı bir geçiş oluşuyor mu diye kontrol edin. Verilen cümlenin başındaki bağlaç veya zamir, genellikle bir önceki cümlede bahsedilen bir fikre referans verir." },
      ],
    },
    {
      slug: "toefl-factual-information",
      name: "Gerçek Bilgi (Factual Information)",
      questionCount: 2,
      description:
        "Metinde açıkça belirtilen bir bilgiyle ilgili soru sorulur; doğru cevap metinde birebir veya yakın eş anlamlı ifadeyle geçer.\n\nHazırlık İpucu: Soru kökündeki anahtar kelimeleri metinde tarayarak ilgili bölümü hızlıca bulun, ardından o bölümü dikkatle okuyarak cevabı seçin.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Bu en sık karşılaşılan soru tipidir; metnin belirli bir bölümünde açıkça yer alan bir bilgiyi doğru şekilde tanımanızı ister. Yanlış seçenekler genellikle metinde geçen kelimeleri kullanır ama anlamı çarpıtır veya metinde bahsedilmeyen bir detay ekler. Soru kökündeki anahtar kelime veya kavramı metinde arayarak ilgili paragrafı hızlıca bulun, cevabı orada arayın." },
      ],
    },
    {
      slug: "toefl-negative-factual",
      name: "Olumsuz Gerçek Bilgi (Negative Factual Information)",
      questionCount: 1,
      description:
        "'NOT true' veya 'EXCEPT' gibi ifadeler içeren bu soru tipinde, metinde belirtilmeyen veya yanlış olan TEK seçeneği bulmanız istenir; diğer üç seçenek metinde doğru olarak geçer.\n\nHazırlık İpucu: Her seçeneği tek tek metinle karşılaştırın ve metinde doğrulanan üç seçeneği eleyin — geriye kalan cevabınızdır.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Soru kökünde 'NOT' veya 'EXCEPT' kelimesi büyük harflerle vurgulanır. Dört seçenekten üçü metinde doğrudan doğrulanabilir, biri ise ya metinde hiç geçmez ya da metinle çelişir. En sistematik yöntem, ilgili paragrafı okurken her seçeneğin metinde geçip geçmediğini işaretlemek ve doğrulanamayan seçeneği işaretlemektir." },
      ],
    },
    {
      slug: "toefl-inference",
      name: "Çıkarım (Inference)",
      questionCount: 2,
      description:
        "Metinde doğrudan söylenmeyen ama verilen bilgilerden mantıksal olarak çıkarılabilecek bir sonucu bulmanız istenir. Genellikle 'infer', 'imply' veya 'suggest' kelimeleri sorulda geçer.\n\nHazırlık İpucu: Doğru cevap metindeki bilgilerle desteklenen, ancak birebir metinde yazılı olmayan bir sonuç olmalıdır; metinde açıkça yazılan bir bilgiyi tekrar eden seçenekler bu soru tipinde genellikle yanlıştır.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Bu soru tipi metnin ötesine geçerek, verilen ipuçlarından mantıklı bir sonuç çıkarmanızı gerektirir. İlgili paragrafı dikkatle okuyun ve 'Bu bilgilerden ne sonucuna varabilirim?' sorusunu kendinize sorun. Doğru cevap her zaman metindeki bilgilerle tutarlı olmalı, ama metinde birebir yazılı olmamalıdır; aşırı yorum içeren veya metinle çelişen seçenekleri eleyin." },
      ],
    },
    {
      slug: "toefl-rhetorical-purpose",
      name: "Retorik Amaç (Rhetorical Purpose)",
      questionCount: 2,
      description:
        "Yazarın metinde belirli bir bilgiyi, örneği veya cümleyi NEDEN kullandığını sorar (örn. karşılaştırma yapmak için, bir iddiayı desteklemek için). 'Why does the author mention...' kalıbıyla sorulur.\n\nHazırlık İpucu: Sorulan bölümün metindeki işlevine odaklanın — bu bölümün ne dediğine değil, o bölümün paragraftaki ROLÜNE bakın (örnek verme, karşıtlık kurma, neden açıklama vb.).",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Bu soru tipi metnin İÇERİĞİNİ değil, yazarın o bilgiyi neden verdiğini (metindeki işlevini/amacını) sorar. Sorulan cümle veya örneğin bir öncesi ve sonrasını okuyarak o bölümün paragraf içindeki rolünü belirleyin: bir genellemeyi somutlaştırmak için mi, bir karşı görüşü çürütmek için mi, yoksa bir neden-sonuç ilişkisini açıklamak için mi kullanılmış? Doğru cevap bu işlevi doğru tanımlayandır." },
      ],
    },
    {
      slug: "toefl-prose-summary",
      name: "Metin Özeti (Prose Summary)",
      questionCount: 1,
      description:
        "Her okuma parçasının sonunda bulunan bu soru tipinde, 6 cümle seçeneğinden metnin ana fikrini en iyi yansıtan 3 tanesini seçip özet tablosuna sürüklemeniz istenir. Doğru her cümle için 1 puan, en fazla 2 puan alınabilir (toplamda 3-4 puanlık bir sorudur).\n\nHazırlık İpucu: Önemsiz detaylara odaklanan veya metnin sadece küçük bir bölümüyle ilgili cümleleri eleyin; doğru cevaplar metnin GENEL ana fikrini yansıtan, birbirinden bağımsız üç büyük fikri kapsar.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Ekranda kısa bir giriş cümlesi ve altında 6 seçenek cümle bulunur; bunlardan doğru 3 tanesini sürükleyerek özet kutusuna yerleştirirsiniz. Yanlış seçenekler genellikle metinde geçmeyen bir bilgi içerir, önemsiz bir detayı ana fikirmiş gibi sunar veya metinle çelişir. Metnin her paragrafının ana fikrini kısaca not alarak bu 3 büyük fikri daha kolay ayırt edebilirsiniz." },
      ],
    },
    {
      slug: "toefl-fill-table",
      name: "Tabloyu Doldurma (Fill in a Table)",
      questionCount: 1,
      description:
        "Prose Summary sorusuna alternatif olarak bazı okuma parçalarının sonunda karşınıza çıkabilen bu soru tipinde, verilen cümleleri metinde anlatılan 2-3 kategoriye göre bir tabloya sürükleyerek sınıflandırmanız istenir.\n\nHazırlık İpucu: Metindeki her kategoriyi tanımlayan anahtar özellikleri not alın, ardından her seçenek cümleyi bu özelliklerle karşılaştırarak doğru kategoriye yerleştirin.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Bu soru tipi genellikle karşılaştırma veya sınıflandırma içeren metinlerde (örn. iki teori, iki tarihsel dönem) kullanılır. Ekranda 2-3 sütunlu boş bir tablo ve 5-7 seçenek cümle bulunur; her cümleyi doğru sütuna sürüklersiniz. Metni okurken her kategoriye ait özellikleri ayrı ayrı not almak, seçenekleri hızlıca doğru sütuna yerleştirmenizi kolaylaştırır." },
      ],
    },
    {
      slug: "toefl-gist-content",
      name: "Ana İçerik (Gist-Content)",
      questionCount: 1,
      description:
        "Dinlenen konuşma veya dersin GENEL olarak ne hakkında olduğunu sorar. Genellikle her konuşma/dersin ilk sorusudur.\n\nHazırlık İpucu: Konuşmanın başındaki tanıtım cümlesini (kim, nerede, ne hakkında konuşuyor) dikkatle dinleyin — bu genellikle ana konuyu doğrudan verir.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "'What is the conversation mainly about?' veya 'What aspect of X does the professor mainly discuss?' şeklinde sorulur. Dinlerken tekrar eden kelimeleri ve konuşmanın başında verilen genel çerçeveyi not alın; doğru cevap genellikle bu genel çerçeveyle örtüşür, tek bir küçük detayla değil." },
      ],
    },
    {
      slug: "toefl-gist-purpose",
      name: "Amaç (Gist-Purpose)",
      questionCount: 1,
      description:
        "Bir öğrencinin neden bir ofise gittiğini veya bir konuşmanın amacının ne olduğunu sorar; genellikle kampüs konuşmalarında karşınıza çıkar.\n\nHazırlık İpucu: Konuşmanın en başındaki ilk birkaç cümleye odaklanın — konuşmayı başlatan kişi genellikle amacını açıkça belirtir.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "'Why does the student visit the professor?' gibi sorularla, konuşmanın gerçekleşme NEDENİNİ sorar. Konuşmayı başlatan kişinin ilk cümlelerini dikkatle dinleyin; amaç genellikle dolaylı biçimde ('I was wondering if...', 'I'm having trouble with...') ifade edilir, bu kalıpları tanımak faydalıdır." },
      ],
    },
    {
      slug: "toefl-listening-detail",
      name: "Detay (Detail)",
      questionCount: 2,
      description:
        "Konuşma veya derste açıkça belirtilen belirli bir bilgiyi (bir tanım, bir örnek, bir sayı) sorar.\n\nHazırlık İpucu: Not alırken sayıları, isimleri ve tanımları özellikle kaydedin; bu tür detaylar sorularda sıkça karşınıza çıkar.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Bu soru tipi, konuşmada geçen spesifik bir bilgiyi hatırlamanızı ister. Erasable not defterine (gerçek sınavda verilir) anahtar kelimeleri ve sayıları kısaltmalarla not almak, tekrar dinleme imkanınız olmadığı için hayati önem taşır. Yanlış seçenekler genellikle konuşmada geçen başka bir detayı karıştırarak sunar." },
      ],
    },
    {
      slug: "toefl-function",
      name: "İfadenin İşlevi (Function of What is Said)",
      questionCount: 1,
      description:
        "Konuşmacının belirli bir cümleyi NEDEN söylediğini sorar (örneğin alay etmek, şaşkınlığını belirtmek, bir öneride bulunmak için); genellikle konuşmanın bir kısmı tekrar çalınarak sorulur.\n\nHazırlık İpucu: Cümlenin kelime anlamına değil, konuşmacının TONUNA ve konuşmanın genel bağlamına odaklanın.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Bu soru tipinde konuşmanın bir bölümü tekrar dinletilir ve 'Why does the speaker say this?' diye sorulur. Cümlenin literal anlamı çoğu zaman cevap değildir — konuşmacının bu cümleyle neyi KASTETTİĞİNE (ironi, uyarı, öneri, hayal kırıklığı) odaklanmalısınız. Konuşmacının ses tonu (yükselen/alçalan, tereddütlü) bu soruları çözmede önemli bir ipucudur." },
      ],
    },
    {
      slug: "toefl-attitude",
      name: "Tutum (Attitude)",
      questionCount: 1,
      description:
        "Konuşmacının bir konu hakkındaki duygusunu veya görüşünü (kesinlik, şüphe, hayal kırıklığı, heyecan) sorar.\n\nHazırlık İpucu: Konuşmacının kullandığı sıfatlara ve ses tonundaki değişikliklere (vurgu, duraklama) dikkat edin; bunlar tutumun en güçlü göstergeleridir.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "'What is the professor's attitude toward X?' şeklinde sorulur ve konuşmacının duygusal tutumunu doğru tanımlamanızı gerektirir. Kelimelerin sözlük anlamından çok, SÖYLENİŞ biçimine (sarkastik, hevesli, temkinli) odaklanın; bir konuşmacı olumlu kelimeler kullanırken bile ses tonuyla şüphe belirtebilir." },
      ],
    },
    {
      slug: "toefl-organization",
      name: "Organizasyon (Organization)",
      questionCount: 1,
      description:
        "Bir dersin nasıl yapılandırıldığını (örneğin, karşılaştırma yaparak, kronolojik sırayla, neden-sonuç ilişkisiyle) sorar.\n\nHazırlık İpucu: Dinlerken konuşmacının kullandığı geçiş ifadelerine (first, in contrast, as a result, for example) dikkat edin; bunlar dersin yapısını ortaya koyar.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Bu soru tipi, akademik bir dersin BÜTÜN olarak nasıl organize edildiğini sorar (örn. 'How does the professor organize the information about X?'). Notlarınızı alırken dersin ana bölümlerini (giriş, örnek 1, örnek 2, sonuç gibi) ayrı ayrı işaretlemek, dersin genel yapısını görmenizi kolaylaştırır." },
      ],
    },
    {
      slug: "toefl-connecting-content",
      name: "İçeriği Bağlama (Connecting Content)",
      questionCount: 1,
      description:
        "Derste bahsedilen iki veya daha fazla fikir/kavram arasındaki ilişkiyi (benzerlik, karşıtlık, neden-sonuç) anlamanızı ister; bazen bir tablo doldurarak veya sınıflandırma yaparak cevaplanır.\n\nHazırlık İpucu: Ders sırasında karşılaştırılan iki kavramı not alırken aralarındaki farkı ve benzerliği ayrı sütunlar halinde yazmak faydalıdır.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Bu soru tipi genellikle bir tabloyu doldurma veya sıralama formatında karşınıza çıkar ve dersteki iki veya daha fazla unsur arasındaki ilişkiyi anlamanızı gerektirir. Notlarınızda karşılaştırılan kavramları yan yana yazıp aralarındaki bağlantıyı (X, Y'ye neden olur; A, B'nin bir alt türüdür gibi) özetlemek, bu soruları çözmenizi kolaylaştırır." },
      ],
    },
    {
      slug: "toefl-independent-speaking",
      name: "Bağımsız Konuşma Görevleri (Independent Tasks)",
      questionCount: 2,
      description:
        "TOEFL Konuşma bölümünün ilk iki görevidir. Size tanıdık bir konu hakkında kişisel görüşünüz veya tercihiniz sorulur; herhangi bir okuma veya dinleme materyaline dayanmadan, tamamen kendi deneyim ve fikirlerinizden yararlanarak cevap verirsiniz.\n\nHazırlık İpucu: Cevabınızı kısa bir açılış cümlesi (görüşünüz), 2 gerekçe ve kısa bir kapanışla yapılandırın; 15 saniyelik hazırlık süresinde sadece bu iskeleti not alın, cümleleri ezberlemeye çalışmayın.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Ekranda bir soru belirir (örneğin, 'Bazı insanlar X'i tercih eder, bazıları Y'yi. Siz hangisini tercih edersiniz ve neden?'). 15-20 saniye hazırlık süresinin ardından 45-60 saniye içinde cevap vermeniz istenir. Bu görevler yalnızca konuşma becerinizi, herhangi bir okuma/dinleme materyaline dayanmadan ölçer." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Değerlendirme; genel akıcılık ve doğruluk (dilbilgisi, kelime bilgisi, telaffuz) ile fikirlerinizin ne kadar iyi geliştirilip desteklendiğine göre yapılır. Net bir görüş belirtip bunu somut, kişisel örneklerle desteklemek soyut/genel ifadelerden daha etkilidir. Konuşurken duraksamamaya, doğal bir tempoda akıcı konuşmaya odaklanın — küçük dilbilgisi hataları akıcı bir cevabı düşük puanlamaz." },
      ],
    },
    {
      slug: "toefl-integrated-speaking",
      name: "Bütünleşik Konuşma Görevleri (Integrated Tasks)",
      questionCount: 4,
      description:
        "TOEFL Konuşma bölümünün 4 görevidir; bir metin okuma ve/veya bir konuşma dinleme sonrasında duyduklarınızı/okuduklarınızı özetleyerek veya bir görüşü savunarak konuşmanız istenir.\n\nHazırlık İpucu: Okurken ve dinlerken mutlaka not alın — ana fikir ve 2-3 destekleyici nokta yeterlidir; cevabınızı bu notları kullanarak, duyduğunuz/okuduğunuz orijinal cümleleri birebir tekrarlamadan kendi kelimelerinizle oluşturun.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Bu 4 görevde farklı kombinasyonlar bulunur: kısa bir kampüs duyurusu okuma + ilgili bir konuşma dinleme (kampüs durumu hakkında), akademik bir metin okuma + ilgili bir ders dinleme (akademik kavram hakkında), veya sadece bir ders/konuşma dinleyip özetleme. Her görev için 20-30 saniye hazırlık ve 60 saniye cevap süresi verilir." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Puanlama, okuduğunuz/dinlediğiniz materyaldeki ana noktaları ne kadar doğru ve eksiksiz aktardığınıza (içerik) ve ne kadar akıcı/doğru konuştuğunuza (dil kullanımı) göre yapılır. Notlarınızda okuma parçasının ana iddiasını ve dinlediğiniz konuşmanın bu iddiaya nasıl tepki verdiğini (destekliyor mu, karşı mı çıkıyor mu) ayrı ayrı işaretlemek, cevabınızı organize etmenizi kolaylaştırır." },
      ],
    },
    {
      slug: "toefl-integrated-writing",
      name: "Bütünleşik Yazma Görevi (Integrated Writing)",
      questionCount: 1,
      description:
        "Kısa bir akademik metni (yaklaşık 230-300 kelime) okur, ardından aynı konuda bir ders dinlersiniz. Dinlediğiniz derste okuduğunuz metne nasıl bir tepki verildiğini (destekleme, çürütme) özetleyen 150-225 kelimelik bir yazı yazmanız istenir; bunun için 20 dakikanız vardır.\n\nHazırlık İpucu: Yazınızı, metindeki her ana noktayı ve dersin bu noktaya verdiği tepkiyi eşleştiren bir yapıda organize edin (örneğin 3 paragraf, her biri bir nokta çiftini ele alsın).",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Önce 3 dakika boyunca akademik bir metin okursunuz (metin daha sonra tekrar ekranda görünür). Ardından aynı konuda bir profesörün metne katılmadığı ya da katıldığı bir dersini dinlersiniz (dinleme sırasında metin ekrandan kalkar). Son olarak, dersin metindeki noktalara nasıl karşılık verdiğini özetleyen bir yazı yazmak için 20 dakikanız vardır." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Puanlama; dersteki bilgileri metinle doğru şekilde ilişkilendirmenize (içerik), yazınızın organizasyonuna ve dil kullanımınıza (dilbilgisi, kelime bilgisi) göre yapılır. Kendi görüşünüzü eklemeyin — bu görev yalnızca duyduğunuz/okuduğunuz bilgiyi doğru aktarmanızı ölçer. Metindeki her ana iddia için dersteki karşılık gelen tepkiyi ayrı bir paragrafta ele almak en güvenli yapıdır." },
      ],
    },
    {
      slug: "toefl-independent-writing",
      name: "Bağımsız Yazma Görevi (Independent Writing)",
      questionCount: 1,
      description:
        "Tanıdık bir konu hakkında kendi görüşünüzü savunan bir deneme yazmanız istenir. En az 300 kelime yazmanız önerilir; bunun için 30 dakikanız vardır.\n\nHazırlık İpucu: Klasik giriş-gelişme-sonuç yapısını kullanın: girişte net bir tez cümlesi belirtin, gelişme paragraflarında her biri ayrı bir gerekçe ve somut örnekle görüşünüzü destekleyin, sonuçta görüşünüzü kısaca tekrarlayın.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Ekranda güncel veya genel bir tartışma konusu belirir (örneğin teknolojinin günlük hayata etkisi). Kendi görüşünüzü net bir şekilde belirtip gerekçelerle desteklediğiniz bir deneme yazmak için 30 dakikanız vardır. En az 300 kelime yazmanız önerilir, ancak kaliteli içerik miktar kadar önemlidir." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Puanlama; fikirlerinizin gelişimi ve organizasyonu, dil kullanımınızın çeşitliliği ve doğruluğu (dilbilgisi, kelime bilgisi) kriterlerine göre yapılır. Somut, kişisel örnekler kullanmak soyut genellemelerden daha ikna edicidir. Yazdıktan sonra kalan birkaç dakikayı gramer ve yazım hatalarını kontrol etmeye ayırın." },
      ],
    },
  ];
  const toeflTopicMeta = {
    "toefl-vocabulary": { category: "READING", skillsTested: "Kelime Bilgisi", difficulty: "Kolay" },
    "toefl-reference": { category: "READING", skillsTested: "Bağlaşıklık, Referans Takibi", difficulty: "Orta" },
    "toefl-sentence-simplification": { category: "READING", skillsTested: "Cümle Yapısı, Anlam Koruma", difficulty: "Orta" },
    "toefl-insert-text": { category: "READING", skillsTested: "Metin Akışı, Bağlaçlar", difficulty: "Zor" },
    "toefl-factual-information": { category: "READING", skillsTested: "Detay Tarama", difficulty: "Kolay" },
    "toefl-negative-factual": { category: "READING", skillsTested: "Detay Tarama, Eleme", difficulty: "Orta" },
    "toefl-inference": { category: "READING", skillsTested: "Çıkarım Yapma", difficulty: "Zor" },
    "toefl-rhetorical-purpose": { category: "READING", skillsTested: "Yazarın Amacını Anlama", difficulty: "Zor" },
    "toefl-prose-summary": { category: "READING", skillsTested: "Ana Fikir, Özetleme", difficulty: "Zor" },
    "toefl-fill-table": { category: "READING", skillsTested: "Sınıflandırma, Kategorileme", difficulty: "Zor" },
    "toefl-gist-content": { category: "LISTENING", skillsTested: "Ana Konu Anlama", difficulty: "Kolay" },
    "toefl-gist-purpose": { category: "LISTENING", skillsTested: "Amaç Anlama", difficulty: "Orta" },
    "toefl-listening-detail": { category: "LISTENING", skillsTested: "Detay Dinleme", difficulty: "Orta" },
    "toefl-function": { category: "LISTENING", skillsTested: "Pragmatik Anlama, Ton", difficulty: "Zor" },
    "toefl-attitude": { category: "LISTENING", skillsTested: "Tutum ve Ton Analizi", difficulty: "Zor" },
    "toefl-organization": { category: "LISTENING", skillsTested: "Yapı Analizi", difficulty: "Orta" },
    "toefl-connecting-content": { category: "LISTENING", skillsTested: "İlişkilendirme, Karşılaştırma", difficulty: "Zor" },
    "toefl-independent-speaking": { category: "SPEAKING", skillsTested: "Akıcılık, Fikir Geliştirme", difficulty: "Orta" },
    "toefl-integrated-speaking": { category: "SPEAKING", skillsTested: "Not Alma, Özetleme, Akıcılık", difficulty: "Zor" },
    "toefl-integrated-writing": { category: "WRITING", skillsTested: "Okuma, Dinleme, Yazma, Karşılaştırma", difficulty: "Zor" },
    "toefl-independent-writing": { category: "WRITING", skillsTested: "Yazma, Fikir Geliştirme, Dilbilgisi", difficulty: "Orta" },
  };
  const toeflExamples = {
    "toefl-vocabulary": [
      "Örnek cümle: \"The company's profits **plummeted** after the scandal became public.\"\nSoru: \"plummeted\" kelimesine en yakın anlam nedir? (A) increased (B) dropped sharply (C) remained stable (D) slowly declined\nDoğru cevap (B) — 'plummeted' ani ve sert bir düşüşü ifade eder; 'scandal' bağlamı da hızlı bir düşüşü destekler.",
      "Örnek cümle: \"The archaeologist's **meticulous** documentation of every artifact allowed future researchers to reconstruct the site accurately.\"\nSoru: \"meticulous\" kelimesine en yakın anlam nedir? (A) careless (B) extremely careful (C) quick (D) expensive\nDoğru cevap (B) — cümledeki 'allowed... to reconstruct accurately' ifadesi, işin büyük bir titizlikle yapıldığını gösterir.",
      "Örnek cümle: \"Smartphones have become so **ubiquitous** that it is difficult to find a public space where no one is using one.\"\nSoru: \"ubiquitous\" kelimesine en yakın anlam nedir? (A) expensive (B) outdated (C) present everywhere (D) dangerous\nDoğru cevap (C) — 'difficult to find a place where no one is using one' ifadesi, akıllı telefonların her yerde bulunduğunu gösterir.",
      "Örnek cümle: \"Despite the offer of a full scholarship, the student remained **reluctant** to move to a different country.\"\nSoru: \"reluctant\" kelimesine en yakın anlam nedir? (A) eager (B) unwilling (C) prepared (D) proud\nDoğru cevap (B) — 'despite the offer' bağlacı, öğrencinin isteksiz davrandığını, teklife rağmen çekimser kaldığını gösterir.",
      "Örnek cümle: \"Prolonged drought can **exacerbate** food shortages in regions that already depend on unreliable rainfall.\"\nSoru: \"exacerbate\" kelimesine en yakın anlam nedir? (A) solve (B) worsen (C) delay (D) measure\nDoğru cevap (B) — kuraklığın zaten kırılgan olan bir bölgede sorunu daha da kötüleştireceği anlamı cümlenin bağlamıyla uyumludur.",
      "Örnek cümle: \"The researchers gathered initial data in the spring; **subsequently**, they returned in autumn to measure seasonal changes.\"\nSoru: \"subsequently\" kelimesine en yakın anlam nedir? (A) previously (B) rarely (C) afterward (D) accidentally\nDoğru cevap (C) — noktalı virgülden sonraki cümle, ilkbahardan SONRA gerçekleşen bir olayı anlatır.",
      "Örnek cümle: \"As urban sprawl continued, the population of native songbirds began to **dwindle** noticeably each year.\"\nSoru: \"dwindle\" kelimesine en yakın anlam nedir? (A) grow rapidly (B) gradually decrease (C) stay constant (D) migrate\nDoğru cevap (B) — 'noticeably each year' ifadesi, kademeli ve sürekli bir azalmayı işaret eder.",
      "Örnek cümle: \"Critics argued that the judge's decision seemed **arbitrary**, since it did not follow any of the court's established guidelines.\"\nSoru: \"arbitrary\" kelimesine en yakın anlam nedir? (A) fair (B) based on random choice, not reason (C) delayed (D) well documented\nDoğru cevap (B) — 'did not follow any established guidelines' ifadesi, kararın herhangi bir mantıksal kurala değil keyfi bir tercihe dayandığını gösterir.",
      "Örnek cümle: \"The connection between the two historical events remains **tenuous**, supported by only a handful of ambiguous records.\"\nSoru: \"tenuous\" kelimesine en yakın anlam nedir? (A) strong and certain (B) weak and uncertain (C) illegal (D) well known\nDoğru cevap (B) — 'supported by only a handful of ambiguous records' ifadesi bağlantının zayıf olduğunu gösterir.",
      "Örnek cümle: \"The coach's halftime speech seemed to **galvanize** the team, who returned to the field with noticeably more energy.\"\nSoru: \"galvanize\" kelimesine en yakın anlam nedir? (A) confuse (B) discourage (C) spur into action (D) exhaust\nDoğru cevap (C) — 'returned... with noticeably more energy' ifadesi, konuşmanın takımı harekete geçirdiğini gösterir.",
    ],
    "toefl-reference": [
      "Örnek cümle: \"Researchers studied the migration patterns of arctic terns, which travel nearly 70,000 kilometers annually. **This** makes them the longest-migrating animals on Earth.\"\n'This' neye atıfta bulunur? Doğru cevap: 'traveling nearly 70,000 kilometers annually' — zamir bir önceki cümledeki bu spesifik gerçeğe işaret eder, sadece 'arctic terns'e değil.",
      "Örnek cümle: \"Early printing presses required each letter to be set by hand, a process that could take several days for a single page. **It** was not until the invention of mechanized typesetting that production sped up significantly.\"\n'It' neye atıfta bulunur? Doğru cevap: 'the process of setting each letter by hand' — zamir, önceki cümlede tanımlanan yavaş sürece atıfta bulunur, 'a single page'e değil.",
      "Örnek cümle: \"Many coastal cities rely on barrier islands and wetlands to absorb the force of storm surges. **These** natural buffers are increasingly threatened by rising sea levels.\"\n'These' neye atıfta bulunur? Doğru cevap: 'barrier islands and wetlands' — çoğul zamir, bir önceki cümlede sayılan iki doğal unsura işaret eder.",
      "Örnek cümle: \"The professor compared two theories of memory formation, noting that **the latter** relies more heavily on repeated exposure than the former.\"\n'The latter' neye atıfta bulunur? Doğru cevap: cümlede ikinci sırada bahsedilen teori — 'the latter' her zaman iki öğeden SONRA gelene işaret eder, ilkine değil.",
      "Örnek cümle: \"Volcanic ash can remain suspended in the atmosphere for months, altering global temperatures. **Such** effects were documented after the 1815 eruption of Mount Tambora.\"\n'Such' neye atıfta bulunur? Doğru cevap: 'the atmospheric and temperature effects caused by volcanic ash' — zamir, önceki cümlede tanımlanan genel etki türüne atıfta bulunur.",
      "Örnek cümle: \"A single beehive can contain over fifty thousand worker bees, each performing a specialized task. **They** communicate the location of food sources through a complex series of movements known as the waggle dance.\"\n'They' neye atıfta bulunur? Doğru cevap: 'worker bees' — zamir sayıca uyumlu olan çoğul isme, 'a single beehive'a değil, işçi arılara işaret eder.",
      "Örnek cümle: \"Some economists argue that automation displaces workers only temporarily, while **others** insist the effect is permanent for certain industries.\"\n'Others' neye atıfta bulunur? Doğru cevap: 'other economists (who disagree with the first group)' — zamir, cümlenin başındaki 'some economists' grubuna karşıt olan farklı bir grup uzmana işaret eder.",
      "Örnek cümle: \"The medieval manuscript had been copied by hand multiple times before printing became widespread. **Each** copy introduced small variations, some accidental and some deliberate.\"\n'Each' neye atıfta bulunur? Doğru cevap: 'each of the hand-copied versions of the manuscript' — zamir, önceki cümlede bahsedilen tekrar tekrar kopyalanan nüshalara işaret eder.",
      "Örnek cümle: \"Deep-sea vents release mineral-rich water that supports colonies of tube worms and other organisms. **This ecosystem** functions without any sunlight whatsoever.\"\n'This ecosystem' neye atıfta bulunur? Doğru cevap: 'the community of tube worms and other organisms living around deep-sea vents' — ifade, önceki cümlede tanımlanan canlı topluluğunun tamamına işaret eder.",
      "Örnek cümle: \"Two competing hypotheses attempt to explain the extinction of the megafauna: climate change and human overhunting. Neither **one** fully accounts for the regional variation in extinction timing.\"\n'One' neye atıfta bulunur? Doğru cevap: 'hypothesis' (climate change VEYA human overhunting'den herhangi biri) — 'neither one' ifadesi, iki tekil hipotezden birine atıfta bulunan genel bir yerine geçen kelimedir.",
    ],
    "toefl-sentence-simplification": [
      "Orijinal cümle: \"Although coral reefs cover less than one percent of the ocean floor, they support approximately twenty-five percent of all marine species.\"\nDoğru sadeleştirme: \"Coral reefs occupy a tiny fraction of the ocean floor yet host a quarter of all marine species.\" Bu seçenek her iki bilgiyi de korur; yanlış seçenekler genellikle bunlardan birini atlar.",
      "Orijinal cümle: \"Because the printing press dramatically reduced the cost of producing books, literacy rates rose steadily across Europe over the following two centuries.\"\nDoğru sadeleştirme: \"The printing press lowered book production costs, which led to a gradual rise in European literacy over the next two hundred years.\" Yanlış seçenekler genellikle neden-sonuç ilişkisini tersine çevirir veya zaman dilimini atlar.",
      "Orijinal cümle: \"While some species of frogs lay thousands of eggs to compensate for high mortality rates, others invest heavily in protecting a small number of offspring.\"\nDoğru sadeleştirme: \"Some frog species produce huge numbers of eggs to offset losses, while others focus on carefully guarding just a few young.\" Yanlış seçenekler genellikle karşılaştırmayı kaybederek sadece bir stratejiden bahseder.",
      "Orijinal cümle: \"The discovery of penicillin, though largely accidental, transformed medicine by making previously fatal bacterial infections treatable.\"\nDoğru sadeleştirme: \"Penicillin was discovered by accident, but it changed medicine by turning once-deadly bacterial infections into treatable ones.\" Doğru seçenek hem 'kaza eseri keşif' hem de 'tedavi edilebilir hale gelme' bilgisini korur.",
      "Orijinal cümle: \"Given that groundwater is replenished far more slowly than it is currently being extracted in many agricultural regions, some aquifers may take centuries to recover.\"\nDoğru sadeleştirme: \"Because groundwater is being pumped out faster than it is replaced in many farming areas, some aquifers could need centuries to refill.\" Yanlış seçenekler genellikle 'centuries' bilgisini atlar veya nedeni çarpıtır.",
      "Orijinal cümle: \"Despite initial skepticism from the scientific community, the theory of continental drift eventually gained widespread acceptance once new evidence from seafloor mapping emerged.\"\nDoğru sadeleştirme: \"Although scientists doubted it at first, continental drift theory was later widely accepted after seafloor mapping provided new evidence.\" Yanlış seçenekler genellikle 'eventually' ile ifade edilen zaman akışını değiştirir.",
      "Orijinal cümle: \"Not only did the new irrigation system increase crop yields, but it also reduced the amount of water wasted through evaporation.\"\nDoğru sadeleştirme: \"The new irrigation system both raised crop yields and cut down on water lost to evaporation.\" Doğru seçenek 'not only... but also' ile bağlanan İKİ faydayı da korur; yanlış seçenekler genellikle sadece birini belirtir.",
      "Orijinal cümle: \"Even though the novelist rarely left her hometown, her fiction vividly depicted distant countries she had only read about.\"\nDoğru sadeleştirme: \"Although the novelist seldom traveled beyond her hometown, she wrote vivid descriptions of faraway countries she knew only from books.\" Yanlış seçenekler genellikle yazarın seyahat ettiğini ima ederek orijinal anlamla çelişir.",
      "Orijinal cümle: \"The committee's recommendation, which had been delayed by months of internal disagreement, ultimately failed to satisfy either side of the debate.\"\nDoğru sadeleştirme: \"After months of internal disagreement delayed it, the committee's recommendation still did not satisfy either side.\" Doğru seçenek hem gecikme nedenini hem de sonucun her iki tarafı da tatmin etmediği bilgisini korur.",
      "Orijinal cümle: \"Whereas early telescopes relied solely on visible light, modern instruments capture radiation across the entire electromagnetic spectrum, revealing phenomena invisible to the naked eye.\"\nDoğru sadeleştirme: \"Unlike early telescopes, which used only visible light, modern telescopes detect the full electromagnetic spectrum and reveal things the eye cannot see.\" Yanlış seçenekler genellikle 'entire electromagnetic spectrum' detayını daraltarak bilgi kaybına yol açar.",
    ],
    "toefl-insert-text": [
      "Metin: \"...Many species have adapted to urban environments. [■A] Pigeons, for example, now nest on buildings. [■B] Raccoons have learned to open garbage cans. [■C] This adaptability, however, does not apply to all species. [■D]\"\nVerilen cümle: \"Similarly, some birds have altered their migration patterns.\" Bu cümle [■B] konumuna yerleşir çünkü 'similarly' bir önceki örnekle paralel yeni bir örnek sunar.",
      "Metin: \"...The library's renovation will take place over the summer. [■A] The main reading room will be closed entirely. [■B] The reference section, on the other hand, will remain accessible through a temporary entrance. [■C] Students should plan their study schedules accordingly. [■D]\"\nVerilen cümle: \"This means students who rely on the main collection will need to use a different campus library instead.\" Bu cümle [■B] konumuna yerleşir çünkü 'this' ifadesi bir önceki cümledeki 'main reading room will be closed' bilgisine atıfta bulunur.",
      "Metin: \"...Fungi play a crucial role in forest ecosystems. [■A] They break down dead organic matter, recycling nutrients back into the soil. [■B] Certain species also form symbiotic relationships with tree roots. [■C] Without fungi, forests would accumulate large amounts of undecomposed debris. [■D]\"\nVerilen cümle: \"In exchange, the trees supply the fungi with sugars produced through photosynthesis.\" Bu cümle [■C] konumuna yerleşir çünkü 'in exchange' ifadesi bir önceki cümledeki karşılıklı ilişkiyi tamamlar.",
      "Metin: \"...The Roman aqueducts were engineering marvels. [■A] Some stretched over fifty kilometers, relying entirely on gravity to move water. [■B] Their precise gradients required extraordinarily accurate surveying. [■C] Many remained partially functional over a thousand years after construction. [■D]\"\nVerilen cümle: \"Even a slight miscalculation in slope could cause the water to stagnate or overflow.\" Bu cümle [■C] konumuna yerleşir çünkü bir önceki cümledeki 'precise gradients' ve 'accurate surveying' ifadelerinin NEDENİNİ açıklar.",
      "Metin: \"...Bilingual children often show cognitive advantages. [■A] Studies have linked bilingualism to improved task-switching ability. [■B] Some researchers, however, argue that these effects are inconsistent across studies. [■C] More rigorous long-term research is still needed. [■D]\"\nVerilen cümle: \"For example, they can shift more easily between two different sets of rules in a game.\" Bu cümle [■B] konumuna yerleşir çünkü 'for example' ifadesi bir önceki cümledeki 'task-switching ability' iddiasını somutlaştırır.",
      "Metin: \"...The Great Depression reshaped American economic policy. [■A] Unemployment rates reached nearly twenty-five percent at their peak. [■B] The federal government responded by creating large public works programs. [■C] These programs employed millions of workers on infrastructure projects. [■D]\"\nVerilen cümle: \"This dramatic rise in joblessness pushed policymakers to intervene directly in the economy for the first time on such a scale.\" Bu cümle [■B] konumuna yerleşir çünkü 'this dramatic rise' ifadesi bir önceki cümledeki işsizlik oranına atıfta bulunur ve devletin müdahalesine geçişi hazırlar.",
      "Metin: \"...Octopuses possess remarkably complex nervous systems. [■A] Roughly two-thirds of their neurons are located in their arms rather than their brains. [■B] This distributed structure allows each arm to act with some independence. [■C] Scientists continue to study how this affects the octopus's overall behavior. [■D]\"\nVerilen cümle: \"As a result, an arm can continue reacting to stimuli even after being separated from the body.\" Bu cümle [■C] konumuna yerleşir çünkü 'as a result' ifadesi bir önceki cümledeki 'independence' sonucunu açıklar.",
      "Metin: \"...The transition to renewable energy faces several obstacles. [■A] Storage technology has not yet caught up with the variability of solar and wind power. [■B] Existing power grids were largely designed for centralized fossil fuel plants. [■C] Upgrading this infrastructure requires substantial investment. [■D]\"\nVerilen cümle: \"Adapting them to handle power generated from many small, scattered sources is proving costly and slow.\" Bu cümle [■C] konumuna yerleşir çünkü 'them' ifadesi bir önceki cümledeki 'existing power grids'e atıfta bulunur.",
      "Metin: \"...Medieval guilds regulated nearly every aspect of a craftsman's career. [■A] An apprentice typically trained under a master for several years without pay. [■B] Only after completing this training could someone become a journeyman. [■C] Becoming a full master required producing an approved 'masterpiece' work. [■D]\"\nVerilen cümle: \"Even then, a journeyman often had to work for additional years before gaining full independence.\" Bu cümle [■C] konumuna yerleşir çünkü 'even then' ifadesi bir önceki cümledeki journeyman aşamasına gönderme yapar.",
      "Metin: \"...Glacial retreat has accelerated in many mountain ranges. [■A] Meltwater from glaciers currently supplies drinking water to millions of people downstream. [■B] As glaciers shrink, this seasonal water supply becomes less reliable. [■C] Some communities have already begun seeking alternative water sources. [■D]\"\nVerilen cümle: \"This growing uncertainty is prompting local governments to reconsider long-term water management plans.\" Bu cümle [■C] konumuna yerleşir çünkü 'this growing uncertainty' ifadesi bir önceki cümledeki güvenilmezlik durumuna atıfta bulunur.",
    ],
    "toefl-factual-information": [
      "Örnek metin: \"The Great Barrier Reef, located off the coast of Australia, is the world's largest coral reef system, stretching over 2,300 kilometers.\"\nSoru: \"According to the passage, the Great Barrier Reef is notable for its...\" Doğru cevap metinde birebir geçen 'length' (2,300 km) bilgisini yansıtan seçenektir.",
      "Örnek metin: \"The Amazon rainforest produces roughly twenty percent of the world's oxygen and is home to an estimated ten percent of all known species.\"\nSoru: \"According to the passage, what percentage of known species live in the Amazon rainforest?\" Doğru cevap: '10 percent' — metinde açıkça belirtilen sayı.",
      "Örnek metin: \"Honeybees communicate the direction and distance of food sources to other members of the hive through a series of movements called the waggle dance.\"\nSoru: \"According to the passage, how do honeybees share information about food sources?\" Doğru cevap: 'through a specific pattern of movement' — metinde 'waggle dance' olarak tanımlanan hareket serisi.",
      "Örnek metin: \"The first successful powered flight by the Wright brothers in 1903 lasted only twelve seconds and covered a distance of about 37 meters.\"\nSoru: \"According to the passage, how long did the first powered flight last?\" Doğru cevap: 'twelve seconds' — metinde doğrudan belirtilen süre.",
      "Örnek metin: \"Sequoia trees can live for more than 3,000 years and can grow to heights exceeding 90 meters, making them among the tallest living organisms on Earth.\"\nSoru: \"According to the passage, sequoia trees are remarkable for which two characteristics?\" Doğru cevap, metinde açıkça belirtilen yaşam süresi VE yükseklik bilgilerini birlikte yansıtan seçenektir.",
      "Örnek metin: \"During the Ming Dynasty, Chinese explorer Zheng He led seven major naval expeditions, commanding fleets that included ships far larger than any in Europe at the time.\"\nSoru: \"According to the passage, what set Zheng He's fleets apart from European ships of the same era?\" Doğru cevap: 'their size' — metinde 'far larger than any in Europe' ifadesiyle açıkça belirtilen bilgi.",
      "Örnek metin: \"Antibiotic resistance develops when bacteria are repeatedly exposed to antibiotics, allowing the small number of naturally resistant bacteria to survive and reproduce.\"\nSoru: \"According to the passage, how does antibiotic resistance develop?\" Doğru cevap, metinde açıkça anlatılan hayatta kalma/üreme sürecini yansıtan seçenektir.",
      "Örnek metin: \"The Icelandic language has changed so little over the past thousand years that modern speakers can still read medieval sagas with relatively little difficulty.\"\nSoru: \"According to the passage, what is notable about the Icelandic language?\" Doğru cevap: metinde açıkça belirtilen 'değişimin az olması ve eski metinlerin okunabilirliği' bilgisi.",
      "Örnek metin: \"Meteorologists classify a hurricane as Category 5, the most severe rating, when sustained wind speeds exceed 252 kilometers per hour.\"\nSoru: \"According to the passage, what wind speed qualifies a hurricane as Category 5?\" Doğru cevap: 'above 252 kilometers per hour' — metinde birebir belirtilen eşik değer.",
      "Örnek metin: \"Unlike most mammals, elephants continue growing new sets of molars throughout their lives, replacing worn teeth up to six times.\"\nSoru: \"According to the passage, how are elephants different from most other mammals regarding their teeth?\" Doğru cevap: metinde açıkça belirtilen 'yaşamları boyunca defalarca diş değiştirebilme' bilgisini yansıtan seçenektir.",
    ],
    "toefl-negative-factual": [
      "Örnek metin, bir bitkinin üç özelliğinden bahsediyor: kuraklığa dayanıklılık, hızlı büyüme, düşük bakım ihtiyacı.\nSoru: \"All of the following are mentioned EXCEPT:\" (A) drought resistance (B) rapid growth (C) low maintenance (D) colorful flowers\nDoğru cevap (D) — metinde 'colorful flowers' hiç geçmez.",
      "Örnek metin, bir şehrin toplu taşıma sisteminin üç avantajından bahsediyor: düşük maliyet, sık sefer, geniş kapsama alanı.\nSoru: \"According to the passage, all of the following are advantages of the transit system EXCEPT:\" (A) low cost (B) frequent service (C) wide coverage (D) high passenger comfort\nDoğru cevap (D) — metinde yolcu konforuna dair herhangi bir ifade bulunmaz.",
      "Örnek metin, göçmen kuşların üç navigasyon yöntemini anlatıyor: yıldızları kullanma, manyetik alanı algılama, güneşin konumunu izleme.\nSoru: \"The passage mentions all of the following methods birds use for navigation EXCEPT:\" (A) observing stars (B) sensing magnetic fields (C) tracking the sun's position (D) memorizing landmarks from previous trips\nDoğru cevap (D) — metinde önceki yolculuklardan hatırlanan işaretlerden bahsedilmez.",
      "Örnek metin, bir volkanik patlamanın üç etkisinden bahsediyor: kül bulutu oluşumu, sıcaklık düşüşü, tarımsal kayıplar.\nSoru: \"All of the following effects of the eruption are mentioned EXCEPT:\" (A) formation of an ash cloud (B) a drop in temperature (C) agricultural losses (D) an increase in seismic activity elsewhere\nDoğru cevap (D) — metinde başka bölgelerde sismik aktivite artışına dair bir ifade yer almaz.",
      "Örnek metin, bir üniversitenin burs programının üç koşulundan bahsediyor: minimum not ortalaması, tam zamanlı kayıt, mali ihtiyaç belgesi.\nSoru: \"According to the passage, the scholarship requires all of the following EXCEPT:\" (A) a minimum grade point average (B) full-time enrollment (C) proof of financial need (D) a letter of recommendation\nDoğru cevap (D) — metinde tavsiye mektubundan hiç söz edilmez.",
      "Örnek metin, mercan resiflerini tehdit eden üç faktörden bahsediyor: su sıcaklığındaki artış, okyanus asitlenmesi, aşırı balıkçılık.\nSoru: \"The passage identifies all of the following as threats to coral reefs EXCEPT:\" (A) rising water temperatures (B) ocean acidification (C) overfishing (D) invasive plant species\nDoğru cevap (D) — metinde istilacı bitki türlerinden bahsedilmez.",
      "Örnek metin, bir yazının üç aşamasından bahsediyor: taslak oluşturma, akran değerlendirmesi, son düzenleme.\nSoru: \"According to the passage, the writing process described includes all of the following stages EXCEPT:\" (A) drafting (B) peer review (C) final editing (D) publication\nDoğru cevap (D) — metin yalnızca yazma sürecinin aşamalarını anlatır, yayınlamadan bahsetmez.",
      "Örnek metin, bir hayvanın kışı geçirme stratejilerinin üçünden bahsediyor: kış uykusuna yatma, göç etme, kürk kalınlaştırma.\nSoru: \"The passage mentions all of the following winter survival strategies EXCEPT:\" (A) hibernating (B) migrating (C) growing thicker fur (D) storing food underground\nDoğru cevap (D) — metinde yer altında yiyecek depolamaktan söz edilmez.",
      "Örnek metin, bir şirketin yeni politikasının üç sonucundan bahsediyor: maliyet tasarrufu, çalışan memnuniyetinde artış, üretim hızında yavaşlama.\nSoru: \"According to the passage, the new policy resulted in all of the following EXCEPT:\" (A) cost savings (B) increased employee satisfaction (C) slower production (D) higher customer complaints\nDoğru cevap (D) — metinde müşteri şikayetlerinin artışına dair bir bilgi verilmez.",
      "Örnek metin, bir tarihi olayın üç nedeninden bahsediyor: ekonomik kriz, siyasi huzursuzluk, dış baskı.\nSoru: \"The passage cites all of the following as causes of the uprising EXCEPT:\" (A) economic crisis (B) political unrest (C) foreign pressure (D) a natural disaster\nDoğru cevap (D) — metinde doğal bir afetten hiç bahsedilmez.",
    ],
    "toefl-inference": [
      "Örnek metin: \"Despite repeated warnings from scientists, coastal development continued at an unprecedented rate throughout the decade.\"\nSoru: \"It can be inferred that...\" Doğru cevap, metinde DOĞRUDAN yazmayan ama mantıken çıkarılabilecek bir sonuç olmalı (örn. 'economic interests were prioritized over environmental concerns').",
      "Örnek metin: \"The company's quarterly reports showed steady growth, yet its founder abruptly resigned without offering any public explanation.\"\nSoru: \"What can be inferred about the founder's resignation?\" Doğru cevap metinde yazılı olmayan ama ipucuna dayalı bir çıkarım olmalıdır (örn. 'there may have been an internal problem not reflected in the public reports').",
      "Örnek metin: \"Although the ancient city had access to a reliable water source, archaeologists found evidence that it was abandoned within a single generation.\"\nSoru: \"It can be inferred that the city's abandonment was likely caused by...\" Doğru cevap, su kaynağının yeterliliğine rağmen terk edilmesinin BAŞKA bir nedene (örn. çatışma, hastalık) işaret ettiğini çıkaran seçenektir.",
      "Örnek metin: \"The professor noted that the experiment's results contradicted nearly every prediction made by the leading theory in the field.\"\nSoru: \"It can be inferred that the leading theory...\" Doğru cevap: 'may need to be revised or reconsidered' — metinde doğrudan yazmasa da, tahminlerle çelişen sonuçlar teorinin sorgulanmasını gerektirir.",
      "Örnek metin: \"Even after the new bridge reduced commute times significantly, public transportation ridership in the city remained unchanged.\"\nSoru: \"It can be inferred that...\" Doğru cevap: 'factors other than commute time may influence people's choice of transportation' — metinde açık yazılmayan ama mantıken çıkarılan bir sonuç.",
      "Örnek metin: \"The manuscript, written in a dialect no longer spoken, contains references to trade routes that were not documented in any other surviving source.\"\nSoru: \"It can be inferred that the manuscript...\" Doğru cevap: 'provides historical information unavailable elsewhere' — metinde dolaylı olarak ima edilen, başka kaynakta bulunmayan bilgi taşıdığı sonucu.",
      "Örnek metin: \"Despite being smaller and less powerful than rival species, this insect species has managed to survive in nearly every climate on the planet.\"\nSoru: \"It can be inferred that this species' survival is most likely due to...\" Doğru cevap metinde açık yazılmayan bir uyum yeteneğine veya alternatif bir hayatta kalma stratejisine işaret eden seçenek olmalıdır.",
      "Örnek metin: \"The museum's newest exhibit received far more visitors in its first month than any previous exhibit, despite receiving almost no advertising.\"\nSoru: \"It can be inferred that the exhibit's popularity was most likely driven by...\" Doğru cevap: 'word of mouth or informal recommendations' gibi reklam dışı bir faktöre işaret eden, metinde doğrudan yazılmayan bir sonuç olmalıdır.",
      "Örnek metin: \"Although the treaty was signed by all parties, border skirmishes continued intermittently for several more years.\"\nSoru: \"It can be inferred that the treaty...\" Doğru cevap: 'did not fully resolve the underlying tensions between the parties' — imzalanmasına rağmen çatışmaların sürmesi, anlaşmanın sorunu tam çözmediğini ima eder.",
      "Örnek metin: \"The species' fossil record shows almost no change in skeletal structure over nearly ten million years, even as the surrounding climate shifted dramatically.\"\nSoru: \"It can be inferred that this species...\" Doğru cevap: 'was already well suited to a range of environmental conditions' — iklim değişse bile fiziksel yapının değişmemesi, türün geniş bir uyum kapasitesine sahip olduğunu ima eder.",
    ],
    "toefl-rhetorical-purpose": [
      "Örnek metin: \"Consider the case of the passenger pigeon, once so numerous that flocks darkened the sky for hours. By 1914, the species was extinct.\"\nSoru: \"Why does the author mention the passenger pigeon?\" Doğru cevap bu örneğin İŞLEVİNİ açıklar (örn. 'to illustrate how quickly an abundant species can become extinct').",
      "Örnek metin: \"Some argue that written language emerged purely from the need for record-keeping. Yet the earliest known Sumerian tablets record not inventories, but epic poetry.\"\nSoru: \"Why does the author mention the earliest Sumerian tablets?\" Doğru cevap işlevi yansıtır (örn. 'to challenge the claim that written language began solely as a practical tool').",
      "Örnek metin: \"Take, for instance, the way a spider rebuilds its web after a storm destroys it — a process requiring no conscious planning, only instinct.\"\nSoru: \"Why does the author mention the spider rebuilding its web?\" Doğru cevap: 'to provide a concrete example of behavior driven by instinct rather than reasoning'.",
      "Örnek metin: \"Critics of the policy point to the case of a neighboring country, where a similar law led to a sharp rise in unemployment within two years.\"\nSoru: \"Why does the author refer to the neighboring country's experience?\" Doğru cevap: 'to support an argument against the policy by citing a real-world precedent'.",
      "Örnek metin: \"Not every innovation is embraced immediately; the bicycle, for example, was initially dismissed by many as an impractical novelty.\"\nSoru: \"Why does the author mention the bicycle?\" Doğru cevap: 'to give an example of an invention that was initially underestimated'.",
      "Örnek metin: \"One might assume that larger brains always indicate greater intelligence, yet crows, with comparatively small brains, solve multi-step puzzles that stump many mammals.\"\nSoru: \"Why does the author mention crows?\" Doğru cevap: 'to counter the assumption that brain size alone determines intelligence'.",
      "Örnek metin: \"The fall of the Western Roman Empire is often attributed to a single cause, but consider that its eastern half, facing similar pressures, survived for another thousand years.\"\nSoru: \"Why does the author mention the Eastern Roman Empire?\" Doğru cevap: 'to question a simple, single-cause explanation for the fall of Rome'.",
      "Örnek metin: \"Some nutrients are best absorbed with fat; vitamin D, for instance, is far more effectively absorbed when consumed alongside a source of dietary fat.\"\nSoru: \"Why does the author mention vitamin D?\" Doğru cevap: 'to provide a specific example supporting the general claim about nutrient absorption'.",
      "Örnek metin: \"Language change is often gradual, but occasionally a single event accelerates it dramatically, as when the printing press standardized English spelling within a few generations.\"\nSoru: \"Why does the author mention the printing press?\" Doğru cevap: 'to illustrate an exception to the usual gradual pace of language change'.",
      "Örnek metin: \"It is tempting to assume that ancient trade required advanced navigation, yet Polynesian voyagers crossed vast stretches of open ocean using only wave patterns and stars.\"\nSoru: \"Why does the author mention Polynesian voyagers?\" Doğru cevap: 'to show that sophisticated results can be achieved without advanced technology'.",
    ],
    "toefl-prose-summary": [
      "Örnek: Bir metin fotosentez sürecini üç açıdan anlatıyor: ışık enerjisinin emilimi, kimyasal reaksiyonlar, oksijen üretimi.\nDoğru özet cümleleri bu ÜÇ ana fikri kapsar; metindeki küçük bir detayı ana fikirmiş gibi sunan seçenekler yanlıştır.",
      "Örnek: Bir metin, Sanayi Devrimi'nin üç ana etkisini anlatıyor: kentleşmenin hızlanması, fabrika sisteminin yaygınlaşması, çalışma koşullarının değişmesi.\nDoğru özet cümleleri bu üç büyük etkiyi kapsar; metinde geçen tek bir fabrikadan veya şehirden bahseden dar kapsamlı bir cümle yanlıştır.",
      "Örnek: Bir metin, bal arılarının koloni içi iletişimini üç yönüyle anlatıyor: waggle dance ile yön bildirme, feromonlarla uyarı verme, kraliçe arının kimyasal kontrolü.\nDoğru özet cümleleri bu üç iletişim biçimini kapsar; sadece bir örneği (örneğin sadece feromonları) tekrar eden seçenekler eksik kalır.",
      "Örnek: Bir metin, iklim değişikliğinin kutup ayısı popülasyonuna üç etkisini anlatıyor: buz örtüsünün azalması, avlanma alanlarının daralması, üreme oranının düşmesi.\nDoğru özet cümleleri bu üç etkiyi dengeli biçimde yansıtır; metnin sadece bir cümlesinde geçen ikincil bir detayı öne çıkaran seçenekler yanlıştır.",
      "Örnek: Bir metin, Rönesans döneminde sanatın üç yönden nasıl değiştiğini anlatıyor: perspektifin keşfi, dini temalardan insan temalarına geçiş, zengin patronların sanatı desteklemesi.\nDoğru özet cümleleri bu üç büyük değişimi kapsar; sadece bir ressamdan bahseden dar bir seçenek yanlıştır.",
      "Örnek: Bir metin, bir şirketin başarısının üç nedenini anlatıyor: erken pazar girişi, güçlü marka sadakati, sürekli ürün yenileme.\nDoğru özet cümleleri bu üç nedeni kapsar; metinde sadece küçük bir örneği (tek bir ürün lansmanı gibi) ana fikirmiş gibi sunan seçenekler yanlıştır.",
      "Örnek: Bir metin, deniz seviyesinin yükselmesinin kıyı toplulukları üzerindeki üç etkisini anlatıyor: tarım arazilerinin tuzlanması, altyapı hasarı, nüfusun iç kesimlere göçü.\nDoğru özet cümleleri bu üç etkiyi kapsar; sadece bir kasabadan bahseden anekdotsal bir detayı öne çıkaran seçenek eksik kalır.",
      "Örnek: Bir metin, bir dilin nasıl yok olma riskiyle karşılaştığını üç açıdan anlatıyor: genç kuşağın dili konuşmaması, resmi eğitimde kullanılmaması, medyada temsil edilmemesi.\nDoğru özet cümleleri bu üç faktörü kapsar; sadece tek bir köyün örneğini genelleyen bir seçenek yanlıştır.",
      "Örnek: Bir metin, bir tıbbi tedavinin geliştirilme sürecini üç aşamada anlatıyor: laboratuvar testleri, hayvanlar üzerinde deneyler, insan klinik denemeleri.\nDoğru özet cümleleri bu üç aşamayı sırasıyla kapsar; sadece bir aşamayı detaylandıran bir seçenek eksik bir özet oluşturur.",
      "Örnek: Bir metin, bir nehir ekosisteminin bozulmasının üç nedenini anlatıyor: endüstriyel atıklar, aşırı su çekimi, yerli bitki örtüsünün kaybı.\nDoğru özet cümleleri bu üç nedeni dengeli biçimde yansıtır; metinde geçen tek bir fabrikadan bahseden dar bir seçenek yanlıştır.",
    ],
    "toefl-fill-table": [
      "Örnek: Metin Rönesans ve Aydınlanma Çağı'nı karşılaştırıyor. 'Sanat ve dine odaklanma' cümlesi Rönesans sütununa, 'bilim ve akla odaklanma' cümlesi Aydınlanma sütununa yerleştirilir — her cümlenin hangi dönemin karakteristik özelliğini yansıttığını metinden takip edin.",
      "Örnek: Metin, omurgalı ve omurgasız hayvanları karşılaştırıyor. 'İç iskelete sahip olma' cümlesi omurgalılar sütununa, 'dış iskelete veya iskeletsiz yapıya sahip olma' cümlesi omurgasızlar sütununa yerleştirilir.",
      "Örnek: Metin, ekstansif ve entansif tarım yöntemlerini karşılaştırıyor. 'Geniş arazi, düşük girdi kullanma' cümlesi ekstansif tarım sütununa, 'küçük arazi, yüksek verim hedefleme' cümlesi entansif tarım sütununa yerleştirilir.",
      "Örnek: Metin, klasik koşullanma ve edimsel koşullanmayı karşılaştırıyor. 'Uyarıcılar arasında istemsiz bir ilişki kurma' cümlesi klasik koşullanma sütununa, 'davranışın sonuçlarına göre şekillenmesi' cümlesi edimsel koşullanma sütununa yerleştirilir.",
      "Örnek: Metin, göçebe ve yerleşik toplulukları karşılaştırıyor. 'Mevsimsel olarak yer değiştirme' cümlesi göçebe topluluklar sütununa, 'kalıcı tarım ve yapılar inşa etme' cümlesi yerleşik topluluklar sütununa yerleştirilir.",
      "Örnek: Metin, monarşi ve cumhuriyet yönetim biçimlerini karşılaştırıyor. 'Yönetimin kalıtsal olarak devredilmesi' cümlesi monarşi sütununa, 'yöneticilerin seçimle belirlenmesi' cümlesi cumhuriyet sütununa yerleştirilir.",
      "Örnek: Metin, iç sular ve deniz ekosistemlerini karşılaştırıyor. 'Tuzluluk oranının düşük olması' cümlesi iç sular sütununa, 'tuzluluk oranının yüksek olması' cümlesi deniz ekosistemleri sütununa yerleştirilir.",
      "Örnek: Metin, merkezi ve dağıtık (ademi merkeziyetçi) yönetim sistemlerini karşılaştırıyor. 'Kararların tek bir otorite tarafından alınması' cümlesi merkezi sistem sütununa, 'kararların yerel birimlere devredilmesi' cümlesi dağıtık sistem sütununa yerleştirilir.",
      "Örnek: Metin, yenilenebilir ve yenilenemez enerji kaynaklarını karşılaştırıyor. 'Kaynağın doğada sürekli yenilenmesi' cümlesi yenilenebilir enerji sütununa, 'kaynağın sınırlı olması ve tükenmesi' cümlesi yenilenemez enerji sütununa yerleştirilir.",
      "Örnek: Metin, tek yıllık ve çok yıllık bitkileri karşılaştırıyor. 'Yaşam döngüsünü bir sezonda tamamlama' cümlesi tek yıllık bitkiler sütununa, 'kök sisteminin birden fazla sezon hayatta kalması' cümlesi çok yıllık bitkiler sütununa yerleştirilir.",
    ],
    "toefl-gist-content": [
      "Örnek: Bir öğrenci ile kütüphane görevlisi arasındaki konuşma, bir kitabın nasıl rezerve edileceğini konu alıyor.\nSoru: \"What is the conversation mainly about?\" Doğru cevap konuşmanın GENEL amacını yansıtır ('how to reserve a library book'), tek bir küçük detayı değil.",
      "Örnek: Bir biyoloji dersinde profesör, yarasaların ekolokasyon yeteneğini nasıl kullandığını genel hatlarıyla anlatıyor.\nSoru: \"What is the lecture mainly about?\" Doğru cevap: 'how bats use echolocation to navigate and find food' — dersin genel çerçevesini yansıtan seçenek.",
      "Örnek: Bir öğrenci ile akademik danışman arasındaki konuşma, ders programı değişikliği seçeneklerini konu alıyor.\nSoru: \"What are the speakers mainly discussing?\" Doğru cevap: 'options for changing the student's course schedule' — konuşmanın bütününü kapsayan genel bir ifade.",
      "Örnek: Bir sanat tarihi dersinde profesör, empresyonist ressamların ışığı tuvalde farklı biçimde nasıl ele aldığını anlatıyor.\nSoru: \"What is the professor mainly discussing?\" Doğru cevap: 'how Impressionist painters approached the depiction of light' — dersin ana temasını yansıtan seçenek.",
      "Örnek: İki öğrenci arasındaki konuşma, bir grup projesi için görev dağılımını nasıl yapacaklarını konu alıyor.\nSoru: \"What are the students mainly talking about?\" Doğru cevap: 'how to divide responsibilities for a group project' — konuşmanın genel amacını yansıtan seçenek.",
      "Örnek: Bir jeoloji dersinde profesör, tektonik plakaların hareketinin depremlere nasıl yol açtığını genel olarak anlatıyor.\nSoru: \"What is the lecture mainly about?\" Doğru cevap: 'the relationship between tectonic plate movement and earthquakes' — dersin bütününü kapsayan seçenek.",
      "Örnek: Bir öğrenci ile finansal yardım ofisi görevlisi arasındaki konuşma, burs başvuru sürecinin genel adımlarını konu alıyor.\nSoru: \"What is the conversation mainly about?\" Doğru cevap: 'the process of applying for financial aid' — konuşmanın tamamını yansıtan genel bir ifade.",
      "Örnek: Bir psikoloji dersinde profesör, kısa süreli belleğin uzun süreli belleğe nasıl dönüştüğünü genel hatlarıyla anlatıyor.\nSoru: \"What is the lecture mainly about?\" Doğru cevap: 'the process by which short-term memory becomes long-term memory' — dersin ana konusunu yansıtan seçenek.",
      "Örnek: İki öğrenci arasındaki konuşma, bir laboratuvar raporunun nasıl formatlanması gerektiğini konu alıyor.\nSoru: \"What are the students mainly discussing?\" Doğru cevap: 'how to format a laboratory report' — konuşmanın genel içeriğini yansıtan seçenek.",
      "Örnek: Bir ekonomi dersinde profesör, enflasyonun tüketici davranışını genel olarak nasıl etkilediğini anlatıyor.\nSoru: \"What is the lecture mainly about?\" Doğru cevap: 'the effect of inflation on consumer behavior' — dersin bütününü kapsayan geniş bir ifade.",
    ],
    "toefl-gist-purpose": [
      "Örnek: Bir öğrenci profesörün ofis saatine gelip \"I'm having trouble understanding the reading assignment\" diyor.\nSoru: \"Why does the student visit the professor?\" Doğru cevap: 'to get help understanding a reading assignment'.",
      "Örnek: Bir öğrenci kayıt bürosuna gidip \"I need to drop one of my courses before the deadline\" diyor.\nSoru: \"Why does the student go to the registrar's office?\" Doğru cevap: 'to drop a course before the deadline'.",
      "Örnek: Bir öğrenci danışmanlık merkezine gidip \"I'm not sure which courses I need to graduate on time\" diyor.\nSoru: \"Why does the student visit the advising center?\" Doğru cevap: 'to find out which courses are required for graduation'.",
      "Örnek: Bir öğrenci kütüphaneye gidip \"I can't find the book listed for my history class anywhere\" diyor.\nSoru: \"Why does the student go to the library?\" Doğru cevap: 'to locate a required book for a class'.",
      "Örnek: Bir öğrenci finansal işler ofisine gidip \"There seems to be an error in my tuition bill\" diyor.\nSoru: \"Why does the student visit the financial office?\" Doğru cevap: 'to resolve an error on a tuition bill'.",
      "Örnek: Bir öğrenci kariyer merkezine gidip \"I need help preparing for an upcoming job interview\" diyor.\nSoru: \"Why does the student visit the career center?\" Doğru cevap: 'to get help preparing for a job interview'.",
      "Örnek: Bir öğrenci yurt yönetim ofisine gidip \"My roommate and I are having a conflict I can't resolve\" diyor.\nSoru: \"Why does the student visit the housing office?\" Doğru cevap: 'to seek help resolving a conflict with a roommate'.",
      "Örnek: Bir öğrenci profesörün ofisine gidip \"I missed the midterm exam because I was sick\" diyor.\nSoru: \"Why does the student visit the professor?\" Doğru cevap: 'to explain an absence from an exam and ask about makeup options'.",
      "Örnek: Bir öğrenci teknik destek masasına gidip \"I can't log into the online course portal\" diyor.\nSoru: \"Why does the student visit the technical support desk?\" Doğru cevap: 'to get help accessing the online course portal'.",
      "Örnek: Bir öğrenci bölüm sekreterliğine gidip \"I need a signature to add a class after the deadline\" diyor.\nSoru: \"Why does the student visit the department office?\" Doğru cevap: 'to get permission to add a class after the deadline'.",
    ],
    "toefl-listening-detail": [
      "Örnek ders: Profesör, DNA'nın çift sarmal yapısının 1953'te Watson ve Crick tarafından keşfedildiğini anlatıyor.\nSoru: \"When was the structure of DNA discovered?\" Doğru cevap: '1953' — açıkça belirtilen bir detay.",
      "Örnek ders: Profesör, bir yetişkin insan kalbinin dakikada ortalama 60-100 kez attığını belirtiyor.\nSoru: \"According to the professor, how many times does a resting adult heart beat per minute?\" Doğru cevap: '60 to 100 times' — derste açıkça verilen aralık.",
      "Örnek ders: Profesör, Büyük Britanya'daki ilk demiryolu hattının 1825 yılında açıldığını anlatıyor.\nSoru: \"According to the professor, when did the first railway line in Britain open?\" Doğru cevap: '1825' — derste doğrudan verilen tarih.",
      "Örnek ders: Profesör, bir örümceğin ipeğinin çelikten daha güçlü olduğunu ama çok daha esnek olduğunu belirtiyor.\nSoru: \"According to the professor, how does spider silk compare to steel?\" Doğru cevap: 'it is stronger but much more flexible' — derste açıkça yapılan karşılaştırma.",
      "Örnek ders: Profesör, Everest Dağı'nın deniz seviyesinden yaklaşık 8,849 metre yükseklikte olduğunu belirtiyor.\nSoru: \"According to the professor, what is the approximate height of Mount Everest?\" Doğru cevap: 'about 8,849 meters' — derste açıkça belirtilen rakam.",
      "Örnek ders: Profesör, bir bal arısının ömrünün yaz mevsiminde yaklaşık altı hafta olduğunu belirtiyor.\nSoru: \"According to the professor, how long does a worker bee typically live during the summer?\" Doğru cevap: 'about six weeks' — derste doğrudan belirtilen süre.",
      "Örnek ders: Profesör, ilk yazılı dilin Sümerler tarafından yaklaşık MÖ 3200 yılında geliştirildiğini anlatıyor.\nSoru: \"According to the professor, approximately when did the Sumerians develop writing?\" Doğru cevap: 'around 3200 BCE' — derste açıkça verilen tarih.",
      "Örnek ders: Profesör, bir yetişkin insan beyninin ağırlığının ortalama 1.4 kilogram olduğunu belirtiyor.\nSoru: \"According to the professor, what is the average weight of an adult human brain?\" Doğru cevap: 'about 1.4 kilograms' — derste doğrudan verilen değer.",
      "Örnek ders: Profesör, Amazon Nehri'nin dünyanın en fazla su taşıyan nehri olduğunu ve uzunluğunun yaklaşık 6,400 kilometre olduğunu belirtiyor.\nSoru: \"According to the professor, approximately how long is the Amazon River?\" Doğru cevap: 'about 6,400 kilometers' — derste açıkça belirtilen uzunluk.",
      "Örnek ders: Profesör, ilk ticari uçuşun 1914 yılında Florida'da gerçekleştiğini anlatıyor.\nSoru: \"According to the professor, where did the first commercial flight take place?\" Doğru cevap: 'in Florida' — derste doğrudan verilen konum.",
    ],
    "toefl-function": [
      "Örnek: Bir öğrenci alaycı bir tonda \"Oh, great, ANOTHER group project\" diyor.\nSoru: \"What does the student mean?\" Doğru cevap cümlenin gerçek anlamının TERSİni yansıtır (örn. 'She is not looking forward to the project') — sarkastik ton, kelimenin literal anlamını geçersiz kılar.",
      "Örnek: Bir profesör dersin ortasında durup \"Now, why do you think I just did that?\" diye soruyor.\nSoru: \"Why does the professor say this?\" Doğru cevap: 'to prompt students to think critically about a demonstration' — cümle gerçek bir bilgi istemek için değil, öğrencileri düşünmeye teşvik etmek için söylenir.",
      "Örnek: Bir öğrenci arkadaşına \"You're telling me this assignment is due tomorrow?\" diyor, sesi yükselerek.\nSoru: \"What does the student imply by saying this?\" Doğru cevap: 'she is surprised and unprepared for the deadline' — yükselen ton ve tekrar, gerçek bir soru değil şaşkınlık ifade eder.",
      "Örnek: Bir danışman öğrenciye \"Well, that's certainly one way to look at it\" diyor, tereddütlü bir tonla.\nSoru: \"What does the advisor mean?\" Doğru cevap: 'she partially disagrees with the student's approach' — ifade, doğrudan onaylamak yerine kibarca çekimser bir tutum yansıtır.",
      "Örnek: Bir öğrenci laboratuvar sonucunu görünce \"You've got to be kidding me\" diyor, hayal kırıklığı dolu bir tonda.\nSoru: \"What does the student mean by this?\" Doğru cevap: 'he is frustrated or disappointed by an unexpected result' — ifade gerçek bir şaka isteği değil, hayal kırıklığını yansıtır.",
      "Örnek: Bir profesör bir öğrencinin sorusuna \"That's actually a question I was hoping someone would ask\" diyor.\nSoru: \"What does the professor mean?\" Doğru cevap: 'the question is particularly relevant or insightful' — profesör, soruyu memnuniyetle karşıladığını dolaylı olarak belirtir.",
      "Örnek: Bir öğrenci kütüphane görevlisine \"So basically, I'm out of luck then?\" diyor, hafif bir hayal kırıklığıyla.\nSoru: \"What does the student mean?\" Doğru cevap: 'he believes there is no solution to his problem' — ifade, görevlinin daha önce verdiği bilgiden çıkarılan bir sonucu doğrulamak için söylenmiştir.",
      "Örnek: Bir profesör bir teoriyi anlattıktan sonra \"Or at least, that's the theory\" diyor, hafif bir gülümsemeyle.\nSoru: \"What does the professor imply by saying this?\" Doğru cevap: 'the theory may not be entirely accurate or is disputed' — ifade, teoriye tam bir güven olmadığını ima eder.",
      "Örnek: Bir öğrenci yurt arkadaşına \"Nice of you to finally join us\" diyor, alaycı bir tonda, arkadaşı toplantıya geç kaldığında.\nSoru: \"What does the student mean?\" Doğru cevap: 'she is annoyed that her friend arrived late' — ifade, kelimenin tersine bir eleştiri içerir.",
      "Örnek: Bir profesör bir öğrencinin cevabından sonra \"I suppose that's one interpretation\" diyor, nötr ama biraz mesafeli bir tonda.\nSoru: \"What does the professor mean?\" Doğru cevap: 'she thinks the interpretation is possible but not the strongest one' — ifade, tam bir onay değil, ihtiyatlı bir kabul yansıtır.",
    ],
    "toefl-attitude": [
      "Örnek: Bir profesör tereddütlü bir tonla \"Well, some researchers claim this, though the evidence is far from conclusive\" diyor.\nSoru: \"What is the professor's attitude?\" Doğru cevap: 'skeptical' (şüpheci) — 'though the evidence is far from conclusive' ifadesi tam bir kabul değil şüphe belirtir.",
      "Örnek: Bir profesör heyecanlı bir tonla \"This finding genuinely changed the way I think about the entire field\" diyor.\nSoru: \"What is the professor's attitude toward the finding?\" Doğru cevap: 'enthusiastic/impressed' — ifade, bulgunun kendisi için gerçekten önemli olduğunu gösteren güçlü bir hayranlık yansıtır.",
      "Örnek: Bir öğrenci yorgun bir tonla \"I guess I'll just have to redo the whole experiment again\" diyor.\nSoru: \"What is the student's attitude?\" Doğru cevap: 'resigned/frustrated' — ifade, isteksiz ama kabullenmiş bir tutumu yansıtır.",
      "Örnek: Bir profesör kesin bir tonla \"There is absolutely no doubt in my mind that this theory holds up\" diyor.\nSoru: \"What is the professor's attitude toward the theory?\" Doğru cevap: 'confident/certain' — ifade, hiçbir tereddüt içermeyen güçlü bir inancı yansıtır.",
      "Örnek: Bir öğrenci endişeli bir tonla \"I'm honestly worried I won't finish the project in time\" diyor.\nSoru: \"What is the student's attitude?\" Doğru cevap: 'anxious/concerned' — ifade doğrudan endişeyi belirtir.",
      "Örnek: Bir profesör hafif alaycı bir tonla \"Apparently, this 'revolutionary' idea was actually proposed decades ago\" diyor.\nSoru: \"What is the professor's attitude toward the idea?\" Doğru cevap: 'dismissive/unimpressed' — tırnak içindeki 'revolutionary' kelimesinin vurgulanması, fikrin abartıldığını ima eder.",
      "Örnek: Bir öğrenci rahatlamış bir tonla \"I was so relieved when I finally found a solution that worked\" diyor.\nSoru: \"What is the student's attitude?\" Doğru cevap: 'relieved' — ifade doğrudan bir rahatlama duygusunu belirtir.",
      "Örnek: Bir profesör hayal kırıklığı dolu bir tonla \"I had hoped the results would be clearer than this\" diyor.\nSoru: \"What is the professor's attitude toward the results?\" Doğru cevap: 'disappointed' — ifade, beklentinin karşılanmadığını gösterir.",
      "Örnek: Bir öğrenci meraklı bir tonla \"I never expected this topic to be so interesting once we got into it\" diyor.\nSoru: \"What is the student's attitude toward the topic?\" Doğru cevap: 'pleasantly surprised/intrigued' — ifade, başlangıçtaki düşük beklentinin aşıldığını gösterir.",
      "Örnek: Bir profesör temkinli bir tonla \"It's an interesting hypothesis, but I'd want to see it tested more rigorously before accepting it\" diyor.\nSoru: \"What is the professor's attitude toward the hypothesis?\" Doğru cevap: 'cautiously interested/reserved' — ifade, tam bir ret değil ama temkinli bir yaklaşım yansıtır.",
    ],
    "toefl-organization": [
      "Örnek: Bir ders önce bir sorunu (deniz kirliliği) tanımlıyor, sonra nedenlerini sıralıyor, son olarak çözüm önerileri sunuyor.\nSoru: \"How does the professor organize the information?\" Doğru cevap dersin BÜTÜNSEL yapısını yansıtır: 'by presenting a problem, then its causes, then solutions'.",
      "Örnek: Bir ders, iki mimari tarzı (Gotik ve Barok) özelliklerine göre sırayla karşılaştırıyor.\nSoru: \"How does the professor organize the lecture?\" Doğru cevap: 'by comparing and contrasting two architectural styles'.",
      "Örnek: Bir ders, bir teknolojinin (buharlı motor) icadından günümüze kadar kronolojik gelişimini anlatıyor.\nSoru: \"How does the professor organize the information about the steam engine?\" Doğru cevap: 'in chronological order, from its invention to later developments'.",
      "Örnek: Bir ders, genel bir teoriyi tanıttıktan sonra bu teoriyi destekleyen üç somut örnek sunuyor.\nSoru: \"How does the professor organize the lecture?\" Doğru cevap: 'by presenting a general theory and then illustrating it with specific examples'.",
      "Örnek: Bir ders, bir hastalığın belirtilerinden başlayıp giderek altta yatan nedenine doğru ilerliyor.\nSoru: \"How does the professor organize the information?\" Doğru cevap: 'by moving from observable symptoms to the underlying cause'.",
      "Örnek: Bir ders, bir sürecin adımlarını (bir yıldızın oluşumu) sırayla, aşamadan aşamaya anlatıyor.\nSoru: \"How does the professor organize the lecture?\" Doğru cevap: 'by describing a process step by step in sequential order'.",
      "Örnek: Bir ders, bir kavramı tanımlayıp ardından bu kavrama yönelik yaygın bir yanlış anlamayı düzeltiyor.\nSoru: \"How does the professor organize the information?\" Doğru cevap: 'by defining a concept and then correcting a common misconception about it'.",
      "Örnek: Bir ders, bir olayı farklı bakış açılarından (ekonomik, sosyal, siyasi) sırayla ele alıyor.\nSoru: \"How does the professor organize the lecture?\" Doğru cevap: 'by examining the same event from several different perspectives'.",
      "Örnek: Bir ders, bir iddiayı ortaya atıp ardından bu iddiaya karşı kanıtlar sunuyor.\nSoru: \"How does the professor organize the information?\" Doğru cevap: 'by presenting a claim and then providing evidence that challenges it'.",
      "Örnek: Bir ders, en basit örnekten başlayıp giderek daha karmaşık örneklere doğru ilerliyor.\nSoru: \"How does the professor organize the lecture?\" Doğru cevap: 'by moving from the simplest example to increasingly complex ones'.",
    ],
    "toefl-connecting-content": [
      "Örnek: Bir ders iki yıldız türünü (kırmızı dev ve beyaz cüce) karşılaştırıyor; kırmızı devler büyük ve soğuk, beyaz cüceler küçük ve sıcak.\nBir tabloyu doldurma sorusunda 'büyük boyut' kırmızı dev sütununa, 'yüksek sıcaklık' beyaz cüce sütununa yerleştirilir.",
      "Örnek: Bir ders, klasik ve edimsel koşullanma arasındaki ilişkiyi anlatıyor; ikisi de öğrenmeyi açıklar ama biri istemsiz tepkilere, diğeri sonuçlara dayanır.\nBir sıralama sorusunda önce klasik koşullanmanın tanımı, ardından edimsel koşullanmanın ondan farkı sunulmalıdır.",
      "Örnek: Bir ders, iki jeolojik süreç (erozyon ve tortullaşma) arasındaki neden-sonuç ilişkisini anlatıyor; erozyon malzemeyi taşır, tortullaşma bu malzemeyi biriktirir.\nBir bağlantı sorusunda 'malzemenin aşınması' erozyona, 'malzemenin birikmesi' tortullaşmaya bağlanmalıdır.",
      "Örnek: Bir ders, iki ekonomik model (arz yönlü ve talep yönlü) arasındaki karşıtlığı anlatıyor.\nBir tablo sorusunda 'üretimi teşvik etmeye odaklanma' arz yönlü modele, 'tüketici harcamasını artırmaya odaklanma' talep yönlü modele yerleştirilir.",
      "Örnek: Bir ders, iki tür bulut oluşumunu (kümülüs ve stratüs) karşılaştırıyor; kümülüs dikey gelişir, stratüs yatay tabakalar halinde yayılır.\nBir tablo sorusunda 'dikey gelişim' kümülüs sütununa, 'yatay tabakalanma' stratüs sütununa yerleştirilir.",
      "Örnek: Bir ders, mitoz ve mayoz hücre bölünmesi arasındaki ilişkiyi anlatıyor; mitoz özdeş hücreler üretir, mayoz genetik çeşitliliğe sahip üreme hücreleri üretir.\nBir tablo sorusunda 'özdeş hücre üretimi' mitoza, 'genetik çeşitlilik' mayoza yerleştirilir.",
      "Örnek: Bir ders, iki tarihi ticaret yolunu (İpek Yolu ve Baharat Yolu) karşılaştırıyor; biri kara yoluyla ipek, diğeri deniz yoluyla baharat taşımacılığına odaklanıyor.\nBir tablo sorusunda 'kara yolu ile ipek taşıma' İpek Yolu'na, 'deniz yolu ile baharat taşıma' Baharat Yolu'na yerleştirilir.",
      "Örnek: Bir ders, iki beslenme stratejisini (otçul ve etçil) karşılaştırıyor; otçullar geniş, düz azı dişlerine, etçiller keskin köpek dişlerine sahiptir.\nBir tablo sorusunda 'geniş düz dişler' otçullara, 'keskin köpek dişleri' etçillere yerleştirilir.",
      "Örnek: Bir ders, iki yönetim biçimini (merkeziyetçi ve federal) karşılaştırıyor; merkeziyetçi sistemde güç tek elde toplanır, federal sistemde güç eyaletler arasında paylaştırılır.\nBir tablo sorusunda 'gücün tek elde toplanması' merkeziyetçi sisteme, 'gücün paylaştırılması' federal sisteme yerleştirilir.",
      "Örnek: Bir ders, iki fotosentez türünü (C3 ve C4 bitkileri) karşılaştırıyor; C3 bitkileri sıcak iklimlerde daha az verimli, C4 bitkileri sıcak iklimlerde daha verimlidir.\nBir tablo sorusunda 'sıcak iklimde düşük verim' C3 bitkilerine, 'sıcak iklimde yüksek verim' C4 bitkilerine yerleştirilir.",
    ],
    "toefl-independent-speaking": [
      "Örnek soru: \"Some people prefer to study alone, while others prefer to study in groups. Which do you prefer and why?\"\nÖrnek cevap iskeleti: \"I personally prefer studying in groups because it allows me to learn from different perspectives. For example, when I struggled with a concept in economics, a classmate explained it in a way that finally made sense.\"",
      "Örnek soru: \"Do you agree or disagree: It is better to have a few close friends than many acquaintances?\"\nÖrnek cevap iskeleti: \"I agree that a few close friends are more valuable, mainly because deep relationships offer more reliable support. For instance, when I faced a difficult time last year, it was my one close friend, not my many acquaintances, who helped me through it.\"",
      "Örnek soru: \"Some people believe that children should begin learning a foreign language in elementary school. Do you agree or disagree?\"\nÖrnek cevap iskeleti: \"I agree, because young children acquire new sounds and grammar more naturally than adults do. My younger cousin, for example, started English lessons at age seven and now speaks with almost no accent.\"",
      "Örnek soru: \"Which do you think is more important for a job: a high salary or personal satisfaction?\"\nÖrnek cevap iskeleti: \"I believe personal satisfaction matters more in the long run, since a high salary cannot compensate for daily unhappiness. A relative of mine left a well-paying job for a lower-paying one and reported feeling far more motivated and content.\"",
      "Örnek soru: \"Do you agree or disagree: Universities should require students to take courses outside their major?\"\nÖrnek cevap iskeleti: \"I agree, because exposure to different fields broadens problem-solving skills. Taking an art history course, for instance, helped me think more creatively about my own engineering projects.\"",
      "Örnek soru: \"Some people prefer to travel to a new place every time they take a vacation, while others prefer to return to the same place. Which do you prefer?\"\nÖrnek cevap iskeleti: \"I prefer visiting new places each time, since discovering unfamiliar cultures keeps me curious and engaged. Last year, exploring a country I had never visited taught me more than any repeat trip could have.\"",
      "Örnek soru: \"Do you agree or disagree: Technology has made people less social than they were in the past?\"\nÖrnek cevap iskeleti: \"I partially disagree, because technology has simply changed the form of socializing rather than eliminating it. I stay in daily contact with friends abroad through video calls, something that would have been impossible a generation ago.\"",
      "Örnek soru: \"Some students prefer classes with a lot of group discussion, while others prefer lectures where the professor mainly talks. Which do you prefer?\"\nÖrnek cevap iskeleti: \"I prefer classes with discussion, because explaining ideas out loud helps me understand them more deeply. In a philosophy seminar, debating with classmates clarified concepts that reading alone never could.\"",
      "Örnek soru: \"Do you agree or disagree: It is important for people to spend time alone every day?\"\nÖrnek cevap iskeleti: \"I agree, since quiet time allows me to process the day's events and reduce stress. Even fifteen minutes of walking alone after class helps me approach my studies with a clearer mind.\"",
      "Örnek soru: \"Some people believe that failure is a valuable part of learning, while others try to avoid it whenever possible. What is your opinion?\"\nÖrnek cevap iskeleti: \"I believe failure is valuable, because it reveals gaps in understanding that success often hides. My first attempt at a science project failed completely, but analyzing why taught me more than the successful second attempt did.\"",
    ],
    "toefl-integrated-speaking": [
      "Örnek: Bir kampüs duyurusu kütüphane saatlerinin uzatılacağını duyuruyor. Dinlenen konuşmada bir öğrenci buna sevinir çünkü sınav döneminde daha uzun çalışabilecektir.\nÖrnek cevap: \"The announcement states that the library will extend its hours. The student supports this because it will allow him to study longer during exams.\"",
      "Örnek: Bir kampüs duyurusu otopark ücretlerinin artırılacağını duyuruyor. Dinlenen konuşmada bir öğrenci bu değişikliğe karşı çıkar çünkü zaten sınırlı bütçesiyle başa çıkmakta zorlanmaktadır.\nÖrnek cevap: \"The announcement explains that parking fees will increase. The student opposes this change because she already struggles financially and the higher fee would make things worse.\"",
      "Örnek: Bir psikoloji dersinde 'confirmation bias' kavramı tanıtılıyor. Ardından profesör, bir kişinin sadece kendi görüşünü destekleyen haberleri okumasını örnek olarak veriyor.\nÖrnek cevap: \"Confirmation bias is the tendency to favor information that supports existing beliefs. The professor illustrates this with the example of someone who only reads news articles that agree with his political views.\"",
      "Örnek: Bir okunan metin, bir üniversitenin yeni bir spor tesisi inşa etme planını üç gerekçeyle savunuyor (sağlık, sosyalleşme, prestij). Dinlenen konuşmada bir öğrenci bu üç gerekçeye de itiraz ediyor.\nÖrnek cevap: \"The article argues that the new sports facility will improve health, socialization, and the university's reputation. The student, however, challenges all three points, arguing that existing facilities already serve these purposes.\"",
      "Örnek: Bir biyoloji dersinde 'mutualism' (karşılıklı yararlanma) kavramı tanıtılıyor. Profesör, örnek olarak palyaço balığı ile deniz anemonu arasındaki ilişkiyi anlatıyor.\nÖrnek cevap: \"Mutualism is a relationship in which both organisms benefit. The professor gives the example of clownfish and sea anemones, where the fish gains protection and the anemone gains food scraps and cleaning.\"",
      "Örnek: Bir okunan metin, uzaktan çalışmanın üç avantajını savunuyor (zaman tasarrufu, esneklik, maliyet azaltma). Dinlenen konuşmada bir öğrenci bu avantajların kendi deneyiminde geçerli olmadığını anlatıyor.\nÖrnek cevap: \"The article claims remote work saves time, offers flexibility, and reduces costs. The student disagrees, describing her own experience of feeling isolated and less productive while working remotely.\"",
      "Örnek: Bir ekonomi dersinde 'opportunity cost' (fırsat maliyeti) kavramı tanıtılıyor. Profesör, bir öğrencinin çalışmak yerine üniversiteye gitmeyi seçmesini örnek veriyor.\nÖrnek cevap: \"Opportunity cost refers to the value of the next best alternative given up when making a choice. The professor illustrates this with a student who forgoes a salary in order to attend university.\"",
      "Örnek: Bir kampüs duyurusu, bir cafe'nin kampüs içindeki saatlerinin kısaltılacağını duyuruyor. Dinlenen konuşmada bir öğrenci bunun geç saatlerde çalışan öğrenciler için sorun yaratacağını belirtiyor.\nÖrnek cevap: \"The announcement states that the campus cafe will reduce its hours. The student objects, explaining that many students rely on it for food during late-night study sessions.\"",
      "Örnek: Bir çevre bilimi dersinde 'keystone species' (anahtar tür) kavramı tanıtılıyor. Profesör, denizsamurlarının deniz yosunu ormanlarını nasıl koruduğunu örnek veriyor.\nÖrnek cevap: \"A keystone species is one whose presence has a disproportionately large effect on its ecosystem. The professor explains that sea otters protect kelp forests by controlling the population of sea urchins that would otherwise destroy them.\"",
      "Örnek: Bir okunan metin, bir şirketin dört günlük çalışma haftasına geçme planını savunuyor (üretkenlik artışı, çalışan memnuniyeti). Dinlenen konuşmada bir öğrenci bu planın uygulamada sorunlu olabileceğini örneklerle anlatıyor.\nÖrnek cevap: \"The article argues that a four-day workweek would increase productivity and employee satisfaction. The student raises doubts, citing a company where the shorter week led to missed deadlines and increased stress.\"",
    ],
    "toefl-integrated-writing": [
      "Örnek: Okunan metin, bir şirketin yeni ürün stratejisinin üç avantajını savunuyor (maliyet, hız, memnuniyet). Dinlenen ders, profesörün bu üç avantaja karşı üç karşı argüman sunması (gizli maliyetler, kalite sorunları, şikayetler).\nYazınız bu üç nokta çiftini ayrı ayrı ele almalıdır.",
      "Örnek: Okunan metin, bir üniversitenin kampüste güneş enerjisi paneli kurmasının üç faydasını savunuyor (maliyet tasarrufu, çevre dostu imaj, öğrenci ilgisi). Dinlenen ders, profesörün bu üç faydaya karşı üç sorunu (yüksek kurulum maliyeti, bakım zorluğu, sınırlı güneş ışığı) sunması.\nYazınız her fayda-sorun çiftini ayrı bir paragrafta karşılaştırmalıdır.",
      "Örnek: Okunan metin, bir hayvan türünün nesli tükenmekte olduğunu ve bunun üç nedenini (habitat kaybı, avlanma, iklim değişikliği) açıklıyor. Dinlenen ders, profesörün bu üç nedene şüpheyle yaklaşıp alternatif açıklamalar (hastalık, rekabet, üreme sorunları) sunması.\nYazınız metindeki her nedeni dersteki karşı açıklamayla eşleştirmelidir.",
      "Örnek: Okunan metin, bir tarihi olayın (bir imparatorluğun çöküşü) üç nedenini savunuyor (ekonomik kriz, askeri yenilgiler, iç isyanlar). Dinlenen ders, profesörün bu üç nedeni yetersiz bulup farklı kanıtlar sunması.\nYazınız metindeki iddiaları dersteki itirazlarla karşılaştırmalıdır.",
      "Örnek: Okunan metin, bir şirketin çalışanlarına uzaktan çalışma seçeneği sunmasının üç faydasını savunuyor (üretkenlik, maliyet tasarrufu, çalışan memnuniyeti). Dinlenen ders, profesörün gerçek şirket verilerine dayanarak bu üç faydayı sorgulaması.\nYazınız her iddiayı dersteki karşı kanıtla eşleştirmelidir.",
      "Örnek: Okunan metin, bir bitkinin tıbbi bir hastalığı tedavi edebileceğine dair üç kanıt sunuyor. Dinlenen ders, profesörün bu kanıtların bilimsel olarak yetersiz olduğunu üç ayrı noktada açıklaması.\nYazınız metindeki iddiaları dersteki bilimsel eleştirilerle karşılaştırmalıdır.",
      "Örnek: Okunan metin, bir şehrin toplu taşıma sistemine yatırım yapmasının üç avantajını savunuyor (trafik azalması, hava kalitesi, ekonomik canlanma). Dinlenen ders, profesörün bu avantajların gerçekleşmesinin önündeki üç engeli anlatması.\nYazınız her avantajı dersteki engelle eşleştirmelidir.",
      "Örnek: Okunan metin, bir arkeolojik keşfin belirli bir teoriyi (eski bir uygarlığın ticaret ağı) desteklediğini üç kanıtla savunuyor. Dinlenen ders, profesörün bu kanıtların başka şekilde de yorumlanabileceğini açıklaması.\nYazınız metindeki kanıtları dersteki alternatif yorumlarla karşılaştırmalıdır.",
      "Örnek: Okunan metin, bir okulun standart test puanlarına dayalı değerlendirme sisteminin üç faydasını savunuyor. Dinlenen ders, profesörün bu sistemin üç olumsuz sonucunu (stres, dar müfredat, eşitsizlik) anlatması.\nYazınız her faydayı dersteki olumsuz sonuçla karşılaştırmalıdır.",
      "Örnek: Okunan metin, bir denizcilik teknolojisinin (yelkenli gemiler yerine buharlı gemiler) benimsenmesinin üç nedenini açıklıyor. Dinlenen ders, profesörün bu nedenlerden ikisinin tarihsel olarak abartıldığını, asıl nedenin farklı olduğunu anlatması.\nYazınız metindeki nedenleri dersteki düzeltmelerle karşılaştırmalıdır.",
    ],
    "toefl-independent-writing": [
      "Örnek konu: \"Do you agree or disagree: Working from home is more productive than working in a traditional office.\"\nÖrnek tez cümlesi: \"While remote work offers fewer distractions, I believe traditional offices ultimately foster greater productivity through structured routines and immediate collaboration.\"",
      "Örnek konu: \"Some people believe that success in life comes from hard work, while others believe it comes from luck and opportunity. Discuss both views and give your opinion.\"\nÖrnek tez cümlesi: \"Although luck can open certain doors, I believe sustained hard work is ultimately what determines whether a person turns an opportunity into lasting success.\"",
      "Örnek konu: \"Do you agree or disagree: Governments should invest more money in public transportation than in building new roads.\"\nÖrnek tez cümlesi: \"I agree that public transportation deserves greater investment, since it reduces both traffic congestion and environmental harm more effectively than expanding roads.\"",
      "Örnek konu: \"Some people prefer to make major decisions quickly, while others prefer to take a long time considering all options. Which approach do you think is better?\"\nÖrnek tez cümlesi: \"I believe that taking time to consider all available options generally leads to better decisions, even though it can feel slower in the moment.\"",
      "Örnek konu: \"Do you agree or disagree: Social media has had a mostly negative effect on society.\"\nÖrnek tez cümlesi: \"Although social media has undeniable benefits for communication, I believe its overall effect on society has been more negative than positive, particularly for mental health and public discourse.\"",
      "Örnek konu: \"Some people think that universities should focus on providing practical job skills, while others think universities should provide a broad, general education. What is your opinion?\"\nÖrnek tez cümlesi: \"I believe universities should prioritize a broad general education, since adaptable thinking skills prove more valuable than narrow technical training over a lifelong career.\"",
      "Örnek konu: \"Do you agree or disagree: It is better for a country to import food from other countries than to rely entirely on domestically grown food.\"\nÖrnek tez cümlesi: \"I disagree, believing that a country relying primarily on domestically grown food builds greater long-term food security and supports its own economy.\"",
      "Örnek konu: \"Some people believe that children should be given household chores as soon as they are able, while others believe children should focus only on schoolwork. Discuss both views and give your opinion.\"\nÖrnek tez cümlesi: \"While academic focus is important, I believe assigning children household chores from an early age builds responsibility that benefits them well beyond the classroom.\"",
      "Örnek konu: \"Do you agree or disagree: Advances in technology have made it easier for people to maintain a healthy lifestyle.\"\nÖrnek tez cümlesi: \"I agree that technology has made healthy living more accessible, primarily through fitness tracking tools and instant access to nutritional information.\"",
      "Örnek konu: \"Some people believe that it is important to always tell the truth, while others believe that small lies are sometimes acceptable to avoid hurting others. What is your opinion?\"\nÖrnek tez cümlesi: \"I believe honesty should remain the default, but I also think small, considerate omissions are occasionally justified when the truth would cause unnecessary harm without any real benefit.\"",
    ],
  };
  for (const [index, def] of toeflTopicDefs.entries()) {
    const meta = toeflTopicMeta[def.slug];
    const topic = await db.examTopic.upsert({
      where: { examTypeId_slug: { examTypeId: examTypes.TOEFL.id, slug: def.slug } },
      update: { name: def.name, description: def.description, questionCount: def.questionCount, displayOrder: index, ...meta },
      create: { examTypeId: examTypes.TOEFL.id, slug: def.slug, name: def.name, description: def.description, questionCount: def.questionCount, displayOrder: index, ...meta },
    });

    const toeflLessons = [...def.lessons, { title: "Örnek Sorular", durationMinutes: 6, contentBody: formatExamples(toeflExamples[def.slug]) }];
    for (const [lessonIndex, lessonDef] of toeflLessons.entries()) {
      const existingLesson = await db.topicLesson.findFirst({ where: { topicId: topic.id, position: lessonIndex } });
      if (existingLesson) {
        await db.topicLesson.update({ where: { id: existingLesson.id }, data: { title: lessonDef.title, durationMinutes: lessonDef.durationMinutes, contentBody: lessonDef.contentBody } });
      } else {
        await db.topicLesson.create({ data: { topicId: topic.id, position: lessonIndex, title: lessonDef.title, durationMinutes: lessonDef.durationMinutes, contentBody: lessonDef.contentBody } });
      }
    }
  }

  const ieltsTopicDefs = [
    {
      slug: "ielts-listening-multiple-choice",
      name: "Çoktan Seçmeli (Multiple Choice)",
      questionCount: 4,
      description:
        "Dinlediğiniz kayıtla ilgili bir soru veya eksik cümleye, verilen 3-4 seçenekten doğru olanı (bazen birden fazlasını) seçmeniz istenir.\n\nHazırlık İpucu: Kayıt başlamadan önce soru ve seçenekleri mutlaka okuyun; bu, hangi bilgiye odaklanmanız gerektiğini önceden gösterir.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Sorular genellikle kaydın sırasını takip eder; ilk soru kaydın başında, son soru sonunda cevaplanır. Seçenekler genellikle birbirine benzer bilgiler içerir ve dikkatinizi dağıtmak üzere tasarlanır; kayıtta geçen kelimeleri birebir arayan değil, ANLAMI doğru yakalayan seçeneği işaretleyin." },
      ],
    },
    {
      slug: "ielts-listening-matching",
      name: "Eşleştirme (Matching)",
      questionCount: 4,
      description:
        "Bir liste halinde verilen öğeleri (örneğin isimler, yerler, tarihler), kayıtta belirtilen bilgilerle eşleştirmeniz istenir.\n\nHazırlık İpucu: Seçenek listesini önceden okuyun ve benzer görünen seçenekler arasındaki farkları not edin; kayıt genellikle bu seçenekleri sırayla değil karışık sırayla verir.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Ekranda bir soru listesi ve bunlarla eşleştirilecek bir seçenek listesi (genellikle sorulardan fazla sayıda) bulunur. Kayıt dinlerken bahsedilen her öğeyi ilgili seçenekle anında eşleştirmeye çalışın; kayıttaki konuşmacı bazen fikrini değiştirebilir (örn. 'Aslında hayır, B değil C'), bu yüzden son söyleneni doğru cevap olarak alın." },
      ],
    },
    {
      slug: "ielts-listening-plan-map-diagram",
      name: "Plan, Harita ve Diyagram Etiketleme",
      questionCount: 5,
      description:
        "Bir harita, kat planı veya diyagram üzerinde belirtilen konumları, kayıtta anlatılan yönlendirmelere göre doğru harfle etiketlemeniz istenir.\n\nHazırlık İpucu: Kayıt başlamadan önce planı inceleyip başlangıç noktasını (genellikle 'you are here' ile işaretli) ve yön kelimelerini (sağda, karşıda, köşede) önceden tanıyın.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Bu soru tipi mekansal yönlendirme kelimelerini (next to, opposite, along, past) doğru takip etmenizi gerektirir. Kayıt dinlerken parmağınızla (veya zihninizde) planın üzerinde konuşmacının tarif ettiği yolu takip edin; yönlendirmeler genellikle sabit bir başlangıç noktasından itibaren sırayla verilir, bu yüzden bir adımı kaçırmak sonraki cevapları da etkileyebilir." },
      ],
    },
    {
      slug: "ielts-listening-form-note-table",
      name: "Form, Not ve Tablo Tamamlama",
      questionCount: 10,
      description:
        "Kayıtta verilen bilgilerle bir formu, not listesini veya tabloyu doldurmanız istenir. IELTS Listening'de en sık karşılaşılan soru tipidir. Genellikle 'NO MORE THAN [X] WORDS AND/OR A NUMBER' gibi kesin bir kelime sınırı belirtilir.\n\nHazırlık İpucu: Kelime sınırına kesinlikle uyun — sınırı aşan cevaplar, doğru bilgiyi içerse bile yanlış sayılır.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Boşlukların etrafındaki kelimeleri önceden okuyarak ne tür bir bilgi (isim, tarih, sayı, meslek) arandığını tahmin edin. Kayıt genellikle formun/tablonun sırasını takip eder, bu yüzden bir boşluğu kaçırırsanız bir sonraki başlığa geçerek akışı yakalamaya çalışın. Cevaplarınızı yazarken doğru yazım (imla) şarttır; büyük/küçük harf önemli değildir ama kelimeler doğru yazılmalıdır." },
      ],
    },
    {
      slug: "ielts-listening-flowchart-summary-sentence",
      name: "Akış Şeması, Özet ve Cümle Tamamlama",
      questionCount: 8,
      description:
        "Bir sürecin adımlarını (flow-chart), bir metnin özetini veya bağımsız cümleleri, kayıtta duyduğunuz kelimelerle tamamlamanız istenir.\n\nHazırlık İpucu: Boşluktan önceki ve sonraki kelimeleri dilbilgisel olarak inceleyin (örn. boşluktan sonra 'to' varsa muhtemelen bir fiil aranıyordur) — bu, doğru kelime türünü tahmin etmenizi sağlar.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Bu soru tipi, form/tablo tamamlamaya çok benzer ancak bilgi bir süreç akışı veya düzyazı özet şeklinde sunulur. Kayıttaki sıralama genellikle akış şemasındaki veya özetteki sırayla birebir örtüşür; bu yüzden bir adımı bulduğunuzda bir sonraki boşluğun kayıtta yakında geleceğini bilirsiniz. Kelime sınırına (genellikle 1-3 kelime) kesinlikle uyun." },
      ],
    },
    {
      slug: "ielts-listening-short-answer",
      name: "Kısa Cevaplı Sorular (Short-Answer Questions)",
      questionCount: 4,
      description:
        "Kayıtla ilgili doğrudan bir soruya, belirtilen kelime sınırını aşmadan kısa bir cevap yazmanız istenir.\n\nHazırlık İpucu: Soruları önceden okuyup her birinin ne tür bir cevap (bir isim, bir sayı, bir neden) beklediğini belirleyin; bu, kayıtta doğru bilgiyi yakalamanızı hızlandırır.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Sorular genellikle kaydın belirli bir bölümüyle ilgili spesifik bir bilgiyi (bir sebep, bir özellik, bir sayı) sorar. Cevabınızı kelime sınırı içinde, kayıtta geçen kelimeleri kullanarak (parafraz etmeden) yazmanız genellikle en güvenlisidir. Yazım hataları cevabınızı yanlış sayabileceğinden, kaydı dinlerken duyduğunuz kelimeyi olabildiğince doğru yazmaya çalışın." },
      ],
    },
    {
      slug: "ielts-reading-multiple-choice",
      name: "Çoktan Seçmeli (Multiple Choice)",
      questionCount: 4,
      description:
        "Metinle ilgili bir soruya veya eksik cümleye, verilen 3-4 seçenekten doğru olanı seçmeniz istenir.\n\nHazırlık İpucu: Önce soruyu okuyup metinde hangi bölüme bakmanız gerektiğini belirleyin, ardından o bölümü dikkatle okuyarak seçenekleri eleyin.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Sorular genellikle metindeki sırayı takip eder. Seçenekler sıklıkla metinde geçen kelimeleri kullanır ama anlamı hafifçe çarpıtır (örneğin 'always' yerine 'sometimes' gerektiren bir durumu abartır) — metni dikkatle okuyup her seçeneği metinle birebir doğrulayın." },
      ],
    },
    {
      slug: "ielts-reading-true-false-not-given",
      name: "Doğru / Yanlış / Verilmemiş (True/False/Not Given)",
      questionCount: 6,
      description:
        "Verilen bir ifadenin metindeki bilgiyle uyup uymadığını (TRUE), çeliştiğini (FALSE) veya metinde bu konuda hiç bilgi olmadığını (NOT GIVEN) belirlemeniz istenir. IELTS Reading'in en çok karıştırılan soru tipidir.\n\nHazırlık İpucu: 'NOT GIVEN', ifadenin YANLIŞ olduğu anlamına gelmez — metinde o konuda hiçbir şey söylenmediği anlamına gelir; bu ayrımı doğru yapmak bu soru tipinin anahtarıdır.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Her ifadeyi metindeki ilgili cümleyle dikkatle karşılaştırın. İfade metindeki bilgiyle birebir veya eş anlamlı şekilde örtüşüyorsa TRUE, doğrudan çelişiyorsa FALSE, metinde bu konuda hiç bahsedilmiyorsa NOT GIVEN işaretleyin. En sık yapılan hata, kendi genel bilginize dayanarak (metinde yazmasa da) bir ifadeyi doğru/yanlış varsaymaktır — yalnızca metindeki bilgiye dayanın." },
      ],
    },
    {
      slug: "ielts-reading-yes-no-not-given",
      name: "Evet / Hayır / Verilmemiş (Yes/No/Not Given)",
      questionCount: 6,
      description:
        "True/False/Not Given'a benzer, ancak bu soru tipi metindeki OLGULARI değil, YAZARIN GÖRÜŞLERİNİ veya iddialarını sorar. Verilen bir ifadenin yazarın görüşüyle uyup uymadığını (YES), çeliştiğini (NO) veya yazarın bu konuda görüş belirtmediğini (NOT GIVEN) belirlemeniz istenir.\n\nHazırlık İpucu: Bu soru tipi genellikle görüş/argüman içeren metinlerde (makaleler, denemeler) kullanılır; metindeki olgusal detaylara değil, yazarın açık veya örtük GÖRÜŞÜNE odaklanın.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "İfadeyi yazarın metindeki görüşüyle karşılaştırın: yazar bu görüşü destekliyorsa YES, karşı çıkıyorsa NO, bu konuda bir görüş belirtmemişse NOT GIVEN işaretleyin. Yazarın görüşünü genellikle 'however', 'in fact', 'surprisingly' gibi ifadeler ve öznel sıfatlarla anlarsınız; salt olgusal bir cümle (herkesin kabul ettiği bir gerçek) genellikle yazarın kişisel görüşü değildir." },
      ],
    },
    {
      slug: "ielts-reading-matching-headings",
      name: "Başlık Eşleştirme (Matching Headings)",
      questionCount: 6,
      description:
        "Metnin her paragrafına, verilen bir başlık listesinden en uygun olanı eşleştirmeniz istenir. Genellikle başlık sayısı paragraf sayısından fazladır.\n\nHazırlık İpucu: Her paragrafın konusunu değil, ANA FİKRİNİ özetlemeye çalışın — başlıklar genellikle paragrafın tek bir detayını değil, genel amacını yansıtır.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Her paragrafı okuduktan sonra, o paragrafın tek cümlelik bir özetini kendi kelimelerinizle zihninizde oluşturun, ardından bu özete en yakın başlığı seçin. Başlıklar genellikle paragrafın ilk cümlesindeki kelimeleri birebir kullanmaz, bunun yerine aynı fikri farklı kelimelerle ifade eder. Kullanılmayacak fazladan başlıklar dikkatinizi dağıtmak için eklenmiştir; emin olduğunuz eşleştirmeleri önce yapın." },
      ],
    },
    {
      slug: "ielts-reading-matching-info-features-endings",
      name: "Bilgi, Özellik ve Cümle Sonu Eşleştirme",
      questionCount: 6,
      description:
        "Bu grup, üç benzer soru tipini kapsar: Matching Information (belirli bir bilginin metnin hangi paragrafında geçtiğini bulma), Matching Features (bir dizi özelliği/görüşü doğru kişi veya kategoriyle eşleştirme) ve Matching Sentence Endings (yarım bırakılmış bir cümleyi doğru şekilde tamamlayan ifadeyi bulma).\n\nHazırlık İpucu: Her üç soru tipinde de önce sorulan bilgiyi/özelliği net bir şekilde anlayın, ardından metni o bilgiye özgü anahtar kelimeleri arayarak tarayın (skim/scan).",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Matching Information'da her soru için metindeki HANGİ paragrafta o bilginin geçtiğini bulursunuz (bir paragraf birden fazla soruda cevap olabilir). Matching Features'da isim/tarih gibi kategorileri, metinde onlarla ilişkilendirilen görüş veya özelliklerle eşleştirirsiniz. Matching Sentence Endings'de ise cümlenin ilk yarısındaki anahtar kelimeyi bulup metinde o kısımla ilgili doğru tamamlayıcı yarıyı ararsınız — dilbilgisel uyum (özne-yüklem, zaman) doğru seçeneği belirlemede önemli bir ipucudur." },
      ],
    },
    {
      slug: "ielts-reading-sentence-summary-table-completion",
      name: "Cümle, Özet, Not ve Tablo Tamamlama",
      questionCount: 6,
      description:
        "Bir cümleyi, metnin özetini, notları veya bir tabloyu, metinden alınan kelimelerle (genellikle 'NO MORE THAN [X] WORDS' sınırıyla) tamamlamanız istenir.\n\nHazırlık İpucu: Cevabı metinden BİREBİR alın, kendi kelimelerinizle yeniden yazmayın — bu soru tipinde doğru cevap her zaman metinde birebir geçen kelime(ler)dir.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Boşluğun etrafındaki cümle yapısını inceleyerek ne tür bir kelime (isim, sıfat, sayı) arandığını belirleyin, ardından metinde bu anlamı taşıyan bölümü tarayarak bulun. Özet/not tamamlama sorularında metnin genel akışı genellikle özetin akışıyla örtüşür, bu yüzden bir boşluğu bulduğunuzda bir sonrakini metnin hemen devamında arayabilirsiniz. Kelime sınırını aşan cevaplar, doğru bilgiyi içerse bile yanlış sayılır." },
      ],
    },
    {
      slug: "ielts-reading-diagram-label",
      name: "Diyagram Etiketleme (Diagram Label Completion)",
      questionCount: 4,
      description:
        "Bir sürecin, makinenin veya yapının bir diyagramındaki boşlukları, metinde açıklanan parça/aşama isimleriyle doldurmanız istenir.\n\nHazırlık İpucu: Diyagramı önceden inceleyip hangi parçaların/aşamaların zaten etiketlendiğini, hangilerinin boş olduğunu belirleyin — bu, metinde nereye odaklanmanız gerektiğine dair ipucu verir.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Bu soru tipi genellikle bir süreç açıklaması içeren metinlerde (örn. bir cihazın çalışma prensibi) kullanılır. Metindeki açıklamayı diyagramla eşleştirerek okuyun; metinde geçen sıra genellikle diyagramdaki fiziksel/mantıksal sırayla örtüşür. Cevaplar metinden birebir alınan kelime veya kısa ifadelerdir." },
      ],
    },
    {
      slug: "ielts-reading-short-answer",
      name: "Kısa Cevaplı Sorular (Short-Answer Questions)",
      questionCount: 4,
      description:
        "Metinle ilgili doğrudan bir soruya, belirtilen kelime sınırını aşmadan (genellikle 'NO MORE THAN [X] WORDS') kısa bir cevap yazmanız istenir.\n\nHazırlık İpucu: Sorudaki anahtar kelimeyi metinde tarayarak ilgili cümleyi bulun; cevap genellikle o cümlede birebir geçer.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Sorular genellikle metinde listelenen öğeleri (örnekler, nedenler, özellikler) sorar. Cevabınızı metinden birebir alın ve kelime sınırına kesinlikle uyun; sınırı aşan bir cevap, doğru bilgiyi içerse bile yanlış sayılır. Sorular metindeki sırayı takip eder, bu yüzden bir cevabı bulduktan sonra bir sonrakini metnin hemen devamında arayın." },
      ],
    },
    {
      slug: "ielts-writing-task1",
      name: "Writing Task 1",
      questionCount: 1,
      description:
        "Bir grafik, tablo, harita veya sürecin görsel bir sunumunu incelemeniz ve bu bilgiyi kendi kelimelerinizle betimleyen en az 150 kelimelik bir yazı yazmanız istenir. Bu görev için 20 dakika ayırmanız önerilir ve toplam Yazma puanının 1/3'ünü oluşturur.\n\nHazırlık İpucu: Görseldeki EN BELİRGİN eğilimleri veya karşılaştırmaları seçip bunlara odaklanın; her veriyi tek tek anlatmaya çalışmak hem zaman kaybettirir hem de yazınızı dağınıklaştırır.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Görsel türüne göre görev değişir: çizgi/çubuk/pasta grafiklerde veri karşılaştırması ve eğilimler betimlenir; haritalarda değişim (önce/sonra) anlatılır; süreç diyagramlarında adımlar sırayla açıklanır. Giriş cümlesinde görseli genel hatlarıyla tanıtın (paraphrase), ardından 2 paragrafta en önemli eğilimleri/karşılaştırmaları detaylandırın, kişisel görüş belirtmeyin." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Değerlendirme dört kritere göre yapılır: Görev Başarımı (verilerin doğru ve dengeli özetlenmesi), Tutarlılık ve Bütünlük (mantıklı paragraflama), Sözcük Dağarcığı (sayısal değişim ifadeleri: rose, declined, fluctuated, remained stable) ve Dilbilgisi. En belirgin 2-3 eğilimi vurgulamak, tüm verileri tek tek sıralamaktan çok daha yüksek puan getirir; kişisel yorum veya sebep-sonuç tahmini eklememeye dikkat edin." },
      ],
    },
    {
      slug: "ielts-writing-task2",
      name: "Writing Task 2",
      questionCount: 1,
      description:
        "Bir görüş, argüman veya problem hakkında en az 250 kelimelik bir deneme yazmanız istenir. Bu görev için 40 dakika ayrılır ve Yazma puanının 2/3'ünü oluşturur (Task 1'in iki katı ağırlığındadır).\n\nHazırlık İpucu: Yazmaya başlamadan önce 5 dakika ayırıp sorunun tam olarak ne istediğini (görüş mü, çözüm mü, karşılaştırma mı) belirleyin ve kısa bir taslak (giriş-2 gövde paragrafı-sonuç) hazırlayın.",
      lessons: [
        { title: "Görev Tanımı ve Format", durationMinutes: 6, contentBody: "Soru tipleri değişkenlik gösterir: Opinion (Agree/Disagree), Discussion (iki görüşü tartışıp kendi fikrinizi belirtme), Problem/Solution, veya Advantages/Disadvantages. Girişte konuyu tanıtıp net bir tez cümlesi verin; 2 gövde paragrafında her biri ayrı bir gerekçe ve somut örnekle görüşünüzü destekleyin; sonuçta görüşünüzü kısaca tekrarlayın." },
        { title: "Puanlama Stratejileri", durationMinutes: 6, contentBody: "Değerlendirme; Görev Başarımı (sorunun TÜM kısımlarını ele alma ve net bir pozisyon savunma), Tutarlılık ve Bütünlük (paragraflama, bağlaçlar), Sözcük Dağarcığı ve Dilbilgisi kriterlerine göre yapılır. Soru birden fazla kısım içeriyorsa (örn. 'nedenlerini tartışın VE çözüm önerin') her iki kısmı da ele almazsanız Görev Başarımı puanınız ciddi şekilde düşer. Basit ama doğru cümleler, karmaşık ama hatalı cümlelerden daha yüksek puan getirir." },
      ],
    },
    {
      slug: "ielts-speaking-part1",
      name: "Speaking Part 1",
      questionCount: 1,
      description:
        "Sınavın giriş bölümüdür. Sınav görevlisiyle tanışma sonrası kendiniz, eviniz/aileniz, işiniz/eğitiminiz ve ilgi alanlarınız gibi tanıdık konularda genel sorulara cevap verirsiniz. Bu bölüm 4-5 dakika sürer.\n\nHazırlık İpucu: Cevaplarınızı tek kelimeyle değil, kısa bir gerekçe veya örnekle genişletin (örn. 'Evet, severim çünkü...'); ancak Part 2 kadar uzun, hazırlanmış cevaplar vermeyin.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Sorular genellikle 3-4 tanıdık konu (ev, iş/okul, hobiler, günlük rutin) etrafında döner ve her biri hakkında 3-4 soru sorulur. Doğal, günlük bir sohbet tonunda cevap verin; ezberlenmiş cevaplar sınav görevlisi tarafından kolayca fark edilir ve doğallık puanınızı düşürür. Bu bölümün amacı sizi rahatlatmak ve temel akıcılığınızı ölçmektir, karmaşık dilbilgisi göstermeye çalışmayın." },
      ],
    },
    {
      slug: "ielts-speaking-part2",
      name: "Speaking Part 2",
      questionCount: 1,
      description:
        "Size bir konu kartı (cue card) verilir ve bu konuda 1-2 dakika konuşmanız istenir. Kartta konuya ek olarak değinmeniz gereken 3-4 alt madde bulunur. Konuşmadan önce 1 dakika hazırlanma ve not alma süreniz vardır.\n\nHazırlık İpucu: 1 dakikalık hazırlık süresinde tam cümleler değil, sadece anahtar kelimeler ve fikirler not alın; bu notları konuşurken bir iskelet olarak kullanın.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Kart genellikle 'Describe a...' ile başlar ve altında 'You should say:' başlığıyla 3-4 yönlendirici soru bulunur (ne, ne zaman, kiminle, neden). Bu alt maddelerin HEPSİNE değinmek, konuşmanızı doğal olarak 1-2 dakikaya yayar ve Görev Başarımı puanınızı yükseltir. Konuşmanız bittiğinde sınav görevlisi konuyla ilgili 1-2 kısa takip sorusu sorabilir; bunlara kısaca cevap vermeniz yeterlidir." },
      ],
    },
    {
      slug: "ielts-speaking-part3",
      name: "Speaking Part 3",
      questionCount: 1,
      description:
        "Part 2'deki konuyla tematik olarak bağlantılı, daha soyut ve genel konular üzerine sınav görevlisiyle karşılıklı bir tartışma yaparsınız. Bu bölüm 4-5 dakika sürer ve dilinizin en karmaşık kullanıldığı bölümdür.\n\nHazırlık İpucu: Sorulara tek cümlelik cevaplar vermek yerine görüşünüzü açıklayın, karşılaştırma yapın veya bir örnekle destekleyin — bu bölüm analitik ve soyut düşünme becerinizi ölçer.",
      lessons: [
        { title: "Görev Tanımı ve Strateji", durationMinutes: 6, contentBody: "Sorular genellikle Part 2'deki kişisel/somut konudan topluma, geleceğe veya genel eğilimlere doğru genişler (örn. Part 2'de 'bir hediyeyi' anlattıysanız, Part 3'te 'hediye verme geleneklerinin toplumdaki rolü' sorulabilir). Farklı bakış açılarını değerlendirmek, karşılaştırma yapmak ve fikrinizi gerekçelerle desteklemek bu bölümde yüksek puan almanın anahtarıdır. Emin olmadığınız bir konuda bile akıcı ve tutarlı bir şekilde fikir üretebilmek, doğru cevabı bilmekten daha önemlidir." },
      ],
    },
  ];
  const ieltsTopicMeta = {
    "ielts-listening-multiple-choice": { category: "LISTENING", skillsTested: "Dinleme, Detay Analizi", difficulty: "Orta" },
    "ielts-listening-matching": { category: "LISTENING", skillsTested: "Dinleme, Eşleştirme", difficulty: "Zor" },
    "ielts-listening-plan-map-diagram": { category: "LISTENING", skillsTested: "Dinleme, Yönlendirme, Mekansal Anlama", difficulty: "Zor" },
    "ielts-listening-form-note-table": { category: "LISTENING", skillsTested: "Dinleme, Not Alma", difficulty: "Kolay" },
    "ielts-listening-flowchart-summary-sentence": { category: "LISTENING", skillsTested: "Dinleme, Özetleme", difficulty: "Orta" },
    "ielts-listening-short-answer": { category: "LISTENING", skillsTested: "Dinleme, Kısa Cevap Üretme", difficulty: "Orta" },
    "ielts-reading-multiple-choice": { category: "READING", skillsTested: "Okuduğunu Anlama", difficulty: "Kolay" },
    "ielts-reading-true-false-not-given": { category: "READING", skillsTested: "Bilgi Doğrulama, Dikkatli Okuma", difficulty: "Zor" },
    "ielts-reading-yes-no-not-given": { category: "READING", skillsTested: "Yazarın Görüşünü Anlama", difficulty: "Zor" },
    "ielts-reading-matching-headings": { category: "READING", skillsTested: "Ana Fikir, Paragraf Özetleme", difficulty: "Zor" },
    "ielts-reading-matching-info-features-endings": { category: "READING", skillsTested: "Detay Eşleştirme", difficulty: "Orta" },
    "ielts-reading-sentence-summary-table-completion": { category: "READING", skillsTested: "Tarama, Kelime Bilgisi", difficulty: "Orta" },
    "ielts-reading-diagram-label": { category: "READING", skillsTested: "Görsel-Metin Eşleştirme", difficulty: "Orta" },
    "ielts-reading-short-answer": { category: "READING", skillsTested: "Tarama, Kısa Cevap", difficulty: "Kolay" },
    "ielts-writing-task1": { category: "WRITING", skillsTested: "Veri Yorumlama, Betimleme", difficulty: "Orta" },
    "ielts-writing-task2": { category: "WRITING", skillsTested: "Argüman Geliştirme, Yazma", difficulty: "Zor" },
    "ielts-speaking-part1": { category: "SPEAKING", skillsTested: "Akıcılık, Kişisel İfade", difficulty: "Kolay" },
    "ielts-speaking-part2": { category: "SPEAKING", skillsTested: "Akıcılık, Organizasyon", difficulty: "Orta" },
    "ielts-speaking-part3": { category: "SPEAKING", skillsTested: "Soyut Tartışma, Fikir Geliştirme", difficulty: "Zor" },
  };
  const ieltsExamples = {
    "ielts-listening-multiple-choice": [
      "Örnek: Bir üniversite tanıtım turunda rehber kütüphaneden bahsediyor.\nSoru: \"What does the guide say about the library's opening hours?\" (A) It's open 24 hours. (B) It closes at midnight during exams. (C) It's closed on weekends.\nKayıtta 'during exam period, the library stays open until midnight' deniyorsa doğru cevap (B) — kayıttaki KOŞULU da doğru yakalamak önemlidir.",
      "Örnek: Bir iş görüşmesinde işveren adaya başlangıç tarihini soruyor.\nSoru: \"When does the employer suggest the candidate could start?\" (A) Immediately. (B) In two weeks. (C) Next month.\nKayıtta 'ideally we'd like you to join us as soon as possible, but we understand if you need a couple of weeks to wrap things up' deniyorsa doğru cevap (B) — konuşmacı önce 'as soon as possible' diyip sonra bunu yumuşatıyor, son söylenen bilgi esas alınır.",
      "Örnek: Bir radyo programında sunucu yerel bir pişirme kursundan bahsediyor.\nSoru: \"What does the presenter say makes the course popular?\" (A) Its low price. (B) The variety of cuisines taught. (C) The flexible schedule.\nKayıtta 'what really draws people in isn't the cost — it's the fact that you can learn anything from Italian to Thai cooking in a single term' deniyorsa doğru cevap (B).",
      "Örnek: Bir seyahat acentesiyle telefon görüşmesinde uçak bileti fiyatları konuşuluyor.\nSoru: \"Why does the agent recommend booking a different flight?\" (A) It is cheaper. (B) It has no layover. (C) It departs earlier.\nKayıtta 'the direct flight costs a bit more, but you'll save nearly four hours by avoiding the layover in Istanbul' deniyorsa doğru cevap (B) — burada fiyat değil, süre avantajı vurgulanıyor.",
      "Örnek: Bir doktor muayenehanesinde resepsiyonist randevu değişikliğini anlatıyor.\nSoru: \"What does the receptionist ask the patient to do?\" (A) Arrive earlier. (B) Bring identification. (C) Reschedule for another day.\nKayıtta 'since this is your first visit, just make sure you bring some form of ID with you' deniyorsa doğru cevap (B).",
      "Örnek: Bir üniversite oryantasyon toplantısında park izniyle ilgili bilgi veriliyor.\nSoru: \"What does the speaker say about parking permits?\" (A) They are free for first-year students. (B) They must be renewed every semester. (C) They are only valid on weekdays.\nKayıtta 'permits need to be renewed each semester — a lot of students forget and end up with a fine' deniyorsa doğru cevap (B).",
      "Örnek: Bir restoranda rezervasyon görevlisiyle müşteri arasında geçen telefon konuşması.\nSoru: \"What problem does the customer mention?\" (A) The restaurant is fully booked. (B) The group size has changed. (C) The reservation time is wrong.\nKayıtta 'actually, two more people will be joining us now, so we'll be eight instead of six' deniyorsa doğru cevap (B).",
      "Örnek: Bir spor salonu üyelik görüşmesinde farklı paketler karşılaştırılıyor.\nSoru: \"Which package does the staff member recommend for the caller?\" (A) The basic package. (B) The premium package. (C) The student package.\nKayıtta 'since you mentioned you're studying at the university nearby, the student package would actually save you the most' deniyorsa doğru cevap (C) — arayanın durumuna özel öneri dikkate alınmalı.",
      "Örnek: Bir müze sesli rehberinde bir tablo hakkında bilgi veriliyor.\nSoru: \"According to the guide, what makes this painting unusual for its time?\" (A) Its size. (B) Its use of color. (C) Its subject matter.\nKayıtta 'what shocked audiences wasn't the scale of the canvas, but the artist's bold, almost unnatural use of colour' deniyorsa doğru cevap (B).",
      "Örnek: Bir üniversite dersinde yenilenebilir enerji üzerine bir konuşma yapılıyor.\nSoru: \"What does the lecturer identify as the main obstacle to wider adoption of solar power?\" (A) Technology limitations. (B) Storage costs. (C) Public opinion.\nKayıtta 'the panels themselves are efficient enough now — the real challenge that's holding the industry back is the cost of storing that energy for use at night' deniyorsa doğru cevap (B) — burada teknoloji değil, MALİYET/depolama sorunu öne çıkarılıyor.",
    ],
    "ielts-listening-matching": [
      "Örnek: Beş kulübün (satranç, fotoğrafçılık, tiyatro...) toplantı günleri eşleştirilecek.\nKayıtta 'the chess club meets every Tuesday, while the photography club has moved to Thursdays this term' deniyorsa, konuşmacının SON söylediği bilgiyi (Thursdays) doğru cevap olarak alın.",
      "Örnek: Dört öğrencinin hangi dersi seçtiği isimleriyle eşleştirilecek.\nKayıtta 'Maria was going to take Economics, but she's switched to Statistics instead' deniyorsa, Maria için doğru cevap Statistics'tir — konuşmacının fikir değiştirmesi son bilgiyi geçerli kılar.",
      "Örnek: Bir ofis binasındaki beş departmanın hangi katta olduğu eşleştirilecek.\nKayıtta 'Human Resources used to be on the second floor, but they relocated to the fourth floor last month' deniyorsa, Human Resources için doğru cevap dördüncü kattır.",
      "Örnek: Bir çiftlik gezisinde beş hayvanın hangi bölgede beslendiği eşleştirilecek.\nKayıtta 'the sheep and the goats actually share the same paddock now, near the barn' deniyorsa hem koyunlar hem keçiler aynı seçenekle (barn yakını) eşleştirilir — bir seçeneğin birden fazla soru için doğru cevap olabileceğine dikkat edin.",
      "Örnek: Bir konferansta beş konuşmacının hangi salonda sunum yapacağı eşleştirilecek.\nKayıtta 'Dr. Lawson was originally scheduled for Room B, but due to the number of attendees, her talk has been moved to the main auditorium' deniyorsa, Dr. Lawson için doğru cevap ana odituryum olur.",
      "Örnek: Bir kütüphanede beş kitap türünün hangi katta bulunduğu eşleştirilecek.\nKayıtta 'reference books are on the ground floor, and, oh wait, I should mention that periodicals are also there now, not on the third floor as the old signs say' deniyorsa, periodicals için doğru cevap zemin kattır — eski bilgiye değil, güncellenen bilgiye güvenilmelidir.",
      "Örnek: Bir okul gezisinde beş öğrencinin hangi otobüse bineceği eşleştirilecek.\nKayıtta 'James, you're on Bus 2 — sorry, actually Bus 2 is full, you'll need to switch to Bus 3' deniyorsa James için doğru cevap Bus 3'tür.",
      "Örnek: Bir yarışmada beş takımın hangi ödülü kazandığı eşleştirilecek.\nKayıtta 'the Robotics team came in first, and — hold on, I'm being corrected here — it seems there was a scoring error, so actually the Coding team takes first place' deniyorsa, birincilik için doğru cevap Coding takımıdır.",
      "Örnek: Bir apartman kompleksinde beş dairenin hangi kat planına sahip olduğu eşleştirilecek.\nKayıtta 'apartments ending in 01 have the open-plan layout, except for unit 301, which was renovated differently' deniyorsa, unit 301 için genel kural değil, istisna doğru cevaptır — dikkatli dinleyiciler istisnaları yakalamalıdır.",
      "Örnek: Bir bilimsel sempozyumda beş araştırmacının hangi ülkeden geldiği eşleştirilecek.\nKayıtta 'Professor Aldana, who we initially listed as being from Spain, is actually joining us from Portugal this year' deniyorsa Professor Aldana için doğru cevap Portekiz'dir — yazılı materyaldeki bilgiyle kayıttaki güncelleme çelişebilir, kayıt her zaman önceliklidir.",
    ],
    "ielts-listening-plan-map-diagram": [
      "Örnek: Bir kampüs haritasında rehber şöyle diyor: \"From the main entrance, walk straight past the cafeteria, then turn left at the fountain — the student center is the second building on your right.\"\nBu yönergeleri takip ederek doğru harfi haritada işaretlersiniz.",
      "Örnek: Bir alışveriş merkezi planında rehber diyor ki: \"Once you're through the food court, take the escalator up to the first floor, and the cinema is directly opposite the bookstore.\"\nBu tarifte önce dikey hareket (escalator), sonra yatay konum (opposite) belirtiliyor; her iki bilgiyi de doğru sırayla takip etmek gerekir.",
      "Örnek: Bir hayvanat bahçesi planında rehber diyor ki: \"Head towards the lake, and just before you reach it, the reptile house will be on your left, tucked between the aviary and the gift shop.\"\nBurada 'tucked between' ifadesi iki referans noktası arasında bir konum belirtir; her iki komşu binayı da haritada bulmak doğru cevaba ulaştırır.",
      "Örnek: Bir konferans merkezi kat planında görevli diyor ki: \"The registration desk is not in the lobby anymore — we've moved it to just outside Meeting Room C, on the far side of the building.\"\nBu örnek, planda önceden işaretli görünen bir konumun kayıtta DEĞİŞTİRİLEBİLECEĞİNİ gösterir; her zaman en son verilen bilgiye güvenin.",
      "Örnek: Bir müze kat planında rehber diyor ki: \"As you enter the second floor, the ancient Egypt exhibit is straight ahead, but to see the Roman artefacts, you'll need to backtrack and take the corridor on your immediate right.\"\n'Backtrack' (geri dönmek) gibi yön değiştirme ifadeleri, planın üzerinde takip ettiğiniz yolu tersine çevirmenizi gerektirir.",
      "Örnek: Bir kamp alanı haritasında görevli diyor ki: \"The showers are past the picnic area, and the toilets are just before it, right next to the car park.\"\n'Just before' ve 'past' gibi zıt yön belirteçleri karıştırılabilir; her ifadeyi ayrı ayrı işaretlemek hataları önler.",
      "Örnek: Bir hastane kat planında görevli diyor ki: \"Radiology has actually swapped places with the pharmacy, so what used to be the pharmacy on the ground floor is now radiology.\"\nBu örnek, statik bir plan üzerinde iki birimin yer değiştirdiği bir senaryodur; eski etiketlere değil, kayıttaki güncel bilgiye göre işaretleme yapılmalıdır.",
      "Örnek: Bir botanik bahçesi planında rehber diyor ki: \"Follow the path around the pond, and the rose garden is the third turning on your left, just after the greenhouse.\"\nSayısal yön ifadeleri ('the third turning') genellikle net bir referans noktasıyla ('just after the greenhouse') birlikte verilir; iki ipucunu birleştirerek doğrulama yapın.",
      "Örnek: Bir havalimanı terminal planında görevli diyor ki: \"Gate 22 has been relocated due to construction — instead of being near the food court, it's now at the far end of the terminal, past security checkpoint two.\"\nBu tür yeniden yönlendirme örnekleri sınavda sık kullanılır; planın basılı hâli değil, kayıttaki son bilgi doğru cevabı belirler.",
      "Örnek: Bir üniversite kütüphanesi kat planında görevli diyor ki: \"The quiet study area used to be on the top floor, but with the renovation, it's now split between the ground floor and the mezzanine, while the top floor is reserved for group work.\"\nBirden fazla konumun tek bir kategoriye (quiet study) karşılık geldiği bu zor örnekte, tüm ilgili alanları haritada doğru işaretlemek gerekir.",
    ],
    "ielts-listening-form-note-table": [
      "Örnek form: \"Name: John ______ (1) | Membership type: ______ (2) | Annual fee: £ ______ (3)\"\nKayıtta \"My surname is Whitfield, W-H-I-T-F-I-E-L-D. I'd like the family membership, eighty-five pounds a year\" deniyorsa cevaplar: (1) Whitfield (2) family (3) 85.",
      "Örnek form: \"Course name: ______ (1) | Start date: ______ (2) | Number of sessions: ______ (3)\"\nKayıtta \"the course is called Introduction to Digital Photography, it begins on the 14th of March, and it runs for eight sessions in total\" deniyorsa cevaplar: (1) Introduction to Digital Photography (2) 14 March / 14th March (3) eight / 8.",
      "Örnek form: \"Contact person: ______ (1) | Department: ______ (2) | Extension number: ______ (3)\"\nKayıtta \"you'll want to speak to Mr Alan Price in the Maintenance department, his extension is three-one-seven\" deniyorsa cevaplar: (1) Alan Price (2) Maintenance (3) 317.",
      "Örnek form: \"Item damaged: ______ (1) | Date of purchase: ______ (2) | Preferred solution: ______ (3)\"\nKayıtta \"it's the blender that's broken, I bought it back in June, and I'd really just prefer a full refund rather than a replacement\" deniyorsa cevaplar: (1) blender (2) June (3) refund.",
      "Örnek form: \"Destination: ______ (1) | Number of nights: ______ (2) | Room preference: ______ (3)\"\nKayıtta \"we're heading to Lisbon for five nights, and if possible we'd like a room with a sea view\" deniyorsa cevaplar: (1) Lisbon (2) five / 5 (3) sea view.",
      "Örnek form: \"Volunteer's area of interest: ______ (1) | Availability: ______ (2) | Transport method: ______ (3)\"\nKayıtta \"I'm most interested in working with animals, I'm free on weekends only, and I'll probably cycle there\" deniyorsa cevaplar: (1) animals (2) weekends (3) cycle / bicycle.",
      "Örnek form: \"Complaint category: ______ (1) | Order number: ______ (2) | Refund method: ______ (3)\"\nKayıtta \"the issue is with a late delivery, my order number is four-four-two-one, and I'd like the refund credited back to my card\" deniyorsa cevaplar: (1) late delivery (2) 4421 (3) card.",
      "Örnek form: \"Applicant's previous experience: ______ (1) | Preferred shift: ______ (2) | Reference name: ______ (3)\"\nKayıtta \"I've worked in retail for about two years, I'd prefer evening shifts, and you can contact my previous manager, Sarah Kim, as a reference\" deniyorsa cevaplar: (1) retail (2) evening / evening shifts (3) Sarah Kim.",
      "Örnek form: \"Type of insurance: ______ (1) | Policy duration: ______ (2) | Excess amount: ______ (3)\"\nKayıtta \"you're looking at travel insurance, the policy would last for two weeks, and the excess on that plan is one hundred and fifty pounds\" deniyorsa cevaplar: (1) travel insurance (2) two weeks (3) 150 / £150.",
      "Örnek form: \"Reason for withdrawal: ______ (1) | Effective date: ______ (2) | Refund eligibility: ______ (3)\"\nKayıtta \"the main reason is a change in personal circumstances, it'll take effect from the first of next month, and unfortunately, since it's after the deadline, no refund applies\" deniyorsa cevaplar: (1) change in personal circumstances (2) the first of next month / 1st of next month (3) no refund / not eligible — bu örnek, cevabın bazen 'hayır/yok' anlamına gelen bir ifade olabileceğini gösterir.",
    ],
    "ielts-listening-flowchart-summary-sentence": [
      "Örnek akış şeması: \"Step 1: Submit application → Step 2: ______ → Step 3: Receive confirmation email\"\nKayıtta \"it will be reviewed by our admissions team, which usually takes 3-5 business days\" deniyorsa boşluğa 'reviewed by admissions team' yazılır.",
      "Örnek akış şeması: \"Step 1: Collect raw material → Step 2: ______ → Step 3: Package the product\"\nKayıtta \"once collected, the material has to be cleaned thoroughly before it moves on to the packaging line\" deniyorsa boşluğa 'cleaned' yazılır.",
      "Örnek özet: \"Researchers first observed that the fish avoided the ______ area of the tank.\"\nKayıtta \"what really surprised the team was that the fish consistently stayed away from the illuminated section of the tank\" deniyorsa boşluğa 'illuminated' yazılır.",
      "Örnek akış şeması: \"Step 1: Seeds are planted → Step 2: ______ → Step 3: Seedlings are transferred outdoors\"\nKayıtta \"after planting, the seeds are kept in a heated greenhouse until they sprout\" deniyorsa boşluğa 'heated greenhouse' yazılır.",
      "Örnek özet: \"The study found that participants who exercised in the morning reported better ______ throughout the day.\"\nKayıtta \"those who worked out early on tended to report noticeably better concentration for the rest of the day\" deniyorsa boşluğa 'concentration' yazılır.",
      "Örnek akış şeması: \"Step 1: Customer places order → Step 2: ______ → Step 3: Order is dispatched\"\nKayıtta \"after the order comes in, our warehouse team checks stock availability before anything gets sent out\" deniyorsa boşluğa 'stock availability' veya 'checks stock' yazılır.",
      "Örnek cümle tamamlama: \"The lecturer explained that the first stage of the experiment involved measuring the ______ of each sample.\"\nKayıtta \"before anything else, we had to record the weight of every single sample\" deniyorsa boşluğa 'weight' yazılır.",
      "Örnek akış şeması: \"Step 1: Water is heated → Step 2: ______ → Step 3: Steam drives the turbine\"\nKayıtta \"once the water reaches boiling point, it's converted into high-pressure steam\" deniyorsa boşluğa 'converted into high-pressure steam' veya 'high-pressure steam' yazılır.",
      "Örnek özet: \"According to the speaker, the museum's collection expanded rapidly after it received a ______ from a private donor.\"\nKayıtta \"everything changed the year the museum received a substantial donation from a private collector\" deniyorsa boşluğa 'donation' yazılır.",
      "Örnek akış şeması: \"Step 1: Draft proposal is written → Step 2: ______ → Step 3: Final proposal is submitted to the board\"\nKayıtta \"the draft then goes through peer review, where colleagues suggest changes before it's finalised\" deniyorsa boşluğa 'peer review' yazılır — bu örnekte boşluk bir isim öbeği gerektirir, bu yüzden dilbilgisel tahmin doğru cevaba ulaşmada önemlidir.",
    ],
    "ielts-listening-short-answer": [
      "Örnek soru: \"What piece of equipment does the speaker say is essential for the hiking trip?\"\nKayıtta \"Don't forget to bring a good pair of waterproof boots — that's the one thing you really can't do without\" deniyorsa cevap: 'waterproof boots'.",
      "Örnek soru: \"What is the name of the software the company plans to switch to?\"\nKayıtta \"we've decided to move away from our current system and adopt something called CloudTrack instead\" deniyorsa cevap: 'CloudTrack'.",
      "Örnek soru: \"How long does the speaker say the whole certification process takes?\"\nKayıtta \"start to finish, most people find it takes around six months to complete\" deniyorsa cevap: 'six months'.",
      "Örnek soru: \"What does the speaker recommend bringing to the workshop?\"\nKayıtta \"just bring a laptop — everything else, including materials, will be provided\" deniyorsa cevap: 'a laptop' / 'laptop'.",
      "Örnek soru: \"What is the main reason the flight was delayed?\"\nKayıtta \"it wasn't the weather this time — it was actually a technical issue with the aircraft\" deniyorsa cevap: 'a technical issue' / 'technical issue'.",
      "Örnek soru: \"According to the speaker, what qualification is required for the role?\"\nKayıtta \"you don't need a degree, but a first-aid certificate is compulsory\" deniyorsa cevap: 'a first-aid certificate' / 'first-aid certificate'.",
      "Örnek soru: \"What does the tour guide say visitors should avoid doing near the waterfall?\"\nKayıtta \"please don't climb onto the rocks near the base — it's more slippery than it looks\" deniyorsa cevap: 'climbing onto the rocks' / 'climb onto the rocks'.",
      "Örnek soru: \"What time does the speaker say the workshop will actually finish?\"\nKayıtta \"it's advertised as ending at four, but in practice we usually wrap up closer to half past four\" deniyorsa cevap: 'half past four' / '4:30' — reklamdaki bilgi değil, konuşmacının GERÇEK bilgisi doğru cevaptır.",
      "Örnek soru: \"What does the speaker say caused the delay in the research project?\"\nKayıtta \"funding wasn't the problem — it was simply that the equipment we ordered arrived three months late\" deniyorsa cevap: 'the equipment arrived late' / 'late equipment'.",
      "Örnek soru: \"What does the professor suggest students do before the final exam?\"\nKayıtta \"rather than re-reading your notes, I'd strongly recommend doing as many practice papers as you can find\" deniyorsa cevap: 'practice papers' / 'do practice papers' — burada konuşmacının ÖNERMEDİĞİ eylem (re-reading notes) ile karıştırmamak gerekir.",
    ],
    "ielts-reading-multiple-choice": [
      "Örnek metin: \"While early critics dismissed the artist's work as unconventional, later generations came to regard it as revolutionary.\"\nSoru: \"How did later generations view the artist's work?\" Doğru cevap (B) 'revolutionary' — metinde birebir bu kelime geçiyor.",
      "Örnek metin: \"Although the policy was intended to reduce traffic congestion, its most measurable effect has been a modest decline in air pollution levels.\"\nSoru: \"What has been the most noticeable outcome of the policy?\" (A) Reduced congestion (B) Lower air pollution (C) Increased public transport use. Doğru cevap (B) — metin, amaçlanan sonuç (congestion) ile GERÇEKLEŞEN sonucu (air pollution) ayırt ediyor.",
      "Örnek metin: \"The species was once believed to be nocturnal, but recent camera-trap studies suggest it is in fact active throughout the day as well.\"\nSoru: \"What have recent studies revealed about the species?\" (A) It is strictly nocturnal. (B) It is active during the day too. (C) It has become extinct. Doğru cevap (B) — 'as well' ifadesi türün hem gece hem gündüz aktif olduğunu gösteriyor.",
      "Örnek metin: \"Critics argue that the reform, though well-intentioned, has in practice increased administrative burdens on small businesses.\"\nSoru: \"What is the criticism of the reform mentioned in the passage?\" (A) It lacks good intentions. (B) It has raised costs for large corporations. (C) It has added bureaucracy for small businesses. Doğru cevap (C).",
      "Örnek metin: \"Unlike its predecessor, the new engine design prioritises fuel efficiency over raw power, a trade-off engineers consider necessary given rising fuel costs.\"\nSoru: \"What does the new engine design prioritise?\" (A) Raw power. (B) Fuel efficiency. (C) Reduced manufacturing cost. Doğru cevap (B).",
      "Örnek metin: \"Though initially met with scepticism, the theory gradually gained acceptance as more supporting evidence emerged over the following decade.\"\nSoru: \"How did the scientific community's view of the theory change?\" (A) It remained sceptical. (B) It became more accepting over time. (C) It rejected the theory outright. Doğru cevap (B).",
      "Örnek metin: \"The city's decision to pedestrianise the historic centre was driven less by environmental concerns than by a desire to boost tourism revenue.\"\nSoru: \"According to the passage, what was the primary motivation behind pedestrianising the centre?\" (A) Environmental protection. (B) Tourism revenue. (C) Reducing noise pollution. Doğru cevap (B) — 'less by... than by' yapısı asıl nedeni vurguluyor.",
      "Örnek metin: \"While some researchers attribute the decline in bee populations solely to pesticide use, a growing body of evidence points to habitat loss as an equally significant factor.\"\nSoru: \"What does the passage suggest about the causes of bee population decline?\" (A) Pesticides are the only cause. (B) Habitat loss may be just as important as pesticides. (C) The decline has been exaggerated. Doğru cevap (B).",
      "Örnek metin: \"The author contends that automation will not eliminate jobs so much as transform the skills required to perform them.\"\nSoru: \"What is the author's main argument about automation?\" (A) It will eliminate most jobs. (B) It will change the skills jobs require rather than remove them. (C) It will have no effect on employment. Doğru cevap (B) — 'not... so much as' yapısı iki seçenek arasında ince bir ayrım yapıyor.",
      "Örnek metin: \"Proponents claim the vaccine's benefits far outweigh its rare side effects, a position supported by nearly every major health authority, though a vocal minority continues to raise concerns about long-term data.\"\nSoru: \"What does the passage say about the debate over the vaccine?\" (A) There is no disagreement among experts. (B) Most authorities support it, but some concerns remain. (C) Long-term data has proven it unsafe. Doğru cevap (B) — bu zor örnekte, çoğunluk görüşü ile azınlık itirazı arasındaki dengeyi doğru okumak gerekir.",
    ],
    "ielts-reading-true-false-not-given": [
      "Örnek metin: \"The bridge, completed in 1932, was the longest suspension bridge in the world at the time.\"\nİfade: \"The bridge is currently the longest suspension bridge in the world.\" Doğru cevap: FALSE — metin 'at the time' diyor, bu şu an için geçerli bir iddia değil, bilgiyle çelişiyor.",
      "Örnek metin: \"The company was founded in 1998 by two former engineering students in a small rented office.\"\nİfade: \"The company's founders had no prior experience in business.\" Doğru cevap: NOT GIVEN — metin kurucuların iş deneyimi olup olmadığından hiç bahsetmiyor.",
      "Örnek metin: \"Despite repeated attempts, scientists have been unable to fully replicate the original experiment's results.\"\nİfade: \"The original experiment's results have been confirmed by later studies.\" Doğru cevap: FALSE — metin tam tersini, sonuçların tekrarlanamadığını söylüyor.",
      "Örnek metin: \"The museum's new wing, funded entirely by private donations, will house the institution's growing collection of contemporary art.\"\nİfade: \"The government contributed part of the funding for the new wing.\" Doğru cevap: FALSE — metin finansmanın 'entirely' (tamamen) özel bağışlarla sağlandığını belirtiyor.",
      "Örnek metin: \"Local farmers have adapted to the changing climate by shifting to drought-resistant crop varieties.\"\nİfade: \"All local farmers have switched to drought-resistant crops.\" Doğru cevap: NOT GIVEN — metin 'local farmers' diyor ama HEPSİNİN geçiş yaptığını belirtmiyor, bu genelleme metinde yok.",
      "Örnek metin: \"The novel, though praised for its ambitious structure, took the author almost a decade to complete.\"\nİfade: \"The author found the writing process quick and straightforward.\" Doğru cevap: FALSE — 'almost a decade' ifadesi sürecin uzun olduğunu gösteriyor, 'quick' ile çelişiyor.",
      "Örnek metin: \"The new regulation requires all commercial vehicles to undergo an emissions test every two years.\"\nİfade: \"Private vehicles are also required to undergo the emissions test.\" Doğru cevap: NOT GIVEN — metin sadece ticari araçlardan bahsediyor, özel araçlar hakkında hiçbir şey söylemiyor (FALSE değil, çünkü açık bir çelişki yok).",
      "Örnek metin: \"Although the technique was developed in the 1960s, it did not become widely used in hospitals until several decades later.\"\nİfade: \"The technique was adopted by hospitals soon after it was developed.\" Doğru cevap: FALSE — 'several decades later' ifadesi hemen benimsenmediğini açıkça gösteriyor.",
      "Örnek metin: \"The report notes a sharp increase in remote working arrangements since 2020, though it stops short of predicting whether this trend will continue.\"\nİfade: \"The report predicts that remote working will continue to increase.\" Doğru cevap: NOT GIVEN — metin açıkça 'stops short of predicting' diyerek bir tahmin yapmadığını belirtiyor; bu FALSE değil, çünkü metin konu hakkında görüş bildirmekten kaçınıyor.",
      "Örnek metin: \"Some economists have questioned the study's methodology, though its central conclusion — that inflation disproportionately affects low-income households — remains widely accepted.\"\nİfade: \"The study's methodology has never been criticised.\" Doğru cevap: FALSE — metin açıkça bazı ekonomistlerin metodolojiyi sorguladığını belirtiyor; bu zor örnekte, metnin kabul ettiği SONUÇ ile eleştirilen YÖNTEMİ birbirinden ayırt etmek gerekir.",
    ],
    "ielts-reading-yes-no-not-given": [
      "Örnek metin: \"In my view, current urban planning policies fail to adequately address the needs of low-income residents.\"\nİfade: \"The author believes urban planning policies are inadequate.\" Doğru cevap: YES — yazar bunu açıkça kendi görüşü olarak belirtmiştir.",
      "Örnek metin: \"It would be a mistake to assume that technology alone can solve the problem of educational inequality.\"\nİfade: \"The author believes technology can fully resolve educational inequality on its own.\" Doğru cevap: NO — yazar bu görüşün 'bir hata' olacağını söyleyerek doğrudan karşı çıkıyor.",
      "Örnek metin: \"The committee published its findings on rising sea levels along the eastern coastline last year.\"\nİfade: \"The author thinks the committee's findings were exaggerated.\" Doğru cevap: NOT GIVEN — bu cümle sadece olgusal bir bilgi veriyor, yazarın bu konuda bir görüşü belirtilmiyor.",
      "Örnek metin: \"Frankly, I find it hard to justify the enormous public spending on this project when so many basic services remain underfunded.\"\nİfade: \"The author supports the level of public spending on the project.\" Doğru cevap: NO — 'hard to justify' ifadesi yazarın harcamaya karşı olduğunu gösteriyor.",
      "Örnek metin: \"Whatever one thinks of the policy's economic merits, its impact on public trust in government has been undeniably positive.\"\nİfade: \"The author believes the policy has damaged public trust in government.\" Doğru cevap: NO — metin tam tersini, etkinin 'undeniably positive' olduğunu söylüyor.",
      "Örnek metin: \"The factory has operated at this location since 1974, employing several generations of local families.\"\nİfade: \"The author believes the factory should be relocated.\" Doğru cevap: NOT GIVEN — bu cümle sadece tarihsel bir bilgi veriyor, yazarın fabrikanın taşınması gerektiğine dair bir görüşü yok.",
      "Örnek metin: \"Too often, we celebrate individual achievement while ignoring the collective effort that made it possible in the first place.\"\nİfade: \"The author thinks collective effort is generally overlooked.\" Doğru cevap: YES — 'too often... ignoring' ifadesi yazarın bu konudaki eleştirel görüşünü açıkça yansıtıyor.",
      "Örnek metin: \"There is, admittedly, some merit to the argument that stricter regulation could stifle innovation, though I remain unconvinced overall.\"\nİfade: \"The author is fully convinced that stricter regulation would stifle innovation.\" Doğru cevap: NO — yazar bazı haklılık payı olduğunu kabul etse de sonuçta 'unconvinced' (ikna olmamış) olduğunu belirtiyor.",
      "Örnek metin: \"The survey included responses from over two thousand participants across twelve countries.\"\nİfade: \"The author considers the survey's sample size to be insufficient.\" Doğru cevap: NOT GIVEN — bu cümle sadece metodolojik bir detay veriyor, yazarın örneklem büyüklüğü hakkında bir değerlendirmesi yok.",
      "Örnek metin: \"One might argue that tradition should be preserved at all costs, but I would suggest that some traditions are better left to evolve — or even fade — with time.\"\nİfade: \"The author believes all traditions must be preserved unchanged.\" Doğru cevap: NO — yazar 'one might argue' ile karşıt görüşü sunduktan sonra kendi görüşünü ('I would suggest') buna karşı olarak sunuyor; bu zor örnekte iki farklı görüşü birbirinden ayırt etmek gerekir.",
    ],
    "ielts-reading-matching-headings": [
      "Örnek paragraf: 'While the initial cost of solar panel installation can be significant, the long-term savings on energy bills, combined with government incentives, often make it a financially sound investment.'\nBu paragrafın ana fikri MALİYET/YATIRIM olduğu için en uygun başlık \"The financial benefits of solar energy\" olur.",
      "Örnek paragraf: 'Beyond its environmental impact, the shift to electric vehicles has forced governments to rethink infrastructure planning, from charging networks to electricity grid capacity.'\nBu paragraf çevresel etkiden değil, ALTYAPI PLANLAMASINDAN bahsettiği için en uygun başlık \"Rethinking infrastructure for a new technology\" olur, \"The environmental impact of electric cars\" gibi yanıltıcı bir başlık değil.",
      "Örnek paragraf: 'Perhaps the most surprising finding was that participants who took short breaks every hour performed better on cognitive tasks than those who worked continuously.'\nBu paragrafın ana fikri MOLALARIN FAYDASI olduğu için en uygun başlık \"An unexpected benefit of regular breaks\" olur.",
      "Örnek paragraf: 'Critics of the museum's renovation point out that the modernist extension clashes sharply with the building's nineteenth-century facade.'\nBu paragraf yenilemenin genel başarısından değil, ESTETİK UYUMSUZLUKTAN bahsettiği için en uygun başlık \"A clash between old and new architecture\" olur.",
      "Örnek paragraf: 'Although the initial trials showed promise, subsequent studies have failed to replicate the drug's effectiveness in a broader population.'\nBu paragraf ilacın başarısından değil, SONRAKİ ÇALIŞMALARIN TUTARSIZLIĞINDAN bahsettiği için en uygun başlık \"Inconsistent results in later research\" olur.",
      "Örnek paragraf: 'Small coastal towns have found an unlikely economic lifeline in remote workers relocating from major cities in search of a slower pace of life.'\nBu paragrafın ana fikri KÜÇÜK KASABALARIN EKONOMİK CANLANMASI olduğu için en uygun başlık \"A new source of income for coastal communities\" olur.",
      "Örnek paragraf: 'It would be a mistake, however, to assume that all forms of exercise offer equal benefits for mental health; the evidence suggests that outdoor activities have a distinct advantage.'\nBu paragraf genel egzersiz faydasından değil, AÇIK HAVA AKTİVİTESİNİN ÜSTÜNLÜĞÜNDEN bahsettiği için en uygun başlık \"Why outdoor exercise may be especially beneficial\" olur.",
      "Örnek paragraf: 'The committee's report, running to nearly three hundred pages, was criticised even by its supporters for being needlessly dense and inaccessible to the general public.'\nBu paragraf raporun İÇERİĞİNDEN değil, RAPORUN SUNUM TARZINDAN (anlaşılırlığından) bahsettiği için en uygun başlık \"Criticism of the report's readability\" olur.",
      "Örnek paragraf: 'Few could have predicted, three decades ago, that a device once dismissed as a passing fad would come to reshape nearly every aspect of daily communication.'\nBu paragraf cihazın teknik özelliklerinden değil, BEKLENMEDİK ETKİSİNDEN bahsettiği için en uygun başlık \"An unforeseen transformation in communication\" olur.",
      "Örnek paragraf: 'Whether the decline in bee populations stems primarily from pesticide exposure, habitat fragmentation, or a combination of factors interacting in ways scientists are only beginning to understand, remains a matter of active debate.'\nBu zor örnekte paragraf TEK bir nedeni değil, BELİRSİZLİĞİ ve tartışmayı vurguladığı için en uygun başlık \"Uncertainty over the causes of a decline\" olur; \"The main cause of bee population decline\" gibi kesinlik ifade eden bir başlık yanıltıcıdır.",
    ],
    "ielts-reading-matching-info-features-endings": [
      "Örnek (Matching Features): Üç araştırmacının farklı teorileri anlatılıyor. Metinde 'Chen argued that climatic conditions were the dominant influence' cümlesi varsa, \"proposed that climate was the primary factor\" ifadesi Chen ile eşleştirilir.",
      "Örnek (Matching Information): Metinde beş paragraf var ve bir soru 'a description of the method used to collect data' bilgisinin hangi paragrafta geçtiğini soruyor. Paragraf C'de 'researchers gathered responses through a combination of online surveys and in-person interviews' cümlesi varsa, doğru cevap Paragraf C'dir.",
      "Örnek (Matching Sentence Endings): Cümlenin ilk yarısı \"Despite the setbacks, the research team...\" olarak veriliyor. Metinde 'despite several equipment failures, the team persevered and ultimately published their findings a year later than planned' cümlesi varsa, doğru tamamlayıcı \"...eventually published their results.\" olur.",
      "Örnek (Matching Features): Üç şehir planlamacısının farklı yaklaşımları anlatılıyor. Metinde 'Okafor's approach prioritised pedestrian zones over vehicle access' cümlesi varsa, \"favoured limiting car access in favour of walkers\" ifadesi Okafor ile eşleştirilir.",
      "Örnek (Matching Information): Bir soru 'a reference to an unexpected side effect of the treatment' bilgisinin hangi paragrafta geçtiğini soruyor. Paragraf E'de 'quite unexpectedly, patients also reported improved sleep quality' cümlesi varsa, doğru cevap Paragraf E'dir.",
      "Örnek (Matching Sentence Endings): Cümlenin ilk yarısı \"Although the bridge was completed on schedule,...\" olarak veriliyor. Metinde 'the bridge opened on time, though engineers later discovered structural issues that required costly repairs within the first decade' cümlesi varsa, doğru tamamlayıcı \"...it later required significant repairs.\" olur.",
      "Örnek (Matching Features): Dört filozofun görüşleri karşılaştırılıyor. Metinde 'unlike his contemporaries, Vance rejected the notion that morality could be reduced to a set of fixed rules' cümlesi varsa, \"disagreed that ethics could be based on rigid rules\" ifadesi Vance ile eşleştirilir.",
      "Örnek (Matching Information): Bir soru 'a comparison between two competing explanations' bilgisinin hangi paragrafta geçtiğini soruyor. Paragraf B'de 'while one camp attributes the decline to overfishing, another points to rising ocean temperatures' cümlesi varsa, doğru cevap Paragraf B'dir.",
      "Örnek (Matching Sentence Endings): Cümlenin ilk yarısı \"Even though the policy was unpopular at first,...\" olarak veriliyor. Metinde 'the policy faced fierce public opposition in its first year, yet surveys conducted five years later showed broad support' cümlesi varsa, doğru tamamlayıcı \"...it eventually gained widespread acceptance.\" olur — bu zor örnekte zaman ifadelerini (ilk yıl / beş yıl sonra) doğru sıralamak kritik önemdedir.",
      "Örnek (Matching Features): Üç ekonomistin farklı önerileri anlatılıyor. Metinde 'Reyes, by contrast, warned that the proposed tax cuts could widen the budget deficit without stimulating meaningful growth' cümlesi varsa, \"cautioned that the measure might increase the deficit\" ifadesi Reyes ile eşleştirilir; burada 'by contrast' ifadesi Reyes'in görüşünün diğerlerinden FARKLI olduğunu gösteriyor, bu ipucu doğru eşleştirmeyi kolaylaştırır.",
    ],
    "ielts-reading-sentence-summary-table-completion": [
      "Örnek cümle: \"The experiment showed that plants grown in ______ conditions produced significantly more fruit.\"\nMetinde 'plants exposed to controlled greenhouse conditions yielded 40% more fruit' cümlesi varsa, boşluğa metinden birebir 'controlled greenhouse' yazılır.",
      "Örnek özet: \"Researchers discovered that the ancient settlement had been abandoned following a severe ______.\"\nMetinde 'archaeological evidence points to a prolonged drought as the reason the settlement was deserted' cümlesi varsa, boşluğa 'drought' yazılır.",
      "Örnek tablo: \"Material | Melting Point | Common Use\nCopper | 1085°C | ______\"\nMetinde 'due to its excellent conductivity, copper is widely used in electrical wiring' cümlesi varsa, boşluğa 'electrical wiring' yazılır.",
      "Örnek cümle: \"According to the passage, the bridge's design was inspired by the shape of a ______.\"\nMetinde 'the engineer modelled the structure's curved supports on the shape of a bird's wing' cümlesi varsa, boşluğa 'bird's wing' yazılır.",
      "Örnek özet: \"The survey revealed that most respondents cited ______ as their main reason for choosing public transport.\"\nMetinde 'when asked why they chose the bus over driving, the majority pointed to cost savings' cümlesi varsa, boşluğa 'cost savings' yazılır.",
      "Örnek tablo: \"Species | Habitat | Diet\nArctic fox | Tundra | ______\"\nMetinde 'the Arctic fox survives largely on a diet of lemmings and other small rodents' cümlesi varsa, boşluğa 'lemmings and other small rodents' veya kelime sınırına göre 'lemmings' yazılır.",
      "Örnek cümle: \"The report concluded that the company's decline in profits was primarily due to increased ______ from overseas manufacturers.\"\nMetinde 'the sharp fall in profits was mostly attributed to growing competition from manufacturers based abroad' cümlesi varsa, boşluğa 'competition' yazılır.",
      "Örnek özet: \"Scientists now believe that the crater was formed by the impact of a ______ millions of years ago.\"\nMetinde 'geological analysis suggests the crater resulted from a meteorite striking the region millions of years ago' cümlesi varsa, boşluğa 'meteorite' yazılır.",
      "Örnek tablo: \"Policy | Year Introduced | Main Criticism\nCongestion charge | 2003 | ______\"\nMetinde 'opponents of the congestion charge argue it unfairly burdens low-income drivers' cümlesi varsa, boşluğa 'unfairly burdens low-income drivers' veya kelime sınırına göre 'low-income drivers' yazılır.",
      "Örnek cümle: \"The study suggests that memory retention improves when new information is linked to a person's existing ______.\"\nMetinde 'the researchers found that recall was strongest when new facts were connected to knowledge the participants already possessed' cümlesi varsa, boşluğa 'knowledge' yazılır — bu zor örnekte metindeki 'knowledge participants already possessed' ifadesi özetteki 'existing ______' ile eş anlamlı olarak paraphrase edilmiştir, bu yüzden birebir kelime eşleşmesi yerine anlam eşleşmesi aranmalıdır.",
    ],
    "ielts-reading-diagram-label": [
      "Örnek: Bir su arıtma sistemi diyagramında Boşluk A filtreleme aşamasını gösteriyor. Metinde \"the water then passes through a sand filter, which removes larger particles\" varsa, Boşluk A'ya 'sand filter' yazılır.",
      "Örnek: Bir güneş paneli kesitinde Boşluk B, ışığı elektriğe çeviren katmanı gösteriyor. Metinde \"beneath the glass casing lies the photovoltaic cell, where sunlight is converted into electrical current\" varsa, Boşluk B'ye 'photovoltaic cell' yazılır.",
      "Örnek: Bir insan kulağı kesitinde Boşluk C, ses titreşimlerini ilettiği söylenen küçük kemikleri gösteriyor. Metinde \"vibrations then travel through three tiny bones known as the ossicles\" varsa, Boşluk C'ye 'ossicles' yazılır.",
      "Örnek: Bir rüzgar türbini diyagramında Boşluk D, dönüş hareketini elektriğe çeviren parçayı gösteriyor. Metinde \"the rotating shaft is connected to a generator, which produces electricity\" varsa, Boşluk D'ye 'generator' yazılır.",
      "Örnek: Bir volkan kesitinde Boşluk E, erimiş kayanın biriktiği odayı gösteriyor. Metinde \"molten rock collects in an underground chamber known as the magma chamber before an eruption\" varsa, Boşluk E'ye 'magma chamber' yazılır.",
      "Örnek: Bir kahve makinesi diyagramında Boşluk F, suyun ısıtıldığı bölümü gösteriyor. Metinde \"cold water enters the heating chamber, where it is rapidly brought to near-boiling temperature\" varsa, Boşluk F'ye 'heating chamber' yazılır.",
      "Örnek: Bir bitki hücresi diyagramında Boşluk G, fotosentezin gerçekleştiği organeli gösteriyor. Metinde \"photosynthesis takes place within structures called chloroplasts, found throughout the leaf's cells\" varsa, Boşluk G'ye 'chloroplasts' yazılır.",
      "Örnek: Bir köprü kesitinde Boşluk H, ana yükü taşıyan kabloları gösteriyor. Metinde \"the deck's weight is supported by a series of steel suspension cables running to the towers\" varsa, Boşluk H'ye 'suspension cables' yazılır.",
      "Örnek: Bir arıtma tesisinde Boşluk I, çamurun ayrıldığı tankı gösteriyor. Metinde \"solid waste settles out in what is called the sedimentation tank before the water moves further along the process\" varsa, Boşluk I'ye 'sedimentation tank' yazılır.",
      "Örnek: Bir jet motoru kesitinde Boşluk J, havanın sıkıştırıldığı bölümü gösteriyor. Metinde \"incoming air is first drawn into the compressor, where its pressure is significantly increased before combustion occurs\" varsa, Boşluk J'ye 'compressor' yazılır — bu zor örnekte 'before combustion occurs' ifadesi, bu aşamanın yanma odasından ÖNCE geldiğini belirterek diyagramdaki sırayı doğrulamaya yardımcı olur.",
    ],
    "ielts-reading-short-answer": [
      "Örnek soru: \"What material was traditionally used to make the roofs mentioned in the passage?\"\nMetinde \"Roofs were traditionally thatched with local reeds before corrugated iron became available\" varsa, cevap: 'reeds' veya 'local reeds'.",
      "Örnek soru: \"What did the researchers use to track the animals' movements?\"\nMetinde \"the team fitted each animal with a lightweight GPS collar to monitor its movements over the following year\" varsa, cevap: 'a GPS collar' / 'GPS collar'.",
      "Örnek soru: \"According to the passage, what is the main export of the region?\"\nMetinde \"coffee remains, by a wide margin, the region's primary export commodity\" varsa, cevap: 'coffee'.",
      "Örnek soru: \"What event triggered the change in government policy?\"\nMetinde \"it was the severe flooding of 2011 that finally prompted lawmakers to revise building regulations\" varsa, cevap: 'the flooding of 2011' / 'severe flooding'.",
      "Örnek soru: \"What did the study identify as the biggest barrier to recycling among survey participants?\"\nMetinde \"when asked what stopped them from recycling more, most participants pointed to a simple lack of convenient collection points\" varsa, cevap: 'lack of convenient collection points' / 'lack of collection points'.",
      "Örnek soru: \"How many years did it take to complete the restoration of the cathedral?\"\nMetinde \"the restoration project, which began in 1998, was not fully completed until 2013\" varsa, cevap: '15 years' / 'fifteen years'.",
      "Örnek soru: \"What natural feature initially attracted settlers to the area?\"\nMetinde \"early settlers were drawn to the area chiefly by its natural harbour, which offered safe anchorage for ships\" varsa, cevap: 'a natural harbour' / 'natural harbour'.",
      "Örnek soru: \"What device did the inventor use to test the theory before building a full-scale model?\"\nMetinde \"before committing to a full-scale build, the inventor tested the concept using a simple scale model in a wind tunnel\" varsa, cevap: 'a scale model' / 'scale model' (wind tunnel test yönteminin kendisi değil, kullanılan ARAÇ sorulmaktadır).",
      "Örnek soru: \"What according to the author is the most overlooked factor in workplace productivity?\"\nMetinde \"far too little attention is paid to the quality of natural light in office design, despite its measurable effect on productivity\" varsa, cevap: 'the quality of natural light' / 'natural light'.",
      "Örnek soru: \"What did the committee recommend as an alternative to the original proposal?\"\nMetinde \"rather than approving the original high-rise design, the committee recommended a lower-density development with more green space\" varsa, cevap: 'a lower-density development' / 'lower-density development' — bu zor örnekte, REDDEDİLEN öneri (high-rise design) ile ÖNERİLEN alternatif (lower-density development) birbirine karıştırılmamalıdır.",
    ],
    "ielts-writing-task1": [
      "Örnek görev: 2000-2020 arası üç ülkenin yenilenebilir enerji kullanım oranını gösteren çizgi grafik.\nÖrnek giriş cümlesi: \"The line graph illustrates the percentage of renewable energy consumption in three countries from 2000 to 2020.\" Ardından en belirgin eğilim (örn. 'Country X showed the steepest increase, rising from 5% to 35%') detaylandırılır.",
      "Örnek görev: Beş farklı meslek grubunun 2010 ve 2020 yıllarındaki ortalama haftalık çalışma saatlerini karşılaştıran çubuk grafik.\nÖrnek giriş cümlesi: \"The bar chart compares the average weekly working hours of five occupational groups in 2010 and 2020.\" Ardından en büyük değişim gösteren grup (örn. 'Healthcare workers saw the largest rise, from 38 to 47 hours per week') detaylandırılır.",
      "Örnek görev: Bir ailenin aylık bütçesinin dört kalem (kira, gıda, ulaşım, eğlence) arasında dağılımını gösteren pasta grafik.\nÖrnek giriş cümlesi: \"The pie chart shows how a household's monthly budget is divided among four categories of spending.\" Ardından en büyük payı alan kalem (örn. 'Rent accounted for almost half of total expenditure, at 48%') detaylandırılır.",
      "Örnek görev: Bir kağıt geri dönüşüm sürecinin aşamalarını gösteren süreç diyagramı.\nÖrnek giriş cümlesi: \"The diagram illustrates the stages involved in recycling paper, from collection to the production of new paper products.\" Ardından süreç sırayla özetlenir (örn. 'The process begins with the collection of used paper and ends with...').",
      "Örnek görev: Bir kasabanın 1990 ve 2020 yıllarındaki yerleşim planını karşılaştıran iki harita.\nÖrnek giriş cümlesi: \"The two maps show how the layout of a small town changed between 1990 and 2020.\" Ardından en belirgin değişiklikler (örn. 'A new residential area replaced what used to be farmland to the north of the town') detaylandırılır.",
      "Örnek görev: Dört ülkede internet kullanıcı sayısının 2005-2025 arası artışını gösteren çizgi grafik.\nÖrnek giriş cümlesi: \"The line graph depicts the growth in the number of internet users in four countries between 2005 and 2025.\" Ardından ülkeler arasındaki karşılaştırma (örn. 'While all four countries saw growth, Country A's rate of increase far outpaced the others after 2015') detaylandırılır.",
      "Örnek görev: Bir üniversitenin farklı fakültelerindeki öğrenci sayısını 2015 ve 2023 için karşılaştıran tablo.\nÖrnek giriş cümlesi: \"The table compares student numbers across five faculties at a university in 2015 and 2023.\" Ardından en dikkat çekici değişiklikler (örn. 'Enrolment in the Faculty of Engineering nearly doubled, while numbers in the Faculty of Arts declined slightly') detaylandırılır.",
      "Örnek görev: Bir çimento üretim sürecinin adımlarını gösteren süreç diyagramı.\nÖrnek giriş cümlesi: \"The diagram illustrates the process by which cement is manufactured, from raw material extraction to packaging.\" Ardından süreç mantıksal sırayla özetlenir.",
      "Örnek görev: Altı ülkede kişi başı ortalama et tüketimini gösteren çubuk grafik.\nÖrnek giriş cümlesi: \"The bar chart illustrates average per capita meat consumption in six countries in a given year.\" Ardından en yüksek ve en düşük değerler karşılaştırılır (örn. 'Consumption in Country F was more than three times higher than in Country B').",
      "Örnek görev: Bir şehir merkezindeki toplu taşıma kullanım oranlarının otobüs, metro ve bisiklet arasında 2000-2020 yıllarına göre değişimini gösteren karma çizgi grafik.\nÖrnek giriş cümlesi: \"The line graph shows changes in the share of public transport usage among bus, metro, and bicycle between 2000 and 2020 in a city centre.\" Bu zor örnekte üç ayrı eğilim aynı anda karşılaştırılmalıdır; en belirgin değişimi (örn. 'bicycle use overtook bus use for the first time in 2018') seçip diğerlerine kısaca değinmek, tüm verileri ayrıntılı anlatmaya çalışmaktan daha etkilidir.",
    ],
    "ielts-writing-task2": [
      "Örnek konu: \"Some people think unpaid community service should be compulsory in high schools. To what extent do you agree?\"\nÖrnek tez cümlesi: \"While I acknowledge the potential benefits of community service, I believe making it compulsory could undermine its educational value and place undue burden on students.\"",
      "Örnek konu: \"Some believe that governments should invest more in public transport rather than building new roads. Discuss both views and give your own opinion.\"\nÖrnek tez cümlesi: \"Although expanding road networks can ease short-term congestion, I would argue that sustained investment in public transport offers far greater long-term benefits for both the environment and urban mobility.\"",
      "Örnek konu: \"Many people believe that social media has had a negative effect on the way young people communicate. To what extent do you agree or disagree?\"\nÖrnek tez cümlesi: \"While social media has undeniably changed the nature of youth communication, I contend that its overall effect has been more transformative than simply negative.\"",
      "Örnek konu: \"Some argue that the increasing use of robots and artificial intelligence in the workplace will lead to widespread unemployment. To what extent do you agree?\"\nÖrnek tez cümlesi: \"Although automation will undoubtedly displace certain jobs, I believe it will ultimately create new categories of employment rather than causing net job losses.\"",
      "Örnek konu: \"In many countries, the amount of crime committed by teenagers is increasing. What are the causes of this, and what solutions can you suggest?\"\nÖrnek tez cümlesi: \"This essay will argue that a lack of parental supervision and limited access to constructive after-school activities are the two principal causes of rising youth crime, both of which can be addressed through targeted community programmes.\"",
      "Örnek konu: \"Some people think that international tourism has a negative impact on local cultures. Do you agree or disagree?\"\nÖrnek tez cümlesi: \"While mass tourism can indeed erode certain aspects of local tradition, I believe that, when managed responsibly, it more often revitalises rather than damages local culture.\"",
      "Örnek konu: \"Some people believe that studying abroad brings more advantages than disadvantages for university students. To what extent do you agree?\"\nÖrnek tez cümlesi: \"I largely agree that the benefits of studying abroad, particularly in terms of independence and cross-cultural competence, outweigh the challenges it presents.\"",
      "Örnek konu: \"Governments should spend money on public housing rather than subsidising private home ownership. To what extent do you agree or disagree?\"\nÖrnek tez cümlesi: \"I partly agree with this view, arguing that while public housing should remain a priority, a balanced approach that also supports first-time buyers produces more sustainable outcomes.\"",
      "Örnek konu: \"Some people believe that children should begin learning a foreign language as early as possible, while others think it is better to wait until secondary school. Discuss both views and give your opinion.\"\nÖrnek tez cümlesi: \"Although a strong case can be made for the cognitive benefits of early exposure, I believe that beginning formal foreign language instruction slightly later, when literacy in the first language is more established, tends to produce better long-term results.\"",
      "Örnek konu: \"It is often said that scientific research should be funded by governments rather than private companies, since private funding may distort research priorities. To what extent do you agree?\"\nÖrnek tez cümlesi: \"While private funding does carry a genuine risk of skewing research towards commercially profitable outcomes, I believe a carefully regulated mix of public and private funding, rather than public funding alone, best serves the long-term interests of scientific progress.\" Bu zor örnekte tez, sorunun önerdiği iki kutuplu çözümü (yalnızca devlet YA DA yalnızca özel sektör) reddederek dengeli bir üçüncü pozisyon sunuyor — bu, ileri seviye bir tez stratejisidir.",
    ],
    "ielts-speaking-part1": [
      "Örnek soru: \"Do you prefer to spend your free time indoors or outdoors?\"\nÖrnek cevap: \"I'd say I prefer outdoor activities, especially hiking. There's something refreshing about being in nature after a long week of studying.\" (Kısa gerekçe + kişisel örnek.)",
      "Örnek soru: \"What kind of music do you usually listen to?\"\nÖrnek cevap: \"Mostly acoustic and indie music, to be honest. I find it helps me relax, especially when I'm studying or trying to unwind after work.\" (Tür + kişisel neden.)",
      "Örnek soru: \"How often do you use public transport?\"\nÖrnek cevap: \"Pretty much every day, actually — I take the metro to university since it's faster than driving and I don't have to worry about parking.\" (Sıklık + pratik gerekçe.)",
      "Örnek soru: \"Do you enjoy cooking?\"\nÖrnek cevap: \"I do, although I wouldn't call myself particularly skilled at it. I mainly enjoy trying out new recipes on weekends when I have more time.\" (Dürüst öz-değerlendirme + bağlam.)",
      "Örnek soru: \"What is your favourite season of the year?\"\nÖrnek cevap: \"Autumn, without a doubt. I love the cooler weather and the way the leaves change colour — it just feels like a fresh start somehow.\" (Tercih + duygusal/estetik gerekçe.)",
      "Örnek soru: \"Do you prefer reading books or watching films?\"\nÖrnek cevap: \"It depends on my mood, really, but if I had to choose, I'd say films, simply because they fit more easily into my schedule than a whole novel would.\" (Koşullu cevap + pratik gerekçe — tek bir kesin cevap vermek zorunlu değildir.)",
      "Örnek soru: \"What did you do last weekend?\"\nÖrnek cevap: \"Not much, actually — I mostly caught up on sleep and spent Sunday afternoon at a café with a couple of friends.\" (Geçmiş zaman kullanımı + kısa detay.)",
      "Örnek soru: \"Is there a lot of traffic in the area where you live?\"\nÖrnek cevap: \"Unfortunately, yes, especially during rush hour. It's one of the main reasons I've started cycling to work instead of driving.\" (Olumsuz durum + kişisel çözüm.)",
      "Örnek soru: \"Do you think it's important to learn about your country's history?\"\nÖrnek cevap: \"I think it is, yes, because understanding the past really helps explain a lot about how our society works today.\" (Görüş + gerekçe — Part 1'de bile basit bir gerekçelendirme beklenir.)",
      "Örnek soru: \"What's one thing you'd like to change about your daily routine?\"\nÖrnek cevap: \"Honestly, I'd like to wake up earlier. I always tell myself I will, but somehow I end up staying up too late scrolling through my phone.\" (Kişisel itiraf + doğal, esprili ton — bu tarz cevaplar akıcılığı ve doğallığı gösterir.)",
    ],
    "ielts-speaking-part2": [
      "Örnek kart: \"Describe a skill you would like to learn. You should say: what it is, why you want to learn it, how you would learn it, and how it would benefit you.\"\nÖrnek yapı: konuyu tanıtın, sırayla her alt maddeye değinin, kişisel bir gözlemle bitirin.",
      "Örnek kart: \"Describe a place you visited that left a strong impression on you. You should say: where it was, when you went there, who you went with, and why it impressed you.\"\nÖrnek yapı: yeri kısaca tanıtıp ne zaman ve kiminle gittiğinizi anlatın, ardından bu yerin sizde bıraktığı etkiyi somut bir detayla (bir manzara, bir an, bir ses) canlandırın.",
      "Örnek kart: \"Describe a person who has influenced you in a positive way. You should say: who this person is, how you know them, what they have done, and why they influenced you.\"\nÖrnek yapı: kişiyi tanıtın, onunla ilişkinizi açıklayın, somut bir örnek olay anlatın, son olarak bu kişinin sizi nasıl değiştirdiğini belirtin.",
      "Örnek kart: \"Describe a piece of technology you find useful. You should say: what it is, how often you use it, what you use it for, and why you find it useful.\"\nÖrnek yapı: cihazı/uygulamayı tanıtın, kullanım sıklığını ve amacını belirtin, ardından bunun hayatınızı nasıl kolaylaştırdığına dair somut bir örnek verin.",
      "Örnek kart: \"Describe a memorable meal you had. You should say: what you ate, where you had it, who you were with, and why it was memorable.\"\nÖrnek yapı: yemeği ve mekânı tanıtın, kiminle olduğunuzu belirtin, ardından bu deneyimi unutulmaz kılan spesifik bir detaya (bir tat, bir konuşma, bir sürpriz) odaklanın.",
      "Örnek kart: \"Describe a book you have read that you would recommend to others. You should say: what it is about, when you read it, why you decided to read it, and why you would recommend it.\"\nÖrnek yapı: kitabı ve konusunu kısaca özetleyin, okuma nedeninizi belirtin, ardından kitabın sizi neden etkilediğini ve başkalarına neden önereceğinizi açıklayın.",
      "Örnek kart: \"Describe an important decision you made. You should say: what the decision was, when you made it, what alternatives you considered, and why it was important.\"\nÖrnek yapı: kararı ve zamanlamasını belirtin, düşündüğünüz diğer seçenekleri kısaca anlatın, ardından bu kararın hayatınızdaki önemini somut bir sonuçla açıklayın.",
      "Örnek kart: \"Describe a festival or celebration that is important in your country. You should say: what it is, when it takes place, how people celebrate it, and why it is important.\"\nÖrnek yapı: festivali tanıtın, ne zaman ve nasıl kutlandığını anlatın, ardından bu kutlamanın toplumsal veya kişisel önemine değinin.",
      "Örnek kart: \"Describe a time when you helped someone. You should say: who you helped, what the situation was, what you did, and how you felt about it.\"\nÖrnek yapı: durumu ve kişiyi tanıtın, ne yaptığınızı sırayla anlatın, son olarak bu deneyimin size nasıl hissettirdiğini kısaca ifade edin.",
      "Örnek kart: \"Describe a change you would like to see in your hometown. You should say: what the change is, why it is needed, how it could be achieved, and how it would benefit the community.\"\nÖrnek yapı: bu zor kartta soyut bir konu (toplumsal değişim) somut örneklerle desteklenmelidir; değişikliği tanımlayın, gerekçesini somut bir gözlemle açıklayın, nasıl gerçekleştirilebileceğine dair kısa bir öneri sunun ve son olarak toplumsal faydasını belirtin.",
    ],
    "ielts-speaking-part3": [
      "Örnek soru (Part 2'de 'bir hediye'den bahsedildiyse): \"Why do you think people give gifts on special occasions?\"\nÖrnek cevap: \"I think gift-giving serves several social functions — it strengthens relationships and, in many cultures, is tied to notions of reciprocity and social obligation.\" (Genelleme + gerekçe.)",
      "Örnek soru (Part 2'de 'bir kitap'tan bahsedildiyse): \"Do you think reading habits have changed in recent years?\"\nÖrnek cevap: \"Definitely — I'd say people now consume much shorter pieces of content, largely because of smartphones, though I don't think this necessarily means people read less overall, just differently.\" (Genelleme + karşıt görüşe dengeli yaklaşım.)",
      "Örnek soru (Part 2'de 'önemli bir karar'dan bahsedildiyse): \"Do you think young people today find it harder to make major life decisions than previous generations?\"\nÖrnek cevap: \"In some ways, yes — I think the sheer number of options available today, whether in careers or lifestyles, can actually make decision-making more overwhelming than it was for previous generations.\" (Karşılaştırma + neden-sonuç.)",
      "Örnek soru (Part 2'de 'bir festival'den bahsedildiyse): \"How important is it for a country to preserve its traditional festivals?\"\nÖrnek cevap: \"I'd argue it's quite important, since these events often serve as one of the few remaining links to a shared cultural identity, particularly in an increasingly globalised world.\" (Görüş + geniş toplumsal bağlam.)",
      "Örnek soru (Part 2'de 'faydalı bir teknoloji'den bahsedildiyse): \"Do you think older people find it more difficult to adapt to new technology than younger people?\"\nÖrnek cevap: \"Generally speaking, yes, though I think this has less to do with age itself and more to do with how much exposure someone has had to similar technologies earlier in life.\" (Genel görüş + ince ayrım/nüans.)",
      "Örnek soru (Part 2'de 'yardım ettiğiniz biri'nden bahsedildiyse): \"Do you think people are generally less willing to help strangers in big cities compared to smaller towns?\"\nÖrnek cevap: \"I think there's some truth to that, though I'd attribute it more to the pace and anonymity of city life than to any real difference in people's underlying willingness to help.\" (Kısmi katılım + alternatif açıklama sunma.)",
      "Örnek soru (Part 2'de 'etkileyici bir kişi'den bahsedildiyse): \"What qualities do you think make someone a good role model?\"\nÖrnek cevap: \"I'd say consistency between what someone says and what they actually do is probably the most important quality, since that's ultimately what earns genuine respect rather than admiration from a distance.\" (Soyut nitelik + gerekçe.)",
      "Örnek soru (Part 2'de 'küçük bir kasabadaki değişim'den bahsedildiyse): \"What are the advantages and disadvantages of rapid urban development for small towns?\"\nÖrnek cevap: \"On the one hand, development can bring jobs and better infrastructure, but on the other, it often comes at the cost of the community character that made the town appealing in the first place.\" (İki taraflı analiz.)",
      "Örnek soru (Part 2'de 'unutulmaz bir yemek'ten bahsedildiyse): \"Do you think traditional cuisines are at risk of disappearing due to globalisation?\"\nÖrnek cevap: \"To some extent, yes, particularly among younger generations in urban areas, though I'd also point out that globalisation has, somewhat paradoxically, made traditional cuisines more visible internationally than ever before.\" (Karmaşık/çelişkili görüş — paradoks vurgusu.)",
      "Örnek soru (Part 2'de 'öğrenmek istediğiniz bir beceri'den bahsedildiyse): \"Do you think schools should focus more on practical skills rather than academic subjects?\"\nÖrnek cevap: \"I don't think it needs to be an either-or situation — the challenge, in my view, is less about choosing between the two and more about how effectively a curriculum can integrate practical skills alongside a solid academic foundation.\" (Zor soru — ikili karşıtlığı reddedip senteze dayalı bir cevap sunma; bu, Part 3'te en yüksek puanı alan cevap türüdür.)",
    ],
  };
  for (const [index, def] of ieltsTopicDefs.entries()) {
    const meta = ieltsTopicMeta[def.slug];
    const topic = await db.examTopic.upsert({
      where: { examTypeId_slug: { examTypeId: examTypes.IELTS.id, slug: def.slug } },
      update: { name: def.name, description: def.description, questionCount: def.questionCount, displayOrder: index, ...meta },
      create: { examTypeId: examTypes.IELTS.id, slug: def.slug, name: def.name, description: def.description, questionCount: def.questionCount, displayOrder: index, ...meta },
    });

    const ieltsLessons = [...def.lessons, { title: "Örnek Sorular", durationMinutes: 6, contentBody: formatExamples(ieltsExamples[def.slug]) }];
    for (const [lessonIndex, lessonDef] of ieltsLessons.entries()) {
      const existingLesson = await db.topicLesson.findFirst({ where: { topicId: topic.id, position: lessonIndex } });
      if (existingLesson) {
        await db.topicLesson.update({ where: { id: existingLesson.id }, data: { title: lessonDef.title, durationMinutes: lessonDef.durationMinutes, contentBody: lessonDef.contentBody } });
      } else {
        await db.topicLesson.create({ data: { topicId: topic.id, position: lessonIndex, title: lessonDef.title, durationMinutes: lessonDef.durationMinutes, contentBody: lessonDef.contentBody } });
      }
    }
  }

  console.log("Seed complete.");
  console.log(`Teacher login: hoca@canniceenglish.com / ${process.env.CANNICE_TEACHER_PASSWORD || "CanniceTeacher2026!"}`);
  console.log(`Student login: ogrenci@canniceenglish.com / ${process.env.CANNICE_STUDENT_PASSWORD || "CanniceStudent2026!"}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
