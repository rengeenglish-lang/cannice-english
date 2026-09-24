import "server-only";
import { dateToDayKey } from "@/lib/coaching/time";
import type { TaskView } from "@/components/coaching/TaskRow";

type TaskRowData = {
  id: string;
  date: Date;
  kind: string;
  skill: string | null;
  title: string;
  detail: string | null;
  href: string | null;
  refType: string | null;
  isGap: boolean;
  minutes: number;
  status: string;
  completion: string | null;
  skipReason: string | null;
};

/** Serialisable task for the client rows. "Başla" appears only where there's a real page to open. */
export function toTaskView(task: TaskRowData): TaskView {
  const startsAttempt = (task.kind === "PRACTICE" || task.kind === "TIMED_PRACTICE") && task.refType === "DIAGNOSTIC_TOPIC";
  return {
    id: task.id,
    date: dateToDayKey(task.date),
    kind: task.kind,
    skill: task.skill,
    title: task.title,
    detail: task.detail,
    href: task.href,
    isGap: task.isGap,
    minutes: task.minutes,
    status: task.status as TaskView["status"],
    completion: task.completion,
    skipReason: task.skipReason,
    canStart: startsAttempt || task.kind === "MOCK" || Boolean(task.href),
  };
}

/** "Pzt 22 Eyl" style label for a day key in the coaching language. */
export function dayLabel(key: string, locale: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
  return new Date(`${key}T12:00:00Z`).toLocaleDateString(locale === "en" ? "en-GB" : "tr-TR", { ...opts, timeZone: "UTC" });
}
