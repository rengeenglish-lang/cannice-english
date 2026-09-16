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
  for (const [index, def] of ydsTopicDefs.entries()) {
    const topic = await db.examTopic.upsert({
      where: { examTypeId_slug: { examTypeId: examTypes.YDS.id, slug: def.slug } },
      update: { name: def.name, questionCount: def.questionCount, difficulty: def.difficulty, displayOrder: index },
      create: { examTypeId: examTypes.YDS.id, slug: def.slug, name: def.name, questionCount: def.questionCount, difficulty: def.difficulty, displayOrder: index },
    });

    const lessonDefs = [
      {
        title: `${def.name} – Konuya Giriş`,
        durationMinutes: 8,
        contentBody: `Bu bölümde "${def.name}" kategorisinde YDS'de karşınıza çıkabilecek soru tiplerini ve temel çözüm stratejilerini öğreneceksiniz. Sınavda bu konudan ortalama ${def.questionCount} soru gelmektedir.`,
      },
      {
        title: `${def.name} – Örnek Sorular ve Çözümler`,
        durationMinutes: 12,
        contentBody: `Bu derste "${def.name}" ile ilgili örnek sorular üzerinden adım adım çözüm tekniklerini uygulamalı olarak inceleyeceğiz.`,
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
  for (const [index, def] of pteTopicDefs.entries()) {
    const meta = pteTopicMeta[def.slug];
    const topic = await db.examTopic.upsert({
      where: { examTypeId_slug: { examTypeId: examTypes.PTE.id, slug: def.slug } },
      update: { name: def.name, description: def.description, questionCount: def.questionCount, displayOrder: index, ...meta },
      create: { examTypeId: examTypes.PTE.id, slug: def.slug, name: def.name, description: def.description, questionCount: def.questionCount, displayOrder: index, ...meta },
    });

    for (const [lessonIndex, lessonDef] of def.lessons.entries()) {
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
  for (const [index, def] of toeflTopicDefs.entries()) {
    const meta = toeflTopicMeta[def.slug];
    const topic = await db.examTopic.upsert({
      where: { examTypeId_slug: { examTypeId: examTypes.TOEFL.id, slug: def.slug } },
      update: { name: def.name, description: def.description, questionCount: def.questionCount, displayOrder: index, ...meta },
      create: { examTypeId: examTypes.TOEFL.id, slug: def.slug, name: def.name, description: def.description, questionCount: def.questionCount, displayOrder: index, ...meta },
    });

    for (const [lessonIndex, lessonDef] of def.lessons.entries()) {
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
  for (const [index, def] of ieltsTopicDefs.entries()) {
    const meta = ieltsTopicMeta[def.slug];
    const topic = await db.examTopic.upsert({
      where: { examTypeId_slug: { examTypeId: examTypes.IELTS.id, slug: def.slug } },
      update: { name: def.name, description: def.description, questionCount: def.questionCount, displayOrder: index, ...meta },
      create: { examTypeId: examTypes.IELTS.id, slug: def.slug, name: def.name, description: def.description, questionCount: def.questionCount, displayOrder: index, ...meta },
    });

    for (const [lessonIndex, lessonDef] of def.lessons.entries()) {
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
