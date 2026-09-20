import "dotenv/config";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { seedDiagnosticJourney } from "./seed-diagnostics";

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
    { slug: "tense-sorulari", name: "Tense (Zaman) Soruları", questionCount: 6, difficulty: "Zor" },
    { slug: "preposition-sorulari", name: "Preposition (Edat) Soruları", questionCount: 4, difficulty: "Zor" },
    { slug: "cloze-test", name: "Cloze Test Soruları", questionCount: 10, difficulty: "Zor" },
    { slug: "cumle-tamamlama", name: "Cümle Tamamlama Soruları", questionCount: 10, difficulty: "Orta" },
    { slug: "ceviri", name: "Çeviri Soruları", questionCount: 6, difficulty: "Zor" },
    { slug: "paragraf", name: "Paragraf Soruları", questionCount: 20, difficulty: "Orta" },
    { slug: "diyalog-tamamlama", name: "Diyalog Tamamlama Soruları", questionCount: 5, difficulty: "Kolay" },
    { slug: "yakin-anlamli-cumle", name: "Yakın Anlamlı Cümle Soruları", questionCount: 4, difficulty: "Orta" },
    { slug: "paragraf-tamamlama", name: "Paragraf Tamamlama Soruları", questionCount: 4, difficulty: "Orta" },
    { slug: "anlatim-butunlugunu-bozan-cumle", name: "Anlatım Bütünlüğünü Bozan Cümle Soruları", questionCount: 5, difficulty: "Zor" },
    { slug: "yds-stratejileri", name: "YDS Stratejileri", questionCount: null, difficulty: null },
  ];
  const ydsExamples = {
    "yds-stratejileri": [],
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
      "Örnek soru: \"If the construction crew doesn't speed up, they will ---- time before the contractual deadline.\"\n(A) keep up with (B) put up with (C) come up against (D) run out of\nDoğru cevap (D) 'run out of' (tükenmek/kalmamak) — inşaat ekibi hızlanmazsa sözleşme süresinden ÖNCE zamanlarının TÜKENECEĞİ anlatılıyor; 'keep up with' (yetişmek), 'put up with' (katlanmak) ve 'come up against' (bir engelle karşılaşmak) bağlamla tam örtüşmez.",
      "Örnek soru: \"The board decided to ---- the merger offer after concluding it undervalued the company.\"\n(A) turn down (B) take up (C) look after (D) come across\nDoğru cevap (A) 'turn down' (reddetmek) — 'undervalued the company' (şirketi değerinin altında değerlendirdi) ifadesi teklifin REDDEDİLDİĞİNİ gösterir; diğer seçenekler 'üstlenmek', 'ilgilenmek', 'rastlamak' anlamlarıyla bağlama uymaz.",
      "Örnek soru: \"While her parents were traveling abroad, she had to ---- her younger siblings for two weeks.\"\n(A) look after (B) look into (C) look down on (D) look forward to\nDoğru cevap (A) 'look after' (bakmak/ilgilenmek) — ebeveynleri seyahatteyken KARDEŞLERİNE BAKMASI gerektiği anlatılıyor; diğer 'look' öbekleri 'araştırmak', 'küçümsemek', 'dört gözle beklemek' anlamlarıyla bağlama uymaz.",
      "Örnek soru: \"While cleaning out the attic, she ---- a collection of letters her grandmother had written during the war.\"\n(A) came across (B) came up with (C) came down with (D) came along\nDoğru cevap (A) 'came across' (rastlamak/tesadüfen bulmak) — çatıyı temizlerken BEKLENMEDİK ŞEKİLDE mektuplara rastlaması anlatılıyor; diğer seçenekler 'bulmak/geliştirmek (fikir)', 'hastalanmak', 'birlikte gelmek' anlamlarıyla bağlama uymaz.",
      "Örnek soru: \"The doctor advised him to ---- sugar and processed foods to lower his blood pressure.\"\n(A) cut down on (B) cut off (C) cut in (D) cut up\nDoğru cevap (A) 'cut down on' (azaltmak) — tansiyonu düşürmek için şeker ve işlenmiş gıda TÜKETİMİNİ AZALTMASI öneriliyor; diğer öbekler 'kesmek/bağlantıyı koparmak', 'araya girmek', 'küçük parçalara bölmek' anlamlarıyla bağlama uymaz.",
      "Örnek soru: \"The small bookstore struggled to ---- the rapid rise of online retailers.\"\n(A) keep up with (B) put up with (C) come up with (D) catch up on\nDoğru cevap (A) 'keep up with' (ayak uydurmak/yetişmek) — küçük kitapçının online perakendecilerin hızlı yükselişine AYAK UYDURMAKTA zorlandığı anlatılıyor; 'put up with' (katlanmak), 'come up with' (bulmak) ve 'catch up on' (geriden gelen bir işi tamamlamak) bağlama uymaz.",
      "Örnek soru: \"It took the engineers several days to ---- why the new software kept crashing.\"\n(A) figure out (B) look out (C) turn out (D) work up\nDoğru cevap (A) 'figure out' (çözmek/anlamak) — mühendislerin yazılımın neden ÇÖKTÜĞÜNÜ ÇÖZMEYE çalıştığı anlatılıyor; diğer seçenekler 'dikkat etmek', 'ortaya çıkmak/sonuçlanmak', 'geliştirmek/kışkırtmak' anlamlarıyla bağlama uymaz.",
      "Örnek soru: \"The two friends decided to ---- their own consulting firm after leaving the corporate world.\"\n(A) set up (B) set off (C) set out (D) set aside\nDoğru cevap (A) 'set up' (kurmak) — iki arkadaşın şirketten ayrıldıktan sonra kendi danışmanlık firmalarını KURMAYA karar verdiği anlatılıyor; 'set off' (yola çıkmak), 'set out' (yola çıkmak/belirtmek) ve 'set aside' (bir kenara ayırmak) bağlama uymaz.",
      "Örnek soru: \"During the review, the editor ---- several inconsistencies in the manuscript's timeline.\"\n(A) pointed out (B) gave away (C) put out (D) put down\nDoğru cevap (A) 'pointed out' (belirtmek/dikkat çekmek) — editörün metindeki tutarsızlıkları BELİRTTİĞİ anlatılıyor; diğer seçenekler 'sırrını açıklamak/karşılıksız vermek', 'söndürmek', 'yere koymak/eleştirmek' anlamlarıyla bağlama uymaz.",
      "Örnek soru: \"After discussing the budget for hours, the committee finally managed to ---- a compromise.\"\n(A) work out (B) work on (C) work up (D) work off\nDoğru cevap (A) 'work out' (çözmek/bir sonuca ulaşmak) — komitenin saatlerce tartıştıktan sonra bir UZLAŞMAYA VARDIĞI anlatılıyor; 'work on' (üzerinde çalışmak), 'work up' (geliştirmek/kışkırtmak) ve 'work off' (kilo/enerji vererek atmak) bağlama uymaz.",
      "Örnek soru: \"The company had to ---- a difficult restructuring process to avoid bankruptcy.\"\n(A) go through (B) go over (C) go along with (D) go off\nDoğru cevap (A) 'go through' (bir süreçten geçmek/yaşamak) — şirketin iflası önlemek için zorlu bir yeniden yapılanma SÜRECİNDEN GEÇMESİ gerektiği anlatılıyor; 'go over' (gözden geçirmek), 'go along with' (bir fikre katılmak) ve 'go off' (alarmın çalması/patlamak) bağlama uymaz.",
      "Örnek soru: \"It took her almost a year to ---- the shock of losing her closest friend.\"\n(A) get over (B) get through (C) get away with (D) get along with\nDoğru cevap (A) 'get over' (atlatmak, özellikle duygusal bir sarsıntıyı) — yakın arkadaşının kaybının verdiği ŞOKU ATLATMASININ neredeyse bir yıl sürdüğü anlatılıyor; 'get away with' (cezasız kalmak) ve 'get along with' (iyi geçinmek) anlamca hiç uymaz, 'get through' ise daha çok zorlu bir SÜREÇ veya SINAVI tamamlamak için kullanılır.",
      "Örnek soru: \"After thirty years running the family business, she decided to ---- control to her daughter.\"\n(A) hand over (B) hand in (C) hand out (D) hand down\nDoğru cevap (A) 'hand over' (devretmek) — otuz yıl sonra işin YÖNETİMİNİ kızına DEVRETMEYE karar verdiği anlatılıyor; 'hand in' (teslim etmek, genellikle bir belge/ödev için), 'hand out' (ücretsiz dağıtmak) ve 'hand down' (miras olarak bırakmak, genellikle nesiller arası eşya/gelenek için) bağlama tam uymaz.",
      "Örnek soru: \"The board meeting had to ---- early after the fire alarm went off unexpectedly.\"\n(A) break up (B) break down (C) break in (D) break through\nDoğru cevap (A) 'break up' (dağılmak/sona ermek) — yangın alarmı çalınca toplantının ERKEN DAĞILMAK ZORUNDA KALDIĞI anlatılıyor; 'break down' (bozulmak/duygusal çöküş), 'break in' (zorla girmek) ve 'break through' (bir engeli aşmak) bağlama uymaz.",
      "Örnek soru: \"Due to the heavy snowstorm, the organizers had no choice but to ---- the outdoor concert.\"\n(A) call off (B) call on (C) call out (D) call up\nDoğru cevap (A) 'call off' (iptal etmek) — şiddetli kar fırtınası nedeniyle organizatörlerin açık hava konserini İPTAL ETMEK ZORUNDA KALDIĞI anlatılıyor; 'call on' (ziyaret etmek/çağrıda bulunmak), 'call out' (yüksek sesle söylemek/eleştirmek) ve 'call up' (telefon etmek/askere çağırmak) bağlama uymaz.",
      "Örnek soru: \"The doctors were initially worried, but the patient managed to ---- after a week in intensive care.\"\n(A) pull through (B) pull down (C) pull out (D) pull up\nDoğru cevap (A) 'pull through' (iyileşmek/atlatmak) — hasta hakkında endişe duyulmasına rağmen, yoğun bakımda bir haftadan sonra İYİLEŞMEYİ BAŞARDIĞI anlatılıyor; 'pull down' (yıkmak), 'pull out' (bir yerden/işten çekilmek) ve 'pull up' (bir aracın durması) bağlama uymaz.",
      "Örnek soru: \"Nobody wanted to ---- the topic of layoffs during the celebratory dinner.\"\n(A) bring up (B) bring about (C) bring back (D) bring out\nDoğru cevap (A) 'bring up' (bir konuyu gündeme getirmek) — kutlama yemeğinde kimsenin işten çıkarmalar konusunu AÇMAK istemediği anlatılıyor; 'bring about' (neden olmak), 'bring back' (geri getirmek) ve 'bring out' (piyasaya sürmek/ortaya çıkarmak) bağlama uymaz.",
      "Örnek soru: \"At the last minute, the investor decided to ---- the deal, leaving the startup without funding.\"\n(A) back out of (B) back up (C) back down (D) back away\nDoğru cevap (A) 'back out of' (bir anlaşmadan cayıp vazgeçmek) — yatırımcının son anda ANLAŞMADAN CAYDIĞI ve girişimi fonsuz bıraktığı anlatılıyor; 'back up' (desteklemek/yedeklemek), 'back down' (geri adım atmak, genellikle bir tartışmada) ve 'back away' (fiziksel olarak geri çekilmek) bağlama tam uymaz.",
      "Örnek soru: \"Years of working double shifts eventually began to ---- even the most dedicated nurses.\"\n(A) wear out (B) wear off (C) wash out (D) work out\nDoğru cevap (A) 'wear out' (yıpratmak/bitkin düşürmek) — çift mesai yapmanın en özverili hemşireleri bile ZAMANLA YIPRATTIĞI/BİTKİN DÜŞÜRDÜĞÜ anlatılıyor; 'wear off' (bir etkinin zamanla azalması, örn. ilaç etkisi), 'wash out' (yıkayarak çıkarmak) ve 'work out' (çözmek/spor yapmak) bağlama uymaz.",
      "Örnek soru: \"After reviewing the evidence, detectives were able to ---- robbery as a motive.\"\n(A) rule out (B) rule over (C) run out (D) reach out\nDoğru cevap (A) 'rule out' (bir olasılığı dışlamak/elemek) — dedektiflerin kanıtları inceledikten sonra soygun motifini OLASILIK DIŞI BIRAKTIĞI anlatılıyor; 'rule over' (yönetmek/hükmetmek), 'run out' (tükenmek) ve 'reach out' (iletişime geçmek) bağlama uymaz.",
      "Örnek soru: \"Everyone says she ---- her grandmother, both in appearance and in her stubborn personality.\"\n(A) takes after (B) takes over (C) takes on (D) takes in\nDoğru cevap (A) 'takes after' (birine benzemek, genellikle bir akrabaya) — hem görünüş hem de inatçı kişilik açısından BÜYÜKANNESİNE BENZEDİĞİ anlatılıyor; 'takes over' (devralmak), 'takes on' (üstlenmek/işe almak) ve 'takes in' (içine almak/kandırmak) bağlama uymaz."
    ],
    "tense-sorulari": [
      "Örnek soru: \"By the time the ambulance arrived, the patient ---- already ---- consciousness.\"\n(A) has / lost (B) had / lost (C) was / losing (D) will / lose\nDoğru cevap (B) 'had lost' — 'by the time' ile geçmişte bir olaydan ÖNCE tamamlanmış başka bir eylemi anlatan Past Perfect zamanı kullanılır.",
      "Örnek soru: \"She ---- as a translator ---- she graduated from university five years ago.\"\n(A) has worked / since (B) worked / for (C) is working / since (D) had worked / for\nDoğru cevap (A) 'has worked / since' — eylem geçmişte başlayıp HALEN devam ettiği için Present Perfect kullanılır; başlangıç noktasını belirten bir zaman ifadesinden önce 'since' gelir, süre ifadesinden önce ise 'for' kullanılır.",
      "Örnek soru: \"----, we ---- more than five different suppliers this year.\"\n(A) Until December / contact (B) Since December / have contacted (C) By December / will have contacted (D) During December / were contacting\nDoğru cevap (C) 'By December / will have contacted' — 'by + zaman' ifadesi gelecekte bir noktaya KADAR tamamlanmış olacak bir eylemi anlatır, bu yüzden Future Perfect ('will have + V3') gerekir.",
      "Örnek soru: \"If the manager ---- the report more carefully last week, the error ---- before the client complained.\"\n(A) reviewed / would be caught (B) had reviewed / would have been caught (C) reviews / will be caught (D) would review / was caught\nDoğru cevap (B) 'had reviewed / would have been caught' — cümle GEÇMİŞTE gerçekleşmemiş bir koşulu (Type 3 Conditional) anlatır; koşul cümlesinde Past Perfect, sonuç cümlesinde ise 'would have + V3' edilgen yapısı kullanılır.",
      "Örnek soru: \"The witness told the police that she ---- the suspect near the bank an hour before the robbery ----.\"\n(A) has seen / occurs (B) saw / has occurred (C) had seen / had occurred (D) sees / occurred\nDoğru cevap (C) 'had seen / had occurred' — dolaylı anlatımda, ana cümledeki 'told' geçmiş zaman olduğu için ve tanığın gördüğü olay soygundan da ÖNCE gerçekleştiği için her iki fiil de Past Perfect'e kaydırılır.",
      "Örnek soru: \"I can't come to the meeting tomorrow because I ---- my grandmother at the airport at that exact time.\"\n(A) pick up (B) picked up (C) am picking up (D) have picked up\nDoğru cevap (C) 'am picking up' — 'tomorrow... at that exact time' ifadesiyle belirtilen, gelecekte KESİN olarak planlanmış bir düzenlemeyi anlatmak için Present Continuous kullanılır.",
      "Örnek soru: \"By the time help arrived, the climbers ---- for nearly six hours without food or water.\"\n(A) were waiting (B) have been waiting (C) had been waiting (D) waited\nDoğru cevap (C) 'had been waiting' — geçmişte bir NOKTAYA (yardımın gelişi) KADAR devam eden bir sürecin SÜRESİNİ vurgulamak için Past Perfect Continuous kullanılır.",
      "Örnek soru: \"This time next week, we ---- on a beach in Antalya instead of sitting in this office.\"\n(A) will be lying (B) will have lain (C) are lying (D) lay\nDoğru cevap (A) 'will be lying' — 'this time next week' ifadesi, gelecekte belirli bir ANDA devam ediyor olacak bir eylemi işaret eder; bu yüzden Future Continuous kullanılır.",
      "Örnek soru: \"I ---- this book twice already, but I still don't understand the ending.\"\n(A) read (B) have read (C) was reading (D) had read\nDoğru cevap (B) 'have read' — eylemin tam olarak NE ZAMAN gerçekleştiği belirtilmiyor ve sonucu ŞİMDİKİ ZAMANLA ilgili olduğu için (hâlâ anlamıyor) Present Perfect kullanılır.",
      "Örnek soru: \"If she ---- more languages, she ---- for that international position last year.\"\n(A) spoke / would have applied (B) had spoken / would apply (C) speaks / will apply (D) would speak / had applied\nDoğru cevap (A) 'spoke / would have applied' — bu bir KARIŞIK KOŞUL (mixed conditional) cümlesidir: şimdiki zamanda devam eden bir GERÇEK (dil bilmemesi) ile geçmişte gerçekleşmemiş bir SONUCU (başvuramaması) birleştirir; koşul kısmında Simple Past, sonuç kısmında 'would have + V3' kullanılır.",
      "Örnek soru: \"The shipment ---- lost in transit; the tracking number shows it was delivered to the warehouse yesterday.\"\n(A) can't have been (B) should have been (C) must have been (D) needn't have been\nDoğru cevap (A) 'can't have been' — 'the tracking number shows it was delivered' ifadesi kaybolma ihtimalinin İMKÂNSIZ olduğunu kanıtlar; bu yüzden geçmişe yönelik olumsuz kesin çıkarım bildiren 'can't have been' doğru seçenektir; diğerleri ya olumlu çıkarım ya da tavsiye/gereksizlik anlamı taşıyıp bağlama uymaz.",
      "Örnek soru: \"I ---- an umbrella this morning; now I'm completely soaked from the sudden downpour.\"\n(A) must have taken (B) should have taken (C) can't have taken (D) needn't have taken\nDoğru cevap (B) 'should have taken' — cümlenin ikinci yarısındaki 'now I'm completely soaked' sonucu, konuşmacının geçmişte yapması gereken ama yapmadığı bir eylem için PİŞMANLIK duyduğunu gösterir; diğer seçenekler çıkarım ya da gereksizlik anlamı taşıyıp bağlama uymaz.",
      "Örnek soru: \"Before any new drug ---- to the public, it ---- through several rounds of clinical trials.\"\n(A) is released / must have been put (B) will release / must put (C) is released / must be put (D) releases / is putting\nDoğru cevap (C) 'is released / must be put' — cümle genel bir KURAL/PROSEDÜR bildiriyor (Type 0 mantığı) ve ikinci boşlukta ilacın DENEMELERDEN GEÇİRİLMESİ gerektiği edilgen ve zorunluluk anlamıyla ifade edilmelidir; bu yüzden 'must be put' (modal + edilgen) doğru yapıdır, diğer seçenekler zaman ya da çatı (aktif/pasif) bakımından uyumsuzdur.",
      "Örnek soru: \"If the treaty ---- one week earlier, thousands of soldiers ---- their lives on that final battlefield.\"\n(A) signed / would lose (B) had been signed / would not have lost (C) was signed / did not lose (D) is signed / will not lose\nDoğru cevap (B) 'had been signed / would not have lost' — cümle GEÇMİŞTE gerçekleşmemiş bir koşulu (Type 3 Conditional) anlatır; yan cümlecikte edilgen 'had been signed', ana cümlecikte 'would not have lost' kullanılması gerekir; diğer seçenekler zaman veya çatı bakımından bu yapıya uymaz.",
      "Örnek soru: \"We ---- so much food for the party; half of the guests cancelled at the last minute.\"\n(A) mustn't have prepared (B) needn't have prepared (C) shouldn't prepare (D) didn't need to prepare\nDoğru cevap (B) 'needn't have prepared' — yemek zaten HAZIRLANMIŞ ama gereksiz olduğu ortaya çıkmıştır ('half of the guests cancelled'); bu durumda yapılmasına gerek olmayan ama yine de yapılmış bir eylemi bildiren 'needn't have prepared' doğru seçenektir; 'didn't need to prepare' ise eylemin hiç gerçekleşmediğini ima ettiği için bağlama uymaz.",
      "Örnek soru: \"By the time the probe reaches Jupiter, it ---- through space for almost six years.\"\n(A) will have been travelling (B) has travelled (C) was travelling (D) would travel\nDoğru cevap (A) 'will have been travelling' — 'by the time' zaman bağlacı ile gelecekte belirli bir NOKTAYA KADAR devam etmiş olacak bir sürecin SÜRESİ vurgulanıyor; bu yüzden Future Perfect Continuous kullanılır.",
      "Örnek soru: \"The CEO wishes she ---- the merger before the competitor made a better offer.\"\n(A) approved (B) had approved (C) approves (D) would approve\nDoğru cevap (B) 'had approved' — cümle GEÇMİŞTE yapılmayan bir eylem için duyulan pişmanlığı anlatır; 'wish' yapısından sonra geçmişe yönelik pişmanlık bildirmek için Past Perfect ('had approved') kullanılır.",
      "Örnek soru: \"---- I in your position, I would negotiate a higher salary before accepting the offer.\"\n(A) Should (B) Were (C) Had (D) Am\nDoğru cevap (B) 'Were' — cümle şu anki gerçeğin tersini anlatan bir Type 2 Conditional'ın DEVRİK halidir; 'if' düşürülüp yardımcı fiil başa alındığında Type 2'de 'were' ile başlanır; diğer seçenekler sırasıyla Type 1 ve Type 3 devriklerine ya da uyumsuz bir yapıya aittir.",
      "Örnek soru: \"Researchers ---- the vaccine's effectiveness for over a year, but they ---- the final results only last week.\"\n(A) have tested / published (B) tested / have published (C) test / were publishing (D) had tested / publish\nDoğru cevap (A) 'have tested / published' — 'for over a year' ifadesi geçmişten şimdiye uzanan bir süreci gösterdiği için Present Perfect gerekir; 'last week' ise belirli bir geçmiş zaman noktası olduğundan Past Simple gerekir.",
      "Örnek soru: \"You ---- the deadline if you had asked for help earlier instead of trying to finish everything alone.\"\n(A) must have met (B) could have met (C) needn't have met (D) can't have met\nDoğru cevap (B) 'could have met' — cümle Type 3 Conditional mantığıyla geçmişte KAÇIRILAN BİR FIRSATI anlatıyor ('yapabilirdin ama yapmadın'); diğer seçenekler çıkarım ya da gereksizlik anlamı taşıyıp bu bağlama uymaz.",
      "Örnek soru: \"The ancient fortress ---- by invaders several times before it ---- into the museum it is today.\"\n(A) has attacked / had been converted (B) had been attacked / was converted (C) attacked / converts (D) was attacking / has converted\nDoğru cevap (B) 'had been attacked / was converted' — kalenin SALDIRIYA UĞRAMASI, müzeye ÇEVRİLMESİNDEN daha önce gerçekleştiği için ilk fiil Past Perfect Passive, ikinci fiil ise belirli bir geçmiş noktasında tamamlanan Past Simple Passive olmalıdır.",
      "Örnek soru: \"If the traffic ---- as bad as yesterday, we ---- able to reach the airport on time.\"\n(A) is / might not be (B) was / would not be (C) had been / would not have been (D) will be / are not\nDoğru cevap (A) 'is / might not be' — cümle GERÇEKLEŞMESİ MÜMKÜN bir gelecek koşulunu (Type 1) anlatıyor; yan cümlecikte Present Simple, ana cümlecikte 'might' gibi bir modal kullanılabilir.",
      "Örnek soru: \"---- the new manager took over the department, productivity levels ---- by nearly thirty percent.\"\n(A) Since / have increased (B) For / increased (C) During / has increased (D) Until / were increasing\nDoğru cevap (A) 'Since / have increased' — 'since' bir başlangıç noktasını (yeni müdürün göreve gelmesi) işaret eder ve yan cümlecikte Past Simple, ana cümlecikte 'have/has V3' (Present Perfect) gerektirir.",
      "Örnek soru: \"The lab's sensors show a sudden temperature spike, so the reaction ---- faster than the scientists predicted.\"\n(A) must be happening (B) must have happened (C) can't be happening (D) should happen\nDoğru cevap (A) 'must be happening' — sensörlerin ŞU ANDA gösterdiği veriler, reaksiyonun O ANDA devam ettiğine dair güçlü bir çıkarım sağlar; bu yüzden 'must be V-ing' yapısı kullanılır, geçmişe yönelik bir çıkarım söz konusu değildir.",
      "Örnek soru: \"Since the accident damaged the windshield badly, she ---- it ---- at a garage near her office.\"\n(A) had / replaced (B) has / replacing (C) was / replace (D) had been / to replace\nDoğru cevap (A) 'had / replaced' — cümle bir ETTİRGEN YAPI (causative) anlatır: özne camı kendisi değiştirmemiş, birine YAPTIRMIŞTIR; bu yüzden 'have + nesne + V3' kalıbı ('had it replaced') doğru yapıdır.",
      "Örnek soru: \"If the explorers ---- better equipment, they ---- much further into the frozen continent right now.\"\n(A) had had / would be (B) have / will be (C) had / would have been (D) have had / were\nDoğru cevap (A) 'had had / would be' — bu bir KARIŞIK KOŞUL (mixed conditional) cümlesidir: geçmişteki bir eksiklik (donanımın yetersizliği) ile ŞU ANKİ bir sonucu (şu an daha ileride olmamaları) birleştirir; yan cümlecikte Past Perfect, ana cümlecikte 'would + V0' kullanılır.",
      "Örnek soru: \"Don't call me at nine; I ---- the children to school at that exact time.\"\n(A) will take (B) will be taking (C) will have taken (D) take\nDoğru cevap (B) 'will be taking' — 'at that exact time' ifadesi gelecekte belirli bir ANDA devam ediyor olacak bir eylemi işaret eder; bu yüzden Future Continuous kullanılır.",
      "Örnek soru: \"If only the board ---- the warning signs in the quarterly report before the company went bankrupt.\"\n(A) noticed (B) has noticed (C) had noticed (D) would notice\nDoğru cevap (C) 'had noticed' — 'if only' yapısı 'I wish' ile aynı anlamı taşır ve GEÇMİŞE yönelik bir pişmanlık bildirdiğinde Past Perfect ('had noticed') gerektirir.",
      "Örnek soru: \"This is the most detailed map of the ocean floor that scientists ---- so far.\"\n(A) produced (B) have produced (C) are producing (D) had produced\nDoğru cevap (B) 'have produced' — cümle bir SUPERLATIVE yapı ile başlayıp 'so far' (şu ana kadar) ifadesiyle devam ettiği için Present Perfect kullanılması gerekir.",
      "Örnek soru: \"---- you finish the report before five o'clock, please send it directly to the client.\"\n(A) If (B) Unless (C) Although (D) Since\nDoğru cevap (A) 'If' — cümle GERÇEKLEŞMESİ MÜMKÜN bir koşulu bildiriyor ve ana cümlecikte bir EMİR kipi kullanılmıştır; bu yapı yalnızca 'if' bağlacıyla mantıklı bir şart cümlesi oluşturur, diğer bağlaçlar anlamca uymaz."
    ],
    "preposition-sorulari": [
      "Örnek soru: \"The board holds the CEO personally responsible ---- the company's declining profits.\"\n(A) of (B) with (C) about (D) for\nDoğru cevap (D) 'for' — 'responsible' sıfatı her zaman 'for' edatıyla kullanılır ('sorumlu olmak'); diğer edatlar bu sıfatla birlikte kullanılmaz.",
      "Örnek soru: \"The conference is scheduled to take place ---- the morning ---- March 14th.\"\n(A) at / on (B) on / in (C) in / on (D) in / at\nDoğru cevap (C) 'in / on' — günün bölümlerinden bahsederken 'in the morning', belirli bir tarihten bahsederken ise 'on' edatı kullanılır.",
      "Örnek soru: \"Despite ---- for the exam for over a month, she still felt unprepared on the day.\"\n(A) studying (B) study (C) to study (D) studied\nDoğru cevap (A) 'studying' — 'despite' edatından sonra isim ya da isim-fiil (gerund) gelir, mastar veya çekimli fiil formu kullanılamaz.",
      "Örnek soru: \"The scientists are still looking ---- an explanation for the strange signal detected in deep space.\"\n(A) for (B) into (C) at (D) after\nDoğru cevap (A) 'for' — 'look for' bir şeyi ARAMAK anlamına gelir ve 'explanation' burada aranan şeydir; 'look into' bir konuyu araştırmak, 'look at' bakmak, 'look after' bakmak/ilgilenmek anlamındadır ve bağlama uymaz.",
      "Örnek soru: \"The new policy will apply ---- all employees, regardless of their department or seniority.\"\n(A) to (B) for (C) with (D) on\nDoğru cevap (A) 'to' — 'apply to' (bir şeye/birine uygulanmak) sabit bir edat kombinasyonudur; diğer edatlar bu fiille kullanılmaz.",
      "Örnek soru: \"She has been extremely patient ---- her younger brother's constant questions.\"\n(A) about (B) with (C) for (D) at\nDoğru cevap (B) 'with' — 'patient with' (birine/bir şeye karşı sabırlı olmak) sabit bir edat kombinasyonudur; diğer edatlar bu sıfatla birlikte kullanılmaz.",
      "Örnek soru: \"The professor's theory is based ---- decades of careful observation and experimentation.\"\n(A) in (B) at (C) on (D) with\nDoğru cevap (C) 'on' — 'based on' (bir şeye dayanmak) sabit bir edat kombinasyonudur; diğer edatlar bu fiille kullanılmaz.",
      "Örnek soru: \"Unemployment rates vary significantly ---- region, with rural areas often facing higher figures.\"\n(A) by (B) between (C) among (D) at\nDoğru cevap (A) 'by' — 'vary by' (bir ölçüte göre değişmek) sabit bir edat kombinasyonudur; diğer edatlar bu bağlamda kullanılmaz.",
      "Örnek soru: \"He was accused ---- leaking confidential information to a rival company.\"\n(A) for (B) of (C) with (D) about\nDoğru cevap (B) 'of' — 'accused of' (bir suçla itham edilmek) sabit bir edat kombinasyonudur; diğer edatlar bu fiille kullanılmaz.",
      "Örnek soru: \"The manager insisted ---- reviewing every contract personally before it was signed.\"\n(A) on (B) in (C) about (D) for\nDoğru cevap (A) 'on' — 'insist on' (bir konuda ısrar etmek) sabit bir edat kombinasyonudur; diğer edatlar bu fiille kullanılmaz.",
      "Örnek soru: \"The committee members were fully aware ---- the risks involved before approving the merger.\"\n(A) of (B) about (C) with (D) at\nDoğru cevap (A) 'of' — 'aware of' (bir şeyin farkında olmak) sabit bir edat kombinasyonudur; diğer edatlar bu sıfatla birlikte kullanılmaz.",
      "Örnek soru: \"Modern smartphones are capable ---- performing tasks that once required a full computer.\"\n(A) of (B) for (C) to (D) with\nDoğru cevap (A) 'of' — 'capable of' (bir şeyi yapabilecek durumda olmak) sabit bir edat kombinasyonudur; diğer edatlar bu sıfatla kullanılmaz.",
      "Örnek soru: \"Before the interview, make sure you are familiar ---- the company's recent projects.\"\n(A) with (B) to (C) of (D) about\nDoğru cevap (A) 'with' — 'familiar with' (bir şeye aşina olmak) sabit bir edat kombinasyonudur; diğer edatlar bu sıfatla kullanılmaz.",
      "Örnek soru: \"The symptoms of the new illness are strikingly similar ---- those of the common flu.\"\n(A) to (B) with (C) as (D) from\nDoğru cevap (A) 'to' — 'similar to' (bir şeye benzemek) sabit bir edat kombinasyonudur; diğer edatlar bu sıfatla kullanılmaz.",
      "Örnek soru: \"The customs in this region are quite different ---- those in the capital.\"\n(A) from (B) to (C) with (D) of\nDoğru cevap (A) 'from' — 'different from' bir sıfat + edat kombinasyonu olarak standart kullanımdır; diğer edatlar bu sıfatla kullanılmaz.",
      "Örnek soru: \"The investors were not entirely satisfied ---- the company's quarterly results.\"\n(A) with (B) of (C) for (D) about\nDoğru cevap (A) 'with' — 'satisfied with' (bir şeyden memnun olmak) sabit bir edat kombinasyonudur; diğer edatlar bu sıfatla kullanılmaz.",
      "Örnek soru: \"She has been married ---- a diplomat for over a decade, so she has lived in several countries.\"\n(A) to (B) with (C) for (D) at\nDoğru cevap (A) 'to' — 'married to' (biriyle evli olmak) sabit bir edat kombinasyonudur; diğer edatlar bu sıfatla kullanılmaz.",
      "Örnek soru: \"Whether the flight departs on time depends entirely ---- the weather conditions at the airport.\"\n(A) on (B) of (C) to (D) with\nDoğru cevap (A) 'on' — 'depend on' (bir şeye bağlı olmak) sabit bir edat kombinasyonudur; diğer edatlar bu fiille kullanılmaz.",
      "Örnek soru: \"Small island communities often rely heavily ---- fishing for their livelihood.\"\n(A) on (B) at (C) to (D) with\nDoğru cevap (A) 'on' — 'rely on' (güvenmek, dayanmak) sabit bir edat kombinasyonudur; diğer edatlar bu fiille kullanılmaz.",
      "Örnek soru: \"The exhibition ---- of more than two hundred rare manuscripts collected over five decades.\"\n(A) consists (B) exists (C) contains (D) includes\nDoğru cevap (A) 'consists' — 'consist of' (bir şeyden oluşmak) sabit bir fiil-edat kombinasyonudur ve cümledeki 'of' edatıyla eşleşen tek fiil 'consist'tir; diğer fiiller 'of' edatıyla bu anlamda kullanılmaz.",
      "Örnek soru: \"Despite years of criticism, the scientist never stopped believing ---- her controversial theory.\"\n(A) in (B) on (C) at (D) with\nDoğru cevap (A) 'in' — 'believe in' (bir şeye/birine inanmak) sabit bir edat kombinasyonudur; diğer edatlar bu fiille kullanılmaz.",
      "Örnek soru: \"Only a handful of climbers have ever succeeded ---- reaching the summit in winter.\"\n(A) in (B) at (C) on (D) with\nDoğru cevap (A) 'in' — 'succeed in' (bir şeyde başarılı olmak) sabit bir edat kombinasyonudur; diğer edatlar bu fiille kullanılmaz.",
      "Örnek soru: \"Passengers repeatedly complained ---- the lack of information during the delay.\"\n(A) about (B) of (C) for (D) with\nDoğru cevap (A) 'about' — 'complain about' (bir şeyden şikayet etmek) sabit bir edat kombinasyonudur; diğer edatlar bu fiille kullanılmaz.",
      "Örnek soru: \"Several shareholders strongly objected ---- the board's decision to relocate the factory.\"\n(A) to (B) for (C) at (D) with\nDoğru cevap (A) 'to' — 'object to' (bir şeye karşı çıkmak) sabit bir edat kombinasyonudur; diğer edatlar bu fiille kullanılmaz.",
      "Örnek soru: \"His colleagues didn't fully approve ---- the aggressive marketing strategy he proposed.\"\n(A) of (B) with (C) for (D) to\nDoğru cevap (A) 'of' — 'approve of' (bir şeyi onaylamak) sabit bir edat kombinasyonudur; diğer edatlar bu fiille kullanılmaz.",
      "Örnek soru: \"Many coastal towns in the region have been suffering ---- severe erosion for decades.\"\n(A) from (B) of (C) with (D) about\nDoğru cevap (A) 'from' — 'suffer from' (bir sorundan/hastalıktan muzdarip olmak) sabit bir edat kombinasyonudur; diğer edatlar bu fiille kullanılmaz.",
      "Örnek soru: \"The new safety regulations are expected to result ---- a significant drop in workplace accidents.\"\n(A) in (B) on (C) with (D) for\nDoğru cevap (A) 'in' — 'result in' (bir sonuca yol açmak) sabit bir edat kombinasyonudur; diğer edatlar bu fiille kullanılmaz.",
      "Örnek soru: \"Rather than covering every topic superficially, the course focuses ---- three key skills in depth.\"\n(A) on (B) at (C) to (D) with\nDoğru cevap (A) 'on' — 'focus on' (bir şeye odaklanmak) sabit bir edat kombinasyonudur; diğer edatlar bu fiille kullanılmaz.",
      "Örnek soru: \"The old library ---- generations of students have studied is finally being renovated.\"\n(A) which (B) in which (C) whose (D) who\nDoğru cevap (B) 'in which' — boşluktan sonra özne ('generations of students') ve fiil ('have studied') ile eksiksiz bir cümle geldiği için, nitelenen 'the old library' ismine ait edat ('in') relative pronoun'un önüne taşınmalıdır; tek başına 'which' bu tam cümlenin önünde edat işlevi göremez, 'whose' iyelik, 'who' ise insan bildirmediği için bu boşlukta kullanılamaz.",
      "Örnek soru: \"The engineer ---- I discussed the design flaw seemed unconvinced by my explanation.\"\n(A) who (B) which (C) with whom (D) whose\nDoğru cevap (C) 'with whom' — boşluktan sonra özne ('I') ve fiil ('discussed') ile tam bir cümle geldiği ve nitelenen 'the engineer' bir insan olduğu için, 'discuss something with someone' kalıbındaki 'with' edatı relative pronoun'un önüne taşınmalı ve insan bildirdiği için sadece 'whom' ile kullanılmalıdır; edattan hemen sonra 'who' ya da 'which' gelemez."
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
      "Örnek metin: \"The startup can secure the additional funding round ---- it demonstrates consistent revenue growth over the next two quarters.\"\n(A) provided that (B) even though (C) in spite of (D) as though\nDoğru cevap (A) 'provided that' — cümle finansmanın belirli bir KOŞULA bağlı olduğunu anlatıyor ('eğer... ise'); diğer bağlaçlar zıtlık veya varsayım anlamı taşır ve bağlama uymaz.",
      "Örnek metin: \"Traditional farming methods rely heavily on manual labor, ---- modern agribusiness depends on automated machinery.\"\n(A) unless (B) so (C) whereas (D) despite\nDoğru cevap (C) 'whereas' — cümlenin iki tarafı arasında doğrudan bir ÖZNE ZITLIĞI (geleneksel tarım ile modern tarım) kurulmaktadır. 'Unless' koşul, 'so' sonuç bildirir; 'despite' ise isim/Ving gerektiren bir edat olduğundan devamında tam cümle geldiği bu boşlukta kullanılamaz.",
      "Örnek metin: \"The merger promised significant cost savings for the company. Employees, ----, feared widespread layoffs.\"\n(A) similarly (B) as a result (C) in addition (D) on the other hand\nDoğru cevap (D) 'on the other hand' — şirketin beklediği tasarruf ile çalışanların duyduğu kaygı arasında bir ZITLIK vardır. 'Similarly' benzerlik, 'as a result' sonuç, 'in addition' ise ekleme bildirdiğinden cümlenin anlamıyla çelişir.",
      "Örnek metin: \"Analysts predicted that the merger would weaken the smaller firm's market position. ----, the smaller firm's revenue grew by over thirty percent within a year.\"\n(A) On the contrary (B) As well as (C) In case (D) Provided that\nDoğru cevap (A) 'On the contrary' — cümle, analistlerin öngörüsünün tam TERSİNİN gerçekleştiğini anlatarak önceki iddiayı ÇÜRÜTMEKTEDİR; diğer seçenekler ekleme, koşul ya da şart anlamı taşıdığından bağlama uymaz.",
      "Örnek metin: \"---- the surgery carried significant risks, the patient decided to go through with it after consulting several specialists.\"\n(A) Owing to (B) Even though (C) So that (D) As a result of\nDoğru cevap (B) 'Even though' — cümlenin iki yarısı arasında bir ZITLIK vardır (riskli olmasına rağmen ameliyat olmaya karar verilmesi); devamında bir cümlecik alan zıtlık bağlacı gerekir, oysa diğer seçenekler ya edat olup isim öbeği ister ya da amaç bildirir.",
      "Örnek metin: \"The empire's expansion slowed considerably ---- a combination of overextended supply lines and internal political strife.\"\n(A) despite (B) due to (C) unless (D) so that\nDoğru cevap (B) 'due to' — boşluktan sonra bir isim öbeği ('a combination of...') geldiği ve bir NEDEN bildirildiği için edat olan 'due to' doğru seçenektir; 'despite' zıtlık, 'unless' koşul, 'so that' ise amaç bildirir.",
      "Örnek metin: \"---- its immense distance from Earth, the star's light takes millions of years to reach us.\"\n(A) even though (B) as long as (C) owing to (D) provided that\nDoğru cevap (C) 'owing to' — yıldızın uzaklığı ile ışığın bize ulaşma süresi arasında bir NEDEN-SONUÇ ilişkisi vardır ve boşluktan sonra isim öbeği geldiğinden edat gerekir; diğer seçenekler bağlaç olup devamında bir cümlecik ister.",
      "Örnek metin: \"The new alloy is both lighter and more resistant to corrosion than standard steel, ---- extending the lifespan of offshore structures built with it.\"\n(A) despite (B) thus (C) unless (D) whereas\nDoğru cevap (B) 'thus' — alaşımın üstün özellikleri (neden) ile yapıların ömrünün uzaması (sonuç) arasında bir NEDEN-SONUÇ ilişkisi vardır ve devamında bir -ing yapısı geldiği için sonuç bildiren 'thus' doğru seçenektir; diğerleri zıtlık ya da koşul bildirir.",
      "Örnek metin: \"Interest rates rose sharply throughout the year. ----, many small businesses struggled to secure affordable loans.\"\n(A) nonetheless (B) whereas (C) in contrast (D) consequently\nDoğru cevap (D) 'consequently' — faiz oranlarındaki artış (neden) ile kredi bulmakta yaşanan zorluk (sonuç) arasında bir NEDEN-SONUÇ ilişkisi vardır; diğer seçeneklerin tümü zıtlık bildirir.",
      "Örnek metin: \"The earthquake's tremors were ---- powerful that buildings collapsed dozens of kilometers from the epicenter.\"\n(A) so (B) such (C) too (D) as\nDoğru cevap (A) 'so' — devamında bir sıfat ('powerful') ve ardından 'that' cümleciği geldiği için 'so + adjective + that' kalıbı kullanılmalıdır; 'such' isim öbeği ister, 'too' bu kalıpta 'that' ile kullanılmaz, 'as' burada anlamca uygun değildir.",
      "Örnek metin: \"---- the witness had already changed her account of events twice, the judge questioned the reliability of her testimony.\"\n(A) Despite (B) Since (C) Unless (D) In addition to\nDoğru cevap (B) 'Since' — tanığın ifadesini iki kez değiştirmiş olması (neden) ile hâkimin güvenilirliği sorgulaması (sonuç) arasında bir NEDEN-SONUÇ ilişkisi vardır ve devamında bir cümlecik geldiği için bağlaç olan 'since' doğru seçenektir.",
      "Örnek metin: \"The new recycling program has already reduced landfill waste by fifteen percent. ----, it has created hundreds of new jobs in the local economy.\"\n(A) Moreover (B) Otherwise (C) Unless (D) Whereas\nDoğru cevap (A) 'Moreover' — programın bir faydasına EK OLARAK ikinci bir olumlu sonuç sıralanmaktadır; diğer seçenekler koşul veya zıtlık anlamı taşıdığından bağlama uymaz.",
      "Örnek metin: \"The new training program has ---- improved the athletes' speed but also strengthened their endurance.\"\n(A) both (B) either (C) not only (D) whereas\nDoğru cevap (C) 'not only' — cümlenin devamında 'but also' yapısı bulunduğundan paralel yapı olan 'not only...but also' tamamlanmalıdır; 'both' yapısı 'and' ile, 'either' ise 'or' ile kullanılır.",
      "Örnek metin: \"---- offering free tuition, the scholarship program also provides a monthly stipend for living expenses.\"\n(A) although (B) unless (C) so that (D) besides\nDoğru cevap (D) 'besides' — boşluktan sonra bir Ving yapısı ('offering') geldiği ve bir EKLEME anlamı ('-nin yanı sıra') gerektiği için edat olan 'besides' doğru seçenektir.",
      "Örnek metin: \"Coral reefs can recover from bleaching events ---- ocean temperatures do not rise further in the following years.\"\n(A) despite (B) because of (C) as long as (D) in addition to\nDoğru cevap (C) 'as long as' — mercan resiflerinin iyileşmesi bir koşula bağlanmaktadır ('-dığı sürece'); diğer seçenekler bağlaç değil edat olduğundan devamında tam cümle alamaz.",
      "Örnek metin: \"Despite years of research, ---- progress has been made in fully understanding the causes of chronic fatigue syndrome.\"\n(A) few (B) many (C) a few (D) little\nDoğru cevap (D) 'little' — 'progress' sayılamayan bir isim olduğundan ve cümledeki anlam OLUMSUZ bir azlığı ('neredeyse hiç ilerleme olmaması') yansıttığından 'little' doğru seçenektir; 'few/a few' sayılabilir isimlerle, 'many' ise olumlu çoklukla kullanılır.",
      "Örnek metin: \"---- artifacts discovered at the site suggest that the settlement was far more advanced than previously believed.\"\n(A) A number of (B) The number of (C) Much (D) A great deal of\nDoğru cevap (A) 'A number of' — devamında çoğul bir isim ('artifacts') geldiği ve 'birçok' anlamı gerektiği için 'a number of' doğru seçenektir; 'the number of' '-in sayısı' anlamına gelir ve tekil fiil alır, 'much/a great deal of' ise sayılamayan isimlerle kullanılır.",
      "Örnek metin: \"---- participant in the study was asked to complete the same questionnaire under identical conditions.\"\n(A) All (B) Each (C) Most (D) Several\nDoğru cevap (B) 'Each' — devamında tekil bir isim ('participant') ve tekil bir fiil ('was asked') geldiği için 'her biri' anlamındaki 'each' doğru seçenektir; diğer seçenekler çoğul isim ve fiil gerektirir.",
      "Örnek metin: \"---- the theories proposed so far fully explains why social trust has declined in industrialized nations.\"\n(A) Most of (B) A few of (C) None of (D) Several of\nDoğru cevap (C) 'None of' — devamındaki fiil ('explains') tekil olduğundan ve cümle anlamca 'hiçbir teorinin tam bir açıklama getirmediği' fikrini verdiğinden 'hiçbiri' anlamındaki 'none of' doğru seçenektir.",
      "Örnek metin: \"The treaty was signed in early spring; ----, tensions between the two nations eased considerably.\"\n(A) meanwhile (B) instead (C) otherwise (D) subsequently\nDoğru cevap (D) 'subsequently' — antlaşmanın imzalanması ile gerilimin azalması arasında bir ZAMAN SIRASI ('daha sonra, ardından') vardır; 'meanwhile' eşzamanlılık, 'instead' alternatif, 'otherwise' ise aksi durumu bildirir.",
      "Örnek metin: \"---- talented a manager may be, without the trust of the team, long-term success is unlikely.\"\n(A) No matter how (B) Even if (C) As though (D) So that\nDoğru cevap (A) 'No matter how' — devamında bir sıfat ('talented') ve ardından bir ana cümlecik gelmesi ve 'ne kadar ... olursa olsun' anlamı gerektiği için doğru yapı budur; 'even if' devamında doğrudan bir sıfat değil tam bir cümlecik ister."
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
      "Örnek soru: \"The new manager not only reorganized the entire department ----.\"\n(A) although productivity declined sharply (B) because the staff resigned immediately (C) but also improved employee morale within weeks (D) unless the results were disappointing\nDoğru cevap (C) 'but also improved employee morale within weeks' — 'not only... but also' yapısı iki OLUMLU/PARALEL eylemi birbirine bağlar; cümlenin ilk kısmındaki yapıcı eylemle uyumlu tek tamamlayıcı (C)'dir.",
      "Örnek soru: \"After years of ignoring the symptoms, he finally stopped ----.\"\n(A) to see a doctor about the persistent pain (B) postponing the medical check-up any longer (C) drive to the hospital every weekend (D) having seen the specialist twice\nDoğru cevap (B) 'postponing the medical check-up any longer' — 'stop + Ving' bir eylemi BIRAKMAK anlamına gelir; yıllarca ihmal ettiği bir kontrolü artık ertelemeyi bırakması bağlamla uyumludur; (A) 'stop to do' farklı bir anlam (durup bir şey yapmak için) taşır ve bağlama uymaz.",
      "Örnek soru: \"The technician couldn't figure out ----.\"\n(A) how to reset the security system after the power outage (B) resetting the system was necessary (C) the system had already been reset (D) why did the outage happen\nDoğru cevap (A) 'how to reset the security system after the power outage' — soru kelimesi + 'to V0' yapısı bir isim cümleciği kısaltması olarak 'figure out'un nesnesi olabilir; (B) ve (C) başına 'that' almadan tam cümle olarak nesne konumunda kullanılamaz, (D) ise dolaylı soru cümleciklerinde devrik yapı ('did the outage happen') kullanılamayacağı kuralını ihlal eder.",
      "Örnek soru: \"The architect ---- is responsible for the design of the new library.\"\n(A) whom the city council appointed last spring (B) appointing the city council last spring (C) whose the city council appointed (D) which the city council appointed last spring\nDoğru cevap (A) 'whom the city council appointed last spring' — niteleneni insan olan ve sıfat cümleciğinde nesnesi eksik bir yapıda 'whom' kullanılır; (C) 'whose' yapısı hemen ardından isim ister, tek başına kullanılmaz; (D) 'which' insan dışı varlıkları niteler.",
      "Örnek soru: \"The publishing house rejected the manuscript ---- had already been translated into three languages.\"\n(A) that (B) whose author (C) who (D) whom\nDoğru cevap (B) 'whose author' — boşluktan sonra bir yardımcı fiil/fiil geldiği ve niteleneni ('manuscript') ile devamındaki isim ('author') arasında bir aitlik ilişkisi bulunduğu için iyelik bildiren 'whose + isim' yapısı gereklidir; diğer seçenekler devamında doğrudan isim getiremez.",
      "Örnek soru: \"The report ---- to the board last week contained several factual errors.\"\n(A) submitting (B) submitted (C) that submitted (D) having submitted\nDoğru cevap (B) 'submitted' — boşluktan önceki isim ('report') teslim etme eylemini kendisi YAPMADIĞI için edilgen bir sıfat cümleciği kısaltması olan 'V3' formu gerekir; 'submitting' aktif bir anlam taşıdığı için yanlıştır.",
      "Örnek soru: \"Marie Curie was the first scientist ---- two Nobel Prizes in different disciplines.\"\n(A) winning (B) who wins (C) to win (D) won\nDoğru cevap (C) 'to win' — üstünlük bildiren bir isim öbeğinden ('the first scientist') sonra gelen fiil, bir sıfat cümleciği kısaltması olarak 'to V0' şeklinde çekimlenmelidir.",
      "Örnek soru: \"The negotiators were fully aware of ---- the deadline could not be extended under any circumstances.\"\n(A) that (B) the fact that (C) what (D) which\nDoğru cevap (B) 'the fact that' — bir preposition'dan ('of') hemen sonra 'that' bağlacı kullanılamaz; bu durumda kesin bir bilgiyi aktarmak için 'the fact that' tercih edilir.",
      "Örnek soru: \"---- the company will relocate its headquarters has not yet been decided.\"\n(A) If (B) That (C) Whether (D) What\nDoğru cevap (C) 'Whether' — isim cümleciği cümlenin öznesi konumunda kullanıldığında 'if' bağlacı kullanılamaz; bu konumda kararsız durum bağlacı olarak sadece 'whether' tercih edilir.",
      "Örnek soru: \"The regulations require that every applicant ---- a valid medical certificate before enrollment.\"\n(A) submits (B) submitted (C) submit (D) will submit\nDoğru cevap (C) 'submit' — 'require that' gibi zorunluluk/talep bildiren yapılardan sonra gelen isim cümleciğinde fiil özneden bağımsız olarak yalın (subjunctive) hâlde kullanılır.",
      "Örnek soru: \"The startup succeeded ---- a loyal customer base without spending heavily on advertising.\"\n(A) to build (B) in building (C) build (D) having built\nDoğru cevap (B) 'in building' — 'succeed' fiili 'in' edatıyla kullanılır ve bir preposition'dan hemen sonra gelen fiil daima gerund (Ving) formunda olmalıdır.",
      "Örnek soru: \"The contract's terms were ---- for the small business owner to fully comprehend without legal help.\"\n(A) too complicated (B) so complicated (C) complicated enough (D) such complicated\nDoğru cevap (A) 'too complicated' — devamında 'to V0' (to fully comprehend) geldiği için 'too + sıfat + to V0' yapısı gereklidir; 'so' devamında 'that' ister, 'such' ise devamında bir isim öbeği gerektirir.",
      "Örnek soru: \"The charity did not raise ---- to cover the cost of rebuilding the school.\"\n(A) enough money (B) money enough (C) so much money that (D) as much money\nDoğru cevap (A) 'enough money' — 'enough' bir ismi niteleyecekse isimden önce kullanılır ('enough + noun'); devamında 'to V0' gelmesi de bu yapıyla uyumludur.",
      "Örnek soru: \"The turbulence during the flight was ---- several passengers became physically ill.\"\n(A) such that (B) so severe that (C) too severe to (D) as severe as\nDoğru cevap (B) 'so severe that' — devamında tam bir cümle (SVO) geldiği ve bir sonuç bildirildiği için 'so + sıfat + that' yapısı gereklidir; (A) 'such that' devamında sıfat değil doğrudan isim ister.",
      "Örnek soru: \"It was ---- that the entire audience gave the performers a standing ovation.\"\n(A) so a moving performance (B) such a moving performance (C) too moving performance (D) as moving performance\nDoğru cevap (B) 'such a moving performance' — sayılabilir tekil bir isimle sonuç bildiren yapı kurulacağında 'such + a/an + sıfat + isim + that' formülü kullanılır; 'so' aynı yapıda isimden önce kullanılamaz.",
      "Örnek soru: \"The new hire's approach to problem-solving is ---- her predecessor's, which surprised the whole team.\"\n(A) as same as (B) the same as (C) same to (D) such as\nDoğru cevap (B) 'the same as' — iki şeyin birbirine benzer/aynı olduğunu bildiren sabit yapı 'the same...as' şeklindedir; diğer seçenekler bu kalıpta kullanılmaz.",
      "Örnek soru: \"The company's second-quarter earnings were ---- analysts had originally forecast.\"\n(A) more high than (B) higher than (C) as high than (D) the highest than\nDoğru cevap (B) 'higher than' — tek heceli sıfatlarda karşılaştırma '-er than' ile yapılır; 'more high' ve 'the highest than' yapıları gramer olarak hatalıdır.",
      "Örnek soru: \"Investors found the CEO's vague explanation rather ----, especially after the stock price had dropped so sharply.\"\n(A) disappointing (B) disappointed (C) disappoint (D) to disappoint\nDoğru cevap (A) 'disappointing' — açıklamanın kendisi 'etkileyen' konumunda olduğu (yatırımcıları hayal kırıklığına UĞRATAN bir açıklama) için '-ing' formundaki sıfat kullanılmalıdır; 'disappointed' insanların hissettiği (etkilenen) durumu anlatır.",
      "Örnek soru: \"Despite the positive press coverage, the new policy still seemed ---- to most small business owners.\"\n(A) unfairly (B) unfair (C) unfairness (D) unfairly to\nDoğru cevap (B) 'unfair' — 'seem' bir linking verb olduğu için devamında zarf değil sıfat (complement) gelir.",
      "Örnek soru: \"Economists have yet to agree on the reason ---- the housing market cooled so suddenly.\"\n(A) which (B) why (C) whom (D) whose\nDoğru cevap (B) 'why' — 'the reason' sözcüğünü niteleyen sıfat cümleciği tam bir cümle ile devam ettiğinde ve 'sebep' anlamı korunduğunda relative word olarak 'why' kullanılır.",
      "Örnek soru: \"The real question is ---- the new policy will actually reduce costs or simply shift them elsewhere.\"\n(A) if (B) whether (C) that (D) what\nDoğru cevap (B) 'whether' — isim cümleciği bir linking verb'den ('is') sonra özne tamamlayıcısı olarak kullanıldığında ve iki seçenek arasında bir belirsizlik ('...or...') ifade edildiğinde 'if' değil 'whether' tercih edilir."
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
      "Örnek çeviri sorusu: \"Küreselleşmenin getirdiği ekonomik fırsatlara rağmen, gelir eşitsizliğinin birçok ülkede giderek derinleştiği gözlemlenmektedir.\"\n→ \"Despite the economic opportunities brought about by globalization, it is observed that income inequality is deepening in many countries.\"\n'Rağmen' (despite) ve 'gözlemlenmektedir' gibi edilgen ve resmi/akademik ifadelerin ('it is observed that') İngilizce'ye doğru aktarılması, akademik çeviri sorularında sıkça test edilen bir beceridir.",
      "Örnek çeviri sorusu: \"Kraliyet ailesinin yüzyıllar boyunca sakladığı belgeler, geçtiğimiz yıl tarihçiler tarafından incelenmek üzere arşivden çıkarıldı.\"\n→ \"The documents that the royal family had kept hidden for centuries were removed from the archive last year to be examined by historians.\"\n'Sakladığı' sıfat-fiili İngilizce'de 'that... had kept hidden' ilgi cümleciğine, 'incelenmek üzere' amaç ifadesi ise 'to be examined' yapısına karşılık gelir; geçmişte başlayıp süregelen bir eylem olduğu için past perfect kullanılmıştır.",
      "Örnek çeviri sorusu: \"Sanık, mahkemede ifade vermek zorunda değildir; ancak susma hakkını kullanması aleyhine bir delil olarak yorumlanamaz.\"\n→ \"The defendant is not obliged to testify in court; however, exercising this right to remain silent cannot be interpreted as evidence against them.\"\n'Zorunda değildir' yapısı 'is not obliged to' ile karşılanırken, 'yorumlanamaz' gibi olumsuz bir edilgen yapı İngilizce'de 'cannot be interpreted' şeklinde modal+pasif birleşimiyle aktarılır.",
      "Örnek çeviri sorusu: \"Doktorlar, hastanın durumunun kritik olmasına rağmen umutlarını yitirmediler.\"\n→ \"Even though the patient's condition was critical, the doctors did not lose hope.\"\n'Rağmen' zıtlık bağlacı 'even though' ile, 'umut yitirmek' deyimi ise İngilizce'deki doğal karşılığı olan 'to lose hope' ile aktarılmalıdır; birebir çeviri ('lose their hopes') doğal değildir.",
      "Örnek çeviri sorusu: \"Şirketin geçen çeyrekte elde ettiği kâr, beklentilerin çok üzerinde olmasına karşın yatırımcıları tam anlamıyla tatmin etmedi.\"\n→ \"Although the profit the company earned last quarter far exceeded expectations, it did not fully satisfy investors.\"\nTürkçedeki uzun özne öbeği ('şirketin... kâr') İngilizce'ye aktarılırken 'although' ile başlayan bir yan cümleye dönüştürülür; bu tür cümlelerde kelime sırasını yeniden düzenlemek çeviri akıcılığı için gereklidir.",
      "Örnek çeviri sorusu: \"Nesli tükenmekte olan kaplumbağaların üreme alanlarını korumak üzere kıyı boyunca yeni koruma bölgeleri oluşturuldu.\"\n→ \"New protected zones were established along the coast in order to preserve the breeding grounds of endangered turtles.\"\n'Üzere' amaç bağlacı 'in order to' ile, edilgen 'oluşturuldu' fiili ise 'were established' ile karşılanır; amaç bildiren yapının cümle sonuna değil başına da yerleştirilebileceği unutulmamalıdır.",
      "Örnek çeviri sorusu: \"Yapay zekanın günlük hayata bu denli hızlı entegre olması, birçok uzmanı hazırlıksız yakaladı.\"\n→ \"The fact that artificial intelligence has integrated into daily life so rapidly caught many experts off guard.\"\nTürkçedeki isim-fiil yapısı ('entegre olması') İngilizce'de 'the fact that... has integrated' şeklinde bir isim cümleciğine dönüştürülür; 'hazırlıksız yakalamak' deyimi ise 'to catch off guard' ile karşılanır.",
      "Örnek çeviri sorusu: \"Bilim insanlarının yıllardır çözmeye çalıştığı bu bulmaca, nihayet genç bir doktora öğrencisi tarafından çözüme kavuşturuldu.\"\n→ \"This puzzle, which scientists had been trying to solve for years, was finally solved by a young PhD student.\"\n'Yıllardır çözmeye çalıştığı' ifadesi past perfect continuous ('had been trying') ile ilgi cümleciği içinde aktarılır; edilgen yapı ('çözüme kavuşturuldu') ise 'was finally solved' ile karşılanır.",
      "Örnek çeviri sorusu: \"Eğer o dönemde teknoloji bu kadar gelişmiş olsaydı, kâşifler kıtayı çok daha kısa sürede haritalayabilirlerdi.\"\n→ \"Had technology been this advanced at that time, explorers could have mapped the continent in a much shorter time.\"\nGeçmişe yönelik gerçekleşmemiş bir varsayımı anlatan bu cümlede, 'eğer' bağlacı düşürülüp yardımcı fiilin başa alındığı devrik yapı ('Had technology been...') tercih edilmiştir; bu, Type 3 Conditional'ın resmi/akademik bir varyasyonudur.",
      "Örnek çeviri sorusu: \"Sözleşme, taraflardan her biri yazılı onay vermedikçe feshedilemeyecek şekilde düzenlenmiştir.\"\n→ \"The contract has been drafted in such a way that it cannot be terminated unless each party gives written consent.\"\n'-medikçe' olumsuz koşul eki 'unless' ile, edilgen 'feshedilemeyecek' yapısı ise 'cannot be terminated' ile karşılanır; hukuki metinlerin resmi üslubunu korumak için 'in such a way that' gibi kalıplar tercih edilmelidir.",
      "Örnek çeviri sorusu: \"Yöneticiler, çalışan memnuniyetinin uzun vadeli verimlilik üzerindeki etkisini göz ardı etmemelidir.\"\n→ \"Managers should not overlook the impact of employee satisfaction on long-term productivity.\"\n'Göz ardı etmek' deyimi İngilizce'de 'to overlook' fiiliyle doğal bir şekilde karşılanır; '-melidir' yapısındaki tavsiye/zorunluluk kipi ise 'should' modal fiiliyle aktarılmalıdır.",
      "Örnek çeviri sorusu: \"The coral reefs that once thrived along this coastline have been severely damaged by rising ocean temperatures.\"\n→ \"Bir zamanlar bu kıyı boyunca gelişen mercan resifleri, yükselen okyanus sıcaklıkları nedeniyle ciddi şekilde zarar görmüştür.\"\nİngilizce'deki ilgi cümleciği ('that once thrived') Türkçeye sıfat-fiil öbeği ('gelişen') olarak aktarılır; present perfect pasif yapı ('have been damaged') ise Türkçedeki '-miştir' ekiyle karşılanarak sonucun günceldeki etkisi korunur.",
      "Örnek çeviri sorusu: \"Experts warn that the rapid spread of misinformation online may well undermine public trust in scientific institutions.\"\n→ \"Uzmanlar, çevrimiçi yanlış bilginin hızla yayılmasının bilimsel kurumlara duyulan kamu güvenini büyük olasılıkla zayıflatacağı konusunda uyarıyor.\"\n'May well' kalıbı sıradan bir olasılıktan ('may') daha güçlü bir ihtimali belirtir; bu nüans Türkçeye 'büyük olasılıkla' gibi güçlendirilmiş bir zarfla aktarılmalıdır, yoksa anlam zayıflar.",
      "Örnek çeviri sorusu: \"Chronic sleep deprivation can take a serious toll on both physical and mental health over time.\"\n→ \"Kronik uyku eksikliği, zamanla hem fiziksel hem de zihinsel sağlık üzerinde ciddi bir bedel oluşturabilir.\"\n'Take a toll on' deyimi birebir çevrilemeyeceği için 'üzerinde bedel oluşturmak/olumsuz etki bırakmak' gibi anlamsal bir karşılıkla aktarılmalıdır; 'both... and...' yapısı ise 'hem... hem de...' ile karşılanır.",
      "Örnek çeviri sorusu: \"The merger will proceed as planned, provided that both companies reach an agreement on shareholder compensation.\"\n→ \"Her iki şirket de hissedar tazminatı konusunda anlaşmaya varması koşuluyla, birleşme planlandığı gibi devam edecektir.\"\n'Provided that' koşul bağlacı Türkçede 'koşuluyla/şartıyla' ekiyle karşılanır; bu tür koşul cümleleri çoğunlukla cümlenin başına değil sonuna aktarılarak Türkçenin doğal söz dizimine uydurulur.",
      "Örnek çeviri sorusu: \"The evidence that was presented during the trial ultimately proved insufficient to secure a conviction.\"\n→ \"Duruşma sırasında sunulan deliller, sonuçta bir mahkûmiyet sağlamaya yetersiz kaldı.\"\nİlgi cümleciği ('that was presented') Türkçede sıfat-fiil öbeğine ('sunulan') indirgenerek daha akıcı bir yapı elde edilir; 'prove insufficient' deyimi ise 'yetersiz kalmak' ile karşılanmalıdır, 'yetersiz olduğunu kanıtlamak' gibi birebir çeviriler doğal değildir.",
      "Örnek çeviri sorusu: \"Not until the late nineteenth century did historians begin to question the accuracy of these accounts.\"\n→ \"Tarihçiler, bu anlatıların doğruluğunu ancak on dokuzuncu yüzyılın sonlarına doğru sorgulamaya başladılar.\"\n'Not until... did...' devrik yapısı İngilizce'de vurgu yaratmak için kullanılır; Türkçede aynı vurgu devrik bir yapı yerine 'ancak' zarfıyla ve zaman ifadesinin öne alınmasıyla sağlanır.",
      "Örnek çeviri sorusu: \"The samples were kept at a constant temperature so that any external variables would not affect the results.\"\n→ \"Örnekler, herhangi bir dış değişkenin sonuçları etkilememesi için sabit bir sıcaklıkta tutuldu.\"\n'So that... would not' olumsuz amaç yapısı Türkçede '-memesi için' şeklinde olumsuz bir isim-fiil yapısına dönüştürülerek aktarılır; edilgen 'were kept' ise 'tutuldu' ile karşılanır.",
      "Örnek çeviri sorusu: \"The new recycling policy is far from perfect, but it represents a significant step in the right direction.\"\n→ \"Yeni geri dönüşüm politikası kusursuz olmaktan uzaktır, ancak doğru yönde atılmış önemli bir adımı temsil etmektedir.\"\n'Far from perfect' deyimi 'kusursuz olmaktan uzak' şeklinde anlamsal olarak karşılanmalıdır; 'a step in the right direction' ifadesi ise Türkçede sıkça kullanılan 'doğru yönde atılmış bir adım' kalıbıyla aktarılır.",
      "Örnek çeviri sorusu: \"Engineers cannot help but marvel at how quickly renewable energy storage technology has advanced in the past five years.\"\n→ \"Mühendisler, yenilenebilir enerji depolama teknolojisinin son beş yılda ne kadar hızlı geliştiğine hayret etmekten kendilerini alamıyorlar.\"\n'Cannot help but' kalıbı bir eylemi engelleyememe/kendini alamama anlamı taşır ve Türkçeye '-mekten kendini alamamak' yapısıyla aktarılmalıdır; birebir 'yardım edemez ama hayret eder' gibi çeviriler anlamsızdır.",
      "Örnek çeviri sorusu: \"While the manufacturing sector saw a modest decline in output, the service sector experienced remarkable growth during the same period.\"\n→ \"İmalat sektörü üretimde mütevazı bir düşüş yaşarken, hizmet sektörü aynı dönemde dikkate değer bir büyüme kaydetti.\"\nZıtlık bildiren 'while' bağlacı, Türkçede iki eylemin eşzamanlı ama karşıt olduğunu belirten '-ken' ekiyle karşılanabilir; bu, ayrı bir bağlaç kullanmadan zıtlığı doğal şekilde aktarır."
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
      "Örnek soru tipi: Paragrafta bir bulaşıcı hastalığın önlenmesi için alınan dört farklı önlemden bahsedilir ve 'Aşağıdakilerden hangisi paragrafta bahsedilen önlemlerden biri DEĞİLDİR?' sorusu sorulur. Bu tür sorularda dört seçenekten üçü metinde açıkça geçen önlemlerle eşleşirken, doğru cevap metinde hiç geçmeyen veya metinle çelişen tek seçenek olur; metni satır satır seçeneklerle karşılaştırmak bu soru tipinde en güvenilir stratejidir.",
      "Örnek soru tipi: Paragrafta yapay zekanın tıbbi teşhis süreçlerine nasıl entegre edildiği anlatılır ve 'Paragrafın ana fikri aşağıdakilerden hangisidir?' sorusu sorulur. Paragrafın çoğu yapay zeka sistemlerinin taramalardaki başarı oranını anlatsa da, son cümlede 'ultimately, these tools are most effective when used to support, not replace, a doctor's judgment' deniyorsa, doğru cevap yapay zekanın hekimin yargısını DESTEKLEYİCİ bir araç olduğunu vurgulayan seçenek olmalıdır; sadece başarı oranlarına odaklanan bir seçenek ana fikri dar bir açıdan yansıtır.",
      "Örnek soru tipi: Paragrafta uzaktan çalışmanın hem çalışan memnuniyetini artırdığı hem de ekip içi iletişimi zorlaştırdığı anlatılır ve 'Yazarın uzaktan çalışmaya karşı tutumu nasıldır?' sorusu sorulur. Metin boyunca 'greater flexibility and autonomy' ile 'reduced spontaneous collaboration' ifadeleri dengeli biçimde kullanıldığından, doğru cevap yazarın tutumunun TARAFSIZ/ihtiyatlı olduğunu belirten seçenek olmalıdır; tek yönlü olumlu ya da olumsuz seçenekler bu dengeyi yansıtmaz.",
      "Örnek soru tipi: Paragrafta mercan resiflerindeki beyazlama olayının hangi koşullarda daha az görüldüğü anlatılır ve 'Paragraftan aşağıdakilerden hangisi çıkarılabilir?' sorusu sorulur. Metinde açıkça belirtilmese de, 'reefs located near strong ocean currents experienced significantly less coral bleaching than those in still waters' cümlesinden, GÜÇLÜ AKINTILARIN resifleri ısı stresine karşı bir ölçüde koruyabileceği çıkarılabilir; bu tür sorularda metinde birebir yazmayan ama mantıksal olarak desteklenen seçenek doğru cevaptır.",
      "Örnek soru tipi: Paragrafta matbaanın Avrupa'da yayılma sürecinden bahsedilir ve 'Paragrafa göre matbaa ilk olarak hangi alanda en hızlı benimsenmiştir?' sorusu sorulur. Paragrafta birden fazla kullanım alanı sayılsa da 'while religious texts were among the earliest works printed, it was the demand for legal and commercial documents that drove the technology's rapid expansion across trading cities' cümlesi geçiyorsa, doğru cevap TİCARİ VE HUKUKİ belgelere olan talebi ana etken olarak belirten seçenek olmalıdır.",
      "Örnek soru tipi: Paragrafta bir hafıza tekniğinin katılımcıların sınav performansını nasıl etkilediği anlatılır ve 'Paragrafın altıncı satırındaki \"it\" kelimesi neye işaret etmektedir?' sorusu sorulur. Cümle 'Researchers introduced a spaced-repetition method to the study group; it improved long-term recall by nearly forty percent' şeklindeyse, 'it' kelimesi tekil ve cansız bir kavrama işaret ettiğinden 'the study group' değil, hemen önceki cümlede geçen 'a spaced-repetition method' ifadesine atıfta bulunur.",
      "Örnek soru tipi: Paragrafta bir şirketin hisse senedi fiyatındaki dalgalanmalardan bahsedilir ve 'Paragrafta geçen \"volatile\" kelimesi bu bağlamda en yakın olarak hangi anlama gelmektedir?' sorusu sorulur. Cümle 'the stock has remained highly volatile since the merger announcement, swinging more than ten percent within a single trading day' şeklindeyse, 'volatile' kelimesi burada 'değişken/istikrarsız' anlamında kullanılmıştır; kelimenin diğer bağlamlardaki anlamları burada geçerli değildir.",
      "Örnek soru tipi: Paragrafta yeni nesil uzay teleskoplarının uzak galaksilerden gelen ışığı nasıl analiz ettiği ve bunun evrenin yaşı hakkındaki bilgimizi nasıl değiştirdiği anlatılır ve 'Bu paragraf için en uygun başlık aşağıdakilerden hangisidir?' sorusu sorulur. Paragraf hem teleskobun teknik özelliklerine hem de bu bulguların evrenbilim açısından önemine değindiğinden, doğru cevap yalnızca teknik özelliklere odaklanan dar bir başlık değil, hem teknolojiyi hem de bilimsel etkisini kapsayan bir başlık olmalıdır.",
      "Örnek soru tipi: Paragrafta bir çevrimiçi eğitim platformunun sunduğu dört farklı özellikten (canlı ders, kayıtlı video, ödev takibi, akran değerlendirmesi) bahsedilir ve 'Aşağıdakilerden hangisi paragrafta bahsedilen özelliklerden biri DEĞİLDİR?' sorusu sorulur. Bu tür sorularda dört seçenekten üçü metinde açıkça geçen özelliklerle eşleşirken, doğru cevap metinde hiç geçmeyen (örneğin sertifika sonrası iş garantisi gibi) tek seçenek olur; metni özellik listesiyle satır satır karşılaştırmak bu soru tipinde en güvenilir stratejidir.",
      "Örnek soru tipi: Paragrafta tek kullanımlık plastiklerin deniz ekosistemlerine verdiği zarar örneklerle ve istatistiklerle anlatılır ve 'Yazar bu paragrafı hangi amaçla yazmıştır?' sorusu sorulur. Paragraf boyunca somut rakamlar ve vaka örnekleri bir görüşü DESTEKLEMEK için kullanıldığından, doğru cevap yazarın amacının okuyucuyu plastik tüketimini azaltma konusunda ikna etmek olduğunu belirten seçenek olmalıdır; sadece 'bilgi vermek' gibi nötr bir seçenek yazarın ikna edici tonunu yansıtmaz.",
      "Örnek soru tipi: Paragrafta pil teknolojisindeki son gelişmelerin şarj sürelerini nasıl kısalttığı anlatılır ve 'Paragraftaki bilgilere dayanarak aşağıdakilerden hangisi en olası gelecek gelişme olabilir?' sorusu sorulur. Metinde 'each new generation of batteries has cut charging times roughly in half compared to its predecessor, a trend that shows no sign of slowing' deniyorsa, doğru cevap bu eğilimin devam edeceğini ve şarj sürelerinin daha da kısalacağını öngören seçenek olmalıdır; metinde hiç ipucu verilmeyen tamamen farklı bir teknolojik sıçramayı öngören seçenekler yanlıştır.",
      "Örnek soru tipi: Paragrafta bir ülkenin son beş yıldaki enflasyon oranlarına dair veriler sunulur ve 'Paragrafa göre enflasyon oranı hangi yıl en yüksek seviyeye ulaşmıştır?' sorusu sorulur. Metinde 'inflation climbed steadily from three percent in 2019 to a peak of eleven percent in 2022, before easing slightly to eight percent the following year' cümlesi geçiyorsa, doğru cevap enflasyonun 2022'de zirve yaptığını belirten seçenek olmalıdır; sayısal detay sorularında metindeki rakamları seçeneklerle birebir karşılaştırmak gerekir.",
      "Örnek soru tipi: Paragrafta bilim insanlarının bir kuş türünü uydu vericileriyle takip ettiği anlatılır ve 'Paragrafın dördüncü satırındaki \"they\" kelimesi neye işaret etmektedir?' sorusu sorulur. Cümle 'Scientists attached tiny satellite trackers to over three hundred migratory storks; they will provide data on migration routes for the next several years' şeklindeyse, 'they' kelimesi çoğul olduğundan tekil olan 'a bird species' değil, çoğul olan 'tiny satellite trackers' ifadesine işaret eder.",
      "Örnek soru tipi: Paragrafta iki antik uygarlığın sulama sistemleri karşılaştırılır ve 'Paragrafa göre bu iki uygarlığın sulama yaklaşımları arasındaki temel fark nedir?' sorusu sorulur. Metinde 'unlike the valley civilization, which relied on seasonal flooding to irrigate its fields, the highland society built an extensive network of stone canals to control water flow year-round' cümlesi varsa, doğru cevap mevsimsel taşkınlara bağımlılık ile yıl boyu kanal sistemi arasındaki karşıtlığı doğru yansıtan seçenek olmalıdır.",
      "Örnek soru tipi: Paragrafta uyku süresinin çalışanların üretkenliği üzerindeki etkisine dair bir araştırma özetlenir ve 'Paragraftan aşağıdakilerden hangisi çıkarılabilir?' sorusu sorulur. Metinde 'employees who slept fewer than six hours were nearly twice as likely to make significant errors during afternoon tasks' cümlesi geçiyorsa, buradan YETERSİZ UYKUNUN özellikle günün ileri saatlerindeki iş performansını olumsuz etkileyebileceği çıkarılabilir; bu sonuç metinde birebir yazılmasa da verilen bilgiden mantıksal olarak desteklenir.",
      "Örnek soru tipi: Paragrafta bir fabrikanın üretim hattını tamamen otomasyona geçirdiği anlatılır ve 'Paragrafın son cümlesindeki \"this\" kelimesi neye işaret etmektedir?' sorusu sorulur. Cümle 'Over the past two years, the factory replaced nearly all manual assembly tasks with robotic systems. This has significantly reduced production costs but also led to considerable job losses among longtime workers' şeklindeyse, 'this' kelimesi tek bir isme değil, önceki cümlede anlatılan OTOMASYONA GEÇİŞ SÜRECİNİN TAMAMI fikrine atıfta bulunur.",
      "Örnek soru tipi: Paragrafta bir belediyenin su tasarrufu kampanyasının etkisi anlatılır ve 'Paragrafa göre aşağıdakilerden hangisi doğrudur?' sorusu sorulur. Metinde 'household water usage in the city center dropped by nearly twenty percent, though consumption in the outlying suburbs remained largely unchanged' cümlesi geçiyorsa, bu bilgiyi 'şehrin genelinde su tüketimi yüzde yirmi azaldı' şeklinde sunan bir çeldirici seçenek, metindeki bilgiyi şehir merkezinden tüm şehre genişleterek çarpıtır; bu tür neredeyse birebir alıntı tuzaklarında bilginin hangi bölgeye ait olduğuna dikkat edilmelidir.",
      "Örnek soru tipi: Paragrafta kırsal bölgelerden büyük şehirlere göç eden gençlerin eğitim tercihlerinden bahsedilir ve 'Paragrafa göre aşağıdakilerden hangisi doğrudur?' sorusu sorulur. Metinde 'a growing number of young people from rural areas are choosing to pursue vocational training rather than traditional four-year degrees' cümlesi geçiyorsa, bunu 'kırsaldan gelen gençlerin tümü meslek eğitimini tercih ediyor' şeklinde sunan bir seçenek, metindeki sınırlı 'a growing number' ifadesini abartarak genelleştirdiği için yanlıştır; bu tür kapsam abartma tuzaklarına dikkat edilmelidir.",
      "Örnek soru tipi: Paragrafta bir ülkenin ekonomik büyüme tahminine dair iki farklı kurumun görüşü aktarılır ve 'Paragrafa göre yavaş büyüme konusunda kim uyarıda bulunmuştur?' sorusu sorulur. Metinde 'while the trade ministry remained optimistic about export growth, independent analysts at the national economic institute cautioned that momentum could slow sharply next year' cümlesi geçiyorsa, doğru cevap uyarıyı ticaret bakanlığı değil, ulusal ekonomi enstitüsündeki bağımsız analistlerin yaptığını belirten seçenek olmalıdır; bilginin doğru kaynağa/kişiye ait olup olmadığını kontrol etmek bu soru tipinde belirleyicidir.",
      "Örnek soru tipi: Paragrafta sosyal medya kullanımının gençler üzerindeki etkileri ağırlıklı olarak olumsuz örneklerle anlatılır ve 'Yazarın konuya karşı tutumu nasıldır?' sorusu sorulur. Metin boyunca 'growing anxiety', 'diminished attention spans' ve 'a troubling rise in comparison-driven insecurity' gibi ifadeler ağırlıklı olarak kullanıldığından, doğru cevap yazarın tutumunun ELEŞTİREL/kaygılı olduğunu belirten seçenek olmalıdır; dengeli ya da olumlu bir tutumu yansıtan seçenekler metnin genel tonuyla çelişir.",
      "Örnek soru tipi: Paragrafta bir uzay görevinin tasarım aşamasından fırlatılışına kadar geçen süreç kronolojik olarak anlatılır ve 'Paragrafa göre görevin ikinci aşamasında ne gerçekleşmiştir?' sorusu sorulur. Metinde 'after the initial design phase concluded in 2019, engineers spent the next two years building and testing a full-scale prototype before final assembly began in 2022' cümlesi geçiyorsa, doğru cevap ikinci aşamanın prototip inşası ve testinden oluştuğunu belirten seçenek olmalıdır; kronolojik paragraflarda her aşamayı doğru sıraya yerleştirmek soru çözümünün anahtarıdır."
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
      "Örnek soru: \"A: How was the flight? B: ----. A: Oh no, I'm sorry to hear that. At least you're finally home.\"\n(A) It was smooth and relaxing (B) We landed three hours late and lost my luggage (C) I love flying long distances (D) The flight was cancelled before it started, so I never boarded\nDoğru cevap (B) 'We landed three hours late and lost my luggage' — A'nın 'I'm sorry to hear that... at least you're finally home' cevabı, B'nin olumsuz ve uzun bir deneyim yaşadığını ama sonunda eve VARDIĞINI gösterir; (D) ise hiç uçuşun gerçekleşmediğini ima ettiği için 'finally home' ifadesiyle çelişir.",
      "Örnek soru: \"A: Should we still go on the picnic this afternoon? B: ----. A: In that case, let's reschedule for tomorrow.\"\n(A) The forecast says it will rain heavily after 2 PM (B) I already packed the sandwiches (C) I love picnics in the park (D) We don't have a park nearby\nDoğru cevap (A) — A'nın 'let's reschedule for tomorrow' önerisi, B'nin bugünkü planı olumsuz etkileyecek bir gerekçe (yağmur) sunduğunu gösterir; bu nedenle B'nin cevabı planın ertelenmesini GEREKTİREN bir neden içermelidir.",
      "Örnek soru: \"A: I just got promoted to team leader! B: ----. A: Thank you so much, I really worked hard for it.\"\n(A) I'm sorry to hear that (B) That's wonderful news, congratulations! (C) Maybe next time you'll succeed (D) I didn't know you had a job\nDoğru cevap (B) 'That's wonderful news, congratulations!' — A'nın 'Thank you so much' tepkisi, B'nin bir TEBRİK ifadesi kullandığını gösterir; diğer seçenekler bağlamla çelişen ya da olumsuz tepkilerdir.",
      "Örnek soru: \"A: My car won't start again this morning. B: ----. A: That would be a huge help, thank you.\"\n(A) I don't know how to drive (B) Cars are very expensive nowadays (C) I can give you a ride to work if you need one (D) You should sell it and buy a bike\nDoğru cevap (C) — A'nın 'That would be a huge help' cevabı, B'nin somut bir YARDIM TEKLİFİNDE bulunduğunu gösterir; bu nedenle B'nin cevabı bir öneri/teklif niteliği taşımalıdır.",
      "Örnek soru: \"A: I made a reservation for eight o'clock, but the table isn't ready. B: ----. A: I understand, but we've already been waiting twenty minutes.\"\n(A) Your table has been ready since seven (B) We don't take reservations here (C) Would you like to see the menu while you wait (D) I'm very sorry, sir, there seems to be a slight delay\nDoğru cevap (D) — A'nın 'I understand, but we've already been waiting' cevabı, B'nin bir ÖZÜR ve GECİKME açıklaması yaptığını gösterir; bu nedenle B'nin cevabı bir mazeret/özür niteliği taşımalıdır.",
      "Örnek soru: \"A: How is the group project going? B: ----. A: That's frustrating, have you talked to the professor about it?\"\n(A) Two of my teammates haven't submitted their parts yet (B) It's going great, everyone is contributing equally (C) I finished my part last week (D) We don't have a group project this semester\nDoğru cevap (A) — A'nın 'That's frustrating' tepkisi, B'nin bir SORUN/ŞİKAYET dile getirdiğini gösterir; bu nedenle B'nin cevabı olumsuz bir durumu yansıtmalıdır.",
      "Örnek soru: \"A: What seems to be the problem today? B: ----. A: I see. Let's take a look and see what's causing that.\"\n(A) I feel perfectly healthy, thank you (B) I've had a sharp pain in my lower back for three days (C) I'm here to pick up a prescription (D) My appointment was cancelled yesterday\nDoğru cevap (B) — A'nın 'Let's take a look and see what's causing that' cevabı, B'nin bir RAHATSIZLIK/BELİRTİ tarif ettiğini gösterir.",
      "Örnek soru: \"A: My package still hasn't arrived, and it's been two weeks. B: ----. A: Please do, I really need it by Friday.\"\n(A) Packages usually arrive within two days (B) I already received mine last week (C) I'll check the tracking number and get back to you right away (D) We don't deliver to your area\nDoğru cevap (C) — A'nın 'Please do, I really need it by Friday' cevabı, B'nin bir ÇÖZÜM/EYLEM önerdiğini gösterir; bu nedenle B'nin cevabı bir yardım teklifi niteliğinde olmalıdır.",
      "Örnek soru: \"A: We'd love for you to come to our wedding next month. B: ----. A: Don't worry, we completely understand.\"\n(A) I wouldn't miss it for the world (B) I've never been to a wedding before (C) What time does the wedding start (D) I'm afraid I'll be abroad for work that week\nDoğru cevap (D) — A'nın 'we completely understand' cevabı, B'nin davete KATILAMAYACAĞINI bir mazeretle bildirdiğini gösterir.",
      "Örnek soru: \"A: Did you hear our team lost the championship game last night? B: ----. A: I know, nobody expected that result.\"\n(A) I can't believe it, they were undefeated all season! (B) I'm so glad they finally won (C) I don't follow sports at all (D) The game hasn't started yet\nDoğru cevap (A) — A'nın 'nobody expected that result' cevabı, B'nin bir ŞAŞKINLIK ifadesi kullandığını gösterir.",
      "Örnek soru: \"A: I have no idea how to prepare for the final exam. B: ----. A: That's a good idea, I'll start organizing my notes tonight.\"\n(A) I already took that exam years ago (B) Why don't you make a study schedule and stick to it (C) Exams are not that important anyway (D) You should just skip the exam\nDoğru cevap (B) — A'nın 'That's a good idea' tepkisi, B'nin bir TAVSİYE/ÖNERİ sunduğunu gösterir; (D) de bir öneri gibi görünse de A'nın olumlu tepkisiyle ÇELİŞEN kötü bir tavsiyedir.",
      "Örnek soru: \"A: I noticed you just moved in next door. B: ----. A: We'd love that, thank you for the warm welcome.\"\n(A) No, we've lived here for years (B) I don't know my neighbors at all (C) Yes, we moved in last weekend. Would you and your family like to come over for coffee sometime? (D) This isn't my house\nDoğru cevap (C) — A'nın 'We'd love that, thank you for the warm welcome' cevabı, B'nin bir DAVET yaptığını gösterir.",
      "Örnek soru: \"A: Have you heard back about the job interview yet? B: ----. A: Try not to worry too much, I'm sure it went better than you think.\"\n(A) Yes, they offered me the position immediately (B) The interview is scheduled for next week (C) I decided not to apply after all (D) Not yet, and I'm getting really nervous about it\nDoğru cevap (D) — A'nın 'Try not to worry too much' cevabı, B'nin bir ENDİŞE/GERGİNLİK ifade ettiğini gösterir.",
      "Örnek soru: \"A: I think I completely ruined the cake I was baking. B: ----. A: Thanks, that actually makes me feel a lot better.\"\n(A) Don't worry, even professional bakers mess up sometimes (B) I told you not to bake it in the first place (C) I don't really like cake anyway (D) You should throw away your oven\nDoğru cevap (A) — A'nın 'that actually makes me feel a lot better' cevabı, B'nin bir TESELLİ/RAHATLATMA ifadesi kullandığını gösterir.",
      "Örnek soru: \"A: Why didn't you answer my calls last night? B: ----. A: Oh, that explains it. I was starting to worry.\"\n(A) I was talking to you the whole time (B) My phone battery died right after dinner (C) I don't have your phone number (D) I don't own a phone\nDoğru cevap (B) — A'nın 'that explains it' cevabı, B'nin makul bir MAZERET sunduğunu gösterir.",
      "Örnek soru: \"A: My computer keeps crashing every time I open this program. B: ----. A: Alright, I'll try that and let you know if it works.\"\n(A) That program was removed last year (B) I've never used a computer before (C) Have you tried restarting your computer and updating the software (D) Your computer looks brand new\nDoğru cevap (C) — A'nın 'I'll try that and let you know if it works' cevabı, B'nin somut bir ÇÖZÜM ÖNERİSİ sunduğunu gösterir.",
      "Örnek soru: \"A: I've been trying to eat healthier, but it's really hard to stick to. B: ----. A: You're right, I guess I should be more patient with myself.\"\n(A) You should just give up if it's that difficult (B) I've never had trouble eating healthy (C) Healthy food doesn't taste good anyway (D) It takes time to build new habits, so don't be too hard on yourself\nDoğru cevap (D) — A'nın 'I should be more patient with myself' cevabı, B'nin bir CESARETLENDİRME/DESTEK ifadesi kullandığını gösterir.",
      "Örnek soru: \"A: I'm terrified about giving this presentation tomorrow. B: ----. A: I hope so, I've practiced it at least ten times.\"\n(A) You'll do great, you've clearly prepared a lot (B) I don't think you should give the presentation (C) Presentations were cancelled for tomorrow (D) I'm terrified of presentations too, actually\nDoğru cevap (A) — A'nın 'I hope so, I've practiced it at least ten times' cevabı, B'nin bir GÜVEN VERME/CESARETLENDİRME ifadesi kullandığını gösterir.",
      "Örnek soru: \"A: Is the new art exhibit at the museum worth visiting? B: ----. A: Perfect, I'll go there this weekend then.\"\n(A) The museum is closed permanently (B) Definitely, the photography section is especially impressive (C) I've never been interested in art (D) I don't know where the museum is\nDoğru cevap (B) — A'nın 'Perfect, I'll go there this weekend' cevabı, B'nin sergiyi OLUMLU bir şekilde önerdiğini gösterir.",
      "Örnek soru: \"A: You're almost an hour late for the meeting. B: ----. A: I understand, these things happen. Let's just get started.\"\n(A) I think I'm actually early (B) The meeting was cancelled, wasn't it (C) I'm really sorry, there was a major accident on the highway (D) I've been here the whole time\nDoğru cevap (C) — A'nın 'I understand, these things happen' cevabı, B'nin makul bir MAZERET/ÖZÜR sunduğunu gösterir.",
      "Örnek soru: \"A: Your English has improved so much since last year! B: ----. A: That explains it, consistency really pays off.\"\n(A) I actually stopped studying months ago (B) I don't think my English is very good (C) I've never studied English before (D) Thank you, I've been practicing every single day\nDoğru cevap (D) — A'nın 'consistency really pays off' cevabı, B'nin DÜZENLİ ÇALIŞMA sayesinde ilerleme kaydettiğini belirttiğini gösterir."
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
      "Örnek soru: \"Had the engineers detected the structural flaw earlier, the collapse could have been prevented.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"If the engineers had noticed the structural flaw sooner, the collapse would not have happened.\" — cümle geçmişte gerçekleşmemiş bir koşulu (Type 3 Conditional, devrik yapı 'Had the engineers detected...') anlatır; hedef cümle aynı zaman ve koşul ilişkisini standart 'if' yapısıyla korumalıdır.",
      "Örnek soru: \"A team of marine biologists discovered the shipwreck off the coast of Sicily last summer.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"The shipwreck was discovered off the coast of Sicily last summer by a team of marine biologists.\" — aktif cümle edilgen çatıya çevrilirken özne ile nesne yer değiştirmiş, ancak eylemi kimin yaptığı bilgisi 'by a team of marine biologists' ile korunmuştur.",
      "Örnek soru: \"Postponing the merger any further could seriously damage investor confidence.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"The fact that the merger is being postponed any further could seriously damage investor confidence.\" — eylemi isimleştiren gerund öznesi ('postponing') aynı anlamı taşıyan 'the fact that' ile başlayan bir isim cümleciğine dönüştürülmüş, cümlenin özü değişmemiştir.",
      "Örnek soru: \"Chronic sleep deprivation has led to a measurable decline in students' academic performance.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"A measurable decline in students' academic performance has resulted from chronic sleep deprivation.\" — neden-sonuç ilişkisinin yönü değiştirilerek yeniden kurulmuştur; 'led to' ile 'resulted from' aynı nedensellik bağını farklı bir odaktan aktarır ve ilişkinin yönü bozulmaz.",
      "Örnek soru: \"The renovated stadium is far more energy-efficient than the one it replaced.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"The stadium that was replaced is nowhere near as energy-efficient as the renovated one.\" — üstünlük bildiren 'more...than' yapısı, karşılaştırılan iki unsurun yerini değiştirip 'not as...as' kalıbıyla aynı karşılaştırmayı vermiştir.",
      "Örnek soru: \"The evidence against the defendant was so overwhelming that the trial lasted only two days.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"Due to the fact that the evidence against the defendant was overwhelming, the trial lasted only two days.\" — 'so...that' ile kurulan derece-sonuç ilişkisi, nedeni öne çıkaran 'due to the fact that' yapısına dönüştürülmüş, kanıtın ağırlığı ile duruşmanın kısalığı arasındaki bağ korunmuştur.",
      "Örnek soru: \"No committee member other than the chairperson had access to the confidential file.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"Except for the chairperson, no committee member had access to the confidential file.\" — 'other than' ile belirtilen tek istisna, 'except for' ile aynı sınırlayıcı anlamı taşıyacak şekilde yeniden ifade edilmiştir.",
      "Örnek soru: \"The new bypass not only reduced travel time but also cut the number of accidents in the town center.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"In addition to reducing travel time, the new bypass cut the number of accidents in the town center.\" — 'not only...but also' ile verilen iki kazanım, 'in addition to' yapısıyla aynı ekleme anlamını koruyarak tek cümlede yeniden yazılmıştır.",
      "Örnek soru: \"Employees should not ignore minor safety violations but report them immediately to their supervisor.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"Instead of ignoring minor safety violations, employees should report them immediately to their supervisor.\" — yapılmaması ve yapılması gereken iki davranışı karşılaştıran yapı, 'instead of' ile aynı tercih ilişkisini koruyacak şekilde yeniden kurulmuştur.",
      "Örnek soru: \"As soon as the central bank announced the interest rate cut, the currency began to weaken.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"No sooner had the central bank announced the interest rate cut than the currency began to weaken.\" — 'as soon as' ile kurulan ardışıklık ilişkisi, devrik 'no sooner...than' kalıbıyla aynı zaman sırasını koruyarak yeniden ifade edilmiştir.",
      "Örnek soru: \"The only way to restore the wetland's biodiversity is to remove the invasive plant species.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"Unless the invasive plant species is removed, the wetland's biodiversity cannot be restored.\" — tek yolu belirten 'the only way to X is Y' yapısı, aynı zorunluluğu olumsuz bir koşulla ifade eden 'unless' yapısına dönüştürülmüş, anlam değişmemiştir.",
      "Örnek soru: \"The archives were left unlocked and several files were missing; someone must have entered the room overnight.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"It is almost certain that someone entered the room overnight, since the archives were left unlocked and several files were missing.\" — kanıta dayanan güçlü bir geçmiş çıkarımı bildiren 'must have V3' yapısı, aynı kesinlik derecesini taşıyan 'it is almost certain that' ifadesiyle yeniden kurulmuştur.",
      "Örnek soru: \"The contractor should have reinforced the foundation before the heavy rains began.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"It would have been better if the contractor had reinforced the foundation before the heavy rains began.\" — geçmişte yapılmayan bir eylem için eleştiri bildiren 'should have V3' yapısı, aynı pişmanlık anlamını taşıyan 'it would have been better if' kalıbıyla eşdeğer biçimde ifade edilmiştir.",
      "Örnek soru: \"It is widely believed that the fresco was painted by one of the artist's students rather than the master himself.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"According to popular belief, the fresco was painted by one of the artist's students rather than the master himself.\" — kaynağı belirtilmeden aktarılan bir inanışı bildiren 'it is widely believed that' yapısı, aynı bilgiyi kaynağa atıfla sunan 'according to popular belief' ifadesiyle eşdeğer şekilde yeniden yazılmıştır.",
      "Örnek soru: \"While sales of electric vehicles surged last year, sales of traditional combustion engines continued to decline.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"Sales of electric vehicles surged last year; in contrast, sales of traditional combustion engines continued to decline.\" — 'while' ile kurulan karşıtlık ilişkisi, iki ayrı cümleyi 'in contrast' ile bağlayarak aynı zıtlığı korumuştur.",
      "Örnek soru: \"Tenants must submit the maintenance request in writing; otherwise, the building manager will not process it.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"Unless tenants submit the maintenance request in writing, the building manager will not process it.\" — bir kuralın uygulanmaması durumunda ortaya çıkacak sonucu bildiren 'otherwise' bağlacı, aynı koşulu 'unless' ile eşdeğer biçimde ifade etmiştir.",
      "Örnek soru: \"The startup's revenue plateaued last quarter, probably because it had not invested enough in marketing.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"The reason why the startup's revenue plateaued last quarter might be that it had not invested enough in marketing.\" — 'probably because' ile verilen olası bir neden, aynı olasılık derecesini ('probably' = 'might') koruyan 'the reason why...might be that' kalıbıyla yeniden ifade edilmiştir.",
      "Örnek soru: \"I regret that I do not have enough practical experience to apply for this position.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"I wish I had enough practical experience to apply for this position.\" — şu anki bir eksiklikten duyulan pişmanlığı bildiren 'I regret that I do not have' yapısı, aynı pişmanlığı taşıyan 'I wish + past simple' kalıbıyla eşdeğer şekilde ifade edilmiştir.",
      "Örnek soru: \"It was not necessary for the passengers to arrive three hours early, but they did so anyway.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"The passengers needn't have arrived three hours early.\" — yapılmasına gerek olmayan ama yine de gerçekleştirilen bir eylemi anlatan yapı, aynı anlamı taşıyan 'needn't have V3' kalıbıyla daha kısa biçimde yeniden ifade edilmiştir.",
      "Örnek soru: \"As the deadline approached more closely, the team's stress levels increased proportionally.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"The closer the deadline approached, the more stressed the team became.\" — orantılı bir artışı anlatan yapı, aynı orantısal ilişkiyi taşıyan 'the + comparative..., the + comparative...' kalıbıyla yeniden ifade edilmiştir.",
      "Örnek soru: \"The negotiator spoke with such confidence that it seemed the deal had already been finalized.\" ifadesine en yakın anlamlı cümleyi seçin.\nDoğru cevap: \"The negotiator spoke as if the deal had already been finalized.\" — gerçek dışı bir izlenim yaratan durum, aynı anlamı taşıyan 'as if' kalıbıyla daha yalın biçimde yeniden kurulmuştur."
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
      "Örnek: Bir paragrafta bir araştırmanın farklı bulguları sırayla sunulur, ancak paragrafın sonunda tüm bulguları bir araya getiren bir SONUÇ cümlesi eksiktir. Doğru tamamlayıcı cümle, önceki bulguların tümünü kapsayan bir GENELLEME yapmalıdır (örn. \"Taken together, these findings suggest that early intervention plays a far greater role in long-term recovery than previously assumed.\").",
      "Örnek: Bir paragrafın ilk yarısı çevrimiçi haber sitelerinin son on yılda nasıl hızla büyüdüğünü anlatır, ikinci yarısı ise basılı gazete tirajlarındaki sürekli düşüşten bahseder; ancak aradaki GEÇİŞ cümlesi eksiktir. Doğru tamamlayıcı cümle bu iki gelişmeyi birbirine bağlayan bir cümle olmalıdır (örn. \"As more readers turned to their phones for instant updates, print newspapers struggled to keep pace with this shift.\").",
      "Örnek: Bir paragraf, yeni bir uzay teleskobunun fırlatılışından yörüngeye yerleşmesine kadar geçen aşamaları sırayla anlatır ve son aşama için bir boşluk bırakılmıştır. Doğru tamamlayıcı cümle bu SIRALI anlatımın mantıksal son adımını yansıtmalıdır (örn. \"Only after several weeks of calibration did the telescope capture its first usable images of deep space.\").",
      "Örnek: Bir paragraf, küçük bir yazılım şirketinin ilk yıllarındaki hızlı ve sorunsuz büyümesini anlatır; ancak paragrafın sonunda beklenmedik bir zorluğa değinen bir cümle eksiktir. Doğru tamamlayıcı cümle önceki istikrarlı büyümeyi TERSİNE çeviren bir gelişmeyi tanıtmalıdır (örn. \"Almost overnight, however, a wave of new competitors forced the company to rethink its entire pricing strategy.\").",
      "Örnek: Bir paragrafta 'philopatry' adlı bir davranış biçimi ilk kez kullanılır, ancak okuyucunun bu kavramı anlaması için gereken tanım cümlesi eksiktir. Doğru tamamlayıcı cümle terimi AÇIKLAYAN bir cümle olmalıdır (örn. \"This term describes a species' tendency to return to the exact location where it was born in order to breed.\").",
      "Örnek: Bir paragrafın giriş cümlesi bir kütüphane yenilemesinin öğrenci kullanımını artırdığını iddia eder, ancak bu iddiayı destekleyecek somut veri cümlesi eksiktir. Doğru tamamlayıcı cümle iddiaya somut bir KANIT sunmalıdır (örn. \"Since the renovation was completed, daily visitor numbers have nearly tripled compared to the previous year.\").",
      "Örnek: Bir paragrafta yeni bir ilacın klinik denemelerdeki başarılı sonuçları ayrıntılı biçimde anlatılır, ancak paragrafın sonunda konuya dengeli bir bakış açısı katan cümle eksiktir. Doğru tamamlayıcı cümle bir SINIRLILIĞI tanıtmalıdır (örn. \"Nevertheless, the trial included too few elderly participants to confirm the drug's safety for that age group.\").",
      "Örnek: Bir paragrafta bir şehirdeki çatı bahçeciliği projelerinin farklı faydaları (gıda erişimi, topluluk bağları, hava kalitesi) sırayla anlatılır, ancak paragrafın son cümlesi eksiktir. Doğru tamamlayıcı cümle tüm bu faydaları bir araya getiren bir GENELLEME yapmalıdır (örn. \"Taken as a whole, these small-scale projects are reshaping how residents think about food and community in dense urban neighborhoods.\").",
      "Örnek: Bir paragraf, bir dalış ekibinin rutin bir sualtı haritalama görevi sırasında yaşadıklarını anlatır; paragrafın ortasında beklenmedik bir keşfi tanıtan cümle eksiktir. Doğru tamamlayıcı cümle önceki sıradan durumu ters yüz eden bir GELİŞMEYİ tanıtmalıdır (örn. \"Then, quite by accident, their sonar equipment picked up the outline of a wooden hull buried beneath centuries of sediment.\").",
      "Örnek: Bir paragrafta bir şirketin çalışanları arasında artan tükenmişlik şikayetlerinden bahsedilir, paragrafın sonunda ise şirketin uyguladığı yeni programdan söz edilir; ancak aradaki SONUÇ cümlesi eksiktir. Doğru tamamlayıcı cümle şikayetlerin şirketi harekete GEÇİRDİĞİNİ belirtmelidir (örn. \"Alarmed by the rising number of complaints, management introduced a mandatory four-day work week on a trial basis.\").",
      "Örnek: Bir paragrafta bir kıyı kasabasındaki kum tepelerinin yıllar içinde nasıl aşındığından bahsedilir, hemen ardından ise yerel evlerin sel riskiyle karşı karşıya kaldığından söz edilir; ancak aralarındaki NEDEN-SONUÇ cümlesi eksiktir. Doğru tamamlayıcı cümle aşınmayı sel riskine bağlamalıdır (örn. \"Without these natural dunes to absorb the impact of storm surges, the waves now reach much closer to residential streets.\").",
      "Örnek: Bir paragrafta önce geleneksel kural tabanlı çeviri yazılımlarının çalışma mantığı anlatılır, ardından yeni nesil yapay zeka tabanlı çeviri araçlarına geçilir; ancak ikisi arasındaki temel farkı belirten cümle eksiktir. Doğru tamamlayıcı cümle bu KARŞILAŞTIRMAYI netleştirmelidir (örn. \"Unlike their rule-based predecessors, these newer tools learn patterns directly from millions of real translated sentences.\").",
      "Örnek: Bir paragrafın başındaki boşluk, geri kalan cümlelerin ayrıntılandıracağı bir müze projesini TANITAN bir giriş cümlesi gerektirir; paragrafın devamı bu projenin sunduğu sanal tur özelliklerini anlatmaktadır. Doğru tamamlayıcı cümle konuyu tanıtmalıdır (örn. \"A growing number of museums are now digitizing their entire collections to reach audiences who may never visit in person.\").",
      "Örnek: Bir paragrafta önce tarım ilaçlarının arı popülasyonu üzerindeki olumsuz etkilerinden bahsedilir, hemen ardından ise meyve üretimindeki düşüşten söz edilir; ancak aradaki bağlantı cümlesi eksiktir. Doğru tamamlayıcı cümle bu iki gelişme arasında bir KÖPRÜ kurmalıdır (örn. \"With fewer bees available to pollinate the orchards, many farmers have seen their fruit yields decline for the third consecutive year.\").",
      "Örnek: Bir paragrafta uzak bir dağ köyünün güneş enerjili bir mikro şebekeye geçiş sürecinden bahsedilir, paragrafın sonunda bu geçişin somut bir sonucunu belirten cümle eksiktir. Doğru tamamlayıcı cümle geçişin getirdiği SOMUT SONUCU vermelidir (örn. \"Within a year of the switch, the village's dependence on diesel generators had dropped by more than ninety percent.\").",
      "Örnek: Bir paragrafta bir uyku araştırmasının yöntemi (katılımcıların seçimi, testlerin uygulanması) sırayla anlatılır ve bulguların açıklanacağı son aşama için bir boşluk bırakılmıştır. Doğru tamamlayıcı cümle bu SIRALI anlatımın bir sonraki adımını yansıtmalıdır (örn. \"Once the sleep-deprivation phase ended, participants were asked to recall the word lists they had memorized the previous evening.\").",
      "Örnek: Bir paragrafta sosyal medya platformlarının haber yayma hızının avantajlarından bahsedilir, ardından bir boşluk bırakılarak karşıt görüşe geçiş yapılır. Doğru tamamlayıcı cümle bu geçişi bir KARŞIT ARGÜMANLA başlatmalıdır (örn. \"Media researchers, however, warn that this same speed allows false information to spread before it can be verified.\").",
      "Örnek: Bir paragrafın giriş cümlesi modern mühendisliğin depreme dayanıklı binalar tasarlayabildiğini iddia eder, ancak bu iddiayı somutlaştıracak örnek cümle eksiktir. Doğru tamamlayıcı cümle iddiaya somut bir ÖRNEK sunmalıdır (örn. \"One recently completed tower in a high-risk zone rests on massive rubber isolators that allow the entire structure to shift safely during a tremor.\").",
      "Örnek: Bir paragrafta bir perakende zincirinin son çeyrekteki güçlü satış rakamları övgüyle anlatılır, ancak paragrafın sonunda bu tabloyu dengeleyecek bir cümle eksiktir. Doğru tamamlayıcı cümle bir SINIRLILIK ya da KAYGIYI tanıtmalıdır (örn. \"Analysts caution, however, that much of this growth came from heavy discounting that may not be sustainable in the coming year.\").",
      "Örnek: Bir paragrafın giriş cümlesi gençler arasında takım sporlarına katılımın azaldığını iddia eder, ancak bu iddiayı sayısal olarak destekleyecek cümle eksiktir. Doğru tamamlayıcı cümle iddiayı somut bir İSTATİSTİKLE desteklemelidir (örn. \"National surveys show that youth enrollment in organized team sports has fallen by nearly a quarter over the past ten years.\").",
      "Örnek: Bir paragraf, bir restorasyon ekibinin yüzyıllık bir tabloyu temizleme sürecini anlatır; paragrafın ortasında beklenmedik bir keşfi tanıtan cümle eksiktir. Doğru tamamlayıcı cümle önceki sıradan anlatımı ters yüz eden bir GELİŞMEYİ tanıtmalıdır (örn. \"Beneath the layers of darkened varnish, restorers were startled to find an entirely different portrait the artist had painted over decades earlier.\")."
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
      "Örnek paragraf: (1) Museums around the world have begun digitizing their collections to improve accessibility. (2) This process allows researchers and the public to view rare artifacts without physically visiting the museum. (3) Some museums also offer virtual reality tours of their galleries. (4) Ticket prices for major museums have risen considerably over the past decade.\nCümle (4), paragrafın odağı olan 'müzelerin koleksiyonlarını dijitalleştirerek erişilebilirliği artırması' ile ilgisiz, bilet fiyatlarındaki artış gibi FARKLI bir konuya (finansal erişilebilirlik) değindiği için anlatım bütünlüğünü bozar; cümle (3) ise dijitalleşme temasıyla hâlâ ilişkili olduğundan yanıltıcı bir seçenek olarak düşünülebilir ama doğru cevap değildir.",
      "Örnek paragraf: (1) NASA's Perseverance rover has been searching for signs of ancient microbial life on Mars since 2021. (2) It collects rock samples that will eventually be returned to Earth by a future mission. (3) Mars has two small moons named Phobos and Deimos. (4) Scientists hope these samples will reveal whether life ever existed on the red planet.\nCümle (3), paragrafın odağı olan 'Perseverance'ın Mars'ta yaşam izi arama görevi' ile ilgisiz, gezegenin uydularına dair konu dışı bir bilgi içerdiği için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) The Mediterranean diet emphasizes vegetables, whole grains, and olive oil over processed foods. (2) Numerous studies link this eating pattern to a lower risk of heart disease. (3) Olive oil production dates back more than six thousand years in the region. (4) Researchers also note that the diet's relaxed, social approach to eating may add to its health benefits.\nCümle (3), paragrafın GÜNÜMÜZDEKİ sağlık etkilerine odaklanan akışıyla uyuşmayan, zeytinyağının TARİHSEL kökenine dair bir bilgi sunduğu için (paragrafın zaman odağıyla çeliştiği için) anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Green roofs are becoming a popular feature in dense urban neighborhoods. (2) They absorb rainwater, easing the burden on city drainage systems during storms. (3) The vegetation planted on rooftops also helps lower indoor temperatures in summer. (4) Property values in these neighborhoods have risen steadily over the past decade.\nCümle (4), paragrafın yeşil çatıların ÇEVRESEL faydalarını anlatan odağından sapıp, konuyla ilgisiz FİNANSAL bir bilgiye (emlak değerleri) değindiği için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Coral reefs support roughly a quarter of all marine species despite covering less than one percent of the ocean floor. (2) Rising sea temperatures cause corals to expel the algae that give them color and nutrients, a process known as bleaching. (3) Many divers travel great distances to photograph colorful reef ecosystems. (4) If bleaching events continue at the current rate, entire reef systems could collapse within decades.\nCümle (3), paragrafın mercan resiflerinin biyolojisi ve tehdit altında olmasına odaklanan konusuyla ilgisiz, dalış turizmine dair konu dışı bir bilgi içerdiği için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Large-scale solar farms have expanded rapidly across desert regions over the past decade. (2) These installations can generate enough electricity to power hundreds of thousands of homes. (3) Wind turbines were first used to generate electricity in the late nineteenth century. (4) Unlike fossil fuel plants, solar farms produce no direct emissions during operation.\nCümle (3), paragrafın odağı olan güneş enerjisi santrallerinin GÜNÜMÜZDEKİ yaygınlaşması ile ilgisiz, farklı bir enerji kaynağının (rüzgar türbinleri) tarihsel gelişimine değindiği için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Coffeehouses first appeared in the Ottoman Empire during the sixteenth century. (2) They quickly became centers for conversation, business, and political debate. (3) Today, coffee is one of the most widely traded agricultural commodities in the world. (4) By the seventeenth century, similar coffeehouses had spread throughout Europe, shaping public discourse there as well.\nCümle (3), paragrafın on altıncı ve on yedinci yüzyıllardaki kahvehane kültürünü anlatan TARİHSEL akışına, GÜNÜMÜZE ait bir ticaret bilgisi sokarak zaman sırasını bozduğu için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Machine translation systems have improved dramatically since the introduction of neural network models. (2) These systems now produce far more natural and contextually accurate translations than older rule-based programs. (3) Human translators still outperform machines on literary texts full of idiom and nuance. (4) Many companies across various industries have laid off staff in recent years due to automation.\nCümle (4), paragrafın makine çevirisinin teknik gelişimine odaklanan konusundan sapıp, otomasyonun genel iş gücü piyasasına etkisi gibi FARKLI bir boyuta kaydığı için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Ancient Mesopotamian farmers built canal systems to channel water from the Tigris and Euphrates rivers into their fields. (2) This irrigation allowed them to grow surplus crops and support growing city populations. (3) The wheel is often credited as one of Mesopotamia's most important inventions. (4) Managing these canals required careful cooperation and gave rise to early forms of centralized administration.\nCümle (3), paragrafın sulama sistemleri ve bunun toplumsal sonuçlarına odaklanan akışıyla ilgisiz, farklı bir buluşa (tekerlek) değindiği için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Vaccines work by training the immune system to recognize a pathogen without causing the disease itself. (2) This is typically achieved by introducing a weakened or inactivated form of the pathogen, or a harmless piece of it. (3) Some people experience mild soreness at the injection site for a day or two. (4) When the body later encounters the real pathogen, it can respond quickly enough to prevent serious illness.\nCümle (3), cümle (2) ile (4) arasındaki bağışıklık mekanizması açıklamasına yeni bir bilgi katmayan, konu dışı küçük bir yan etki detayı sunduğu için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Venice receives millions of visitors each year, far outnumbering its shrinking resident population. (2) City officials have introduced an entry fee for day-trippers to manage crowding. (3) Venetian glassmaking on the island of Murano has a centuries-old tradition. (4) Critics argue that such measures do too little to address the underlying strain tourism places on the city's infrastructure.\nCümle (3), paragrafın aşırı turizmle mücadele önlemlerine odaklanan konusuyla ilgisiz, geleneksel cam işçiliğine dair konu dışı bir bilgi içerdiği için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Research suggests that bilingual individuals often perform better on tasks requiring mental flexibility. (2) Constantly switching between two language systems appears to strengthen the brain's executive control functions. (3) Learning a second language later in life is generally harder than learning it as a child. (4) Some studies even associate lifelong bilingualism with a delayed onset of dementia symptoms.\nCümle (3), paragrafın iki dilliliğin bilişsel faydalarına odaklanan akışından sapıp, dil öğreniminin yaşa göre zorluğu gibi farklı bir alt konuya değindiği için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Open-plan offices were introduced to boost collaboration and cut costs, but research increasingly shows they undermine both. (2) Constant noise and visual distraction make it harder for employees to concentrate on complex tasks. (3) Employees in open layouts report having far more face-to-face interactions with colleagues, which many say improves teamwork. (4) As a result, some organizations are now returning to layouts with more private, quiet spaces.\nCümle (3), paragrafın açık ofislere yönelik ELEŞTİREL duruşuyla çelişecek şekilde olumlu bir yönden bahsettiği için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Rising sea levels are forcing coastal cities to rethink their flood-defense strategies. (2) Rotterdam has built adjustable barriers that can be raised during storm surges. (3) The Netherlands is famous worldwide for its tulip fields and windmills. (4) Other cities are exploring 'sponge city' designs that let excess water soak into permeable surfaces.\nCümle (3), paragrafın kıyı kentlerindeki sel önleme mühendisliğine odaklanan konusuyla ilgisiz, ülkenin turistik imajına dair konu dışı bir bilgi içerdiği için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Less than a quarter of the world's ocean floor has been mapped in detail. (2) Deep-sea submersibles allow scientists to study ecosystems that exist without sunlight. (3) Many of these ecosystems rely on chemical energy from hydrothermal vents rather than photosynthesis. (4) Recreational scuba diving has grown into a popular tourist activity in coastal regions.\nCümle (4), paragrafın derin deniz ekosistemlerinin bilimsel keşfine odaklanan konusuyla hiçbir ilgisi olmayan, sığ sularda yapılan turistik dalışa dair bir bilgi içerdiği için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Genetically modified crops are engineered to resist pests, disease, or harsh weather conditions. (2) Supporters argue that these traits can significantly increase yields and reduce pesticide use. (3) Organic farming has grown in popularity among consumers seeking chemical-free produce. (4) Critics, however, remain concerned about the long-term environmental effects of widespread GMO cultivation.\nCümle (3), paragrafın genetiği değiştirilmiş ürünlerin fayda ve risklerini tartışan akışına yeni bir katkı sağlamayan, farklı bir tarım yöntemine (organik tarım) dair konu dışı bir bilgi sunduğu için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Public health campaigns have long promoted handwashing as one of the simplest ways to prevent disease transmission. (2) Studies show that proper handwashing can reduce respiratory infections by nearly twenty percent. (3) Hospitals began adopting stricter hand hygiene protocols after Ignaz Semmelweis's findings in the nineteenth century. (4) Yet surveys consistently find that many people still skip handwashing after using public restrooms.\nCümle (3), paragrafın el yıkamanın GÜNÜMÜZDEKİ etkinliği ve uyum sorununa odaklanan akışına, konunun ON DOKUZUNCU YÜZYIL'a ait tarihsel kökenini sokarak zaman odağını karıştırdığı için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Several studies have linked heavy social media use among teenagers to increased rates of anxiety and low self-esteem. (2) Constant exposure to curated, idealized images of others' lives is thought to fuel harmful social comparison. (3) Social media platforms generate substantial advertising revenue from their teenage users. (4) Some psychologists recommend that families set clear limits on daily screen time to protect adolescent well-being.\nCümle (3), paragrafın ergenlerin ruh sağlığına odaklanan konusundan sapıp, platformların reklam gelirleri gibi FARKLI bir boyuta (ticari/ekonomik) kaydığı için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Several major cities have begun replacing diesel buses with electric models to cut urban air pollution. (2) Electric buses produce zero tailpipe emissions and operate more quietly than diesel buses. (3) Diesel engines were first adapted for public bus fleets in the early twentieth century. (4) Despite higher upfront costs, electric buses can be cheaper to operate over their lifespan due to lower fuel and maintenance costs.\nCümle (3), paragrafın elektrikli ve dizel otobüsleri GÜNÜMÜZDE karşılaştıran akışıyla uyuşmayan, dizel motorların TARİHSEL kökenine dair bir bilgi sunduğu için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Massive open online courses, or MOOCs, allow millions of learners to access university-level content for free or at low cost. (2) Supporters argue that MOOCs democratize education by removing geographic and financial barriers. (3) Completion rates for MOOCs remain notoriously low, often under ten percent. (4) University campuses generally offer libraries, laboratories, and other physical resources that online courses cannot replicate.\nCümle (4), paragrafın MOOC'ların erişim avantajı ile tamamlanma oranı arasındaki tartışmaya odaklanan akışından sapıp, üniversite kampüslerinin fiziksel imkanlarına dair farklı bir alt konuya değindiği için anlatım bütünlüğünü bozar.",
      "Örnek paragraf: (1) Restorers use non-invasive imaging techniques to examine paintings before starting any physical restoration work. (2) Techniques such as infrared reflectography can reveal preliminary sketches hidden beneath the visible paint layer. (3) Renaissance painters often mixed their own pigments using natural minerals and plant extracts. (4) This information helps restorers understand how a painting evolved and decide which later retouches should be preserved or removed.\nCümle (3), paragrafın modern görüntüleme tekniklerinin restorasyon kararlarına katkısını anlatan akışına, ressamların pigment hazırlama yöntemine dair tarihsel ve konu dışı bir bilgi sokarak anlatım bütünlüğünü bozar."
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

  const phrasalVerbGlossaryEntries1 = [
    "abide by – kurala uymak\nÖrnek: \"All employees must abide by the company's safety regulations.\" (Tüm çalışanlar şirketin güvenlik kurallarına uymalıdır.)",
    "account for – açıklamak, bir şeyin nedeni/oranı olmak\nÖrnek: \"Rising fuel costs account for much of the recent price increase.\" (Artan yakıt maliyetleri, son fiyat artışının büyük bölümünü açıklıyor.)",
    "act upon – bir bilgiye göre hareket etmek, uygulamaya koymak\nÖrnek: \"The manager acted upon the customer's feedback and changed the menu.\" (Müdür, müşterinin geri bildirimine göre hareket edip menüyü değiştirdi.)",
    "acquit of – bir suçtan aklamak\nÖrnek: \"The jury acquitted him of all the charges after a short trial.\" (Jüri, kısa bir yargılamanın ardından onu tüm suçlamalardan akladı.)",
    "add up – mantıklı gelmek, akla yatmak\nÖrnek: \"Her explanation for being late didn't really add up.\" (Geç kalma konusundaki açıklaması pek akla yatmadı.)",
    "admit to – kabul etmek, itiraf etmek\nÖrnek: \"He finally admitted to breaking the neighbor's window.\" (Sonunda komşunun camını kırdığını itiraf etti.)",
    "agree upon – üzerinde anlaşmaya varmak\nÖrnek: \"The two companies agreed upon a fair price for the merger.\" (İki şirket, birleşme için adil bir fiyat üzerinde anlaştı.)",
    "appeal for – çağrıda bulunmak, talep etmek\nÖrnek: \"The charity appealed for donations after the earthquake.\" (Yardım kuruluşu, depremin ardından bağış çağrısında bulundu.)",
    "appeal to – ilgisini çekmek, hoşuna gitmek\nÖrnek: \"The quiet village appeals to tourists who want to relax.\" (Sakin köy, dinlenmek isteyen turistlerin ilgisini çekiyor.)",
    "arise from – kaynaklanmak\nÖrnek: \"Most of the delays arise from poor communication between teams.\" (Gecikmelerin çoğu, ekipler arasındaki zayıf iletişimden kaynaklanıyor.)",
    "ask out – çıkma teklif etmek, davet etmek\nÖrnek: \"He was too nervous to ask her out for coffee.\" (Onu kahve içmeye çıkmaya davet edecek kadar cesaret bulamadı.)",
    "ask over – evine davet etmek\nÖrnek: \"We asked our new neighbors over for dinner on Friday.\" (Cuma günü yeni komşularımızı akşam yemeğine davet ettik.)",
    "auction off – açık artırmayla satmak\nÖrnek: \"The museum auctioned off several paintings to fund repairs.\" (Müze, onarımları finanse etmek için birkaç tabloyu açık artırmayla sattı.)",
    "back out (of) – sözünden dönmek, vazgeçmek\nÖrnek: \"She backed out of the deal at the very last minute.\" (Anlaşmadan tam son anda vazgeçti.)",
    "back up – desteklemek, doğrulamak; yedeklemek\nÖrnek: \"Always back up your files before updating the software.\" (Yazılımı güncellemeden önce dosyalarınızı her zaman yedekleyin.)",
    "bawl out – azarlamak\nÖrnek: \"The coach bawled out the players for missing practice.\" (Antrenör, antrenmana gelmedikleri için oyuncuları azarladı.)",
    "bear on – ilgili olmak, etkilemek\nÖrnek: \"This new evidence directly bears on the outcome of the case.\" (Bu yeni kanıt, davanın sonucunu doğrudan etkiliyor.)",
    "bear out – doğrulamak, teyit etmek\nÖrnek: \"The latest sales figures bear out our earlier predictions.\" (Son satış rakamları, önceki tahminlerimizi doğruluyor.)",
    "bear upon – ilgili/ilişkili olmak\nÖrnek: \"Economic policy decisions bear upon nearly every household in the country.\" (Ekonomi politikası kararları, ülkedeki neredeyse her haneyi ilgilendiriyor.)",
    "blab (on) about – gevezelik etmek\nÖrnek: \"He kept blabbing on about his vacation during the meeting.\" (Toplantı boyunca tatili hakkında durmadan gevezelik etti.)",
    "blame on – suçunu birine yüklemek\nÖrnek: \"She blamed the missed deadline on a lack of resources.\" (Kaçırılan teslim tarihinin suçunu kaynak eksikliğine yükledi.)",
    "blow out – üfleyerek söndürmek\nÖrnek: \"The birthday girl blew out all the candles in one breath.\" (Doğum günü kızı tüm mumları tek nefeste üfleyerek söndürdü.)",
    "blow up – patlamak, patlatmak; çok sinirlenmek\nÖrnek: \"My boss blew up when he saw the report was late.\" (Patronum, raporun geciktiğini görünce çok sinirlendi.)",
    "blurt out – düşünmeden ağzından kaçırmak\nÖrnek: \"She accidentally blurted out the surprise before the party started.\" (Parti başlamadan sürprizi yanlışlıkla ağzından kaçırdı.)",
    "break down – bozulmak, çökmek, ayrıntılara ayırmak\nÖrnek: \"The old bus broke down halfway through the mountain road.\" (Eski otobüs, dağ yolunun yarısında bozuldu.)",
    "break in – zorla girmek; araya girmek\nÖrnek: \"Thieves broke in through the kitchen window last night.\" (Hırsızlar dün gece mutfak penceresinden zorla içeri girdi.)",
    "break into – zorla girmek; aniden başlamak\nÖrnek: \"The crowd suddenly broke into applause after the announcement.\" (Kalabalık, duyurudan sonra aniden alkışlamaya başladı.)",
    "break off – ilişkiyi kesmek, aniden durdurmak\nÖrnek: \"The two countries broke off diplomatic relations last month.\" (İki ülke geçen ay diplomatik ilişkilerini kesti.)",
    "break out – aniden başlamak, patlak vermek\nÖrnek: \"A fire broke out in the warehouse late at night.\" (Gece geç saatte depoda bir yangın çıktı.)",
    "break through – bir engeli aşmak, çığır açmak\nÖrnek: \"Scientists finally broke through the barrier in cancer research.\" (Bilim insanları sonunda kanser araştırmasında bir çığır açtı.)",
    "break up – dağılmak, ayrılmak, parçalamak\nÖrnek: \"The couple broke up after five years together.\" (Çift, beş yıl birlikte olduktan sonra ayrıldı.)",
    "bring about – neden olmak, yol açmak\nÖrnek: \"The new law brought about major changes in the industry.\" (Yeni yasa, sektörde büyük değişikliklere yol açtı.)",
    "bring back – geri getirmek, hatırlatmak\nÖrnek: \"That old song brings back memories of my childhood.\" (O eski şarkı, çocukluğumun anılarını geri getiriyor.)",
    "bring down – düşürmek, azaltmak, devirmek\nÖrnek: \"The government introduced measures to bring down inflation.\" (Hükümet, enflasyonu düşürmek için önlemler getirdi.)",
    "bring on – neden olmak, tetiklemek\nÖrnek: \"Stress at work can bring on severe headaches.\" (İş yerindeki stres, şiddetli baş ağrılarını tetikleyebilir.)",
    "bring out – piyasaya sürmek, ortaya çıkarmak\nÖrnek: \"The company plans to bring out a new phone next spring.\" (Şirket, gelecek bahar yeni bir telefon piyasaya sürmeyi planlıyor.)",
    "bring to mind – akla getirmek\nÖrnek: \"The smell of fresh bread brings to mind my grandmother's kitchen.\" (Taze ekmek kokusu, büyükannemin mutfağını akla getiriyor.)",
    "bring up – yetiştirmek; gündeme getirmek\nÖrnek: \"She was brought up by her grandparents in a small town.\" (Küçük bir kasabada büyükanne ve büyükbabası tarafından yetiştirildi.)",
    "brush out – fırçalayarak temizlemek\nÖrnek: \"She brushed out the tangles before braiding her daughter's hair.\" (Kızının saçını örmeden önce dolaşıklıkları fırçalayarak temizledi.)",
    "bump into – tesadüfen karşılaşmak, çarpmak\nÖrnek: \"I bumped into an old classmate at the airport yesterday.\" (Dün havalimanında eski bir sınıf arkadaşımla tesadüfen karşılaştım.)",
    "butter up – pohpohlamak, yağ çekmek\nÖrnek: \"He tried to butter up his boss before asking for a raise.\" (Zam istemeden önce patronuna yağ çekmeye çalıştı.)",
    "buy out – hissesini satın alarak devralmak\nÖrnek: \"The larger firm decided to buy out its smaller competitor.\" (Büyük firma, daha küçük rakibini satın alarak devraldı.)",
    "buy up – mevcut tüm stoku satın almak\nÖrnek: \"Investors quickly bought up the remaining land near the coast.\" (Yatırımcılar, kıyıya yakın kalan tüm araziyi hızla satın aldı.)",
    "call for – gerektirmek, talep etmek\nÖrnek: \"This recipe calls for two cups of flour and one egg.\" (Bu tarif iki su bardağı un ve bir yumurta gerektiriyor.)",
    "call off – iptal etmek\nÖrnek: \"Organizers called off the outdoor concert because of the storm.\" (Organizatörler, fırtına nedeniyle açık hava konserini iptal etti.)",
    "call on – ziyaret etmek; çağrıda bulunmak\nÖrnek: \"The teacher called on the quietest student to answer the question.\" (Öğretmen, soruyu cevaplaması için en sessiz öğrenciye söz verdi.)",
    "call out – yüksek sesle söylemek; eleştirerek belirtmek\nÖrnek: \"The referee called out the foul in front of everyone.\" (Hakem, faulü herkesin önünde yüksek sesle belirtti.)",
    "call up – telefon etmek; askere çağırmak\nÖrnek: \"I called up the clinic to reschedule my appointment.\" (Randevumu ertelemek için kliniği aradım.)",
    "calm down – sakinleşmek, yatıştırmak\nÖrnek: \"It took a while for the crying baby to calm down.\" (Ağlayan bebeğin sakinleşmesi biraz zaman aldı.)",
    "cancel out – birbirini geçersiz kılmak, dengelemek\nÖrnek: \"The extra costs cancel out the discount we received.\" (Ekstra masraflar, aldığımız indirimi dengeliyor.)",
    "care for – bakmak, ilgilenmek; hoşlanmak\nÖrnek: \"She left her job to care for her elderly father.\" (Yaşlı babasına bakmak için işini bıraktı.)",
    "carry on (with) – sürdürmek, devam etmek\nÖrnek: \"Despite the rain, the runners carried on with the marathon.\" (Yağmura rağmen koşucular maratona devam etti.)",
    "carry out – yapmak, gerçekleştirmek, yürütmek\nÖrnek: \"The team carried out extensive tests before launching the product.\" (Ekip, ürünü piyasaya sürmeden önce kapsamlı testler gerçekleştirdi.)",
    "carry over – bir sonraki döneme taşımak, ertelemek\nÖrnek: \"Unused vacation days can be carried over to next year.\" (Kullanılmayan izin günleri gelecek yıla taşınabilir.)",
    "catch up on – geride kalınan bir şeyi telafi etmek\nÖrnek: \"I spent the weekend catching up on missed sleep.\" (Hafta sonunu kaçırdığım uykuyu telafi etmekle geçirdim.)",
    "clean off – yüzeyi silmek\nÖrnek: \"He quickly cleaned off the table before the guests arrived.\" (Misafirler gelmeden önce masayı hızlıca sildi.)",
    "clean out – içini tamamen temizlemek\nÖrnek: \"We finally cleaned out the garage over the long weekend.\" (Uzun hafta sonunda sonunda garajı tamamen temizledik.)",
    "charge with – suçlamak\nÖrnek: \"Police charged the driver with reckless driving after the accident.\" (Polis, kazadan sonra sürücüyü kurallara aykırı sürüşle suçladı.)",
    "check for – bir şeyi aramaya/kontrol etmeye çalışmak\nÖrnek: \"The doctor checked for any signs of infection.\" (Doktor, herhangi bir enfeksiyon belirtisi olup olmadığını kontrol etti.)",
    "check into – araştırmak; bir yere giriş yapmak\nÖrnek: \"We checked into the hotel late after our flight was delayed.\" (Uçağımız gecikince otele geç saatte giriş yaptık.)",
    "check on – kontrol etmek, yoklamak\nÖrnek: \"She checked on her sleeping baby every hour.\" (Uyuyan bebeğini her saat başı kontrol etti.)",
    "check out – bir yerden ayrılmak; göz atmak, incelemek\nÖrnek: \"You should check out that new bakery downtown.\" (Şehir merkezindeki o yeni fırına bir göz atmalısın.)",
    "check with – birine danışmak\nÖrnek: \"I need to check with my manager before confirming the schedule.\" (Programı onaylamadan önce müdürüme danışmam gerekiyor.)",
    "chip in – masraflara/işe katkıda bulunmak\nÖrnek: \"Everyone chipped in to buy a farewell gift for our colleague.\" (Herkes, iş arkadaşımıza veda hediyesi almak için katkıda bulundu.)",
    "chop off – kesip koparmak\nÖrnek: \"The chef chopped off the ends of the carrots quickly.\" (Şef, havuçların uçlarını hızlıca kesip attı.)",
    "clear away – toplayıp kaldırmak\nÖrnek: \"The waiter cleared away the plates as soon as we finished.\" (Garson, biz bitirir bitirmez tabakları toplayıp kaldırdı.)",
    "clear out – derleyip toparlamak, boşaltmak\nÖrnek: \"It's time to clear out the old clothes we never wear.\" (Artık giymediğimiz eski kıyafetleri boşaltmanın zamanı geldi.)",
    "clear up – açıklığa kavuşturmak, düzeltmek; (hava) açmak\nÖrnek: \"The manager cleared up the confusion about the new policy.\" (Müdür, yeni politikayla ilgili karışıklığı açıklığa kavuşturdu.)",
    "close down – kapatmak (işyeri, fabrika)\nÖrnek: \"The factory closed down after decades of production.\" (Fabrika, on yıllarca üretimden sonra kapatıldı.)",
    "close up – geçici olarak kapatmak\nÖrnek: \"The small shop closes up early every Sunday afternoon.\" (Küçük dükkan her pazar öğleden sonra erken kapanıyor.)",
    "comb out – tarayarak ayıklamak\nÖrnek: \"She gently combed out the knots in her daughter's wet hair.\" (Kızının ıslak saçındaki düğümleri nazikçe tarayarak açtı.)",
    "come across – rastlamak, tesadüfen bulmak\nÖrnek: \"I came across an old photo album while cleaning the attic.\" (Tavan arasını temizlerken eski bir fotoğraf albümüne rastladım.)",
    "come after – peşinden gelmek, yerini almak\nÖrnek: \"A period of strict rules came after the scandal.\" (Skandaldan sonra sıkı kuralların olduğu bir dönem geldi.)",
    "come along – birlikte gelmek, katılmak\nÖrnek: \"Why don't you come along with us to the concert?\" (Bizimle konsere gelmeye ne dersin?)",
    "come by – ele geçirmek, edinmek\nÖrnek: \"Good jobs are hard to come by in this small town.\" (Bu küçük kasabada iyi işler bulmak zor.)",
    "come down – hastalanmak; (fiyat) düşmek\nÖrnek: \"Housing prices finally started to come down this year.\" (Konut fiyatları bu yıl sonunda düşmeye başladı.)",
    "come down with – bir hastalığa yakalanmak\nÖrnek: \"He came down with the flu right before the exam.\" (Sınavdan hemen önce gribe yakalandı.)",
    "come from – kaynaklanmak\nÖrnek: \"Most of our vegetables come from a local farm.\" (Sebzelerimizin çoğu yerel bir çiftlikten geliyor.)",
    "come into – miras almak\nÖrnek: \"She came into a large inheritance after her uncle passed away.\" (Amcası vefat ettikten sonra büyük bir mirasa konu oldu.)",
    "come out – ortaya çıkmak, yayınlanmak\nÖrnek: \"The truth about the scandal finally came out last week.\" (Skandalla ilgili gerçek nihayet geçen hafta ortaya çıktı.)",
    "come through – zorlukları atlatmak, beklentiyi karşılamak\nÖrnek: \"Despite the setbacks, the team came through with a great result.\" (Aksiliklere rağmen ekip, harika bir sonuçla beklentiyi karşıladı.)",
    "come up – yaklaşmak, gündeme gelmek\nÖrnek: \"The topic of salaries came up during the staff meeting.\" (Maaş konusu, personel toplantısında gündeme geldi.)",
    "come up with – bir fikir/çözüm bulmak\nÖrnek: \"The engineers came up with a clever solution to the problem.\" (Mühendisler, soruna akıllıca bir çözüm buldu.)",
    "compare with – karşılaştırmak\nÖrnek: \"Prices in the city cannot be compared with those in rural areas.\" (Şehirdeki fiyatlar, kırsal bölgelerdekilerle karşılaştırılamaz.)",
    "compensate for – telafi etmek, dengelemek\nÖrnek: \"The bright lighting compensated for the room's small windows.\" (Parlak aydınlatma, odanın küçük pencerelerini telafi etti.)",
    "comply with – uymak, itaat etmek\nÖrnek: \"All vehicles must comply with the new emission standards.\" (Tüm araçlar yeni emisyon standartlarına uymak zorundadır.)",
    "conceive of – tasavvur etmek, düşünmek\nÖrnek: \"It's hard to conceive of life without smartphones nowadays.\" (Günümüzde akıllı telefonsuz bir hayatı tasavvur etmek zor.)",
    "concern about/for – endişe duymak, ilgilenmek\nÖrnek: \"Parents are increasingly concerned about their children's screen time.\" (Ebeveynler, çocuklarının ekran süresi konusunda giderek daha fazla endişe duyuyor.)",
    "conclude from – bir sonuca varmak, çıkarım yapmak\nÖrnek: \"We can conclude from the data that sales are improving.\" (Verilerden, satışların iyileştiği sonucuna varabiliriz.)",
    "consist in – bir şeye dayanmak, temellenmek\nÖrnek: \"True success consists in staying true to your values.\" (Gerçek başarı, değerlerine sadık kalmaya dayanır.)",
    "cope with – üstesinden gelmek, başa çıkmak\nÖrnek: \"It took her months to learn how to cope with the stress.\" (Stresle başa çıkmayı öğrenmesi aylarını aldı.)",
    "count down – geriye saymak\nÖrnek: \"The whole city counted down to midnight on New Year's Eve.\" (Tüm şehir, yılbaşı gecesi gece yarısına kadar geriye saydı.)",
    "count in – dahil etmek, hesaba katmak\nÖrnek: \"If you're planning a trip to the mountains, count me in.\" (Dağlara gezi planlıyorsanız, beni de dahil edin.)",
    "count on – güvenmek, dayanmak\nÖrnek: \"You can always count on your family in difficult times.\" (Zor zamanlarda her zaman ailene güvenebilirsin.)",
    "count out – hariç tutmak, hesaba katmamak\nÖrnek: \"Don't count me out just because I missed one meeting.\" (Sırf bir toplantıyı kaçırdım diye beni hariç tutma.)",
    "crave for – çok istemek, özlemini çekmek\nÖrnek: \"After the long flight, she craved for a hot shower.\" (Uzun uçuştan sonra sıcak bir duşu çok istedi.)",
    "cut off – kesmek, bağlantıyı koparmak\nÖrnek: \"The storm cut off electricity to the entire village.\" (Fırtına, tüm köyün elektriğini kesti.)",
    "cut out – durdurmak, kesmek (bir alışkanlığı)\nÖrnek: \"The doctor advised him to cut out sugar from his diet.\" (Doktor, diyetinden şekeri kesmesini tavsiye etti.)",
    "cut in – araya girmek, sözünü kesmek\nÖrnek: \"She kept cutting in while her brother was telling the story.\" (Kardeşi hikayeyi anlatırken sürekli sözünü kesti.)",
    "cut up – küçük parçalara bölmek\nÖrnek: \"He cut up the vegetables before adding them to the soup.\" (Sebzeleri çorbaya eklemeden önce küçük parçalara böldü.)",
  ];

  const phrasalVerbGlossaryEntries2 = [
    "dash out – aniden fırlayıp çıkmak\nÖrnek: \"She dashed out of the office the moment she remembered the meeting.\" (Toplantıyı hatırlar hatırlamaz ofisten aniden fırlayıp çıktı.)",
    "deduce from – bir sonuç çıkarmak\nÖrnek: \"The detective deduced from the muddy footprints that the thief had climbed through the garden.\" (Dedektif çamurlu ayak izlerinden hırsızın bahçeden tırmandığı sonucunu çıkardı.)",
    "depend on – güvenmek, bağlı olmak\nÖrnek: \"Whether the picnic happens depends on tomorrow's weather forecast.\" (Pikniğin olup olmayacağı yarınki hava durumu tahminine bağlı.)",
    "derive from – kaynaklanmak, türemek\nÖrnek: \"Many English words derive from Latin and Greek roots.\" (Birçok İngilizce kelime Latince ve Yunanca köklerden türer.)",
    "die out – nesli tükenmek, yok olmak\nÖrnek: \"Several frog species are dying out because of water pollution.\" (Su kirliliği yüzünden birkaç kurbağa türünün nesli tükeniyor.)",
    "do away with – ortadan kaldırmak, bertaraf etmek\nÖrnek: \"The new manager did away with unnecessary paperwork in the office.\" (Yeni müdür ofisteki gereksiz evrak işlerini ortadan kaldırdı.)",
    "do without – bir şey olmadan idare etmek\nÖrnek: \"During the trip we had to do without hot water for three days.\" (Gezi sırasında üç gün sıcak su olmadan idare etmek zorunda kaldık.)",
    "doze off – kısa süreli uyuyakalmak\nÖrnek: \"He dozed off in front of the television after a long shift at the hospital.\" (Hastanedeki uzun vardiyanın ardından televizyonun önünde kısa süreliğine uyuyakaldı.)",
    "draw in – içeri çekmek, cezbetmek\nÖrnek: \"The bright shop window drew in curious shoppers from the street.\" (Parlak vitrin sokaktan meraklı alışverişçileri içeri çekti.)",
    "dress up – şık/özel giyinmek\nÖrnek: \"The children dressed up as their favorite superheroes for the party.\" (Çocuklar parti için en sevdikleri süper kahramanlar gibi giyindi.)",
    "drive back – geri püskürtmek\nÖrnek: \"The soldiers managed to drive back the enemy attack at dawn.\" (Askerler şafak vakti düşman saldırısını geri püskürtmeyi başardı.)",
    "drive off – arabayla uzaklaşmak\nÖrnek: \"He waved goodbye and drove off before we could ask his name.\" (El sallayıp, adını sorma fırsatı bulamadan arabayla uzaklaştı.)",
    "drop in – habersiz ziyarete gelmek\nÖrnek: \"My cousin often drops in on Sunday afternoons without calling first.\" (Kuzenim pazar öğleden sonraları önceden aramadan sık sık habersiz ziyarete gelir.)",
    "dust off – tozunu alıp yeniden kullanıma sokmak\nÖrnek: \"She dusted off her old guitar and started practicing again.\" (Eski gitarının tozunu alıp yeniden çalmaya başladı.)",
    "dust out – içindeki tozu almak\nÖrnek: \"We dusted out the attic before storing the winter clothes there.\" (Kış kıyafetlerini oraya koymadan önce tavan arasının içindeki tozu aldık.)",
    "end up – sonunda bir durumda/yerde bulunmak\nÖrnek: \"If you keep spending like that, you will end up broke by summer.\" (Bu şekilde harcamaya devam edersen yaza kadar meteliksiz kalırsın.)",
    "engage in – bir işle uğraşmak, katılmak\nÖrnek: \"The students engaged in a lively debate about climate change.\" (Öğrenciler iklim değişikliği hakkında canlı bir tartışmaya katıldı.)",
    "expose to – maruz bırakmak\nÖrnek: \"Traveling abroad exposed him to cultures he had only read about before.\" (Yurt dışına seyahat etmek onu daha önce sadece kitaplardan okuduğu kültürlere maruz bıraktı.)",
    "face up to – kabullenmek, yüzleşmek\nÖrnek: \"She finally faced up to the fact that the project had failed.\" (Sonunda projenin başarısız olduğu gerçeğiyle yüzleşti.)",
    "fall back (on) – (bir şeye) başvurmak; geri çekilmek\nÖrnek: \"When the plan collapsed, we had to fall back on our savings.\" (Plan suya düşünce birikimlerimize başvurmak zorunda kaldık.)",
    "fall down – çökmek, yere düşmek\nÖrnek: \"The old wooden fence fell down during last night's heavy storm.\" (Eski tahta çit dün geceki şiddetli fırtınada yere düştü.)",
    "fall for – birine aşık olmak; bir hileye kanmak\nÖrnek: \"Tourists often fall for the fake ticket sellers near the train station.\" (Turistler tren istasyonunun yanındaki sahte bilet satıcılarına sıkça kanar.)",
    "fall in with – bir gruba/fikre katılmak, uymak\nÖrnek: \"He fell in with a group of hikers heading to the same summit.\" (Aynı zirveye giden bir grup dağcıya katıldı.)",
    "fall on – saldırmak; (bir tarihe) rastlamak\nÖrnek: \"This year, her birthday falls on a Saturday, so we can celebrate properly.\" (Bu yıl doğum günü cumartesiye denk geliyor, o yüzden düzgün kutlayabiliriz.)",
    "fall out – kavga etmek, küsmek\nÖrnek: \"The two business partners fell out over how to split the profits.\" (İki iş ortağı kârı nasıl paylaşacakları konusunda kavga etti.)",
    "fall through – (plan) suya düşmek, gerçekleşmemek\nÖrnek: \"Our vacation plans fell through when both flights got cancelled.\" (Her iki uçuş da iptal olunca tatil planlarımız suya düştü.)",
    "fend off – savuşturmak, geri püskürtmek\nÖrnek: \"The goalkeeper fended off three dangerous shots in the final minutes.\" (Kaleci son dakikalarda üç tehlikeli şutu savuşturdu.)",
    "fight off – karşı koymak, püskürtmek\nÖrnek: \"Her immune system fought off the infection within a few days.\" (Bağışıklık sistemi enfeksiyonu birkaç gün içinde püskürttü.)",
    "figure on – ummak, beklemek\nÖrnek: \"We figured on finishing the renovation before the guests arrived.\" (Misafirler gelmeden tadilatı bitirmeyi umuyorduk.)",
    "figure out – çözmek, anlamak\nÖrnek: \"It took her an hour to figure out how the new software worked.\" (Yeni yazılımın nasıl çalıştığını anlaması bir saatini aldı.)",
    "figure up – hesaplamak\nÖrnek: \"The accountant figured up the total cost of the office renovation.\" (Muhasebeci ofis tadilatının toplam maliyetini hesapladı.)",
    "fill in – doldurmak\nÖrnek: \"Please fill in your name and address at the top of the form.\" (Lütfen formun üstüne adınızı ve adresinizi doldurun.)",
    "fill out – (form) doldurmak\nÖrnek: \"Passengers must fill out a customs form before the plane lands.\" (Yolcular uçak inmeden önce bir gümrük formu doldurmalıdır.)",
    "fit in (with) – uyum sağlamak\nÖrnek: \"The new intern quickly fit in with the rest of the design team.\" (Yeni stajyer tasarım ekibinin geri kalanıyla hızla uyum sağladı.)",
    "fix up – düzenlemek, ayarlamak\nÖrnek: \"They fixed up the old cottage before renting it out to tourists.\" (Turistlere kiralamadan önce eski kulübeyi düzenlediler.)",
    "find out – öğrenmek, keşfetmek\nÖrnek: \"We found out about the schedule change only an hour before the exam.\" (Sınav programındaki değişikliği sınavdan sadece bir saat önce öğrendik.)",
    "follow through – bir işi sonuna kadar götürmek\nÖrnek: \"He promised to help but never followed through on his word.\" (Yardım edeceğine söz verdi ama sözünü sonuna kadar götürmedi.)",
    "get about – (haber) yayılmak\nÖrnek: \"News of the merger got about the office long before it was official.\" (Birleşme haberi resmileşmeden çok önce ofiste yayıldı.)",
    "get across – anlaşılmasını sağlamak\nÖrnek: \"The teacher used simple diagrams to get the concept across to her students.\" (Öğretmen kavramı öğrencilerine anlatabilmek için basit diyagramlar kullandı.)",
    "get along (with) – iyi geçinmek, anlaşmak\nÖrnek: \"My new roommate and I get along surprisingly well.\" (Yeni ev arkadaşımla şaşırtıcı derecede iyi geçiniyoruz.)",
    "get away (from) – kaçmak, uzaklaşmak\nÖrnek: \"We just wanted to get away from the city for the weekend.\" (Hafta sonu için sadece şehirden uzaklaşmak istedik.)",
    "get away with – cezasını çekmeden yapabilmek\nÖrnek: \"He thought he could get away with copying his friend's homework.\" (Arkadaşının ödevini kopyalayarak cezasız kurtulabileceğini sandı.)",
    "get carried away – kendinden geçmek, ölçüyü kaçırmak\nÖrnek: \"She got carried away decorating the cake and used far too much icing.\" (Pastayı süslerken ölçüyü kaçırıp çok fazla krema kullandı.)",
    "get down – çökmek, moralini bozmak\nÖrnek: \"Don't let the harsh criticism get you down; your work is improving.\" (Sert eleştiriler seni yıldırmasın, işin gelişiyor.)",
    "get into – bir şeye girmek, alışkanlık edinmek\nÖrnek: \"Lately he has gotten into painting as a way to relax after work.\" (Son zamanlarda işten sonra rahatlamak için resim yapma alışkanlığı edindi.)",
    "get off – inmek, ayrılmak; cezadan kurtulmak\nÖrnek: \"Remember to get off the bus at the second stop after the bridge.\" (Köprüden sonraki ikinci durakta otobüsten inmeyi unutma.)",
    "get out of hand – kontrolden çıkmak\nÖrnek: \"The argument between the two neighbors quickly got out of hand.\" (İki komşu arasındaki tartışma hızla kontrolden çıktı.)",
    "get over – atlatmak, üstesinden gelmek\nÖrnek: \"It took him several months to get over the loss of his job.\" (İşini kaybetmeyi atlatması birkaç ayını aldı.)",
    "get rid of – kurtulmak\nÖrnek: \"We finally got rid of the old furniture that was cluttering the garage.\" (Sonunda garajı dağıtan eski mobilyalardan kurtulduk.)",
    "get through – atlatmak, tamamlamak\nÖrnek: \"Somehow the nurses got through the busiest night shift of the year.\" (Hemşireler bir şekilde yılın en yoğun gece vardiyasını atlattı.)",
    "get through to – birine ulaşmak, anlatabilmek\nÖrnek: \"I tried calling three times but couldn't get through to customer support.\" (Üç kez aradım ama müşteri hizmetlerine ulaşamadım.)",
    "give away – vermek, sırrını açıklamak\nÖrnek: \"Please don't give away the ending of the movie to anyone.\" (Lütfen filmin sonunu kimseye açıklama.)",
    "give in (to) – boyun eğmek, pes etmek\nÖrnek: \"After hours of pleading, the parents finally gave in to the child's request.\" (Saatlerce yalvarmanın ardından ebeveynler sonunda çocuğun isteğine boyun eğdi.)",
    "give off – (koku, ışık, ısı) yaymak\nÖrnek: \"The old radiator in the hallway gives off a surprising amount of heat.\" (Koridordaki eski radyatör şaşırtıcı derecede fazla ısı yayıyor.)",
    "give out – dağıtmak; enerjisi tükenmek\nÖrnek: \"Volunteers gave out free water bottles to the marathon runners.\" (Gönüllüler maraton koşucularına ücretsiz su şişeleri dağıttı.)",
    "give up – vazgeçmek, pes etmek\nÖrnek: \"She refused to give up on her dream of becoming a pilot.\" (Pilot olma hayalinden vazgeçmeyi reddetti.)",
    "give way to – yerini bırakmak, boyun eğmek\nÖrnek: \"The old cinema gave way to a modern shopping center last year.\" (Eski sinema geçen yıl yerini modern bir alışveriş merkezine bıraktı.)",
    "go ahead – devam etmek, uygulamaya geçmek\nÖrnek: \"The council decided to go ahead with the new bridge project.\" (Belediye meclisi yeni köprü projesine devam etmeye karar verdi.)",
    "go along with – bir fikre katılmak, uymak\nÖrnek: \"Reluctantly, he went along with his colleagues' decision to change the schedule.\" (İsteksizce de olsa, meslektaşlarının programı değiştirme kararına uydu.)",
    "go by – (zaman) geçmek\nÖrnek: \"The years seemed to go by faster once she started working full-time.\" (Tam zamanlı çalışmaya başladıktan sonra yıllar daha hızlı geçiyormuş gibi geldi.)",
    "go for – çok sevmek, tercih etmek\nÖrnek: \"When it comes to breakfast, I always go for something simple like toast.\" (Kahvaltı söz konusu olduğunda hep tost gibi basit bir şeyi tercih ederim.)",
    "go in for – bir şeye katılmak, ilgi duymak\nÖrnek: \"He has never really gone in for competitive sports.\" (Hiçbir zaman rekabetçi sporlara pek ilgi duymadı.)",
    "go off – (alarm) çalmak; patlamak; (yiyecek) bozulmak\nÖrnek: \"The fire alarm went off right in the middle of the chemistry lesson.\" (Kimya dersinin tam ortasında yangın alarmı çaldı.)",
    "go on – devam etmek\nÖrnek: \"The negotiations went on for nearly six hours before an agreement was reached.\" (Bir anlaşmaya varılana kadar müzakereler neredeyse altı saat devam etti.)",
    "go out – dışarı çıkmak; (ışık) sönmek\nÖrnek: \"The candles went out just as we were about to sing happy birthday.\" (Tam mutlu yıllar söylemek üzereyken mumlar söndü.)",
    "go over – gözden geçirmek\nÖrnek: \"Let's go over the presentation one more time before the client arrives.\" (Müşteri gelmeden önce sunumu bir kez daha gözden geçirelim.)",
    "go through – yaşamak, bir süreçten geçmek\nÖrnek: \"The family went through a difficult time after the factory closed.\" (Fabrika kapandıktan sonra aile zor bir dönem yaşadı.)",
    "go without – bir şey olmadan idare etmek\nÖrnek: \"The hikers had to go without a proper meal for two days.\" (Dağcılar iki gün boyunca düzgün bir yemek olmadan idare etmek zorunda kaldı.)",
    "hail from – bir yerden gelmek, aslen oralı olmak\nÖrnek: \"Our new professor hails from a small coastal town in Portugal.\" (Yeni profesörümüz Portekiz'deki küçük bir sahil kasabasından geliyor.)",
    "hand in – teslim etmek, sunmak\nÖrnek: \"Students must hand in their essays before Friday afternoon.\" (Öğrenciler denemelerini cuma öğleden önce teslim etmelidir.)",
    "hand out – ücretsiz dağıtmak\nÖrnek: \"The teacher handed out the exam papers and asked everyone to stay quiet.\" (Öğretmen sınav kağıtlarını dağıttı ve herkesten sessiz kalmasını istedi.)",
    "hand over – devretmek, teslim etmek\nÖrnek: \"The retiring manager handed over her responsibilities to a younger colleague.\" (Emekli olan müdür sorumluluklarını daha genç bir meslektaşına devretti.)",
    "hang over – (bir tehdit/sorun) üzerinde asılı durmak\nÖrnek: \"The threat of layoffs hung over the factory for several months.\" (İşten çıkarma tehdidi aylarca fabrikanın üzerinde asılı durdu.)",
    "hang up – (telefonu) kapatmak\nÖrnek: \"She hung up the phone before I could explain what had happened.\" (Ne olduğunu açıklayamadan telefonu kapattı.)",
    "haul up – çağırıp azarlamak\nÖrnek: \"The employee was hauled up by his boss for arriving late again.\" (Çalışan yine geç geldiği için patronu tarafından çağrılıp azarlandı.)",
    "head for – bir yöne doğru gitmek, yönelmek\nÖrnek: \"As soon as the bell rang, the students headed for the exit.\" (Zil çalar çalmaz öğrenciler çıkışa yöneldi.)",
    "head off – yolunu kesmek, önlemek\nÖrnek: \"The manager stepped in early to head off any conflict between the two teams.\" (Müdür, iki ekip arasındaki olası bir çatışmayı önlemek için erkenden araya girdi.)",
    "head up – başkanlık etmek, yönetmek\nÖrnek: \"She was chosen to head up the company's new marketing department.\" (Şirketin yeni pazarlama departmanını yönetmek üzere seçildi.)",
    "heap up – biriktirmek, yığmak\nÖrnek: \"Old newspapers heaped up in the corner of the garage for years.\" (Eski gazeteler yıllarca garajın köşesinde yığıldı.)",
    "hit on – (bir fikri) tesadüfen bulmak\nÖrnek: \"The scientists finally hit on a solution after months of testing.\" (Bilim insanları aylarca test yaptıktan sonra sonunda bir çözüm buldu.)",
    "hold back – çekinmek, kısıtlamak\nÖrnek: \"Fear of failure held her back from applying for the scholarship.\" (Başarısızlık korkusu burs başvurusu yapmaktan onu alıkoydu.)",
    "hold on – beklemek, tutunmak\nÖrnek: \"Hold on a second, I need to grab my keys before we leave.\" (Bir saniye bekle, çıkmadan önce anahtarlarımı almam gerekiyor.)",
    "hold out – dayanmak, yetmek\nÖrnek: \"The emergency supplies held out longer than expected during the storm.\" (Acil durum malzemeleri fırtına sırasında beklenenden daha uzun süre dayandı.)",
    "hold up – geciktirmek, ertelemek; soymak\nÖrnek: \"Heavy traffic held up the delivery truck for almost two hours.\" (Yoğun trafik teslimat kamyonunu neredeyse iki saat geciktirdi.)",
  ];

  const phrasalVerbGlossaryEntries3 = [
    "infer from – bir sonuç çıkarmak\nÖrnek: \"From her silence, I inferred that the negotiation had failed.\" (Sessizliğinden, müzakerenin başarısız olduğu sonucunu çıkardım.)",
    "inflict on – (ceza/acı) vermek, uygulamak\nÖrnek: \"The heavy tax inflicted real hardship on small business owners.\" (Ağır vergi, küçük işletme sahiplerine gerçek bir zorluk getirdi.)",
    "interfere with – engel olmak, müdahale etmek\nÖrnek: \"Loud construction noise kept interfering with our online class.\" (Yüksek inşaat gürültüsü, çevrimiçi dersimize sürekli engel oluyordu.)",
    "join in – katılmak\nÖrnek: \"Everyone at the picnic joined in the singing around the fire.\" (Pikniktekilerin hepsi ateşin etrafında söylenen şarkıya katıldı.)",
    "jot down – kısaca not almak\nÖrnek: \"She quickly jotted down the doctor's instructions before leaving the clinic.\" (Klinikten ayrılmadan önce doktorun talimatlarını hızlıca not aldı.)",
    "keep an eye on – gözünü üzerinde tutmak, korumak\nÖrnek: \"Could you keep an eye on my laptop while I get coffee?\" (Ben kahve alırken dizüstü bilgisayarıma göz kulak olur musun?)",
    "keep at – bir şeyi ısrarla sürdürmek\nÖrnek: \"He kept at his guitar practice every evening for a year.\" (Bir yıl boyunca her akşam gitar çalışmayı ısrarla sürdürdü.)",
    "keep away (from) – uzak durmak\nÖrnek: \"Doctors advised him to keep away from salty food after surgery.\" (Doktorlar ameliyattan sonra tuzlu yiyeceklerden uzak durmasını tavsiye etti.)",
    "keep back – geride tutmak, saklamak\nÖrnek: \"The teacher kept back two students for extra help after class.\" (Öğretmen, dersten sonra ekstra yardım için iki öğrenciyi alıkoydu.)",
    "keep down – kontrol altında tutmak, bastırmak\nÖrnek: \"The company cut overtime to keep costs down this quarter.\" (Şirket, bu çeyrekte maliyetleri düşük tutmak için fazla mesaiyi azalttı.)",
    "keep from – engellemek, vermemek\nÖrnek: \"Nothing could keep him from finishing the marathon that day.\" (O gün hiçbir şey onu maratonu bitirmekten alıkoyamadı.)",
    "keep hold of – sıkıca tutmak, elden bırakmamak\nÖrnek: \"Keep hold of the railing while the ferry crosses rough water.\" (Feribot dalgalı sularda geçerken korkuluğu sıkıca tut.)",
    "keep on – devam etmek\nÖrnek: \"She kept on typing even after the deadline had passed.\" (Son teslim tarihi geçtikten sonra bile yazmaya devam etti.)",
    "keep out – dışarıda tutmak, girmemek\nÖrnek: \"The thick curtains keep out most of the afternoon sun.\" (Kalın perdeler öğleden sonraki güneşin çoğunu dışarıda tutuyor.)",
    "keep up – sürdürmek, korumak\nÖrnek: \"He struggled to keep up the pace during the last lap.\" (Son turda hızı korumakta zorlandı.)",
    "keep up with – aynı seviyeyi/hızı yakalamak\nÖrnek: \"New employees often find it hard to keep up with the workload.\" (Yeni çalışanlar genellikle iş yüküne ayak uydurmakta zorlanır.)",
    "kick out – işten/bir yerden atmak\nÖrnek: \"The bar kicked out two customers for starting a fight.\" (Bar, kavga çıkardıkları için iki müşteriyi dışarı attı.)",
    "lay down – yere koymak, belirlemek (kural)\nÖrnek: \"The manager laid down strict rules about using company phones.\" (Müdür, şirket telefonlarının kullanımı hakkında sıkı kurallar koydu.)",
    "lay off – işten çıkarmak\nÖrnek: \"The factory had to lay off dozens of workers last month.\" (Fabrika geçen ay onlarca işçiyi işten çıkarmak zorunda kaldı.)",
    "leave on – (ışık, cihaz) açık bırakmak\nÖrnek: \"She always leaves the porch light on when she expects guests.\" (Misafir beklediğinde her zaman veranda ışığını açık bırakır.)",
    "leave out – dışarıda bırakmak, atlamak\nÖrnek: \"The recipe leaves out an important step about resting the dough.\" (Tarif, hamuru dinlendirme konusundaki önemli bir adımı atlıyor.)",
    "let alone – şöyle dursun, bir yana\nÖrnek: \"He can't boil an egg, let alone cook a full dinner.\" (Yumurta bile haşlayamıyor, tam bir akşam yemeği pişirmek şöyle dursun.)",
    "let down – hayal kırıklığına uğratmak\nÖrnek: \"I felt like I had let down my whole team after the mistake.\" (Hatadan sonra tüm takımımı hayal kırıklığına uğrattığımı hissettim.)",
    "let on – sır vermek, açığa vurmak\nÖrnek: \"She didn't let on that she already knew about the surprise party.\" (Sürpriz partiyi çoktan bildiğini belli etmedi.)",
    "let out – dışarı bırakmak, izin vermek; gevşetmek\nÖrnek: \"The teacher let the students out early because of the storm.\" (Öğretmen, fırtına yüzünden öğrencileri erken bıraktı.)",
    "let slide – ihmal etmek, gözden kaçırmak\nÖrnek: \"He let his diet slide during the busy holiday season.\" (Yoğun tatil sezonunda diyetini ihmal etti.)",
    "let up – hafiflemek, hız kesmek\nÖrnek: \"The rain finally let up just before the match started.\" (Yağmur, maç başlamadan hemen önce nihayet hafifledi.)",
    "lie in – bir şeye dayanmak, temellenmek\nÖrnek: \"The company's strength lies in its loyal customer base.\" (Şirketin gücü, sadık müşteri tabanına dayanıyor.)",
    "lift up – yukarı kaldırmak\nÖrnek: \"The father lifted up his daughter so she could see the parade.\" (Baba, geçit törenini görebilmesi için kızını yukarı kaldırdı.)",
    "light up – aydınlatmak; (sigara) yakmak\nÖrnek: \"Fireworks lit up the night sky over the harbor.\" (Havai fişekler, limanın üzerindeki gece gökyüzünü aydınlattı.)",
    "long for – özlemini duymak, çok istemek\nÖrnek: \"After months abroad, she longed for her mother's home cooking.\" (Aylarca yurt dışında kaldıktan sonra annesinin ev yemeğini özledi.)",
    "look afresh (at) – bir şeye yeni bir gözle bakmak\nÖrnek: \"The new manager asked the team to look afresh at the old workflow.\" (Yeni müdür, ekipten eski iş akışına yeni bir gözle bakmasını istedi.)",
    "look after – bakmak, ilgilenmek\nÖrnek: \"My grandmother looked after us every summer while our parents worked.\" (Ailem çalışırken büyükannem her yaz bize baktı.)",
    "look beyond – ileriye bakmak, mevcut durumun ötesine bakmak\nÖrnek: \"Investors need to look beyond this quarter's disappointing numbers.\" (Yatırımcıların bu çeyreğin hayal kırıklığı yaratan rakamlarının ötesine bakması gerekiyor.)",
    "look down on – küçümsemek, hor görmek\nÖrnek: \"He never looked down on colleagues who started with less experience.\" (Daha az deneyimle başlayan meslektaşlarını hiçbir zaman küçümsemedi.)",
    "look forward to – dört gözle beklemek\nÖrnek: \"We are really looking forward to visiting Istanbul next spring.\" (Gelecek bahar İstanbul'u ziyaret etmeyi dört gözle bekliyoruz.)",
    "look into – araştırmak, incelemek\nÖrnek: \"The airline promised to look into the missing luggage complaint.\" (Havayolu, kayıp bagaj şikayetini araştıracağına söz verdi.)",
    "look over – gözden geçirmek\nÖrnek: \"Please look over the contract before you sign anything.\" (Herhangi bir şey imzalamadan önce lütfen sözleşmeyi gözden geçir.)",
    "look through – göz atmak, incelemek\nÖrnek: \"She looked through dozens of resumes before choosing three candidates.\" (Üç aday seçmeden önce onlarca özgeçmişi inceledi.)",
    "lose ground – gücünü/itibarını kaybetmek\nÖrnek: \"The local bakery is losing ground to the new supermarket chain.\" (Yerel fırın, yeni süpermarket zincirine karşı güç kaybediyor.)",
    "lust after/for – aşırı arzu duymak\nÖrnek: \"Some collectors openly lust after rare first-edition novels.\" (Bazı koleksiyoncular, nadir ilk baskı romanlara açıkça aşırı arzu duyar.)",
    "make off (with) – çalıp kaçmak\nÖrnek: \"The thief made off with two bicycles from the courtyard.\" (Hırsız, avludan iki bisikleti çalıp kaçtı.)",
    "make do with – idare etmek, yetinmek\nÖrnek: \"During the trip we had to make do with a tiny hostel room.\" (Gezi boyunca minik bir hostel odasıyla idare etmek zorunda kaldık.)",
    "make for – bir yöne doğru gitmek\nÖrnek: \"As soon as the bell rang, the kids made for the playground.\" (Zil çalar çalmaz çocuklar oyun alanına doğru koştu.)",
    "make into – dönüştürmek\nÖrnek: \"They made the old warehouse into a trendy coffee shop.\" (Eski depoyu şık bir kahve dükkanına dönüştürdüler.)",
    "make of – bir şey hakkında ne düşünmek\nÖrnek: \"I don't know what to make of his sudden resignation.\" (Onun ani istifası hakkında ne düşüneceğimi bilmiyorum.)",
    "make out – anlamak, seçebilmek; (çek) doldurmak\nÖrnek: \"Through the fog, we could barely make out the lighthouse.\" (Sisin içinden deniz fenerini zar zor seçebildik.)",
    "make over – devretmek, üzerine geçirmek\nÖrnek: \"Her grandfather made over the family shop to her last year.\" (Dedesi geçen yıl aile dükkanını ona devretti.)",
    "make use of – yararlanmak, kullanmak\nÖrnek: \"Students should make use of the free tutoring center on campus.\" (Öğrenciler kampüsteki ücretsiz özel ders merkezinden yararlanmalı.)",
    "make up – uydurmak; barışmak; oluşturmak\nÖrnek: \"The two sisters made up quickly after their small argument.\" (İki kardeş küçük tartışmalarından sonra hızla barıştı.)",
    "make up for – telafi etmek\nÖrnek: \"He worked extra hours to make up for the missed deadline.\" (Kaçırdığı son teslim tarihini telafi etmek için fazladan çalıştı.)",
    "mean to – kesinlikle niyet etmek\nÖrnek: \"I meant to call you back yesterday, but the day got busy.\" (Dün seni geri aramayı kesinlikle niyet etmiştim ama gün yoğun geçti.)",
    "meddle with – burnunu sokmak, karışmak\nÖrnek: \"He warned his brother not to meddle with his business decisions.\" (Kardeşine iş kararlarına burnunu sokmaması konusunda uyardı.)",
    "move in – taşınmak\nÖrnek: \"The new tenants are moving in to the apartment this weekend.\" (Yeni kiracılar bu hafta sonu daireye taşınıyor.)",
    "move over – kenara çekilmek\nÖrnek: \"Could you move over a little so I can sit down too?\" (Ben de oturabileyim diye biraz kenara kayar mısın?)",
    "object to – itiraz etmek, karşı çıkmak\nÖrnek: \"Several residents objected to the plan to close the local park.\" (Birçok sakin, yerel parkı kapatma planına itiraz etti.)",
    "originate from – kaynaklanmak, doğmak\nÖrnek: \"This particular tradition originates from a small fishing village.\" (Bu özel gelenek, küçük bir balıkçı köyünden kaynaklanıyor.)",
    "overlook – gözden kaçırmak, görmezden gelmek\nÖrnek: \"The editor overlooked a small typo on the front page.\" (Editör, ön sayfadaki küçük bir yazım hatasını gözden kaçırdı.)",
    "own up (to) – itiraf etmek\nÖrnek: \"The intern finally owned up to deleting the shared file.\" (Stajyer sonunda paylaşılan dosyayı sildiğini itiraf etti.)",
    "pan out – iyi sonuçlanmak, başarılı olmak\nÖrnek: \"Their risky business plan eventually panned out after a rough start.\" (Zorlu bir başlangıçtan sonra riskli iş planları sonunda iyi sonuçlandı.)",
    "pass out – bayılmak; dağıtmak\nÖrnek: \"The volunteers passed out water bottles to the marathon runners.\" (Gönüllüler, maraton koşucularına su şişeleri dağıttı.)",
    "pass on – (bilgi) iletmek, aktarmak\nÖrnek: \"Please pass on my regards to your parents when you see them.\" (Onları gördüğünde selamımı ailene ilet lütfen.)",
    "pass up – (fırsatı) kaçırmak\nÖrnek: \"He didn't want to pass up such a rare job opportunity.\" (Böylesine nadir bir iş fırsatını kaçırmak istemedi.)",
    "pay off – borcu tamamen ödemek; karşılığını vermek\nÖrnek: \"Years of hard studying finally paid off when she passed the bar exam.\" (Yıllarca süren sıkı çalışma, baro sınavını geçtiğinde sonunda karşılığını verdi.)",
    "peer into – dikkatle bakmak, gözlemek\nÖrnek: \"The scientist peered into the microscope to check the sample.\" (Bilim insanı, numuneyi kontrol etmek için mikroskoba dikkatle baktı.)",
    "peer out (of) – aralıktan gözlemek\nÖrnek: \"The cat peered out of the box whenever someone entered the room.\" (Kedi, odaya biri girdiğinde kutunun aralığından dışarı bakıyordu.)",
    "pile up – birikmek, yığılmak\nÖrnek: \"Unread emails kept piling up while she was on vacation.\" (Tatildeyken okunmamış e-postalar birikmeye devam etti.)",
    "pine for – özlemini çekmek\nÖrnek: \"The old sailor still pines for the sea years after retiring.\" (Yaşlı denizci, emekli olduktan yıllar sonra hâlâ denizin özlemini çekiyor.)",
    "play down – önemsememek, küçümsemek\nÖrnek: \"The spokesperson tried to play down the seriousness of the delay.\" (Sözcü, gecikmenin ciddiyetini önemsizmiş gibi göstermeye çalıştı.)",
    "play up – abartmak, üzerinde durmak\nÖrnek: \"The advertisement played up the phone's camera far more than its battery.\" (Reklam, telefonun kamerasını pilinden çok daha fazla öne çıkardı.)",
    "pluck up (courage) – cesaret toplamak\nÖrnek: \"It took her weeks to pluck up the courage to ask for a raise.\" (Zam istemek için cesaret toplaması haftalar sürdü.)",
    "point out – belirtmek, dikkat çekmek\nÖrnek: \"The guide pointed out several historic buildings along the tour.\" (Rehber, tur boyunca birkaç tarihi binaya dikkat çekti.)",
    "press on – ısrarla devam etmek\nÖrnek: \"Despite the heavy rain, the hikers decided to press on to the summit.\" (Şiddetli yağmura rağmen, yürüyüşçüler zirveye doğru ısrarla devam etmeye karar verdi.)",
    "pull down – yıkmak\nÖrnek: \"The city plans to pull down the old cinema next month.\" (Belediye, gelecek ay eski sinemayı yıkmayı planlıyor.)",
    "pull out (of) – bir yerden/işten çekilmek\nÖrnek: \"The sponsor unexpectedly pulled out of the charity event.\" (Sponsor, hayır etkinliğinden beklenmedik şekilde çekildi.)",
    "pull through – (hastalıktan) iyileşmek, atlatmak\nÖrnek: \"Doctors were confident the patient would pull through after surgery.\" (Doktorlar, hastanın ameliyattan sonra iyileşeceğinden emindi.)",
    "pull up – (araç) durmak; kökünden sökmek\nÖrnek: \"A taxi pulled up right in front of the hotel entrance.\" (Bir taksi, otel girişinin tam önünde durdu.)",
    "put across – (fikri) anlatabilmek\nÖrnek: \"The professor found a simple way to put across a complex theory.\" (Profesör, karmaşık bir teoriyi anlatmak için basit bir yol buldu.)",
    "put an end to – son vermek\nÖrnek: \"The new law put an end to years of unfair pricing.\" (Yeni yasa, yıllarca süren haksız fiyatlandırmaya son verdi.)",
    "put away – kaldırmak, saklamak\nÖrnek: \"She put away her winter clothes as soon as spring arrived.\" (Bahar gelir gelmez kışlık kıyafetlerini kaldırdı.)",
    "put down – yere koymak; eleştirmek, küçümsemek\nÖrnek: \"He gently put down the sleeping baby in the crib.\" (Uyuyan bebeği nazikçe beşiğe koydu.)",
    "put forward – önermek, teklif etmek\nÖrnek: \"The committee put forward a new proposal for the budget.\" (Komite, bütçe için yeni bir öneri sundu.)",
    "put into – uygulamaya koymak\nÖrnek: \"The startup put its new marketing strategy into action last week.\" (Girişim, geçen hafta yeni pazarlama stratejisini uygulamaya koydu.)",
    "put off – ertelemek, caydırmak\nÖrnek: \"They put off the wedding until after the exam season.\" (Düğünü sınav döneminden sonrasına erteledi.)",
    "put on – giymek; kilo almak; sahnelemek\nÖrnek: \"She put on her coat quickly before running out into the snow.\" (Kar yağışına koşmadan önce hızlıca montunu giydi.)",
    "put out – söndürmek\nÖrnek: \"Firefighters managed to put out the blaze within an hour.\" (İtfaiyeciler yangını bir saat içinde söndürmeyi başardı.)",
    "put right – düzeltmek, ayarlamak\nÖrnek: \"The technician put right the wiring problem in under ten minutes.\" (Teknisyen, kablo sorununu on dakikadan kısa sürede düzeltti.)",
    "put through – (telefonu) bağlamak; başarıyla sonuçlandırmak\nÖrnek: \"The receptionist put me through to the sales department right away.\" (Resepsiyonist beni hemen satış departmanına bağladı.)",
    "put together – bir araya getirmek, monte etmek\nÖrnek: \"It took him an entire afternoon to put together the bookshelf.\" (Kitaplığı bir araya getirmesi tüm öğleden sonrasını aldı.)",
    "put up – misafir etmek; asmak\nÖrnek: \"My cousin agreed to put us up for the weekend in Izmir.\" (Kuzenim, hafta sonu bizi İzmir'de misafir etmeyi kabul etti.)",
    "put up for (sale) – satışa çıkarmak\nÖrnek: \"The family finally put the old farmhouse up for sale.\" (Aile sonunda eski çiftlik evini satışa çıkardı.)",
    "put up with – katlanmak, tahammül etmek\nÖrnek: \"I don't know how she puts up with such a noisy neighborhood.\" (Böylesine gürültülü bir mahalleye nasıl katlandığını bilmiyorum.)",
    "range from...to... – ...den ...e kadar değişmek\nÖrnek: \"Prices at the market range from very cheap to surprisingly expensive.\" (Pazardaki fiyatlar çok ucuzdan şaşırtıcı derecede pahalıya kadar değişiyor.)",
    "read out – yüksek sesle okumak\nÖrnek: \"The teacher read out the exam results in front of the class.\" (Öğretmen, sınav sonuçlarını sınıfın önünde yüksek sesle okudu.)",
    "rebel against – isyan etmek\nÖrnek: \"Many teenagers rebel against their parents' strict rules at some point.\" (Birçok genç, bir noktada ailesinin katı kurallarına isyan eder.)",
    "refrain from – kaçınmak, çekinmek\nÖrnek: \"Passengers are asked to refrain from using phones during takeoff.\" (Yolculardan kalkış sırasında telefon kullanmaktan kaçınmaları isteniyor.)",
    "release from – serbest bırakmak\nÖrnek: \"The hospital released him from care after just two days.\" (Hastane, sadece iki gün sonra onu tedaviden serbest bıraktı.)",
    "relieve of – kurtarmak, hafifletmek\nÖrnek: \"The new assistant relieved her of most of the paperwork.\" (Yeni asistan, onu evrak işlerinin çoğundan kurtardı.)",
    "rely on – güvenmek, bağlı olmak\nÖrnek: \"Small farmers here still rely heavily on the seasonal rains.\" (Buradaki küçük çiftçiler hâlâ büyük ölçüde mevsimsel yağmurlara güveniyor.)",
    "resort to – çaresiz kalınca başvurmak\nÖrnek: \"The negotiators finally resorted to a compromise neither side liked.\" (Müzakereciler sonunda hiçbir tarafın sevmediği bir uzlaşmaya başvurdu.)",
    "rest on – dayanmak, temellenmek\nÖrnek: \"The whole argument rests on a single, questionable assumption.\" (Tüm tartışma tek ve şüpheli bir varsayıma dayanıyor.)",
    "rid of (get rid of) – kurtulmak\nÖrnek: \"It took an entire weekend to get rid of the garage clutter.\" (Garajdaki dağınıklıktan kurtulmak koca bir hafta sonunu aldı.)",
    "rinse off – yüzeyini durulamak\nÖrnek: \"He rinsed off the muddy boots before stepping into the house.\" (Eve girmeden önce çamurlu botları durulayarak temizledi.)",
    "rinse out – içini durulamak\nÖrnek: \"Remember to rinse out the bottle before recycling it.\" (Şişeyi geri dönüşüme atmadan önce içini durulamayı unutma.)",
    "rise up – ayaklanmak, isyan etmek\nÖrnek: \"Citizens rose up against the sudden increase in bread prices.\" (Vatandaşlar, ekmek fiyatlarındaki ani artışa karşı ayaklandı.)",
    "rip off – kazıklamak, dolandırmak\nÖrnek: \"The tourist felt ripped off after paying triple the normal taxi fare.\" (Turist, normal taksi ücretinin üç katını ödedikten sonra kazıklandığını hissetti.)",
    "root out – kökünden söküp atmak, yok etmek\nÖrnek: \"The new director promised to root out corruption in the department.\" (Yeni müdür, departmandaki yolsuzluğu kökünden söküp atacağına söz verdi.)",
    "rule out – olasılığı dışlamak, elemek\nÖrnek: \"Doctors ruled out any serious infection after running several tests.\" (Doktorlar, birkaç test yaptıktan sonra ciddi bir enfeksiyon olasılığını dışladı.)",
    "run across – rastlamak, tesadüfen bulmak\nÖrnek: \"I ran across an old photo of us while cleaning the attic.\" (Tavan arasını temizlerken bize ait eski bir fotoğrafa rastladım.)",
    "run after – peşinden koşmak\nÖrnek: \"The dog happily ran after the ball across the park.\" (Köpek, parkın içinde topun peşinden mutlu bir şekilde koştu.)",
    "run away – kaçmak\nÖrnek: \"The cat ran away the moment it heard the vacuum cleaner.\" (Kedi, elektrikli süpürgeyi duyar duymaz kaçtı.)",
    "run down – gücünü kaybetmek, yıpranmak; araçla çarpmak\nÖrnek: \"The old battery had completely run down by the morning.\" (Eski pil, sabaha kadar tamamen bitmişti.)",
    "run into – tesadüfen karşılaşmak\nÖrnek: \"I ran into my old classmate at the airport yesterday.\" (Dün havaalanında eski sınıf arkadaşımla tesadüfen karşılaştım.)",
    "run off – kaçmak; çoğaltmak\nÖrnek: \"The secretary quickly ran off fifty copies of the agenda.\" (Sekreter, gündemin elli kopyasını hızla çoğalttı.)",
    "run out (of) – tükenmek, bitmek\nÖrnek: \"We ran out of printer paper right before the big meeting.\" (Büyük toplantıdan hemen önce yazıcı kağıdımız tükendi.)",
  ];

  const phrasalVerbGlossaryEntries4 = [
  "run over – araçla ezmek; (bir konuyu) tekrar gözden geçirmek\nÖrnek: \"Can we run over the presentation one more time before the meeting?\" (Toplantıdan önce sunumu bir kez daha gözden geçirebilir miyiz?)",
  "run up – hızla biriktirmek (borç)\nÖrnek: \"He ran up a huge credit card bill while traveling abroad.\" (Yurt dışında seyahat ederken kredi kartına büyük bir borç biriktirdi.)",
  "scare up – zorlukla bulup ortaya çıkarmak\nÖrnek: \"She managed to scare up enough chairs for all the guests.\" (Tüm misafirler için yeterince sandalyeyi zorlukla bulmayı başardı.)",
  "scrape along – kıt kanaat geçinmek\nÖrnek: \"The young couple scraped along on a tiny student budget.\" (Genç çift, küçük bir öğrenci bütçesiyle kıt kanaat geçindi.)",
  "scrape away/off – kazıyarak temizlemek\nÖrnek: \"He scraped the old paint off the wooden fence before repainting it.\" (Yeniden boyamadan önce ahşap çitteki eski boyayı kazıyarak temizledi.)",
  "scrape up – zorlukla/kıt kanaat toplamak\nÖrnek: \"They scraped up just enough money for the bus tickets home.\" (Eve dönüş otobüs biletleri için tam yeterli parayı zar zor topladılar.)",
  "seal off – bir bölgeyi kapatmak, mühürlemek\nÖrnek: \"Police sealed off the street after the accident.\" (Polis kazadan sonra caddeyi kapattı.)",
  "see about – gereğini yapmak, ilgilenmek\nÖrnek: \"I'll see about getting the printer fixed this afternoon.\" (Bu öğleden sonra yazıcının tamir edilmesiyle ilgileneceğim.)",
  "see ahead – ileriyi görmek, öngörmek\nÖrnek: \"Good managers can see ahead and plan for market changes.\" (İyi yöneticiler ileriyi görebilir ve pazar değişikliklerine göre plan yapabilir.)",
  "see off – uğurlamak\nÖrnek: \"We went to the airport to see her off before her flight.\" (Uçuşundan önce onu uğurlamak için havalimanına gittik.)",
  "see through – zorluklara rağmen sonuna kadar götürmek\nÖrnek: \"She was determined to see the project through despite the setbacks.\" (Aksiliklere rağmen projeyi sonuna kadar götürmeye kararlıydı.)",
  "sell out – tükenmek (ürün), tüm bileti satmak\nÖrnek: \"The concert tickets sold out within an hour of going on sale.\" (Konser biletleri satışa çıktıktan bir saat içinde tükendi.)",
  "send off – göndermek, yollamak\nÖrnek: \"She sent off her university application just before the deadline.\" (Üniversite başvurusunu son tarihten hemen önce gönderdi.)",
  "send out – göndermek, yaymak\nÖrnek: \"The company sent out invitations to all its loyal customers.\" (Şirket tüm sadık müşterilerine davetiye gönderdi.)",
  "serve up – (yemek) sunmak\nÖrnek: \"The chef served up a delicious three-course meal for the guests.\" (Şef, misafirler için lezzetli üç çeşit bir yemek sundu.)",
  "set apart – ayırmak, farklı kılmak\nÖrnek: \"Her creativity really sets her apart from the other designers.\" (Yaratıcılığı onu diğer tasarımcılardan gerçekten ayırıyor.)",
  "set aside – bir kenara ayırmak\nÖrnek: \"We set aside some money every month for our summer vacation.\" (Yaz tatilimiz için her ay biraz para bir kenara ayırıyoruz.)",
  "set off – yola çıkmak; (alarm) tetiklemek\nÖrnek: \"We set off for the mountains early in the morning.\" (Sabah erkenden dağlara doğru yola çıktık.)",
  "set out – yola çıkmak; belirtmek, açıklamak\nÖrnek: \"The report sets out the main goals of the new policy clearly.\" (Rapor, yeni politikanın ana hedeflerini açıkça belirtiyor.)",
  "set up – kurmak\nÖrnek: \"They set up a small bakery in the corner of the market.\" (Pazarın bir köşesinde küçük bir fırın kurdular.)",
  "settle down – yerleşmek, sakinleşmek\nÖrnek: \"After years of traveling, he finally settled down in his hometown.\" (Yıllarca seyahat ettikten sonra sonunda memleketine yerleşti.)",
  "settle on – karar vermek\nÖrnek: \"We finally settled on a blue color for the living room walls.\" (Sonunda oturma odası duvarları için mavi renkte karar kıldık.)",
  "shout at – bağırmak\nÖrnek: \"The coach shouted at the players to run faster.\" (Antrenör oyunculara daha hızlı koşmaları için bağırdı.)",
  "show up – ortaya çıkmak, gelmek, gözükmek\nÖrnek: \"He didn't show up for the interview, which surprised everyone.\" (Mülakata gelmedi, bu da herkesi şaşırttı.)",
  "shut off – (motor, cihaz) durdurmak\nÖrnek: \"Please shut off the engine while we wait at the gate.\" (Kapıda beklerken lütfen motoru kapat.)",
  "slam down – hızla vurmak/kapamak\nÖrnek: \"Angry, he slammed the phone down without saying goodbye.\" (Sinirlenerek, vedalaşmadan telefonu hızla kapattı.)",
  "slice off – dilimleyerek kesmek\nÖrnek: \"She sliced off a piece of cheese for the sandwich.\" (Sandviç için bir dilim peynir kesti.)",
  "slide into – kolayca girmek, kaymak\nÖrnek: \"The company slowly slid into debt after losing its biggest client.\" (Şirket, en büyük müşterisini kaybettikten sonra yavaş yavaş borca girdi.)",
  "slow down – yavaşlamak\nÖrnek: \"The doctor told him to slow down and rest more often.\" (Doktor ona yavaşlamasını ve daha sık dinlenmesini söyledi.)",
  "spark off – tetiklemek, başlatmak\nÖrnek: \"The new tax law sparked off protests across the country.\" (Yeni vergi yasası ülke genelinde protestoları tetikledi.)",
  "speak up – yüksek sesle konuşmak\nÖrnek: \"Could you speak up a little? I can barely hear you.\" (Biraz daha yüksek sesle konuşabilir misin? Seni zar zor duyuyorum.)",
  "splash about – etrafa su sıçratmak\nÖrnek: \"The children splashed about happily in the shallow pool.\" (Çocuklar sığ havuzda mutlu bir şekilde etrafa su sıçrattılar.)",
  "stand against – karşı koymak, direnmek\nÖrnek: \"The community stood against the plan to cut down the old trees.\" (Topluluk, eski ağaçların kesilmesi planına karşı koydu.)",
  "stand by – yanında olmak, desteklemek; hazır beklemek\nÖrnek: \"Her friends stood by her throughout the difficult treatment.\" (Arkadaşları zor tedavi süresince onun yanında oldu.)",
  "stand for – temsil etmek, anlamına gelmek\nÖrnek: \"The letters CEO stand for Chief Executive Officer.\" (CEO harfleri Chief Executive Officer anlamına gelir.)",
  "stand on – bir konuda ısrar etmek, dayanmak\nÖrnek: \"He stood on his rights and refused to sign the unfair contract.\" (Haklarında ısrar etti ve haksız sözleşmeyi imzalamayı reddetti.)",
  "stand up – ayağa kalkmak\nÖrnek: \"Everyone stood up when the judge entered the courtroom.\" (Hakim mahkeme salonuna girdiğinde herkes ayağa kalktı.)",
  "step down – istifa etmek, görevi bırakmak\nÖrnek: \"The manager decided to step down after fifteen years in the role.\" (Müdür, on beş yıl sonra görevinden istifa etmeye karar verdi.)",
  "stick to – bir konuya/plana sadık kalmak\nÖrnek: \"It's hard to stick to a diet during the holiday season.\" (Tatil sezonunda bir diyete sadık kalmak zordur.)",
  "stir up – kışkırtmak, tahrik etmek\nÖrnek: \"The rumor stirred up a lot of anger among the employees.\" (Söylenti, çalışanlar arasında büyük bir öfke uyandırdı.)",
  "store up – biriktirmek, saklamak\nÖrnek: \"Squirrels store up nuts before the winter arrives.\" (Sincaplar kış gelmeden önce fındık biriktirir.)",
  "strive for – çaba göstermek, uğraşmak\nÖrnek: \"The team strives for excellence in every project it takes on.\" (Ekip, üstlendiği her projede mükemmellik için çaba gösterir.)",
  "switch off – kapatmak (cihaz)\nÖrnek: \"Remember to switch off the lights before you leave the office.\" (Ofisten çıkmadan önce ışıkları kapatmayı unutma.)",
  "take after – (birine) benzemek\nÖrnek: \"My sister really takes after our grandmother in her sense of humor.\" (Kız kardeşim mizah anlayışı bakımından büyükannemize gerçekten benziyor.)",
  "take away – uzaklaştırmak, elinden almak\nÖrnek: \"The scandal took away much of the politician's public support.\" (Skandal, politikacının kamuoyu desteğinin çoğunu elinden aldı.)",
  "take care of – bakmak, ilgilenmek, halletmek\nÖrnek: \"She takes care of her elderly parents every weekend.\" (Her hafta sonu yaşlı ebeveynlerine bakıyor.)",
  "take down – indirmek, not almak\nÖrnek: \"The secretary took down every detail of the meeting.\" (Sekreter, toplantının her ayrıntısını not aldı.)",
  "take for – sanmak, zannetmek\nÖrnek: \"Don't take him for a fool just because he's quiet.\" (Sessiz olduğu için onu aptal sanma.)",
  "take for granted – hafife almak, doğal karşılamak\nÖrnek: \"We often take clean water for granted until it runs out.\" (Temiz suyu tükenene kadar sıklıkla hafife alırız.)",
  "take hold of – ele geçirmek, saplantı haline getirmek\nÖrnek: \"Fear took hold of the crowd when the alarm went off.\" (Alarm çaldığında korku kalabalığı ele geçirdi.)",
  "take in – içine almak, barındırmak; kandırmak; anlamak\nÖrnek: \"The shelter took in dozens of stray dogs last winter.\" (Barınak geçen kış onlarca sokak köpeğini içine aldı.)",
  "take into (account) – göz önüne almak\nÖrnek: \"You should take the weather into account before planning the hike.\" (Yürüyüşü planlamadan önce havayı göz önüne almalısın.)",
  "take off – çıkarmak (kıyafet); havalanmak\nÖrnek: \"The plane took off an hour late because of the storm.\" (Uçak fırtına yüzünden bir saat gecikmeyle havalandı.)",
  "take on – üstlenmek, işe almak\nÖrnek: \"The firm decided to take on three new engineers this quarter.\" (Şirket bu çeyrekte üç yeni mühendis işe almaya karar verdi.)",
  "take out – dışarı çıkarmak, dışarı davet etmek\nÖrnek: \"He wants to take her out for dinner on Friday night.\" (Cuma akşamı onu akşam yemeğine çıkarmak istiyor.)",
  "take over – devralmak, yönetimi ele geçirmek\nÖrnek: \"Their son will take over the family restaurant next year.\" (Oğulları gelecek yıl aile restoranını devralacak.)",
  "take part in – katılmak\nÖrnek: \"Hundreds of students took part in the charity marathon.\" (Yüzlerce öğrenci hayır maratonuna katıldı.)",
  "take revenge (on) – öç almak, intikam almak\nÖrnek: \"He refused to take revenge on those who had betrayed him.\" (Kendisine ihanet edenlerden öç almayı reddetti.)",
  "take to – hoşlanmak, alışmak\nÖrnek: \"The new puppy quickly took to its new home.\" (Yeni yavru köpek yeni evine hızla alıştı.)",
  "take up – bir hobiye/işe başlamak; yer kaplamak\nÖrnek: \"She decided to take up painting after she retired.\" (Emekli olduktan sonra resim yapmaya başlamaya karar verdi.)",
  "tell off – azarlamak, paylamak\nÖrnek: \"The teacher told the boys off for talking during the exam.\" (Öğretmen sınav sırasında konuştukları için çocukları azarladı.)",
  "think out – enine boyuna düşünmek\nÖrnek: \"He thought the whole strategy out before presenting it to investors.\" (Yatırımcılara sunmadan önce tüm stratejiyi enine boyuna düşündü.)",
  "think over – iyice düşünmek\nÖrnek: \"Please think it over and give me your answer tomorrow.\" (Lütfen iyice düşün ve bana yarın cevabını ver.)",
  "think through – bir şeyi enine boyuna düşünmek\nÖrnek: \"We need to think this decision through before signing anything.\" (Herhangi bir şey imzalamadan önce bu kararı enine boyuna düşünmemiz gerekiyor.)",
  "think up – (fikir) bulmak, uydurmak\nÖrnek: \"The kids thought up a clever excuse for being late.\" (Çocuklar geç kalmak için akıllıca bir bahane uydurdu.)",
  "throw down – yere fırlatmak\nÖrnek: \"He threw his bag down and collapsed onto the sofa.\" (Çantasını yere fırlattı ve koltuğa çöktü.)",
  "throw over – reddetmek, terk etmek\nÖrnek: \"She threw over her old career plans to study medicine instead.\" (Eski kariyer planlarını terk edip tıp okumaya karar verdi.)",
  "throw up – kusmak\nÖrnek: \"The rough boat ride made several passengers throw up.\" (Dalgalı tekne yolculuğu birkaç yolcuyu kusturdu.)",
  "tie up with – ilişkilendirmek, bağlantı kurmak\nÖrnek: \"The findings tie up with what earlier studies had suggested.\" (Bulgular, önceki çalışmaların öne sürdükleriyle bağlantılı.)",
  "touch on – (bir konuya) değinmek\nÖrnek: \"The lecture briefly touched on the causes of climate change.\" (Ders, iklim değişikliğinin nedenlerine kısaca değindi.)",
  "touch up – rötuş yapmak, küçük onarım yapmak\nÖrnek: \"She touched up the scratches on the car door herself.\" (Araba kapısındaki çizikleri kendisi rötuşladı.)",
  "trigger off – tetiklemek\nÖrnek: \"A small spark triggered off the fire in the dry field.\" (Küçük bir kıvılcım kuru tarladaki yangını tetikledi.)",
  "try on – (kıyafet) prova etmek\nÖrnek: \"She tried on several dresses before choosing the red one.\" (Kırmızı olanı seçmeden önce birkaç elbise denedi.)",
  "turn away – geri çevirmek, kovmak\nÖrnek: \"The restaurant had to turn away guests because it was full.\" (Restoran dolu olduğu için misafirleri geri çevirmek zorunda kaldı.)",
  "turn down – reddetmek; (ses, ısı) kısmak\nÖrnek: \"He turned down the job offer because the salary was too low.\" (Maaş çok düşük olduğu için iş teklifini reddetti.)",
  "turn in – teslim etmek; yatmaya gitmek\nÖrnek: \"Students must turn in their essays by Friday afternoon.\" (Öğrenciler denemelerini cuma öğleden sonrasına kadar teslim etmelidir.)",
  "turn off – kapatmak (cihaz)\nÖrnek: \"Don't forget to turn off the stove after cooking.\" (Yemek yaptıktan sonra ocağı kapatmayı unutma.)",
  "turn on – açmak (cihaz)\nÖrnek: \"She turned on the heater as soon as she got home.\" (Eve varır varmaz ısıtıcıyı açtı.)",
  "turn out – ortaya çıkmak, sonuçlanmak\nÖrnek: \"The weather turned out to be perfect for the wedding.\" (Hava, düğün için mükemmel çıktı.)",
  "turn over – ters çevirmek; devretmek\nÖrnek: \"He turned the pancake over carefully so it wouldn't break.\" (Kırılmaması için krepi dikkatlice ters çevirdi.)",
  "turn to – başvurmak, yönelmek\nÖrnek: \"Many small businesses turned to online sales during the crisis.\" (Birçok küçük işletme kriz sırasında çevrimiçi satışa yöneldi.)",
  "turn up – ortaya çıkmak, gelmek; (ses) yükseltmek\nÖrnek: \"He turned up an hour late without any explanation.\" (Herhangi bir açıklama yapmadan bir saat geç geldi.)",
  "vie for – bir şey için yarışmak\nÖrnek: \"Several countries are vying for a spot in the final.\" (Birkaç ülke finalde yer almak için yarışıyor.)",
  "vouch for – kefil olmak, doğrulamak\nÖrnek: \"My professor agreed to vouch for my research skills.\" (Profesörüm araştırma becerilerim için kefil olmayı kabul etti.)",
  "wait on – hizmet etmek, servis yapmak\nÖrnek: \"The waiter waited on our table with great patience.\" (Garson masamıza büyük bir sabırla hizmet etti.)",
  "wait up (for) – biri gelene kadar uyumadan beklemek\nÖrnek: \"Her parents always wait up for her when she comes home late.\" (Ebeveynleri o geç eve geldiğinde her zaman onu uyumadan beklerler.)",
  "ward off – savuşturmak, önlemek\nÖrnek: \"Regular exercise can help ward off certain illnesses.\" (Düzenli egzersiz belirli hastalıkları önlemeye yardımcı olabilir.)",
  "wash off – yüzeyini yıkamak\nÖrnek: \"She washed the mud off her boots before entering the house.\" (Eve girmeden önce çizmelerindeki çamuru yıkadı.)",
  "wash out – içini yıkamak, boyasını çıkarmak\nÖrnek: \"The heavy rain washed out most of the color from the flag.\" (Şiddetli yağmur bayraktaki rengin çoğunu çıkardı.)",
  "wash up – bulaşık yıkamak; her tarafını yıkamak\nÖrnek: \"I'll wash up while you dry the dishes.\" (Sen bulaşıkları kurularken ben yıkarım.)",
  "watch out (for) – dikkat etmek\nÖrnek: \"Watch out for the icy patches on the sidewalk.\" (Kaldırımdaki buzlu yerlere dikkat et.)",
  "water down – sulandırmak, hafifletmek\nÖrnek: \"The committee watered down the proposal to please everyone.\" (Komite, herkesi memnun etmek için teklifi hafifletti.)",
  "wear out – yıpratmak, bitkin düşürmek\nÖrnek: \"Constant travel had really worn out the sales team by December.\" (Sürekli seyahat aralık ayına kadar satış ekibini gerçekten yıpratmıştı.)",
  "wind up – bitirmek, sonlandırmak\nÖrnek: \"They wound up the meeting earlier than expected.\" (Toplantıyı beklenenden daha erken bitirdiler.)",
  "win through – zorluklara rağmen kazanmak\nÖrnek: \"Despite the injuries, the team managed to win through in the end.\" (Sakatlıklara rağmen takım sonunda zorlukları aşarak kazanmayı başardı.)",
  "wipe out – yok etmek, ortadan kaldırmak\nÖrnek: \"The flood wiped out entire crops across the valley.\" (Sel, vadi boyunca tüm ekinleri yok etti.)",
  "withhold from – vermemek, esirgemek\nÖrnek: \"The landlord withheld the deposit from his former tenant.\" (Ev sahibi depozitoyu eski kiracısından esirgedi.)",
  "work on – üzerinde çalışmak, uğraşmak\nÖrnek: \"She has been working on her thesis for six months.\" (Altı aydır tezi üzerinde çalışıyor.)",
  "work out – çözmek; spor yapmak; iyi sonuçlanmak\nÖrnek: \"He works out at the gym three times a week.\" (Haftada üç kez spor salonunda spor yapıyor.)",
  "work up – geliştirmek; kışkırtmak\nÖrnek: \"The speaker worked up the crowd's enthusiasm before the announcement.\" (Konuşmacı, duyurudan önce kalabalığın coşkusunu artırdı.)",
  "wrap up – paketlemek; (işi) bitirmek\nÖrnek: \"Let's wrap up the meeting so everyone can catch their trains.\" (Herkes trenine yetişebilsin diye toplantıyı bitirelim.)",
  "write down – not almak, yazmak\nÖrnek: \"Please write down your phone number before you leave.\" (Ayrılmadan önce lütfen telefon numaranı yaz.)",
  "write out – tam olarak yazmak\nÖrnek: \"The doctor wrote out a prescription for the antibiotics.\" (Doktor antibiyotikler için bir reçete tam olarak yazdı.)",
  "write up – yazıya dökmek, rapor haline getirmek\nÖrnek: \"The scientist wrote up her findings for the journal.\" (Bilim insanı bulgularını dergi için yazıya döktü.)",
  "yearn for – özlemini duymak\nÖrnek: \"After years abroad, he yearned for his mother's cooking.\" (Yıllarca yurt dışında kaldıktan sonra annesinin yemeklerinin özlemini duydu.)",
];

  // --- BEGIN: tense-sorulari custom lesson content (grounded in "YDS Sınav Stratejileri 1" —
  // Tense System, Modality, Passive Voice & Causatives, If & Wish Clauses/Conditionals chapters) ---
  const tenseIntro =
    'YDS\'nin "Gramer Bilgisi" bölümünde "Tense (Zaman) Soruları" başlığı aslında tek bir konuyu değil, birbiriyle sıkı sıkıya bağlı dört ayrı gramer alanını bir arada test eder: fiil çekimleri (tense), kiplik fiiller (modality), edilgen çatı ve ettirgen yapılar (passive voice & causatives) ile koşul cümleleri (conditionals). Bu dört alan sınavda genellikle tek bir cümledeki boşluğu doğru zaman veya yapı ile doldurmanızı isteyen çoktan seçmeli sorular şeklinde karşınıza çıkar. Bu derste her dört alanın da sınavda en sık test edilen kurallarını, cümledeki "ipucu" kelimeleri nasıl yakalayacağınızı ve seçenekleri elerken izleyebileceğiniz pratik adımları bulacaksınız.\n\n' +
    "Zaman Bağlaçları: Cümlenin İçindeki Gizli Formül\nTense sorularının büyük bir kısmı, aslında fiil bilgisinden çok cümledeki zaman ifadelerini doğru okuyup okuyamadığınızı ölçer. \"So far\", \"since\", \"by the time\", \"when\", \"before\", \"after\" ve \"as soon as\" gibi ifadelerin her biri belirli bir zaman yapısını dayatır ve bu ifadeleri gördüğünüzde önce altlarını çizmek işinizi kolaylaştırır. \"So far\" ve \"since\" bir başlangıç noktasından şu ana uzanan bir süreci işaret ettiği için genellikle \"have/has V3\" ile birlikte çalışır; \"by the time\" ise iki farklı zaman düzleminde kullanılabilir: yan cümlecik geçmiş zamanda çekimlenmişse ana cümlecikte \"had V3\" (Past Perfect), yan cümlecik şimdiki zamanda çekimlenmişse ana cümlecikte \"will have V3\" (Future Perfect) beklenir. \"When\", \"before\", \"after\" ve \"as soon as\" gibi bağlaçlarda ise altın kural şudur: bu bağlaçların bağlı olduğu yan cümlecikte \"will\", \"would\" ya da \"be going to\" gibi gelecek zaman yapıları asla kullanılmaz; bunun yerine gelecek anlamı Present Simple ile karşılanır ve gerçek zaman bilgisi ana cümlecikten anlaşılır. Seçenekleri incelerken önce hangi tarafın zaman bağlacına sahip yan cümlecik, hangi tarafın ana cümlecik olduğunu ayırt etmek, ardından iki tarafın zaman uyumuna bakmak çoğu soruyu tek başına çözmenize yeter.\n\n" +
    "Modallerde Geçmişe Dönük Çıkarımlar\nModality sorularının önemli bir kısmı, bir modal fiilin \"have V3\" ile birleştiğinde geçmişe yönelik nasıl bir yorum kattığını bilip bilmediğinizi sınar. \"Must have V3\" geçmişte yaşanmış bir olay hakkında elinizdeki kanıtlara dayanan güçlü ve olumlu bir çıkarımı, yani \"yapmış olmalı\" anlamını verir; karşıtı olan \"can't/couldn't have V3\" ise aynı derecede güçlü ama olumsuz bir çıkarımı, yani \"yapmış olamaz\" anlamını taşır. \"Should have V3\" ve \"ought to have V3\" ise çıkarımdan çok geçmişe yönelik bir tavsiye, eleştiri ya da pişmanlık bildirir ve \"yapmalıydın (ama yapmadın)\" şeklinde çevrilir. \"May/might/could have V3\" düşük ya da orta dereceli bir olasılığı, yani \"yapmış olabilir\" anlamını verirken, \"needn't have V3\" ise yapılmasına hiç gerek olmayan ama yine de yapılmış bir eylemi, yani \"yapmasına gerek yoktu ama yaptı\" anlamını taşır; bu yapı \"didn't need to V0/didn't have to V0\" ile karıştırılmamalıdır, çünkü o ikisi eylemin hiç gerçekleşmediğini ima eder.\n\n" +
    "Edilgen Çatı ile Modal ve Zaman Birleşimleri\nPassive voice sorularının çoğu, aktif cümledeki fiilin hangi zaman veya modal ile çekimlendiğini tespit edip bunu \"be V3\" kalıbına doğru şekilde aktarmanızı ister; kural olarak, aktif cümledeki yardımcı ya da modal fiil aynı zamanda/kipte kalır, sadece ana fiil \"V3\" haline gelir ve önüne uygun \"be\" hali eklenir (am/is/are V3, was/were V3, has/have been V3, had been V3, will be V3, will have been V3, modal + be V3, modal + have been V3 gibi). Bu yapı \"have/get something done\" (ettirgen yapı) ile de sıkça karıştırılır: \"have/get + nesne + V3\" kalıbı, işi nesnenin kendisinin yapmadığını, birine yaptırıldığını anlatır. Seçeneklerde aktif-pasif karışık dizilimler gördüğünüzde önce boşluğa gelecek fiilin nesne alıp almadığına, yani cümlede boşluktan sonra bir nesne kalıp kalmadığına bakmak, doğru sesi (aktif mi pasif mi) hızlıca belirlemenizi sağlar.\n\n" +
    "Koşul Cümlelerinde Tip Ayrımı ve Devrik Yapılar\nConditional sorularında ilk adım, cümlenin hangi tipe ait olduğunu yan cümlecikteki fiil zamanından tanımaktır. Type 1 gerçekleşmesi mümkün bir gelecek durumunu anlatır ve yan cümlecikte Present Simple, ana cümlecikte \"will V0\" kullanılır; Type 2 şu anki gerçeğin tersini anlatır ve yan cümlecikte Past Simple, ana cümlecikte \"would V0\" kullanılır; Type 3 ise geçmişte gerçekleşmemiş bir durumu anlatır ve yan cümlecikte \"had V3\", ana cümlecikte \"would have V3\" kullanılır. \"Mixed conditional\" adı verilen karışık koşul cümlelerinde iki farklı zaman düzlemi bir araya gelir: örneğin şu anki kalıcı bir gerçeğin geçmişteki bir sonucu değiştirdiği cümlelerde yan cümlecik Type 2 (Past Simple), ana cümlecik Type 3 (would have V3) kalıbıyla kurulabilir, ya da tam tersi bir kombinasyon görülebilir. Ayrıca \"if\" bağlacı düşürülüp yardımcı fiilin başa alındığı devrik (inversion) yapılara da dikkat etmek gerekir: Type 1'de \"Should you need any help, call me\" gibi \"should\" ile başlayan, Type 2'de \"Were I you, I would apologize\" gibi \"were\" ile başlayan, Type 3'te ise \"Had I known the truth, I would have acted differently\" gibi \"had\" ile başlayan yapılar aslında birer if clause'dur ve normal koşul cümleleriyle aynı mantıkla çözülür.\n\n" +
    'Sonuç olarak, Gramer Bilgisi bölümündeki bir tense sorusuyla karşılaştığınızda ilk işiniz cümledeki zaman ifadelerinin, bağlaçların ve modal fiillerin altını çizmek olmalıdır; çünkü doğru cevaba çoğunlukla fiil bilgisinden çok bu küçük ipuçlarını doğru yorumlayarak ulaşılır. Seçenekleri karşılaştırırken önce aktif-pasif ayrımını, ardından zaman uyumunu, en son da anlamsal inceliği (çıkarım mı tavsiye mi, gerçek koşul mu gerçek dışı koşul mu) sırasıyla kontrol etmek, hem zamandan tasarruf etmenizi hem de dikkat dağıtıcı çeldiricilere kapılmamanızı sağlar.';

  const tenseKuralReferansi1 = [
    "Present Simple – günlük alışkanlıkları, genel gerçekleri ve değişmeyen programları anlatmak için kullanılır.\nÖrnek: \"The 8:15 train to Manchester leaves from platform two every weekday.\" (Manchester'a giden 8:15 treni her hafta içi ikinci perondan kalkar.)",
    "Present Continuous – konuşma anında devam eden eylemleri ve geçici durumları anlatmak için kullanılır.\nÖrnek: \"The technicians are currently repairing the server that crashed this morning.\" (Teknisyenler şu anda bu sabah çöken sunucuyu tamir ediyorlar.)",
    "Present Perfect – geçmişte gerçekleşen ama zamanı belirtilmeyen ya da sonucu şu anı ilgilendiren eylemler için kullanılır.\nÖrnek: \"The committee has already reviewed three of the five proposals.\" (Komite beş tekliften üçünü şimdiden inceledi.)",
    "Present Perfect Continuous – geçmişte başlayıp hâlâ devam eden bir eylemin süresini vurgulamak için kullanılır.\nÖrnek: \"She has been negotiating the contract terms for almost two weeks now.\" (Neredeyse iki haftadır sözleşme şartlarını müzakere ediyor.)",
    "Past Simple – geçmişte belirli bir noktada başlayıp tamamlanmış eylemleri anlatmak için kullanılır.\nÖrnek: \"The company launched its first product in the spring of 2010.\" (Şirket ilk ürününü 2010 baharında piyasaya sürdü.)",
    "Past Continuous – geçmişte belirli bir anda devam eden ya da başka bir eylem tarafından bölünen eylemleri anlatmak için kullanılır.\nÖrnek: \"The engineers were testing the prototype when the power suddenly went out.\" (Elektrik aniden kesildiğinde mühendisler prototipi test ediyorlardı.)",
    "Past Perfect – geçmişteki iki eylemden daha önce gerçekleşenini belirtmek için kullanılır.\nÖrnek: \"By the time the inspectors arrived, the workers had already sealed the damaged pipe.\" (Müfettişler geldiğinde işçiler hasarlı boruyu çoktan kapatmışlardı.)",
    "Past Perfect Continuous – geçmişte bir noktaya kadar süregelmiş bir eylemin süresini vurgulamak için kullanılır.\nÖrnek: \"The miners had been working underground for six hours before the alarm sounded.\" (Alarm çalmadan önce madenciler altı saattir yer altında çalışıyorlardı.)",
    "Future Perfect (will have V3) – gelecekte belirli bir noktadan önce tamamlanmış olacak eylemler için kullanılır.\nÖrnek: \"By next December, the researchers will have completed their five-year study.\" (Gelecek Aralık ayına kadar araştırmacılar beş yıllık çalışmalarını tamamlamış olacaklar.)",
    "Future Perfect Continuous (will have been V-ing) – gelecekte belirli bir ana kadar bir eylemin ne kadar süredir devam ediyor olacağını vurgular.\nÖrnek: \"In June, my parents will have been living in this village for forty years.\" (Haziran ayında ailem bu köyde kırk yıldır yaşıyor olacak.)",
    "Zaman bağlaçlarından sonra gelecek zaman yasağı (when/before/after/as soon as/until) – bu bağlaçların bağlı olduğu yan cümlecikte will/would/be going to kullanılmaz; gelecek anlamı present yapılarla karşılanır.\nÖrnek: \"As soon as the results arrive, the board will decide on the merger.\" (Sonuçlar gelir gelmez yönetim kurulu birleşme konusunda karar verecek.)",
    "Since (bağlaç) + Past Simple, Present Perfect – 'since' bir olayı başlangıç noktası olarak gösterdiğinde yan cümlecikte Past Simple, ana cümlecikte have/has V3 kullanılır.\nÖrnek: \"Since the factory adopted the new safety protocol, accidents have dropped sharply.\" (Fabrika yeni güvenlik protokolünü benimsediğinden beri kazalar keskin biçimde azaldı.)",
    "Must have V3 – geçmişe yönelik kesin ve olumlu bir çıkarım ya da tahmin bildirir.\nÖrnek: \"The lights are off and the car is gone; they must have left early this morning.\" (Işıklar sönük ve araba yok; bu sabah erkenden gitmiş olmalılar.)",
    "Can't/Couldn't have V3 – geçmişe yönelik kesin ve olumsuz bir çıkarım bildirir.\nÖrnek: \"He couldn't have finished the report already; he only started an hour ago.\" (Raporu şimdiden bitirmiş olamaz; ancak bir saat önce başladı.)",
    "Should have V3 / Ought to have V3 – geçmişte yapılması gerekirken yapılmamış bir eylem için pişmanlık ya da eleştiri bildirir.\nÖrnek: \"You should have backed up the files before formatting the disk.\" (Diski biçimlendirmeden önce dosyaları yedeklemeliydin.)",
    "Shouldn't have V3 – geçmişte yapılmaması gerekirken yapılmış bir eylem için eleştiri bildirir.\nÖrnek: \"She shouldn't have signed the contract without consulting a lawyer.\" (Bir avukata danışmadan sözleşmeyi imzalamamalıydı.)",
    "May/Might/Could have V3 – geçmişe yönelik düşük ya da orta dereceli bir olasılık bildirir.\nÖrnek: \"The parcel might have been delivered to the wrong address.\" (Paket yanlış adrese teslim edilmiş olabilir.)",
    "Needn't have V3 – yapılmasına gerek olmayan ama yine de gerçekleştirilmiş bir eylemi anlatır.\nÖrnek: \"We needn't have booked a taxi; the client sent a driver for us.\" (Taksi ayarlamamıza gerek yoktu; müşteri bizim için bir şoför gönderdi.)",
    "Didn't need to V0 / Didn't have to V0 – geçmişte bir eylemi yapma zorunluluğu olmadığını ve eylemin hiç gerçekleştirilmediğini anlatır.\nÖrnek: \"Luckily, we didn't need to change our flight because the meeting was postponed.\" (Neyse ki toplantı ertelendiği için uçuşumuzu değiştirmemize gerek kalmadı.)",
    "Must be V-ing / Can't be V-ing – şu anda devam eden bir eylem hakkında güçlü olumlu ya da olumsuz bir çıkarım bildirir.\nÖrnek: \"The kitchen light is on, so someone must be cooking dinner.\" (Mutfak ışığı yanıyor, demek ki biri akşam yemeği pişiriyor olmalı.)",
    "Was/Were able to V0 – geçmişte belirli bir olayda elde edilen tek seferlik bir başarıyı ifade eder ('could' yapısından farklı olarak).\nÖrnek: \"Despite the storm, the crew was able to land the plane safely.\" (Fırtınaya rağmen mürettebat uçağı güvenle indirebildi.)",
  ];

  const tenseKuralReferansi2 = [
    "Modal + be V3 (edilgen çatı) – bir cümle modal fiil içerdiğinde edilgen çatıya çevrilirken ana fiil 'be V3' halini alır, modal fiil değişmeden kalır.\nÖrnek: \"This bridge must be inspected before the winter season begins.\" (Bu köprü kış mevsimi başlamadan önce denetlenmelidir.)",
    "Have/Get something done (ettirgen yapı) – bir işin özne tarafından değil, başkasına yaptırılarak gerçekleştirildiğini anlatır.\nÖrnek: \"The homeowners had the roof repaired before the rainy season started.\" (Ev sahipleri yağmur mevsimi başlamadan önce çatıyı tamir ettirdiler.)",
    "Have/Let/Make + agent + V0 – birine bir işi yaptırma, izin verme ya da zorlama anlamı taşır; bu yapıda fiil yalın halde (V0) kullanılır.\nÖrnek: \"The manager made the interns redo the entire presentation.\" (Müdür stajyerlere sunumun tamamını yeniden yaptırdı.)",
    "Get/Force/Want/Ask + agent + to V0 – benzer bir ettirgen anlam taşır, ancak fiil bu yapıda 'to V0' halinde kullanılır.\nÖrnek: \"The director asked the accountant to double-check the annual budget.\" (Direktör muhasebeciden yıllık bütçeyi tekrar kontrol etmesini istedi.)",
    "It is said/thought/believed that + cümle ('it' boş öznesiyle edilgen aktarım) – bir iddianın ya da inancın kime ait olduğu belirtilmeden edilgen biçimde aktarılmasını sağlar.\nÖrnek: \"It is widely believed that the ancient bridge was built by Roman engineers.\" (Antik köprünün Roma mühendisleri tarafından inşa edildiğine yaygın olarak inanılmaktadır.)",
    "Stative Passive (be + V3, sıfat işlevinde) – eylem bildirmeyen, bir durumu ya da özelliği tarif eden edilgen görünümlü yapılardır.\nÖrnek: \"The ancient manuscript is written in a language no one can read anymore.\" (Antik el yazması artık kimsenin okuyamadığı bir dilde yazılmıştır.)",
    "Passive + Perfect Infinitive (to have been V3) – ana fiildeki eylemden daha önce gerçekleşmiş bir eylemi edilgen çatıyla anlatan yapıdır.\nÖrnek: \"The missing painting is believed to have been stolen decades ago.\" (Kayıp tablonun onlarca yıl önce çalındığına inanılıyor.)",
    "Type 0 Conditional (if + present, present) – bilimsel gerçekleri ve her zaman geçerli neden-sonuç ilişkilerini anlatır.\nÖrnek: \"If you mix yellow and blue paint, you get green.\" (Sarı ve mavi boyayı karıştırırsan yeşil elde edersin.)",
    "Type 1 Conditional (if + present, will V0) – gerçekleşmesi mümkün bir gelecek koşulunu ve sonucunu anlatır.\nÖrnek: \"If the shipment arrives on time, the factory will resume production on Monday.\" (Sevkiyat zamanında gelirse fabrika Pazartesi günü üretime devam edecek.)",
    "Type 2 Conditional (if + past simple, would V0) – şu anki gerçeğin tersini anlatan hayali bir koşulu ifade eder.\nÖrnek: \"If the company had more funding, it would hire twice as many engineers.\" (Şirketin daha fazla fonu olsaydı iki kat daha fazla mühendis işe alırdı.)",
    "Type 3 Conditional (if + had V3, would have V3) – geçmişte gerçekleşmemiş bir koşulu ve onun geçmişteki sonucunu anlatır.\nÖrnek: \"If the pilot had noticed the warning light sooner, the flight would have been delayed.\" (Pilot uyarı ışığını daha erken fark etmiş olsaydı uçuş ertelenmiş olurdu.)",
    "Mixed Conditional: geçmiş koşul – şimdiki sonuç (if + had V3, would V0) – geçmişte gerçekleşmemiş bir durumun şu anki sonucunu anlatır.\nÖrnek: \"If she had accepted that job offer, she would be living in Singapore now.\" (O iş teklifini kabul etmiş olsaydı şu an Singapur'da yaşıyor olurdu.)",
    "Mixed Conditional: şimdiki durum – geçmiş sonuç (if + past simple, would have V3) – şu anki kalıcı bir özelliğin geçmişteki bir sonucu nasıl etkilediğini anlatır.\nÖrnek: \"If he weren't so stubborn, he wouldn't have rejected such a generous offer.\" (Bu kadar inatçı olmasaydı bu kadar cömert bir teklifi reddetmezdi.)",
    "Devrik Koşul Cümleleri (Inversion) – 'if' bağlacının düşürülüp yardımcı ya da modal fiilin cümle başına alındığı yapılardır: Type 1'de 'should', Type 2'de 'were', Type 3'te 'had' ile başlar.\nÖrnek: \"Had the surgeons operated an hour earlier, the outcome might have been different.\" (Cerrahlar bir saat daha erken ameliyat etselerdi sonuç farklı olabilirdi.)",
    "Wish + Past Simple / Wish + could V0 – şu anki bir duruma duyulan pişmanlığı ya da gerçekleşmesi imkânsız bir dileği anlatır.\nÖrnek: \"I wish I spoke Japanese fluently before this business trip.\" (Bu iş seyahatinden önce Japonca'yı akıcı konuşabilseydim.)",
    "Wish + had V3 – geçmişte yaşanan bir olaydan duyulan pişmanlığı anlatır.\nÖrnek: \"He wishes he had invested in that startup five years ago.\" (Beş yıl önce o girişime yatırım yapmış olmayı diliyor.)",
    "If only – wish clause ile aynı anlamı taşıyan ancak duyguyu daha güçlü vurgulayan bir yapıdır; sadece Type 2 ve Type 3 mantığıyla kullanılır.\nÖrnek: \"If only the town had built a proper drainage system before the floods.\" (Keşke kasaba sellerden önce düzgün bir drenaj sistemi kurmuş olsaydı.)",
  ];

  function tenseLessonDefs(def) {
    return [
      {
        title: `${def.name} – Konuya Giriş`,
        durationMinutes: 15,
        contentBody: tenseIntro,
      },
      {
        title: `${def.name} – Kurallar Referansı (1/2): Tense ve Modality Kalıpları`,
        durationMinutes: 15,
        contentBody: tenseKuralReferansi1.join("\n\n"),
      },
      {
        title: `${def.name} – Kurallar Referansı (2/2): Passive, Causative ve Conditional Kalıpları`,
        durationMinutes: 15,
        contentBody: tenseKuralReferansi2.join("\n\n"),
      },
      {
        title: `${def.name} – Örnek Sorular ve Çözümler`,
        durationMinutes: 15,
        contentBody: formatExamples(ydsExamples[def.slug]),
      },
    ];
  }
  // --- END: tense-sorulari ---

  // --- BEGIN: preposition-sorulari custom lesson content (grounded in "YDS Sınav Stratejileri 1" —
  // the short "3. Prepositions (Edatlar)" section of "İngilizcede Temel Kavramlar" (p.1-2) plus the
  // preposition-inside-adjective-clause patterns scattered through the "Adjective Clauses" chapter
  // (p.265-274: object-focused/possessive/place preposition placement with relative pronouns).
  // Unlike the book's full-chapter topics, prepositions are NOT a dedicated chapter here, so this
  // enrichment is intentionally smaller in scope; fixed adjective/verb/noun + preposition collocations
  // below are standard, well-established English facts, not claimed as the book's own content.) ---
  const prepositionIntro =
    "YDS'de \"Preposition (Edat) Soruları\" bölümünde bir cümlede bırakılan tek boşluğa, anlamca ve yapıca uygun tek bir edatın (in, on, at, for, with, of, about, from, by, vb.) yerleştirilmesi istenir. Sorunun can alıcı noktası şudur: boşluktaki edat çoğu zaman tek başına bir anlam taşımaz, kendisinden hemen önceki bir sıfat, fiil ya da isimle birlikte SABİT bir ikili (collocation) oluşturur; \"responsible for\", \"insist on\" ya da \"reason for\" gibi. Bu yüzden doğru cevaba edatın kendi anlamından yola çıkarak değil, o kalıbın hangi edatla birlikte kullanıldığını EZBERDEN bilerek ulaşılır. Sınavda bu konudan ortalama 4 soru gelir; sorular genellikle kısa ve tek cümleliktir, bazen aynı cümlede iki ayrı boşlukla (örneğin bir zaman edatı ile bir yer edatı) birlikte de sorulabilir.\n\n" +
    "Sıfat Cümleciklerinde (Adjective Clause) Edatlar\nEdat sorularının bir kısmı aslında Adjective Clause konusuyla iç içedir. Nitelenen isme ait bir edat varsa, bu edat iki farklı yerde durabilir: ya sıfat cümleciğinin normal sonunda kalır (\"the topic (that) we talked about\"), ya da relative pronoun'un hemen önüne taşınır (\"the topic about which we talked\"). Edat öne taşındığında insanlar için sadece \"whom\" kullanılabilir (\"the colleague with whom I work\"), insan dışındaki varlıklar için ise sadece \"which\" kullanılabilir (\"the drawer in which she keeps her documents\"); \"who\" ya da \"that\" bir edatın hemen ardından ASLA gelmez. Aynı mantık yer bildiren cümleciklerde de geçerlidir: \"where\" yapısı aslında gizli bir \"edat + which\" anlamı taşır, bu yüzden \"the town where she was born\" cümlesi \"the town in which she was born\" ile eş değerdir; hangi edatın (in/on/at) kullanılacağı nitelenen ismin türüne göre belirlenir. Ayrıca YDS'de sık kullanılan bir strateji şudur: bir cümlenin ÖZNESİ hiçbir zaman doğrudan bir edatın ardından gelmez; bu yüzden boşluktan hemen sonra özne eksik bir yapı (yardımcı fiil ya da çekimli fiil) geliyorsa, seçeneklerdeki \"in which\", \"on which\" gibi edat + which kalıpları elenir ve yalın \"which\" ya da \"who\" tercih edilir.\n\n" +
    "Sabit Sıfat + Edat ve Fiil + Edat Kalıpları\nYDS'nin en sık sorduğu edat tipi, bir sıfatın ya da fiilin daima aynı edatla kullanıldığı sabit kalıplardır: \"responsible for\", \"based on\", \"depend on\", \"apply to\", \"insist on\", \"patient with\", \"accused of\", \"capable of\", \"aware of\" gibi. Bu kalıplarda edatın seçimi cümlenin genel anlamından değil, doğrudan o sıfat ya da fiille kurulan alışkanlıktan kaynaklanır; dolayısıyla \"responsible of\" ya da \"depend to\" gibi kulağa mantıklı gelen ama yanlış olan kombinasyonlar YDS'de en sık kullanılan çeldiricilerdir. Bu tip sorularda cümlenin geri kalanını tam olarak anlamak çoğu zaman gerekmez; asıl iş, boşluktan hemen önceki kelimeyi doğru tanıyıp ona ait tek doğru edatı hatırlamaktır.\n\n" +
    "Zaman ve Yer Bildiren Edatlar (in / on / at)\nEdat sorularının bir kısmı da zaman ve yer bildiren \"in\", \"on\" ve \"at\" edatlarının doğru seçilmesini test eder. Zaman için genel kural şudur: geniş zaman dilimlerinde (ay, yıl, mevsim, günün bölümü) \"in\" kullanılır (\"in March\", \"in 2020\", \"in the evening\"); belirli günlerde ve tarihlerde \"on\" kullanılır (\"on Monday\", \"on July 4th\"); saat gibi noktasal zamanlarda ise \"at\" kullanılır (\"at 9 o'clock\", \"at noon\"). Yer bildirirken de benzer bir mantık işler: geniş alanlarda (ülke, şehir) \"in\" (\"in Turkey\"), yüzeylerde ve sokak isimlerinde \"on\" (\"on the table\", \"on Main Street\"), belirli/noktasal konumlarda ise \"at\" (\"at the airport\", \"at the corner\") tercih edilir. YDS bu üçlüyü zaman zaman aynı cümlede iki boşlukla birden test ederek adayın her iki kuralı da bildiğinden emin olmaya çalışır.\n\n" +
    "Sonuç olarak, edat sorularında büyük oranda ezber devreye girer: sıfat + edat, fiil + edat ve isim + edat kalıplarını örnek cümleleriyle birlikte öğrenmek en kalıcı yöntemdir. Bilmediğiniz bir kalıpla karşılaştığınızda ise cümledeki bağlamdan (boşluktan hemen önceki ve sonraki kelimelerden) yararlanarak seçenekleri elemeye çalışın; birçok yanlış seçenek başka bir kalıpla karıştırılmak üzere konulmuş bir çeldiricidir. Ayrıca Adjective Clause içindeki edat kullanımını (kimin/neyin önünde hangi edatın durabileceğini) ayrı bir kural seti olarak akılda tutmak, hem bu konudaki hem de sıfat cümlecikleriyle ilgili sorularda size avantaj sağlayacaktır.";

  const prepositionKuralReferansi1 = [
    "responsible for – bir şeyden sorumlu olmak\nÖrnek: \"As the project manager, she is responsible for meeting every deadline.\" (Proje yöneticisi olarak, her teslim tarihine uymaktan sorumludur.)",
    "aware of – bir şeyin farkında olmak\nÖrnek: \"Most passengers were not aware of the delay until they reached the gate.\" (Yolcuların çoğu kapıya varana kadar gecikmenin farkında değildi.)",
    "capable of – bir şeyi yapabilecek durumda olmak\nÖrnek: \"This small engine is capable of generating enough power for the whole cabin.\" (Bu küçük motor, tüm kulübe için yeterli gücü üretebilecek durumdadır.)",
    "familiar with – bir şeye aşina olmak\nÖrnek: \"New employees are expected to become familiar with the safety procedures within a week.\" (Yeni çalışanların bir hafta içinde güvenlik prosedürlerine aşina olmaları beklenir.)",
    "similar to – bir şeye benzemek\nÖrnek: \"The proposed design is remarkably similar to a building constructed decades ago.\" (Önerilen tasarım, on yıllar önce inşa edilmiş bir binaya dikkat çekici derecede benziyor.)",
    "different from – bir şeyden farklı olmak\nÖrnek: \"The final report turned out to be quite different from the initial draft.\" (Nihai rapor, ilk taslaktan oldukça farklı çıktı.)",
    "satisfied with – bir şeyden memnun olmak\nÖrnek: \"The clients seemed genuinely satisfied with the final version of the website.\" (Müşteriler, web sitesinin son sürümünden gerçekten memnun görünüyordu.)",
    "married to – biriyle evli olmak\nÖrnek: \"He has been married to a professional violinist for almost twenty years.\" (Yaklaşık yirmi yıldır profesyonel bir kemancıyla evli.)",
    "depend on – bir şeye/bir kimseye bağlı olmak\nÖrnek: \"Whether the harvest is good this year depends largely on the rainfall in spring.\" (Bu yılki hasadın iyi olup olmaması büyük ölçüde ilkbahardaki yağışa bağlı.)",
    "rely on – güvenmek, dayanmak\nÖrnek: \"Small businesses in the area rely heavily on tourists during the summer months.\" (Bölgedeki küçük işletmeler yaz aylarında büyük ölçüde turistlere güveniyor.)",
    "consist of – bir şeyden oluşmak\nÖrnek: \"The committee consists of five elected members and one appointed chairperson.\" (Komite, beş seçilmiş üyeden ve bir atanmış başkandan oluşuyor.)",
    "believe in – bir şeye/birine inanmak\nÖrnek: \"Despite the setbacks, the coach never stopped believing in his young team.\" (Aksiliklere rağmen, koç genç takımına inanmaktan hiç vazgeçmedi.)",
    "succeed in – bir şeyde başarılı olmak\nÖrnek: \"Very few candidates succeed in passing the exam on their first attempt.\" (Çok az aday sınavı ilk denemede geçmeyi başarır.)",
    "complain about – bir şeyden şikayet etmek\nÖrnek: \"Several residents complained about the noise coming from the construction site.\" (Birkaç sakin, inşaat alanından gelen gürültüden şikayet etti.)",
    "object to – bir şeye karşı çıkmak, itiraz etmek\nÖrnek: \"Two board members strongly objected to the proposed budget cuts.\" (İki yönetim kurulu üyesi, önerilen bütçe kesintilerine şiddetle karşı çıktı.)",
    "approve of – bir şeyi onaylamak\nÖrnek: \"Her parents didn't approve of her decision to quit her stable job.\" (Ailesi, istikrarlı işinden ayrılma kararını onaylamadı.)",
    "suffer from – bir hastalıktan/sorundan muzdarip olmak\nÖrnek: \"The region has been suffering from a severe drought for the past three years.\" (Bölge, son üç yıldır şiddetli bir kuraklıktan muzdarip.)",
    "result in – bir sonuca yol açmak\nÖrnek: \"The merger is expected to result in the loss of hundreds of jobs.\" (Birleşmenin yüzlerce iş kaybına yol açması bekleniyor.)",
    "focus on – bir şeye odaklanmak\nÖrnek: \"The new curriculum focuses on practical skills rather than memorization.\" (Yeni müfredat, ezber yerine pratik becerilere odaklanıyor.)",
    "reason for – bir şeyin sebebi\nÖrnek: \"Nobody could give a clear reason for the sudden drop in sales.\" (Kimse satışlardaki ani düşüşün net bir sebebini veremedi.)",
    "solution to – bir soruna çözüm\nÖrnek: \"Engineers finally found a workable solution to the overheating problem.\" (Mühendisler sonunda aşırı ısınma sorununa uygulanabilir bir çözüm buldu.)",
    "access to – bir şeye erişim\nÖrnek: \"Not every household in the village has access to clean drinking water.\" (Köydeki her hane temiz içme suyuna erişime sahip değil.)",
    "increase in – bir şeyde artış\nÖrnek: \"The report noted a sharp increase in online shopping over the past decade.\" (Rapor, son on yılda çevrimiçi alışverişte keskin bir artışa dikkat çekti.)",
    "need for – bir şeye ihtiyaç\nÖrnek: \"The committee emphasized the urgent need for better public transportation.\" (Komite, daha iyi toplu taşımaya olan acil ihtiyacı vurguladı.)",
  ];

  function prepositionLessonDefs(def) {
    return [
      {
        title: `${def.name} – Konuya Giriş`,
        durationMinutes: 10,
        contentBody: prepositionIntro,
      },
      {
        title: `${def.name} – Kurallar Referansı`,
        durationMinutes: 12,
        contentBody: prepositionKuralReferansi1.join("\n\n"),
      },
      {
        title: `${def.name} – Örnek Sorular ve Çözümler`,
        durationMinutes: 12,
        contentBody: formatExamples(ydsExamples[def.slug]),
      },
    ];
  }
  // --- END: preposition-sorulari ---

  // --- BEGIN: cloze-test custom lesson content (grounded in "YDS Sınav Stratejileri 1" —
  // Conjunctions & Adverbial Clauses & Inversions chapter (p.413-489: compound sentences/FANBOYS,
  // parallel structures, concessive & direct contrast, cause/result/purpose/time connectors,
  // transition & summation adverbs, inversions) plus the Quantifiers chapter (p.513-531: a lot
  // of/many/a few/few/much/a little/little, most/some/any/no/none, both/either/neither, each/every,
  // all/whole, other/others/another). All prose, categorization and example sentences below are
  // original; only the underlying grammar facts are drawn from the book.) ---
  const clozeTestIntro =
    "YDS'nin cloze test (boşluk doldurma) bölümünde karşınıza tek bir cümle değil, birbirine bağlı birkaç cümleden oluşan kısa bir paragraf çıkar ve paragraf içindeki bir ya da birkaç boşluğa en uygun kelimeyi ya da ifadeyi seçmeniz istenir. Bu soru tipinde sınanan şey çoğunlukla kelime bilginiz değil, cümleler arasındaki MANTIKSAL İLİŞKİYİ doğru okuyabilme becerisidir: boşluktan önceki cümle ile sonraki cümle arasında bir zıtlık mı var, bir neden-sonuç mu, yoksa bir ekleme mi kuruluyor? Bu nedenle cloze test sorularına başlamadan önce paragrafın tamamını hızlıca okuyup genel akışı kavramak, ardından her boşluğun hemen öncesine ve sonrasına dönüp o noktada ne tür bir bağlantı kurulması gerektiğini belirlemek en sağlam stratejidir. Seçenekleri incelerken önce yapısal uyumu (bağlaç mı, edat mı, cümle zarfı mı; devamında bir cümlecik mi yoksa bir isim öbeği mi gerekiyor) kontrol etmek, ardından anlamsal uyumu (zıtlık, neden-sonuç, ekleme, koşul vb.) test etmek çoğu zaman yanlış seçenekleri hızla elemenizi sağlar.\n\n" +
    "Zıtlık ve Karşıtlık Bağlaçları\nCloze paragraflarında en sık test edilen ilişki türlerinden biri zıtlıktır: bir cümle olumlu bir durumdan söz ederken bir sonraki cümle bunun beklenmedik ya da ters bir sonucunu anlatır. 'Although', 'though', 'even though' ve 'while' gibi yapılar devamında bir özne-yüklem içeren cümlecik isterken, 'despite' ve 'in spite of' devamında bir isim öbeği ya da -ing yapısı ister; bu ayrımı gözden kaçırmak cloze testte en sık yapılan hatalardan biridir. Cümle zarfı olarak kullanılan 'however', 'nevertheless' ve 'on the other hand' ise iki ayrı cümleyi noktalama işaretiyle birbirine bağlar ve genellikle ikinci cümlenin başında yer alır. 'Whereas' ve 'while' ise iki farklı öznenin ya da tarafın doğrudan karşılaştırıldığı cümlelerde tercih edilir.\n\n" +
    "Neden-Sonuç ve Sonuç Bildiren Bağlaçlar\nBir cümlede anlatılan durum bir öncekinin doğal sonucuysa, paragrafta 'therefore', 'thus', 'hence' ve 'consequently' gibi cümle zarfları ya da 'because', 'since' ve 'as' gibi bağlaçlar aranır. Bu grupta dikkat edilmesi gereken önemli bir ayrım, bağlaç ile edatın karıştırılmamasıdır: 'because' devamında bir cümlecik alırken, 'because of', 'due to' ve 'owing to' devamında yalnızca bir isim öbeği alabilir. 'So...that' ve 'such...that' kalıpları ise bir sonucun ne denli yoğun ya da aşırı olduğunu vurgular ve boşluktan hemen sonra sıfat mı yoksa isim öbeği mi geldiğine bakılarak ikisi arasında seçim yapılır.\n\n" +
    "Ekleme ve Sıralama Bildiren Bağlaçlar\nBir paragrafta aynı yöndeki fikirler art arda sıralanıyorsa boşluk büyük olasılıkla 'furthermore', 'moreover', 'in addition' ya da 'besides' gibi bir ekleme ifadesi ister. Bu yapıların çoğu cümle başında kullanılıp virgülle devam ederken, 'in addition to' ve 'besides' aynı zamanda edat olarak da işlev görüp devamlarında isim öbeği ya da -ing yapısı alabilir. 'Not only...but also' ve 'both...and' gibi paralel yapılar ise iki unsuru gramatik olarak eşit biçimde birbirine bağladığından, boşluğun karşılığındaki ikinci parçanın yapısına (fiil mi, sıfat mı, isim öbeği mi) bakmak doğru seçeneği bulmanın en hızlı yoludur. Zaman ya da olay sırasını belirten 'meanwhile', 'subsequently' ve 'afterwards' gibi ifadeler de paragraf akışında sıkça karşınıza çıkar.\n\n" +
    "Miktar Sıfatlarında Sayılabilir–Sayılamaz Uyumu\nCloze testte boşluğun hemen sağındaki ismin sayılabilir mi yoksa sayılamayan mı olduğunu fark etmek, doğru miktar sıfatını seçmenin anahtarıdır. 'Many', 'few' ve 'a few' yalnızca çoğul sayılabilir isimlerle kullanılırken, 'much', 'little' ve 'a little' yalnızca sayılamayan isimlerle kullanılır. Bunun yanında 'few' ve 'little' anlamca OLUMSUZ bir azlığı ('neredeyse hiç yok') ifade ederken, 'a few' ve 'a little' aynı miktarı daha OLUMLU bir çerçevede ('bir miktar var') sunar; bu ince anlam farkı cümlenin genel tonuyla (iyimser mi kötümser mi) karşılaştırılarak çözülür. 'Each' ve 'every' her zaman tekil isim ve tekil fiille kullanılırken, 'all', 'most' ve 'none of' hem çoğul hem sayılamayan isimlerle kullanılabilir; 'a number of' gibi çoğul isim gerektiren kalıpları da 'the number of' gibi benzer görünümlü ama tekil fiil alan kalıplarla karıştırmamak gerekir.\n\n" +
    "Sonuç olarak, cloze test sorularında başarı kelime dağarcığından çok cümleler arasındaki mantıksal haritayı doğru çizebilmekten geçer. Her boşlukta önce yapısal soruyu (bağlaç mı, edat mı, cümle zarfı mı; sayılabilir mi sayılamaz mı) sonra anlamsal soruyu (zıtlık mı, neden-sonuç mu, ekleme mi, koşul mu) sırayla sormayı alışkanlık haline getirirseniz, seçenekler arasında kalan tek doğru cevaba çoğu zaman hızlıca ulaşabilirsiniz. Bu bölümdeki referans listesini ve örnek soruları düzenli tekrar etmek, sınavda karşınıza çıkabilecek bağlaç ve miktar sıfatı çeşitliliğine karşı sizi çok daha hazırlıklı hale getirecektir.";

  const clozeTestKuralReferansi1 = [
    "however – iki cümle arasında ZITLIK kuran bir cümle zarfıdır; genellikle noktadan ya da noktalı virgülden sonra, virgülle ayrılarak kullanılır.\nÖrnek: \"The company reported record profits this quarter; however, its stock price fell sharply the next day.\" (Şirket bu çeyrekte rekor kâr açıkladı; ancak hisse senedi fiyatı ertesi gün sert bir şekilde düştü.)",
    "nevertheless – 'buna rağmen, yine de' anlamındaki bu cümle zarfı, önceki cümledeki bilgiye karşın gerçekleşen bir durumu tanıtır.\nÖrnek: \"The bridge was badly damaged in the storm; nevertheless, engineers managed to reopen it within a week.\" (Köprü fırtınada ağır hasar gördü; yine de mühendisler onu bir hafta içinde yeniden açmayı başardı.)",
    "although – '-e rağmen, -dığı halde' anlamına gelen bu bağlaç, devamında mutlaka bir özne ve yüklem içeren bir cümlecik alır.\nÖrnek: \"Although the negotiations lasted for months, the two countries failed to reach a lasting agreement.\" (Görüşmeler aylarca sürmesine rağmen, iki ülke kalıcı bir anlaşmaya varamadı.)",
    "despite – '-e rağmen' anlamındaki bu edat, devamında bir isim öbeği ya da -ing yapısı alır; cümlecik alamaz.\nÖrnek: \"Despite repeated warnings from health officials, many people continued to ignore the safety guidelines.\" (Sağlık yetkililerinin tekrarlanan uyarılarına rağmen, birçok insan güvenlik kurallarını göz ardı etmeye devam etti.)",
    "in spite of – 'despite' ile aynı anlama ve kullanıma sahip bir edattır; devamında isim öbeği ya da -ing yapısı alır.\nÖrnek: \"In spite of the heavy traffic, the delivery team managed to complete all their routes on schedule.\" (Yoğun trafiğe rağmen, teslimat ekibi tüm rotalarını zamanında tamamlamayı başardı.)",
    "whereas – iki özne ya da iki durum arasındaki doğrudan karşıtlığı vurgulayan bir bağlaçtır ('oysa, halbuki').\nÖrnek: \"Urban schools generally have access to advanced laboratories, whereas many rural schools still lack basic equipment.\" (Şehir okulları genellikle gelişmiş laboratuvarlara erişebilirken, birçok kırsal okulda hâlâ temel ekipman bile bulunmuyor.)",
    "on the other hand – bir konunun iki farklı yönünü ya da iki karşıt görüşü sunarken kullanılan bir cümle zarfıdır.\nÖrnek: \"Remote work offers greater flexibility for employees; on the other hand, it can make team collaboration more difficult.\" (Uzaktan çalışma, çalışanlara daha fazla esneklik sunar; öte yandan, ekip iş birliğini zorlaştırabilir.)",
    "on the contrary – önceki cümlede söylenen bir düşünceyi çürütmek ya da tam tersini savunmak için kullanılan bir ifadedir.\nÖrnek: \"Critics claimed the policy would harm small businesses. On the contrary, sales among local shops increased significantly.\" (Eleştirmenler politikanın küçük işletmelere zarar vereceğini iddia etti. Aksine, yerel dükkânlardaki satışlar önemli ölçüde arttı.)",
    "even though – 'although' ile eş anlamlı olup devamında bir cümlecik alan, biraz daha vurgulu bir zıtlık bağlacıdır.\nÖrnek: \"Even though the surgery carried significant risks, the patient decided to go through with it.\" (Ameliyat önemli riskler taşımasına rağmen, hasta ameliyat olmaya karar verdi.)",
    "no matter how + sıfat/zarf – 'ne kadar ... olursa olsun' anlamına gelir; devamında bir sıfat ya da zarf, ardından tam bir cümle gelir.\nÖrnek: \"No matter how carefully the plan was designed, unexpected obstacles always seemed to arise.\" (Plan ne kadar dikkatli tasarlanırsa tasarlansın, her zaman beklenmedik engeller ortaya çıkıyor gibiydi.)",
  ];

  const clozeTestKuralReferansi2 = [
    "because – devamında bir cümlecik (özne + yüklem) alan, doğrudan neden bildiren bir bağlaçtır.\nÖrnek: \"The flight was delayed because a mechanical issue was discovered during the pre-flight inspection.\" (Uçuş, uçuş öncesi kontrol sırasında mekanik bir sorun tespit edildiği için gecikti.)",
    "due to – 'because of' ile eş anlamlı bir edattır ve devamında yalnızca bir isim öbeği ya da -ing yapısı alabilir.\nÖrnek: \"The outdoor concert was cancelled due to the sudden thunderstorm that hit the city.\" (Açık hava konseri, şehri vuran ani gök gürültülü fırtına nedeniyle iptal edildi.)",
    "owing to – 'due to' ve 'because of' ile aynı anlama gelen, biraz daha resmi bir edattır.\nÖrnek: \"Owing to a shortage of qualified staff, the hospital was forced to postpone several non-urgent procedures.\" (Nitelikli personel eksikliği nedeniyle, hastane birçok acil olmayan işlemi ertelemek zorunda kaldı.)",
    "therefore – bir cümle zarfı olarak, önceki cümlede belirtilen nedenin doğal sonucunu tanıtır.\nÖrnek: \"The region experienced its driest summer in decades; therefore, local farmers reported significantly lower crop yields.\" (Bölge onlarca yılın en kurak yazını yaşadı; bu nedenle yerel çiftçiler önemli ölçüde daha düşük ürün verimi bildirdi.)",
    "thus – 'therefore' ile benzer anlamda, biraz daha yazılı/akademik bir üslupta kullanılan bir sonuç zarfıdır.\nÖrnek: \"The new material is both lighter and stronger than steel, thus reducing the overall weight of the aircraft.\" (Yeni malzeme çelikten hem daha hafif hem daha güçlüdür ve böylece uçağın toplam ağırlığını azaltır.)",
    "consequently – 'sonuç olarak, bunun sonucunda' anlamına gelen bir cümle zarfıdır.\nÖrnek: \"The central bank raised interest rates sharply; consequently, mortgage applications dropped to a ten-year low.\" (Merkez bankası faiz oranlarını sert bir şekilde artırdı; sonuç olarak, konut kredisi başvuruları on yılın en düşük seviyesine geriledi.)",
    "as a result of – devamında bir isim öbeği alan, neden-sonuç bildiren bir edattır.\nÖrnek: \"As a result of the new irrigation system, crop yields in the valley have nearly doubled over the past decade.\" (Yeni sulama sistemi sonucunda, vadideki ürün verimi son on yılda neredeyse iki katına çıktı.)",
    "so + sıfat/zarf + that – bir durumun yoğunluğunun yol açtığı sonucu anlatan bir kalıptır.\nÖrnek: \"The lecture was so technical that most of the first-year students struggled to follow it.\" (Ders o kadar teknikti ki birinci sınıf öğrencilerinin çoğu takip etmekte zorlandı.)",
    "since – zaman anlamının yanı sıra '-dığı için, mademki' anlamında da kullanılan bir neden bağlacıdır; devamında bir cümlecik alır.\nÖrnek: \"Since the manuscript had already been reviewed twice, the editor decided to approve it without further delay.\" (El yazması zaten iki kez incelendiği için, editör onu daha fazla geciktirmeden onaylamaya karar verdi.)",
    "furthermore – önceki cümledeki bilgiye aynı yönde yeni bir bilgi ekleyen resmi bir cümle zarfıdır.\nÖrnek: \"The new policy is expected to reduce carbon emissions significantly. Furthermore, it will create thousands of jobs in renewable energy.\" (Yeni politikanın karbon emisyonlarını önemli ölçüde azaltması bekleniyor. Dahası, yenilenebilir enerji alanında binlerce iş yaratacak.)",
    "moreover – 'furthermore' ile eş anlamlı olan, ek bir bilgiyi vurgulamak için kullanılan bir cümle zarfıdır.\nÖrnek: \"The proposal is financially sound. Moreover, it addresses several long-standing concerns raised by residents.\" (Öneri mali açıdan sağlamdır. Üstelik, sakinlerin uzun süredir dile getirdiği birçok endişeyi de ele almaktadır.)",
    "in addition to – devamında bir isim öbeği ya da -ing yapısı alan, '-e ek olarak' anlamına gelen bir edattır.\nÖrnek: \"In addition to lowering costs, the new software also improved the accuracy of the company's financial reports.\" (Maliyetleri düşürmenin yanı sıra, yeni yazılım şirketin mali raporlarının doğruluğunu da artırdı.)",
    "besides – hem cümle zarfı hem edat olarak kullanılabilen, '-nin yanı sıra, ayrıca' anlamına gelen bir ekleme ifadesidir.\nÖrnek: \"Besides offering lower tuition fees, the university also provides generous scholarships to international students.\" (Daha düşük öğrenim ücretleri sunmanın yanı sıra, üniversite uluslararası öğrencilere cömert burslar da sağlıyor.)",
    "not only...but also – iki unsuru gramatik olarak eşit bir şekilde birbirine bağlayan paralel bir yapıdır.\nÖrnek: \"The reform not only simplified the tax code but also closed several loopholes exploited by large corporations.\" (Reform, vergi mevzuatını sadeleştirmekle kalmadı, aynı zamanda büyük şirketlerin yararlandığı birçok yasal boşluğu da kapattı.)",
    "first of all / finally – bir paragrafta sıralanan adımların ya da nedenlerin başlangıcını ve sonunu işaretleyen zarflardır.\nÖrnek: \"First of all, the committee reviewed the budget; finally, it approved the funding for the new research center.\" (Öncelikle, komite bütçeyi inceledi; son olarak, yeni araştırma merkezi için finansmanı onayladı.)",
    "meanwhile – iki olayın eş zamanlı gerçekleştiğini belirtmek için kullanılan bir zaman zarfıdır.\nÖrnek: \"The negotiating team continued its talks late into the night; meanwhile, protesters gathered outside the building.\" (Müzakere ekibi görüşmelerini gece geç saatlere kadar sürdürdü; bu esnada, göstericiler binanın dışında toplandı.)",
    "subsequently – bir olayın başka bir olaydan sonra gerçekleştiğini belirten bir zaman/sıra zarfıdır.\nÖrnek: \"The company launched the product in a limited market; subsequently, it expanded distribution nationwide.\" (Şirket ürünü sınırlı bir pazarda piyasaya sürdü; daha sonra dağıtımını ülke genelinde genişletti.)",
  ];

  const clozeTestKuralReferansi3 = [
    "unless – 'eğer ... değilse, -medikçe' anlamına gelen olumsuz bir koşul bağlacıdır.\nÖrnek: \"The construction project cannot proceed unless the environmental impact report is fully approved.\" (İnşaat projesi, çevresel etki raporu tam olarak onaylanmadıkça ilerleyemez.)",
    "provided that – 'şartıyla, yeter ki' anlamına gelen ve bir koşulu net bir şekilde belirten bağlaçtır.\nÖrnek: \"The airline will issue a full refund, provided that the cancellation is made at least 48 hours in advance.\" (Havayolu, iptal en az 48 saat önceden yapılması şartıyla tam iade sağlayacaktır.)",
    "as long as – 'provided that' ile benzer anlamda, bir durumun sürekliliğine bağlı bir koşul bildirir.\nÖrnek: \"The warranty remains valid as long as the device is used according to the manufacturer's instructions.\" (Cihaz üreticinin talimatlarına göre kullanıldığı sürece garanti geçerliliğini korur.)",
    "on condition that – 'şartıyla' anlamında, biraz daha resmi bir koşul bağlacıdır.\nÖrnek: \"The city council approved the construction permit on condition that the developer preserve the historic facade.\" (Belediye meclisi, geliştiricinin tarihi cepheyi koruması şartıyla inşaat iznini onayladı.)",
    "otherwise – 'aksi takdirde' anlamına gelen ve genellikle bir uyarı ya da zorunluluk sonrası kullanılan bir cümle zarfıdır.\nÖrnek: \"Employees must submit their reports by Friday; otherwise, their requests will not be processed this month.\" (Çalışanlar raporlarını cuma gününe kadar teslim etmelidir; aksi takdirde talepleri bu ay işleme alınmayacaktır.)",
    "only if – bir durumun gerçekleşmesinin TEK bir şarta bağlı olduğunu vurgulayan bir koşul ifadesidir.\nÖrnek: \"The committee will reconsider the proposal only if new evidence is presented at the next meeting.\" (Komite, öneriyi yalnızca bir sonraki toplantıda yeni kanıtlar sunulması durumunda yeniden değerlendirecektir.)",
    "much – sayılamayan isimlerle kullanılan ve 'çok' anlamına gelen bir miktar sıfatıdır; olumlu cümlelerde genellikle 'so/too/very' gibi bir pekiştiriciyle birlikte kullanılır.\nÖrnek: \"There isn't much evidence to support the claim that the new drug is more effective than the existing treatment.\" (Yeni ilacın mevcut tedaviden daha etkili olduğu iddiasını destekleyecek çok fazla kanıt yok.)",
    "many – sayılabilir çoğul isimlerle kullanılan, 'birçok' anlamına gelen bir miktar sıfatıdır.\nÖrnek: \"Many researchers have questioned the methodology used in the original study.\" (Birçok araştırmacı, orijinal çalışmada kullanılan yöntembilimi sorguladı.)",
    "a few – sayılabilir çoğul isimlerle kullanılan ve 'birkaç' anlamına gelen, olumlu bir azlık ifade eden miktar sıfatıdır.\nÖrnek: \"A few volunteers stayed behind to help clean up the site after the event ended.\" (Etkinlik bittikten sonra alanı temizlemeye yardım etmek için birkaç gönüllü geride kaldı.)",
    "few – sayılabilir çoğul isimlerle kullanılan ancak 'a few'den farklı olarak olumsuz bir azlığı ('neredeyse hiç') vurgulayan bir miktar sıfatıdır.\nÖrnek: \"Few witnesses were willing to testify, given the risks involved in the case.\" (Davadaki risklere bakılırsa, tanıklık yapmaya istekli çok az tanık vardı.)",
    "a little – sayılamayan isimlerle kullanılan ve 'biraz' anlamına gelen, olumlu bir azlık ifade eden miktar sıfatıdır.\nÖrnek: \"With a little more patience, the negotiators might have reached a compromise before the deadline.\" (Biraz daha sabırla, müzakereciler son tarihten önce bir uzlaşmaya varabilirlerdi.)",
    "little – sayılamayan isimlerle kullanılan ve 'a little'den farklı olarak olumsuz bir azlığı ('neredeyse hiç') vurgulayan bir miktar sıfatıdır.\nÖrnek: \"Little attention was paid to the warnings issued by environmental scientists a decade ago.\" (Çevre bilimcilerin on yıl önce yaptığı uyarılara neredeyse hiç dikkat edilmedi.)",
    "each / every – ikisi de tekil sayılabilir isim ve tekil fiille kullanılır; 'each' bir grubun üyelerini ayrı ayrı, 'every' ise bütünü vurgular.\nÖrnek: \"Each candidate was given exactly ten minutes to present their proposal to the board.\" (Her bir adaya, önerisini kurula sunması için tam olarak on dakika verildi.)",
    "none of – devamında 'of + çoğul isim' ya da 'of + sayılamayan isim' alan, 'hiçbiri' anlamına gelen bir miktar ifadesidir.\nÖrnek: \"None of the applicants met all the qualifications required for the position.\" (Adayların hiçbiri, pozisyon için gereken tüm niteliklere sahip değildi.)",
    "most of – devamında 'of + çoğul isim' ya da 'of + sayılamayan isim' alan, 'çoğu' anlamına gelen bir miktar ifadesidir.\nÖrnek: \"Most of the funding for the project comes from private donations rather than government grants.\" (Proje için finansmanın çoğu, devlet hibelerinden ziyade özel bağışlardan geliyor.)",
    "a number of – devamında çoğul isim alan ve 'birçok' anlamına gelen bir miktar ifadesidir; 'the number of' (-in sayısı) ile karıştırılmamalıdır.\nÖrnek: \"A number of studies have linked chronic stress to a higher risk of cardiovascular disease.\" (Birçok çalışma, kronik stresi kalp-damar hastalığı riskinin artmasıyla ilişkilendirdi.)",
  ];

  function clozeTestLessonDefs(def) {
    return [
      {
        title: `${def.name} – Konuya Giriş`,
        durationMinutes: 15,
        contentBody: clozeTestIntro,
      },
      {
        title: `${def.name} – Kurallar Referansı (1/3): Zıtlık ve Karşıtlık Bağlaçları`,
        durationMinutes: 15,
        contentBody: clozeTestKuralReferansi1.join("\n\n"),
      },
      {
        title: `${def.name} – Kurallar Referansı (2/3): Neden-Sonuç ve Ekleme Bağlaçları`,
        durationMinutes: 15,
        contentBody: clozeTestKuralReferansi2.join("\n\n"),
      },
      {
        title: `${def.name} – Kurallar Referansı (3/3): Koşul Bağlaçları ve Miktar Sıfatları`,
        durationMinutes: 15,
        contentBody: clozeTestKuralReferansi3.join("\n\n"),
      },
      {
        title: `${def.name} – Örnek Sorular ve Çözümler`,
        durationMinutes: 15,
        contentBody: formatExamples(ydsExamples[def.slug]),
      },
    ];
  }
  // --- END: cloze-test ---

  // --- BEGIN: cumle-tamamlama custom lesson content (grounded in "YDS Sınav Stratejileri 1" —
  // Gerunds & Infinitives, Adjectives & Adverbs, Adjective Clauses, Noun Clauses & Auxiliaries chapters) ---
  const cumleTamamlamaIntro =
    "YDS'nin Cümle Tamamlama sorularında amaç, yarım bırakılan bir cümleyi hem dil bilgisi hem de anlam bakımından tutarlı şekilde bitirecek parçayı bulmaktır. Bu soru tipini diğerlerinden ayıran en önemli özellik, doğru cevaba götürecek ipucunun neredeyse her zaman cümlenin kendi içinde saklı olmasıdır: bir bağlaç (although, provided that, no sooner... than gibi), tamamlanmamış bir sıfat cümleciği, gerund ya da infinitive isteyen bir fiil, ya da bir isim cümleciği açan bir yapı. Bu nedenle çözüme geçmeden önce boşluğun hemen öncesine ve varsa sonrasına bakıp hangi gramer yapısının eksik bırakıldığını tespit etmek, seçenekleri elemenin en hızlı yoludur. Bu bölümde bu mantığı dört ana başlık altında -- gerund/infinitive seçimi, sıfat (ilgi) cümlecikleri, isim cümlecikleri ve sıfat-zarf yapıları -- ele alıyoruz.\n\n" +
    "Gerund mu, Infinitive mi?\nBir fiilin hemen ardından gelen ikinci fiil bazen \"-ing\" (Ving) bazen de \"to V0\" şeklinde çekimlenir; bu seçim çoğu zaman anlamı değiştirmez ve sadece ilk fiile bağlıdır: enjoy, avoid, deny, admit, suggest gibi fiiller yalnızca Ving alırken; decide, plan, hope, agree, refuse gibi fiiller yalnızca to V0 alır. Asıl dikkat edilmesi gereken nokta, hem Ving hem de to V0 alabilen ama anlamı kökten değiştiren fiillerdir: \"stop smoking\" (sigarayı bırakmak) ile \"stop to smoke\" (sigara içmek için durmak); \"remember locking the door\" (kapıyı kilitlediğini hatırlamak – geçmişe dönük) ile \"remember to lock the door\" (kapıyı kilitlemeyi unutma – geleceğe dönük); \"try opening the window\" (deneme amaçlı açmayı denemek) ile \"try to open the window\" (açmak için çabalamak) bu ailenin en tipik örnekleridir. Ayrıca \"too + sıfat/zarf + to V0\" ve \"sıfat/zarf + enough + to V0\" kalıplarının ikisinin de infinitive ile devam ettiğini, bir preposition'dan hemen sonra ise her zaman Ving geldiğini unutmayın.\n\n" +
    "Sıfat (İlgi) Cümlecikleri\nBoşluktan önce bir isim varsa ve cümlede bu ismi tamamlayacak bir yapı eksikse, aranan şey genellikle bir sıfat cümleciğidir. Niteleneni insan ise who/whom/that, insan dışı bir varlık ise which/that kullanılır; boşluktan sonra bir yardımcı fiil ya da fiil geliyorsa (özne eksikse) who/which, bir özne + fiil geliyorsa (nesne eksikse) whom/which tercih edilir. İyelik anlamı varsa whose + isim, yer bildiriliyorsa where, zaman bildiriliyorsa when, sebep bildiriliyorsa why kullanılır; bu dört yapının hepsi devamında tam bir cümle ister. Sınavda ayrıca sıfat cümleciğinin kısaltılmış hâllerine de dikkat edin: isim + Ving aktif, isim + V3 / being V3 pasif bir kısaltmadır (\"the man reading a newspaper\" = \"the man who is reading a newspaper\"); üstünlük (superlative) yapılarından sonra gelen to V0 de yine bir sıfat cümleciği kısaltmasıdır (\"the first man to land on the moon\").\n\n" +
    "İsim Cümlecikleri\nİsim cümlecikleri bir cümlenin özne, nesne ya da tamamlayıcı konumunda kullanılan ve kendi içinde tam bir cümle olan yapılardır. Kesin/net bir durumdan bahsediliyorsa that (özne konumunda the fact that), belirsiz bir durumdan bahsediliyorsa soru kelimeleri (what, who, where, when, why, how) ya da whether/if kullanılır. \"If\" bir fiilin nesnesi olabilir ama özne konumunda ya da bir preposition'dan hemen sonra asla kullanılamaz; bu konumlarda mutlaka whether tercih edilmelidir; aynı şekilde bir preposition'dan hemen sonra that değil the fact that gelir. Resmi/akademik cümlelerde \"it is essential/vital/necessary that + özne + V0\" kalıbındaki subjunctive (dilek-şart) yapısını da unutmayın; bu yapıda özne tekil de olsa fiil hep yalın hâlde kalır (\"it is essential that she be informed immediately\").\n\n" +
    "Sıfat ve Zarf Yapıları\nCümle tamamlama sorularında sıfat ve zarflarla kurulan karşılaştırma ve sonuç yapıları da sık sık karşınıza çıkar. Kısa sıfat/zarflarda \"-er... than\", uzun olanlarda \"more... than\" kullanılır; üstünlükte sırasıyla \"-est\" ve \"the most\" tercih edilir. \"As + sıfat/zarf + as\" iki tarafın eşitliğini, \"so + sıfat/zarf + that\" ve \"such + (a/an) + sıfat + isim + that\" ise bir sonucu (\"o kadar... ki\") ifade eder ve bu yapılardan sonra mutlaka tam bir cümle (SVO) gelir. \"Too + sıfat/zarf + to V0\" olumsuz bir sonucu, \"sıfat/zarf + enough + to V0\" ise yeterliliği anlatır. Fiili değil ismi niteleyen kelimelerin sıfat, fiili/sıfatı/başka bir zarfı ya da tüm cümleyi niteleyen kelimelerin ise zarf olduğunu (genelde \"-ly\" takısıyla türediklerini) hatırlamak, seçenekler arasında sıfat-zarf ayrımı yapmanız istenen sorularda kilit rol oynar.\n\n" +
    "Sonuç olarak, Cümle Tamamlama sorularını çözerken önce boşluğun etrafındaki dizilime bakıp hangi yapı ailesinin test edildiğini belirlemeniz, ardından o yapının kurallarını seçeneklere uygulayarak elemeye gitmeniz gerekir. Bir bağlaç mı arıyorsunuz, bir sıfat cümleciği mi tamamlanacak, bir fiil gerund mu infinitive mi istiyor, yoksa bir isim cümleciği mi açılıyor? Bu sorunun cevabını bulduğunuz anda seçeneklerin çoğu kendiliğinden elenecektir. Aşağıdaki kurallar referansı ve örnek sorularla bu dört yapı ailesini pratiğe dökebilirsiniz.";

  const cumleTamamlamaKuralReferansi1 = [
    "enjoy / avoid / deny / admit / suggest + Ving – bu fiillerden sonra ikinci fiil daima gerund (Ving) formunda kullanılır.\nÖrnek: \"The committee suggested postponing the annual conference until spring.\" (Komite, yıllık konferansı bahara ertelemeyi önerdi.)",
    "decide / plan / hope / agree / refuse + to V0 – bu fiillerden sonra ikinci fiil daima infinitive (to V0) formunda kullanılır.\nÖrnek: \"The board decided to postpone the merger until the audit was complete.\" (Yönetim kurulu, denetim tamamlanana kadar birleşmeyi ertelemeye karar verdi.)",
    "stop + Ving / stop + to V0 – \"stop doing\" bir eylemi bırakmayı, \"stop to do\" ise başka bir eylemi yapmak için durmayı ifade eder.\nÖrnek: \"She stopped checking her phone every five minutes once the exam started.\" (Sınav başlayınca telefonunu her beş dakikada bir kontrol etmeyi bıraktı.)",
    "remember / forget + Ving (geçmişe dönük) ve + to V0 (geleceğe dönük) – Ving yapılan bir eylemi hatırlama/unutmayı, to V0 ise yapılacak bir eylemi hatırlama/unutmayı bildirir.\nÖrnek: \"He forgot turning off the stove but never forgot to lock the front door.\" (Ocağı kapattığını unuttu ama ön kapıyı kilitlemeyi hiç unutmadı.)",
    "try + Ving (denemek) ve try + to V0 (çabalamak) – \"try doing\" bir yöntemi denemeyi, \"try to do\" ise bir şeyi başarmak için uğraşmayı anlatır.\nÖrnek: \"They tried rearranging the furniture before trying to sell the apartment.\" (Daireyi satmayı denemeden önce mobilyaları yeniden düzenlemeyi denediler.)",
    "verb + preposition + Ving – bir preposition'dan hemen sonra gelen fiil daima gerund formunda olur.\nÖrnek: \"The engineers succeeded in reducing the machine's energy consumption by half.\" (Mühendisler, makinenin enerji tüketimini yarıya indirmeyi başardılar.)",
    "adjective/adverb + enough + to V0 / enough + noun + to V0 – \"yeterince\" anlamı veren enough yapısından sonra fiil infinitive olur.\nÖrnek: \"The bridge was not strong enough to support the weight of the trucks.\" (Köprü, kamyonların ağırlığını taşıyacak kadar güçlü değildi.)",
    "too + adjective/adverb + to V0 – olumsuz bir sonuç bildirir ve infinitive ile devam eder.\nÖrnek: \"The report was too technical for most shareholders to fully understand.\" (Rapor, çoğu hissedarın tam olarak anlayamayacağı kadar teknikti.)",
    "it is + adjective + for someone + to V0 – bir eylemi kimin gerçekleştireceğini belirtmek için \"for + isim/zamir\"den sonra infinitive kullanılır.\nÖrnek: \"It was impossible for the team to finish the project without extra funding.\" (Ekip için ek finansman olmadan projeyi bitirmek imkansızdı.)",
    "question word + to V0 – soru kelimelerinden sonra bir isim cümleciği kısaltması olarak infinitive kullanılır.\nÖrnek: \"The intern still didn't know how to format the quarterly report.\" (Stajyer, üç aylık raporu nasıl biçimlendireceğini hâlâ bilmiyordu.)",
    "the only / first / best + noun + to V0 – bu tür üstünlük bildiren isim öbeklerinden sonra infinitive gelir (sıfat cümleciği kısaltması).\nÖrnek: \"She was the only candidate to answer every question correctly.\" (Her soruyu doğru cevaplayan tek aday oydu.)",
    "passive infinitive: to be V3 – edilgen bir anlam infinitive ile verilecekse \"to be V3\" kullanılır.\nÖrnek: \"The proposal is expected to be reviewed by the board next week.\" (Teklifin gelecek hafta yönetim kurulu tarafından incelenmesi bekleniyor.)",
    "perfect infinitive: to have V3 – ana fiilden önce gerçekleşmiş bir eylemi vurgulamak için kullanılır.\nÖrnek: \"The witness is believed to have left the country before the trial began.\" (Tanığın, duruşma başlamadan önce ülkeyi terk ettiğine inanılıyor.)",
    "passive gerund: being V3 – edilgen bir anlam gerund ile verilecekse \"being V3\" kullanılır.\nÖrnek: \"The employees complained about being asked to work overtime without notice.\" (Çalışanlar, habersiz mesai yapmalarının istenmesinden şikayet ettiler.)",
    "busy + Ving – \"busy\" sıfatı istisna olarak kendisinden sonra gerund alır.\nÖrnek: \"The staff was busy preparing the venue for the upcoming ceremony.\" (Personel, yaklaşan tören için mekanı hazırlamakla meşguldü.)",
    "have difficulty / trouble (in) + Ving – bu isimlerden sonra gerund kullanılır, \"in\" isteğe bağlıdır.\nÖrnek: \"Many students have difficulty adapting to the new online exam format.\" (Birçok öğrenci, yeni çevrimiçi sınav formatına uyum sağlamakta zorluk yaşıyor.)",
  ];

  const cumleTamamlamaKuralReferansi2 = [
    "who / that (özne, insan) – niteleneni insan olan ve sıfat cümleciğinde özne eksik olan yapılarda kullanılır.\nÖrnek: \"The engineer who designed the bridge later won a national award.\" (Köprüyü tasarlayan mühendis daha sonra ulusal bir ödül kazandı.)",
    "which / that (özne, insan dışı) – niteleneni insan dışı bir varlık olan ve özne eksik olan yapılarda kullanılır.\nÖrnek: \"The software that controls the satellite was updated last month.\" (Uyduyu kontrol eden yazılım geçen ay güncellendi.)",
    "whom / who / that (nesne, insan) – niteleneni insan olan ve sıfat cümleciğinde nesne eksik olan yapılarda kullanılır.\nÖrnek: \"The consultant whom the company hired resigned within a month.\" (Şirketin işe aldığı danışman bir ay içinde istifa etti.)",
    "whose + isim – iyelik/aitlik bildirir; hem insan hem insan dışı varlıklar için kullanılır ve arkasından doğrudan isim gelir.\nÖrnek: \"The author whose latest novel topped the bestseller list rarely gives interviews.\" (En son romanı çok satanlar listesinin başına oturan yazar nadiren röportaj verir.)",
    "where + tam cümle – yer bildiren bir ismi niteler ve devamında tam bir cümle (özne + yüklem) gelir.\nÖrnek: \"The laboratory where the vaccine was developed is now open to visitors.\" (Aşının geliştirildiği laboratuvar artık ziyaretçilere açık.)",
    "when + tam cümle – zaman bildiren bir ismi niteler ve devamında tam bir cümle gelir.\nÖrnek: \"I still remember the year when the company launched its first product.\" (Şirketin ilk ürününü piyasaya sürdüğü yılı hâlâ hatırlıyorum.)",
    "the reason why / for which – sebep bildiren bir ismi niteler; \"why\" devamında tam cümle ister.\nÖrnek: \"The reason why the flight was cancelled was never officially explained.\" (Uçuşun neden iptal edildiği hiçbir zaman resmi olarak açıklanmadı.)",
    "reduced adjective clause (aktif): isim + Ving – özne konumundaki eylem aktif olduğunda sıfat cümleciği Ving ile kısaltılır.\nÖrnek: \"The passengers waiting at the gate were informed of the delay.\" (Kapıda bekleyen yolcular gecikme konusunda bilgilendirildi.)",
    "reduced adjective clause (pasif): isim + V3 / being V3 – anlam edilgen olduğunda sıfat cümleciği V3 ya da being V3 ile kısaltılır.\nÖrnek: \"The documents submitted after the deadline were not accepted.\" (Son tarihten sonra teslim edilen belgeler kabul edilmedi.)",
    "superlative + to V0 – üstünlük bildiren yapılardan sonra gelen infinitive, bir sıfat cümleciğinin kısaltmasıdır.\nÖrnek: \"He was the first employee to receive the company's innovation award.\" (Şirketin inovasyon ödülünü alan ilk çalışan oydu.)",
    "non-defining adjective clause (virgüllü) – nitelenen isim zaten bilindiği için cümleden çıkarıldığında anlam kaybı olmaz; virgülle ayrılır.\nÖrnek: \"The new stadium, which cost over two hundred million dollars, opened last weekend.\" (İki yüz milyon dolardan fazlaya mal olan yeni stadyum geçen hafta sonu açıldı.)",
    "that + tam cümle (kararlı durum) – kesin bir bilgi ya da gerçeği bildiren fiillerden sonra nesne konumunda kullanılır.\nÖrnek: \"Researchers confirmed that the new material was more durable than steel.\" (Araştırmacılar, yeni malzemenin çelikten daha dayanıklı olduğunu doğruladı.)",
    "the fact that – özne konumunda ya da bir preposition'dan hemen sonra \"that\" yerine kullanılır.\nÖrnek: \"The fact that the results were never published raised serious doubts.\" (Sonuçların hiçbir zaman yayımlanmamış olması ciddi şüphelere yol açtı.)",
    "whether / if + tam cümle (kararsız durum) – belirsizlik bildiren durumlarda kullanılır; özne konumunda ve preposition'dan sonra yalnızca \"whether\" kullanılabilir.\nÖrnek: \"Whether the merger will be approved remains uncertain.\" (Birleşmenin onaylanıp onaylanmayacağı belirsizliğini koruyor.)",
    "wh- soru kelimesi + tam cümle – belirsiz bir bilgiyi bir isim cümleciği hâlinde aktarır.\nÖrnek: \"Nobody could explain why the shipment had gone missing.\" (Kimse, sevkiyatın neden kaybolduğunu açıklayamadı.)",
    "it is + adjective + that + tam cümle (boş özne) – \"that clause\" özne konumunda kullanılmak yerine cümle başına \"it\" getirilerek devamında verilir.\nÖrnek: \"It is unlikely that the committee will reach a decision before Friday.\" (Komitenin Cuma'dan önce bir karara varması pek olası değil.)",
    "subjunctive: it is essential / vital / necessary that + özne + V0 – resmi/akademik cümlelerde bu yapıdan sonra fiil özneden bağımsız olarak yalın hâlde kalır.\nÖrnek: \"It is essential that every participant submit the form before the deadline.\" (Her katılımcının formu son tarihten önce teslim etmesi şarttır.)",
    "-ever words (whoever, whatever, whichever, wherever, whenever, however) – \"her kim / ne / nere / ne zaman olursa\" anlamıyla isim cümleciği kurar.\nÖrnek: \"Whoever finishes the assignment first may leave the workshop early.\" (Ödevi ilk bitiren kişi atölyeden erken ayrılabilir.)",
    "noun clause tense agreement (backshift) – ana fiil geçmiş zamanda olduğunda isim cümleciği içindeki fiil de genellikle geçmişe kayar.\nÖrnek: \"The spokesperson said that the factory had been closed for renovation.\" (Sözcü, fabrikanın tadilat için kapatıldığını söyledi.)",
  ];

  const cumleTamamlamaKuralReferansi3 = [
    "comparative: -er than / more... than – kısa sıfat/zarflarda \"-er\", uzun olanlarda \"more\" kullanılır.\nÖrnek: \"This year's harvest was significantly larger than last year's.\" (Bu yılki hasat, geçen yılkinden belirgin şekilde daha büyüktü.)",
    "superlative: the -est / the most – bir grup içinde en üst derece bildirir.\nÖrnek: \"The museum's newest wing is considered the most impressive addition in decades.\" (Müzenin en yeni kanadı, on yıllardır yapılan en etkileyici ek olarak kabul ediliyor.)",
    "as + adjective/adverb + as – iki tarafın eşitliğini bildirir.\nÖrnek: \"The new printer is not as reliable as the one it replaced.\" (Yeni yazıcı, yerini aldığı yazıcı kadar güvenilir değil.)",
    "so + adjective/adverb + that – \"o kadar... ki\" anlamıyla sonuç bildirir, devamında tam cümle gelir.\nÖrnek: \"The traffic was so heavy that the delegates arrived an hour late.\" (Trafik o kadar yoğundu ki heyet üyeleri bir saat geç geldi.)",
    "such + (a/an) + adjective + noun + that – \"so...that\" ile aynı anlamı verir ama isim öbeğiyle kullanılır.\nÖrnek: \"It was such a persuasive argument that even the skeptics agreed.\" (Öyle ikna edici bir argümandı ki şüpheciler bile kabul etti.)",
    "the same... as – iki şeyin aynı olduğunu bildirir.\nÖrnek: \"Her final score was the same as the previous record holder's.\" (Onun final puanı, önceki rekor sahibinin puanıyla aynıydı.)",
    "the + comparative..., the + comparative... – \"ne kadar... o kadar...\" paralel artış/azalışı bildirir.\nÖrnek: \"The more transparent the process became, the fewer complaints the agency received.\" (Süreç ne kadar şeffaf hale geldiyse, ajans o kadar az şikayet aldı.)",
    "-ing (etkileyen) ve -ed (etkilenen) sıfatlar – niteleneni insan/nesne \"etkileyen\" konumundaysa -ing, \"etkilenen\" konumundaysa -ed sıfatı kullanılır.\nÖrnek: \"The lecture was so confusing that most of the exhausted students stopped taking notes.\" (Ders o kadar kafa karıştırıcıydı ki bitkin öğrencilerin çoğu not almayı bıraktı.)",
    "linking verb + adjective (be, become, seem, appear, look, feel, taste, smell, sound) – bu fiillerden sonra zarf değil sıfat gelir.\nÖrnek: \"The negotiations suddenly seemed hopeless after the last-minute demand.\" (Son dakika talebinden sonra müzakereler aniden umutsuz göründü.)",
    "adjective + enough / enough + noun – \"yeterince\" anlamını verir; sıfattan sonra ya da isimden önce kullanılır.\nÖrnek: \"The company didn't have enough evidence to support its claim in court.\" (Şirketin, mahkemede iddiasını destekleyecek yeterli kanıtı yoktu.)",
    "hardly / scarcely / barely – \"neredeyse hiç\" anlamı taşıyan olumsuz zarflardır ama gramer olarak olumlu cümlede kullanılır.\nÖrnek: \"The auditors could hardly believe how disorganized the accounts were.\" (Denetçiler, hesapların ne kadar dağınık olduğuna neredeyse inanamadı.)",
    "sentence adverb (fortunately, surprisingly, obviously...) – tüm cümleyi niteleyerek konuşanın tutumunu yansıtır, genelde cümle başında kullanılır.\nÖrnek: \"Surprisingly, the smaller startup outperformed its largest competitor within a year.\" (Şaşırtıcı biçimde, küçük girişim bir yıl içinde en büyük rakibini geride bıraktı.)",
  ];

  function cumleTamamlamaLessonDefs(def) {
    return [
      {
        title: `${def.name} – Konuya Giriş`,
        durationMinutes: 15,
        contentBody: cumleTamamlamaIntro,
      },
      {
        title: `${def.name} – Kurallar Referansı (1/3): Gerund & Infinitive`,
        durationMinutes: 15,
        contentBody: cumleTamamlamaKuralReferansi1.join("\n\n"),
      },
      {
        title: `${def.name} – Kurallar Referansı (2/3): Sıfat & İsim Cümlecikleri`,
        durationMinutes: 15,
        contentBody: cumleTamamlamaKuralReferansi2.join("\n\n"),
      },
      {
        title: `${def.name} – Kurallar Referansı (3/3): Sıfat & Zarf Yapıları`,
        durationMinutes: 15,
        contentBody: cumleTamamlamaKuralReferansi3.join("\n\n"),
      },
      {
        title: `${def.name} – Örnek Sorular ve Çözümler`,
        durationMinutes: 15,
        contentBody: formatExamples(ydsExamples[def.slug]),
      },
    ];
  }
  // --- END: cumle-tamamlama ---

  // --- BEGIN: ceviri custom lesson content (grounded in "YDS-YÖKDİL Çözüm Teknikleri Rehberi" —
  // "C) Çeviri: İngilizce-Türkçe" and "D) Çeviri: Türkçe-İngilizce" chapters, plus the "Örnek Soru ve
  // Çözümleri" section's "Çeviri: İngilizce – Türkçe" / "Çeviri: Türkçe – İngilizce" worked examples.
  // All prose, categorization and example sentences below are original; only the underlying
  // strategic insights are drawn from the book.) ---
  const ceviriIntro =
    'YDS\'nin "Çeviri Soruları" bölümü İngilizce\'den Türkçe\'ye ve Türkçe\'den İngilizce\'ye olmak üzere iki yönde çalışır: adaya beş seçenek sunulur ve bunlardan yalnızca biri, verilen cümlenin anlamını hem yapısal hem de anlamsal olarak en doğru ve en eksiksiz şekilde karşılar. Bu soru tipi klasik bir kelime bilgisi testinden çok, cümlenin bütün unsurlarını -özneyi, yüklemi, zaman/kipi, bağlaçları ve yan cümlecikleri- eş zamanlı olarak doğru okuyup hedef dile aktarabilme becerisini ölçer. Sınavda bu konudan ortalama 6 soru gelir ve doğru cevaba çoğu zaman, seçeneklerdeki tek bir kelimeyi ya da yapıyı değiştirerek kurulmuş ince çeldiricileri fark ederek ulaşılır.\n\n' +
    'İngilizce\'den Türkçe\'ye Çeviride Sık Karşılaşılan Tuzaklar\nİngilizce-Türkçe çevirisinde ilk engel öğe dizilimidir: İngilizce cümle Özne + Yüklem + Nesne sırasını izlerken Türkçe cümle Özne + Nesne + Yüklem sırasını izler; bu yüzden İngilizce cümledeki ana fiil (tense ya da modal ile çekimlenmiş fiil) Türkçe karşılığında cümlenin EN SONUNA taşınmalıdır. İkinci engel bağlaçlar ve modal fiillerdir: "unless", "as though", "rather than" gibi yapılar ya da "must have V3", "should have V3" gibi geçmişe dönük modal kalıplar yanlış yorumlandığında cümlenin genel anlamı tersine dönebilir. Üçüncü engel edilgen çatıdır: İngilizce cümlede "is regarded as" ya da "is believed to" gibi edilgen yapılar görüldüğünde bunları Türkçeye de edilgen bir yüklemle ("kabul edilmektedir", "inanılmaktadır") aktarmak gerekir; aktif bir çeviri özneyi eylemi yapan taraf gibi göstererek anlamı çarpıtır. Son olarak, bir sıfat cümleciği (relative clause) çoğu zaman cümlenin ana yüklemi değil, sadece ek bir bilgi taşıyan yan bir unsurdur; bu yan cümleciği ana yüklem sanıp doğrudan Türkçenin sonuna yerleştirmek, cümlenin gerçek anlamını tersine çevirebilecek ciddi bir hatadır.\n\n' +
    'Türkçe\'den İngilizce\'ye Çeviride Sık Karşılaşılan Tuzaklar\nTürkçe\'den İngilizce\'ye çeviri tersine bir zorlukla gelir: Türkçe cümlede öğelerin sırası vurguya göre oldukça esnektir ve özne cümlenin hemen hemen her yerinde bulunabilir, oysa İngilizce her zaman sabit bir Özne + Yüklem + Nesne dizilimi ister; bu yüzden çeviriye başlamadan önce Türkçe cümlenin SONUNDAKİ ana fiili bulup zamanını/kipini belirlemek, İngilizce cümlenin iskeletini kurmanın ilk adımıdır. İkinci zorluk, Türkçenin fiile eklenen çok işlevli eklerini (-DI, -mIş, -Iyor, -EcEk, -mElI, -EbilIr) doğru İngilizce zaman ya da modal fiile dönüştürmektir; örneğin "-mIş" eki bağlama göre hem Present Perfect\'e hem de Simple Past\'e karşılık gelebilir ve bu ayrımı yapmak metnin genel zaman akışına bakmayı gerektirir. Üçüncü ve belki en sinsi tuzak, Türkçe bir deyimi ya da kalıp ifadeyi kelime kelime İngilizceye aktarma eğilimidir; "eli kulağında" ya da "içi rahat etmek" gibi ifadelerin birebir çevirisi İngilizcede hem anlamsız hem de tuhaf durur, doğru yaklaşım ifadenin taşıdığı anlamı doğal bir İngilizce kalıpla karşılamaktır.\n\n' +
    'Yanlış Seçenekleri Eleme Teknikleri\nBeş seçenek arasından doğru çeviriyi bulmanın en hızlı yolu, önce her seçeneğin ANA YÜKLEMİNİ (zamanını, kipini ve edilgen/aktif olma durumunu) orijinal cümledeki ana yüklemle karşılaştırmaktır; bu tek adım genellikle seçeneklerin yarısından fazlasını eler. Geriye kalanlar arasında dört tipik çeldirici aranmalıdır: (1) cümledeki bir sözcüğün yanlış ya da yakın ama farklı bir sözcükle değiştirilmesi, (2) anlamın tersine çevrilmesi (bir olumsuzluk ekinin eklenmesi ya da çıkarılması, ya da bir karşıtlık bağlacının yanlış yorumlanması), (3) cümlede hiç geçmeyen bir bilginin seçeneğe eklenmesi (metinde belirtilmeyen bir sebep, sayı ya da zaman ifadesinin uydurulması) ve (4) cümledeki vurgunun kaydırılması (cümlenin ana fikri yerine yalnızca yan bir ayrıntısını öne çıkaran bir seçenek sunulması). Bu dört çeldirici türünü tanımak, kulağa doğru gelen ama aslında orijinal cümleden sapan seçenekleri hızla elemenizi sağlar.\n\n' +
    "Sonuç olarak, bir çeviri sorusuyla karşılaştığınızda ilk işiniz seçeneklere değil, verilen cümlenin TAMAMINA odaklanıp onun genel anlamını zihninizde bir bütün olarak canlandırmak olmalıdır; kelime kelime çeviriye kalkışmak hem zaman kaybettirir hem de deyimsel ve yapısal tuzaklara düşme riskinizi artırır. Ardından seçenekleri tek tek değil, orijinal cümleyle karşılaştırmalı olarak önce ana yüklem düzeyinde, sonra ayrıntı düzeyinde inceleyin; bu iki aşamalı yaklaşım hem İngilizce-Türkçe hem de Türkçe-İngilizce yönündeki sorularda sizi doğru seçeneğe en hızlı şekilde ulaştıracaktır.";

  const ceviriKuralReferansi1 = [
    "Edilgen çatı (passive voice) çevirisi – İngilizce cümledeki edilgen yapı, Türkçeye edilgen bir yüklemle (-il/-in eki) aktarılmalıdır; bunu aktif bir yükleme çevirmek eylemi öznenin bizzat yaptığı izlenimini vererek anlamı bozar.\nÖrnek: \"The bridge's safety is regularly inspected by municipal engineers.\" (Köprünün güvenliği belediye mühendisleri tarafından düzenli olarak denetlenmektedir.)",
    "Sonuç/sebep bildiren \"result from\" ve \"be caused by\" – bu yapılar Türkçeye \"-den kaynaklanmak\" ya da \"-den dolayı oluşmak\" şeklinde çevrilir; birebir \"sonucu olmak\" çevirisi cümleyi doğal olmaktan çıkarır.\nÖrnek: \"Most of the delays in the project resulted from a shortage of raw materials.\" (Projedeki gecikmelerin büyük kısmı hammadde sıkıntısından kaynaklandı.)",
    "Relative Clause'un ana yüklemle karıştırılmaması – bir cümledeki sıfat cümleciği (who/which/that ile başlayan yan cümle) çoğunlukla ek bilgi taşır ve cümlenin asıl yüklemi değildir; bu yan bilgiyi doğru yere, asıl yüklemi ise cümlenin sonuna yerleştirmek gerekir.\nÖrnek: \"The vaccine, which took nearly a decade to develop, is now used in over sixty countries.\" (Geliştirilmesi neredeyse on yıl süren aşı, artık altmıştan fazla ülkede kullanılmaktadır.)",
    "\"That\"'li isim cümleciğinin nesne konumunda çevrilmesi – bir fiilin nesnesi olan \"that + cümle\" yapısı Türkçeye fiilin \"-DIğI\" ya da \"-mA\" ekiyle isimleşmiş haliyle aktarılır.\nÖrnek: \"The report reveals that nearly a third of the workforce works remotely.\" (Rapor, iş gücünün neredeyse üçte birinin uzaktan çalıştığını ortaya koyuyor.)",
    "\"Not only... but also\" bağlacı – bu yapı Türkçeye \"sadece... değil, aynı zamanda... da\" şeklinde aktarılmalıdır; parçalardan birini atlamak anlamı eksik bırakır.\nÖrnek: \"The reform not only simplified the tax system but also increased overall revenue.\" (Reform, sadece vergi sistemini basitleştirmekle kalmadı, aynı zamanda toplam geliri de artırdı.)",
    "Geçmişe dönük modal çıkarımlar (\"must/can't/should have V3\") – bu kalıplar Türkçeye \"yapmış olmalı\", \"yapmış olamaz\", \"yapmalıydı\" gibi çıkarım ya da pişmanlık ifadeleriyle çevrilir; düz geçmiş zamanla çevirmek anlamdaki kesinlik derecesini kaybettirir.\nÖrnek: \"The team must have underestimated the project's complexity from the very start.\" (Ekip, projenin karmaşıklığını daha en baştan yanlış değerlendirmiş olmalı.)",
    "\"Unless\" bağlacı – \"eğer... değilse\" anlamına gelir ve Türkçeye çoğunlukla \"-medikçe\" ya da \"aksi takdirde\" şeklinde çevrilir; bunu \"eğer\" ile karıştırıp olumlu bir koşul gibi çevirmek yaygın bir hatadır.\nÖrnek: \"Unless the company changes its pricing strategy, it will keep losing customers.\" (Şirket fiyatlandırma stratejisini değiştirmedikçe müşteri kaybetmeye devam edecek.)",
    "\"As if / as though\" kalıbı – gerçek dışı bir benzetmeyi anlatır ve Türkçeye \"-mış gibi\" ya da \"sanki... gibi\" şeklinde aktarılır.\nÖrnek: \"The manager spoke as if the merger had already been finalized.\" (Müdür, sanki birleşme çoktan sonuçlanmış gibi konuştu.)",
    "\"Rather than / instead of\" kalıbı – bir tercih ya da karşıtlığı anlatır ve Türkçeye \"-mek yerine\" şeklinde çevrilir; \"ile birlikte\" gibi çevirmek karşıtlığı ortadan kaldırır.\nÖrnek: \"Rather than cutting jobs, the firm decided to reduce everyone's working hours.\" (Şirket, işten çıkarmalar yapmak yerine herkesin çalışma saatlerini azaltmaya karar verdi.)",
    "\"The + comparative..., the + comparative...\" kalıbı – orantılı bir artış/azalışı anlatır ve Türkçeye \"ne kadar... o kadar...\" şeklinde çevrilir.\nÖrnek: \"The longer the negotiations continued, the less likely a compromise seemed.\" (Müzakereler ne kadar uzun sürdüyse bir uzlaşma o kadar az olası göründü.)",
    "\"So + sıfat/zarf + that\" kalıbı – bir sonucu vurgulayan bu yapı Türkçeye \"o kadar/öyle... ki\" şeklinde çevrilir; \"that\" bağlacını eksik çevirmek sonuç anlamını zayıflatır.\nÖrnek: \"The evidence was so compelling that the jury reached a verdict within an hour.\" (Kanıtlar o kadar ikna ediciydi ki jüri bir saat içinde karara vardı.)",
    "Deyimsel/mecazi ifadelerin birebir çevrilmemesi – bir deyimin kelime kelime çevrilmesi anlamı bozar; doğru yaklaşım deyimin taşıdığı anlamı doğal bir Türkçe ifadeyle karşılamaktır.\nÖrnek: \"After years of struggle, the small bakery finally made ends meet.\" (Yıllarca süren mücadelenin ardından küçük fırın nihayet masraflarını karşılar hale geldi.)",
  ];

  const ceviriKuralReferansi2 = [
    "Türkçenin esnek öğe dizilimi – Türkçe cümlede vurgu amacıyla özne, nesne ya da zarflar yer değiştirebilir; ancak İngilizceye çevrilirken mutlaka sabit \"Subject + Verb + Object\" dizilimine oturtulmalıdır.\nÖrnek: \"Bu projeyi baştan sona ekip lideri planladı.\" (The team leader planned this project from start to finish.)",
    "Türkçe ana fiilin cümle sonunda olması – Türkçe cümlede yüklem her zaman cümlenin en sonunda yer alır; çeviriye başlamadan önce bu fiilin zamanını ve kipini doğru tespit etmek İngilizce cümlenin omurgasını belirler.\nÖrnek: \"Şirket, geçen yıl aldığı zararı bu çeyrekte telafi etti.\" (The company made up for last year's loss this quarter.)",
    "\"-erek/-arak\" zarf-fiil eki – eşzamanlı ya da araç bildiren bir eylemi anlatır ve İngilizceye \"by V-ing\" kalıbıyla çevrilir.\nÖrnek: \"Şirket, üretim maliyetlerini düşürerek kâr marjını artırdı.\" (The company increased its profit margin by lowering production costs.)",
    "\"-madan önce / -dıktan sonra\" zaman ifadeleri – İngilizceye \"before V-ing\" ve \"after V-ing\" (ya da \"before/after + cümle\") şeklinde çevrilir.\nÖrnek: \"Yeni politika yürürlüğe girmeden önce tüm çalışanlar bilgilendirildi.\" (All employees were informed before the new policy went into effect.)",
    "\"Rağmen\" bağlacı – \"despite/in spite of\" devamında isim ya da \"-ing\" yapısı ister, \"although/even though\" ise devamında özne-yüklem içeren tam bir cümle ister; bu ikisini karıştırmak yapısal bir hataya yol açar.\nÖrnek: \"Yoğun yağmura rağmen maraton iptal edilmedi.\" (Despite the heavy rain, the marathon was not cancelled.)",
    "Amaç bildiren \"-mek için\" yapısı – İngilizceye \"in order to\", \"so as to\" ya da yalın \"to V0\" şeklinde çevrilir.\nÖrnek: \"Hükümet, işsizliği azaltmak için yeni bir teşvik paketi açıkladı.\" (The government announced a new incentive package in order to reduce unemployment.)",
    "\"Ki\" bağlacıyla kurulan isim cümleciği – bir fiile bağlı \"ki\" yapısı İngilizceye nesne konumundaki \"that + cümle\" ile çevrilir.\nÖrnek: \"Uzmanlar belirtiyor ki bu yöntem enerji tüketimini yarı yarıya azaltabilir.\" (Experts state that this method can reduce energy consumption by half.)",
    "Türkçe edilgen çatı (-il/-in eki) – Türkçedeki edilgen fiil İngilizceye \"be + V3\" yapısıyla aktarılır; öznenin eylemi bizzat yapmadığı, eylemin özneye uygulandığı anlamı korunmalıdır.\nÖrnek: \"Bölgedeki tüm okullar deprem sonrası yeniden inşa edildi.\" (All the schools in the region were rebuilt after the earthquake.)",
    "Deyimsel Türkçe ifadelerin birebir çevrilmemesi – bir Türkçe deyimin kelimesi kelimesine çevrilmesi İngilizcede anlamsız durur; doğru yöntem deyimin ifade ettiği anlamı doğal bir İngilizce kalıpla karşılamaktır.\nÖrnek: \"Yeni yönetmenin göreve başlamasıyla proje eli kulağında bir noktaya geldi.\" (With the new director taking charge, the project is now just around the corner.)",
    "Gereklilik bildiren \"-mAlI / gerekmektedir\" yapıları – İngilizceye \"must\", \"have to\" ya da \"need to\" ile çevrilir; kip derecesine (zorunluluk mu tavsiye mi olduğuna) dikkat edilmelidir.\nÖrnek: \"Yeni çalışanlar, işe başlamadan önce güvenlik eğitimini tamamlamalıdır.\" (New employees must complete the safety training before starting work.)",
    "Karşılaştırma yapıları (\"kadar\", \"-den daha\") – \"kadar\" eşitlik bildirdiğinde \"as...as\", üstünlük bildiren \"-den daha\" ise \"more... than\" ya da \"-er than\" ile çevrilir.\nÖrnek: \"Bu yılki satışlar geçen yılkinden çok daha yüksek gerçekleşti.\" (This year's sales turned out to be much higher than last year's.)",
    "Öğrenilen geçmiş zaman (\"-mIş\") ile Present Perfect/Past Simple seçimi – \"-mIş\" eki hem tanıklık edilmemiş bir geçmişi hem de sonucu şu anı ilgilendiren bir eylemi anlatabilir; bağlama göre Present Perfect ya da Simple Past seçilmelidir.\nÖrnek: \"Araştırmacılar, bu türün nesli tükenmekte olduğunu son raporlarında açıklamışlar.\" (Researchers have stated in their latest report that this species is endangered.)",
  ];

  function ceviriLessonDefs(def) {
    return [
      {
        title: `${def.name} – Konuya Giriş`,
        durationMinutes: 12,
        contentBody: ceviriIntro,
      },
      {
        title: `${def.name} – Kurallar Referansı (1/2): İngilizce-Türkçe Çeviri Tuzakları`,
        durationMinutes: 15,
        contentBody: ceviriKuralReferansi1.join("\n\n"),
      },
      {
        title: `${def.name} – Kurallar Referansı (2/2): Türkçe-İngilizce Çeviri Tuzakları`,
        durationMinutes: 15,
        contentBody: ceviriKuralReferansi2.join("\n\n"),
      },
      {
        title: `${def.name} – Örnek Sorular ve Çözümler`,
        durationMinutes: 15,
        contentBody: formatExamples(ydsExamples[def.slug]),
      },
    ];
  }
  // --- END: ceviri ---

  // --- BEGIN: paragraf custom lesson content (grounded in "YDS-YÖKDİL Çözüm Teknikleri Rehberi" —
  // "E) Okuma Parçaları" chapter: the general reading-comprehension strategy notes (six numbered
  // "Madde" points on pre-reading questions, numerical detail, conjunctions, relative clauses, and
  // near-verbatim distractors) plus the five-way question-type taxonomy (bilgi içeren/detay sorular,
  // açık uçlu sorular, yorum-çıkarım soruları, yazarın tutumu soruları, ana fikir/başlık soruları) and
  // four fully worked reading passages used only as inspiration for realistic question patterns. All
  // prose, categorization and example sentences/passages below are original.) ---
  const paragrafIntro =
    "YDS'de en çok soru barındıran kategori 'Paragraf Soruları'dır: sınavda ortalama yirmi soru, kısa-orta uzunlukta İngilizce okuma parçalarına bağlı üç ila altı soruluk gruplar halinde sorulur. Bu sorularda ölçülen şey kelime bilginizin yanı sıra bir metni bütün olarak kavrama, cümleler arasındaki mantıksal bağlantıları takip etme ve metinde açıkça yazılmayan ama mantıken çıkarılabilen bilgilere ulaşabilme becerisidir. En verimli yaklaşım şudur: önce parçayı hızlıca (skim) okuyup genel konuyu ve akışı kavrayın, ayrıntılara bu aşamada takılmayın; ardından soruları okuyarak nelerin sorulacağını öğrenin; son olarak her soru için metne geri dönüp ilgili cümle veya paragrafı dikkatle tekrar okuyun. Bu üç adımlı yöntem hem zamandan tasarruf sağlar hem de aynı satırları defalarca amaçsızca okumanızı önler.\n\n" +
    "Ana Fikir Soruları\nBu soru tipi genellikle 'The main idea of the passage is...', 'Which of the following could be the best title for this passage?' ya da 'The passage is mainly concerned with...' gibi kalıplarla sorulur ve sizden metnin tamamını ya da büyük çoğunluğunu tek cümlede özetleyen seçeneği bulmanız istenir. Doğru cevap ne çok dar/tek bir ayrıntıya odaklanmalı (bu genellikle bir paragrafın sadece bir cümlesini yansıtan bir çeldiricidir) ne de metinde geçmeyecek kadar geniş ve iddialı olmalıdır. Pratik bir ipucu: eğer parçanın son cümlesi bir genelleme ya da sonuç niteliği taşıyorsa, ana fikir çoğu zaman bu son cümlede saklıdır; metnin ortasındaki ayrıntılar sadece bu genellemeyi desteklemek için verilmiştir.\n\n" +
    "Yazarın Tutumu ve Üslubu Soruları\n'The author's attitude towards X is...' ya da 'Throughout the passage, the author seems to be...' gibi sorularda metni kendi bakış açınızdan değil, YAZARIN bakış açısından değerlendirmeniz gerekir. İpucu genellikle yazarın kullandığı sıfatlarda saklıdır: 'promising', 'remarkable', 'alarming', 'controversial' gibi kelimeler yazarın konuya nasıl yaklaştığını ele verir. Eğer yazar hem olumlu hem olumsuz ifadeleri dengeli biçimde kullanıyorsa doğru cevap genellikle 'objective/neutral/impartial' (tarafsız) seçeneğidir; sadece tek yönlü ifadeler kullanılıyorsa 'critical', 'enthusiastic' ya da 'skeptical' gibi daha belirgin bir tutum doğru olabilir. Aşırı uçlardaki seçenekler ('outraged', 'ecstatic' gibi) çoğu zaman çeldiricidir, çünkü akademik/haber metinlerinde yazarlar nadiren bu denli aşırı bir tutum sergiler.\n\n" +
    "Çıkarım (Inference) Soruları\n'It can be inferred from the passage that...' ya da 'One can conclude that...' şeklindeki sorular, metinde birebir yazılmayan ama verilen bilgilerden mantıksal olarak çıkarılabilecek bir sonucu sorar. Burada dikkat edilmesi gereken incelik, çıkarımın metindeki bilgilerle doğrudan desteklenmesi, ancak metnin ötesine öznel bir yorum ya da varsayımla geçmemesidir; doğru seçenek metindeki iki ayrı bilgiyi birleştirerek ya da bir cümlenin dolaylı sonucunu ortaya koyarak elde edilir. Örneğin metinde 'grup halinde göç eden hayvanların hayatta kalma oranı daha yüksekti' deniyorsa, buradan 'grup halinde göç etmenin bir hayatta kalma avantajı sağladığı' çıkarılabilir; ama metinde hiç bahsedilmeyen bir nedene (örneğin 'bunun nedeni sosyal bağlardır' gibi) atıfta bulunan bir seçenek çok ileri gitmiş sayılır ve yanlıştır.\n\n" +
    "Detay (Specific Detail) Soruları\nBu soru tipinde cevap metinde açıkça yazılıdır ve genellikle 'According to the passage...', 'It is stated in the passage that...' gibi kalıplarla başlar. Burada yorum yapmaya gerek yoktur; tek gereken, sorunun işaret ettiği bilgiye metinde doğru satırı bularak ulaşmaktır. En sık karşılaşılan tuzak, doğru görünen ama metindeki bir başka unsura ait bilgiyi yanlış unsura bağlayan seçeneklerdir: örneğin metinde A nedeninin B sonucuna yol açtığı yazılıyorsa, çeldirici seçenek bu neden-sonuç ilişkisini C ile D arasında kurabilir ya da tam tersine çevirebilir. Bu yüzden metindeki cümleyi seçenekle karşılaştırırken sadece kelimelerin tanıdık gelmesine değil, kime/neye ait olduğuna dikkat edilmelidir. 'Which of the following is NOT mentioned/true according to the passage?' türü sorularda ise dört seçenek metinle eşleşirken tek bir seçenek metinde hiç geçmez ya da metinle çelişir; bu nedenle seçenekleri tek tek metinle karşılaştırmak en güvenilir yöntemdir.\n\n" +
    "Bağlam İçinde Kelime (Vocabulary-in-Context) Soruları\n'The word/phrase X in line Y is closest in meaning to...' şeklindeki bu sorular, bir kelimenin sözlük anlamını değil, o cümle içindeki kullanımına en yakın anlamı sorar; birçok İngilizce kelimenin birden fazla anlamı olduğundan, bilinen ilk anlamı seçmek yerine cümlenin bağlamına bakmak şarttır. Örneğin 'address' kelimesi bir cümlede 'ele almak/çözmeye çalışmak' anlamında kullanılabilirken başka bir cümlede 'hitap etmek' ya da 'adres' anlamına gelebilir. Bu tip sorularda en pratik yöntem, o kelimeyi cümleden çıkarıp aday seçeneklerle tek tek değiştirerek cümlenin anlamının bozulup bozulmadığını kontrol etmektir; anlamı en doğal ve tutarlı şekilde koruyan seçenek doğru cevaptır.\n\n" +
    "Referans Kelimeler (it, this, they) Soruları\n'What does the word \"it/this/they\" in line X refer to?' şeklindeki sorularda amaç, bir zamir ya da işaret sözcüğünün metindeki hangi isme veya fikre gönderme yaptığını bulmaktır. Çözüm için önce zamirin tekil mi çoğul mu olduğuna bakılır (bu, aday isimleri hızla eler), ardından zamirden hemen önceki cümle ya da cümlecikte bu sayıya uyan en yakın isim aranır; zamirler neredeyse her zaman kendisinden önce gelen bir ifadeye atıfta bulunur, sonrasına değil. 'This' ve 'that' bazen tek bir kelimeye değil, önceki cümlenin ya da paragrafın tamamına atıfta bulunan bir fikri özetler; bu durumda doğru seçenek tek bir isim değil, önceki cümlenin genel anlamını yansıtan bir ifade olacaktır.\n\n" +
    "Sonuç olarak, paragraf sorularında başarı, doğru stratejiyi doğru soru tipine uygulayabilmekten geçer: detay sorularında hız ve satır takibi, çıkarım ve tutum sorularında dikkatli ama ölçülü bir yorumlama, ana fikir sorularında ise ayrıntılardan sıyrılıp genel resmi görebilme becerisi gerekir. Zaman yönetimi açısından, uzun bir parçaya bağlı sorularda önce daha kolay ve doğrudan olan detay sorularını çözüp ana fikir ve çıkarım sorularını en sona bırakmak, hem özgüveninizi hem de doğru cevap oranınızı artırır. En sık düşülen tuzak, metinde geçen bir cümlenin neredeyse birebir aynısını ama farklı bir özneye ya da nesneye bağlayan seçeneklere kanmaktır; bu yüzden bir seçenek size 'tanıdık' geldiğinde bile, o cümlenin metinde gerçekten neye atıfta bulunduğunu son kez kontrol etmeden işaretlemeyin.";

  const paragrafKuralReferansi1 = [
    "Ana Fikir Sorusu (Main Idea) – Paragrafın tamamını kapsayan genel bir yargıyı ifade eden soru tipidir; doğru cevap tek bir ayrıntıya değil, metnin bütününe karşılık gelir.\nÖrnek: \"Renewable energy sources such as solar and wind now account for a growing share of global electricity, though storage technology remains a major obstacle to their widespread adoption.\" (Bu paragrafın ana fikri, yenilenebilir enerjinin payının arttığı ama depolama sorununun hâlâ engel oluşturduğudur; sadece 'güneş enerjisi artıyor' diyen bir seçenek eksik/dar bir ana fikir olur.)",
    "En Uygun Başlık Sorusu (Best Title) – Ana fikir sorusuna benzer ama cevabın bir cümle değil kısa bir başlık biçiminde olması beklenir; doğru başlık ne çok dar (tek bir ayrıntıyı kapsayan) ne de çok geniş (metnin kapsamının çok ötesine geçen) olmalıdır.\nÖrnek: \"The Rise and Limits of Renewable Energy\" (Bu başlık hem enerjinin yükselişini hem de karşılaştığı sınırlılıkları kapsadığı için 'Solar Panels in Modern Cities' gibi dar bir başlıktan daha uygun bir seçenektir.)",
    "Yazarın Amacı Sorusu (Author's Purpose) – Yazarın metni hangi niyetle kaleme aldığını sorar: bilgi vermek, bir görüşü savunmak/desteklemek, karşılaştırma yapmak ya da eleştirmek gibi.\nÖrnek: \"Several independent studies published between 2015 and 2023 report a consistent link between air pollution and reduced cognitive performance in children.\" (Yazar burada sadece bilgi vermekle kalmayıp sayısal/bilimsel kanıtlar sunarak bir iddiayı desteklemeyi amaçlamaktadır.)",
    "Yazarın Tutumu Sorusu (Author's Attitude) – Yazarın ele aldığı konuya karşı olumlu, olumsuz ya da tarafsız bir tutum sergileyip sergilemediğini sorar; ipucu genellikle kullanılan sıfat ve zarflardadır.\nÖrnek: \"The new policy, while well-intentioned, has so far produced disappointing results and drawn criticism from economists.\" ('Well-intentioned' ifadesi kısmi bir olumluluk, 'disappointing' ve 'criticism' ise ağır basan bir olumsuzluk taşıdığından yazarın tutumu 'mildly critical' olarak nitelendirilir.)",
    "Dengeli/Tarafsız Ton Sorusu (Objective Tone) – Metin boyunca hem olumlu hem olumsuz yönler eşit ağırlıkta sunuluyorsa doğru cevap genellikle 'objective/neutral/balanced' seçeneğidir.\nÖrnek: \"Gene-editing technology offers remarkable promise for treating hereditary diseases, yet it also raises serious ethical questions that remain unresolved.\" (Burada hem 'remarkable promise' hem 'serious ethical questions' dengeli biçimde sunulduğundan yazarın tutumu tarafsızdır.)",
    "Çıkarım Sorusu (Inference) – Metinde açıkça yazılmayan ama verilen bilgilerden mantıksal olarak ulaşılabilecek bir sonucu sorar; doğru cevap metindeki bilgiyle doğrudan bağlantılı olmalı, aşırı yoruma kaçmamalıdır.\nÖrnek: \"Employees who worked remotely at least three days a week reported fewer sick days than those who commuted daily.\" (Buradan 'uzaktan çalışmanın bir sağlık avantajı sağlayabileceği' çıkarılabilir; ama metinde hiç geçmeyen 'trafik kirliliğinin azaldığı' gibi bir sonuç çok ileri gitmiş sayılır.)",
    "Neden-Sonuç Çıkarımı (Cause-Effect Inference) – Bir paragrafta birden fazla neden sıralanmış olsa da, metindeki vurgudan hareketle ana nedeni ayırt etmeyi gerektirir.\nÖrnek: \"While marketing costs and rising rents played a role, the bookstore's closure was driven primarily by the sharp decline in foot traffic after the highway bypass opened.\" (Metinde birden fazla neden geçse de vurgulanan 'primarily' ifadesi ana nedenin otoyol çevre yolu olduğunu gösterir.)",
    "Karşılaştırma/Karşıtlık Çıkarımı (Contrast Inference) – İki durum ya da öğe arasında kurulan zıtlıktan, metinde doğrudan söylenmeyen bir farkı çıkarmayı gerektirir.\nÖrnek: \"Unlike the coastal cities, which rely heavily on tourism, the inland towns in this region have built their economies around agriculture and light manufacturing.\" (Buradan iç kesim kasabalarının turizme kıyasla ekonomik olarak daha çeşitli/bağımsız kaynaklara sahip olabileceği çıkarılabilir.)",
    "Sonuç Tahmini Sorusu (Predicting Outcome) – Metindeki eğilim ya da bilgiden hareketle, açıkça yazılmayan olası bir gelecek sonucu tahmin etmeyi gerektirir.\nÖrnek: \"Over the past decade, the glacier has retreated nearly two kilometers, and the rate of melting has accelerated each year.\" (Bu bilgiden, eğilim değişmezse buzulun önümüzdeki yıllarda tamamen kaybolabileceği makul bir tahmindir.)",
    "Değil/Yanlış Olan Seçenek Sorusu (EXCEPT/NOT TRUE) – Dört seçenek metinle örtüşürken, doğru cevap metinde hiç geçmeyen ya da metinle çelişen tek seçenektir; seçenekleri metinle tek tek karşılaştırmak gerekir.\nÖrnek: \"The museum's new wing houses artifacts from three ancient civilizations, features an interactive digital archive, and is fully accessible to visitors with disabilities.\" ('Sunar ücretsiz rehberli turlar' gibi metinde hiç bahsedilmeyen bir seçenek, bu soru tipinde doğru cevap olur.)",
    "Paragraf Organizasyonu – Karşılaştırma Yapısı (Compare-Contrast) – Paragrafın iki kavramı art arda karşılaştırarak ilerlediği yapıları tanımayı gerektirir; 'unlike', 'in contrast', 'whereas' gibi ifadeler bu yapının işaretidir.\nÖrnek: \"Traditional classrooms emphasize rote memorization, whereas project-based programs prioritize hands-on problem-solving.\" (Bu tür paragraflarda sorular genellikle iki yaklaşım arasındaki temel farkı test eder.)",
    "Paragraf Organizasyonu – Kronolojik Yapı (Chronological Order) – Bir sürecin ya da olayın zaman içindeki gelişimini anlatan paragraflarda soruların çoğu hangi aşamada neyin olduğunu sorar.\nÖrnek: \"The vaccine's development began with laboratory trials in 2018, moved to small-scale human trials by 2020, and received full regulatory approval in 2022.\" (Bu tür paragraflarda 'aşı ne zaman insanlar üzerinde test edilmeye başlandı?' gibi sorular sıkça karşımıza çıkar.)",
    "Yazarın Örnekleme ve Alıntı Kullanımı – Yazarın bir iddiayı desteklemek için kullandığı somut örnek ya da alıntılar, hem yazarın amacını hem tutumunu anlamada önemli ipuçlarıdır.\nÖrnek: \"As one urban planner put it, 'a city without green spaces is a city without a future.'\" (Bu alıntı, yazarın yeşil alanları savunan bir tutum sergilediğinin güçlü bir göstergesidir.)",
    "Çekimser/Temkinli Dil Kullanımı (Hedging Language) – 'May', 'might', 'appears to', 'suggests' gibi ifadeler yazarın bir iddiayı kesin değil, olası/ihtimalli olarak sunduğunu gösterir; bu incelik çıkarım sorularında sıkça test edilir.\nÖrnek: \"The data suggest that the new teaching method may improve retention, although further research is needed to confirm this.\" (Bu cümledeki 'suggest' ve 'may' ifadeleri, yazarın kesin bir iddiada bulunmadığını gösterir; doğru seçenek de bu belirsizliği yansıtmalıdır.)",
  ];

  const paragrafKuralReferansi2 = [
    "Detay (Specific Detail) Sorusu – Cevap metinde açıkça yazılıdır; yorum gerektirmez, sadece ilgili satırı doğru bulup seçenekle karşılaştırmak yeterlidir.\nÖrnek: \"The bridge, completed in 1937, spans nearly three kilometers and was, at the time, the longest suspension bridge in the world.\" ('Köprü ne zaman tamamlandı?' sorusunun cevabı doğrudan '1937' bilgisinden bulunur.)",
    "Sayısal Veri Detay Sorusu (Numerical Detail) – Tarih, yüzde, miktar gibi sayısal bilgilere odaklanan soru tipidir; seçenekler genellikle metindeki sayıyı hafifçe değiştirerek çeldirici oluşturur.\nÖrnek: \"Nearly sixty percent of the survey's respondents said they would support the new recycling program, while only twelve percent opposed it outright.\" (Bu tür sorularda yüzde altmış ile yüzde elli gibi birbirine yakın rakamları karıştırmamak için metne geri dönüp sayıyı doğrulamak gerekir.)",
    "Belirli Bir Kişi/Kuruma Ait Bilgi Sorusu (Attribution Detail) – Bir bilginin metinde kime ait olduğunu (hangi araştırmacıya, kuruma, tarafa) doğru eşleştirmeyi gerektirir; çeldiriciler bilgiyi yanlış kişiye/kuruma bağlar.\nÖrnek: \"While the finance ministry projected steady growth, the central bank's own economists warned of a possible slowdown in the coming year.\" (Burada 'yavaşlama uyarısını kim yaptı?' sorusunun cevabı merkez bankası ekonomistleridir, maliye bakanlığı değil.)",
    "Bağlam İçinde Kelime Sorusu (Vocabulary in Context) – Çok anlamlı bir kelimenin cümle içindeki özel kullanımına en yakın anlamı sorar; kelimenin en yaygın bilinen anlamı her zaman doğru olmayabilir.\nÖrnek: \"The committee decided to table the proposal until further research could be conducted.\" (Burada 'table' fiili 'masaya koymak' değil, 'ertelemek/gündemden çıkarmak' anlamında kullanılmıştır.)",
    "Çok Anlamlı Kelime Tuzağı (Multiple-Meaning Trap) – Seçeneklerden biri kelimenin yaygın ama bu cümledeki bağlama uymayan anlamını sunar; bu, dikkatsiz adaylar için güçlü bir çeldiricidir.\nÖrnek: \"Her calm response to the crisis really moved the entire team.\" (Burada 'moved' fiili 'taşınmak/hareket etmek' değil, 'duygusal olarak etkilemek' anlamındadır; 'taşınmak' anlamını seçen bir seçenek yanlış olur.)",
    "Deyimsel İfade Bağlamı (Idiomatic Phrase in Context) – Kelimelerin tek tek anlamından farklı, bütün olarak özel bir anlam taşıyan deyimsel ifadelerin doğru yorumlanmasını gerektirir.\nÖrnek: \"After the scandal broke, the CEO's carefully built reputation was in tatters.\" ('In tatters' ifadesi 'paramparça/yerle bir olmuş' anlamına gelir; bu ifade CEO'nun itibarının tamamen zedelendiğini anlatır.)",
    "Referans Kelimesi Sorusu – Tekil Zamir (it/this) – 'It' ya da 'this' kelimesinin metindeki hangi tekil isme veya fikre atıfta bulunduğunu bulmayı gerektirir; genellikle zamirden hemen önceki cümleye bakılır.\nÖrnek: \"Scientists recently discovered a new species of frog in the Amazon rainforest. It can change the color of its skin within seconds to avoid predators.\" (Buradaki 'it' kelimesi bariz biçimde tekil ve canlı bir özneye atıfta bulunduğundan, hemen önceki cümlede geçen 'a new species of frog'a işaret eder, 'Amazon rainforest' ya da 'scientists' gibi diğer isimlere değil.)",
    "Referans Kelimesi Sorusu – Çoğul Zamir (they/these/those) – 'They' ya da 'these' gibi çoğul zamirlerin metindeki hangi çoğul isme atıfta bulunduğunu bulmayı gerektirir; sayı uyumu ilk elemedir.\nÖrnek: \"Researchers tagged over two hundred sea turtles along the coastline. They will be tracked by satellite for the next five years.\" (Buradaki 'they' kelimesi çoğul olduğundan, tekil olan 'the coastline' değil, çoğul olan 'sea turtles' isim öbeğine atıfta bulunur.)",
    "Referans Kelimesi Sorusu – Fikir Özetleyen 'this/that' (Idea-Referent) – Bazı durumlarda 'this' tek bir isme değil, önceki cümlenin tamamına ya da bir duruma atıfta bulunur; doğru seçenek bu durumda tek bir kelime değil, özetleyici bir ifade olmalıdır.\nÖrnek: \"Over the past year, three major retailers in the district have closed their doors permanently. This has left many residents without easy access to affordable groceries.\" (Buradaki 'this' tek bir isme değil, üç büyük perakendecinin kapanması fikrinin tamamına atıfta bulunur.)",
    "Paragraf Organizasyonu – Konu Cümlesi Tanıma (Topic Sentence) – Bir paragrafın konu cümlesi genellikle en başta yer alır ve paragrafın geri kalanının hangi fikri desteklediğini gösterir; ana fikir soruları çoğunlukla bu cümleyle örtüşür.\nÖrnek: \"Urban beekeeping has grown rapidly in the past decade, driven by a combination of environmental awareness and changing city regulations.\" (Bu konu cümlesinden sonra gelen tüm ayrıntılar -çevre bilinci, yönetmelik değişiklikleri- bu cümleyi desteklemek için verilir.)",
    "Paragraf Organizasyonu – Sonuç/Genelleme Cümlesi Tanıma (Concluding Sentence) – Paragrafın son cümlesi çoğu zaman önceki tüm bilgileri bir araya getiren bir genellemedir; ana fikir sorularında bu cümleye özel önem verilmelidir.\nÖrnek: \"Taken together, these findings indicate that early childhood nutrition plays a far greater role in long-term health outcomes than previously assumed.\" (Bu tür bir kapanış cümlesi genellikle ana fikir sorusunun doğru cevabına doğrudan işaret eder.)",
    "Neredeyse Birebir Alıntı Tuzağı (Near-Verbatim Distractor) – Bir seçenek, metindeki bir cümleyi neredeyse birebir kullanır ama bu cümleyi farklı bir özneye veya nesneye bağlayarak yanıltır; seçeneğin kelimeleri tanıdık gelse de hangi unsura ait olduğunu kontrol etmek gerekir.\nÖrnek: \"The new filtration system reduced contamination levels in the reservoir by half, but it had little effect on the river further downstream.\" (Bir çeldirici seçenek 'the river' yerine 'the reservoir'ın da yarı yarıya düzelmediğini iddia edebilir; kelimeler tanıdık olsa da hangi su kaynağına ait olduğu karıştırılmıştır.)",
    "Kapsam Abartma Tuzağı (Overgeneralization Trap) – Metinde 'some/many/a few' gibi sınırlı bir nicelik belirtilirken, çeldirici seçenek bunu 'all/most/every' gibi çok daha geniş kapsamlı bir ifadeye dönüştürür.\nÖrnek: \"Some coastal towns in the region have begun restricting new construction near the shoreline.\" (Metin sadece 'bazı' kıyı kasabalarından bahsederken, çeldirici bir seçenek bunu 'tüm kıyı kasabaları' şeklinde abartarak sunabilir.)",
    "Neden-Sonuç Yönü Ters Çevirme Tuzağı (Reversed Causation Trap) – Metindeki 'A, B'ye yol açtı' ilişkisi, çeldirici bir seçenekte 'B, A'ya yol açtı' şeklinde tersine çevrilerek sunulur; bu ince ayrımı yakalamak dikkatli okuma gerektirir.\nÖrnek: \"A prolonged drought led to a sharp increase in wildfires across the region.\" (Metin kuraklığın orman yangınlarına yol açtığını söylerken, bir çeldirici seçenek bunun tersini, yani yangınların kuraklığa yol açtığını iddia edebilir.)",
  ];

  function paragrafLessonDefs(def) {
    return [
      {
        title: `${def.name} – Konuya Giriş`,
        durationMinutes: 15,
        contentBody: paragrafIntro,
      },
      {
        title: `${def.name} – Kurallar Referansı (1/2): Ana Fikir, Yazar Tutumu ve Çıkarım Soru Tipleri`,
        durationMinutes: 15,
        contentBody: paragrafKuralReferansi1.join("\n\n"),
      },
      {
        title: `${def.name} – Kurallar Referansı (2/2): Detay, Bağlamda Kelime ve Referans Kelime Soru Tipleri`,
        durationMinutes: 15,
        contentBody: paragrafKuralReferansi2.join("\n\n"),
      },
      {
        title: `${def.name} – Örnek Sorular ve Çözümler`,
        durationMinutes: 18,
        contentBody: formatExamples(ydsExamples[def.slug]),
      },
    ];
  }
  // --- END: paragraf ---

  // --- BEGIN: yakin-anlamli-cumle custom lesson content (grounded in "YDS-YÖKDİL Çözüm Teknikleri
  // Rehberi" — "F) Eş Anlam" chapter) ---
  const yakinAnlamliIntro =
    "YDS'de \"Yakın Anlamlı Cümle\" sorularında amaç, size verilen bir cümleyi ezbere hatırlamak değil, o cümlenin taşıdığı anlamı başka sözcüklerle ve başka bir yapıyla yeniden kurabilmektir. Soru kökünde bir cümle verilir ve beş seçenekten yalnızca biri bu cümleyle TAM olarak aynı anlamı taşır: seçenek ne orijinal cümlede bulunmayan bir bilgi eklemeli, ne de orijinal cümledeki bir bilgiyi eksik bırakmalı ya da çarpıtmalıdır. Bu soru tipinde kişisel yorum ya da metin dışı bilgiye yer yoktur; doğru seçenek her zaman soru kökünün kendisinden çıkarılabilen, tartışmasız bir eşdeğerliktir. Doğru seçeneğe ulaşmanın en güvenilir yolu, cümledeki anlamı taşıyan temel unsurları -özne, eylem, bağlaç, zaman ve olasılık derecesini- tek tek her seçenekle karşılaştırmaktır.\n\n" +
    "Eş Anlamlı Sözcük Değişimini Tanımak\n" +
    "Birçok yakın anlamlı cümle sorusunda doğru seçenek, soru kökündeki anahtar sözcüklerin -genellikle sıfat, fiil ya da isimlerin- eşanlamlılarıyla değiştirilmesiyle oluşturulur. Örneğin \"enormous\" (muazzam) sözcüğü \"astronomical\" ile, \"cancel\" (iptal etmek) sözcüğü \"call off\" ile karşılanabilir. Bu tür sorularda ilk adım, cümledeki \"yük taşıyan\" sözcükleri -yani cümlenin anlamını asıl belirleyen sözcükleri- tespit etmek olmalıdır. Ardından her seçenekte bu sözcüklerin karşılığının bulunup bulunmadığına, bulunuyorsa da aynı derecede (örneğin \"birçok\" ile \"tümü\" aynı derece değildir) aktarılıp aktarılmadığına bakılmalıdır. Sözcüğün birebir çevirisi değil, cümle içindeki işlevine karşılık gelen eşanlamlısı aranmalıdır.\n\n" +
    "Bağlaç ve Zaman İlişkisi Eşdeğerlerini Bilmek\n" +
    "YDS'de sıkça karşılaşılan bağlaçların birden fazla eşdeğer ifade biçimi vardır ve bu eşdeğerlikleri bilmek, doğru seçeneği çok daha hızlı bulmayı sağlar. \"Although\" bir yan cümleciği bağlarken \"despite\" bir isim ya da gerund alır; \"because\" bir cümleciği bağlarken \"due to\" bir isim tamlamasını neden gösterir; \"unless\" olumsuz bir koşulu tek başına ifade ederken bu \"if...not\" ile de karşılanabilir. Zaman ilişkilerinde de benzer bir durum vardır: \"not until\" ile anlatılan bir gecikme, \"only after\" ile devrik ya da düz bir cümlede yeniden kurulabilir. Bu bağlaç ve zaman ilişkisi eşdeğerlerine hakim olmak, seçenekler arasında yapısal olarak çok farklı görünen ama anlamca birebir örtüşen doğru cevabı tanımanızı kolaylaştırır.\n\n" +
    "Yapısal Dönüşümleri Yakalamak\n" +
    "Bir cümlenin anlamı bozulmadan yapısı büyük ölçüde değiştirilebilir. Etken bir cümle edilgen çatıya çevrildiğinde özne ile nesne yer değiştirir, ancak eylemi kimin yaptığı bilgisi (fail) kaybolmamalıdır. Bir cümledeki ana ve yan cümle sırası değiştirildiğinde bağlaç buna göre uyarlanmalı, ancak hangi bilginin diğerine bağlı olduğu (zaman, neden, koşul) sabit kalmalıdır. Neden-sonuç ilişkisi de yön değiştirerek yeniden ifade edilebilir: \"X, Y'ye yol açtı\" cümlesi, odağı değiştirip \"Y, X'in bir sonucuydu\" şeklinde de kurulabilir. Son olarak, bir eylemi isimleştiren gerund öznesi (\"Ignoring the rules caused the accident\"), aynı anlamı taşıyan bir \"that\" cümleciğiyle (\"The fact that the rules were ignored caused the accident\") değiştirilebilir. Bu dönüşümlerin hiçbirinde cümlenin özü değişmez; değişen yalnızca cümleyi kuran dilbilgisel araçtır.\n\n" +
    "Sık Görülen Çeldirici Tuzaklar\n" +
    "Yanlış seçenekler genellikle üç yöntemden biriyle hazırlanır. Birincisi, anlamı ince bir biçimde değiştirmektir: soru kökünde \"some\" (bazı) ile sınırlı bir bilgi, yanlış seçenekte \"most\" (çoğu) ya da \"all\" (tüm) gibi daha geniş kapsamlı bir ifadeyle sunularak abartılır; ya da \"unlikely\" (olası değil) gibi bir olasılık, \"impossible\" (imkansız) gibi kesin bir yargıya dönüştürülür. İkincisi, soru kökünde hiç bulunmayan bir varsayımı seçeneğe eklemektir: cümlede belirtilmeyen bir neden, sonuç ya da niyet, sanki metinde varmış gibi sunulur. Üçüncüsü ise mantıksal ilişkinin yönünü tersine çevirmektir: \"A, B'ye yol açtı\" bilgisi, yanlış seçenekte \"B, A'ya yol açtı\" şeklinde tersine döndürülür, ya da bir zıtlık ilişkisi (\"although/despite\") sanki bir sonuç ilişkisiymiş gibi sunulur. Bu üç tuzağı tanımak, kulağa doğru gelen ama aslında yanlış olan seçenekleri hızlıca elemenizi sağlar.\n\n" +
    "Sonuç olarak, yakın anlamlı cümle sorularında hız değil dikkat belirleyicidir. Önce soru kökündeki cümleyi anlam birimlerine ayırın: kim, ne yaptı, hangi koşulda, ne zaman ve hangi kesinlik derecesiyle. Ardından her seçeneği bu birimlerle tek tek karşılaştırın; bir seçenek soru kökünde olmayan bir bilgi içeriyorsa ya da soru kökündeki bir bilgiyi dışarıda bırakıyorsa doğru cevap olamaz. Eş anlamlı sözcükleri, bağlaç eşdeğerliklerini ve yapısal dönüşümleri tanımak size seçenekleri hızla eleme becerisi kazandırır; ancak son karar her zaman soru kökünün anlamını en eksiksiz ve en fazlasız şekilde koruyan seçenek olmalıdır.";

  const yakinAnlamliKuralReferansi1 = [
    "Although / Despite Dönüşümü – 'although' bir yan cümleyi bağlarken, 'despite' ve 'in spite of' bir isim ya da gerund alır; bağlacı değiştirirken cümledeki fiili isimleştirmek gerekir.\nÖrnek: \"Although the bridge was badly damaged, engineers reopened it within a week.\" → \"Despite the severe damage to the bridge, engineers reopened it within a week.\" (Köprü ağır hasar görmesine rağmen mühendisler onu bir hafta içinde yeniden açtı.)",
    "Because / Due to Dönüşümü – 'because' bir cümleciği, 'due to' ve 'owing to' ise bir isim tamlamasını neden olarak gösterir; anlam bozulmadan yapı değiştirilebilir.\nÖrnek: \"Because the roads were covered in ice, most flights were delayed that morning.\" → \"Due to the icy roads, most flights were delayed that morning.\" (Yollar buzla kaplı olduğu için o sabah çoğu uçuş gecikti.)",
    "Neden Cümlesinin Sonuç Cümlesine Çevrilmesi – 'X, çünkü Y' yapısı, bağlacı ve cümle sırasını değiştirerek 'Y, bu yüzden X' şeklinde de ifade edilebilir; temel neden-sonuç ilişkisi aynı kalır.\nÖrnek: \"The factory shut down because demand for its products had collapsed.\" → \"Demand for the factory's products had collapsed, so it shut down.\" (Ürünlerine olan talep çöktüğü için fabrika kapandı.)",
    "So...That / Due to the Fact That Dönüşümü – 'so + sıfat + that' yapısındaki derece-sonuç ilişkisi, 'due to the fact that' ile nedeni öne çıkaran bir yapıya çevrilebilir.\nÖrnek: \"The lecture was so tedious that half the audience left early.\" → \"Due to the fact that the lecture was extremely tedious, half the audience left early.\" (Ders o kadar sıkıcıydı ki dinleyicilerin yarısı erken ayrıldı.)",
    "Unless / If...Not Dönüşümü – 'unless' bağlacı, olumsuz bir koşulu tek başına ifade eder; bu bağlaç 'if...not' yapısıyla birebir aynı anlamda yeniden yazılabilir.\nÖrnek: \"Unless the shipment arrives by Friday, the launch will be postponed.\" → \"If the shipment does not arrive by Friday, the launch will be postponed.\" (Sevkiyat cumaya kadar gelmezse lansman ertelenecek.)",
    "No Matter How / Even If Dönüşümü – 'no matter how/what' yapısı bir durumun hiçbir koşulda sonucu değiştirmeyeceğini anlatır; bu anlam 'even if' ya da 'whatever' ile de karşılanabilir.\nÖrnek: \"No matter how much he apologizes, she will not forgive him.\" → \"Even if he apologizes repeatedly, she will not forgive him.\" (Ne kadar özür dilerse dilesin, kadın onu affetmeyecek.)",
    "Probably Because / The Reason Why Dönüşümü – bir olasılığa bağlı neden, 'probably because' yerine 'the reason why...might be that' kalıbıyla da ifade edilebilir; olasılık derecesi (probably = might) korunmalıdır.\nÖrnek: \"Sales dropped last quarter, probably because the new packaging confused customers.\" → \"The reason why sales dropped last quarter might be that the new packaging confused customers.\" (Geçen çeyrekte satışlar muhtemelen yeni ambalaj müşterilerin kafasını karıştırdığı için düştü.)",
    "Otherwise / Unless Dönüşümü – bir kuralın uygulanmaması durumunda ortaya çıkacak sonucu bildiren 'otherwise', 'unless' ya da 'if...not' ile eşdeğer biçimde yeniden yazılabilir.\nÖrnek: \"Visitors must wear protective goggles in the lab; otherwise, they risk eye injury.\" → \"Unless visitors wear protective goggles in the lab, they risk eye injury.\" (Ziyaretçiler laboratuvarda koruyucu gözlük takmazsa göz yaralanması riskiyle karşılaşır.)",
    "Other Than / Except For Dönüşümü – 'other than' bir istisnayı belirtirken, aynı anlam 'except for' ya da 'apart from' ile de verilebilir; cümledeki tek istisna vurgusu korunmalıdır.\nÖrnek: \"No language other than Mandarin has more native speakers worldwide.\" → \"Except for Mandarin, no language has more native speakers worldwide.\" (Mandarin dışında hiçbir dilin dünya çapında daha fazla anadil konuşuru yoktur.)",
    "Not Until / Only After Dönüşümü – 'not until' yapısı bir eylemin ancak belirli bir noktadan sonra gerçekleştiğini anlatır; bu yapı 'only after' ile devrik ya da düz cümlede yeniden kurulabilir.\nÖrnek: \"The team did not realize the error until the results had already been published.\" → \"Only after the results had already been published did the team realize the error.\" (Ekip, sonuçlar yayımlandıktan sonra ancak hatayı fark etti.)",
    "Not Only...But Also / In Addition To Dönüşümü – iki bilgiyi birlikte vurgulayan 'not only...but also' yapısı, 'in addition to' ya da 'as well as' ile aynı ekleme anlamını taşıyacak şekilde yeniden yazılabilir.\nÖrnek: \"The policy not only reduced emissions but also created thousands of new jobs.\" → \"In addition to reducing emissions, the policy created thousands of new jobs.\" (Politika, emisyonları azaltmasının yanı sıra binlerce yeni iş de yarattı.)",
    "While / Whereas Karşıtlık Dönüşümü – iki durumu karşılaştırarak zıtlık kuran 'while/whereas' bağlacı, aynı karşıtlık 'in contrast' ya da 'on the other hand' gibi bağlayıcılarla iki ayrı cümle halinde de verilebilir.\nÖrnek: \"While the coastal region enjoys mild winters, the inland areas experience heavy snowfall.\" → \"The coastal region enjoys mild winters; in contrast, the inland areas experience heavy snowfall.\" (Kıyı bölgesi ılıman kışlar yaşarken, iç kesimler yoğun kar yağışı yaşar.)",
    "Instead Of / Rather Than Dönüşümü – bir tercihi karşıt bir seçenekle birlikte sunan 'instead of', aynı anlamı 'rather than' ile de verebilir; iki yapı da cümle başında ya da ortasında kullanılabilir.\nÖrnek: \"Instead of hiring new staff, the company decided to retrain its existing employees.\" → \"Rather than hire new staff, the company decided to retrain its existing employees.\" (Şirket yeni personel almak yerine mevcut çalışanlarını yeniden eğitmeye karar verdi.)",
  ];

  const yakinAnlamliKuralReferansi2 = [
    "Active / Passive Dönüşümü – bir cümlenin öznesi ile nesnesi yer değiştirdiğinde eylemi kimin yaptığı bilgisi korunmalıdır; edilgen yapıya geçerken failin 'by' ile belirtilip belirtilmediğine dikkat edilmelidir.\nÖrnek: \"A local historian discovered the missing manuscript in an old library.\" → \"The missing manuscript was discovered by a local historian in an old library.\" (Kayıp el yazması yerel bir tarihçi tarafından eski bir kütüphanede bulundu.)",
    "Gerund Özne / That Cümleciği Dönüşümü – bir eylemi isimleştirerek özne yapan gerund kalıbı, aynı anlamı taşıyan bir 'that' cümleciğiyle ya da 'it' öznesiyle yeniden ifade edilebilir.\nÖrnek: \"Ignoring the safety warnings put the entire crew at risk.\" → \"The fact that the safety warnings were ignored put the entire crew at risk.\" (Güvenlik uyarılarının göz ardı edilmesi tüm mürettebatı riske attı.)",
    "Neden-Sonuç Yönünün Tersine Çevrilmesi (Result-Cause) – bir cümledeki 'X, Y'ye yol açar' ilişkisi, cümlenin odağını değiştirerek 'Y, X'in bir sonucudur' şeklinde de kurulabilir; ilişkinin yönü değişmemelidir.\nÖrnek: \"Prolonged drought led to a sharp decline in crop yields across the region.\" → \"The sharp decline in crop yields across the region resulted from prolonged drought.\" (Bölgedeki tarımsal verimdeki keskin düşüş, uzun süreli kuraklığın bir sonucuydu.)",
    "Karşılaştırma Dönüşümü (More...Than / Not As...As) – üstünlük bildiren 'more...than' yapısı, karşılaştırılan iki unsurun yerini değiştirip 'not as...as' kalıbıyla da aynı karşılaştırmayı verebilir.\nÖrnek: \"The new engine is far more fuel-efficient than the model it replaced.\" → \"The model that was replaced is not nearly as fuel-efficient as the new engine.\" (Değiştirilen model, yeni motor kadar yakıt tasarruflu değildi.)",
    "Must Have V3 (Geçmişe Yönelik Kesin Çıkarım) – gözlemlenen bir kanıta dayanarak yapılan güçlü bir geçmiş çıkarımı, 'it is almost certain that' gibi eşdeğer bir kesinlik ifadesiyle de yeniden yazılabilir.\nÖrnek: \"The lights were on and the door was unlocked; someone must have been in the office overnight.\" → \"It is almost certain that someone was in the office overnight, since the lights were on and the door was unlocked.\" (Işıklar yanıyor ve kapı açıktı; gece boyunca ofiste biri olmalıydı.)",
    "Should Have V3 (Geçmişe Yönelik Pişmanlık/Eleştiri) – yapılması gerekirken yapılmamış bir eylemi eleştiren 'should have V3' yapısı, 'it would have been better if' gibi bir kalıpla da aynı pişmanlık anlamını taşıyabilir.\nÖrnek: \"The board should have consulted the employees before announcing the layoffs.\" → \"It would have been better if the board had consulted the employees before announcing the layoffs.\" (Yönetim kurulu, işten çıkarmaları duyurmadan önce çalışanlara danışmalıydı.)",
    "Type 3 Conditional / Without Dönüşümü – geçmişte gerçekleşmemiş bir koşulu anlatan 'if + had V3, would have V3' yapısı, aynı anlamı 'without' ya da 'if it had not been for' ile de verebilir.\nÖrnek: \"If the crew had not acted quickly, the fire would have spread to the neighboring buildings.\" → \"Without the crew's quick action, the fire would have spread to the neighboring buildings.\" (Ekip hızlı hareket etmeseydi yangın komşu binalara sıçrardı.)",
    "The Only Way / Unless Dönüşümü – bir hedefe ulaşmanın tek yolunu belirten 'the only way to X is Y' yapısı, aynı zorunluluğu 'unless Y, X cannot happen' şeklinde olumsuz bir koşulla da ifade edebilir.\nÖrnek: \"The only way to reduce traffic congestion downtown is to expand public transportation.\" → \"Unless public transportation is expanded, traffic congestion downtown cannot be reduced.\" (Toplu taşıma genişletilmedikçe şehir merkezindeki trafik sıkışıklığı azaltılamaz.)",
    "Edilgen Aktarım (It Is Said/Believed That) Dönüşümü – bir iddianın sahibini belirtmeden aktarılmasını sağlayan 'it is said/believed that' yapısı, aynı bilgiyi 'according to' ile kaynak belirterek ya da belirtmeyerek de sunabilir.\nÖrnek: \"It is widely believed that the recipe originated in a small coastal village.\" → \"According to popular belief, the recipe originated in a small coastal village.\" (Tarifin küçük bir kıyı köyünde ortaya çıktığına yaygın olarak inanılır.)",
    "As Soon As / No Sooner...Than Devrik Yapı Dönüşümü – bir eylemin hemen ardından başka bir eylemin gerçekleştiğini anlatan 'as soon as' yapısı, devrik 'no sooner had...than' kalıbıyla da aynı ardışıklığı verebilir.\nÖrnek: \"As soon as the announcement was made, the stock price began to fall.\" → \"No sooner had the announcement been made than the stock price began to fall.\" (Duyuru yapılır yapılmaz hisse fiyatı düşmeye başladı.)",
    "It Takes / Require Dönüşümü – bir işlemin ne kadar zaman/çaba gerektirdiğini anlatan 'it takes + zaman + to V0' yapısı, aynı anlamı 'require' fiiliyle isim yapısına çevirerek de verebilir.\nÖrnek: \"It took the surgeons nearly six hours to complete the delicate operation.\" → \"The delicate operation required nearly six hours to complete.\" (Hassas ameliyatın tamamlanması cerrahların yaklaşık altı saatini aldı.)",
    "Must/Have To / Be Obliged To Dönüşümü – bir zorunluluğu bildiren 'must' ya da 'have to', aynı zorunluluk derecesini koruyan 'be obliged to' ya da 'be required to' ile de ifade edilebilir.\nÖrnek: \"All passengers must present a valid identification document before boarding.\" → \"All passengers are required to present a valid identification document before boarding.\" (Tüm yolcular biniş öncesinde geçerli bir kimlik belgesi göstermek zorundadır.)",
    "Clause Reordering (Ana-Yan Cümle Yer Değişimi) – bir cümlede ana ve yan cümlenin sırası değiştirildiğinde bağlaç ve noktalama uyarlanmalı, ancak hangi bilginin diğerine bağlı olduğu (zaman, neden, koşul) değişmemelidir.\nÖrnek: \"When the negotiations collapsed, both sides returned to their original demands.\" → \"Both sides returned to their original demands when the negotiations collapsed.\" (Müzakereler çöktüğünde her iki taraf da ilk taleplerine geri döndü.)",
  ];

  function yakinAnlamliLessonDefs(def) {
    return [
      {
        title: `${def.name} – Konuya Giriş`,
        durationMinutes: 12,
        contentBody: yakinAnlamliIntro,
      },
      {
        title: `${def.name} – Kurallar Referansı (1/2): Bağlaç, Zıtlık ve Neden-Sonuç Yapıları`,
        durationMinutes: 15,
        contentBody: yakinAnlamliKuralReferansi1.join("\n\n"),
      },
      {
        title: `${def.name} – Kurallar Referansı (2/2): Yapısal Dönüşümler, Karşılaştırma ve Modal Kalıplar`,
        durationMinutes: 15,
        contentBody: yakinAnlamliKuralReferansi2.join("\n\n"),
      },
      {
        title: `${def.name} – Örnek Sorular ve Çözümler`,
        durationMinutes: 15,
        contentBody: formatExamples(ydsExamples[def.slug]),
      },
    ];
  }
  // --- END: yakin-anlamli-cumle ---

  // --- BEGIN: paragraf-tamamlama custom lesson content (grounded in "YDS-YÖKDİL Çözüm Teknikleri
  // Rehberi" — "G) Paragraf Tamamlama" chapter, p.50-54, plus the "Paragraf Tamamlama" worked
  // examples in the "Örnek Soru ve Çözümleri" section, p.75-76. All prose, categorization and
  // example sentences below are original; only the underlying strategic facts are drawn from
  // the book.) ---
  const paragrafTamamlamaIntro =
    "YDS'nin \"Paragraf Tamamlama\" sorularında sizden istenen, verilen bir paragrafın içinde ya da sonunda bırakılan tek bir boşluğu, paragrafın konusuna, anlatım sırasına ve iç mantığına en uygun cümleyle doldurmanızdır. Bu soru tipi aslında bambaşka bir konu değildir; \"cümle tamamlama\" sorularındaki mantığın paragraf ölçeğine taşınmış halidir. Doğru seçenek yalnızca dilbilgisi açısından düzgün olmakla kalmamalı, aynı zamanda boşluğun hemen öncesindeki ve -boşluk paragrafın ortasındaysa- sonrasındaki cümlelerle kusursuz bir anlam ve akış bütünlüğü kurmalıdır. Sınavda karşınıza çıkan paragraflar genellikle bir bilimsel gelişmeyi, tarihi bir olayı, bir şirketin hikâyesini ya da toplumsal bir konuyu ele alan kısa ve yoğun bilgi içeren metinlerdir.\n\n" +
    "Paragrafın Tümünü mü, Boşluğun Çevresini mi Okumalı?\nBu soru tipinde sınırlı zamanınızı en verimli kullanmanın yolu, paragrafın her kelimesini eşit derecede önemseyerek satır satır çözümlemek değildir. Pratikte doğru cevaba ulaştıran bilginin büyük bölümü boşluktan hemen önceki cümlede, boşluk paragrafın ortasındaysa çoğu zaman hemen sonraki cümlede saklıdır. Bu nedenle önce paragrafın genel konusunu ve tonunu (nötr bir bilgi aktarımı mı, bir tartışma mı, iyimser mi kötümser mi) birkaç saniyede kavramak, ardından asıl dikkatinizi boşluğun bitişiğindeki cümlelere yoğunlaştırmak size hem zaman kazandırır hem de gereksiz ayrıntılarla dikkatinizin dağılmasını önler.\n\n" +
    "Mantıksal Geçiş Sinyallerini Yakalamak\nHer boşluk aslında paragrafa belirli bir görevi yerine getirecek bir cümle eklenmesini talep eder: kimi zaman önceki iddiaya somut bir örnek ya da kanıt eklenmesi beklenir, kimi zaman anlatılan olumlu bir tabloya bir zıtlık ya da sınırlılık getirilmesi gerekir, kimi zaman art arda sıralanan bilgiler bir sonuç ya da özet cümlesiyle toparlanmalıdır, kimi zaman da kronolojik bir anlatımın bir sonraki adımının yazılması istenir. Seçeneklere bakmadan önce kendinize \"bu boşlukta bir örnek mi, bir zıtlık mı, bir sonuç mu, yoksa sıradaki adım mı bekleniyor?\" sorusunu sormak, dört-beş seçenekten çoğu zaman ikisini üçünü anında elemenizi sağlar. Seçeneklerin kendi içindeki bağlaçlar (however, therefore, for instance, in addition gibi) da bu görevin ipucunu doğrudan verir; bir seçenek \"however\" ile başlıyorsa ama paragrafta hiçbir zıtlık aranmıyorsa o seçenek büyük olasılıkla yanlıştır.\n\n" +
    "Konu, Ton ve Gönderge Tutarlılığı\nDoğru seçenek yalnızca konuyla ilgili olmakla yetinmemeli; paragrafın duygusal tonuyla ve içindeki gönderge zincirleriyle de tam olarak örtüşmelidir. Paragraf iyimser bir dille ilerliyorsa aniden karamsar bir cümleyle bitmesi, ya da tam tersi, mantıksal bir tutarsızlık yaratır. Aynı şekilde, seçenek içinde geçen bir zamir (\"it\", \"this\", \"they\", \"such\") ya da işaret sıfatı, paragrafta daha önce adı geçen doğru varlığa göndermede bulunmalıdır; göndergesi belirsiz ya da yanlış bir isme işaret eden bir seçenek, konu olarak makul görünse bile doğru cevap olamaz.\n\n" +
    "Sık Görülen Çeldirici Tuzakları\nBu soru tipinde yanlış seçenekler genellikle dört kalıptan birine girer: paragrafın genel konusuyla hiç ilgisi olmayan ama tek başına doğru bir bilgi içeren cümleler; paragrafta zaten söylenmiş bir bilgiyi neredeyse aynen tekrar eden cümleler; konu olarak uygun görünen ama mantıksal ilişkiyi (örneğin bir sonuç yerine bir zıtlık) yanlış kuran cümleler; ve paragraftaki bir ayrıntıyla açıkça çelişen cümleler. Bu tuzaklardan korunmanın en etkili yolu, bir seçeneği kesin \"doğru\" ilan etmeden önce onu boşluğa yerleştirip paragrafı baştan sona sessizce yeniden okumaktır; kulağa uyumsuz gelen her seçenek büyük olasılıkla bu dört tuzaktan birine girer.\n\n" +
    "Sonuç olarak, paragraf tamamlama sorularında başarı, paragrafın tamamını ezbere çözümlemekten değil, boşluğun üstlendiği görevi doğru teşhis edip bu görevi eksiksiz yerine getiren tek seçeneği bulmaktan geçer. Önce konuyu ve tonu hızlıca kavrayın, ardından boşluğun bitişiğindeki cümlelere odaklanarak aranan mantıksal ilişkiyi (örnek mi, zıtlık mı, sonuç mu, sıradaki adım mı) belirleyin ve son olarak seçtiğiniz cümleyi boşluğa yerleştirip paragrafı bir bütün olarak yeniden okuyarak kararınızı doğrulayın. Bu üç adımı alışkanlık haline getirdiğinizde hem doğru cevaba çok daha hızlı ulaşır hem de konu olarak makul görünen ama mantıksal olarak yanlış kurulmuş çeldiricilere kapılma riskinizi büyük ölçüde azaltırsınız.";

  const paragrafTamamlamaKuralReferansi1 = [
    "Neden-Sonuç Geçişi – paragrafta anlatılan bir gelişmenin doğrudan sonucunu bildiren cümle boşluğu tamamlar; bu tür cümleler genellikle 'as a result, therefore, consequently' gibi ifadelerle başlar.\nÖrnek: \"The region experienced three consecutive years of severe drought, and reservoir levels fell to record lows. ----.\" Doğru tamamlayıcı cümle: \"As a result, local authorities introduced strict water-rationing measures for both households and farms.\" (Bölge üst üste üç yıl şiddetli kuraklık yaşadı ve baraj seviyeleri rekor düşük seviyelere geriledi. Bunun sonucunda, yerel yetkililer hem haneler hem de çiftlikler için sıkı su kısıtlaması önlemleri getirdi.)",
    "Zıtlık Geçişi – paragrafın önceki kısmında olumlu ya da beklenen bir durum anlatılmışsa, boşluk bu beklentiyi tersine çeviren bir cümleyle ('however, yet, nevertheless') tamamlanmalıdır.\nÖrnek: \"The new vaccine produced remarkably strong results during early laboratory trials, protecting nearly every test subject from infection. ----.\" Doğru tamamlayıcı cümle: \"However, once the trials expanded to a much larger and more diverse population, its effectiveness dropped considerably.\" (Yeni aşı, erken laboratuvar denemelerinde son derece güçlü sonuçlar verdi ve neredeyse tüm test deneklerini enfeksiyondan korudu. Ancak denemeler çok daha büyük ve çeşitli bir popülasyona genişletildiğinde, etkinliği önemli ölçüde düştü.)",
    "Örnekleme/Kanıt Sunma – paragrafın başında yapılan genel bir iddia, boşlukta somut bir örnek ya da kanıtla desteklenmelidir; bu tür cümleler genellikle 'for instance, for example' ile başlar.\nÖrnek: \"Many species have developed remarkable strategies to survive in extremely cold climates. ----.\" Doğru tamamlayıcı cümle: \"The Arctic fox, for instance, grows a thick winter coat that nearly doubles its insulation almost overnight.\" (Birçok tür, son derece soğuk iklimlerde hayatta kalabilmek için dikkat çekici stratejiler geliştirmiştir. Örneğin, kutup tilkisi, yalıtımını neredeyse bir gecede iki katına çıkaran kalın bir kış kürkü yetiştirir.)",
    "Genelleme/Özet Sonuç Cümlesi – paragraf boyunca art arda sunulan bulgular ya da örnekler, boşlukta bunların tümünü kapsayan genel bir yargıyla sonuçlandırılmalıdır.\nÖrnek: \"One study found that employees who took short breaks every hour reported less fatigue. Another found that those who worked in naturally lit offices made fewer errors. A third linked flexible schedules to higher job satisfaction. ----.\" Doğru tamamlayıcı cümle: \"Taken together, these findings suggest that small adjustments to the workplace environment can meaningfully improve both wellbeing and performance.\" (Bir çalışma, her saat kısa molalar veren çalışanların daha az yorgunluk bildirdiğini buldu. Bir başkası, doğal ışıklı ofislerde çalışanların daha az hata yaptığını ortaya koydu. Üçüncüsü ise esnek çalışma saatlerini daha yüksek iş memnuniyetiyle ilişkilendirdi. Bir arada değerlendirildiğinde, bu bulgular işyeri ortamındaki küçük düzenlemelerin hem refahı hem de performansı anlamlı ölçüde artırabileceğini göstermektedir.)",
    "Tanım/Açıklama Cümlesi – paragrafta ilk kez kullanılan teknik bir terimin hemen ardından bırakılan boşluk, bu terimi okuyucuya açıklayan bir cümleyle tamamlanmalıdır.\nÖrnek: \"Psychologists often point to the phenomenon of confirmation bias when explaining why people cling to false beliefs. ----. As a result, individuals rarely encounter information that might change their minds.\" Doğru tamamlayıcı cümle: \"This refers to the tendency to seek out and favor information that confirms what one already believes.\" (Psikologlar, insanların neden yanlış inançlara bağlı kaldığını açıklarken sıklıkla doğrulama yanlılığı olgusuna işaret eder. Bu, kişinin zaten inandığı şeyi doğrulayan bilgiyi arama ve ona öncelik verme eğilimini ifade eder. Sonuç olarak, bireyler fikirlerini değiştirebilecek bilgilerle nadiren karşılaşır.)",
    "Sıralı Anlatım/Sonraki Adım – bir sürecin ya da kronolojik anlatımın ortasında bırakılan boşluk, anlatılan sıranın mantıksal bir sonraki adımını içeren bir cümleyle doldurulmalıdır.\nÖrnek: \"A new scientific claim typically begins as a hypothesis based on preliminary observation. Researchers then design controlled experiments to test it under different conditions. ----. Only after this stage does the wider scientific community begin to accept the claim as reliable.\" Doğru tamamlayıcı cümle: \"Once the results are obtained, the study is submitted to other experts for peer review before publication.\" (Yeni bir bilimsel iddia genellikle ön gözleme dayanan bir hipotez olarak başlar. Araştırmacılar daha sonra bunu farklı koşullar altında test etmek için kontrollü deneyler tasarlar. Sonuçlar elde edildiğinde, çalışma yayımlanmadan önce incelenmek üzere diğer uzmanlara gönderilir. Ancak bu aşamadan sonra geniş bilim topluluğu iddiayı güvenilir olarak kabul etmeye başlar.)",
    "Beklenmedik Gelişme/Dönüm Noktası – paragrafta istikrarlı giden bir durumun aniden değiştiğini bildiren bir cümle, genellikle 'unexpectedly, suddenly, then' gibi ifadelerle boşluğu tamamlar.\nÖrnek: \"For nearly a decade, the small publishing house released only modest, steady sales figures with each new title. ----. Almost overnight, the company found itself struggling to keep up with international demand.\" Doğru tamamlayıcı cümle: \"Then, quite unexpectedly, one of its books was mentioned by a popular online reviewer and sales tripled within a week.\" (Küçük yayınevi neredeyse on yıl boyunca her yeni kitapla mütevazı ve istikrarlı satış rakamları elde etti. Sonra, hiç beklenmedik bir şekilde, kitaplarından biri popüler bir çevrimiçi eleştirmen tarafından anıldı ve satışlar bir hafta içinde üçe katlandı. Şirket neredeyse bir gecede uluslararası talebe yetişmekte zorlanır hale geldi.)",
    "Dengeli Değerlendirme/Sınırlılık Belirtme – bir konunun avantajları uzun uzun anlatıldıktan sonra bırakılan boşluk, genellikle konunun bir sınırlılığını ya da olumsuz yönünü tanıtan dengeleyici bir cümleyle tamamlanır.\nÖrnek: \"Solar panels allow households to generate their own electricity, reduce monthly bills, and lower their reliance on fossil fuels. ----.\" Doğru tamamlayıcı cümle: \"Nevertheless, the high upfront installation cost remains a significant obstacle for many low-income families.\" (Güneş panelleri, hanelerin kendi elektriklerini üretmelerine, aylık faturalarını azaltmalarına ve fosil yakıtlara olan bağımlılıklarını düşürmelerine olanak tanır. Yine de, yüksek başlangıç kurulum maliyeti birçok düşük gelirli aile için önemli bir engel olmaya devam etmektedir.)",
    "Giriş/Konu Tanıtma Cümlesi – paragrafın en başında bırakılan boşluk, geri kalan cümlelerin ayrıntılandıracağı genel konuyu tanıtan bir cümle olmalıdır.\nÖrnek: \"----. Its migratory route stretches over twelve thousand kilometers, taking it from the Arctic tundra to the southern tip of South America and back again each year.\" Doğru tamamlayıcı cümle: \"The Arctic tern is widely regarded as the animal kingdom's most impressive long-distance traveler.\" (Kutup sumrusu, hayvanlar aleminin en etkileyici uzun mesafe gezgini olarak kabul edilir. Göç rotası on iki bin kilometreyi aşarak onu her yıl Arktik tundradan Güney Amerika'nın güney ucuna ve geri götürür.)",
    "Karşılaştırma Cümlesi – paragrafta iki farklı unsur ele alınıyorsa, boşluk bu iki unsur arasındaki temel farkı ya da benzerliği vurgulayan bir cümleyle tamamlanmalıdır.\nÖrnek: \"Traditional classrooms rely on a fixed schedule, a single instructor, and a shared pace for all students. Online courses, by contrast, allow learners to study whenever and wherever they choose. ----.\" Doğru tamamlayıcı cümle: \"Unlike the rigid structure of traditional classrooms, this flexibility lets students spend more time on topics they find difficult.\" (Geleneksel sınıflar, sabit bir program, tek bir öğretmen ve tüm öğrenciler için ortak bir hıza dayanır. Çevrimiçi kurslar ise öğrencilerin istedikleri zaman ve yerde çalışmasına imkan tanır. Geleneksel sınıfların katı yapısının aksine, bu esneklik öğrencilerin zor buldukları konulara daha fazla zaman ayırmasına olanak tanır.)",
    "Tepki/Önlem Cümlesi – bir sorunun ya da olumsuz gelişmenin ayrıntılı biçimde anlatıldığı bir paragrafta boşluk, bu duruma karşı alınan bir önlemi ya da tepkiyi bildiren cümleyle tamamlanmalıdır.\nÖrnek: \"Customer complaints about the airline's baggage handling rose sharply over the past two years, with thousands of passengers reporting lost or damaged luggage. ----.\" Doğru tamamlayıcı cümle: \"Faced with mounting criticism, the airline announced a complete overhaul of its baggage-tracking system.\" (Havayolunun bagaj işlemleriyle ilgili müşteri şikayetleri son iki yılda keskin biçimde arttı; binlerce yolcu kayıp ya da hasarlı bagaj bildirdi. Artan eleştirilerle karşı karşıya kalan havayolu, bagaj takip sisteminde tam bir yenilenme yapacağını duyurdu.)",
    "Zamir/Referans Kontrolü – doğru seçenek, boşluktan önceki cümlede geçen isim veya kavrama gönderme yapan zamirleri (it, this, they, such) doğru göndergeyle kullanmalıdır; referansı belirsiz ya da yanlış bir seçenek elenmelidir.\nÖrnek: \"Researchers recently discovered a previously unknown species of deep-sea fish that can survive at crushing depths of over eight thousand meters. ----.\" Doğru tamamlayıcı cümle: \"This extraordinary ability is made possible by a unique protein that keeps its cell membranes flexible under extreme pressure.\" (Araştırmacılar kısa süre önce sekiz bin metrenin üzerindeki ezici derinliklerde hayatta kalabilen, daha önce bilinmeyen bir derin deniz balığı türü keşfetti. Bu olağanüstü yetenek, hücre zarlarını aşırı basınç altında esnek tutan benzersiz bir proteinle mümkün kılınmaktadır.)",
    "Sonuç Bağlacı İpucu (Therefore/Thus/Consequently) – boşluktan hemen önceki cümle bir nedeni anlatıyorsa ve boşluk bir sonuç bağlacıyla başlıyorsa, tamamlayıcı cümle mutlaka bu nedenin mantıksal sonucunu içermelidir.\nÖrnek: \"The bridge's support cables had corroded far more quickly than engineers had anticipated when it was built decades earlier. ----.\" Doğru tamamlayıcı cümle: \"Consequently, the city was forced to close the bridge to all traffic until extensive repairs could be completed.\" (Köprünün destek kabloları, on yıllar önce inşa edildiğinde mühendislerin öngördüğünden çok daha hızlı bir şekilde paslanmıştı. Sonuç olarak, şehir kapsamlı onarımlar tamamlanana kadar köprüyü tüm trafiğe kapatmak zorunda kaldı.)",
    "Zıtlık Bağlacı İpucu (Nevertheless/On the Other Hand) – boşluk bir zıtlık ifadesiyle başlıyorsa, tamamlayıcı cümle önceki cümledeki durumun tam tersi ya da onu sınırlayan bir bilgi içermelidir.\nÖrnek: \"Economists had widely predicted that the central bank's interest rate cut would immediately boost consumer spending. ----.\" Doğru tamamlayıcı cümle: \"On the other hand, most households used the extra savings to pay off existing debt rather than to make new purchases.\" (Ekonomistler, merkez bankasının faiz indiriminin tüketici harcamalarını hemen artıracağını yaygın biçimde öngörmüştü. Öte yandan, çoğu hane ekstra tasarruflarını yeni harcamalar yapmak yerine mevcut borçlarını kapatmak için kullandı.)",
    "Ekleme Bağlacı İpucu (In Addition/Furthermore) – boşluk bir ekleme ifadesiyle başlıyorsa, tamamlayıcı cümle önceki cümledeki fikirle AYNI yönde yeni bir bilgi eklemelidir; zıt ya da alakasız bir bilgi bu bağlaçla asla uyuşmaz.\nÖrnek: \"The renovated library now offers extended weekend hours and a dedicated quiet-study floor for students preparing for exams. ----.\" Doğru tamamlayıcı cümle: \"Furthermore, it has introduced a free tutoring service staffed by graduate volunteers every evening.\" (Yenilenen kütüphane artık uzatılmış hafta sonu saatleri ve sınavlara hazırlanan öğrenciler için ayrı bir sessiz çalışma katı sunuyor. Dahası, her akşam lisansüstü gönüllülerin görev yaptığı ücretsiz bir özel ders hizmeti başlattı.)",
    "Kapanış/Özet İfadesi İpucu (In Short/Overall) – paragrafın son cümlesindeki boşluk bir kapanış ifadesiyle başlıyorsa, tamamlayıcı cümle paragrafın tamamını özetleyen genel bir yargı sunmalıdır.\nÖrnek: \"The festival attracted record numbers of visitors, generated substantial revenue for local businesses, and received almost entirely positive feedback from attendees. ----.\" Doğru tamamlayıcı cümle: \"Overall, this year's event can be considered the most successful in the festival's twenty-year history.\" (Festival, rekor sayıda ziyaretçi çekti, yerel işletmeler için önemli bir gelir yarattı ve katılımcılardan neredeyse tamamen olumlu geri bildirim aldı. Genel olarak, bu yılki etkinlik festivalin yirmi yıllık tarihindeki en başarılı etkinlik olarak kabul edilebilir.)",
    "Karşıt Görüş Sunma – bir görüşün savunucularının argümanları sunulduktan sonra bırakılan boşluk, genellikle 'critics/opponents, however' ile başlayan karşıt bir görüşü tanıtan cümleyle tamamlanır.\nÖrnek: \"Supporters of the four-day work week argue that it boosts productivity, reduces employee burnout, and improves overall job satisfaction. ----.\" Doğru tamamlayıcı cümle: \"Critics, however, warn that compressing the same workload into fewer days can create unsustainable pressure in certain industries.\" (Dört günlük çalışma haftasının savunucuları, bunun verimliliği artırdığını, çalışan tükenmişliğini azalttığını ve genel iş memnuniyetini iyileştirdiğini savunuyor. Eleştirmenler ise aynı iş yükünü daha az güne sıkıştırmanın belirli sektörlerde sürdürülemez bir baskı yaratabileceği konusunda uyarıyor.)",
    "Sıralı Örnekleme/Liste Devamı – bir paragrafta birden fazla örnek ya da neden art arda sıralanıyorsa, boşluk bu sıralamanın bir sonraki, aynı türden unsurunu içeren bir cümleyle tamamlanmalıdır.\nÖrnek: \"Several factors have contributed to the decline of the region's coral reefs. Rising sea temperatures have caused widespread bleaching, and agricultural runoff has introduced harmful chemicals into coastal waters. ----.\" Doğru tamamlayıcı cümle: \"In addition, unregulated tourism has led to physical damage from anchors and careless divers.\" (Bölgedeki mercan resiflerinin gerilemesine çeşitli faktörler katkıda bulunmuştur. Yükselen deniz sıcaklıkları yaygın ağarmaya neden olmuş, tarımsal akıntılar ise kıyı sularına zararlı kimyasallar taşımıştır. Ayrıca, denetimsiz turizm, çapalar ve dikkatsiz dalgıçlar yüzünden fiziksel hasara yol açmıştır.)",
    "Sayısal Destek Cümlesi – bir iddianın hemen ardından bırakılan boşluk, bu iddiayı somut bir rakam ya da istatistikle destekleyen bir cümle olabilir.\nÖrnek: \"The company's new recycling initiative has dramatically reduced the amount of plastic waste sent to landfills each year. ----.\" Doğru tamamlayıcı cümle: \"In fact, the volume of landfill waste dropped by nearly sixty percent within just eighteen months of the program's launch.\" (Şirketin yeni geri dönüşüm girişimi, her yıl çöp sahalarına gönderilen plastik atık miktarını büyük ölçüde azalttı. Nitekim, çöp sahası atıklarının hacmi programın başlamasından yalnızca on sekiz ay sonra neredeyse yüzde altmış azaldı.)",
    "Ton ve Kayıt Tutarlılığı – doğru tamamlayıcı cümle, paragrafın genel duygusal tonuyla (iyimser/kötümser, resmi/gündelik) çelişmemelidir; konu olarak uygun görünse bile ton olarak paragraftan kopan bir seçenek yanlıştır.\nÖrnek: \"The hospital's new emergency wing has cut average patient waiting times in half, and staff report far less overcrowding during peak hours. ----.\" Doğru tamamlayıcı cümle: \"Patients and medical staff alike have described the change as one of the most welcome improvements the hospital has made in years.\" (Hastanenin yeni acil servis kanadı, ortalama hasta bekleme sürelerini yarıya indirdi ve personel, yoğun saatlerde çok daha az kalabalık olduğunu bildiriyor. Hem hastalar hem de tıbbi personel bu değişikliği hastanenin yıllardır yaptığı en memnuniyet verici iyileştirmelerden biri olarak tanımladı.)",
  ];

  function paragrafTamamlamaLessonDefs(def) {
    return [
      {
        title: `${def.name} – Konuya Giriş`,
        durationMinutes: 10,
        contentBody: paragrafTamamlamaIntro,
      },
      {
        title: `${def.name} – Kurallar Referansı`,
        durationMinutes: 15,
        contentBody: paragrafTamamlamaKuralReferansi1.join("\n\n"),
      },
      {
        title: `${def.name} – Örnek Sorular ve Çözümler`,
        durationMinutes: 15,
        contentBody: formatExamples(ydsExamples[def.slug]),
      },
    ];
  }
  // --- END: paragraf-tamamlama ---

  // --- BEGIN: anlatim-butunlugunu-bozan-cumle custom lesson content (grounded in "YDS-YÖKDİL Çözüm
  // Teknikleri Rehberi" — "H) Anlamı Bozan Cümle" chapter) ---
  const anlatimButunluguIntro =
    "YDS'nin \"Anlatım Bütünlüğünü Bozan Cümle\" sorularında karşınıza (1), (2), (3), (4) (bazen (5)'e kadar) numaralandırılmış cümlelerden oluşan tek bir paragraf çıkar ve sizden bu cümlelerden hangisinin paragrafın genel akışına ve tek bir ana fikre aykırı düştüğünü bulmanız istenir. Standart bir boşluk doldurma sorusunun aksine burada eksik bir bilgi tamamlanmaz; tam tersine, paragrafa sonradan eklenmiş gibi duran fazladan bir cümle ayıklanır. Bu soru tipi aslında bir okuduğunu anlama ve mantıksal tutarlılık testidir: paragrafın tamamı belirli bir konuyu, olayı ya da görüşü aynı bakış açısından geliştirirken, sınav sizin bu tek çizgiden sapan cümleyi fark edip edemediğinizi ölçer. Doğru cevaba ulaşmak çoğunlukla kelime bilgisinden çok paragrafın mantıksal yapısını çözümlemekle mümkün olur.\n\n" +
    "Paragrafın Tek Bir Kontrol Fikrini Belirleyin\nBu soru tipini çözmenin ilk ve en önemli adımı, paragrafın sadece tek bir ana fikir (controlling idea) etrafında kurulduğunu kabul etmektir. Genellikle paragrafın ilk cümlesi bu ana fikri ya da konunun sınırlarını çizer; sonraki cümleler bu sınırın içinde kalarak konuyu açıklamalı, örneklendirmeli, nedenini/sonucunu vermeli ya da bir karşıtlık sunmalıdır. Paragrafı okurken kendinize 'bu paragraf tam olarak neyi anlatıyor?' sorusunu tek bir kısa cümleyle özetleyip özetleyemediğinizi sorun; özetleyebiliyorsanız, ardından her bir numaralı cümleyi bu özetle karşılaştırarak ilerleyin. Bir cümle bu özete yeni bir açı, örnek ya da sonuç katmıyorsa, o cümle şüpheli hale gelir. Bu adımı atlayıp doğrudan seçenekleri okumaya başlamak, adayı çoğu zaman konuyla biraz ilgili görünen ama aslında ana fikri desteklemeyen bir cümleye kolayca inandırabilir.\n\n" +
    "Cümleler Arası Bağlantı İpuçlarını Takip Edin\nAna fikri belirledikten sonra, cümleleri birbirine bağlayan bağlaçlara (however, therefore, in addition, for example gibi), zamirlere (it, this, these, such) ve tekrarlanan anahtar kelimelere dikkat etmek işinizi büyük ölçüde kolaylaştırır. Bütünlüğü bozulmamış bir paragrafta her cümle, kendinden önceki cümleyle ya bir zamir ya bir bağlaç ya da ortak bir kelimeyle görünür şekilde bağlanır. Bütünlüğü bozan cümle ise çoğu zaman bu bağlardan yoksundur: bir öncekiyle aynı özneden, aynı zaman diliminden ya da aynı olaylar zincirinden bahsetmiyor gibi görünür. Ancak dikkat edilmesi gereken bir tuzak da şudur: bir cümlenin başında however ya da therefore gibi bir bağlaç bulunması, o cümlenin otomatik olarak paragrafla uyumlu olduğu anlamına gelmez; asıl önemli olan bağlacın işaret ettiği mantıksal ilişkinin (zıtlık, sonuç, ekleme) cümlenin içeriğiyle gerçekten örtüşüp örtüşmediğidir.\n\n" +
    "Sık Görülen Bozucu Cümle Tipleri\nYıllar içinde tekrar eden sorulara bakıldığında, anlatım bütünlüğünü bozan cümlelerin genellikle birkaç kalıba oturduğu görülür:\n" +
    "• Konu dışı alt konuya kayma: paragraf tek bir konuyu işlerken, araya o konuyla uzaktan ilişkili ama aslında farklı bir alt başlığa (örneğin bir ülkenin ekonomisinden bahsedilirken o ülkenin coğrafi büyüklüğüne) değinen bir cümle sıkıştırılır.\n" +
    "• Zaman çerçevesi uyumsuzluğu: paragraf günümüzdeki bir durumu anlatırken araya konunun tarihsel kökenine dair bir bilgi (ya da tam tersi) yerleştirilir.\n" +
    "• Gereksiz tekrar: bir cümle, paragrafa yeni bir bilgi katmadan önceki cümlede zaten söylenmiş bir düşünceyi başka kelimelerle yineler.\n" +
    "• Duruşla çelişen cümle: paragraf belirli bir görüşü (örneğin bir uygulamanın olumsuz yönlerini) desteklerken, araya bu görüşle çelişen olumlu ya da tam tersi olumsuz bir bilgi eklenir.\n" +
    "Bu dört kalıbı akılda tutmak, seçenekleri elerken size hızlı bir kontrol listesi sağlar.\n\n" +
    "Zorluk Tuzağı: Kelime Bilgisi Yanılgısı\nBu soru tipinde sıkça düşülen bir hata, paragraftaki en yabancı ya da en zor kelimeleri içeren cümleyi otomatik olarak bozucu cümle sanmaktır. Oysa bir cümlenin zor kelimeler içermesi, onun konuyla ilgisiz olduğu anlamına gelmez; tam tersine, birçok soruda doğru cevap gramer ve kelime açısından oldukça sade, hatta paragrafın geri kalanından daha kolay bir cümledir. Belirleyici olan kelimelerin zorluk derecesi değil, cümlenin taşıdığı fikrin paragrafın ana konusuyla örtüşüp örtüşmediğidir. Bu yüzden çözüm sürecinde önce anlamsal uyuma odaklanmalı, kelime zorluğunu bir ipucu olarak değil, en fazla ikincil bir gözlem olarak değerlendirmelisiniz.\n\n" +
    "Sonuç olarak, anlatım bütünlüğünü bozan cümle sorularında izlenecek en güvenilir yol şudur: önce paragrafın tek bir ana fikrini kısaca özetleyin, ardından her numaralı cümleyi bu özetle tek tek karşılaştırın ve cümleler arasındaki bağlaç/zamir/anahtar kelime bağlarını kontrol edin. Konu dışı alt konuya kayan, zaman çerçevesini karıştıran, gereksiz yere tekrar eden ya da paragrafın duruşuyla çelişen cümleler en sık karşılaşacağınız çeldiricilerdir; bir cümlenin sadece zor görünmesi onu şüpheli kılmaz. Bu sistematik karşılaştırmayı alışkanlık haline getirdiğinizde, doğru cevaba çoğu zaman paragrafın tamamını defalarca okumaya gerek kalmadan, sadece şüpheli cümleyi ana fikirle hızlıca sınayarak ulaşabilirsiniz.";

  const anlatimButunluguKuralReferansi1 = [
    "Konu Dışı Alt Konu Tuzağı – paragrafın ana konusuyla yüzeysel bir bağı olan ama aslında farklı bir alt başlığa kayan cümledir; sınav bu cümleyi çoğu zaman ilk cümlelerin hemen ardına ya da paragrafın ortasına yerleştirir.\nÖrnek: \"(1) Every autumn, millions of birds migrate thousands of kilometers to reach warmer wintering grounds. (2) Scientists track their routes using lightweight satellite tags attached to their legs. (3) Bird watching has become an increasingly popular weekend hobby in many countries. (4) These tracking studies have revealed previously unknown stopover sites critical for the birds' survival.\" (Cümle (3), kuş göçünün izlenmesine odaklanan bilimsel akıştan sapıp, kuş gözlemciliğinin popüler bir hobi olduğuna dair ilgisiz bir bilgi sunduğu için anlatım bütünlüğünü bozar.)",
    "Zaman Çerçevesi Uyumsuzluğu – paragraf belirli bir zaman diliminde (şimdi, geçmiş ya da gelecek) ilerlerken, araya farklı bir zaman düzlemine ait bir bilgi sıkıştırılır.\nÖrnek: \"(1) Electric buses are replacing diesel fleets in many major cities. (2) They produce no tailpipe emissions and run far more quietly. (3) Diesel engines were first adapted for public buses in the early twentieth century. (4) Despite higher purchase costs, electric buses are often cheaper to operate over time.\" (Cümle (3), paragrafın günümüzdeki elektrikli otobüs geçişini anlatan zaman çerçevesiyle uyuşmayan, dizel motorların tarihsel kökenine değindiği için anlatım bütünlüğünü bozar.)",
    "Gereksiz Tekrar (Redundancy) Tuzağı – paragrafın ana fikrine yeni bir bilgi katmayan, önceki cümlede zaten verilmiş olan bir düşünceyi farklı sözcüklerle tekrar eden cümledir; akışı ilerletmediği için bütünlüğü zayıflatır.\nÖrnek: \"(1) Vaccines train the immune system to recognize a pathogen without causing illness. (2) This is done by introducing a weakened or inactivated version of the pathogen. (3) In other words, vaccines expose the body to a harmless form of the same threat it protects against. (4) When the real pathogen appears later, the immune system can respond quickly.\" (Cümle (3), cümle (2)'de zaten verilen bilgiyi yeni bir katkı sağlamadan başka sözcüklerle tekrarladığı için akışı ilerletmez ve anlatım bütünlüğünü bozar.)",
    "Duruşla Çelişen Cümle Tuzağı – paragraf boyunca savunulan görüşün ya da eleştirinin tam tersini ima eden bir cümledir; içerik olarak konuyla ilgili görünse de paragrafın tutumuyla çelişir.\nÖrnek: \"(1) Open-plan offices were designed to boost collaboration, but research shows they often backfire. (2) Constant noise makes it difficult for employees to concentrate on demanding tasks. (3) Employees in open layouts report far more face-to-face interaction, which many say improves teamwork. (4) As a result, some companies are returning to quieter, more private layouts.\" (Cümle (3), paragrafın açık ofislere yönelik eleştirel duruşuyla çelişecek şekilde olumlu bir yönden bahsettiği için anlatım bütünlüğünü bozar.)",
    "Biyografik/Kişisel Ayrıntı Tuzağı – bir eser, buluş ya da olaydan bahsedilirken, ilgili kişinin konuyla doğrudan ilgisi olmayan özel hayatına ya da geçmişine dair bir bilgi eklenir.\nÖrnek: \"(1) The novel is celebrated for shifting between three narrators who each see the same events differently. (2) This structure forces readers to question whose version of the story to trust. (3) The author spent several years working as a journalist before writing fiction. (4) By the end, the overlapping perspectives reveal a single, more complete picture.\" (Cümle (3), romanın anlatım tekniğiyle ilgili ana konuyla ilgisiz, yazarın kişisel/mesleki geçmişine dair bir ayrıntı sunduğu için anlatım bütünlüğünü bozar.)",
    "Farklı Boyuta Kayma Tuzağı – paragraf bir konuyu tek bir açıdan (örneğin işlevsel ya da bilimsel) ele alırken, araya o konunun tamamen farklı bir boyutuna (örneğin finansal ya da ticari) ait bir cümle girer.\nÖrnek: \"(1) The city renovated its central public library to add more natural light and open study areas. (2) The redesign also included soundproof rooms for group work and quiet reading zones. (3) Local property values near the library have risen noticeably since the renovation began. (4) Visitor numbers have nearly doubled since the new building reopened last spring.\" (Cümle (3), kütüphanenin fiziksel yenilenmesine ve kullanım deneyimine odaklanan akıştan sapıp, finansal bir boyuta (çevredeki emlak değerleri) kaydığı için anlatım bütünlüğünü bozar.)",
    "Zayıf Bağlaç Uyumu Tuzağı – bir cümle however, but, therefore gibi bir bağlaçla başlasa bile, bağladığı fikirle mantıksal bir zıtlık ya da sonuç ilişkisi kurmuyorsa akışı bozar; bağlacın varlığı tek başına cümlenin uyumlu olduğu anlamına gelmez.\nÖrnek: \"(1) The committee spent months reviewing the new safety regulations. (2) Several members raised concerns about the cost of full compliance. (3) However, the factory has operated in the same location for over thirty years. (4) In the end, the committee approved a revised, less costly version of the regulations.\" (Cümle (3), however bağlacıyla başlamasına rağmen önceki cümledeki maliyet endişesiyle mantıklı bir zıtlık kurmadığı ve konu dışı bir bilgi (fabrikanın yaşı) sunduğu için anlatım bütünlüğünü bozar.)",
    "Kopuk Zamir Referansı Tuzağı – cümledeki bir zamir (it, this, they) gramer olarak önceki cümledeki bir unsura bağlanıyor gibi görünse de, cümlenin taşıdığı fikir paragrafın ana konusuyla örtüşmez; zamirin gramatik bağlantısı anlamsal uyumun garantisi değildir.\nÖrnek: \"(1) The research team published its findings on glacier retreat last month. (2) The report shows that many alpine glaciers have lost over thirty percent of their volume since 1980. (3) They have also become popular destinations for adventure tourism in recent years. (4) The team warns that continued melting could disrupt water supplies for millions of people downstream.\" (Cümle (3), 'they' zamiriyle önceki cümledeki buzullara gönderme yapıyormuş gibi görünse de, içerik olarak paragrafın bilimsel uyarı akışıyla ilgisiz bir turizm bilgisine kaydığı için anlatım bütünlüğünü bozar.)",
    "Alakasız İstatistik Tuzağı – paragrafın ana fikrini desteklemeyen, tamamen farklı bir alanı ölçen sayısal bir veri araya sıkıştırılır; sayı içermesi cümleyi güvenilir gösterse de konuyla doğrudan ilgili olmayabilir.\nÖrnek: \"(1) Global investment in renewable energy has grown steadily over the past ten years. (2) Falling costs for solar panels and wind turbines have made these technologies more competitive with fossil fuels. (3) The global smartphone market is expected to keep growing at a similar pace. (4) Many governments now offer tax incentives to accelerate the shift toward clean energy.\" (Cümle (3), yenilenebilir enerjiye yapılan yatırımı anlatan konuyla hiçbir ilgisi olmayan, akıllı telefon pazarına dair alakasız bir istatistik sunduğu için anlatım bütünlüğünü bozar.)",
    "Genelden Özele Sapma Tuzağı – paragraf somut bir süreci adım adım anlatırken araya, yeni bir ayrıntı katmayan, sadece konunun önemini tekrar eden aşırı genel bir cümle girer.\nÖrnek: \"(1) New employees typically complete an onboarding program during their first month. (2) This program introduces them to company policies, tools, and team structures. (3) Onboarding is important for every new hire's long-term success. (4) Mentors are usually assigned to answer questions and ease the transition into daily tasks.\" (Cümle (3), cümle (2) ile (4) arasında yer alıp sürecin işleyişine yeni bir ayrıntı katmadan sadece genel bir önem vurgusu tekrarladığı için akışı ilerletmez ve anlatım bütünlüğünü bozar.)",
    "Örnek/Analoji Karışıklığı Tuzağı – paragraf belirli bir örnek üzerinden ilerlerken, araya konuyla ilgisiz farklı bir örnek ya da benzetme cümlesi eklenir.\nÖrnek: \"(1) Learning a musical instrument strengthens memory and coordination in children. (2) Piano lessons, in particular, have been linked to improved mathematical reasoning. (3) Team sports also teach children valuable lessons about cooperation and discipline. (4) Researchers believe these cognitive benefits persist well into adulthood.\" (Cümle (3), müzik eğitimiyle ilgili örneklerle ilerleyen akışa, konuyla ilgisiz farklı bir örnek (takım sporları) ekleyerek anlatım bütünlüğünü bozar.)",
    "Kronolojik Sıra Bozukluğu Tuzağı – paragraf bir gelişmeyi belirli bir zaman sırasıyla anlatırken, araya bu sırayı bozan, farklı bir döneme ait bir cümle girer.\nÖrnek: \"(1) Johannes Gutenberg's printing press made it possible to reproduce texts far faster than by hand copying. (2) This allowed books to be produced in much larger quantities at a lower cost. (3) Digital publishing today lets authors distribute e-books instantly worldwide. (4) Wider access to printed material contributed to rising literacy rates across Europe.\" (Cümle (3), matbaanın icadı ve ardından gelen tarihsel etkilerini anlatan kronolojik akışa, günümüze ait dijital yayıncılığı sokarak zaman sırasını bozduğu için anlatım bütünlüğünü bozar.)",
    "Zor Kelime = Bozucu Cümle Yanılgısı – bir cümlenin sadece daha zor ya da daha az bilinen kelimeler içermesi, onun anlatım bütünlüğünü bozan cümle olduğu anlamına gelmez; adaylar genellikle en yabancı görünen cümleyi otomatik olarak işaretleme hatasına düşer.\nÖrnek: \"(1) Earth's outer shell is divided into several large tectonic plates that shift slowly over time. (2) Where two plates collide, one may be forced beneath the other in a process called subduction. (3) This gradual movement can trigger earthquakes and volcanic activity along plate boundaries. (4) Many tourists visit volcanic islands for their black sand beaches and hot springs.\" (Subduction gibi teknik bir terim içeren cümle (2) konuyla tamamen ilgiliyken, sade bir dille yazılmış cümle (4) levha tektoniği konusundan tamamen koptuğu için anlatım bütünlüğünü bozar; bu da cümlenin zorluğunun değil, konuyla ilişkisinin belirleyici olduğunu gösterir.)",
    "Amaç-Sonuç Zincirinin Kopması Tuzağı – paragraf bir nedenin sonucunu adım adım anlatırken, araya bu zinciri kesen, farklı bir nedene ya da sonuca ait bir cümle eklenir.\nÖrnek: \"(1) Rising fuel costs have driven up prices across nearly every industry. (2) Manufacturers must pay more to transport raw materials to their factories. (3) As a result, they raise the prices of finished products to protect their profit margins. (4) Some factories have modernized their equipment in recent years.\" (Cümle (4), yakıt maliyeti artışından fiyat artışına uzanan neden-sonuç zincirine yeni bir halka eklemeyen, ilgisiz bir bilgi sunduğu için anlatım bütünlüğünü bozar.)",
    "Karşıt Taraftan Bahsetme Tuzağı – paragraf tek bir tarafın (bir ülkenin, kurumun ya da görüşün) durumunu anlatırken, araya karşıt ya da farklı bir tarafa dair bir bilgi eklenir.\nÖrnek: \"(1) Sweden has invested heavily in offshore wind capacity over the past decade. (2) The government offers subsidies to utilities that expand renewable generation. (3) Neighboring Norway relies primarily on hydroelectric power for its domestic electricity supply. (4) Officials expect wind to account for a third of the country's electricity by 2030.\" (Cümle (3), paragrafın İsveç'in rüzgar enerjisi yatırımlarını anlatan odağından sapıp, farklı bir ülkenin (Norveç) enerji politikasına dair bilgi sunduğu için anlatım bütünlüğünü bozar.)",
  ];

  function anlatimButunluguLessonDefs(def) {
    return [
      {
        title: `${def.name} – Konuya Giriş`,
        durationMinutes: 10,
        contentBody: anlatimButunluguIntro,
      },
      {
        title: `${def.name} – Kurallar Referansı`,
        durationMinutes: 12,
        contentBody: anlatimButunluguKuralReferansi1.join("\n\n"),
      },
      {
        title: `${def.name} – Örnek Sorular ve Çözümler`,
        durationMinutes: 15,
        contentBody: formatExamples(ydsExamples[def.slug]),
      },
    ];
  }
  // --- END: anlatim-butunlugunu-bozan-cumle ---

  // --- BEGIN: diyalog-tamamlama custom lesson content (grounded in "YDS-YÖKDİL Çözüm Teknikleri
  // Rehberi" — "I) Diyalog" chapter, p.58-61: strategy for two-person dialogue-completion questions,
  // plus the "Dialog Soruları" worked examples in "Örnek Soru ve Çözümleri", p.79-80. All prose,
  // categorization and example dialogues below are original; only the underlying strategic facts
  // (reading the line immediately before/after the blank, using pronoun/tense clues in the following
  // line, matching conversational function and tone) are drawn from the book.) ---
  const diyalogTamamlamaIntro =
    "Diyalog Tamamlama sorularında karşınıza iki kişi arasında geçen kısa bir konuşma çıkar; konuşmanın bir yerinde bir replik boş bırakılır (----) ve bu boşluğa anlam, mantık ve ton açısından en uygun düşen seçeneğin bulunması istenir. Bu soru tipinin temel özelliği, boşluğu doldurmanın çoğu zaman ileri düzey bir gramer bilgisi değil, günlük konuşma mantığını takip edebilme becerisi gerektirmesidir: iki konuşmacı arasındaki soru-cevap, teklif-kabul, şikayet-özür gibi karşılıklı ilişkiyi doğru kurabilmeniz beklenir. YDS'de bu konudan ortalama 5 soru gelir ve sorular genellikle üç repliklik kısa bir alışverişten oluşur; boşluk çoğunlukla ortadaki repliktir, ancak bazen konuşmanın başında ya da sonunda da yer alabilir.\n\n" +
    "Konuşma İşlevlerini Tanımak\nBir diyalogdaki her replik aslında belirli bir işlevi (function) yerine getirir: bir görüşe katılmak ya da karşı çıkmak, tavsiye vermek ya da tavsiye istemek, bir habere şaşkınlık ya da endişe göstermek, bir ricada bulunmak, bir gecikme ya da hata için mazeret sunmak, söylenen bir şeyi açıklığa kavuşturmak gibi. Boşluktan önceki ve sonraki repliklerin hangi işlevi beklediğini fark etmek, doğru seçeneğe ulaşmanın en hızlı yoludur. Örneğin bir konuşmacı \"Why didn't you call me back?\" diye soruyorsa, karşı taraftan beklenen işlev bir MAZERET sunmaktır; bu durumda seçenekler arasında konuyla hiç ilgisi olmayan ya da farklı bir işlevi (örneğin bir tavsiye) yerine getiren cümleler kolayca elenebilir.\n\n" +
    "Boşluğun Hemen Öncesi ve Sonrasını Okumak\nDoğru cevaba giden en güvenilir yol, boşluktan hemen önceki ve hemen sonraki repliği dikkatle incelemektir; konuşmanın tamamını kelimesi kelimesine anlamak çoğu zaman gerekmez. Özellikle boşluktan sonra gelen replik, çoğu zaman boşluktaki cümlenin öznesine, zamirine ya da zamanına (tense) dair doğrudan bir ipucu taşır: karşı taraf \"Yes, it was\" diye cevap veriyorsa, boşluktaki cümlede geçmiş zamanda, cansız bir özneden bahsedilen bir soru ya da ifade aranmalıdır. Benzer şekilde bir onay ya da red belirten kısa bir tepki (\"I know\", \"That's true\", \"I doubt it\" gibi) de boşluktaki cümlenin genel tonunu, olumlu mu olumsuz mu olduğunu, belirlemenize yardımcı olur.\n\n" +
    "Ton ve Kayıt (Register) Tutarlılığı\nDoğru seçenek, sadece anlamca değil ton ve kayıt (register) açısından da konuşmanın geri kalanıyla tutarlı olmalıdır. İki iş arkadaşının resmi bir toplantı ortamında geçen konuşmasında birden argo ya da aşırı samimi bir ifade beklenmez; benzer şekilde, konuşmanın genel duygusal tonu üzgün ya da endişeliyse, boşluğa neşeli ya da kayıtsız bir cümle yerleştirmek anlam bütünlüğünü bozar. Bir konuşmacının nazik ve resmi bir dil kullandığı bir diyalogda karşı tarafın aniden çok gündelik bir ifadeyle cevap vermesi de bu tutarsızlığın bir başka biçimidir; bu yüzden seçenekleri elerken sadece \"doğru bilgiyi mi veriyor\" değil, \"bu ton bu konuşmaya uyuyor mu\" sorusunu da sormak gerekir.\n\n" +
    "Sık Görülen Çeldirici Tuzakları\nBu soru tipinde en sık kullanılan çeldiriciler şunlardır: konuşmada geçen bir kelimeyi ya da konuyu tekrar eden ama tamamen farklı bir anlam taşıyan seçenekler; gramer açısından kusursuz olan ama konuşmanın akışına uymayan seçenekler; doğru işlevi taşıyan ama yanlış kutupta (polarite) olan seçenekler, örneğin bir davetin kabul edilmesi beklenirken sunulan bir reddetme cümlesi; konuşmanın daha sonraki bir repliğiyle çelişen seçenekler; ve çok fazla ayrıntı içerdiği için gerçekçi görünen ama aslında sorulmayan bir soruya cevap veren seçenekler. Bu tuzaklardan korunmanın en etkili yolu, seçtiğiniz cevabı boşluğa yerleştirip konuşmanın tamamını yeniden, baştan sona okumaktır; doğru cevap konuşmanın her repliğiyle uyum içinde olmalıdır.\n\n" +
    "Sonuç olarak, Diyalog Tamamlama sorularında başarı, konuşmanın duygusal ve mantıksal akışını takip edebilme becerisine dayanır. Boşluktan hemen önceki ve sonraki repliklere odaklanmak, karşı tarafın beklediği konuşma işlevini (tavsiye, özür, tebrik, şikayet, açıklama vb.) doğru tanımak ve seçtiğiniz cevabı konuşmanın tamamıyla birlikte kontrol etmek, sizi doğru seçeneğe götürecek en güvenilir yöntemlerdir. Zamanla farklı işlev kalıplarına (\"I'm afraid...\", \"Why don't we...\", \"I couldn't agree more\" gibi) aşina oldukça, bu soruları çok daha hızlı ve güvenle çözebileceksiniz.";

  const diyalogTamamlamaKuralReferansi1 = [
    "Katılma (Agreement) – karşı tarafın söylediğine tamamen hemfikir olunduğunu belirtmek için kullanılır.\nÖrnek: \"A: I think we should postpone the launch. B: I couldn't agree more, we're simply not ready yet.\" (Kesinlikle katılıyorum, henüz hiç hazır değiliz.)",
    "Nazik Karşı Çıkma (Polite Disagreement) – karşı tarafın görüşüne kibarca itiraz edildiğini belirtmek için kullanılır.\nÖrnek: \"A: I think the meeting went really well. B: I'm afraid I have to disagree; nobody seemed convinced by the proposal.\" (Ne yazık ki katılmıyorum; kimse teklife ikna olmuş görünmüyordu.)",
    "Tavsiye Verme (Giving Advice) – karşı tarafa bir konuda ne yapması gerektiğini önermek için kullanılır.\nÖrnek: \"A: I can't decide which job offer to accept. B: If I were you, I would go with the one that offers more room to grow.\" (Senin yerinde olsam, gelişme imkânı daha fazla olanı seçerdim.)",
    "Tavsiye İsteme (Asking for Advice) – bir karar öncesinde karşı taraftan görüş istemek için kullanılır.\nÖrnek: \"A: I'm torn between studying abroad and staying here. B: What would you do if you were in my position?\" (Sen benim yerimde olsaydın ne yapardın?)",
    "Şaşkınlık Bildirme (Expressing Surprise) – beklenmedik bir habere verilen tepkiyi anlatmak için kullanılır.\nÖrnek: \"A: They're closing the factory next month. B: I can't believe it! It's been open for over fifty years.\" (İnanamıyorum! Elli yıldan fazladır açıktı.)",
    "Endişe ya da Üzüntü Bildirme (Expressing Concern or Sympathy) – karşı tarafın olumsuz bir durumuna üzüldüğünü ya da endişelendiğini belirtmek için kullanılır.\nÖrnek: \"A: I failed my driving test again. B: Oh no, I'm really sorry to hear that. Don't give up.\" (Ay olamaz, gerçekten üzüldüm. Pes etme.)",
    "Rica Etme (Making a Request) – karşı taraftan kibarca bir şey istemek için kullanılır.\nÖrnek: \"A: Would you mind keeping an eye on my bag for a minute? B: Not at all, take your time.\" (Hiç sorun değil, acele etme.)",
    "Ricayı Kabul Etme (Accepting a Request) – yapılan bir isteğin olumlu karşılandığını belirtmek için kullanılır.\nÖrnek: \"A: Could you send me the report before noon? B: Sure, I'll have it ready in twenty minutes.\" (Tabii, yirmi dakika içinde hazır olur.)",
    "Ricayı Nazikçe Reddetme (Politely Declining a Request) – bir isteğin nazikçe ve gerekçeyle reddedildiğini belirtmek için kullanılır.\nÖrnek: \"A: Can you cover my shift on Saturday? B: I'm afraid I can't, I already have a family event that day.\" (Ne yazık ki yapamam, o gün aile toplantım var.)",
    "Mazeret Sunma (Offering an Excuse) – bir aksaklığın ya da gecikmenin nedenini açıklamak için kullanılır.\nÖrnek: \"A: You missed the entire first half of the meeting. B: I know, something came up at the last minute and I couldn't get away.\" (Biliyorum, son anda bir şey çıktı ve ayrılamadım.)",
    "Açıklığa Kavuşturma (Clarifying or Rephrasing) – söylenen bir şeyi farklı sözcüklerle yeniden ifade etmek için kullanılır.\nÖrnek: \"A: So you're saying the plan won't work at all? B: Not exactly, what I mean is it needs a few adjustments first.\" (Tam olarak değil, demek istediğim önce birkaç düzeltmeye ihtiyacı var.)",
    "Açıklama İsteme (Asking for Clarification) – karşı tarafın söylediği bir şeyin daha net anlaşılmasını istemek için kullanılır.\nÖrnek: \"A: The deadline has been moved up significantly. B: Could you explain what you mean by 'significantly'?\" (Tam olarak 'önemli ölçüde' ile neyi kastediyorsun, açıklar mısın?)",
    "Şüphe Bildirme (Expressing Doubt) – bir iddia ya da plan konusunda tam olarak ikna olunmadığını belirtmek için kullanılır.\nÖrnek: \"A: This new strategy is guaranteed to double our sales. B: I'm not so sure about that; the market has been unpredictable lately.\" (Bundan pek emin değilim; piyasa son zamanlarda oldukça tahmin edilemez.)",
  ];

  const diyalogTamamlamaKuralReferansi2 = [
    "Güven Verme (Reassuring Someone) – endişeli birine durumun düzeleceğine dair güven vermek için kullanılır.\nÖrnek: \"A: What if the client rejects our proposal? B: Don't worry, we've prepared for every possible objection.\" (Merak etme, olası her itiraza karşı hazırlıklıyız.)",
    "Öneride Bulunma (Making a Suggestion) – bir eylem için fikir sunmak amacıyla kullanılır.\nÖrnek: \"A: We still haven't decided where to eat tonight. B: Why don't we just try that new place on Main Street?\" (Neden Main Street'teki o yeni yeri denemiyoruz?)",
    "Daveti Kabul Etme (Accepting an Invitation) – yapılan bir davetin memnuniyetle kabul edildiğini belirtmek için kullanılır.\nÖrnek: \"A: We're having a small get-together this Friday, would you like to join? B: I'd love to, thank you so much for asking.\" (Çok isterim, davet ettiğin için çok teşekkürler.)",
    "Daveti Nazikçe Reddetme (Declining an Invitation) – bir davetin gerekçeyle ve kibarca reddedildiğini belirtmek için kullanılır.\nÖrnek: \"A: Can you come to the concert with us tonight? B: I'm afraid I already have plans, but thanks for thinking of me.\" (Ne yazık ki başka planım var ama beni düşündüğün için teşekkürler.)",
    "Tebrik Etme (Congratulating) – karşı tarafın bir başarısını kutlamak için kullanılır.\nÖrnek: \"A: I finally passed my certification exam! B: Congratulations, all that hard work really paid off.\" (Tebrikler, tüm o emek gerçekten karşılığını verdi.)",
    "Şikayet Etme (Complaining) – bir durumdan memnuniyetsizliği dile getirmek için kullanılır.\nÖrnek: \"A: How was your stay at the hotel? B: Honestly, I'm not satisfied at all; the room was never cleaned properly.\" (Açıkçası hiç memnun değilim; oda hiç düzgün temizlenmedi.)",
    "Özür Dileme (Apologizing) – yapılan bir hata için pişmanlık ifade etmek amacıyla kullanılır.\nÖrnek: \"A: You forgot to invite half the team to the meeting. B: I'm really sorry about that, it completely slipped my mind.\" (Bunun için gerçekten özür dilerim, tamamen aklımdan çıkmış.)",
    "Rahatlama Bildirme (Expressing Relief) – endişe edilen bir durumun iyi sonuçlandığını belirtmek için kullanılır.\nÖrnek: \"A: The surgery went smoothly and she's already recovering. B: What a relief! We were all so worried.\" (Ne rahatlatıcı! Hepimiz çok endişelenmiştik.)",
    "Teşekkür Etme (Expressing Gratitude) – karşı tarafın yardımına minnettarlık duyulduğunu belirtmek için kullanılır.\nÖrnek: \"A: I stayed late to help you finish the report. B: I really appreciate it, I couldn't have done it without you.\" (Gerçekten minnettarım, sensiz bunu başaramazdım.)",
    "Kibarca Söz Kesme (Interrupting Politely) – bir konuşmaya nazikçe müdahale etmek için kullanılır.\nÖrnek: \"A: ...and that's why I think we should expand into three new markets. B: Sorry to interrupt, but could we first talk about the budget?\" (Sözünü kestiğim için üzgünüm ama önce bütçeyi konuşabilir miyiz?)",
    "Konu Değiştirme (Changing the Subject) – sohbeti farklı bir konuya yönlendirmek için kullanılır.\nÖrnek: \"A: ...so the renovation should be finished by next month. B: By the way, speaking of next month, did you hear about the new office policy?\" (Bu arada, gelecek ay demişken, yeni ofis politikasını duydun mu?)",
    "Erteleme Talep Etme (Postponing or Rescheduling) – bir planın başka bir zamana ertelenmesini önermek için kullanılır.\nÖrnek: \"A: Are we still meeting at three o'clock today? B: Actually, could we reschedule for tomorrow morning instead?\" (Aslında, bunun yerine yarın sabaha erteleyebilir miyiz?)",
    "Uzlaşma Önerme (Negotiating or Compromising) – iki farklı görüş arasında orta bir yol bulmayı önermek için kullanılır.\nÖrnek: \"A: I want to leave at six, but you want to leave at eight. B: How about we compromise and leave around seven?\" (Uzlaşıp yedi civarında çıksak nasıl olur?)",
  ];

  function diyalogTamamlamaLessonDefs(def) {
    return [
      {
        title: `${def.name} – Konuya Giriş`,
        durationMinutes: 12,
        contentBody: diyalogTamamlamaIntro,
      },
      {
        title: `${def.name} – Kurallar Referansı (1/2)`,
        durationMinutes: 15,
        contentBody: diyalogTamamlamaKuralReferansi1.join("\n\n"),
      },
      {
        title: `${def.name} – Kurallar Referansı (2/2)`,
        durationMinutes: 15,
        contentBody: diyalogTamamlamaKuralReferansi2.join("\n\n"),
      },
      {
        title: `${def.name} – Örnek Sorular ve Çözümler`,
        durationMinutes: 15,
        contentBody: formatExamples(ydsExamples[def.slug]),
      },
    ];
  }
  // --- END: diyalog-tamamlama ---

  // --- BEGIN: yds-stratejileri (grounded in "Suat Gürcan & Rıdvan Gürbüz Yaklaşımı ile YDS
  // Sınav Stratejileri" grammar book — one lesson per grammar chapter, following the book's
  // structure exhaustively per the user's request. Each lesson's Giriş uses inline
  // [STRATEJI]/[ORNEK_SORU] markers rendered as colored callout boxes by StrategyBox.tsx,
  // mirroring the book's own "► STRATEJİ ◄" / "ÖRNEK SORU" boxes. All prose and examples
  // below are original; only the underlying grammar rules and time-expression/structure
  // pairings are drawn from the book's "Konu Özeti" (chapter-summary) sections.) ---
  const stratejiTenseSystemIntro =
    `YDS'nin dil bilgisi sorularının önemli bir kısmını oluşturan "Tense" (Zaman) sorularında asıl belirleyici olan, çoğu zaman cümlenin anlamını baştan sona çözmek değil, cümle içinde geçen "zaman ifadelerini" (time expressions) doğru tanımaktır. Bu bölümde, gramer kitabının "Tense System in English" ve "Tense Konu Özeti" başlıkları altında verilen zaman ifadesi–yapı eşleşmelerini, sınavda doğrudan işinize yarayacak stratejiler halinde bir araya getirdik.\n` +
    `Aşağıdaki her strateji kutusu, karşınıza çıkan bir zaman ifadesini gördüğünüzde hangi fiil yapısına yönelmeniz gerektiğini gösterir. Amaç, seçenekleri teker teker cümleye yerleştirip uzun uzun düşünmek yerine, ipucu kelimeyi gördüğünüz anda doğru yapıya yönelebilmenizdir.\n\n` +
    `Süreklilik Bildiren İfadeler: "Şu An" Sinyalleri\n` +
    `"Now, right now, at the moment, currently, at present, presently, for the time being, nowadays, these days" gibi ifadeler bir cümlede geçtiğinde, seçenekler arasında önce "am/is/are Ving" yapısını arayın.\n` +
    `[STRATEJI]\n` +
    `"Now / Right now / At the moment / Currently / At present / Presently / For the time being" → am/is/are Ving.\n` +
    `"Nowadays / These days" → öncelik am/is/are Ving yapısındadır; ancak cümle genel bir alışkanlıktan bahsediyorsa Present Simple ile de gelebilir.\n` +
    `"Now" kelimesi ayrıca "artık, günümüzde" anlamıyla başka present yapılarla da (Present Simple dahil) kullanılabilir; cümlenin bir anı mı yoksa genel bir durumu mu anlattığını kontrol edin.\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"Right now, the engineers ---- the bridge's cables for structural fatigue."\n` +
    `Doğru yapı: are inspecting (am/is/are Ving)\n` +
    `"Right now" ifadesi tam konuşma anında süren bir eylemi işaret eder; bu kalıba uyan tek yapı Present Continuous'tur.\n` +
    `[/ORNEK_SORU]\n\n` +
    `Sıklık Zarfları ile Present Simple\n` +
    `"Never, rarely, occasionally, usually, always" gibi sıklık zarfları genellikle Present Simple ile kullanılır; sürekli olmayan bir tekrarı anlatırlar.\n` +
    `[STRATEJI]\n` +
    `%0-%25 arası: never, not at all, not ever, almost never, rarely, barely, hardly (ever), seldom, scarcely.\n` +
    `%25-%75 arası: occasionally, sometimes, at times, now and then, now and again, from time to time.\n` +
    `%75-%100 arası: usually, generally, mostly, most of the time, often, frequently, always, all the time, every day/week.\n` +
    `Bu zarflardan biri cümlede geçiyorsa ve cümlede başka bir zaman ipucu yoksa, seçeneklerde Present Simple yapısını önceliklendirin.\n` +
    `[/STRATEJI]\n\n` +
    `Geçmişe Referans Veren İfadeler: V2 Tetikleyicileri\n` +
    `"Yesterday, two days ago, last night, in 1960, during the 1960s, at that time, once (bir zamanlar), previously, initially, for the first time" gibi ifadeler net bir geçmiş zaman noktasına işaret eder ve Simple Past (V2) gerektirir.\n` +
    `[STRATEJI]\n` +
    `Kesin geçmiş noktası bildiren ifadeler (yesterday, ... ago, last..., in + yıl, during + dönem, at that time, once, previously, initially, for the first time) → V2.\n` +
    `Dikkat: "now" ile başlayan ifadeler present yapı ister, "at that/the time" ve "at that moment" ise cümlenin bağlamına göre V2 veya was/were Ving isteyebilir; cümlede süreklilik vurgusu varsa was/were Ving'e yönelin.\n` +
    `[/STRATEJI]\n\n` +
    `"Now" Noktasına Bağlanan İfadeler: Present Perfect Sinyalleri\n` +
    `Present Perfect'i tetikleyen zaman ifadeleri, geçmişte başlayıp "now" noktasına kadar uzanan ya da "now" ile dolaylı bir bağlantısı olan ifadelerdir. Bunlar YDS'de en sık karıştırılan grup olduğu için ayrı bir başlık altında topladık.\n` +
    `[STRATEJI]\n` +
    `"Since + geçmiş nokta / since + isim öbeği" → have/has V3 ya da have/has been Ving (bağlaç olarak kullanıldığında yan cümlecik V2 alır).\n` +
    `"For + süre" ve "for ... now" → have/has V3 ya da have/has been Ving.\n` +
    `"Lately, recently" → have/has V3 ya da have/has been Ving; "until recently" ise öncelikle V2, ardından have-has V3/been Ving de gelebilir.\n` +
    `"So far, thus far, up to now, up till now, to date" → have/has V3 ya da have/has been Ving.\n` +
    `"Over/During/Within/For/In the last/past + süre" → have/has V3 ya da have/has been Ving.\n` +
    `"Three times / four times / many times" gibi sayısal tekrar ifadeleri → present bir cümlede have/has V3 (tekrar anlamı); cümle zaten past ise had V3, gelecek ise will have V3.\n` +
    `Cümlede tekrar anlamı varsa (three times gibi) have/has V3 işaretleyin; eylem kesintisiz devam ediyorsa have/has been Ving işaretleyin.\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"The research team ---- this particular gene for three years now, but they still haven't found a definitive answer."\n` +
    `Doğru yapı: has been studying (have/has been Ving)\n` +
    `"For three years now" ifadesi geçmişte başlayıp hâlâ devam eden bir süreci işaret eder; "but they still haven't found" kısmı da eylemin bitmediğini, sürdüğünü doğrular; bu yüzden tekrar değil süreklilik yapısı (been Ving) doğrudur.\n` +
    `[/ORNEK_SORU]\n\n` +
    `Had V3'ün (Past Perfect) Kullanıldığı ve Kullanılmadığı Yerler\n` +
    `Past Perfect'i doğru yerde işaretlemek, hangi zaman bağlacının hangi cümlecikte "had V3" gerektirdiğini bilmekten geçer.\n` +
    `[STRATEJI]\n` +
    `"By + geçmiş nokta" ve "by the time + V2" → had V3 (ana cümlecikte).\n` +
    `"After" bağlacı yan cümlecikte had V3 alabilir; "before, when, until, as soon as, once" bağlaçları ise genellikle had V3'ü kendi yan cümleciklerinde DEĞİL, ana cümlecikte ister (yani "Before she had left" gibi bir kullanım YDS mantığında tercih edilmez; doğrusu "Before she left, she had finished..." şeklindedir).\n` +
    `"Prior to + geçmiş nokta" ifadesi de "by" gibi davranır ve had V3 ister.\n` +
    `Had V3 ile birlikte gelen 5 özel yapı: I wish/if only + had V3, as if/as though + had V3, would rather + had V3, If Clause Type 3, If Clause mixed type.\n` +
    `[/STRATEJI]\n\n` +
    `"If" ve Zaman Bağlaçlarında Gelecek Zaman Tuzağı\n` +
    `Bu, YDS'nin en klasik tuzaklarından biridir: "if, when, before, unless, once, as soon as, until, by the time" gibi bağlaçların yan cümleciğinde "will/would/shall/be going to/might" gibi gelecek zaman yapıları KULLANILMAZ, çünkü bu bağlaçlar zaten kendi başlarına geleceğe göndermede bulunur.\n` +
    `[STRATEJI]\n` +
    `If / When / Before / Unless / Once / As soon as / Until / By the time + [present ya da V2, ASLA will/would/shall/be going to/might] , ---- [will/shall + V0, will be Ving, will have V3].\n` +
    `Bu yapı bir zaman/koşul bağlacı gördüğünüzde, o bağlacın kendi cümleciğinde "will" içeren bir seçeneği doğrudan eleyebileceğiniz anlamına gelir; doğru seçenek genelde diğer cümlecikte aranır.\n` +
    `[/STRATEJI]\n\n` +
    `V2 Görünüp Past Anlamı Taşımayan 6 Özel Yapı\n` +
    `Bir fiil V2 (Simple Past) formunda göründüğü halde, aşağıdaki 6 yapıdan biri cümlede varsa bu V2 gerçek bir geçmiş zamanı değil, kalıplaşmış bir "unreal" anlamı ifade eder.\n` +
    `[STRATEJI]\n` +
    `1. It's (high/about) time + Subject + V2\n` +
    `2. I wish / If only + Subject + V2\n` +
    `3. As if / As though + Subject + V2\n` +
    `4. Would rather + Subject + V2\n` +
    `5. If Clause Type 2\n` +
    `6. Would you mind + Subject + V2\n` +
    `Bu 6 yapıdan biri varsa, cümledeki V2'yi "geçmişte oldu" diye çevirmeyin; bunlar şimdiki zamana ait bir dilek, öneri ya da hayali durumu anlatır.\n` +
    `[/STRATEJI]\n\n` +
    `Gelecek Zaman İfadeleri ve "By/By the Time" Formülleri\n` +
    `"Tomorrow, next week/month/year, in 2050, shortly, soon, before long" gibi ifadeler future time gerektirir; ancak bu ifadeler geçmişi anlatan bir paragrafın içinde geçerse V2 ile de kullanılabileceğini unutmayın (o zaman "gelecekteki bir an" değil, "o dönem için gelecek olan bir an" anlatılır).\n` +
    `[STRATEJI]\n` +
    `"By + gelecek tarih" → will have V3 (Future Perfect); "by the time + present" → will have V3 (ana cümlecikte).\n` +
    `"Be about to V0 / be due to V0 / be on the verge, edge, point, brink, threshold of Ving" kalıpları "-e üzere olmak" anlamı verir.\n` +
    `"This time tomorrow / at this time next year" → will be Ving; "this time yesterday / at this time last year" → was/were Ving.\n` +
    `[/STRATEJI]\n\n` +
    `Sonuç olarak, Tense sorularının büyük bölümü cümlenin anlamını değil, cümlede geçen zaman ifadesini doğru okumayı test eder. Bu bölümdeki strateji kutularını bir sözlük gibi kullanın: karşınıza çıkan zaman ifadesini bulun, hangi yapıyla eşleştiğini hatırlayın ve seçenekleri bu süzgeçten geçirin. "Tense (Zaman) Soruları" konusundaki kurallar referansı ve örnek sorularla birlikte tekrar ettiğinizde, sınavın dil bilgisi bölümünün büyük kısmını bu mantıkla çözebilirsiniz.`;

  const stratejiModalityIntro =
    `YDS dil bilgisi sorularında Tense'den sonra en sık karşınıza çıkan başlıklardan biri, kip yapıları olarak da bilinen "Modality"dir. Modallar bir eylemi zamana göre değil, konuşmacının o eyleme bakışına göre; yani yetenek, olasılık, zorunluluk, tavsiye, izin ya da rica gibi bir tutuma göre şekillendirir. Bu bölümde, gramer kitabının "Modality" ve "Modal Konu Özeti" başlıkları altında verdiği yapı-anlam eşleşmelerini, sınavda seçenekleri hızla eleyebileceğiniz strateji kutuları haline getirdik.\n` +
    `Modal sorularının büyük kısmı, birbirine anlamca çok yakın görünen iki veya üç yapı arasındaki ince farkı bilip bilmediğinizi ölçer; örneğin "could" ile "was able to" arasındaki fark ya da "must have V3" ile "should have V3" arasındaki fark gibi. Aşağıdaki kutuları bu farkları netleştirmek için bir başvuru kaynağı gibi kullanın.\n\n` +
    `Yetenek Bildiren Yapılar: Can / Could / Be Able To\n` +
    `Bir kişinin genel ya da o an içinde bulunduğu şartlara bağlı yeteneğini anlatırken "can" ve "be able to" yapıları şimdiki zamanda birbirinin yerine geçer; aralarında anlam farkı yoktur.\n` +
    `[STRATEJI]\n` +
    `Şimdiki zamanda yetenek (Present Ability): can + V0 = am/is/are able to + V0.\n` +
    `Gelecekte yetenek (Future Ability): will be able to + V0 = shall be able to + V0.\n` +
    `Geçmişte genel yetenek (Past Ability): could + V0 = was/were able to + V0.\n` +
    `Geçmişte belirli ve tek seferlik bir eylemde elde edilen başarıdan (particular action, actual performance) söz ederken "could" kullanılmaz; yalnızca "was/were able to" tercih edilir ve bu kullanım "managed to" (uğraş sonucu başarmak) anlamı taşır.\n` +
    `İstisna: see, hear, understand, feel gibi algı fiilleriyle geçmişteki tek bir eyleme gönderme yapılırken "could" kullanımı da mümkündür.\n` +
    `Olumsuz cümlede "couldn't" ile "wasn't/weren't able to" arasında herhangi bir anlam farkı yoktur; ikisi de tek seferlik geçmiş eylemler için serbestçe kullanılabilir.\n` +
    `[/STRATEJI]\n\n` +
    `Olasılık Bildiren Yapılar: May / Might / Could ve Genel-Kuramsal Ayrımı\n` +
    `Olasılık bildiren yapılar, cümlenin olumlu ya da olumsuz olmasına ve anlatılan olasılığın türüne göre farklılaşır; bu yüzden bu grubu tek bir kalıp gibi değil, alt başlıklara ayırarak öğrenmek gerekir.\n` +
    `[STRATEJI]\n` +
    `Genel olasılık (general possibility, olumlu cümle): may V0 = might V0 = could V0, hepsi "-ebilir" anlamı verir.\n` +
    `Genel olasılık (olumsuz cümle): may not V0 = might not V0, "-meyebilir" anlamı verir; "could not" bu grupta yer almaz çünkü "couldn't" geçmişe yönelik "-emedi" anlamı taşır.\n` +
    `Kuramsal olasılık (theoretical possibility, herhangi bir zamanda gerçekleşebilecek genel bir durum): can V0, "-ebilir" anlamı verir; soru cümlelerinde olasılık bildiren modal olarak da "can" tercih edilir.\n` +
    `May well V0 = might well V0 = could well V0, yine "olasılıkla -ebilir" anlamı verir; bunları anlamca farklı olan "may/might/could as well" (bari ... yapalım) yapısıyla karıştırmayın.\n` +
    `Be likely to V0 → olasılıkla -ebilir; be unlikely to V0 → olasılıkla -meyebilir; be bound to V0 → kuvvetle muhtemel, kesinliğe yakın bir olasılık bildirir.\n` +
    `"I have no idea / I don't know / perhaps, maybe / I'm not sure / ...or... / probably, possibly" gibi belirsizlik bildiren ifadeler cümlede geçiyorsa, seçeneklerde öncelikle olasılık bildiren modal yapıları arayın.\n` +
    `[/STRATEJI]\n\n` +
    `Zorunluluk ve Gereklilik: Must / Have to / Need to ve Olumsuzların Anlam Farkı\n` +
    `Zorunluluk bildiren yapılar arasındaki en kritik ayrım olumlu değil, olumsuz hallerindedir: "must" ve "have to" olumlu cümlede birbirine yakın bir anlam verirken, olumsuz halleri tamamen farklı anlamlara gelir.\n` +
    `[STRATEJI]\n` +
    `Şimdiki zamanda zorunluluk: must V0 (içten gelen zorunluluk) = have to/has to V0 (dıştan gelen zorunluluk, kural/yasa) = have got to/has got to V0 (konuşma dilinde dıştan gelen zorunluluk) = need to V0.\n` +
    `Zorunluluğun olmayışı: don't/doesn't have to V0 = don't/doesn't need to V0 = needn't V0, hepsi "-e gerek yok" anlamı verir; bunların hiçbiri "mustn't" ile aynı anlama gelmez.\n` +
    `Mustn't V0, zorunluluğun yokluğunu değil, YASAK anlamını (sakın yapma) verir; bu yüzden "zorunda değilsin" anlamı aranan bir boşlukta "mustn't" asla doğru seçenek olamaz.\n` +
    `Geçmişte zorunluluk: had to V0 (zorunda kaldım); geçmişte zorunluluğun ortadan kalkması: didn't have to V0 = didn't need to V0 (zorunda kalmadım, gerek kalmadı).\n` +
    `"Needn't have V3" farklı bir zaman düzlemine aittir: eylem gerçekleşmiştir ama gereksizdir ("-e gerek yoktu ama yaptın"); "didn't need to/didn't have to" ise eylemin hiç gerçekleşmediği durumlarda kullanılır. Seçeneklerde bu ikisi birlikte verildiyse eylemin yapılıp yapılmadığına bakın: eylem gerçekleşmemişse didn't have to/didn't need to, gerçekleşmiş ama gereksizse needn't have V3 işaretleyin.\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"The company ---- extra staff for the holiday season, but they decided to hire five temporary workers anyway, and now half of them have nothing to do."\n` +
    `Doğru yapı: needn't have hired (needn't have V3)\n` +
    `Cümlenin devamında işe alımın gerçekten yapıldığı ("hire five temporary workers") ve şimdi bu kişilerin gereksiz kaldığı ("have nothing to do") belirtiliyor; eylem gerçekleştiği için "didn't need to" değil, "needn't have V3" yapısı doğrudur.\n` +
    `[/ORNEK_SORU]\n\n` +
    `Tavsiye Yapıları: Should / Ought to / Had Better\n` +
    `Tavsiye bildiren yapılar birbirine yakın anlamlar taşısa da güç dereceleri ve zaman kullanımları bakımından ayrılır.\n` +
    `[STRATEJI]\n` +
    `Olumlu tavsiye gücü artan sırayla: should V0 = ought to V0 (yumuşak tavsiye, -meli/-malı) < had better V0 (daha keskin bir öneri, -sa iyi olur) < must V0 (en güçlü tavsiye, mutlaka yap).\n` +
    `Olumsuz tavsiye gücü artan sırayla: shouldn't V0 = ought not to V0 (-mamalı) < had better not V0 (-yapmasa iyi olur) < mustn't V0 (en güçlü uyarı, sakın yapma).\n` +
    `"Had better" yapısı yalnızca şimdiki ve gelecek zaman anlamı taşır; geçmişe yönelik bir tavsiye ya da eleştiri anlatılacaksa "had better" değil, "should have V3/ought to have V3" kullanılır.\n` +
    `Akıl danışma kalıbı "Shall I/we...? / Should I/we...?" ile kurulur; "shall" yalnızca I ve we özneleriyle kullanılır ve olumsuz hali "shall not/shan't" yerine günümüzde genellikle "won't" tercih edilir.\n` +
    `[/STRATEJI]\n\n` +
    `İzin ve Rica Yapıları: Permission ve Polite Request\n` +
    `İzin isteme/verme ile kibarca rica etme, sınavda birbirine karıştırılan iki ayrı işlevdir; kullanılan modallar kısmen örtüşse de amaçları farklıdır.\n` +
    `[STRATEJI]\n` +
    `İzin isteme (soru cümlesi) ya da izin verme (düz cümle): may I/might I/can I/could I ...? hepsi "-ebilir miyim" anlamına gelir; düz cümlede "you may/can" izin vermeyi ifade eder.\n` +
    `Kibar rica: Can you...? / Could you...? / Will you...? / Would you...? yapılarının hepsi "(bana) ... yapar mısın" anlamı taşır; nezaket derecesi could/would ile artar.\n` +
    `Would you mind + Ving...? yapısında eylemi gerçekleştirecek kişi karşı taraftır (örn. "Beni bekler misin" → Would you mind waiting for me?).\n` +
    `Would you mind if + özne + V2...? yapısında ise eylemi başka bir kişi (genellikle konuşmacının kendisi) gerçekleştirecektir ve if cümleciğinde mutlaka Past Simple (V2) kullanılır, will/would değil.\n` +
    `"May/might as well" yapısı izin ya da olasılık değil, "bari ...yapalım / ...yapsam da olur" anlamı verir; olasılık bildiren "may/might/could well" ile karıştırılmamalıdır.\n` +
    `[/STRATEJI]\n\n` +
    `Perfect Modallerde Real Past - Unreal Past Ayrımı\n` +
    `Modaller sadece V0 ile değil, "modal + have + V3" kalıbıyla da kullanılır ve bu yapılar geçmişe yönelik bir yorum katar. Bu yapıları anlamak için önce iki büyük gruba ayırmak gerekir: eylemin gerçekten olup olmadığından emin olunamayan "real past" yapıları ve eylemin kesinlikle gerçekleşmediğini bildiren "unreal past" yapıları.\n` +
    `[STRATEJI]\n` +
    `Real Past grubu (eylem gerçekten olmuş olabilir, konuşmacı sadece yorum yapıyor): may/might/could have V3 → "-mış olabilir"; must have V3 → "-mış olmalı"; can't/couldn't have V3 → "-mış olamaz".\n` +
    `Unreal Past grubu (eylem kesinlikle gerçekleşmemiştir, sadece bir yorum/pişmanlık/beklenti anlatılır): should have V3/ought to have V3 → "-meliydi/malıydı ama yapmadı"; would have V3 → "-erdi/ardı ama yapmadı"; needn't have V3 → "-e gerek yoktu ama yaptı" (bu yapı istisnai biçimde eylemin gerçekleştiği tek unreal-past yapısıdır).\n` +
    `"Might have V3" ve "could have V3" iki grupta da görünebilir: real past anlamında "-mış olabilir", unreal past anlamında ise (özellikle if clause type 3 bağlamında) "-ebilirdi ama olmadı" anlamı taşıyabilir; hangi anlamın kastedildiğini cümledeki bağlamdan çıkarın.\n` +
    `Bir cümlede "ama gerçekleşmedi/olmadı" vurgusu varsa (bir pişmanlık, kaçırılan fırsat ya da yanlış beklenti anlatılıyorsa) unreal past grubuna, sadece geçmişe dair bir tahmin ya da yorum yapılıyorsa real past grubuna yönelin.\n` +
    `[/STRATEJI]\n\n` +
    `Geçmişte Olasılık ve Sonuç Çıkarımı: Could Have V3, Couldn't Have V3, Must Have V3\n` +
    `Perfect modaller içinde YDS'nin en sık çeldirici ürettiği yapı çifti "could have V3" ile "couldn't have V3"tür, çünkü bu ikisinin her biri tek başına iki farklı anlama gelebilir.\n` +
    `[STRATEJI]\n` +
    `Could have V3'ün iki anlamı: (1) "-ebilirdim ama yapmadım" (geçmişte kaçırılan bir fırsat, missed opportunity); (2) "-mış olabilir" (real past, olasılık bildiren yorum).\n` +
    `Couldn't have V3'ün iki anlamı: (1) "-emezdim/-amazdım" (geçmişte imkânsız olan bir eylem); (2) "-mış olamaz" (can't have V3 ile eş anlamlı, kuvvetli olumsuz çıkarım).\n` +
    `Şimdiki zamanda sonuç çıkarımı (deduction): must V0 → "-meli/malı" (olumlu çıkarım); can't V0 → "...olamaz" (olumsuz çıkarım).\n` +
    `Geçmişte sonuç çıkarımı: must have V3 → "-mış olmalı" (olumlu çıkarım); can't have V3 = couldn't have V3 → "-mış olamaz" (olumsuz çıkarım); mustn't have V3 → "-mamış olmalı".\n` +
    `Bir cümlede geçmişe dönük kesin bir kanıta dayanan güçlü bir tahmin varsa must have V3/can't have V3 grubuna, kaçırılan bir fırsat ya da imkânsızlık anlatılıyorsa could have V3/couldn't have V3'ün ilk anlamına yönelin.\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"Look at the mud all over his shoes and the state of his jacket - he ---- through the forest trail instead of taking the paved road."\n` +
    `Doğru yapı: must have walked (must have V3)\n` +
    `Cümlede ayakkabılarındaki çamur ve ceketinin hali somut birer kanıt olarak sunulmuş; bu kanıtlara dayanan güçlü, olumlu bir geçmiş çıkarımı söz konusu olduğu için "must have V3" doğrudur, "could have V3" gibi daha zayıf bir olasılık ifadesi bu kesinliği karşılamaz.\n` +
    `[/ORNEK_SORU]\n\n` +
    `Sonuç olarak, Modality soruları genellikle cümlenin tamamının anlamını değil, o cümlede geçen ipucunun (bir kanıt, bir pişmanlık, bir zorunluluk ya da bir olasılık ifadesi) hangi modal yapıyla eşleştiğini test eder. Sınavda karşınıza "must/have to", "should/had better" ya da "could have V3/couldn't have V3" gibi anlamca yakın seçenekler geldiğinde önce cümlenin zaman düzlemini (şimdiki zaman mı geçmiş zaman mı), sonra da anlatılmak istenen tutumu (zorunluluk mu tavsiye mi olasılık mı) belirleyin; bu iki adım seçenekleri büyük ölçüde eleyip doğru yapıya ulaşmanızı sağlar. Bu bölümdeki strateji kutularını "Modality" konusundaki kurallar referansı ve örnek sorularla birlikte tekrar ettiğinizde, sınavın dil bilgisi bölümünde modal sorularını hızlı ve güvenle çözebilirsiniz.`;
  const stratejiPassiveVoiceIntro =
    `YDS gramer sorularının klasik başlıklarından biri olan "Passive Voice & Causatives", aslında birbiriyle yakından ilişkili iki ayrı yapıyı bir araya getirir: cümlenin öznesini eylemi yapan değil eylemden etkilenen varlığa taşıyan pasif (edilgen) çatı ve bir eylemin özne tarafından değil özne aracılığıyla bir başkasına yaptırıldığını anlatan ettirgen (causative) yapılar. Bu bölümde, gramer kitabının "Passive Voice & Causatives Konu Özeti" başlığında özetlenen kuralları, sınavda karşınıza çıkan seçenek kalıplarına göre yeniden düzenleyerek pratik stratejiler haline getirdik.\n` +
    `Her iki yapının da ortak noktası, doğru seçeneğe ulaşmak için önce cümledeki fiilin nesne alıp almadığını, nesne alıyorsa kaç nesne aldığını ve boşluğun devamında ne olduğunu tespit etmenin gerekliliğidir. Aşağıdaki strateji kutularını bu sırayla, yani önce "fiil nesne alır mı" sorusunu sorarak kullanmanız, seçenekleri hızla aktif-pasif ya da causative açısından elemenizi sağlayacaktır.\n\n` +
    `Pasifin Kuruluşu: Her Zamanın Kendi "Be V3" Hali\n` +
    `Pasif cümle, aktif cümledeki nesneyi özne konumuna taşıyıp ana fiili "be V3" kalıbına çevirerek kurulur; buradaki "be" fiili aktif cümlenin ana fiili hangi zamanda ya da hangi yapıdaysa (V1, V2, modal+V0, be+Ving, have+V3) tam olarak o zamanın ya da yapının şeklini alır, sadece "be" fiilinin kendisi değişir, zaman bilgisi kaybolmaz.\n` +
    `[STRATEJI]\n` +
    `V1 (am/is/are + V0) → am/is/are + V3\n` +
    `V2 (was/were + V-ed) → was/were + V3\n` +
    `modal + V0 (must/can/should/will vb.) → modal + be + V3\n` +
    `am/is/are/was/were + Ving (progressive) → am/is/are/was/were + being + V3\n` +
    `have/has/had + V3 (perfect) → have/has/had + been + V3\n` +
    `Bir seçenekte "be" fiilinin hangi hale girdiğini gördüğünüzde, önce o kalıbın hangi aktif zamana karşılık geldiğini bulun; cümledeki zaman ifadesi bu zamanla uyuşmuyorsa seçeneği eleyin.\n` +
    `Cümle sonunda "by + fail eden" öbeği varsa bu öbek eylemi gerçekleştiren kişiyi/şeyi gösterir ve çoğunlukla atlanabilir; ancak boşluk bu öbekten hemen önceyse cümlenin edilgen olduğu neredeyse kesindir.\n` +
    `[/STRATEJI]\n\n` +
    `Pasif Yapılamayan Fiiller: Geçişsiz Fiiller ve Durum Bildiren Fiiller\n` +
    `Bir fiilin pasif yapılabilmesi için mutlaka bir nesne alması gerekir; nesnesi olmayan (geçişsiz) fiiller pasif kalıba hiçbir şekilde sokulamaz. Nesne alan bazı fiiller bile bir eylem değil bir durum ya da sahiplik bildirdiklerinde pasif yapılmaz; bu ayrımı gözden kaçırmak YDS'de sık yapılan bir hatadır.\n` +
    `[STRATEJI]\n` +
    `"Arrive, happen, occur, take place, disappear, exist, seem, appear, remain, belong to, consist of, rely on, depend on" gibi geçişsiz (intransitive) fiiller nesne almadıkları için pasif yapılamaz; bir seçenekte bu fiillerden biri pasif halde (be V3) verilmişse doğrudan eleyin.\n` +
    `Nesne alan ancak "resemble, have (sahip olmak), lack, suit, fit, cost, weigh, contain, equal, matter" gibi fiiller bir eylemi değil bir durumu/özelliği anlattıklarında pasif yapılamaz: "This bag costs 40 dollars" cümlesi pasif hale getirilemez.\n` +
    `Aynı fiil hem geçişli hem geçişsiz kullanılabiliyorsa (ergative verbs: open, close, grow, sell, develop, print, start, finish) cümlede nesne olup olmadığına bakarak karar verin; nesne yoksa fiil zaten aktif kalır, pasife çevrilmez.\n` +
    `[/STRATEJI]\n\n` +
    `Çift Geçişli Fiillerde İki Pasif Seçenek\n` +
    `"Give, send, tell, ask, offer, buy, teach, show, promise" gibi iki nesne alabilen (ditransitive) fiillerin pasif yapılırken hangi nesnenin özne konumuna geleceğine karar vermek gerekir; bu fiiller genellikle iki farklı pasif cümle kurmaya izin verir ve YDS bu iki seçeneği birbirine karşı kullanmayı sever.\n` +
    `[STRATEJI]\n` +
    `Dolaylı nesne (kime/kimin için) özne yapılırsa fiilden sonra bir edata gerek kalmaz: "She was sent the report" gibi.\n` +
    `Dolaysız nesne (neyi/ne) özne yapılırsa fiilden sonra genellikle "to" ya da bazı fiillerde "for" edatı gelir: "The report was sent to her" gibi.\n` +
    `Boşluktan hemen sonra "to/for + kişi" öbeği varsa büyük olasılıkla dolaysız nesne özne yapılmıştır; boşluktan sonra edatsız bir isim öbeği geliyorsa dolaylı nesne özne yapılmış olabilir.\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"Every new intern ---- a detailed handbook and a mentor on their first day."\n` +
    `Doğru yapı: is given (dolaylı nesne özne yapılmış, edata gerek yok)\n` +
    `Cümlede "a detailed handbook and a mentor" neyin verildiğini gösterir; özne olan "every new intern" ise dolaylı nesnedir, bu yüzden bir edata gerek kalmadan doğrudan "is given" ile devam edilir.\n` +
    `[/ORNEK_SORU]\n\n` +
    `Modal ve Perfect Modallerle Pasif Yapı\n` +
    `Modal fiillerle kurulan pasif yapılarda "be" fiili her zaman yalın halde (V0) kalır ve modalden hemen sonra gelir; perfect modal (must have, should have gibi) yapılarda ise "be" fiili "been" halini alır.\n` +
    `[STRATEJI]\n` +
    `modal + V0 → modal + be + V3: "must be done, can be solved, should be checked".\n` +
    `modal + have + V3 → modal + have + been + V3: "must have been done, should have been finished, can't have been stolen".\n` +
    `"Should be done" bir gerekliliği şu an ya da gelecek için anlatırken, "should have been done" geçmişte yapılması gerektiği halde yapılmamış bir eylemi eleştirerek anlatır; bu iki yapıyı cümledeki zaman ifadesine göre ayırın.\n` +
    `Modallerden sonra gelen "be" fiilinin ASLA "is/are/was/were" gibi çekimli bir hale girmediğini, her zaman yalın kaldığını unutmayın.\n` +
    `[/STRATEJI]\n\n` +
    `"Get" Passive ile "Be" Passive Arasındaki Fark\n` +
    `Sıfat gibi davranan ve bir eylemi değil bir durumu anlatan "stative passive" yapılarında "be" fiili yerine "get" kullanmak, cümleye ansızın gerçekleşen bir değişim ya da olay anlamı katar; bu ince fark YDS'de anlam bütünlüğü sorularında karşımıza çıkabilir.\n` +
    `[STRATEJI]\n` +
    `"Be V3" durağan bir durumu anlatır: "The window is broken" (cam kırık; ne zaman kırıldığı önemli değildir).\n` +
    `"Get V3" o durumun nasıl ortaya çıktığını, ansızın gerçekleştiğini vurgular: "The window got broken during the storm" (cam fırtına sırasında kırıldı).\n` +
    `"Get passive" günlük dilde ve özellikle beklenmedik, olumsuz olaylarda ("got fired, got caught, got injured") sık kullanılır; resmi/akademik pasajlarda "be" passive tercih edilir.\n` +
    `Boşluktan sonra ansızın gerçekleşen bir olayı işaret eden bir zaman zarfı (suddenly, yesterday, during the storm) varsa ve öncesinde durum bildiren bir sıfat-fiil varsa "get" seçeneğini de değerlendirin.\n` +
    `[/STRATEJI]\n\n` +
    `Kişisiz Pasif Yapılar: Bildirim Fiilleriyle "It is said that..." / "He is said to..."\n` +
    `"Say, think, believe, know, consider, report, claim, assume" gibi bildirim/düşünce fiilleri, bir "that" cümleciğini nesne olarak aldıklarında iki farklı şekilde pasif yapılabilir: boş özne "it" ile ya da "that" cümleciğinin öznesini ana cümlenin öznesi yaparak.\n` +
    `[STRATEJI]\n` +
    `"It is said/thought/believed/known/reported that + S + V": "that" cümleciği aktif yapıda kalır; boşluk "it" ile başlıyor ve pasif bir fiil devam ediyorsa öncelik bu yapıya verilir.\n` +
    `"S + is said/thought/believed to + V0 / to be Ving / to have V3": "that" cümleciğinin öznesi ana cümlenin öznesi olur; "that" cümleciğindeki fiil ana fiile göre eş zamanlıysa "to V0", ana fiille aynı anda süren bir eylemse "to be Ving", ana fiilden önce gerçekleşmişse "to have (been) V3" halini alır.\n` +
    `Zaman ilişkisini belirlerken "that" cümleciğindeki eylemin ana fiille aynı anda mı yoksa ondan önce mi gerçekleştiğine bakın: önce gerçekleşmişse mutlaka "to have (been) V3" yapısını seçin.\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"The missing manuscript ---- to have been sold to a private collector long before the museum began its investigation."\n` +
    `Doğru yapı: is believed (is believed to have been sold)\n` +
    `"Long before the museum began its investigation" ifadesi satış eyleminin, inanma eyleminden önce gerçekleştiğini gösterir; bu yüzden "that" cümleciğinin öznesi olan "manuscript" ana cümlenin öznesi yapılmış ve önceki zamanı işaret eden "to have been sold" yapısı tercih edilmiştir.\n` +
    `[/ORNEK_SORU]\n\n` +
    `Ettirgen Yapılar: Have/Get ile "Yaptırma", Make/Let/Have ile "Zorlama-İzin"\n` +
    `Causative (ettirgen) yapılar, öznenin eylemi kendisinin yapmadığını, bir başkasına yaptırdığını ya da bir başkasının yapmasına izin verdiğini/onu buna zorladığını anlatır. Hangi fiilin hangi yapıyla kullanıldığını bilmek bu başlıktaki soruların neredeyse tamamını çözer.\n` +
    `[STRATEJI]\n` +
    `Sadece "eylemin yaptırıldığı" vurgulanıyor, işi yapan kişi (agent) belirtilmiyorsa: have/get + [işten etkilenen nesne] + V3 → "I had my car repaired / I got my hair cut."\n` +
    `"Eylemin kime yaptırıldığı" da belirtiliyorsa: have/let/make + [agent] + V0 (to almadan) → "I had the mechanic repair my car / She let him stay / They made him apologize."\n` +
    `"Get" fiili agent belirtilen yapılarda "have/let/make"tan farklı davranır ve "to V0" ister: get + [agent] + to V0 → "I got him to fix my car."\n` +
    `"Make" zorlama, "let" izin verme, "have" ise nötr bir talep/yönlendirme anlamı taşır; cümledeki anlam ipucuna (zorlandı mı, izin mi verildi, sadece talep mi edildi) göre bu üçünü birbirinden ayırın.\n` +
    `[/STRATEJI]\n\n` +
    `Sonuç olarak, YDS'de Passive Voice & Causatives sorularının ortak çözüm anahtarı, seçeneklere geçmeden önce fiilin nesne alıp almadığını, kaç nesne aldığını ve cümlede kimin kime ne yaptığını netleştirmektir. Bu bölümdeki strateji kutularını önce "aktif mi pasif mi" sorusunu sorup ardından zaman/modal uyumuna, en son da ettirgen fiillerin kendine özgü kalıplarına bakarak sırayla uygulayın; bu sistematik yaklaşım "Tense" ve "Causatives" bilginizle birleştiğinde bu başlıktaki soruların büyük kısmını güvenle çözmenizi sağlayacaktır.`;
  const stratejiGerundsInfinitivesIntro =
    `YDS'nin dil bilgisi sorularında sıkça karşımıza çıkan "Gerunds & Infinitives" (İsim-Fiil ve Mastar Yapıları) konusu, aslında ezber değil sınıflandırma becerisi ister: boşluktan hemen önceki unsurun bir fiil mi, bir sıfat mı, bir edat mı yoksa "too, enough, question word" gibi özel bir yapı mı olduğunu tanıdığınız anda, devamında "Ving" mi yoksa "to V0" mı geleceğine kolayca karar verebilirsiniz. Bu bölümde, gramer kitabının "Gerunds & Infinitives Konu Özeti" başlığında özetlenen kuralları, sınavda karşınıza çıkan tuzaklara göre yeniden düzenleyerek pratik strateji kutuları haline getirdik.\n` +
    `Aşağıdaki her strateji kutusu, hangi fiil grubunun, sıfatın ya da kalıbın hangi yapıyı zorunlu kıldığını gösterir; amaç, seçenekleri sırayla cümleye yerleştirip anlamı defalarca tartmak yerine, boşluktan önceki ipucunu görür görmez doğru yapıya yönelebilmenizdir.\n\n` +
    `Sadece Gerund (Ving) İsteyen Fiiller\n` +
    `Bazı fiillerin nesne pozisyonunda yalnızca "Ving" yapısı bulunur; bu fiillerden sonra asla çıplak bir "to V0" gelmez ve bu liste YDS'de en sık test edilen ezber gruplarından biridir.\n` +
    `[STRATEJI]\n` +
    `Sadece Ving alan başlıca fiiller: enjoy, avoid, mind, suggest, recommend, consider, finish, admit, deny, risk, practice, postpone, delay, quit, give up, resist, imagine, appreciate, involve, justify, resent, keep (on).\n` +
    `Bu fiillerin ortak noktası ya zaten süregelen/alışılmış bir eylemi (enjoy, practice, keep on) ya da geçmişte gerçekleşmiş bir duruma göndermeyi (admit, deny, risk, resent) bildirmeleridir; her ikisinde de eylem henüz gerçekleşmemiş bir "niyet" değildir.\n` +
    `Bu fiillerden hemen sonra seçeneklerde çıplak bir "to V0" görürseniz o seçeneği elemekten çekinmeyin; doğru yapı her zaman "Ving" ya da edilgen anlam varsa "being V3" olacaktır.\n` +
    `[/STRATEJI]\n\n` +
    `Sadece To-Infinitive İsteyen Fiiller\n` +
    `Bu gruptaki fiiller, nesnelerinde her zaman henüz gerçekleşmemiş, ana fiilden sonra gerçekleşecek bir eylemi işaret eder; dolayısıyla devamlarında yalnızca "to V0" bulunur.\n` +
    `[STRATEJI]\n` +
    `Sadece to-infinitive alan başlıca fiiller: decide, plan, hope, promise, afford, manage, refuse, agree, offer, expect, arrange, intend, wish, choose, deserve, claim, threaten, tend, fail, seem, appear, aim.\n` +
    `Bu fiillerin hepsinde mantık aynıdır: "karar verme, umut etme, planlama, söz verme" gibi bir zihinsel ya da sözel eylem, kendisinden sonra gerçekleşecek başka bir eylemi işaret eder; bu yüzden yapı geriye değil ileriye dönük bir anlam taşır.\n` +
    `Seçeneklerde bu fiillerden hemen sonra "Ving" gördüğünüzde, cümlede başka bir gerekçe (edat, sıfat vb.) yoksa bu seçeneği eleyin.\n` +
    `[/STRATEJI]\n\n` +
    `Hem Ving Hem To V0 Alan Ama Anlamı Değişen Fiiller\n` +
    `Remember, forget, stop, try, regret ve need gibi fiiller hem "Ving" hem de "to V0" ile kullanılabilir; ancak seçilen yapıya göre cümlenin anlamı tamamen değişir, bu yüzden bu grup YDS'nin en klasik tuzaklarından biridir.\n` +
    `[STRATEJI]\n` +
    `Remember + Ving: geçmişte yapılmış bir eylemi hatırlamak / Remember + to V0: yapılması gereken bir eylemi unutmamak.\n` +
    `Forget + Ving: geçmişte yaşanmış bir olayı unutmak / Forget + to V0: yapılması gereken bir eylemi unutmak (genelde olumsuz cümlelerde kullanılır).\n` +
    `Stop + Ving: yapılmakta olan eylemi bırakmak / Stop + to V0: başka bir şey yapmak için durmak ("to V0" burada amaç bildirir, stop'un nesnesi değildir).\n` +
    `Try + Ving: bir şeyi deneme amaçlı yapmak / Try + to V0: bir şeyi başarmak için çaba göstermek, uğraşmak.\n` +
    `Regret + Ving: geçmişte yapılan bir şeyden pişmanlık duymak / Regret + to V0: genellikle kötü bir haber verirken kullanılan resmi bir kalıp (regret to inform you that...).\n` +
    `Need + Ving / to be V3: nesnenin edilgen anlamda bir işleme ihtiyacı olduğunu belirtir / Need + to V0: öznenin kendisinin bir eylemi yapması gerektiğini belirtir.\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"After the flood, the workers ---- the old bridge because the local council decided a new one had to be built instead."\n` +
    `Doğru yapı: stopped repairing (stop + Ving)\n` +
    `Cümlede köprünün onarımından tamamen vazgeçildiği anlatılıyor; "başka bir şey yapmak için durma" değil, "yapılmakta olan eylemi bırakma" anlamı olduğundan stop + Ving doğrudur.\n` +
    `[/ORNEK_SORU]\n\n` +
    `Sıfatlardan Sonra To V0 ve Edat + Ving Ayrımı\n` +
    `İngilizcede sıfatlardan sonra bir fiil gelecekse genel kural bu fiilin "to V0" şeklinde çekimlenmesidir; ancak bazı sıfatlar kendinden sonra bir edat alır ve bu edattan sonra fiil zorunlu olarak "Ving" olur.\n` +
    `[STRATEJI]\n` +
    `To V0 isteyen tipik sıfatlar: important, necessary, essential, willing, ready, eager, likely, difficult, hard, easy, glad, happy, able.\n` +
    `Edat + Ving isteyen tipik sıfat kalıpları: interested in, good/bad at, afraid of, tired of, capable of, fond of, keen on, worried about, responsible for, famous for, opposed to, accustomed to, used to.\n` +
    `"Busy" sıfatı bu iki gruba da uymayan bir istisnadır: busy kendinden sonra doğrudan "Ving" alır (busy + Ving), isimle devam edecekse "busy with" şeklinde kullanılır.\n` +
    `Boşluktan hemen önce bir sıfat, boşluktan hemen sonra da bir edat görüyorsanız fiili doğrudan "Ving" olarak işaretleyin; aralarında edat yoksa önceliğiniz "to V0" olmalıdır.\n` +
    `[/STRATEJI]\n\n` +
    `Too...To V0 ve Enough...To V0 Yapıları\n` +
    `"Too" ve "enough" yapıları anlamca birbirinin neredeyse tam tersidir ve YDS'de sık sık aynı soru içinde karşılaştırılır; bu yüzden ikisinin dizilimini karıştırmamak gerekir.\n` +
    `[STRATEJI]\n` +
    `Too + sıfat/zarf + to V0: "-emeyecek kadar" anlamı verir ve olumsuz bir sonucu işaret eder (too tired to walk: yürüyemeyecek kadar yorgun).\n` +
    `Too + many/few/much/little + isim + to V0 yapısında da aynı olumsuz mantık geçerlidir.\n` +
    `Sıfat/zarf + enough + to V0: "yeterince ... ki yapabilsin" anlamı verir ve olumlu bir sonucu işaret eder (strong enough to lift: kaldırabilecek kadar güçlü).\n` +
    `Enough + isim + to V0 yapısında "enough" isimden önce gelir (enough time to finish: bitirmeye yetecek kadar zaman).\n` +
    `Bu iki yapıda da fiil daima "to V0" şeklindedir; "enough" ya da "too" gördüğünüzde seçeneklerdeki "Ving" ihtimallerini büyük ölçüde eleyebilirsiniz.\n` +
    `[/STRATEJI]\n\n` +
    `Gerund'un Özne, Edat Sonrası ve Kalıplaşmış Yapılarda Kullanımı\n` +
    `"Ving" yapısı yalnızca fiillerin nesnesi olarak değil, cümlenin öznesi olarak, bir edattan sonra ve bazı kalıplaşmış ifadelerin devamında da kullanılır; bu üç durumda da seçeneklerde "to V0" değil "Ving" aranmalıdır.\n` +
    `[STRATEJI]\n` +
    `Cümle başında özne konumundaki fiil her zaman "Ving" şeklindedir (Working abroad requires adaptability: yurt dışında çalışmak uyum yeteneği gerektirir).\n` +
    `Bir edattan (in, at, on, about, by, without, for vb.) hemen sonra gelen fiil zorunlu olarak "Ving" olur; "by Ving" "-erek/-arak", "without Ving" ise "-meksizin/-meden" anlamı verir.\n` +
    `Possessive Adjective (my, your, his, her, its, our, their) ya da 's takısından sonra gelen fiil "Ving" şeklinde çekimlenir.\n` +
    `Spend/waste + zaman veya para ifadesi + Ving; have difficulty/trouble (in) + Ving kalıplarında da fiil "Ving" olur.\n` +
    `Look forward to, object to, be opposed to, be/get used to, be accustomed to, can't help, it's worth, it's no use/good, there is no point in gibi kalıplarda "to" ya da "in" birer edattır; devamına çıplak "to V0" değil "Ving" gelir.\n` +
    `[/STRATEJI]\n\n` +
    `Used to V0 / Be Used to Ving / Get Used to Ving Ayrımı\n` +
    `Görünüşte birbirine çok benzeyen bu üç kalıp, YDS'de anlam farkına dikkat edilmediğinde kolayca karıştırılır; her biri farklı bir zaman ve alışkanlık ilişkisini anlatır.\n` +
    `[STRATEJI]\n` +
    `Used to + V0: geçmişte süregelen ama artık geçerli olmayan bir alışkanlığı ya da durumu anlatır (I used to live in İzmir: eskiden İzmir'de yaşardım, artık yaşamıyorum).\n` +
    `Be used to + Ving: bir duruma zaten alışkın olmayı anlatır, alışma süreci tamamlanmıştır (She is used to working long hours: uzun saatler çalışmaya alışkındır).\n` +
    `Get used to + Ving: bir duruma zamanla alışma sürecini, yani alışkanlık kazanmayı anlatır (He is getting used to the new system: yeni sisteme alışıyor).\n` +
    `"Used to V0" bir Simple Past yapısı gibi davranır ve yalnızca geçmiş zamanda kullanılır; "be/get used to" kalıplarındaki "used to" ise bir sıfat işlevi görür ve her zamanda çekimlenebilir (was used to, will be used to gibi).\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"Selin found the new accounting software confusing at first, but after a few months she ---- entering the data this way."\n` +
    `Doğru yapı: got used to (get used to + Ving)\n` +
    `"At first ... confusing" ve "after a few months" ifadeleri zamanla oluşan bir alışma sürecine işaret ettiğinden, sabit bir alışkanlık değil, alışma süreci anlatan "get used to" doğrudur.\n` +
    `[/ORNEK_SORU]\n\n` +
    `Sonuç olarak, "Gerunds & Infinitives" sorularının çözümü, cümlenin tamamını çözmekten çok, boşluktan hemen önceki unsuru (fiil, sıfat, edat ya da "too/enough" gibi özel bir yapı) doğru sınıflandırmaktan geçer. Bu bölümdeki strateji kutularını, karşınıza çıkan fiili ya da kalıbı hangi gruba ait olduğunu bulacağınız bir kontrol listesi gibi kullanın; özellikle remember, forget, stop, try, regret gibi anlam değiştiren fiiller ile used to/be used to/get used to ayrımını iyi pekiştirdiğinizde, bu konudan gelen soruların büyük bölümünü hızla ve güvenle çözebilirsiniz.`;
  const stratejiAdjectivesAdverbsIntro =
    `YDS dil bilgisi sorularında "Adjectives & Adverbs" başlığı, çoğu zaman uzun bir cümle çözümlemesi değil, boşluğun cümledeki görevini doğru saptamayı ister: boşluk bir ismi mi niteliyor (sıfat), yoksa bir fiili, sıfatı, başka bir zarfı ya da cümlenin tamamını mı niteliyor (zarf)? Bu bölümde, gramer kitabının "Adjectives & Adverbs" ve "Adjectives/Adverbs Konu Özeti" başlıkları altında verilen kuralları, seçenekleri hızla eleyebileceğiniz strateji kalıpları haline getirdik.\n` +
    `Aşağıdaki kutuların ortak mantığı şudur: önce seçeneklerin sıfat mı zarf mı olduğuna bakın, sonra boşluğun bir isim mi yoksa isim-dışı bir öğe mi nitelediğini belirleyin; ardından her kalıba özgü küçük tuzakları (düzensiz biçimler, kelime sırası, anlam kayması taşıyan zarflar) eleyerek doğru seçeneğe ulaşın.\n\n` +
    `Sıfat Sırası: Bir İsimden Önce Doğru Diziliş\n` +
    `Türkçede sıfatların isimden önceki sırası oldukça esnekken, İngilizcede birden fazla sıfat yan yana geldiğinde belirli bir öncelik sırası vardır; bu sıra, "hangi seçenek doğal bir dizilim oluşturur" tarzı sorularda doğrudan işinize yarar.\n` +
    `[STRATEJI]\n` +
    `Bir isimden önce birden fazla sıfat sıralanacaksa şu öncelik izlenir: opinion/görüş (lovely, boring) - size/boyut (big, tiny) - age/yaş (old, new) - shape/şekil (round, square) - color/renk (red, dark) - origin/köken (Turkish, Italian) - material/malzeme (wooden, metal) - Noun.\n` +
    `Kısaltma olarak sıra baş harflerini (Opinion-Size-Age-Shape-Color-Origin-Material) aklınızda tutun; seçeneklerdeki bir dizilim bu sırayı bozuyorsa o seçenek elenir.\n` +
    `Sayı sıfatları (three, several, many gibi) bu sıralamanın en başında, opinion'dan bile önce yer alır: "three lovely old wooden chairs" örneğinde olduğu gibi.\n` +
    `Aynı kategoriden gelen sıfatlar (iki renk ya da iki köken gibi) genelde virgül veya "and" ile bağlanırken, farklı kategorilerden sıfatlar arasına virgül konmaz.\n` +
    `[/STRATEJI]\n\n` +
    `Comparative ve Superlative Yapılar: Düzensiz Biçimler ve Vurgu Kelimeleri\n` +
    `Kısa sıfat/zarflarda "-er/-est" takısı, uzun olanlarda ise "more/most" yapısı kullanılır; sınavı asıl zorlaştıran, bu kurala uymayan düzensiz biçimler ve kıyaslamayı güçlendiren vurgu kelimeleridir.\n` +
    `[STRATEJI]\n` +
    `Düzensiz biçimler: good/well - better - best; bad/badly - worse - worst; much/many - more - most; little - less - least.\n` +
    `"Far" sıfatının iki ayrı comparative biçimi vardır: "farther" somut/fiziksel mesafe için, "further" ise soyut anlamda "ilave, ek" anlamı taşıyan bağlamlar için kullanılır.\n` +
    `"Old" sıfatının "older" (yaş/eskilik bildiren genel biçim) ve "elder" (yalnızca aile bireyleri arasında büyüklük sırasını bildiren, isimden önce kullanılan biçim) olmak üzere iki ayrı hali vardır.\n` +
    `"Late" sıfatının "later" (zaman olarak daha sonra) ve "latter" (ikiden ikincisi) biçimlerini birbirine karıştırmayın; "the former...the latter" kalıbı "birincisi...ikincisi" anlamı verir.\n` +
    `Comparative yapıyı güçlendiren vurgu kelimeleri: much, far, a lot, rather, a little, a bit, even, no; bu kelimelerden biri boşluktan hemen önce geliyorsa seçeneklerde comparative (-er/more) yapıyı önceliklendirin.\n` +
    `Superlative yapıyı güçlendiren vurgu kelimeleri ise by far, easily, quite, much, even'dir; bunlar "the -est/the most" yapısının hemen önüne yerleşir.\n` +
    `"Very, so, as, quite, fairly, too" gibi zarflar comparative (-er/more) yapının önüne GELMEZ; bu kelimelerden biri boşluktan hemen önce geliyorsa comparative seçenekleri eleyin.\n` +
    `[/STRATEJI]\n\n` +
    `"As...As", "So...That", "Such...That" ve "The Same...As" Kalıpları\n` +
    `Bu dört kalıp, sınavda birbirinin yerine seçenek olarak sunulup elenmesi istenen bir grup oluşturur; hangisinin hangi cümle kuruluşunu gerektirdiğini bilmek doğrudan doğru seçeneğe götürür.\n` +
    `[STRATEJI]\n` +
    `As + sıfat/zarf + as: iki taraf arasında eşitlik bildirir, "kadar" anlamı verir; olumsuz cümlelerde "as" yerine genellikle "so...as" tercih edilir.\n` +
    `The same + isim + as / the same + isim + that + cümle: "...ile aynı..." anlamı verir, kıyaslanan iki unsur arasındaki ortaklığı ifade eder.\n` +
    `So + sıfat/zarf + that + özne-fiil: "o kadar...ki" anlamı verir ve ardından mutlaka tam bir cümle (SVO) gelir; sadece bir isim tamlaması gelmez.\n` +
    `Such + (a/an) + sıfat + isim + that + özne-fiil: aynı "o kadar...ki" anlamını verir, ancak "so"dan farklı olarak sıfat+isim öbeğinin önüne gelir; isim kullanmadan tek başına bir sıfat/zarfın önüne geçemez.\n` +
    `Boşluktan hemen sonra doğrudan bir isim varsa "such", doğrudan bir sıfat/zarf varsa "so" seçeneğine yönelin; ikisinin arasına giren açıklayıcı ifadeleri (Ving öbeği, edat öbeği, sıfat cümleciği) parantez içine alıp yok sayarak kalıbı netleştirin.\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"The lecture was ---- confusing that most of the students left the hall without taking any notes."\n` +
    `Doğru yapı: so (so + sıfat + that + cümle)\n` +
    `Boşluktan hemen sonra bir isim değil doğrudan bir sıfat (confusing) geldiği ve ardından tam bir cümle (most of the students left...) bulunduğu için "such" değil "so" yapısı doğrudur.\n` +
    `[/ORNEK_SORU]\n\n` +
    `Zarf Türleri ve Cümledeki Yerleri\n` +
    `Zarflar tek bir işlevle sınırlı değildir; fiili, sıfatı, başka bir zarfı ya da cümlenin tamamını niteleyebilirler ve bu farklı işlevler zarfın cümle içindeki konumunu da belirler.\n` +
    `[STRATEJI]\n` +
    `Sıklık zarfları (always, usually, often, sometimes, rarely, never) genellikle ana fiilden ÖNCE, "be" fiilinden ise SONRA yer alır.\n` +
    `Derece zarfları (very, quite, rather, extremely, fairly, too) niteledikleri sıfat/zarftan hemen ÖNCE gelir ve o sıfat/zarfın derecesini artırıp azaltır.\n` +
    `Cümle zarfları (fortunately, obviously, surprisingly, admittedly, evidently) konuşmacının tüm cümleye bakışını yansıtır; genelde cümle başında virgülle ayrılarak kullanılır ve çıkarılsa da cümlenin temel anlamı bozulmaz.\n` +
    `Vurgu zarfları (even, only, also, just, especially, merely) niteledikleri öğenin hemen önüne yerleşerek o öğeyi vurgular; yerleri değiştiğinde cümlenin vurguladığı öğe de değişir, bu yüzden seçeneklerde zarfın konumuna dikkat edin.\n` +
    `Tarz zarfları (-ly ile biten slowly, carefully, quietly gibi) genelde fiilden ya da nesneden sonra gelir; fiil ile nesnenin arasına girmez.\n` +
    `[/STRATEJI]\n\n` +
    `Karıştırılan Sıfat-Zarf İkilileri: Hard/Hardly, Late/Lately, Near/Nearly, High/Highly\n` +
    `Bazı kelimelerin hem sıfat hem de düzensiz zarf (-ly'siz) biçimi bulunduğu için, bu kelimelere "-ly" eklenmiş hali beklenen zarf anlamını değil, tamamen farklı bir anlam taşır; bu çiftler YDS'nin klasik tuzaklarındandır.\n` +
    `[STRATEJI]\n` +
    `Hard (adj/adv: sert, zor / sıkı çalışan) ile Hardly (adv: neredeyse hiç) birbirinin yerine kullanılamaz; "hardly" anlamca olumsuzdur ama gramer olarak olumlu cümlelerde kullanılır.\n` +
    `Late (adj/adv: geç) ile Lately (adv: son zamanlarda) farklı anlamlar taşır; "lately" genellikle Present Perfect zamanla birlikte görülür.\n` +
    `Near (adj/adv: yakın) ile Nearly (adv: neredeyse, yaklaşık) farklıdır; "nearly" bir sayıyı ya da dereceyi yaklaşık olarak belirtirken "near" fiziksel yakınlık bildirir.\n` +
    `High (adj/adv: yüksek) ile Highly (adv: son derece, çok) farklıdır; "highly" bir sıfatı ya da fiili güçlendiren bir derece zarfıdır (highly recommended, highly unlikely) ve fiziksel yükseklik anlatmaz.\n` +
    `Bu dört çiftten birinin "-ly"li hali cümlede geçiyorsa cümleyi "sert/geç/yakın/yüksek" anlamıyla değil, kelimenin kendine özgü farklı anlamıyla okuyun; seçeneklerde bu ayrımı gözeterek anlam bütünlüğünü kontrol edin.\n` +
    `[/STRATEJI]\n\n` +
    `"Too" ve "Enough" Yapılarında Sıfat-Zarf Ayrımı\n` +
    `"Too" ve "enough" kalıpları hem sıfatlarla hem zarflarla kullanılabilir; ikisi arasındaki temel fark, "enough"ın sıfat/zarftan SONRA, isimden ise ÖNCE gelmesidir.\n` +
    `[STRATEJI]\n` +
    `Too + sıfat/zarf + to V0: "...-emeyecek kadar..." anlamı verir ve genellikle olumsuz bir sonucu ima eder.\n` +
    `Sıfat/Zarf + enough + to V0: "yeteri kadar..." anlamı verir; bu kullanımda "enough" niteleyeceği sıfat/zarftan SONRA yer alır.\n` +
    `Enough + isim + to V0: "yeterli sayıda/miktarda..." anlamı verir; bu kullanımda "enough" niteleyeceği isimden ÖNCE gelir (enough time, enough money gibi).\n` +
    `"Too"yu güçlendiren vurgu kelimeleri rather, far, much, a little, a bit'tir; bunlar "too"dan hemen önce gelir (far too difficult gibi).\n` +
    `Boşluktan hemen sonra bir isim varsa "enough + isim", boşluktan hemen önce bir sıfat/zarf varsa "sıfat/zarf + enough" dizilimini arayın; bu ayrım doğru seçeneğe götürür.\n` +
    `[/STRATEJI]\n\n` +
    `Participial Adjectives: "-ing" ve "-ed" Ayrımı\n` +
    `Fiillere eklenen "-ing" ve "-ed/-en" takıları bir ismi niteleyen sıfatlar oluşturur; ancak hangisinin kullanılacağı, niteleyeceğiniz ismin bir duyguyu YAŞAYAN mı yoksa o duyguya SEBEP OLAN mı olduğuna bağlıdır.\n` +
    `[STRATEJI]\n` +
    `Nitelediğimiz isim bir duyguyu ya da etkiyi YAŞIYORSA (etkileniyorsa) "-ed" biçimi kullanılır: a bored student, an interested audience, a confused driver.\n` +
    `Nitelediğimiz isim bir duyguya ya da etkiye SEBEP OLUYORSA "-ing" biçimi kullanılır: a boring lecture, an interesting proposal, a confusing map.\n` +
    `Cansız nesneler ve durumlar hakkında bilgi verilirken çoğunlukla "-ing" biçimi, insanın kendi iç tepkisi anlatılırken çoğunlukla "-ed" biçimi tercih edilir.\n` +
    `Bir sürecin henüz TAMAMLANMADIĞINI vurgulamak için "-ing", TAMAMLANDIĞINI/sonuçlandığını vurgulamak için "-ed" ya da düzensiz V3 biçimi kullanılır (a developing country / a developed country gibi).\n` +
    `Seçeneklerde aynı fiilin hem "-ing" hem "-ed" hali sunuluyorsa, önce cümledeki ismin "etkileyen mi, etkilenen mi" olduğuna, sonra sürecin bitip bitmediğine bakarak karar verin.\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"After sitting through a three-hour meeting about topics that had nothing to do with her department, Elif felt completely ---- and started doodling on her notepad."\n` +
    `Doğru yapı: bored (etkilenen taraf insan olduğu için -ed)\n` +
    `Cümlede duyguyu yaşayan (etkilenen) kişi Elif olduğu ve toplantının onda yarattığı sıkılma hissi anlatıldığı için "-ing" değil "-ed" biçimi (bored) doğrudur.\n` +
    `[/ORNEK_SORU]\n\n` +
    `Sonuç olarak, sıfat ve zarf soruları YDS'de genellikle uzun bir cümle çözümlemesinden çok, boşluğun cümledeki görevini (bir ismi mi niteliyor, bir fiili/sıfatı/zarfı mı niteliyor, yoksa cümlenin tamamını mı niteliyor) doğru saptamayı ve ardından kalıba özgü küçük ayrıntıları (düzensiz biçimler, "enough"ın konumu, "so" ile "such" arasındaki isim/sıfat farkı, "-ing/-ed" ayrımı) hatırlamayı test eder. Bu bölümdeki strateji kutularını tekrar ederken önce seçeneklerin sıfat mı zarf mı olduğuna, sonra boşluğun ne nitelediğine bakma alışkanlığı edinirseniz, "Adjectives & Adverbs" konusundan gelen soruların büyük kısmını hızlı ve güvenli biçimde çözebilirsiniz.`;
  const stratejiAdjectiveClausesIntro =
    `"Adjective Clause" (Sıfat Cümleciği / İlgi Cümleciği), bir ismi ayrı bir tam cümle yardımıyla nitelemeyi sağlayan yapılardır; YDS'de bu konu genellikle cümledeki boşluğun hangi ismi nitelediğini, bu ismin nitelenen cümlecik içinde özne mi nesne mi olduğunu ve cümlede virgül olup olmadığını fark etmeyi test eder.\n` +
    `Bu bölümde gramer kitabının "Adjective Clauses" ve "Adjective Clause Konu Özeti" başlıklarında verilen who/which/that/whose/where/when/why seçimini, kısaltma (reduction) kurallarını ve "that" yasaklarını, boşluğa bakar bakmaz doğru yapıya yönelmenizi sağlayacak strateji kutuları hâline getirdik.\n\n` +
    `İlgi Zamirlerine Giriş: Who, Whom, Which, That, Whose\n` +
    `Sıfat cümleciği kurulurken önce nitelenen ismin insan mı yoksa insan dışı bir varlık mı olduğuna, sonra da bu ismin yan cümlecik içindeki görevine (özne, nesne, sahiplik) bakılır.\n` +
    `İnsanları niteleyen özne konumundaki yapı who, nesne konumundaki yapı whom (günlük kullanımda who da kabul edilir), insan dışı varlıkları niteleyen yapı ise hem özne hem nesne konumunda which'tir.\n` +
    `That, hem insanlar hem de insan dışı varlıklar için hem özne hem nesne konumunda kullanılabilen "yedek" bir yapıdır; ama sadece defining (virgülsüz) sıfat cümleciklerinde geçerlidir.\n` +
    `[STRATEJI]\n` +
    `Boşluktan önceki isim insansa ve boşluk özne konumundaysa: who / that.\n` +
    `Boşluktan önceki isim insansa ve boşluk nesne konumundaysa: whom / who / that.\n` +
    `Boşluktan önceki isim insan dışıysa (özne ya da nesne fark etmez): which / that.\n` +
    `Seçeneklerde who/which gibi asıl yapılar varken that'i "ikinci tercih" olarak düşünün; cümlede virgül varsa that'i doğrudan eleyin.\n` +
    `[/STRATEJI]\n\n` +
    `Özne mi Nesne mi? Boşluktan Sonraki Dizilime Bakın\n` +
    `Bir sıfat cümleciği sorusunda asıl ipucu, nitelenen ismin ne olduğu değil, boşluktan hemen sonra gelen dizilimdir.\n` +
    `Boşluktan hemen sonra bir yardımcı fiil, modal ya da doğrudan çekimli bir fiil geliyorsa cümlecikte özne eksiktir; bu durumda who/which/that gibi özne göreviyle kullanılan yapılar aranır.\n` +
    `Boşluktan sonra bir özne ve onu takip eden bir fiil geliyor, fakat o fiilin nesnesi görünmüyorsa cümlecikte nesne eksiktir; bu durumda whom/which/that ya da hiçbir relative word kullanılmadan (Ø) boşluk bırakılabilir.\n` +
    `[STRATEJI]\n` +
    `____ + yardımcı fiil / modal / çekimli fiil (özne eksik) → who / which (insan dışı) / that.\n` +
    `____ + özne + fiil ... (nesne eksik) → whom / which / that / Ø (relative word hiç kullanılmayabilir).\n` +
    `Nesne konumundaki boşluklarda seçeneklerde relative word bulunmuyorsa ve cümle zaten anlamlı bir şekilde devam ediyorsa, doğru yanıtın "hiçbir kelime gelmemesi" olabileceğini unutmayın.\n` +
    `[/STRATEJI]\n\n` +
    `"That" Yasakları: Virgülden Sonra ve Edattan Sonra\n` +
    `"That" pratik ve esnek bir yapı gibi görünse de iki yerde kesinlikle kullanılamaz: virgülle ayrılmış non-defining sıfat cümleciklerinde ve bir edattan (preposition) hemen sonra.\n` +
    `Non-defining cümlecikler nitelenen ismi tanımlamaz, sadece hakkında ek bilgi verir ve mutlaka virgülle ayrılır; böyle bir cümlecikte "that" değil who/which kullanılmalıdır.\n` +
    `Bir edat sıfat cümleciğinde relative word'ün hemen önüne taşınmışsa (edat + relative word yapısı), bu relative word sadece whom, which ya da whose + noun olabilir; "that" edattan sonra asla gelmez.\n` +
    `[STRATEJI]\n` +
    `Cümlede virgül varsa (non-defining) → that kullanılmaz, who/which tercih edilir.\n` +
    `Edattan hemen sonra gelen relative word → sadece whom / which / whose + noun; that, where, why, when ve who bu konumda kullanılamaz.\n` +
    `Edatı cümlenin sonuna bırakırsanız (Defining yapılarda) that ya da Ø tekrar kullanılabilir hale gelir; yani "the book that I told you about" doğruyken "the book about that I told you" yanlıştır.\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"The scholarship, ---- I applied last spring, covers both tuition and accommodation."\n` +
    `Doğru yapı: for which\n` +
    `Cümlede virgül olduğu için non-defining bir yapı söz konusudur ve boşluktan hemen önce gelen "apply for" fiilinin edatı boşluğa taşınmıştır; bu yüzden "that" ya da "why" değil, edat + which kalıbı olan "for which" doğru yanıttır.\n` +
    `[/ORNEK_SORU]\n\n` +
    `Sıfat Cümleciğinin Kısaltılması: Aktif Ving, Pasif V3\n` +
    `Özne konumundaki bir defining sıfat cümleciği, relative word ve yardımcı fiil birlikte atılarak katılım bilgisine (participle) indirgenebilir; YDS'de bu kısaltılmış hâller sık sık boşluk olarak karşımıza çıkar.\n` +
    `Nitelenen isim, kısaltılan cümlecikteki eylemi kendisi yapıyorsa yani anlam aktifse fiil Ving hâline getirilir; nitelenen isim eylemi kendisi yapmıyor, o eylemi başkası ona yapıyorsa yani anlam pasifse fiil V3 ya da being V3 hâline getirilir.\n` +
    `Nitelenen ismin önünde bir isim daha varsa ve bu ismin öncesinde bir fiil bulunuyorsa (örneğin "persuade somebody to V0" gibi), kısaltma "isim + to V0" biçiminde de yapılabilir.\n` +
    `Superlative (en üstünlük) yapısını niteleyen sıfat cümlecikleri de aynı mantıkla "the first/best/only + to V0" (aktif) ya da "the first/best/only + to be V3" (pasif) şeklinde kısaltılır.\n` +
    `[STRATEJI]\n` +
    `Noun + Ving → aktif kısaltma (isim eylemi kendisi yapıyor).\n` +
    `Noun + V3 / being V3 → pasif kısaltma (eylem isme yapılıyor).\n` +
    `Superlative + to V0 → aktif kısaltma; Superlative + to be V3 → pasif kısaltma.\n` +
    `Boşluktan hemen önce yalın bir isim, boşluktan hemen sonra da bir başka fiil ya da nesne varsa, önce cümlenin aktif mi pasif mi olduğuna anlamına göre karar verin; özne eylemi yapıyorsa Ving, özne eyleme maruz kalıyorsa V3/being V3 işaretleyin.\n` +
    `[/STRATEJI]\n\n` +
    `Whose + İsim: Sahiplik Bildiren Sıfat Cümlecikleri\n` +
    `Nitelenen isimle sıfat cümleciği içindeki bir başka isim arasında "-nin/-ın" şeklinde bir aitlik ilişkisi varsa relative word olarak whose kullanılır; whose hem insanlar hem de insan dışı varlıklar için geçerlidir ve defining ile non-defining kullanımında biçimi değişmez.\n` +
    `Whose'dan hemen sonra mutlaka yalın bir isim ya da sıfat + isim gelir; "a, an, the, some, many" gibi belirteçlerle kurulmuş bir yapı whose'dan sonra gelemez.\n` +
    `İnsan dışı varlıklardaki sahiplik ilişkisi istenirse "whose + isim" yerine "the + isim + of which" kalıbıyla da kurulabilir; bu kalıpta isim, of which'in önüne değil ismin kendisi öne alınır.\n` +
    `[STRATEJI]\n` +
    `Boşluktan önce insan ya da insan dışı bir isim nitelenip boşluktan sonra yalın isim ya da sıfat+isim geliyorsa (belirteçsiz) → whose.\n` +
    `Whose + a / an / the / many / some + isim gibi bir seçenek gördüğünüzde bu seçeneği doğrudan eleyin; whose çıplak isimle çalışır.\n` +
    `İnsan dışı varlıklarda "whose + isim" ile "the + isim + of which" anlamca eşdeğerdir; seçeneklerde ikisinden hangisi varsa dizilim kurallarına (whose isimden önce, of which isimden sonra) göre işaretleyin.\n` +
    `[/STRATEJI]\n\n` +
    `Yer, Zaman ve Sebep Bildiren Yapılar: Where, When, Why\n` +
    `Nitelenen isim bir yer, zaman ya da sebep bildiriyorsa ve sıfat cümleciği içinde bu isim edatlı bir tümleç (dolaylı tümleç) görevindeyse, edat + which yerine kısaca where (yer), when (zaman) ya da why (sebep) kullanılabilir.\n` +
    `Bu üç yapıdan hangisinin doğru olduğuna karar vermenin en pratik yolu, boşluktan sonra gelen dizilimin tam bir cümle olup olmadığına bakmaktır; boşluktan sonra özne ve nesnesiyle eksiksiz bir cümle varsa where/when/why doğrudur, ama boşluktan sonra özne ya da nesne eksikse bu üçü değil which ya da that kullanılmalıdır.\n` +
    `Where, when ve why sadece edatın "yerini tutan" birer kısaltmadır; bu yüzden aynı anlam edat + which ile de verilebilir (in which, on which, at which, during which, for which gibi).\n` +
    `[STRATEJI]\n` +
    `Boşluktan sonra tam cümle (özne+yüklem+varsa nesne eksiksiz) → where (yer) / when (zaman) / why (sebep) / edat + which.\n` +
    `Boşluktan sonra özne ya da nesne eksik → which / that (where, when, why bu durumda kullanılamaz).\n` +
    `Yer bildiren isimden sonra sahiplik ilişkisi varsa (örn. "ülke, insanları...") where değil whose + isim kullanılır.\n` +
    `"The reason" ifadesinden sonra boşluk geliyorsa ve devamı tam cümleyse why, değilse which/that/Ø tercih edilir.\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"Archaeologists finally located the cave ---- the ancient manuscripts had been hidden for centuries."\n` +
    `Doğru yapı: where\n` +
    `Boşluktan sonra "the ancient manuscripts had been hidden for centuries" tam bir cümledir, yani ne özne ne de nesne eksiktir; nitelenen isim de bir yer olduğu için which değil where doğru yanıttır.\n` +
    `[/ORNEK_SORU]\n\n` +
    `Bütün Cümleyi Niteleyen "Which": Co-ordinating Adjective Clause\n` +
    `Sıfat cümlecikleri her zaman tek bir ismi nitelemek zorunda değildir; virgülden sonra gelen "which", kendisinden önceki ismi değil, kendisinden önceki cümlenin tamamını ya da orada anlatılan durumu niteleyebilir.\n` +
    `Bu kullanımda relative word olarak sadece which kullanılır; who, whom, that ya da Ø bu görevi üstlenemez, çünkü nitelenen bir isim değil bütün bir önermedir.\n` +
    `Bu yapıyı defining bir sıfat cümleciğinden ayırt etmenin yolu, virgülden hemen önce nitelenmeye uygun tekil bir ismin değil, tam bir cümlenin bulunmasıdır; which bu durumda "ki bu" ya da "bu da" anlamı taşır.\n` +
    `[STRATEJI]\n` +
    `Virgülden önce tam bir cümle var ve virgülden sonraki boşlukta özne eksikse → which (bütün cümleyi niteleyen co-ordinating kullanım).\n` +
    `Bu konumda who / whom / that / Ø seçeneklerini doğrudan eleyin; sadece which doğru olabilir.\n` +
    `Anlam kontrolü için virgülden sonraki kısmı "ki bu durum..." ya da "bu da..." diye çevirin; çeviri anlamlı oluyorsa co-ordinating which kullanımı doğrulanmış olur.\n` +
    `[/STRATEJI]\n\n` +
    `Sonuç olarak, YDS'deki adjective clause sorularının neredeyse tamamı aynı üç soruyu sırayla sormanızı ister: nitelenen isim insan mı değil mi, boşluktan sonraki dizilim özne mi nesne mi yoksa tam bir cümle mi eksik, ve cümlede virgül ya da edat var mı. Bu üç soruya verdiğiniz cevaplar sizi otomatik olarak who/whom, which/that, whose+isim, where/when/why ya da Ving/V3 kısaltmalarından birine götürür. Bu bölümdeki strateji kutularını bu sırayla uygulayarak, seçenekleri tek tek cümleye yerleştirmek yerine doğru yapıyı doğrudan tahmin edebilirsiniz.`;
  const stratejiNounClausesIntro =
    `YDS'de "isim cümlecikleri" (noun clauses) başlığı, bir yan cümleciğin cümle içinde özne, nesne ya da tümleç görevi üstlenmesini inceler; bu yapılar sınavda genellikle boşluk doldurma sorularında "that", "the fact that", "whether", "if" ya da bir soru kelimesiyle başlayan cümlecikler arasından doğru bağlacı seçmeyi test eder. Aynı bölümde işlenen "yardımcı fiil" yapıları ise -devrik cümleler, "so/neither/nor" kalıpları, question tag'ler ve vurgulu "do/does/did" kullanımı- görünüşte farklı bir konu gibi dursa da aslında aynı mantığı paylaşır: her ikisinde de cümlenin standart özne-yüklem sırasından sapan bir dizilim doğru okunmalıdır.\n` +
    `Bu bölümde önce isim cümleciklerinin hangi bağlaçla kurulacağını ve cümle içinde nasıl bir sıralama izleyeceğini, ardından yardımcı fiillerin devrik yapılarda ve kısa onay/vurgu kalıplarında nasıl kullanıldığını, sınavda doğrudan işinize yarayacak strateji kutularıyla ele alıyoruz.\n\n` +
    `"That" ve "The Fact That" ile Kurulan Kararlı Durum Cümlecikleri\n` +
    `Cümlede kesin ve tartışmasız bir bilgi aktarılıyorsa isim cümleciği "that" ya da "the fact that" ile kurulur; bu iki yapı fiilin nesnesi konumunda genellikle birbirinin yerine kullanılabilir, ancak bir edattan hemen sonra sadece "the fact that" gelir, çünkü "that" tek başına bir edatın ardından kullanılmaz.\n` +
    `[STRATEJI]\n` +
    `S + fiil + that/the fact that + S + V + O: fiilin nesnesi konumunda (She announced that/the fact that the merger had been approved.).\n` +
    `S + yardımcı fiil (be, seem, appear) + that + S + V + O: öznenin tümleci konumunda (Her main concern is that the deadline is too close.).\n` +
    `It + edilgen fiil + that + S + V + O: haber ya da iddia bildiren edilgen yapılarda (It is widely believed that the data was manipulated.).\n` +
    `...sıfat + that + S + V + O: duygu ya da yorum bildiren sıfatlardan sonra (It is unlikely that they will reach an agreement.).\n` +
    `...soyut isim + that + S + V + O: fikir ya da olgu bildiren soyut isimlerden sonra (There is no doubt that the strategy will succeed.).\n` +
    `...edat + the fact that + S + V + O: bir edattan hemen sonra sadece bu yapı kullanılır (They are concerned about the fact that sales have dropped sharply.).\n` +
    `Bu altı kalıptan biri boşluktan önce verilmişse ve cümlede herhangi bir belirsizlik yoksa, seçeneklerde önce "that" ya da "the fact that" yapısını arayın.\n` +
    `[/STRATEJI]\n\n` +
    `Soru Kelimeleriyle Kurulan Kararsız Durum Cümlecikleri: Düz Cümle Sırası\n` +
    `Bir wh- sorusu isim cümleciğine dönüştüğünde soru kalıbından çıkar ve düz cümle diziliminie döner; yani yardımcı fiil özne ile yer değiştirmez, özne yüklemin önünde kalır. Bu, YDS'de en sık yapılan tuzaklardan biridir: aday soru sırasını isim cümleciğinin içine taşıyıp yanlış seçeneği işaretleyebilir.\n` +
    `[STRATEJI]\n` +
    `Soru cümlesi isim cümleciği olduğunda yardımcı fiil-özne devriği bozulur, soru kelimesi + özne + yüklem sırasına dönülür (What does she want? → I wonder what she wants.).\n` +
    `Soru kelimesi cümlede öznenin kendisini soruyorsa (yani soruda özne eksikse) ayrı bir yardımcı fiil kullanılmaz, soru kelimesi doğrudan fiille devam eder (Who stole the money? → I don't know who stole the money.).\n` +
    `Soru kelimesinin önüne isim ya da sıfat gelmişse (whose + isim, which/what + isim, how many/how much + isim) bu öbek bir bütün olarak cümleciğin başında kalır (I didn't know whose car it was. / They know how many tickets were sold.).\n` +
    `Soru kelimesinin sıfat ya da zarf niteleyicisi varsa "how + sıfat/zarf + özne + yüklem" sırası önceliklidir (I didn't know how difficult the exam was.).\n` +
    `[/STRATEJI]\n\n` +
    `"Whether" ve "If": Kullanım Alanları ve "Or Not"\n` +
    `İki seçenekli, belirsiz bir durumu isim cümleciğine çevirirken "whether" ya da "if" kullanılır; ancak bu iki bağlaç her pozisyonda birbirinin yerine geçmez.\n` +
    `[STRATEJI]\n` +
    `Cümlenin öznesi konumunda sadece "whether" kullanılır, "if" özne olamaz (Whether the plan will work is still unclear.).\n` +
    `Bir edattan hemen sonra sadece "whether" kullanılır (They disagree about whether the policy is fair.).\n` +
    `"Or not" ifadesinden hemen önce sadece "whether" kullanılır (whether or not); "if" bu konumda gelmez.\n` +
    `Fiilden hemen sonra, nesne konumunda hem "whether" hem "if" kullanılabilir (She hasn't decided whether/if she will accept the offer.).\n` +
    `"Or not" fiilden sonraki kullanımda cümlenin sonuna atılabilir ve anlamda değişiklik olmaz; ancak "if" ile birlikte kullanılacaksa "or not" mutlaka cümle sonunda yer almalıdır, hiçbir zaman "if"in hemen ardından gelmez.\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"---- the company will relocate its headquarters or not depends entirely on the outcome of tomorrow's board meeting."\n` +
    `Doğru yapı: Whether\n` +
    `Boşluk cümlenin öznesi konumundadır ve hemen ardından "or not" ifadesi gelmektedir; özne konumunda ve "or not"tan önce sadece "whether" kullanılabildiği için "if" seçeneği burada işaretlenemez.\n` +
    `[/ORNEK_SORU]\n\n` +
    `Özne Konumundaki İsim Cümleciklerinde Tekil Fiil Uyumu\n` +
    `Bir isim cümleciği -ister "that" ile, ister bir soru kelimesiyle, ister "whether" ile kurulmuş olsun- cümlenin öznesi olduğunda tek bir olgu ya da durum ifade ettiği kabul edilir; bu yüzden ana cümlenin yüklemi her zaman tekil alınır, cümleciğin içindeki özne çoğul olsa bile bu kuralı değiştirmez.\n` +
    `[STRATEJI]\n` +
    `Noun clause özne olduğunda ana fiil her zaman tekildir: "What the committee decides" tek bir birim sayılır ve "is/has/does" gibi tekil yardımcı fiillerle devam eder, "are/have/do" ile değil.\n` +
    `Cümlecik içindeki özne çoğul olsa da (the students, the results, the members) bu çoğulluk ana cümlenin fiiline yansımaz; uyum isim cümleciğinin bütününe göre yapılır.\n` +
    `Aynı kural "the fact that...", "whether..." ve "how/what/why..." ile kurulan tüm özne cümlecikleri için geçerlidir: cümlenin öznesi tek bir blok olarak değerlendirilir.\n` +
    `Seçeneklerde çoğul bir yardımcı fiil (are, have, do) ile tekil bir yardımcı fiil (is, has, does) arasında kalırsanız ve boşluktan önce bir isim cümleciği varsa, tekil olanı işaretleyin.\n` +
    `[/STRATEJI]\n\n` +
    `İsim Cümleciklerinin Mastar (Infinitive) Yapılara Kısaltılması\n` +
    `Ana cümlenin öznesi ile isim cümleciğinin öznesi aynı kişiyi gösteriyorsa, isim cümleciği kısaltılıp "soru kelimesi/whether + to V0" yapısına indirgenebilir; bu kısaltma anlamda herhangi bir kayba yol açmaz ve YDS'de hem soru kökünde hem seçeneklerde sık karşınıza çıkar.\n` +
    `[STRATEJI]\n` +
    `Kısaltmanın şartı aynı öznedir: "I don't know what I should do." → "I don't know what to do." (özne her iki cümlecikte de "I").\n` +
    `Kısaltmada "if" kullanılmaz, yerine mutlaka "whether" tercih edilir: "I can't decide whether I should go." → "I can't decide whether to go."\n` +
    `"That clause" doğrudan kısaltılamaz; ana cümlenin öznesi boş özne "it" ise ve cümlecikte farklı bir özne bildirilmek isteniyorsa "for + object + to V0" kalıbı kullanılır: "It is necessary that you arrive early." → "It is necessary for you to arrive early."\n` +
    `Soru kelimesi + isim öbeği (whose car, which way, how many tickets) kısaltmada bozulmadan kalır, yalnızca cümleciğin geri kalanı mastara döner: "Can you tell me which way I should take?" → "Can you tell me which way to take?"\n` +
    `[/STRATEJI]\n\n` +
    `Olumsuz Zarflardan Sonra Devrik Yapı (Inversion)\n` +
    `Cümle olumsuz ya da sınırlayıcı anlam taşıyan bir zarf öbeğiyle (never, rarely, seldom, little, not only, no sooner, hardly) başladığında, yardımcı fiil özne ile yer değiştirir; cümle bir soru kalıbındaymış gibi dizilir, ancak anlam soru değil vurgulu bir olumsuzlamadır.\n` +
    `[STRATEJI]\n` +
    `Never / Rarely / Seldom / Little + yardımcı fiil + özne + V0: bu zarflardan biri cümle başına geldiğinde devrik yapı zorunludur (Never have I seen such a chaotic meeting. / Little did she know that she had already been promoted.).\n` +
    `Not only + yardımcı fiil + özne + V0 ..., but (also) ...: iki eylemi bağlayan bu kalıpta devrik yapı sadece "not only" tarafında olur, "but" tarafı normal sırada kalır (Not only did the company cut costs, but it also doubled its exports.).\n` +
    `No sooner + yardımcı fiil + özne + V0 + than + S + V2: iki olayın art arda gerçekleştiğini anlatır, "no sooner" tarafı her zaman devriktir (No sooner had the plane landed than the passengers began to applaud.).\n` +
    `Cümlede zaten bir yardımcı fiil (is, has, will, can...) yoksa, Present Simple'da "does/do", Past Simple'da "did" yardımcı fiili devrik yapıyı kurmak için eklenir ve ana fiil V0 halini alır (Rarely does he complain about his workload.).\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"---- realize how much the local economy depended on tourism until the pandemic brought it to a halt."\n` +
    `Doğru yapı: Little did people\n` +
    `Cümle olumsuz anlam taşıyan "little" zarfıyla başladığı için yardımcı fiil (did) özneden önce gelmelidir; bu nedenle "people little realized" gibi düz bir sıralama değil, "little did people realize" gibi devrik bir yapı doğrudur.\n` +
    `[/ORNEK_SORU]\n\n` +
    `So/Neither/Nor, Question Tag ve Emphatic Do Yapılarında Yardımcı Fiil Kullanımı\n` +
    `İki cümle arasında benzerlik ya da doğrulama kurulurken, bir cümleye kısa bir onay eklenirken ya da bir eylem özellikle vurgulanmak istendiğinde de yardımcı fiil cümlenin standart sırasını bozarak öne çıkar; bu üç kullanım da aynı mantığı paylaşır, ana fiilin yerini bir yardımcı fiil alır ve bu yardımcı fiil öznenin önüne geçer.\n` +
    `[STRATEJI]\n` +
    `Olumlu bir cümleye "de/da öyle" anlamıyla ekleme yaparken: So + yardımcı fiil + özne (She enjoyed the seminar, and so did her colleagues.); aynı anlamı devrik yapı kurmadan "..., özne + too/as well" ile de verebilirsiniz.\n` +
    `Olumsuz bir cümleye "ne de o" anlamıyla ekleme yaparken: Neither/Nor + yardımcı fiil + özne (He hasn't finished the report, and neither has his assistant.); bu kalıpta "neither/nor" cümle sonunda kullanılmaz.\n` +
    `Question tag kurarken cümle olumluysa etiket olumsuz, cümle olumsuzsa etiket olumlu yardımcı fiille kurulur ve özne mutlaka zamire çevrilir (The results were surprising, weren't they?); ana cümle "I" öznesiyle kurulmuş bir isim cümleciği içeriyorsa, tag genelde isim cümleciğinin öznesine göre şekillenir.\n` +
    `Bir eylemi ya da karşıt bir görüşü vurgulamak için Present/Past Simple'da normalde görünmeyen do/does/did yardımcı fiili ana fiilin önüne eklenir ve ana fiil V0 haline döner (I do believe her explanation. / She did warn us about the risks.); bu yapı "gerçekten, kesinlikle" vurgusu katar, cümlenin zamanını değiştirmez.\n` +
    `[/STRATEJI]\n\n` +
    `Sonuç olarak, isim cümlecikleri ve yardımcı fiil yapıları YDS'de görünüşte iki ayrı konu gibi ele alınsa da ikisi de aynı beceriyi ölçer: cümledeki standart özne-yüklem sırasının ne zaman bozulacağını ve hangi bağlacın hangi pozisyonda kullanılabileceğini fark etmek. Boşluktan önceki cümlenin bir isim cümleciğine mi ihtiyaç duyduğunu, olumsuz bir zarfla mı başladığını, yoksa "so/neither" ile bir onaylama mı yaptığını hızla teşhis edin; bu teşhisten sonra yukarıdaki strateji kutularını bir kontrol listesi gibi uygulayarak doğru yapıya çoğu zaman cümlenin anlamını tam çözmeden de ulaşabilirsiniz.`;
  const stratejiConditionalsIntro =
    `YDS'de "If Clause" ve "Wish" yapıları, gramer sorularının önemli bir kısmını oluşturan ve genellikle tek bir kritik ipucuna (bir zaman ifadesi, yan cümlecik ile ana cümlecik arasındaki zaman uyumu ya da devrik bir dizilim) dayanan sorulardır. Bu sorularda başarı, cümlenin anlamını satır satır çözmekten çok, karşınıza çıkan yapının hangi "Type" olduğunu ilk saniyelerde tanıyıp o Type'ın izin verdiği fiil kalıplarına yönelmekten geçer.\n` +
    `Bu bölümde, gramer kitabının "Conditionals" ve "Conditionals Konu Özeti" başlıklarında verilen Type I, Type II, Type III, Mixed Type, devrik şart yapıları, "if" yerine geçen bağlaçlar ve "wish/if only" kalıplarını, sınavda doğrudan işinize yarayacak stratejiler halinde topladık.\n\n` +
    `If Clause Type I: Gerçek ve Gelecek Şart Yapıları\n` +
    `Type I, şu anda ya da gelecekte gerçekleşmesi imkansız olmayan, aksine olası kabul edilen şartları anlatır; bu yüzden "unreality" yani gerçekdışılık anlamı taşımaz.\n` +
    `Yan cümlecikte (if'in bağlı olduğu taraf) temel yapı Present Simple'dır; ancak am/is/are Ving, have/has V3, can V0, must/have to V0 gibi yapılar da bu tarafta kullanılabilir.\n` +
    `Ana cümlecikte ise will/shall V0 temel yapıdır; may/might/could V0, can V0, must/have to V0 ya da doğrudan bir emir cümlesi de sonuç tarafında yer alabilir.\n` +
    `[STRATEJI]\n` +
    `If clause tarafında will, would, shall, be going to ve olasılık bildiren may/might/could KESİNLİKLE kullanılmaz; bu taraf her zaman present bir yapıyla kurulur.\n` +
    `If, when, before, unless, as soon as, once, until, by the time gibi bir bağlaç gördüğünüzde, o bağlacın kendi cümleciğindeki "will" içeren bir seçeneği doğrudan eleyebilirsiniz.\n` +
    `If clause tarafında "should" görürseniz bu ihtimalin düşük olduğunu, "olur da" anlamı kattığını unutmayın; bu durumda ana cümlecikte emir kipi de doğal bir sonuç yapısıdır.\n` +
    `Ana cümlecikte have/has V3, was/were, had V3 gibi geçmişe ait yapılar kullanılmaz; am/is/are ise yalnızca planlı bir geleceği anlatıyorsa kabul edilir, salt tanım ya da genel bilgi cümlelerinde şart aranmaz.\n` +
    `[/STRATEJI]\n\n` +
    `If Clause Type II: Şu Anki Gerçek Dışı Durumlar ve "were" Kuralı\n` +
    `Type II, şu anki ya da gelecekteki bir durumun tam tersini varsayarak kurulan, gerçekleşme ihtimali bulunmayan ya da çok düşük olan şart cümleleridir; bu yapıda "unreality" anlamı devreye girer.\n` +
    `Kurulum mantığı, gerçeği anlatan zaman yapısını bir kademe geriye çekmektir: Present Simple yerine Past Simple, will yerine would, can yerine could, may yerine might kullanılır.\n` +
    `Yan cümlecikte özne ne olursa olsun "be" fiilinin geçmiş hali her zaman "were" şeklinde çekilir; "was" formu bu yapıda tercih edilmez.\n` +
    `[STRATEJI]\n` +
    `Yan cümlecikte "I/she/he/it were" gördüğünüzde bunu yazım hatası sanmayın; Type II'de tekil özneler dahi "were" alır.\n` +
    `Yan cümlecik Past Simple, ana cümlecik would/could/might V0 (ya da would/could/might be Ving) ise ve cümlede geçmişe ait bir zaman ifadesi yoksa doğrudan Type II düşünün.\n` +
    `Cümlede "now, today, at the moment, currently" gibi şimdiki zaman ifadeleri varken fiiller Past görünüyorsa bu bir Type II sinyalidir, gerçek bir geçmiş zaman değildir.\n` +
    `Ana cümlecikte Present Perfect, Past Perfect ya da Past Simple/Past Continuous asla doğru seçenek olmaz; sonuç tarafı daima would/could/might ailesinden bir yapıdır.\n` +
    `[/STRATEJI]\n\n` +
    `If Clause Type III: Geçmişteki Gerçek Dışı Durumlar ve "had V3"\n` +
    `Type III, geçmişte gerçekleşmiş bir olayın ya da durumun tam tersini varsayarak kurulur; anlattığı şey artık değiştirilemez, sadece "keşke böyle olsaydı" mantığıyla kurgulanmış bir geçmiştir.\n` +
    `Burada da aynı "bir kademe geriye çekme" mantığı işler: gerçek zaman olan Past Simple yerine Past Perfect (had V3), would/could/might yerine would/could/might have V3 kullanılır.\n` +
    `Type III, üç Type içinde "past" anlamı veren tek yapıdır; Type I ve Type II şimdiki zamana ya da geleceğe aittir.\n` +
    `[STRATEJI]\n` +
    `Yan cümlecikte had V3 (ya da had been Ving, could have V3), ana cümlecikte would/could/might have V3 görüyorsanız bu kalıp Type III'tür ve olay geçmişte kesinleşmiştir, artık değiştirilemez.\n` +
    `Cümlede "centuries ago, in the 1800s, back then" gibi net bir geçmiş zaman noktası varsa ve fiiller had V3/would have V3 kalıbına uyuyorsa Type III'ü seçin, diğer Type'ları eleyin.\n` +
    `Had V3 yapısı Type III dışında "I wish/if only + had V3", "as if/as though + had V3" ve "would rather + had V3" kalıplarında da görülür; bu üçlüyü Type III ile birlikte hatırlamak had V3'ü tanımayı kolaylaştırır.\n` +
    `[/STRATEJI]\n\n` +
    `Mixed Conditionals: Type III ve Type II'nin Karışık Kullanımı\n` +
    `Mixed Type, yan cümlecik ile ana cümleciğin farklı zaman dilimlerine ait olduğu durumlarda ortaya çıkar; yani şart geçmişe, sonuç şimdiye ait olabilir ya da bunun tam tersi geçerli olabilir.\n` +
    `If + Type III (had V3), ana cümlecik + Type II sonucu (would V0) kalıbı, geçmişteki bir olayın bugünkü etkisinden bahseder; cümle sonunda genellikle "now, today, at the moment" gibi bir şimdiki zaman ifadesi bulunur.\n` +
    `If + Type II (V2/were), ana cümlecik + Type III sonucu (would have V3) kalıbı ise tersini anlatır: sürekli ya da genel bir özelliğin geçmişteki bir olayı nasıl etkilediğini gösterir; bu yapıda cümle sonunda genellikle geçmişe ait bir zaman ifadesi bulunur.\n` +
    `[STRATEJI]\n` +
    `Cümle sonunda "now, today, at the moment, still" gibi bir şimdiki zaman ipucu görüp yan cümlecikte had V3 varsa, ana cümlecikte would/could/might V0 (Type II sonucu) arayın; would have V3 bu bağlamda yanlış olur.\n` +
    `Cümle sonunda geçmişe ait bir zaman ifadesi (yesterday, last night, in 2010) görüp yan cümlecikte Past Simple/were varsa, ana cümlecikte would/could/might have V3 (Type III sonucu) arayın.\n` +
    `Mixed Type'ı ayırt etmenin anahtarı her zaman cümledeki zaman ifadesidir; zaman ifadesi yoksa iki taraf da aynı Type'a ait olmalıdır, karışık bir kombinasyon aramayın.\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"Investigators believe that if the bridge's cables had been inspected more frequently, the structure ---- in better condition today."\n` +
    `Doğru yapı: would be (Type III yan cümlecik + Type II sonucu)\n` +
    `Yan cümlecikteki "had been inspected" geçmişe (Type III) işaret eder; cümle sonundaki "today" ise ana cümleciğin şimdiki zamana ait bir sonuç istediğini gösterir, bu yüzden ana cümlecikte "would have been" değil "would be" (Type II sonucu) gelmelidir.\n` +
    `[/ORNEK_SORU]\n\n` +
    `Devrik Şart Cümlecikleri: Were I..., Had she..., Should you...\n` +
    `Her üç Type de "if" bağlacı kullanılmadan, yan cümlecik devrik hale getirilerek de kurulabilir; bu yapı özellikle yazılı ve resmi İngilizcede, YDS metinlerinde sıkça karşınıza çıkar.\n` +
    `Devrik yapıda "if" düşer, yerine yardımcı fiil (should/were/had) cümle başına alınır; yan cümlecikte ya da ana cümlecikte başka hiçbir değişiklik yapılmaz.\n` +
    `[STRATEJI]\n` +
    `Type I devriği: Should + özne + V0 ile kurulur; yalnızca "should" cümle başına gelir, başka bir değişiklik yoktur.\n` +
    `Type II devriği: Were + özne (+ to V0) ile kurulur; yan cümlecikteki fiil "be" ise sadece "were" başa gelir, başka bir fiilse "were" başa gelip fiil "to V0" şeklinde eklenir.\n` +
    `Type III devriği: Had + özne + V3 ile kurulur; yalnızca "had" cümle başına gelir, ana cümlecik değişmez.\n` +
    `Devrik bir yapı gördüğünüzde önce cümle başındaki yardımcı fiile bakın (should/were/had); bu üçünden hangisiyse cümlenin Type'ını doğrudan o belirler, ayrıca bir zaman ifadesi aramanıza gerek kalmaz.\n` +
    `[/STRATEJI]\n\n` +
    `Unless, Provided That, As Long As, Only If: "If" Yerine Geçen Bağlaçlar\n` +
    `YDS'de şart anlamı yalnızca "if" ile değil, ona eşdeğer bağlaçlarla da sorulur; bu bağlaçların tümü kendi yan cümleciklerinde "if" ile aynı zaman kurallarına (will/would yasak, Type kuralları geçerli) tabidir.\n` +
    `Bu bağlaçların birbirinden farkı çoğunlukla anlam nüansındadır: kimi olumsuz şart, kimi tek bir şartı vurgulama, kimi de sürerlilik bildirir.\n` +
    `[STRATEJI]\n` +
    `Unless = if...not: olumsuz şart bildirir; "unless" ile kurulan yan cümlecik zaten olumsuz bir anlam taşıdığı için cümlenin geri kalanında ayrıca "not" aramayın, fiil olumlu haliyle kullanılır.\n` +
    `Provided (that) / providing (that) / on condition that = "koşuluyla, şartıyla": anlam ve kullanım olarak doğrudan "if" ile aynıdır, birebir yer değiştirebilir.\n` +
    `As long as / so long as = "-dığı sürece": şartın sürekliliğini vurgular; bir kere gerçekleşen değil, devam eden bir koşulu anlatır.\n` +
    `Only if = "ancak ...-sa": şartı vurgulu şekilde tekilleştirir; "only if" yan cümleciği cümle BAŞINDA kullanılırsa ana cümlecik devrik yapılır, cümle ortasında kullanılırsa devrik yapılmaz.\n` +
    `Bu bağlaçlardan biri seçenekte görüldüğünde önce cümlenin olumlu mu olumsuz mu bir şart istediğine bakın; "unless" olumsuz şart, diğerleri olumlu şart ister.\n` +
    `[/STRATEJI]\n\n` +
    `Wish / If Only Yapıları: Şimdiki, Geçmiş ve Başkasına Yönelik Dilekler\n` +
    `"Wish" ve "if only" aynı gerçekdışı (unreal) anlamı taşır; ikisi de elde olmayan ya da gerçekleşmemiş bir durumdan duyulan pişmanlığı ya da dileği anlatır. Aralarındaki fark vurgudur: "if only" daha güçlü bir pişmanlık/dilek bildirir ve yalnızca Type II ile Type III mantığında kullanılır.\n` +
    `Wish yapısını çözerken önce zamanı belirleyin: dilek şimdiki/gelecek bir durum için mi, yoksa geçmişte olup bitmiş bir durum için mi kuruluyor?\n` +
    `[STRATEJI]\n` +
    `Şimdiki/gelecek dilek (present wish): wish + özne + V2 (be fiili için were) → şu anki bir durumdan memnuniyetsizlik; wish + özne + could V0 → şu an yapamadığı bir şeyi yapabilmeyi dilemek.\n` +
    `Şimdiki dilekte özne kendi geleceğinden bahsediyorsa "would" KULLANILMAZ; wish + would V0 sadece BAŞKA bir özneye yönelik bir eleştiri/sitem içeriyorsa doğru olur (örn. "I wish you would listen" doğrudur, ama "I wish I would" hiçbir zaman doğru değildir).\n` +
    `Geçmiş dilek (past wish): wish + özne + had V3 → geçmişte olmuş bir şeyden pişmanlık; wish + özne + would have V3 / could have V3 → geçmişte yapılabilecek ama yapılmamış bir eylem için pişmanlık.\n` +
    `Seçeneklerde "would" gören ve cümledeki özne "I wish I..." şeklinde aynıysa bu seçeneği doğrudan eleyebilirsiniz; "would" her zaman farklı bir özneye yönelik sitemde kullanılır.\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"Kerem missed the last train because he left the office so late. Now he keeps saying, "I wish I ---- earlier.""\n` +
    `Doğru yapı: had left (wish + özne + had V3)\n` +
    `Cümle geçmişte olup bitmiş bir olaydan (treni kaçırmaktan) duyulan pişmanlığı anlatır; bu nedenle wish sonrasında had V3 (had left) kullanılır, present bir dilek yapısı burada anlamca yanlış olur.\n` +
    `[/ORNEK_SORU]\n\n` +
    `Sonuç olarak, "If Clause" ve "Wish" soruları, YDS'nin gramer bölümünde neredeyse her sınavda karşınıza çıkan, ama az sayıda kesin kuralla çözülebilen bir konudur. Kritik olan, önce cümlede "if" ya da "wish" yerine geçen bağlacı ya da devrik yapıyı fark etmek, ardından yan cümlecik ile ana cümlecik arasındaki zaman ilişkisini (Type I / Type II / Type III / Mixed) doğru okumaktır. Bu bölümdeki strateji kutularını bir kontrol listesi gibi kullanın: önce Type'ı belirleyin, sonra o Type'ın izin verdiği yapıları seçeneklerle karşılaştırın, izin vermediği yapıları doğrudan eleyin. "Conditionals" konusundaki kurallar bu mantıkla tekrar edildiğinde, sınavın bu bölümü ezbere değil, sistematik bir eleme yöntemiyle çözülebilir hale gelir.`;
  const stratejiConjunctionsIntro =
    `YDS'nin cloze test ve cümle tamamlama sorularında en yoğun test edilen kategorilerden biri "Conjunctions & Adverbial Clauses & Inversions" yani bağlaçlar, zarf cümlecikleri ve devrik yapılardır. Bu bölüm gramer kitabının en hacimli bölümü olmasına rağmen sorularda dönüp dolaşıp aynı mantığı test eder: aynı anlamı (zıtlık, sebep-sonuç, amaç, zaman vb.) veren birkaç farklı yapı arasından, boşluktan hemen sonra gelen kelime türüne uyan doğru yapıyı seçmek. Bu bölümde, gramer kitabının "Bağlaç, Cümle Zarfı ve Edatlar Konu Özeti" tablosunu ve devrik yapı anlatımını sınavda doğrudan işinize yarayacak strateji kutuları haline getirdik.\n` +
    `Aşağıdaki her strateji kutusu, aynı Türkçe anlamı veren yapıları (bağlaç / edat / cümle zarfı) bir arada karşılaştırır. Amacı, cümlenin tamamını çözmeden önce boşluktan sonraki dizilime bakarak seçeneklerin büyük kısmını elemenizi sağlamaktır.\n\n` +
    `Bağlaç mı, Edat mı, Cümle Zarfı mı? Yapıyı Tanımanın İlk Adımı\n` +
    `Bu bölümdeki hemen hemen her konu (zıtlık, sebep-sonuç, ekleme vb.) aynı üçlü ayrımın üzerine kuruludur; bu yüzden diğer başlıklara geçmeden önce bu üç yapı türünün cümle içindeki davranışını netleştirmek gerekir.\n` +
    `Bağlaç (conjunction) kendisinden sonra mutlaka özne ve yüklem taşıyan tam bir cümlecik alır ve iki cümleciği tek bir cümlede birleştirir.\n` +
    `Edat (preposition) kendisinden sonra bir isim öbeği, zamir ya da Ving alır; hiçbir zaman doğrudan özne+yüklem içeren bir cümlecik almaz.\n` +
    `Cümle zarfı (sentence adverb / transition word) bağımsız bir cümleyi anlamca başka bağımsız bir cümleye bağlar; ama iki cümleyi gramer olarak birleştirmez, bu yüzden önünde nokta ya da noktalı virgül, arkasında da genellikle virgül bulunur.\n` +
    `[STRATEJI]\n` +
    `Bağlaç: (Bağlaç + Özne + Yüklem), Özne + Yüklem. / Özne + Yüklem (bağlaç + Özne + Yüklem). → iki cümlecik tek cümledir.\n` +
    `Edat: (Edat + isim öbeği/zamir/Ving), Özne + Yüklem. / Özne + Yüklem (edat + isim öbeği/zamir/Ving). → cümlecik değil isim alır.\n` +
    `Cümle zarfı: Cümle1. Cümle zarfı, Cümle2. / Cümle1; cümle zarfı, Cümle2. → iki AYRI cümle, aralarında nokta ya da noktalı virgül şarttır.\n` +
    `Seçenekleri incelemeden önce boşluktan hemen sonra bir isim öbeği mi yoksa özne+yüklem içeren tam bir cümlecik mi geldiğine bakın; bu tek kontrol çoğu zaman seçeneklerin yarısını elemenize yeter.\n` +
    `[/STRATEJI]\n\n` +
    `Zıtlık Bildiren Yapılar: Although mı, Despite mı, However mı?\n` +
    `Zıtlık ilişkisi YDS'de üç ayrı yapı grubuyla verilir ve bu üç grup birbirinin yerine doğrudan kullanılamaz, çünkü her biri kendisinden sonra farklı bir gramer yapısı ister.\n` +
    `"Although / even though / though / much as / even if" bir bağlaçtır ve kendisinden sonra özne+yüklem içeren tam bir cümlecik ister.\n` +
    `"Despite / in spite of" bir edattır ve kendisinden sonra isim öbeği, zamir ya da Ving alır; "despite the fact that" ve "in spite of the fact that" şeklinde cümlecikle de devam edebilir.\n` +
    `"However / nevertheless / nonetheless / still / even so / all the same" birer cümle zarfıdır; bağımsız bir cümleyi başka bağımsız bir cümleye bağlar.\n` +
    `[STRATEJI]\n` +
    `Although / Even though / Though / Much as / Even if + Özne + Yüklem → bağlaç, tam cümlecik gerekir.\n` +
    `Despite / In spite of + isim öbeği / zamir / Ving / the fact that + Özne + Yüklem → edat.\n` +
    `However / Nevertheless / Nonetheless / Still / Even so + [nokta veya ; sonrası], Özne + Yüklem → cümle zarfı, bağımsız ikinci cümle.\n` +
    `"Though" tek başına cümle sonuna ya da iki virgül arasına da yerleşebilir; bu konumda kullanıldığında "however" ile yer değiştirebilir.\n` +
    `Boşluktan hemen sonra bir isim mi tam bir cümle mi geldiğine bakın: isim geliyorsa "despite/in spite of", tam cümlecik geliyorsa "although" grubu, cümle başında nokta/; işareti varsa "however" grubu aranmalıdır.\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"---- the sudden power outage lasted nearly six hours, the hospital's emergency generators kept every operating room running without interruption."\n` +
    `Doğru yapı: Although (bağlaç + özne + yüklem)\n` +
    `Boşluktan sonra "the sudden power outage lasted nearly six hours" özne ve yüklem içeren tam bir cümleciktir; isim öbeği isteyen "despite/in spite of" bu boşluğa giremeyeceği için cümlecik isteyen "although" doğru seçimdir.\n` +
    `[/ORNEK_SORU]\n\n` +
    `Sebep-Sonuç Bağlantısı: Because, Because Of, Therefore Üçlüsü\n` +
    `Sebep-sonuç ilişkisi de tıpkı zıtlıkta olduğu gibi üç ayrı yapı türüyle kurulur ve sınav genellikle bu üçünü karıştırmanız için tasarlanmış cümleler sunar.\n` +
    `"Because / since / as / seeing that / seeing as / inasmuch as / on the grounds that" birer bağlaçtır ve kendilerinden sonra özne+yüklem içeren tam bir cümlecik ister.\n` +
    `"Because of / due to / owing to / on account of / in view of / thanks to / as a result of" birer edattır ve kendilerinden sonra isim öbeği ya da Ving alır.\n` +
    `"Therefore / thus / hence / consequently / accordingly / as a result / as a consequence" birer cümle zarfıdır ve iki bağımsız cümleyi anlamca birbirine bağlar.\n` +
    `[STRATEJI]\n` +
    `Because / Since / As / Seeing that / Inasmuch as + Özne + Yüklem → bağlaç, tam cümlecik gerekir.\n` +
    `Because of / Due to / Owing to / On account of / Thanks to + isim öbeği / Ving → edat, cümlecik ALAMAZ.\n` +
    `Therefore / Thus / Hence / Consequently / As a result + [nokta veya ; sonrası], Özne + Yüklem → cümle zarfı, ayrı cümle.\n` +
    `"Since" bağlacının hem "çünkü" hem "o zamandan beri" (zaman) anlamı olduğunu unutmayın; cümlede net bir geçmiş zaman noktası varsa zaman anlamı, genel bir gerekçe veriliyorsa neden-sonuç anlamı öne çıkar.\n` +
    `Boşluktan sonra doğrudan bir isim öbeği (örn. "the heavy traffic") geliyorsa "because of" grubu, özne+yüklem içeren tam bir cümle (örn. "the traffic was heavy") geliyorsa "because" grubu aranmalıdır.\n` +
    `[/STRATEJI]\n\n` +
    `Amaç Bildiren Yapılar: So That, So As To, For\n` +
    `Amaç (purpose) bildiren yapılar da gramer davranışlarına göre üçe ayrılır ve cloze test sorularında sıkça bu ayrım test edilir.\n` +
    `"So that / in order that" bir bağlaçtır ve kendisinden sonra genellikle "can/could", "will/would" ya da "may/might" gibi bir modal içeren tam bir cümlecik ister.\n` +
    `"So as to / in order to" kendisinden sonra doğrudan fiilin yalın hali (V0) alır; iki cümlenin öznesi aynı olduğunda kullanılır ve olumsuzu "so as not to / in order not to" şeklindedir.\n` +
    `"For" bu bağlamda edat gibi davranır ve kendisinden sonra sadece bir isim alarak amacı belirtir.\n` +
    `[STRATEJI]\n` +
    `So that / In order that + Özne + can/could/will/would/may/might + V0 → bağlaç, modal içeren amaç cümleciği.\n` +
    `So as to / In order to + V0 → öznesi ana cümleyle aynı olan kısa amaç yapısı; olumsuzu "so as not to / in order not to" + V0.\n` +
    `For + isim → amaç bildiren edat kullanımı (örn. "for safety reasons").\n` +
    `Lest + Özne + should + V0 ve for fear that + Özne + should/might + V0 → olumsuz amaç, "...olmasın diye" anlamı.\n` +
    `Boşluktan sonra çıplak fiil (V0) geliyorsa "so as to/in order to", modal içeren tam cümlecik geliyorsa "so that/in order that" aranmalıdır.\n` +
    `[/STRATEJI]\n\n` +
    `Sonuç Cümlecikleri: So...That ile Such...That Farkı\n` +
    `"So...that" ve "such...that" aynı "o kadar...ki" anlamını taşısa da hangi kelime türünden önce geldiklerine göre kesin olarak ayrılır; bu ayrım YDS'de sıkça karşınıza çıkar.\n` +
    `"So" kendisinden sonra doğrudan bir sıfat ya da zarf alır ve devamında "that + Özne + Yüklem" cümleciği gelir.\n` +
    `"Such" kendisinden sonra bir isim öbeği alır (isim tek başına ya da sıfat+isim biçiminde olabilir) ve devamında yine "that + Özne + Yüklem" gelir.\n` +
    `[STRATEJI]\n` +
    `So + sıfat/zarf + that + Özne + Yüklem → örn. "so difficult that", "so quickly that".\n` +
    `Such + (a/an) + (sıfat) + isim + that + Özne + Yüklem → örn. "such a difficult exam that", "such heavy rain that".\n` +
    `Boşluktan hemen sonra çıplak bir sıfat/zarf mı yoksa bir isim mi geldiğine bakın: isim varsa "such", sıfat/zarf varsa "so" seçilmelidir.\n` +
    `Bu yapıyı amaç bağlacı olan "so that" ile karıştırmayın: "so that" bir amaç bildirir ve genellikle modal alır, "so...that" ise bir sonucun derecesini bildirir ve modal aramaz.\n` +
    `[/STRATEJI]\n\n` +
    `Zaman Bağlaçları: As Soon As, Once, By The Time, Until\n` +
    `Zaman bildiren bağlaçlar kendi başlarına geleceğe işaret ettikleri için, bu bağlaçların bulunduğu cümlecikte "will/would/shall/be going to" gibi gelecek zaman yapıları kullanılmaz.\n` +
    `"As soon as / once" bir eylemin biter bitmez diğerinin başladığını anlatır; kendi cümleciğinde present ya da V2, ana cümlecikte ise zamana uyumlu bir yapı bulunur.\n` +
    `"By the time" bağlacı, kendi cümleciğinde present kullanıldığında ana cümlecikte "will have V3" (future perfect), kendi cümleciğinde V2 kullanıldığında ana cümlecikte "had V3" (past perfect) gerektirir.\n` +
    `"Until / till" bir eylemin belirtilen ana kadar sürdüğünü/sürmediğini anlatır ve bu bağlacın kendi cümleciğinde de gelecek zaman yapısı kullanılmaz.\n` +
    `[STRATEJI]\n` +
    `As soon as / Once + present, ---- will + V0 (gelecekte ardışık iki olay).\n` +
    `As soon as / Once + V2, ---- V2 (geçmişte ardışık iki olay).\n` +
    `By the time + present, ---- will have V3 (ana cümlecikte).\n` +
    `By the time + V2, ---- had V3 (ana cümlecikte).\n` +
    `Until / Till + present veya V2, ama ASLA kendi cümleciğinde will/would ile birlikte kullanılmaz.\n` +
    `Bu bağlaçlardan biri gördüğünüzde, o bağlacın kendi cümleciğinde "will" içeren bir seçeneği doğrudan eleyebilirsiniz; doğru seçenek çoğunlukla diğer cümlecikte ya da bağlacın kendisinde aranır.\n` +
    `[/STRATEJI]\n\n` +
    `Paralel Yapılar: Not Only...But Also, Both...And, Either...Or, Neither...Nor\n` +
    `Bu dört yapı, birbirine bağladığı iki ögenin aynı gramer türünde (iki isim, iki sıfat, iki fiil ya da iki cümle) olmasını zorunlu kılar; bu yüzden "paralel yapı" olarak adlandırılır.\n` +
    `"Not only...but also" ve "both...and" olumlu cümlelerde kullanılır; "either...or" cümlenin olumlu ya da olumsuz olmasından etkilenmez, "neither...nor" ise kendi içinde olumsuzluk taşıdığı için cümleyi olumsuz çevirir.\n` +
    `"Both...and" tek başına iki ögeyi bağlar ve iki bağımsız cümleyi birbirine bağlayamaz; diğer üç yapı hem öge hem de cümle bağlayabilir.\n` +
    `[STRATEJI]\n` +
    `Not only + X + but (also) + Y → "sadece X değil aynı zamanda Y de"; X ve Y aynı gramer türünde olmalı.\n` +
    `Both + X + and + Y → "hem X hem de Y"; sadece öge bağlar, iki cümleyi bağlamaz.\n` +
    `Either + X + or + Y → "ya X ya da Y"; olumsuzu "neither...nor" ile karşılanır.\n` +
    `Neither + X + nor + Y → "ne X ne de Y"; kendisi olumsuzluk taşıdığı için cümle tekrar olumsuz yapılmaz.\n` +
    `Boşluktan sonraki iki ögenin gramer türünü (isim mi, sıfat mı, fiil mi) karşılaştırın; doğru seçenek her zaman bu iki ögeyi aynı türde tamamlayan yapıdır.\n` +
    `[/STRATEJI]\n\n` +
    `Devrik Yapı: Olumsuz ve Sınırlayıcı Zarflarla Başlayan Cümleler\n` +
    `"Never, rarely, seldom, hardly, scarcely, little, not only, no sooner" gibi olumsuz ya da sınırlayıcı anlam taşıyan zarflar cümle başına getirildiğinde, cümledeki özne ile yardımcı fiilin yeri değişir; buna devrik yapı (inversion) denir.\n` +
    `Devrik yapıda yardımcı fiil (do/does/did, have/has/had, be fiili ya da bir modal) özneden önce gelir; tıpkı soru cümlesindeki dizilim ortaya çıkar.\n` +
    `"No sooner...than" ve "hardly/scarcely...when" kalıpları iki olayın art arda gerçekleştiğini anlatır ve genellikle "had + Özne + V3 ... than/when + Özne + V2" biçiminde kurulur.\n` +
    `"Only after / only when / only by + Ving" gibi "only" ile başlayan zaman ya da yol bildiren ifadeler cümle başına geldiğinde de ana cümlecikte devrik yapı tetikler.\n` +
    `[STRATEJI]\n` +
    `Never / Rarely / Seldom / Little + yardımcı fiil + Özne + V0 → "hiçbir zaman/nadiren..." + devrik.\n` +
    `Not only + yardımcı fiil + Özne + V0, but (also) + Özne + Yüklem → devrik yapı sadece "not only" tarafında kurulur.\n` +
    `No sooner + had + Özne + V3 + than + Özne + V2 → "...er...mez" anlamı.\n` +
    `Hardly / Scarcely + had + Özne + V3 + when/before + Özne + V2 → "...er...mez" anlamı.\n` +
    `Only after / Only when / Only by + Ving/cümlecik + yardımcı fiil + Özne + V0 → "ancak...dığında/...dıktan sonra" + devrik.\n` +
    `Cümle başında bu zarflardan birini gördüğünüzde, hemen ardından özne değil yardımcı fiil ya da "be" fiili bekleyin; normal (devriksiz) dizilim sunan seçenekler elenebilir.\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"No sooner ---- the new tax regulation than several small business owners announced their plans to relocate abroad."\n` +
    `Doğru yapı: had the government announced (had + Özne + V3)\n` +
    `"No sooner...than" cümle başında kullanıldığında devrik yapı gerektirir ve genellikle iki ardışık geçmiş olayı "had + Özne + V3 ... than + Özne + V2" kalıbıyla bağlar; ikinci olay ("announced") V2 halinde verildiği için ilk cümlecik "had + V3" ile devrik kurulmalıdır.\n` +
    `[/ORNEK_SORU]\n\n` +
    `Sonuç olarak, bağlaçlar, zarf cümlecikleri ve devrik yapılar YDS'nin cloze test ve cümle tamamlama sorularında en sık karşınıza çıkan ve en fazla puan getiren kategorilerden biridir, çünkü bu sorular çoğunlukla cümlenin tam anlamını çözmenizi değil, boşluktan hemen sonra gelen yapının bağlaç mı, edat mı, cümle zarfı mı olduğunu ve gerekiyorsa bir devrik dizilim sinyali olup olmadığını fark etmenizi test eder. Bu bölümdeki strateji kutularını bir sözlük gibi kullanın: önce cümledeki anlam ilişkisini (zıtlık, sebep-sonuç, amaç, zaman) belirleyin, sonra boşluktan sonra gelen yapıyı (isim mi, cümlecik mi, ayrı bir cümle mi) kontrol edin, son olarak cümle başında devrik yapı tetikleyen bir zarf olup olmadığına bakın; bu üç adımı sırayla uyguladığınızda seçeneklerin çoğunu cümleyi tam çevirmeden eleyebilirsiniz.`;
  const stratejiQuantifiersIntro =
    `YDS'nin "Quantifiers" (Miktar Belirteçleri) sorularında asıl belirleyici olan, kelimenin Türkçe anlamını bilmek değil, o miktar belirtecinin hangi isim türüyle (sayılabilir çoğul mu, sayılamayan mı) ve hangi fiil çekimiyle (tekil mi, çoğul mu) bir arada kullanılabildiğini bilmektir. Bu bölümde, gramer kitabının "Quantifiers" ve "Miktar Yapılarının Özet Tablosu" başlıkları altında verilen yapı-anlam-isim türü eşleşmelerini, sınavda hızlı ve güvenli karar almanızı sağlayacak stratejiler halinde bir araya getirdik.\n` +
    `Aşağıdaki her strateji kutusu, karşınıza çıkan bir miktar belirtecini gördüğünüzde önce boşluktan hemen sonraki ismin sayılabilir mi sayılamayan mı olduğunu, ardından cümledeki yardımcı ya da ana fiilin tekil mi çoğul mu çekimlenmesi gerektiğini gösterir. Amaç, seçenekleri cümleye tek tek yerleştirip uzun uzun düşünmek yerine, bu iki kontrolü yaptığınızda doğru yapıya doğrudan ulaşabilmenizdir.\n\n` +
    `Sayılabilir ve Sayılamayan İsimlerle Kullanılan Temel Miktar Belirteçleri\n` +
    `Miktar belirteçlerini doğru seçmenin ilk adımı, boşluktan hemen sonra gelen ismin sayılabilir çoğul mu yoksa sayılamayan tekil mi olduğunu tespit etmektir. Bazı yapılar sadece çoğul isimlerle, bazıları sadece sayılamayan isimlerle, bazıları ise her ikisiyle birden kullanılabilir.\n` +
    `[STRATEJI]\n` +
    `"Many / several / a few / few / a number of / a good many / quite a few / a great many / scores of" → sadece ÇOĞUL isim.\n` +
    `"Much / a little / little / a great deal of / a large amount of / a great quantity of" → sadece SAYILAMAYAN isim.\n` +
    `"A lot of / lots of / plenty of / some / any / most / no" → hem ÇOĞUL isim hem SAYILAMAYAN isimle birlikte kullanılabilir.\n` +
    `Bu yapılardan biri kendinden sonra "of" alıp devamında "them / us / you / it" gibi bir nesne zamiri ya da "the / this / my / his" gibi bir belirteç (determiner) getirirse, artık boşluktaki değil "of"tan sonraki ismin türü belirleyicidir.\n` +
    `[/STRATEJI]\n\n` +
    `"A Few / Few" ve "A Little / Little": Aynı Azlık, Zıt Anlam\n` +
    `"A few" ve "a little" sayıca azlığı "azıcık ama yeterli" vurgusuyla anlatırken, aynı azlığı ifade eden "few" ve "little" bunu "yok denecek kadar az, yetersiz" anlamıyla anlatır; bu ince anlam farkı YDS'de cümlenin olumlu bir yeterliliği mi yoksa olumsuz bir yetersizliği mi anlattığını belirler.\n` +
    `[STRATEJI]\n` +
    `"A few + çoğul isim" → "azıcık ama yeterli" (cümleye olumlu bir çağrışım katar).\n` +
    `"Few + çoğul isim" → "neredeyse hiç, yeterli değil" (cümleye olumsuz bir çağrışım katar).\n` +
    `"A little + sayılamayan isim" → "birazcık ama yeterli" (cümleye olumlu bir çağrışım katar).\n` +
    `"Little + sayılamayan isim" → "neredeyse hiç" (cümleye olumsuz bir çağrışım katar).\n` +
    `Cümlede "but / although / despite / yet" gibi bir zıtlık bağlacı ya da başarısızlık bildiren bir sonuç varsa "few / little" yapısını, bir yeterlilik ya da başarı ifadesi varsa "a few / a little" yapısını arayın.\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"---- of the applicants had the qualifications the company was looking for, so the position remained unfilled for months."\n` +
    `Doğru yapı: Few\n` +
    `Cümledeki "remained unfilled for months" (aylarca boş kaldı) ifadesi olumsuz bir sonucu işaret eder; bu nedenle "yeterli sayıda değil, neredeyse hiç" anlamı veren "few" doğrudur; "a few" seçilseydi cümle "yeterli sayıda aday vardı" anlamına gelir ve pozisyonun aylarca boş kalmasıyla çelişirdi.\n` +
    `[/ORNEK_SORU]\n\n` +
    `"Most", "Most of the" ve "The Majority of" Kullanımı\n` +
    `"Most" yapısı bir ismin önüne doğrudan geldiğinde başına "the" almaz ve genel, tanımsız bir çoğunluğu anlatır; ancak belirli, daha önce tanımlanmış bir gruptan bahsedilecekse araya mutlaka "of the" ya da bir iyelik sıfatı girmelidir.\n` +
    `[STRATEJI]\n` +
    `"Most + çoğul isim / sayılamayan isim" (başında the YOK) → genel olarak "çoğu, pek çoğu" (belirsiz, tanımsız bir grup).\n` +
    `"Most of the / most of my / most of these + çoğul isim veya sayılamayan isim" → belirli, daha önce tanımlanmış bir gruptaki çoğunluk.\n` +
    `"The majority of + çoğul isim" yapısı da anlamca "most of the" ile örtüşür ve genellikle çoğul fiil alır; "the majority" tek başına özne olduğunda ise fiil tekil de çekimlenebilir.\n` +
    `"Most", kendisinden önce geçen bir isme gönderme yaparak tek başına zamir olarak da kullanılabilir; bu durumda ismin önüne "the" gelmez.\n` +
    `[/STRATEJI]\n\n` +
    `"All, Both, Each, Every, Either, Neither": Fiil Uyumu Farkları\n` +
    `"All" ve "both" birden fazla (both için tam olarak iki) varlığı bir bütün olarak ele alıp çoğul fiil isterken, "each" ve "every" aynı grubun üyelerini teker teker ele aldığı için her zaman tekil isim ve tekil fiil ister; bu, YDS'nin en sık sınadığı özne-fiil uyumsuzluğu tuzaklarından biridir.\n` +
    `[STRATEJI]\n` +
    `"Each / every + tekil isim" → TEKİL fiil ("every" sıfat olarak kullanılır ve asla tek başına zamir olamaz; "each" ise hem sıfat hem zamir olabilir).\n` +
    `"All / both + çoğul isim" → ÇOĞUL fiil.\n` +
    `"Either / neither + tekil isim" → TEKİL fiil; sadece iki seçenekten bahsedilirken kullanılırlar ("either" = ikisinden biri, "neither" = ikisinden hiçbiri).\n` +
    `"Every" sadece "almost / practically / nearly" zarflarıyla ve "not" ile nitelenebilir; "each" hiçbir zarfla nitelenmez ve kendinden sonra "of" da alabilir ("each of the").\n` +
    `Özne + "each" / "all" / "both" birlikte kullanıldığında (Örn: They each..., We all...), bu belirteçler cümlede yardımcı fiil varsa ondan sonra, yoksa ana fiilden önce yer alır.\n` +
    `[/STRATEJI]\n\n` +
    `"None Of" ve "Neither Of" + Çoğul İsim: Fiil Tekil mi, Çoğul mu?\n` +
    `"None of" ve "neither of" yapıları kendilerinden sonra mutlaka "the / these / my" gibi bir belirteç ya da "them / us" gibi bir nesne zamiri, ardından da çoğul bir isim ister; ancak bu iki yapının fiil çekimiyle ilgili kural, günlük konuşma alışkanlıklarından biraz farklı işler.\n` +
    `[STRATEJI]\n` +
    `"None of + çoğul isim/zamir" → fiil resmi (formal) kullanımda TEKİL, günlük kullanımda ÇOĞUL çekimlenebilir; YDS'de seçenekler arasında tekil çekim genellikle daha güvenli tercihtir.\n` +
    `"Neither of + çoğul isim/zamir" → aynı mantıkla fiil resmi kullanımda TEKİL tercih edilir.\n` +
    `"None", kendisinden önce geçen bir isme gönderme yaparak isim almadan tek başına zamir olarak kullanılabilir; buna karşılık "no" hiçbir zaman tek başına zamir olarak kullanılamaz, mutlaka bir isimle birlikte gelir.\n` +
    `"No" ile "none of" yapılarını karıştırmayın: "no" doğrudan ismin önüne gelir ("no student"), "none of" ise araya bir belirteç ya da zamir ister ("none of the students").\n` +
    `[/STRATEJI]\n\n` +
    `"A Number Of" ile "The Number Of" Arasındaki Kritik Fark\n` +
    `"A number of" ve "the number of" yazılış olarak birbirine çok benzese de anlamca ve fiil uyumu açısından tamamen farklı davranır; YDS bu iki yapıyı birbirine karıştırtacak şekilde seçeneklere sıkça yerleştirir.\n` +
    `[STRATEJI]\n` +
    `"A number of + çoğul isim" → "birçok" anlamı verir ve cümledeki fiil ÇOĞUL çekimlenir.\n` +
    `"The number of + çoğul isim" → "...in sayısı" anlamı verir; asıl özne "sayı" (the number) olduğu için cümledeki fiil TEKİL çekimlenir.\n` +
    `Cümlede bir sayının arttığından, azaldığından ya da sabit kaldığından bahsediliyorsa "the number of" yapısını, sadece kalabalık bir çoğulluktan bahsediliyorsa "a number of" yapısını tercih edin.\n` +
    `[/STRATEJI]\n` +
    `[ORNEK_SORU]\n` +
    `"---- of the students enrolled in the online course has doubled since the pandemic began."\n` +
    `Doğru yapı: The number\n` +
    `Cümledeki "has doubled" (iki katına çıktı) ifadesi tekil bir özneye bağlı yardımcı fiildir ve bir sayının zaman içindeki değişiminden söz edilmektedir; bu nedenle "öğrenci sayısı" anlamına gelen ve tekil fiil alan "the number of" yapısı doğrudur; "a number of" seçilseydi fiilin "have doubled" olması gerekirdi.\n` +
    `[/ORNEK_SORU]\n\n` +
    `Sonuç olarak, Quantifiers sorularının çözümü üç basit kontrolden geçer: boşluktan hemen sonraki ismin sayılabilir mi sayılamayan mı olduğuna bakın, cümledeki yardımcı ya da ana fiilin tekil mi çoğul mu çekimlendiğine bakın ve son olarak cümlenin anlamca bir yeterliliği mi yoksa bir yetersizliği mi anlattığına bakın. Bu bölümdeki strateji kutularını bir kontrol listesi gibi kullanıp seçenekleri bu üç süzgeçten geçirdiğinizde, "Miktar Belirteçleri" konusundaki soruların büyük çoğunluğunu hızlı ve güvenli biçimde çözebilirsiniz.`;

  function ydsStratejileriLessonDefs(def) {
    return [
      {
        title: `${def.name} – 1. Tense System`,
        durationMinutes: 25,
        contentBody: stratejiTenseSystemIntro,
      },
      {
        title: `${def.name} – 2. Modality`,
        durationMinutes: 22,
        contentBody: stratejiModalityIntro,
      },
      {
        title: `${def.name} – 3. Passive Voice & Causatives`,
        durationMinutes: 20,
        contentBody: stratejiPassiveVoiceIntro,
      },
      {
        title: `${def.name} – 4. Gerunds & Infinitives`,
        durationMinutes: 20,
        contentBody: stratejiGerundsInfinitivesIntro,
      },
      {
        title: `${def.name} – 5. Adjectives & Adverbs`,
        durationMinutes: 20,
        contentBody: stratejiAdjectivesAdverbsIntro,
      },
      {
        title: `${def.name} – 6. Adjective Clauses`,
        durationMinutes: 20,
        contentBody: stratejiAdjectiveClausesIntro,
      },
      {
        title: `${def.name} – 7. Noun Clauses & Auxiliaries`,
        durationMinutes: 20,
        contentBody: stratejiNounClausesIntro,
      },
      {
        title: `${def.name} – 8. "If" & "Wish" Clauses / Conditionals`,
        durationMinutes: 20,
        contentBody: stratejiConditionalsIntro,
      },
      {
        title: `${def.name} – 9. Conjunctions & Adverbial Clauses & Inversions`,
        durationMinutes: 24,
        contentBody: stratejiConjunctionsIntro,
      },
      {
        title: `${def.name} – 10. Quantifiers`,
        durationMinutes: 18,
        contentBody: stratejiQuantifiersIntro,
      },
    ];
  }
  // --- END: yds-stratejileri ---

  for (const [index, def] of ydsTopicDefs.entries()) {
    const topic = await db.examTopic.upsert({
      where: { examTypeId_slug: { examTypeId: examTypes.YDS.id, slug: def.slug } },
      update: { name: def.name, questionCount: def.questionCount, difficulty: def.difficulty, displayOrder: index },
      create: { examTypeId: examTypes.YDS.id, slug: def.slug, name: def.name, questionCount: def.questionCount, difficulty: def.difficulty, displayOrder: index },
    });

    const customYdsLessonDefs = {
      "kelime-phrasal-verb": [
        {
          title: `${def.name} – Konuya Giriş`,
          durationMinutes: 12,
          contentBody: phrasalVerbIntro,
        },
        {
          title: `${def.name} – Phrasal Verb Sözlüğü (1/4): A–C`,
          durationMinutes: 15,
          contentBody: phrasalVerbGlossaryEntries1.join("\n\n"),
        },
        {
          title: `${def.name} – Phrasal Verb Sözlüğü (2/4): D–H`,
          durationMinutes: 15,
          contentBody: phrasalVerbGlossaryEntries2.join("\n\n"),
        },
        {
          title: `${def.name} – Phrasal Verb Sözlüğü (3/4): I–R`,
          durationMinutes: 15,
          contentBody: phrasalVerbGlossaryEntries3.join("\n\n"),
        },
        {
          title: `${def.name} – Phrasal Verb Sözlüğü (4/4): S–Y`,
          durationMinutes: 15,
          contentBody: phrasalVerbGlossaryEntries4.join("\n\n"),
        },
        {
          title: `${def.name} – Örnek Sorular ve Çözümler`,
          durationMinutes: 12,
          contentBody: formatExamples(ydsExamples[def.slug]),
        },
      ],
      "tense-sorulari": tenseLessonDefs(def),
      "preposition-sorulari": prepositionLessonDefs(def),
      "cloze-test": clozeTestLessonDefs(def),
      "cumle-tamamlama": cumleTamamlamaLessonDefs(def),
      "ceviri": ceviriLessonDefs(def),
      "paragraf": paragrafLessonDefs(def),
      "yakin-anlamli-cumle": yakinAnlamliLessonDefs(def),
      "paragraf-tamamlama": paragrafTamamlamaLessonDefs(def),
      "anlatim-butunlugunu-bozan-cumle": anlatimButunluguLessonDefs(def),
      "diyalog-tamamlama": diyalogTamamlamaLessonDefs(def),
      "yds-stratejileri": ydsStratejileriLessonDefs(def),
    };

    const lessonDefs =
      customYdsLessonDefs[def.slug] ?? [
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
      "Örnek metin: \"---- the vaccine proved highly effective in clinical trials, public trust in it remained surprisingly low.\"\n(A) Because (B) Although (C) So that (D) In addition to\nDoğru cevap (B) 'Although' — cümlenin iki yarısı arasında bir ZITLIK vardır (etkili olmasına rağmen güvenin düşük kalması); bu nedenle yan cümlecik alan zıtlık bağlacı gerekir. 'Because' neden-sonuç, 'so that' amaç bildirir; 'in addition to' ise bir edat olup isim/Ving gerektirdiğinden devamında tam cümle geldiği bu boşlukta kullanılamaz.",
      "Örnek metin: \"Traditional farming methods rely heavily on manual labor, ---- modern agribusiness depends on automated machinery.\"\n(A) unless (B) so (C) whereas (D) despite\nDoğru cevap (C) 'whereas' — cümlenin iki tarafı arasında doğrudan bir ÖZNE ZITLIĞI (geleneksel tarım ile modern tarım) kurulmaktadır. 'Unless' koşul, 'so' sonuç bildirir; 'despite' ise isim/Ving gerektiren bir edat olduğundan devamında tam cümle geldiği bu boşlukta kullanılamaz.",
      "Örnek metin: \"The merger promised significant cost savings for the company. Employees, ----, feared widespread layoffs.\"\n(A) similarly (B) as a result (C) in addition (D) on the other hand\nDoğru cevap (D) 'on the other hand' — şirketin beklediği tasarruf ile çalışanların duyduğu kaygı arasında bir ZITLIK vardır. 'Similarly' benzerlik, 'as a result' sonuç, 'in addition' ise ekleme bildirdiğinden cümlenin anlamıyla çelişir.",
      "Örnek metin: \"Deforestation has drastically reduced the habitat available to countless species; ----, biodiversity in the region has declined sharply.\"\n(A) therefore (B) however (C) whereas (D) although\nDoğru cevap (A) 'therefore' — ormansızlaşma (neden) ile biyoçeşitlilikteki azalma (sonuç) arasında bir NEDEN-SONUÇ ilişkisi vardır; diğer seçenekler zıtlık bildirdiğinden cümlenin mantığıyla uyuşmaz.",
      "Örnek metin: \"The empire's expansion slowed considerably ---- a combination of overextended supply lines and internal political strife.\"\n(A) despite (B) due to (C) unless (D) so that\nDoğru cevap (B) 'due to' — boşluktan sonra bir isim öbeği ('a combination of...') geldiği ve bir NEDEN bildirildiği için edat olan 'due to' doğru seçenektir; 'despite' zıtlık, 'unless' koşul, 'so that' ise amaç bildirir.",
      "Örnek metin: \"---- its immense distance from Earth, the star's light takes millions of years to reach us.\"\n(A) even though (B) as long as (C) owing to (D) provided that\nDoğru cevap (C) 'owing to' — yıldızın uzaklığı ile ışığın bize ulaşma süresi arasında bir NEDEN-SONUÇ ilişkisi vardır ve boşluktan sonra isim öbeği geldiğinden edat gerekir; diğer seçenekler bağlaç olup devamında bir cümlecik ister.",
      "Örnek metin: \"Interest rates rose sharply throughout the year. ----, many small businesses struggled to secure affordable loans.\"\n(A) nonetheless (B) whereas (C) in contrast (D) consequently\nDoğru cevap (D) 'consequently' — faiz oranlarındaki artış (neden) ile kredi bulmakta yaşanan zorluk (sonuç) arasında bir NEDEN-SONUÇ ilişkisi vardır; diğer seçeneklerin tümü zıtlık bildirir.",
      "Örnek metin: \"The patient's symptoms were ---- severe that doctors immediately admitted her for further observation.\"\n(A) so (B) such (C) too (D) as\nDoğru cevap (A) 'so' — devamında bir sıfat ('severe') ve ardından 'that' cümleciği geldiği için 'so + adjective + that' kalıbı kullanılmalıdır; 'such' isim öbeği ister, 'too' bu kalıpta 'that' ile kullanılmaz, 'as' ise burada anlamca uygun değildir.",
      "Örnek metin: \"The new algorithm processes data twice as fast as its predecessor. ----, it consumes significantly less energy.\"\n(A) nevertheless (B) furthermore (C) otherwise (D) instead\nDoğru cevap (B) 'furthermore' — algoritmanın iki olumlu özelliği (hız ve düşük enerji tüketimi) art arda EKLENEREK sunulmaktadır; diğer seçenekler zıtlık veya alternatif anlamı taşıdığından uygun değildir.",
      "Örnek metin: \"The new training program has ---- improved the athletes' speed but also strengthened their endurance.\"\n(A) both (B) either (C) not only (D) whereas\nDoğru cevap (C) 'not only' — cümlenin devamında 'but also' yapısı bulunduğundan paralel yapı olan 'not only...but also' tamamlanmalıdır; 'both' yapısı 'and' ile, 'either' ise 'or' ile kullanılır.",
      "Örnek metin: \"---- offering free tuition, the scholarship program also provides a monthly stipend for living expenses.\"\n(A) although (B) unless (C) so that (D) besides\nDoğru cevap (D) 'besides' — boşluktan sonra bir Ving yapısı ('offering') geldiği ve bir EKLEME anlamı ('-nin yanı sıra') gerektiği için edat olan 'besides' doğru seçenektir.",
      "Örnek metin: \"The defendant cannot be released on bail ---- the court is convinced he poses no flight risk.\"\n(A) unless (B) although (C) so that (D) in case of\nDoğru cevap (A) 'unless' — mahkemenin ikna olmaması durumunda tahliyenin gerçekleşmeyeceği, yani olumsuz bir KOŞUL ('-medikçe') anlatılmaktadır; diğer seçenekler anlamca cümleyle örtüşmez.",
      "Örnek metin: \"The investors agreed to fund the startup ---- the founders presented a detailed five-year business plan.\"\n(A) even though (B) provided that (C) in spite of (D) as a result of\nDoğru cevap (B) 'provided that' — yatırımın gerçekleşmesi bir ŞARTA bağlanmaktadır ('şartıyla'); diğer seçenekler zıtlık veya sonuç bildirdiğinden anlamca uygun değildir.",
      "Örnek metin: \"Coral reefs can recover from bleaching events ---- ocean temperatures do not rise further in the following years.\"\n(A) despite (B) because of (C) as long as (D) in addition to\nDoğru cevap (C) 'as long as' — mercan resiflerinin iyileşmesi bir koşula bağlanmaktadır ('-dığı sürece'); diğer seçenekler bağlaç değil edat olduğundan devamında tam cümle alamaz.",
      "Örnek metin: \"Despite years of research, ---- progress has been made in fully understanding the causes of chronic fatigue syndrome.\"\n(A) few (B) many (C) a few (D) little\nDoğru cevap (D) 'little' — 'progress' sayılamayan bir isim olduğundan ve cümledeki anlam OLUMSUZ bir azlığı ('neredeyse hiç ilerleme olmaması') yansıttığından 'little' doğru seçenektir; 'few/a few' sayılabilir isimlerle, 'many' ise olumlu çoklukla kullanılır.",
      "Örnek metin: \"---- artifacts discovered at the site suggest that the settlement was far more advanced than previously believed.\"\n(A) A number of (B) The number of (C) Much (D) A great deal of\nDoğru cevap (A) 'A number of' — devamında çoğul bir isim ('artifacts') geldiği ve 'birçok' anlamı gerektiği için 'a number of' doğru seçenektir; 'the number of' '-in sayısı' anlamına gelir ve tekil fiil alır, 'much/a great deal of' ise sayılamayan isimlerle kullanılır.",
      "Örnek metin: \"---- participant in the study was asked to complete the same questionnaire under identical conditions.\"\n(A) All (B) Each (C) Most (D) Several\nDoğru cevap (B) 'Each' — devamında tekil bir isim ('participant') ve tekil bir fiil ('was asked') geldiği için 'her biri' anlamındaki 'each' doğru seçenektir; diğer seçenekler çoğul isim ve fiil gerektirir.",
      "Örnek metin: \"---- the theories proposed so far fully explains why social trust has declined in industrialized nations.\"\n(A) Most of (B) A few of (C) None of (D) Several of\nDoğru cevap (C) 'None of' — devamındaki fiil ('explains') tekil olduğundan ve cümle anlamca 'hiçbir teorinin tam bir açıklama getirmediği' fikrini verdiğinden 'hiçbiri' anlamındaki 'none of' doğru seçenektir.",
      "Örnek metin: \"The treaty was signed in early spring; ----, tensions between the two nations eased considerably.\"\n(A) meanwhile (B) instead (C) otherwise (D) subsequently\nDoğru cevap (D) 'subsequently' — antlaşmanın imzalanması ile gerilimin azalması arasında bir ZAMAN SIRASI ('daha sonra, ardından') vardır; 'meanwhile' eşzamanlılık, 'instead' alternatif, 'otherwise' ise aksi durumu bildirir.",
      "Örnek metin: \"---- talented a manager may be, without the trust of the team, long-term success is unlikely.\"\n(A) No matter how (B) Even if (C) As though (D) So that\nDoğru cevap (A) 'No matter how' — devamında bir sıfat ('talented') ve ardından bir ana cümlecik gelmesi ve 'ne kadar ... olursa olsun' anlamı gerektiği için doğru yapı budur; 'even if' devamında doğrudan bir sıfat değil tam bir cümlecik ister.",
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

  await seedDiagnosticJourney(db, examTypes);

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
