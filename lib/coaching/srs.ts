/**
 * Spaced repetition for vocabulary cards (Leitner boxes) and the mistake notebook. A single
 * correct answer never marks an item mastered: vocabulary must climb every box on separate
 * reviews, and a mistake needs three correct retries on at least three different days.
 */

const DAY = 86_400_000;

/** Days until the next review after reaching each box (index = box). */
export const VOCAB_INTERVALS = [0, 1, 3, 7, 14, 30];
export const VOCAB_MASTERED_BOX = 5;

export type VocabState = { box: number; reviews: number; lapses: number };

export function reviewVocab(state: VocabState, knewIt: boolean, now: Date) {
  if (!knewIt) {
    // Back to the first box and shown again later in the same session / day.
    return { box: 1, reviews: state.reviews + 1, lapses: state.lapses + 1, dueAt: new Date(now.getTime() + 10 * 60_000), mastered: false };
  }
  const box = Math.min(VOCAB_MASTERED_BOX, state.box + 1);
  const mastered = box >= VOCAB_MASTERED_BOX && state.reviews + 1 >= 4;
  return { box, reviews: state.reviews + 1, lapses: state.lapses, dueAt: new Date(now.getTime() + VOCAB_INTERVALS[box] * DAY), mastered };
}

/** Days until the next retry after N correct retries in a row (on different days). */
export const MISTAKE_INTERVALS = [1, 3, 7, 14];
export const MISTAKE_MASTERY_STREAK = 3;

export type MistakeState = { correctStreak: number; timesWrong: number; lastRetryDay: string | null };

export function retryMistake(state: MistakeState, correct: boolean, now: Date, todayKey: string) {
  if (!correct) {
    return { correctStreak: 0, timesWrong: state.timesWrong + 1, lastRetryDay: todayKey, dueAt: new Date(now.getTime() + DAY), mastered: false, lastWrongAt: now };
  }
  // A second correct answer on the same day doesn't count again — recall has to hold over time.
  const streak = state.lastRetryDay === todayKey ? Math.max(state.correctStreak, 1) : state.correctStreak + 1;
  const mastered = streak >= MISTAKE_MASTERY_STREAK;
  const interval = MISTAKE_INTERVALS[Math.min(streak, MISTAKE_INTERVALS.length - 1)];
  return { correctStreak: streak, timesWrong: state.timesWrong, lastRetryDay: todayKey, dueAt: new Date(now.getTime() + interval * DAY), mastered, lastWrongAt: null };
}
