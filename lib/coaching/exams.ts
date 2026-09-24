/**
 * Exam rules for Ücretsiz Öğrenci Koçluğu — the single place to update when an exam changes.
 *
 * Every pathway lists its versions, its own scoring scale, the skills it assesses and its task /
 * question types, plus which existing cannice-english content covers each type. Formats were
 * checked against the official sources in `sources` on `verifiedOn`; re-check them there before
 * changing anything. Coverage is only a list of candidate slugs — the catalog service confirms at
 * runtime that the lesson or practice topic really exists before a plan links to it, so a missing
 * lesson shows up as a gap instead of a dead link.
 */

export type CoachingPathwayCode = "IELTS" | "TOEFL" | "PTE" | "YDS" | "YOKDIL" | "YDT";
export type SkillKey = "reading" | "listening" | "writing" | "speaking" | "vocabulary" | "grammar" | "translation" | "time";

export type ScoreScale = {
  min: number;
  max: number;
  step: number;
  /** Short label for the scale, e.g. "Band (0–9)". */
  label: { tr: string; en: string };
};

export type TaskType = {
  key: string;
  skill: SkillKey;
  name: string;
  /** Konu Anlatımı topic slugs (ExamTopic) that teach this type, tried in order. */
  lessonSlugs?: string[];
  /** Pratik Bankası topic slugs (DiagnosticTopic) with questions of this type. */
  practiceSlugs?: string[];
  /** Other existing site tool for this type (e.g. the speaking simulator). */
  toolHref?: string;
  /** Self-study guidance used when no site content exists (the "gap" task). */
  selfStudy: { tr: string; en: string };
  minutes: number;
};

export type ExamVersion = { key: string; name: { tr: string; en: string }; contentExamSlug: string | null };

export type PathwayConfig = {
  code: CoachingPathwayCode;
  name: string;
  versions: ExamVersion[];
  overall: ScoreScale;
  /** Per-skill targets the exam reports (empty for single-score exams). */
  skillScores: { skill: SkillKey; scale: ScoreScale }[];
  skills: SkillKey[];
  taskTypes: TaskType[];
  /** Full-length mock on the site (minutes) — null when the site has none for this exam. */
  siteMock: { minutes: number; note: { tr: string; en: string } } | null;
  /** Rule to turn a raw practice result into an estimate on the exam's scale, when an official formula exists. */
  estimate?: { kind: "LINEAR"; perCorrect: number; totalQuestions: number; note: { tr: string; en: string } };
  /** CEFR alignment of target scores, when the exam publishes one. */
  cefrForScore?: (score: number) => string | null;
  sources: { label: string; url: string }[];
  verifiedOn: string;
  contentNote?: { tr: string; en: string };
};

const band = (min: number, max: number, step: number, tr: string, en: string): ScoreScale => ({ min, max, step, label: { tr, en } });
const ielts = band(0, 9, 0.5, "Band (0–9)", "Band (0–9)");
const toefl = band(1, 6, 0.5, "Band (1–6)", "Band (1–6)");
const pte = band(10, 90, 1, "Puan (10–90)", "Score (10–90)");
const osym = band(0, 100, 0.25, "Puan (0–100)", "Score (0–100)");

const self = (tr: string, en: string) => ({ tr, en });

