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

export type BadgeStats = { bestStreak: number; tasksDone: number; lessonsDone: number; vocabMastered: number; mistakesMastered: number; testsDone: number; certificates: number };

export type Badge = { key: string; title: string; description: string; emoji: string; earned: (s: BadgeStats) => boolean; progress: (s: BadgeStats) => [number, number] };

const badge = (key: string, emoji: string, title: string, description: string, stat: keyof BadgeStats, goal: number): Badge => ({
  key,
  emoji,
  title,
  description,
  earned: (s) => s[stat] >= goal,
  progress: (s) => [Math.min(s[stat], goal), goal],
});

export const BADGES: Badge[] = [
  badge("first-task", "🚀", "İlk Adım", "Koçluk planından ilk görevini tamamla.", "tasksDone", 1),
  badge("streak-3", "🔥", "Isınma Turu", "3 gün üst üste çalış.", "bestStreak", 3),
  badge("streak-7", "🔥", "Bir Haftalık Seri", "7 gün üst üste çalış.", "bestStreak", 7),
  badge("streak-30", "🏆", "Bir Ay Durmadan", "30 gün üst üste çalış.", "bestStreak", 30),
  badge("tasks-50", "✅", "Plan Ustası", "50 koçluk görevi tamamla.", "tasksDone", 50),
  badge("lessons-10", "📘", "Konu Avcısı", "10 Konu Anlatımı dersi bitir.", "lessonsDone", 10),
  badge("lessons-50", "📚", "Konu Uzmanı", "50 Konu Anlatımı dersi bitir.", "lessonsDone", 50),
  badge("vocab-50", "🧠", "Kelime Toplayıcı", "50 kelimeyi kalıcı öğren.", "vocabMastered", 50),
  badge("vocab-250", "💎", "Kelime Hazinesi", "250 kelimeyi kalıcı öğren.", "vocabMastered", 250),
  badge("mistakes-20", "🛠️", "Hatasından Öğrenen", "Hata defterinden 20 soruyu kalıcı çöz.", "mistakesMastered", 20),
  badge("first-test", "📝", "İlk Deneme", "İlk seviye tespit veya deneme sınavını bitir.", "testsDone", 1),
  badge("certificate", "🎓", "Sertifikalı", "İlk sertifikanı kazan.", "certificates", 1),
];

export function earnedBadges(stats: BadgeStats) {
  return BADGES.filter((b) => b.earned(stats)).map((b) => b.key);
}
