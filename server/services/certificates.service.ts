import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/server/db";
import { getSiteUrl } from "@/server/env";
import { notify } from "@/server/services/notifications.service";
import { renderCertificatePdf } from "@/server/certificates/pdf";
import type { CertificateView } from "@/lib/certificates/render";

/**
 * Completion certificates: one per exam's whole Konu Anlatımı track and one per course whose
 * recorded lessons are all done. Issued the moment the last lesson is ticked (and re-checked when
 * the certificates page opens), never revoked if lessons are later unticked.
 */
export type TrackProgress = { kind: "TOPICS" | "COURSE"; refKey: string; title: string; total: number; done: number };

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newCode = () => Array.from(randomBytes(10), (b) => ALPHABET[b % ALPHABET.length]).join("");
export const verifyUrl = (code: string) => `${getSiteUrl().replace(/\/$/, "")}/sertifika/${code}`;

export async function trackProgress(userId: string): Promise<TrackProgress[]> {
  const [lessons, completed, enrollments] = await Promise.all([
    db.topicLesson.findMany({ select: { id: true, topic: { select: { examType: { select: { slug: true, name: true, displayOrder: true } } } } } }),
    db.topicLessonProgress.findMany({ where: { userId, completedAt: { not: null } }, select: { topicLessonId: true } }),
    db.enrollment.findMany({
      where: { userId, status: "ACTIVE" },
      select: {
        id: true,
        courseId: true,
        course: { select: { product: { select: { title: true } }, modules: { select: { lessons: { select: { id: true } } } } } },
        lessonProgresses: { where: { completedAt: { not: null } }, select: { recordedLessonId: true } },
      },
    }),
  ]);
  const doneIds = new Set(completed.map((c) => c.topicLessonId));
  const byExam = new Map<string, TrackProgress & { order: number }>();
  for (const l of lessons) {
    const exam = l.topic.examType;
    const row = byExam.get(exam.slug) ?? { kind: "TOPICS" as const, refKey: exam.slug, title: `${exam.name} Konu Anlatımı`, total: 0, done: 0, order: exam.displayOrder };
    row.total += 1;
    if (doneIds.has(l.id)) row.done += 1;
    byExam.set(exam.slug, row);
  }
  const topics: TrackProgress[] = [...byExam.values()].sort((a, b) => a.order - b.order).map((t) => ({ kind: t.kind, refKey: t.refKey, title: t.title, total: t.total, done: t.done }));
  const courses: TrackProgress[] = enrollments.flatMap((e) => {
    const ids = e.course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    if (!ids.length) return [];
    const done = new Set(e.lessonProgresses.map((p) => p.recordedLessonId));
    return [{ kind: "COURSE" as const, refKey: e.courseId, title: e.course.product.title, total: ids.length, done: ids.filter((id) => done.has(id)).length }];
  });
  return [...topics, ...courses];
}

/** Issues every certificate the student has newly earned; returns the new ones. */
export async function syncCertificates(userId: string) {
  const [user, tracks, existing] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { name: true } }),
    trackProgress(userId),
    db.certificate.findMany({ where: { userId }, select: { kind: true, refKey: true } }),
  ]);
  if (!user) return [];
  const have = new Set(existing.map((c) => `${c.kind}:${c.refKey}`));
  const issued = [];
  for (const t of tracks) {
    if (t.total === 0 || t.done < t.total || have.has(`${t.kind}:${t.refKey}`)) continue;
    try {
      const cert = await db.certificate.create({ data: { code: newCode(), userId, kind: t.kind, refKey: t.refKey, title: t.title, recipientName: user.name, lessonCount: t.total } });
      issued.push(cert);
      await notify(userId, { category: "RESULT", key: `certificate:${cert.id}`, title: "Sertifikan hazır!", body: `${t.title} programını tamamladın. Sertifikanı indirip paylaşabilirsin.`, href: "/dashboard/sertifikalarim" });
    } catch (error) {
      if ((error as { code?: string }).code !== "P2002") throw error; // issued by a parallel request
    }
  }
  return issued;
}

export function listCertificates(userId: string) {
  return db.certificate.findMany({ where: { userId }, orderBy: { issuedAt: "desc" } });
}

export async function certificateByCode(code: string) {
  if (!/^[A-Z2-9]{10}$/.test(code)) return null;
  return db.certificate.findUnique({ where: { code } });
}

export function toCertificateView(c: { code: string; recipientName: string; title: string; lessonCount: number; issuedAt: Date }): CertificateView {
  return { code: c.code, recipientName: c.recipientName, title: c.title, lessonCount: c.lessonCount, issuedAt: c.issuedAt, verifyUrl: verifyUrl(c.code) };
}

export async function certificatePdf(code: string) {
  const cert = await certificateByCode(code);
  if (!cert) return null;
  return { fileName: `Netfener Sertifika ${cert.code}.pdf`, pdf: await renderCertificatePdf(toCertificateView(cert)) };
}