/** YDS / e-YDS / YÖKDİL / YDT share most question types; site slugs differ between YDS and the YÖKDİL branches. */
function osymTypes(opts: { dialogue: boolean; restatement: boolean; situation?: boolean }): TaskType[] {
  const types: TaskType[] = [
    { key: "vocabulary", skill: "vocabulary", name: "Kelime ve phrasal verb", lessonSlugs: ["kelime-phrasal-verb", "kelime-bilgisi"], practiceSlugs: ["kelime-bilgisi"], selfStudy: self("20 yeni kelimeyi örnek cümleleriyle çalış ve kelime kartlarına ekle.", "Study 20 new words with example sentences and add them to your cards."), minutes: 20 },
    { key: "tenses", skill: "grammar", name: "Zamanlar (Tenses)", lessonSlugs: ["tense-sorulari", "tense-system"], practiceSlugs: ["zamanlar"], selfStudy: self("Zaman uyumu kurallarını tekrar et, 10 boşluk doldurma sorusu çöz.", "Review tense agreement and solve 10 gap-fill questions."), minutes: 20 },
    { key: "passive", skill: "grammar", name: "Edilgen yapı", lessonSlugs: ["passive-voice-causatives"], practiceSlugs: ["edilgen-cati"], selfStudy: self("Edilgen ve ettirgen yapıları tekrar et.", "Review passive and causative structures."), minutes: 20 },
    { key: "modals", skill: "grammar", name: "Modal fiiller", lessonSlugs: ["modality"], practiceSlugs: ["modal-fiiller"], selfStudy: self("Modal fiillerin anlam farklarını tekrar et.", "Review the meanings of modal verbs."), minutes: 20 },
    { key: "clauses", skill: "grammar", name: "Sıfat ve isim cümlecikleri", lessonSlugs: ["adjective-clauses", "noun-clauses-auxiliaries"], practiceSlugs: ["sifat-cumlecikleri"], selfStudy: self("Relative clause ve noun clause yapılarını tekrar et.", "Review relative and noun clauses."), minutes: 20 },
    { key: "conditionals", skill: "grammar", name: "Koşul cümleleri", lessonSlugs: ["conditionals"], practiceSlugs: ["kosul-cumleleri"], selfStudy: self("Koşul cümlesi tiplerini örneklerle tekrar et.", "Review conditional types with examples."), minutes: 20 },
    { key: "gerunds", skill: "grammar", name: "Ulaç ve mastar", lessonSlugs: ["gerunds-infinitives"], practiceSlugs: ["ulac-mastar"], selfStudy: self("Gerund / infinitive alan fiilleri tekrar et.", "Review verbs followed by gerunds or infinitives."), minutes: 20 },
    { key: "conjunctions", skill: "grammar", name: "Bağlaçlar ve zarf cümlecikleri", lessonSlugs: ["conjunctions-adverbial-clauses"], practiceSlugs: ["baglaclar"], selfStudy: self("Bağlaçları anlam gruplarına göre tekrar et.", "Review conjunctions by meaning group."), minutes: 20 },
    { key: "prepositions", skill: "grammar", name: "Edatlar (prepositions)", lessonSlugs: ["preposition-sorulari"], selfStudy: self("Sık çıkan edat kalıplarından 20 tanesini tekrar et.", "Review 20 frequent preposition patterns."), minutes: 15 },
    { key: "cloze", skill: "grammar", name: "Cloze test", lessonSlugs: ["cloze-test"], practiceSlugs: ["cloze-test"], selfStudy: self("Bir cloze test paragrafı çöz ve her boşluğun gerekçesini yaz.", "Solve one cloze passage and justify each gap."), minutes: 20 },
    { key: "sentence-completion", skill: "grammar", name: "Cümle tamamlama", lessonSlugs: ["cumle-tamamlama"], practiceSlugs: ["cumle-tamamlama"], selfStudy: self("10 cümle tamamlama sorusu çöz.", "Solve 10 sentence-completion questions."), minutes: 20 },
    { key: "translation", skill: "translation", name: "Çeviri (EN↔TR)", lessonSlugs: ["ceviri"], practiceSlugs: ["ceviri-en-tr", "ceviri-tr-en"], selfStudy: self("5 akademik cümleyi iki yönde çevir ve seçeneklerle karşılaştır.", "Translate 5 academic sentences both ways and compare."), minutes: 20 },
    { key: "reading", skill: "reading", name: "Paragraf / okuma", lessonSlugs: ["paragraf", "paragraf-okuma-anlama"], practiceSlugs: ["okuma"], selfStudy: self("Bir akademik paragraf oku; ana fikri ve 3 soruyu cevapla.", "Read an academic passage; answer the main idea and 3 questions."), minutes: 25 },
    { key: "paragraph-completion", skill: "reading", name: "Paragraf tamamlama", lessonSlugs: ["paragraf-tamamlama"], practiceSlugs: ["paragraf-tamamlama"], selfStudy: self("5 paragraf tamamlama sorusu çöz.", "Solve 5 paragraph-completion questions."), minutes: 20 },
    { key: "irrelevant-sentence", skill: "reading", name: "Anlam bütünlüğünü bozan cümle", lessonSlugs: ["anlatim-butunlugunu-bozan-cumle", "anlam-butunlugunu-bozan-cumle"], selfStudy: self("5 anlam bütünlüğü sorusu çöz.", "Solve 5 irrelevant-sentence questions."), minutes: 15 },
    { key: "strategy", skill: "time", name: "Süre yönetimi ve strateji", lessonSlugs: ["yds-stratejileri", "yokdil-fen-stratejileri", "yokdil-saglik-stratejileri", "yokdil-sosyal-stratejileri"], selfStudy: self("20 soruluk bir seti süre tutarak çöz; soru başına süreni not al.", "Solve a 20-question set with a timer and note time per question."), minutes: 30 },
  ];
  if (opts.dialogue) types.push({ key: "dialogue", skill: "reading", name: "Diyalog tamamlama", lessonSlugs: ["diyalog-tamamlama"], selfStudy: self("5 diyalog tamamlama sorusu çöz.", "Solve 5 dialogue-completion questions."), minutes: 15 });
  if (opts.restatement) types.push({ key: "restatement", skill: "reading", name: "Anlamca en yakın cümle", lessonSlugs: ["yakin-anlamli-cumle"], practiceSlugs: ["anlamda-en-yakin-cumle"], selfStudy: self("5 yakın anlam sorusu çöz.", "Solve 5 restatement questions."), minutes: 15 });
  if (opts.situation) types.push({ key: "situation", skill: "reading", name: "Durum (situation) soruları", selfStudy: self("5 durum sorusu çöz; her seçeneğin bağlama uygunluğunu tartış.", "Solve 5 situation questions and check each option against the context."), minutes: 15 });
  return types;
}

