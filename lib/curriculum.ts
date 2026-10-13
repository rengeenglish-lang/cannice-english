import plans from "@/data/curricula/approved-plans.json";

export const PROGRAMME_MINUTES = 250 * 60;
export const ACTIVITY_TYPES = ["LIVE_INSTRUCTION", "GUIDED_PRACTICE", "EXAM_SIMULATION", "INDEPENDENT_STUDY", "REVIEW_ASSESSMENT"] as const;
export type ActivityType = typeof ACTIVITY_TYPES[number];
export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  LIVE_INSTRUCTION: "Canlı öğretim", GUIDED_PRACTICE: "Rehberli uygulama",
  EXAM_SIMULATION: "Simülasyon", INDEPENDENT_STUDY: "Yapılandırılmış bağımsız çalışma",
  REVIEW_ASSESSMENT: "Tekrar / değerlendirme",
};
const examCodes = { IELTS: "IELTS", TOEFL: "TOEFL", YDS: "YDS", PTE: "PTE", "YÖKDİL Fen": "YOKDIL_FEN", "YÖKDİL Sağlık": "YOKDIL_SAGLIK", "YÖKDİL Sosyal": "YOKDIL_SOSYAL" } as const;
export const approvedProgrammePlans = plans.programmes.map((plan) => ({
  key: `${examCodes[plan.name as keyof typeof examCodes].toLowerCase()}-250-v1`,
  examCode: examCodes[plan.name as keyof typeof examCodes],
  name: plan.name,
  modules: plan.modules.map((module) => ({
    title: module.title, scope: module.scope,
    budgets: ACTIVITY_TYPES.map((type) => ({ type, minutes: module.hours[ACTIVITY_LABELS[type] as keyof typeof module.hours] * 60 })),
  })),
}));

export interface ActivityOutline {
  id: string; title: string; type: ActivityType; durationMinutes: number;
  instructions: string; completionCriteria: string; simulationKey: string | null;
  prerequisites: { prerequisiteId: string }[];
  assessment: { rubric: string; minimumScore: number | null } | null;
}
export interface ModuleOutline {
  id: string; title: string;
  durationBudgets: { type: ActivityType; minutes: number }[];
  units: { id: string }[];
  lessons: { unitId: string | null; activities: ActivityOutline[] }[];
}
const emptyBreakdown = () => Object.fromEntries(ACTIVITY_TYPES.map((type) => [type, 0])) as Record<ActivityType, number>;

/** Budgeted time and defined activity time are deliberately separate. */
export function curriculumReport(modules: ModuleOutline[], examFormatVerified: boolean) {
  const issues: string[] = [];
  const defined = emptyBreakdown();
  const planned = emptyBreakdown();
  const activities = modules.flatMap((m) => m.lessons.flatMap((l) => l.activities));
  const ids = new Set(activities.map((a) => a.id));
  if (ids.size !== activities.length) issues.push("Etkinlikler birden fazla sayılmış.");
  const seen = new Set<string>();
  const moduleReports = modules.map((module) => {
    const minutes = emptyBreakdown();
    for (const budget of module.durationBudgets) planned[budget.type] += budget.minutes;
    if (!module.units.length || !module.lessons.length) issues.push(`${module.title}: ünite ve ders eşlemesi eksik.`);
    for (const lesson of module.lessons) {
      if (!module.units.some((u) => u.id === lesson.unitId)) issues.push(`${module.title}: ders aynı modülün ünitesine bağlı olmalı.`);
      if (!lesson.activities.length) issues.push(`${module.title}: etkinliği olmayan ders var.`);
      for (const activity of lesson.activities) {
        if (!Number.isSafeInteger(activity.durationMinutes) || activity.durationMinutes <= 0 || activity.durationMinutes > 480) issues.push(`${activity.title}: geçerli dakika gerekli.`);
        else { minutes[activity.type] += activity.durationMinutes; defined[activity.type] += activity.durationMinutes; }
        if (!activity.instructions.trim() || !activity.completionCriteria.trim()) issues.push(`${activity.title}: yönerge ve tamamlama ölçütü gerekli.`);
        if (activity.type !== "LIVE_INSTRUCTION" && !activity.assessment?.rubric.trim()) issues.push(`${activity.title}: değerlendirme rubriği gerekli.`);
        // No persisted authoritative simulation engine exists yet. A string alone must not unlock publication.
        if (activity.type === "EXAM_SIMULATION") issues.push(`${activity.title}: doğrulanmış sunucu simülasyon bağlantısı henüz mevcut değil.`);
        for (const prerequisite of activity.prerequisites) {
          if (!seen.has(prerequisite.prerequisiteId)) issues.push(`${activity.title}: ön koşul aynı programda daha önce gelmeli.`);
        }
        seen.add(activity.id);
      }
    }
    for (const type of ACTIVITY_TYPES) {
      const budget = module.durationBudgets.find((b) => b.type === type)?.minutes ?? 0;
      if (minutes[type] !== budget) issues.push(`${module.title} / ${ACTIVITY_LABELS[type]}: ${minutes[type]} / ${budget} dakika.`);
    }
    return { id: module.id, title: module.title, minutes, totalMinutes: Object.values(minutes).reduce((a, b) => a + b, 0) };
  });
  const totalMinutes = Object.values(defined).reduce((a, b) => a + b, 0);
  const plannedMinutes = Object.values(planned).reduce((a, b) => a + b, 0);
  if (totalMinutes !== PROGRAMME_MINUTES) issues.push(`Etkinlik toplamı ${totalMinutes} / ${PROGRAMME_MINUTES} dakika.`);
  if (plannedMinutes !== PROGRAMME_MINUTES) issues.push(`Plan toplamı ${plannedMinutes} / ${PROGRAMME_MINUTES} dakika.`);
  if (!examFormatVerified) issues.push("Sınav formatı ve kaynak eşlemesi henüz doğrulanmadı.");
  return { totalMinutes, plannedMinutes, defined, planned, modules: moduleReports, issues, publishable: issues.length === 0 };
}

export function programmeProgress(modules: ModuleOutline[], completions: { activityId: string; creditedMinutes: number; revokedAt: Date | null }[]) {
  const valid = new Map(completions.filter((c) => !c.revokedAt).map((c) => [c.activityId, c]));
  const breakdown = emptyBreakdown();
  let foundCurrent = false;
  const roadmap = modules.map((module) => {
    const activities = module.lessons.flatMap((lesson) => lesson.activities);
    let completedMinutes = 0;
    for (const activity of activities) {
      const completion = valid.get(activity.id);
      if (completion && completion.creditedMinutes === activity.durationMinutes) {
        completedMinutes += completion.creditedMinutes;
        breakdown[activity.type] += completion.creditedMinutes;
      }
    }
    const totalMinutes = activities.reduce((sum, a) => sum + a.durationMinutes, 0);
    const complete = totalMinutes > 0 && completedMinutes === totalMinutes;
    const status = complete ? "COMPLETED" : !foundCurrent ? "CURRENT" : "UPCOMING";
    if (!complete) foundCurrent = true;
    return { id: module.id, title: module.title, completedMinutes, totalMinutes, status };
  });
  const completedMinutes = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return { completedMinutes, targetMinutes: PROGRAMME_MINUTES, percentage: Math.min(100, completedMinutes / PROGRAMME_MINUTES * 100), breakdown, roadmap };
}
