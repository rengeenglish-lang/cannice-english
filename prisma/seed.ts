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
    { slug: "kelime-phrasal-verb", name: "Kelime – Phrasal Verb Soruları", questionCount: 6 },
    { slug: "tense-preposition-dilbilgisi", name: "Tense – Preposition – Dilbilgisi Soruları", questionCount: 10 },
    { slug: "cloze-test", name: "Cloze Test Soruları", questionCount: 10 },
    { slug: "cumle-tamamlama", name: "Cümle Tamamlama Soruları", questionCount: 10 },
    { slug: "ceviri", name: "Çeviri Soruları", questionCount: 6 },
    { slug: "paragraf", name: "Paragraf Soruları", questionCount: 20 },
    { slug: "diyalog-tamamlama", name: "Diyalog Tamamlama Soruları", questionCount: 5 },
    { slug: "yakin-anlamli-cumle", name: "Yakın Anlamlı Cümle Soruları", questionCount: 4 },
    { slug: "paragraf-tamamlama", name: "Paragraf Tamamlama Soruları", questionCount: 4 },
    { slug: "anlatim-butunlugunu-bozan-cumle", name: "Anlatım Bütünlüğünü Bozan Cümle Soruları", questionCount: 5 },
  ];
  for (const [index, def] of ydsTopicDefs.entries()) {
    const topic = await db.examTopic.upsert({
      where: { examTypeId_slug: { examTypeId: examTypes.YDS.id, slug: def.slug } },
      update: { name: def.name, questionCount: def.questionCount, displayOrder: index },
      create: { examTypeId: examTypes.YDS.id, slug: def.slug, name: def.name, questionCount: def.questionCount, displayOrder: index },
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