const OSYM_LINEAR = {
  kind: "LINEAR" as const,
  perCorrect: 1.25,
  totalQuestions: 80,
  note: self("ÖSYM kuralı: 80 soru, her doğru 1,25 puan, yanlışlar doğruyu götürmez. Deneme sonucundan hesaplanan puan tahminidir, resmî sonuç değildir.", "ÖSYM rule: 80 questions, 1.25 points per correct answer, no penalty. A score from a practice test is an estimate, not an official result."),
};

export const PATHWAYS: Record<CoachingPathwayCode, PathwayConfig> = {
  IELTS: {
    code: "IELTS",
    name: "IELTS",
    versions: [
      { key: "ACADEMIC", name: self("IELTS Academic", "IELTS Academic"), contentExamSlug: "ielts" },
      { key: "GENERAL", name: self("IELTS General Training", "IELTS General Training"), contentExamSlug: "ielts" },
    ],
    overall: ielts,
    skillScores: (["listening", "reading", "writing", "speaking"] as const).map((skill) => ({ skill, scale: ielts })),
    skills: ["reading", "listening", "writing", "speaking", "vocabulary", "grammar", "time"],
    taskTypes: [
      { key: "r-tfng", skill: "reading", name: "True / False / Not Given", lessonSlugs: ["ielts-reading-true-false-not-given"], practiceSlugs: ["ielts-reading-tfng"], selfStudy: self("Bir okuma metninde 10 TFNG sorusu çöz.", "Solve 10 TFNG questions on one passage."), minutes: 20 },
      { key: "r-ynng", skill: "reading", name: "Yes / No / Not Given", lessonSlugs: ["ielts-reading-yes-no-not-given"], selfStudy: self("Yazarın görüşünü soran 8 YNNG sorusu çöz.", "Solve 8 YNNG questions on the writer's views."), minutes: 20 },
      { key: "r-headings", skill: "reading", name: "Matching Headings", lessonSlugs: ["ielts-reading-matching-headings"], practiceSlugs: ["ielts-reading-matching-headings"], selfStudy: self("Paragraf başlığı eşleştirme alıştırması yap.", "Practise matching headings."), minutes: 20 },
      { key: "r-mcq", skill: "reading", name: "Multiple Choice", lessonSlugs: ["ielts-reading-multiple-choice"], practiceSlugs: ["ielts-reading-mcq"], selfStudy: self("10 çoktan seçmeli okuma sorusu çöz.", "Solve 10 reading multiple-choice questions."), minutes: 20 },
      { key: "r-completion", skill: "reading", name: "Sentence / Summary / Table Completion", lessonSlugs: ["ielts-reading-sentence-summary-table-completion"], practiceSlugs: ["ielts-reading-completion"], selfStudy: self("Özet ve tablo tamamlama alıştırması yap.", "Practise summary and table completion."), minutes: 20 },
      { key: "r-matching", skill: "reading", name: "Matching Information / Features / Endings", lessonSlugs: ["ielts-reading-matching-info-features-endings"], selfStudy: self("Bilgi eşleştirme sorularında anahtar kelime avı yap.", "Practise matching information with keyword scanning."), minutes: 20 },
      { key: "r-diagram", skill: "reading", name: "Diagram Label Completion", lessonSlugs: ["ielts-reading-diagram-label"], selfStudy: self("Diyagram etiketleme alıştırması yap.", "Practise diagram labelling."), minutes: 15 },
      { key: "r-short", skill: "reading", name: "Short-Answer Questions", lessonSlugs: ["ielts-reading-short-answer"], selfStudy: self("Kelime sınırına dikkat ederek kısa cevaplı sorular çöz.", "Solve short-answer questions within the word limit."), minutes: 15 },
      { key: "l-mcq", skill: "listening", name: "Listening Multiple Choice", lessonSlugs: ["ielts-listening-multiple-choice"], selfStudy: self("Bir IELTS dinleme kaydı dinle (Part 3); çoktan seçmeli soruları tek dinleyişte cevapla.", "Listen to one Part 3 recording and answer MCQs in a single listen."), minutes: 25 },
      { key: "l-form", skill: "listening", name: "Form / Note / Table Completion", lessonSlugs: ["ielts-listening-form-note-table"], selfStudy: self("Part 1 form doldurma kaydı dinle; yazım hatalarını kontrol et.", "Listen to a Part 1 form-completion recording; check spelling."), minutes: 20 },
      { key: "l-map", skill: "listening", name: "Plan / Map / Diagram Labelling", lessonSlugs: ["ielts-listening-plan-map-diagram"], selfStudy: self("Harita etiketleme kaydı dinle; yön ifadelerini not al.", "Listen to a map-labelling recording; note direction phrases."), minutes: 20 },
      { key: "l-matching", skill: "listening", name: "Listening Matching", lessonSlugs: ["ielts-listening-matching"], selfStudy: self("Eşleştirme tipi bir dinleme bölümü çalış.", "Practise one listening matching section."), minutes: 20 },
      { key: "l-summary", skill: "listening", name: "Flow-chart / Summary / Sentence Completion", lessonSlugs: ["ielts-listening-flowchart-summary-sentence"], selfStudy: self("Part 4 akademik konuşma dinle; özet boşluklarını doldur.", "Listen to a Part 4 lecture; fill the summary gaps."), minutes: 25 },
      { key: "w-task1", skill: "writing", name: "Writing Task 1", lessonSlugs: ["ielts-writing-task1-genel", "ielts-writing-line-graph", "ielts-writing-bar-graph", "ielts-writing-table"], selfStudy: self("20 dakikada en az 150 kelimelik bir Task 1 yaz (Academic: grafik; General: mektup). Konu anlatımındaki kontrol listesiyle kendini değerlendir.", "Write a 150+ word Task 1 in 20 minutes (Academic: graph; General: letter) and self-check with the lesson checklist."), minutes: 25 },
      { key: "w-task2", skill: "writing", name: "Writing Task 2", lessonSlugs: ["ielts-writing-task2-genel", "ielts-writing-agree-disagree", "ielts-writing-discuss-both-views", "ielts-writing-problem-solution", "ielts-writing-advantages-disadvantages"], selfStudy: self("40 dakikada en az 250 kelimelik bir Task 2 denemesi yaz ve kendi kontrol listenle değerlendir.", "Write a 250+ word Task 2 essay in 40 minutes and self-check it."), minutes: 40 },
      { key: "s-parts", skill: "speaking", name: "Speaking Part 1–3", lessonSlugs: ["ielts-speaking-part1", "ielts-speaking-part2", "ielts-speaking-part3"], toolHref: "/dashboard/speaking-practice/ielts", selfStudy: self("Konuşma simülasyonunda bir Part 2 kartı çalış ve cevabını kaydet.", "Practise one Part 2 cue card in the speaking simulator."), minutes: 15 },
      { key: "vocab", skill: "vocabulary", name: "Akademik kelime", selfStudy: self("Kendi kelime kartlarına 10 akademik kelime ekle ve örnek cümle yaz.", "Add 10 academic words to your cards with example sentences."), minutes: 15 },
      { key: "grammar", skill: "grammar", name: "Yazma ve konuşma için dil bilgisi", selfStudy: self("Son yazdığın metindeki dil bilgisi hatalarını listele ve düzelt.", "List and fix the grammar errors in your last essay."), minutes: 15 },
      { key: "time", skill: "time", name: "Süre yönetimi", selfStudy: self("Bir okuma bölümünü 20 dakikada çözmeyi dene; kalan soruları not al.", "Try one reading passage in 20 minutes and note what's left."), minutes: 20 },
    ],
    siteMock: { minutes: 60, note: self("Sitedeki IELTS denemeleri yalnızca Reading bölümünü kapsar.", "Site IELTS mocks cover the Reading section only.") },
    cefrForScore: (s) => (s >= 8.5 ? "C2" : s >= 7 ? "C1" : s >= 5.5 ? "B2" : s >= 4 ? "B1" : null),
    sources: [
      { label: "IELTS Academic test format", url: "https://ielts.org/take-a-test/test-types/ielts-academic-test" },
      { label: "IELTS General Training test format", url: "https://ielts.org/take-a-test/test-types/ielts-general-training-test" },
    ],
    verifiedOn: "2026-09-24",
  },
  TOEFL: {
    code: "TOEFL",
    name: "TOEFL iBT",
    versions: [{ key: "IBT_2026", name: self("TOEFL iBT (21 Ocak 2026 sonrası format)", "TOEFL iBT (format from 21 January 2026)"), contentExamSlug: "toefl" }],
    overall: toefl,
    skillScores: (["reading", "listening", "writing", "speaking"] as const).map((skill) => ({ skill, scale: toefl })),
    skills: ["reading", "listening", "writing", "speaking", "vocabulary", "grammar", "time"],
    taskTypes: [
      { key: "r-complete-words", skill: "reading", name: "Complete the Words", selfStudy: self("Bir akademik paragrafta her ikinci kelimenin yarısını kapatıp tamamlamayı dene (C-test tekniği).", "Practise the C-test technique: complete half-deleted words in an academic paragraph."), minutes: 15 },
      { key: "r-daily-life", skill: "reading", name: "Read in Daily Life", selfStudy: self("Kısa günlük metinler (duyuru, e-posta, menü) oku ve ana bilgiyi yakala.", "Read short everyday texts (notices, emails) and pick out key information."), minutes: 15 },
      { key: "r-academic", skill: "reading", name: "Read an Academic Passage", lessonSlugs: ["toefl-vocabulary", "toefl-inference", "toefl-reference", "toefl-factual-information"], practiceSlugs: ["toefl-reading-vocabulary", "toefl-reading-inference", "toefl-reading-reference", "toefl-reading-simplification"], selfStudy: self("Bir akademik metin oku; kelime, çıkarım ve referans sorularını cevapla.", "Read an academic passage; answer vocabulary, inference and reference questions."), minutes: 20 },
      { key: "l-choose-response", skill: "listening", name: "Listen and Choose a Response", selfStudy: self("Kısa diyaloglar dinle ve en uygun cevabı seçmeyi çalış.", "Listen to short exchanges and practise choosing the best reply."), minutes: 15 },
      { key: "l-conversation", skill: "listening", name: "Listen to a Conversation", lessonSlugs: ["toefl-gist-content", "toefl-listening-detail"], selfStudy: self("Bir kampüs konuşması dinle; ana fikir ve detay notu al.", "Listen to a campus conversation; note gist and details."), minutes: 20 },
      { key: "l-announcement", skill: "listening", name: "Listen to an Announcement", selfStudy: self("Bir kampüs duyurusu dinle ve istenen bilgileri yaz.", "Listen to a campus announcement and write down the key facts."), minutes: 15 },
      { key: "l-academic", skill: "listening", name: "Listen to an Academic Talk", lessonSlugs: ["toefl-organization", "toefl-connecting-content", "toefl-making-inferences"], selfStudy: self("Kısa bir akademik konuşma dinle; yapı ve çıkarım notları al.", "Listen to a short academic talk; note structure and inferences."), minutes: 20 },
      { key: "w-build-sentence", skill: "writing", name: "Build a Sentence", selfStudy: self("Karışık verilmiş kelimelerden 10 doğru cümle kur.", "Build 10 correct sentences from scrambled words."), minutes: 10 },
      { key: "w-email", skill: "writing", name: "Write an Email", selfStudy: self("7 dakikada 80–120 kelimelik, üç maddeyi de karşılayan bir e-posta yaz.", "Write an 80–120 word email covering all three points in 7 minutes."), minutes: 15 },
      { key: "w-discussion", skill: "writing", name: "Write for an Academic Discussion", selfStudy: self("Bir akademik tartışmaya 10 dakikada gerekçeli bir katkı yaz.", "Write a supported contribution to an academic discussion in 10 minutes."), minutes: 15 },
      { key: "s-repeat", skill: "speaking", name: "Listen and Repeat", toolHref: "/dashboard/speaking-practice/toefl", selfStudy: self("Konuşma simülasyonunda Listen and Repeat görevini çalış.", "Practise Listen and Repeat in the speaking simulator."), minutes: 10 },
      { key: "s-interview", skill: "speaking", name: "Take an Interview", lessonSlugs: ["toefl-independent-speaking"], toolHref: "/dashboard/speaking-practice/toefl", selfStudy: self("Konuşma simülasyonunda Take an Interview görevini çalış.", "Practise Take an Interview in the speaking simulator."), minutes: 15 },
      { key: "vocab", skill: "vocabulary", name: "Akademik kelime", selfStudy: self("Kendi kelime kartlarına 10 akademik kelime ekle.", "Add 10 academic words to your cards."), minutes: 15 },
      { key: "grammar", skill: "grammar", name: "Cümle yapısı", selfStudy: self("Build a Sentence için soru cümlesi ve bağlaç yapılarını tekrar et.", "Review question and clause structures for Build a Sentence."), minutes: 15 },
      { key: "time", skill: "time", name: "Süre yönetimi", selfStudy: self("Bir okuma setini süre tutarak çöz.", "Solve a reading set with a timer."), minutes: 20 },
    ],
    siteMock: { minutes: 35, note: self("Sitedeki TOEFL denemeleri yalnızca Reading bölümünü ve eski formattaki soru tiplerini kapsar.", "Site TOEFL mocks cover Reading only, with pre-2026 question types.") },
    cefrForScore: (s) => (s >= 6 ? "C2" : s >= 5 ? "C1" : s >= 4 ? "B2" : s >= 3 ? "B1" : s >= 2 ? "A2" : "A1"),
    sources: [
      { label: "TOEFL iBT test content", url: "https://www.ets.org/toefl/test-takers/ibt/about/content.html" },
      { label: "TOEFL iBT score scale update (1–6)", url: "https://www.ets.org/toefl/institutions/ibt/score-scale-update.html" },
      { label: "TOEFL iBT writing section", url: "https://www.ets.org/toefl/test-takers/ibt/about/content/writing.html" },
    ],
    verifiedOn: "2026-09-24",
    contentNote: self(
      "TOEFL iBT Ocak 2026'da yenilendi. Sitedeki TOEFL konu anlatımları ve soruları çoğunlukla önceki formata göre hazırlandı; yeni görev tipleri için plan kendi çalışma görevleri önerir.",
      "TOEFL iBT changed in January 2026. Most site TOEFL lessons and questions follow the earlier format, so new task types get self-study tasks.",
    ),
  },
  PTE: {
    code: "PTE",
    name: "PTE Academic",
    versions: [
      { key: "ACADEMIC", name: self("PTE Academic (7 Ağustos 2025 sonrası)", "PTE Academic (from 7 August 2025)"), contentExamSlug: "pte" },
      { key: "UKVI", name: self("PTE Academic UKVI", "PTE Academic UKVI"), contentExamSlug: "pte" },
    ],
    overall: pte,
    skillScores: (["speaking", "writing", "reading", "listening"] as const).map((skill) => ({ skill, scale: pte })),
    skills: ["reading", "listening", "writing", "speaking", "vocabulary", "grammar", "time"],
    taskTypes: [
      { key: "s-read-aloud", skill: "speaking", name: "Read Aloud", lessonSlugs: ["read-aloud"], selfStudy: self("3 paragrafı sesli oku, kaydet ve telaffuzunu dinle.", "Read 3 passages aloud, record and review pronunciation."), minutes: 15 },
      { key: "s-repeat", skill: "speaking", name: "Repeat Sentence", lessonSlugs: ["repeat-sentence"], selfStudy: self("10 kısa cümleyi dinleyip tekrar et.", "Listen to and repeat 10 short sentences."), minutes: 10 },
      { key: "s-describe", skill: "speaking", name: "Describe Image", lessonSlugs: ["describe-image"], selfStudy: self("3 grafiği 40 saniyede anlatmayı kaydet.", "Record yourself describing 3 charts in 40 seconds each."), minutes: 15 },
      { key: "s-retell", skill: "speaking", name: "Re-tell Lecture", lessonSlugs: ["retell-lecture"], selfStudy: self("Kısa bir ders kaydı dinle ve 40 saniyede özetle.", "Listen to a short lecture and retell it in 40 seconds."), minutes: 15 },
      { key: "s-short-question", skill: "speaking", name: "Answer Short Question", lessonSlugs: ["answer-short-question"], selfStudy: self("10 kısa soruya tek kelimeyle cevap ver.", "Answer 10 short questions in a word or two."), minutes: 10 },
      { key: "s-group", skill: "speaking", name: "Summarize Group Discussion", selfStudy: self("Üç kişilik bir tartışma dinle ve her konuşmacının görüşünü özetle.", "Listen to a three-person discussion and summarize each view."), minutes: 15 },
      { key: "s-situation", skill: "speaking", name: "Respond to a Situation", selfStudy: self("Bir durum açıklamasını oku, 40 saniyelik sözlü cevabını kaydet.", "Read a situation and record a 40-second spoken response."), minutes: 15 },
      { key: "w-swt", skill: "writing", name: "Summarize Written Text", lessonSlugs: ["summarize-written-text"], selfStudy: self("Bir paragrafı 5–75 kelimelik tek cümlede özetle.", "Summarize a passage in one sentence of 5–75 words."), minutes: 15 },
      { key: "w-essay", skill: "writing", name: "Write Essay", lessonSlugs: ["write-essay"], selfStudy: self("20 dakikada 200–300 kelimelik bir essay yaz.", "Write a 200–300 word essay in 20 minutes."), minutes: 25 },
      { key: "r-rw-fib", skill: "reading", name: "Reading & Writing: Fill in the Blanks", lessonSlugs: ["reading-writing-fill-in-blanks"], selfStudy: self("Açılır listeli boşluk doldurma alıştırması yap.", "Practise drop-down fill in the blanks."), minutes: 15 },
      { key: "r-mcq", skill: "reading", name: "Multiple Choice (Single / Multiple)", lessonSlugs: ["reading-mcq-single", "reading-mcq-multiple"], practiceSlugs: ["pte-reading-mcq-single", "pte-reading-mcq-multi"], selfStudy: self("Tek ve çok cevaplı okuma soruları çöz.", "Solve single- and multiple-answer reading questions."), minutes: 15 },
      { key: "r-reorder", skill: "reading", name: "Re-order Paragraphs", lessonSlugs: ["reading-reorder-paragraphs"], practiceSlugs: ["pte-reading-reorder"], selfStudy: self("Karışık cümleleri doğru sıraya koy.", "Put scrambled sentences in order."), minutes: 15 },
      { key: "r-fib", skill: "reading", name: "Reading: Fill in the Blanks", lessonSlugs: ["reading-fill-in-blanks"], practiceSlugs: ["pte-reading-fill-blanks"], selfStudy: self("Sürükle-bırak boşluk doldurma alıştırması yap.", "Practise drag-and-drop fill in the blanks."), minutes: 15 },
      { key: "l-sst", skill: "listening", name: "Summarize Spoken Text", lessonSlugs: ["listening-summarize-spoken-text"], selfStudy: self("Bir kaydı dinle, 50–70 kelimeyle özetle.", "Listen and summarize in 50–70 words."), minutes: 15 },
      { key: "l-wfd", skill: "listening", name: "Write from Dictation", lessonSlugs: ["listening-write-from-dictation"], selfStudy: self("10 dikte cümlesi yaz ve yazımını kontrol et.", "Write 10 dictation sentences and check spelling."), minutes: 10 },
      { key: "l-other", skill: "listening", name: "Highlight / Select Missing Word / MCQ / Fill in the Blanks", lessonSlugs: ["listening-highlight-correct-summary", "listening-select-missing-word", "listening-highlight-incorrect-words", "listening-fill-in-blanks", "listening-mcq-single", "listening-mcq-multiple"], selfStudy: self("Bir dinleme soru tipini seç ve 10 soru çöz.", "Pick one listening task type and do 10 items."), minutes: 15 },
      { key: "vocab", skill: "vocabulary", name: "Akademik kelime", selfStudy: self("Kendi kelime kartlarına 10 akademik kelime ekle.", "Add 10 academic words to your cards."), minutes: 15 },
      { key: "grammar", skill: "grammar", name: "Dil bilgisi", selfStudy: self("Son essay'indeki dil bilgisi hatalarını düzelt.", "Fix the grammar errors in your last essay."), minutes: 15 },
      { key: "time", skill: "time", name: "Süre yönetimi", selfStudy: self("Bir soru tipini gerçek süre sınırıyla çöz.", "Solve one task type under the real time limit."), minutes: 15 },
    ],
    siteMock: { minutes: 30, note: self("Sitedeki PTE denemeleri yalnızca Reading soru tiplerini kapsar.", "Site PTE mocks cover Reading task types only.") },
    cefrForScore: (s) => (s >= 85 ? "C2" : s >= 76 ? "C1" : s >= 59 ? "B2" : s >= 43 ? "B1" : s >= 30 ? "A2" : null),
    sources: [
      { label: "PTE Academic test format", url: "https://www.pearsonpte.com/pte-academic/test-format/" },
      { label: "PTE Academic scoring", url: "https://www.pearsonpte.com/pte-academic/scoring/" },
      { label: "PTE Academic updates 2025", url: "https://www.pearsonpte.com/pte-updates-2025/" },
    ],
    verifiedOn: "2026-09-24",
  },
  YDS: {
    code: "YDS",
    name: "YDS / e-YDS",
    versions: [
      { key: "YDS", name: self("YDS (kâğıt)", "YDS (paper-based)"), contentExamSlug: "yds" },
      { key: "EYDS", name: self("e-YDS (elektronik)", "e-YDS (computer-based)"), contentExamSlug: "yds" },
    ],
    overall: osym,
    skillScores: [],
    skills: ["vocabulary", "grammar", "reading", "translation", "time"],
    taskTypes: osymTypes({ dialogue: true, restatement: true }),
    siteMock: { minutes: 180, note: self("80 soruluk tam deneme (180 dakika).", "Full 80-question mock (180 minutes).") },
    estimate: OSYM_LINEAR,
    sources: [{ label: "ÖSYM — YDS / e-YDS", url: "https://www.osym.gov.tr" }],
    verifiedOn: "2026-09-24",
  },
  YOKDIL: {
    code: "YOKDIL",
    name: "YÖKDİL",
    versions: [
      { key: "SOSYAL", name: self("YÖKDİL Sosyal Bilimler", "YÖKDİL Social Sciences"), contentExamSlug: "yokdil-sosyal-bilimler" },
      { key: "SAGLIK", name: self("YÖKDİL Sağlık Bilimleri", "YÖKDİL Health Sciences"), contentExamSlug: "yokdil-saglik-bilimleri" },
      { key: "FEN", name: self("YÖKDİL Fen Bilimleri", "YÖKDİL Science"), contentExamSlug: "yokdil-fen-bilimleri" },
    ],
    overall: osym,
    skillScores: [],
    skills: ["vocabulary", "grammar", "reading", "translation", "time"],
    taskTypes: osymTypes({ dialogue: false, restatement: false }),
    siteMock: { minutes: 180, note: self("80 soruluk tam deneme (180 dakika).", "Full 80-question mock (180 minutes).") },
    estimate: OSYM_LINEAR,
    sources: [{ label: "ÖSYM — YÖKDİL", url: "https://www.osym.gov.tr" }],
    verifiedOn: "2026-09-24",
  },
  YDT: {
    code: "YDT",
    name: "YDT İngilizce",
    versions: [{ key: "ENGLISH", name: self("YDT İngilizce (YKS 3. oturum)", "YDT English (YKS session 3)"), contentExamSlug: "yds" }],
    // YDT is scored with ÖSYM standard scores, not a fixed formula, so targets use the net count.
    overall: band(0, 80, 0.25, "Net (0–80)", "Net (0–80)"),
    skillScores: [],
    skills: ["vocabulary", "grammar", "reading", "translation", "time"],
    taskTypes: osymTypes({ dialogue: true, restatement: true, situation: true }),
    siteMock: null,
    sources: [{ label: "ÖSYM — YKS (YDT oturumu)", url: "https://www.osym.gov.tr" }],
    verifiedOn: "2026-09-24",
    contentNote: self(
      "Sitede YDT'ye özel içerik henüz yok. Soru tipleri YDS ile büyük ölçüde aynı olduğu için plan YDS konu anlatımlarını ve sorularını kullanır. YDT puanı ÖSYM standart puanıyla hesaplandığı için hedefin net sayısı olarak tutulur; YKS'de 4 yanlış 1 doğruyu götürür.",
      "The site has no YDT-specific content yet. Question types largely match YDS, so the plan uses YDS lessons and questions. YDT is scored with ÖSYM standard scores, so the target is kept as a net count (4 wrong answers cancel 1 correct).",
    ),
  },
};

