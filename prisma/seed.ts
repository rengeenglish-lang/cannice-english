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
        "Bu soru tipinde kısa bir akademik metin okur ve metinle ilgili çoktan seçmeli bir soruyu, verilen seçeneklerden YALNIZCA birini işaretleyerek cevaplarsınız. Metni anlama ve çıkarım yapma becerinizi ölçer.\n\nHazırlık İpucu: Önce soruyu okuyup ne arandığını belirleyin, sonra metni o soruya odaklanarak tarayın. Bu soru tipinde yanlış cevap için puan kırılmaz, bu yüzden emin olmasanız bile mutlaka bir seçenek işaretleyin.",
      lessons: [
        { title: "Görev Tanımı ve Puanlama", durationMinutes: 6, contentBody: "Ekranda kısa bir paragraf ve altında 3-5 seçenekli bir soru bulunur; doğru seçeneği tek bir radyo düğmesiyle işaretlersiniz. Doğru cevap tam puan, yanlış cevap sıfır puan getirir — negatif puanlama yoktur, bu yüzden boş bırakmak yerine her zaman bir tahminde bulunun." },
      ],
    },
    {
      slug: "reading-mcq-multiple",
      name: "Multiple-choice (Çoklu Cevap)",
      questionCount: 3,
      description:
        "Bu soru tipinde bir metinle ilgili sorunun BİRDEN FAZLA doğru cevabı olabilir; doğru gördüğünüz TÜM seçenekleri işaretlemeniz gerekir. Reading bölümünde negatif puanlamanın uygulandığı tek soru tipidir.\n\nHazırlık İpucu: Her seçeneği metinle tek tek karşılaştırın ve yalnızca metinde açıkça desteklenen seçenekleri işaretleyin. Emin olmadığınız seçenekleri işaretlememek, yanlış tahminle puan kaybetmekten daha güvenlidir.",
      lessons: [
        { title: "Görev Tanımı ve Puanlama", durationMinutes: 6, contentBody: "Ekranda bir metin ve altında birden fazla doğru cevabı olabilecek, kutucuklu (checkbox) bir soru bulunur. Doğru işaretlenen her seçenek +1, yanlış işaretlenen her seçenek -1 puan getirir (toplam puan en az sıfırdır); bu yüzden metinde açıkça geçmeyen veya metinle çelişen seçenekleri asla işaretlemeyin." },
      ],
    },
    {
      slug: "reading-reorder-paragraphs",
      name: "Re-order Paragraphs",
      questionCount: 3,
      description:
        "Bu soru tipinde birbirine karışmış halde verilen metin parçalarını (genellikle 4-6 cümle/paragraf), sürükle-bırak yöntemiyle mantıklı ve akıcı bir sıraya koymanız istenir. Metin bütünlüğü ve bağlaç kullanımını anlama becerinizi ölçer.\n\nHazırlık İpucu: Önce 'konu cümlesini' (genel bir ifade içeren, başka bir cümleye referans vermeyen paragrafı) bulun — bu genellikle ilk sıradadır. Ardından 'this', 'these', 'however', 'therefore' gibi bağlaç ve zamirleri takip ederek hangi cümlenin hangisinden sonra geldiğini belirleyin.",
      lessons: [
        { title: "Görev Tanımı ve Puanlama", durationMinutes: 6, contentBody: "Ekranın solunda karışık sırada paragraflar, sağında ise boş bir sıralama alanı bulunur; paragrafları doğru sıraya göre sağ tarafa sürüklersiniz. Puanlama, doğru sıralanan her 'ardışık çift' için verilir — tamamını mükemmel sıralayamasanız bile bazı çiftleri doğru yaparsanız kısmi puan alırsınız, bu yüzden emin olduğunuz çiftleri önce yerleştirin." },
      ],
    },
    {
      slug: "reading-fill-in-blanks",
      name: "Fill in the Blanks",
      questionCount: 5,
      description:
        "Bu soru tipinde bir metin içindeki birkaç boşluğa, ekranın üst kısmında verilen kelime havuzundan sürükle-bırak yöntemiyle uygun kelimeyi yerleştirmeniz istenir. Dilbilgisi ve kelime bilgisini bağlam içinde ölçer.\n\nHazırlık İpucu: Önce metnin tamamını hızlıca okuyarak genel anlamı kavrayın, sonra her boşluğu tek tek doldurun. Boşluğun etrafındaki kelimelere (edatlar, fiil çekimleri, eş dizim kalıpları) dikkat edin; çoğu zaman doğru cevap dilbilgisel uyuma bakılarak bulunabilir.",
      lessons: [
        { title: "Görev Tanımı ve Puanlama", durationMinutes: 6, contentBody: "Metindeki her boşluk için ekranın üst kısmında sürüklenebilir kelime seçenekleri bulunur; her kelime yalnızca bir kez kullanılabilir. Doğru yerleştirilen her kelime için 1 puan, yanlış yerleştirilen için 0 puan alırsınız (negatif puanlama yoktur); emin olmadığınız boşluklarda bile en mantıklı seçeneği yerleştirin." },
      ],
    },
    {
      slug: "reading-writing-fill-in-blanks",
      name: "Fill in the Blanks (Okuma-Yazma)",
      questionCount: 6,
      description:
        "Bu soru tipi, Reading: Fill in the Blanks'e benzer ancak kelime havuzu yerine her boşluk için ayrı bir AÇILIR MENÜ (dropdown) sunulur ve seçenekler genellikle birbirine anlamca veya biçimce çok yakın kelimelerden oluşur. Hem okuma hem yazma/dilbilgisi becerisini ölçer.\n\nHazırlık İpucu: Her açılır menüdeki seçenekleri dikkatle karşılaştırın — genellikle aynı kelimenin farklı biçimleri veya birbirine yakın anlamlı kelimeler arasından seçim yaparsınız. Cümlenin gramer yapısına (zaman, özne-yüklem uyumu) odaklanmak doğru seçeneği bulmanın en hızlı yoludur.",
      lessons: [
        { title: "Görev Tanımı ve Puanlama", durationMinutes: 6, contentBody: "Metindeki her boşluğun yanında küçük bir açılır menü ikonu bulunur; tıkladığınızda 3-4 seçenek arasından birini seçersiniz. Bu soru tipi sınavda genellikle en fazla boşluk içeren (5-6) sorulardan biridir ve her doğru seçim ayrı ayrı puanlanır." },
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
        "Kısa bir ses kaydı dinletildikten sonra, birden fazla doğru cevabı olabilecek bir soru sorulur; doğru gördüğünüz tüm seçenekleri işaretlemeniz gerekir. Listening bölümünde negatif puanlamanın uygulandığı iki soru tipinden biridir.\n\nHazırlık İpucu: Kaydı dinlerken seçeneklerle örtüşen bilgileri not alın. Sadece kayıtta açıkça belirtilen seçenekleri işaretleyin; kayıtta geçmeyen veya çelişen seçenekleri işaretlemek -1 puan getirir.",
      lessons: [
        { title: "Görev Tanımı ve Puanlama", durationMinutes: 6, contentBody: "Kısa bir ses kaydı dinletilir, ardından ekranda birden fazla doğru cevabı olabilecek kutucuklu bir soru belirir. Doğru işaretlenen her seçenek +1, yanlış işaretlenen her seçenek -1 puan getirir; bu yüzden yalnızca kayıtta net şekilde desteklenen seçenekleri işaretlemek en güvenli stratejidir." },
      ],
    },
    {
      slug: "listening-fill-in-blanks",
      name: "Fill in the Blanks",
      questionCount: 3,
      description:
        "Bir ses kaydı dinlerken, ekranda kaydın yazıya dökülmüş hali (transkript) belirir ve bu transkriptteki bazı kelimeler eksiktir. Dinlediğiniz kelimeleri doğru yazarak boşlukları doldurmanız gerekir.\n\nHazırlık İpucu: Kaydı dinlerken transkripti takip edin ve duyduğunuz kelimeyi anında yazın — kaydı durdurma veya geri sarma imkanınız yoktur. Kelimeleri doğru yazmak (imla) önemlidir, bu yüzden düzenli dikte pratiği yapmak bu bölüm için çok faydalıdır.",
      lessons: [
        { title: "Görev Tanımı ve Puanlama", durationMinutes: 6, contentBody: "Ekranda kaydın metni belirir, bazı kelimeler boş bırakılmıştır; kayıt çalarken bu boşluklara doğru kelimeyi yazarsınız. Doğru yazılan her kelime için 1 puan alırsınız (negatif puanlama yoktur); imla hatası olan cevaplar yanlış sayılır, bu yüzden yaygın akademik kelimelerin yazımını tekrar etmek önemlidir." },
      ],
    },
    {
      slug: "listening-highlight-correct-summary",
      name: "Highlight Correct Summary",
      questionCount: 3,
      description:
        "Bir ses kaydı dinlettikten sonra, ekranda kaydı özetleyen birkaç paragraf seçeneği sunulur; bunlardan kaydı EN DOĞRU şekilde özetleyen paragrafı seçmeniz istenir. Genel anlama ve özetleme becerinizi ölçer.\n\nHazırlık İpucu: Kaydı dinlerken ana fikri not alın, ardından her seçenek paragrafı bu ana fikirle karşılaştırın. Yanıltıcı seçenekler genellikle doğru ayrıntıları yanlış bir sonuçla birleştirir; her paragrafı kaydın gerçek mesajıyla karşılaştırarak okuyun.",
      lessons: [
        { title: "Görev Tanımı ve Puanlama", durationMinutes: 6, contentBody: "Kayıt dinletildikten sonra ekranda 3-5 paragraf seçeneği belirir; kaydı en iyi özetleyen TEK paragrafı seçersiniz. Doğru cevap tam puan, yanlış cevap sıfır puan getirir — negatif puanlama yoktur, bu yüzden emin olmasanız bile en olası seçeneği işaretleyin." },
      ],
    },
    {
      slug: "listening-mcq-single",
      name: "Multiple-choice (Tek Cevap)",
      questionCount: 3,
      description:
        "Bir ses kaydı dinlettikten sonra, kayıtla ilgili bir soru sorulur ve verilen seçeneklerden yalnızca BİRİNİ işaretlemeniz istenir. Kaydı genel olarak anlama ve detay yakalama becerinizi ölçer.\n\nHazırlık İpucu: Soruyu dinlemeden önce ekranda görünen seçeneklere göz atarak neye odaklanmanız gerektiğini tahmin edin. Genellikle doğru cevap kayıtta geçen ifadenin eş anlamlısı şeklinde sunulur, birebir aynı kelimeler aranmaz.",
      lessons: [
        { title: "Görev Tanımı ve Puanlama", durationMinutes: 6, contentBody: "Kısa bir ses kaydı dinletilir, ardından 3-5 seçenekli bir soru belirir ve yalnızca bir seçeneği işaretlersiniz. Doğru cevap tam puan, yanlış cevap sıfır puan getirir; negatif puanlama olmadığı için her zaman bir seçenek işaretlemelisiniz." },
      ],
    },
    {
      slug: "listening-select-missing-word",
      name: "Select Missing Word",
      questionCount: 3,
      description:
        "Bu soru tipinde bir ses kaydı dinletilir, ancak kaydın SON kelimesi veya son birkaç kelimesi bir 'bip' sesiyle değiştirilmiştir. Kaydın bağlamına göre, o son kısımda ne söylenmiş olabileceğini seçenekler arasından bulmanız istenir.\n\nHazırlık İpucu: Kaydın son cümlesine ve genel bağlamına özellikle dikkat edin; cevabı bulmak için kaydın tamamının anlamını kavramış olmanız gerekir. Seçenekler genellikle dilbilgisel olarak doğru ama anlamca yanlış olacak şekilde tasarlanır.",
      lessons: [
        { title: "Görev Tanımı ve Puanlama", durationMinutes: 6, contentBody: "Kayıt normal şekilde başlar ancak son kelime(ler) bir bip sesiyle kapatılır; ardından 3-4 seçenek arasından kaydın bağlamına en uygun tamamlayıcıyı seçersiniz. Doğru cevap tam puan, yanlış cevap sıfır puan getirir; negatif puanlama yoktur." },
      ],
    },
    {
      slug: "listening-highlight-incorrect-words",
      name: "Highlight Incorrect Words",
      questionCount: 3,
      description:
        "Bir ses kaydı dinlerken, ekranda kaydın yazıya dökülmüş hali belirir; ancak bu transkriptte kayıtta söylenenle UYUŞMAYAN bazı kelimeler bulunur. Bu farklı kelimeleri tıklayarak işaretlemeniz istenir. Listening bölümünde negatif puanlamanın uygulandığı ikinci soru tipidir.\n\nHazırlık İpucu: Transkripti kayıtla eş zamanlı, kelime kelime takip edin; duyduğunuz kelime ile ekrandaki kelime uyuşmadığı anda tıklayın. Emin olmadığınız kelimeleri işaretlememek daha güvenlidir, çünkü yanlış işaretlenen her doğru kelime -1 puan getirir.",
      lessons: [
        { title: "Görev Tanımı ve Puanlama", durationMinutes: 6, contentBody: "Ekranda kaydın metni belirir; kayıt çalarken metindeki bazı kelimeler aslında kayıtta söylenenden farklıdır ve bu kelimeleri fare ile tıklayarak seçmeniz gerekir. Doğru işaretlenen her farklı kelime +1, yanlış işaretlenen (aslında doğru olan) her kelime -1 puan getirir." },
      ],
    },
    {
      slug: "listening-write-from-dictation",
      name: "Write from Dictation",
      questionCount: 4,
      description:
        "Listening bölümünün son ve en kısa soru tipidir. Kısa bir cümle bir kez dinletilir; duyduğunuz cümleyi harfi harfine, doğru yazımla yazmanız istenir.\n\nHazırlık İpucu: Cümleyi dinlerken zihninizde tekrar edin ve hemen ardından yazmaya başlayın — kaydı tekrar dinleme imkanınız yoktur. Büyük harf, noktalama ve yaygın kelimelerin doğru yazımına dikkat edin; bu soru tipi aynı zamanda dilbilgisi ve yazım puanınıza da katkı sağlar.",
      lessons: [
        { title: "Görev Tanımı ve Puanlama", durationMinutes: 6, contentBody: "Kısa bir cümle (genellikle 5-10 kelime) bir kez dinletilir, ardından boş bir metin kutusuna duyduğunuz cümleyi yazarsınız. Doğru yazılan her kelime için 1 puan alırsınız; kelime sırası ve imla önemlidir, bu yüzden düzenli dikte alıştırması yapmak bu soru tipi için en etkili hazırlık yöntemidir." },
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
