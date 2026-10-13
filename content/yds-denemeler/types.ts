/**
 * Özgün YDS Denemeleri (Set 1 & Set 2): ten full 80-question YDS-format practice tests.
 * Every sentence, passage and question here was written for Netfener; nothing is quoted from
 * ÖSYM papers or other publishers. Only the exam's question types and order are borrowed.
 * scripts/build-yds-denemeler.mts renders the two books; scripts/check-yds-denemeler.mts checks them.
 *
 * Authoring rule: in every option list the CORRECT option is written FIRST. The builder places
 * it with a fixed, balanced permutation (each letter A–E is correct 16 times per test), so the
 * printed order is stable across builds. Explanations therefore never mention option letters.
 */

/** [stem, [correct, distractor, distractor, distractor, distractor], Turkish explanation] */
export type Q = [stem: string, options: [string, string, string, string, string], why: string];

/** A cloze passage: the text marks blanks as {1}…{5}; one question per blank, in order. */
export type Cloze = { text: string; blanks: [Q, Q, Q, Q, Q] };

/** A reading passage with four questions. */
export type Reading = { text: string; questions: [Q, Q, Q, Q] };

/**
 * "Anlam bütünlüğünü bozan cümle": five numbered sentences, `odd` is the 0-based index of the
 * sentence that breaks the flow (options are always I–V, so this one is not shuffled).
 */
export type Irrelevant = { sentences: [string, string, string, string, string]; odd: 0 | 1 | 2 | 3 | 4; why: string };

/** One test in real YDS order (questions 1–80). */
export type Deneme = {
  /** 1–10 */
  no: number;
  /** 1–6 kelime ve phrasal verb */
  vocab: [Q, Q, Q, Q, Q, Q];
  /** 7–16 dil bilgisi */
  grammar: [Q, Q, Q, Q, Q, Q, Q, Q, Q, Q];
  /** 17–26 iki cloze metni */
  cloze: [Cloze, Cloze];
  /** 27–36 cümle tamamlama */
  completion: [Q, Q, Q, Q, Q, Q, Q, Q, Q, Q];
  /** 37–39 İngilizce → Türkçe çeviri (stem: English sentence, options: Turkish) */
  enTr: [Q, Q, Q];
  /** 40–42 Türkçe → İngilizce çeviri (stem: Turkish sentence, options: English) */
  trEn: [Q, Q, Q];
  /** 43–62 beş okuma parçası × 4 soru */
  reading: [Reading, Reading, Reading, Reading, Reading];
  /** 63–67 diyalog tamamlama (stem: lines "A: …" / "B: …" with one "----" line) */
  dialogue: [Q, Q, Q, Q, Q];
  /** 68–71 anlamca en yakın cümle */
  restatement: [Q, Q, Q, Q];
  /** 72–75 paragraf tamamlama (stem: paragraph with "----" where the sentence goes) */
  paragraph: [Q, Q, Q, Q];
  /** 76–80 anlam bütünlüğünü bozan cümle */
  irrelevant: [Irrelevant, Irrelevant, Irrelevant, Irrelevant, Irrelevant];
};

export const SECTIONS = [
  { key: "vocab", from: 1, to: 6, title: "Kelime ve Phrasal Verb", instruction: "1 – 6. sorularda, cümlede boş bırakılan yere uygun düşen sözcük ya da ifadeyi bulunuz." },
  { key: "grammar", from: 7, to: 16, title: "Dil Bilgisi", instruction: "7 – 16. sorularda, cümlede boş bırakılan yerlere uygun düşen sözcük ya da ifadeyi bulunuz." },
  { key: "cloze", from: 17, to: 26, title: "Cloze Test", instruction: "17 – 26. sorularda, aşağıdaki parçalarda numaralanmış yerlere uygun düşen sözcük ya da ifadeyi bulunuz." },
  { key: "completion", from: 27, to: 36, title: "Cümle Tamamlama", instruction: "27 – 36. sorularda, verilen cümleyi uygun şekilde tamamlayan ifadeyi bulunuz." },
  { key: "enTr", from: 37, to: 39, title: "Çeviri (İngilizce → Türkçe)", instruction: "37 – 39. sorularda, verilen İngilizce cümleye anlamca en yakın Türkçe cümleyi bulunuz." },
  { key: "trEn", from: 40, to: 42, title: "Çeviri (Türkçe → İngilizce)", instruction: "40 – 42. sorularda, verilen Türkçe cümleye anlamca en yakın İngilizce cümleyi bulunuz." },
  { key: "reading", from: 43, to: 62, title: "Okuduğunu Anlama", instruction: "43 – 62. soruları, aşağıdaki parçalara göre cevaplayınız." },
  { key: "dialogue", from: 63, to: 67, title: "Diyalog Tamamlama", instruction: "63 – 67. sorularda, karşılıklı konuşmanın boş bırakılan kısmında söylenmiş olabilecek sözü bulunuz." },
  { key: "restatement", from: 68, to: 71, title: "Anlamca En Yakın Cümle", instruction: "68 – 71. sorularda, verilen cümleye anlamca en yakın cümleyi bulunuz." },
  { key: "paragraph", from: 72, to: 75, title: "Paragraf Tamamlama", instruction: "72 – 75. sorularda, boş bırakılan yere, parçada anlam bütünlüğünü sağlamak için getirilebilecek cümleyi bulunuz." },
  { key: "irrelevant", from: 76, to: 80, title: "Anlam Bütünlüğünü Bozan Cümle", instruction: "76 – 80. sorularda, cümleler sırasıyla okunduğunda parçanın anlam bütünlüğünü bozan cümleyi bulunuz." },
] as const;
