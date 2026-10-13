/**
 * Streaks, weekly points and badges. Pure (no DB) so the rules are unit-tested; the data comes
 * from server/services/engagement.service.ts. Days are Europe/Istanbul calendar days ("2026-10-11").
 */

export const ENGAGEMENT_TZ = "Europe/Istanbul";

export function dayKey(date: Date, tz = ENGAGEMENT_TZ) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function shiftDay(key: string, days: number) {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Current streak = consecutive study days ending today, or ending yesterday (today isn't over yet,
 * so a streak isn't lost until a whole day passes without study). Best = the longest run ever.
 */
export function computeStreak(days: Iterable<string>, todayKey: string) {
  const set = new Set(days);
  let current = 0;
  let cursor = set.has(todayKey) ? todayKey : shiftDay(todayKey, -1);
  while (set.has(cursor)) {
    current += 1;
    cursor = shiftDay(cursor, -1);
  }
  let best = 0;
  for (const day of set) {
    if (set.has(shiftDay(day, -1))) continue; // not the start of a run
    let run = 0;
    let c = day;
    while (set.has(c)) {
      run += 1;
      c = shiftDay(c, 1);
    }
    best = Math.max(best, run);
  }
  return { current, best: Math.max(best, current) };
}

/** Monday 00:00 (Istanbul) of the week containing `now`, as a day key. */
export function weekStartKey(now: Date) {
  const key = dayKey(now);
  const weekday = new Date(`${key}T12:00:00Z`).getUTCDay(); // 0 = Sunday
  return shiftDay(key, -((weekday + 6) % 7));
}

/** Points for one week's study, used by the leaderboard. */
export const POINTS = { task: 10, lesson: 5, test: 20, mistake: 2, vocab: 1 } as const;
export type WeeklyCounts = { tasks: number; lessons: number; tests: number; mistakes: number; vocab: number };
export const weeklyPoints = (c: WeeklyCounts) => c.tasks * POINTS.task + c.lessons * POINTS.lesson + c.tests * POINTS.test + c.mistakes * POINTS.mistake + c.vocab * POINTS.vocab;

/** "Ayşe Yılmaz" → "Ayşe Y." when the student opted in; otherwise anonymous. */
export function leaderboardName(name: string, optIn: boolean) {
  if (!optIn) return "Netfener öğrencisi";
  const [first, ...rest] = name.trim().split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last.charAt(0).toLocaleUpperCase("tr-TR")}.` : first;
}

export type BadgeStats = {
  bestStreak: number;
  tasksDone: number;
  lessonsDone: number;
  vocabMastered: number;
  mistakesMastered: number;
  testsDone: number;
  certificates: number;
  /** 1 once the student has set up Ücretsiz Koçluk. */
  coachingStarted: number;
  /** Weekly check-ins ("Bu haftayı nasıl geçirdin?") submitted. */
  checkIns: number;
  /** Finished practice / mock / level tests with at least 10 answers and 90%+ correct. */
  highScoreTests: number;
  /** Plan weeks with at least 5 tasks where every task was done (busy-day skips don't count). */
  perfectWeeks: number;
  /** Full mock exams (Deneme Sınavı) finished. */
  mockTests: number;
  /** Writing / translation pieces that got AI feedback. */
  writingDone: number;
  /** Kelime Motoru set tests passed with 80%+. */
  setTestsPassed: number;
};

/** Bronz → Gümüş → Altın → Platin: getting started, building habits, sustained work, mastery. */
export type BadgeTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
export const BADGE_TIERS: { tier: BadgeTier; name: string; blurb: string }[] = [
  { tier: "BRONZE", name: "Bronz", blurb: "İlk adımlar: planını kur, başla." },
  { tier: "SILVER", name: "Gümüş", blurb: "Alışkanlık: düzenli çalış, doğru çöz." },
  { tier: "GOLD", name: "Altın", blurb: "İstikrar: haftalarca ve denemelerle devam et." },
  { tier: "PLATINUM", name: "Platin", blurb: "Ustalık: sınava tam hazır ol." },
];

export type Badge = { key: string; tier: BadgeTier; title: string; description: string; emoji: string; earned: (s: BadgeStats) => boolean; progress: (s: BadgeStats) => [number, number] };

const badge = (key: string, tier: BadgeTier, emoji: string, title: string, description: string, stat: keyof BadgeStats, goal: number): Badge => ({
  key,
  tier,
  emoji,
  title,
  description,
  earned: (s) => s[stat] >= goal,
  progress: (s) => [Math.min(s[stat], goal), goal],
});

/** Every badge is earned from recorded activity — nothing is self-declared. Keys never change (they are stored). */
export const BADGES: Badge[] = [
  // Bronz — getting started
  badge("coaching-start", "BRONZE", "🧭", "Yola Çıkan", "Ücretsiz Koçluk planını oluştur.", "coachingStarted", 1),
  badge("first-task", "BRONZE", "🚀", "İlk Adım", "Koçluk planından ilk görevini tamamla.", "tasksDone", 1),
  badge("first-checkin", "BRONZE", "🧱", "Temel Atan", "İlk haftalık değerlendirmeni doldur.", "checkIns", 1),
  badge("first-test", "BRONZE", "📝", "İlk Deneme", "İlk seviye tespit veya deneme sınavını bitir.", "testsDone", 1),
  badge("streak-3", "BRONZE", "🔥", "Isınma Turu", "3 gün üst üste çalış.", "bestStreak", 3),
  badge("lessons-10", "BRONZE", "📘", "Konu Avcısı", "10 Konu Anlatımı dersi bitir.", "lessonsDone", 10),
  badge("vocab-50", "BRONZE", "🧠", "Kelime Toplayıcı", "50 kelimeyi kalıcı öğren.", "vocabMastered", 50),
  badge("set-test-1", "BRONZE", "🎯", "Set Bitiren", "Kelime Motoru'nda bir set testini %80+ ile geç.", "setTestsPassed", 1),
  // Gümüş — habits
  badge("streak-7", "SILVER", "🔥", "Bir Haftalık Seri", "7 gün üst üste çalış.", "bestStreak", 7),
  badge("streak-14", "SILVER", "🔥", "İki Haftalık Seri", "14 gün üst üste çalış.", "bestStreak", 14),
  badge("perfect-week", "SILVER", "📅", "Tam Hafta", "Bir haftanın bütün koçluk görevlerini bitir (en az 5 görev).", "perfectWeeks", 1),
  badge("quiz-master", "SILVER", "⭐", "Soru Ustası", "Bir pratik veya deneme sınavında %90+ başarı (en az 10 soru).", "highScoreTests", 1),
  badge("tasks-50", "SILVER", "✅", "Plan Ustası", "50 koçluk görevi tamamla.", "tasksDone", 50),
  badge("vocab-250", "SILVER", "💎", "Kelime Hazinesi", "250 kelimeyi kalıcı öğren.", "vocabMastered", 250),
  badge("mistakes-20", "SILVER", "🛠️", "Hatasından Öğrenen", "Hata defterinden 20 soruyu kalıcı çöz.", "mistakesMastered", 20),
  badge("writing-5", "SILVER", "✍️", "Kalemi Güçlü", "5 yazma veya çeviri çalışmana geri bildirim al.", "writingDone", 5),
  // Altın — sustained work
  badge("streak-30", "GOLD", "🏆", "Bir Ay Durmadan", "30 gün üst üste çalış.", "bestStreak", 30),
  badge("perfect-weeks-4", "GOLD", "🗓️", "Disiplin Abidesi", "4 haftanın bütün koçluk görevlerini bitir.", "perfectWeeks", 4),
  badge("mocks-5", "GOLD", "⚔️", "Deneme Savaşçısı", "5 tam deneme sınavı bitir.", "mockTests", 5),
  badge("quiz-master-5", "GOLD", "🏹", "Keskin Nişancı", "5 sınavda %90+ başarı yakala.", "highScoreTests", 5),
  badge("lessons-50", "GOLD", "📚", "Konu Uzmanı", "50 Konu Anlatımı dersi bitir.", "lessonsDone", 50),
  badge("vocab-500", "GOLD", "💠", "Kelime Ustası", "500 kelimeyi kalıcı öğren.", "vocabMastered", 500),
  badge("certificate", "GOLD", "🎓", "Sertifikalı", "İlk sertifikanı kazan.", "certificates", 1),
  // Platin — mastery
  badge("mocks-10", "PLATINUM", "🏁", "Sınava Hazır", "10 tam deneme sınavı bitir.", "mockTests", 10),
  badge("streak-100", "PLATINUM", "👑", "Yüz Günlük Seri", "100 gün üst üste çalış.", "bestStreak", 100),
  badge("tasks-300", "PLATINUM", "🏅", "Plan Efsanesi", "300 koçluk görevi tamamla.", "tasksDone", 300),
  badge("vocab-1000", "PLATINUM", "🌟", "Kelime Efsanesi", "1000 kelimeyi kalıcı öğren.", "vocabMastered", 1000),
];

export function earnedBadges(stats: BadgeStats) {
  return BADGES.filter((b) => b.earned(stats)).map((b) => b.key);
}