export const PATHWAY_CODES = Object.keys(PATHWAYS) as CoachingPathwayCode[];

export function pathwayConfig(code: string): PathwayConfig | null {
  return (PATHWAYS as Record<string, PathwayConfig>)[code] ?? null;
}

export function versionOf(config: PathwayConfig, key: string): ExamVersion {
  return config.versions.find((v) => v.key === key) ?? config.versions[0];
}

/** Snap a typed score onto the exam's own scale (rejects values outside it). */
export function parseScore(raw: string | null | undefined, scale: ScoreScale): number | null {
  if (raw === null || raw === undefined || raw.trim() === "") return null;
  const n = Number(raw.replace(",", "."));
  if (!Number.isFinite(n) || n < scale.min || n > scale.max) return null;
  return Math.round(n / scale.step) * scale.step;
}

export const SKILL_LABELS: Record<SkillKey, { tr: string; en: string }> = {
  reading: { tr: "Okuma", en: "Reading" },
  listening: { tr: "Dinleme", en: "Listening" },
  writing: { tr: "Yazma", en: "Writing" },
  speaking: { tr: "Konuşma", en: "Speaking" },
  vocabulary: { tr: "Kelime", en: "Vocabulary" },
  grammar: { tr: "Dil bilgisi", en: "Grammar" },
  translation: { tr: "Çeviri", en: "Translation" },
  time: { tr: "Süre yönetimi", en: "Time management" },
};
