"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { addDays, ageFrom, dayKeyToDate, weekStartOf } from "@/lib/coaching/time";
import {
  deleteCoachingData,
  getCoachingProfile,
  saveOnboarding,
  setCoachingEnabled,
  updateCoachingSettings,
  type OnboardingError,
  type OnboardingInput,
} from "@/server/services/coaching/profile.service";
import {
  addCustomTask,
  applyBusyDay,
  completeTask,
  decideProposal,
  deleteTask,
  editTask,
  moveTask,
  refreshProposals,
  regenerateRemaining,
  reopenTask,
  skipTask,
  startTask,
  todayKeyFor,
} from "@/server/services/coaching/plan.service";
import { addStudentCard, deleteCard, reviewCard } from "@/server/services/coaching/vocab.service";
import { addManualMistake, deleteMistake, retryNotebookQuestion, updateMistakeNote } from "@/server/services/coaching/notebook.service";
import { reportUnhelpfulAdvice, saveCheckIn, saveReportSurvey } from "@/server/services/coaching/checkin.service";

const BASE = "/dashboard/kocluk";
const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

function touch() {
  revalidatePath(BASE, "layout");
}

async function student() {
  const user = await getAuthContext();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(BASE)}`);
  return user;
}

async function studentWithProfile() {
  const user = await student();
  const profile = await getCoachingProfile(user.id);
  if (!profile) redirect(`${BASE}/baslangic`);
  return { user, profile, todayKey: todayKeyFor(profile) };
}

// ---- Onboarding & settings ----

export async function saveOnboardingAction(input: OnboardingInput): Promise<{ ok: true } | { ok: false; error: OnboardingError }> {
  const user = await student();
  const hadProfile = Boolean(await getCoachingProfile(user.id));
  // A birth date already on the account decides whether guardian consent is required.
  const age = ageFrom(user.birthDate);
  const result = await saveOnboarding(user.id, age === null ? input : { ...input, isMinor: age < 18 });
  if (!result.ok) return result;
  // Editing goals later re-plans the rest of this week (done and student-edited tasks stay).
  const profile = (await getCoachingProfile(user.id))!;
  if (hadProfile) {
    const todayKey = todayKeyFor(profile);
    const week = await db.studyPlanWeek.findUnique({ where: { userId_weekStart: { userId: user.id, weekStart: dayKeyToDate(weekStartOf(todayKey)) } } });
    if (week) await regenerateRemaining(profile, user, todayKey);
  }
  touch();
  return { ok: true };
}

export async function updateSettingsAction(input: Parameters<typeof updateCoachingSettings>[1]): Promise<{ ok: boolean }> {
  const user = await student();
  try {
    await updateCoachingSettings(user.id, input);
  } catch {
    return { ok: false };
  }
  touch();
  return { ok: true };
}

export async function setCoachingEnabledAction(enabled: boolean) {
  const user = await student();
  if (!(await getCoachingProfile(user.id))) return;
  await setCoachingEnabled(user.id, enabled);
  touch();
}

export async function deleteCoachingDataAction() {
  const user = await student();
  await deleteCoachingData(user.id);
  revalidatePath("/dashboard", "layout");
  redirect(`${BASE}?silindi=1`);
}

// ---- Plan & tasks ----

export async function startTaskAction(taskId: string) {
  const user = await student();
  const href = await startTask(user.id, taskId);
  redirect(href ?? `${BASE}/plan`);
}

export async function completeTaskAction(taskId: string, selfMinutes?: number | null) {
  const user = await student();
  await completeTask(user.id, taskId, selfMinutes);
  touch();
}

export async function reopenTaskAction(taskId: string) {
  const user = await student();
  await reopenTask(user.id, taskId);
  touch();
}

export async function skipTaskAction(taskId: string) {
  const user = await student();
  await skipTask(user.id, taskId);
  touch();
}

/** Postpone to tomorrow, or move to a chosen day (e.g. "Bugüne taşı" for a missed task). */
export async function moveTaskAction(taskId: string, toKey?: string) {
  const { user, todayKey } = await studentWithProfile();
  const task = await db.studyTask.findFirst({ where: { id: taskId, userId: user.id }, select: { date: true } });
  if (!task) return;
  const from = task.date.toISOString().slice(0, 10);
  const target = toKey && DAY_KEY.test(toKey) ? toKey : addDays(from < todayKey ? todayKey : from, 1);
  await moveTask(user.id, taskId, target);
  touch();
}

export async function busyDayAction() {
  const { user, todayKey } = await studentWithProfile();
  await applyBusyDay(user.id, todayKey);
  touch();
}

export async function regeneratePlanAction() {
  const { user, profile, todayKey } = await studentWithProfile();
  await regenerateRemaining(profile, user, todayKey);
  touch();
}

export async function saveTaskAction(input: { taskId?: string; title: string; detail?: string; minutes: number; date: string; skill?: string | null }): Promise<{ ok: boolean }> {
  const user = await student();
  const title = input.title.trim().slice(0, 160);
  const minutes = Math.round(Number(input.minutes));
  if (!title || !DAY_KEY.test(input.date) || !Number.isFinite(minutes) || minutes < 5 || minutes > 240) return { ok: false };
  const data = { title, detail: input.detail?.trim().slice(0, 500), minutes, date: input.date, skill: input.skill ?? null };
  if (input.taskId) await editTask(user.id, input.taskId, data);
  else await addCustomTask(user.id, data);
  touch();
  return { ok: true };
}

export async function deleteTaskAction(taskId: string) {
  const user = await student();
  await deleteTask(user.id, taskId);
  touch();
}

export async function decideProposalAction(proposalId: string, accept: boolean) {
  const { user, profile, todayKey } = await studentWithProfile();
  await decideProposal(profile, user, proposalId, accept, todayKey);
  touch();
}

// ---- Vocabulary ----

export async function reviewCardAction(cardId: string, knewIt: boolean) {
  const user = await student();
  await reviewCard(user.id, cardId, knewIt);
  touch();
}

export async function addCardAction(input: { term: string; meaning: string; example?: string }): Promise<{ ok: boolean }> {
  const user = await student();
  const term = input.term.trim().slice(0, 80);
  const meaning = input.meaning.trim().slice(0, 200);
  if (!term || !meaning) return { ok: false };
  await addStudentCard(user.id, { term, meaning, example: input.example?.trim().slice(0, 300) });
  touch();
  return { ok: true };
}

export async function deleteCardAction(cardId: string) {
  const user = await student();
  await deleteCard(user.id, cardId);
  touch();
}

// ---- Mistake notebook ----

export async function retryMistakeAction(entryId: string, answer: string) {
  const { user, todayKey } = await studentWithProfile();
  // No revalidation here: the page keeps showing the feedback until the student moves on.
  const result = await retryNotebookQuestion(user.id, entryId, answer, todayKey);
  if (!result) return null;
  return { correct: result.correct, mastered: result.mastered, correctAnswer: result.question.correctAnswer, explanation: result.question.explanation ?? null };
}

const tagList = (raw: string) => raw.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 6).map((t) => t.slice(0, 40));

export async function addMistakeNoteAction(input: { note: string; tags: string }): Promise<{ ok: boolean }> {
  const user = await student();
  const note = input.note.trim().slice(0, 1000);
  if (!note) return { ok: false };
  await addManualMistake(user.id, note, tagList(input.tags));
  touch();
  return { ok: true };
}

export async function updateMistakeNoteAction(entryId: string, input: { note: string; tags: string }) {
  const user = await student();
  await updateMistakeNote(user.id, entryId, input.note.trim().slice(0, 1000), tagList(input.tags));
  touch();
}

export async function deleteMistakeAction(entryId: string) {
  const user = await student();
  await deleteMistake(user.id, entryId);
  touch();
}

// ---- Check-ins, surveys, feedback ----

export async function saveCheckInAction(weekStartKey: string, input: Parameters<typeof saveCheckIn>[2]): Promise<{ ok: boolean }> {
  const { profile, todayKey } = await studentWithProfile();
  if (!DAY_KEY.test(weekStartKey)) return { ok: false };
  const result = await saveCheckIn(profile, weekStartOf(weekStartKey), input);
  // Answers that call for a lighter or heavier plan become a proposal right away.
  if (result.ok) await refreshProposals(profile, todayKey);
  touch();
  return result;
}

export async function saveReportSurveyAction(input: Parameters<typeof saveReportSurvey>[1]): Promise<{ ok: boolean }> {
  const user = await student();
  const result = await saveReportSurvey(user.id, input);
  touch();
  return result;
}

export async function reportAdviceAction(refId: string, message?: string): Promise<{ ok: boolean }> {
  const user = await student();
  await reportUnhelpfulAdvice(user.id, refId, message);
  return { ok: true };
}
