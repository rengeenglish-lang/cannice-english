import Link from "next/link";
import type { ExamType } from "@/lib/generated/prisma/client";
import { EXAM_META } from "@/lib/exam-types";

export function ExamPicker({ exams }: { exams: ExamType[] }) {
  return (
    <section className="mx-auto -mt-12 w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <div className="panel">
        <p className="eyebrow">Hangi sınava hazırlanıyorsun?</p>
        <p className="mt-1 text-sm text-[color:var(--muted)]">Sınavını seç, sana özel hazırlık yolunu gör.</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {exams.map((exam) => {
            const palette = EXAM_META[exam.code];
            return (
              <Link
                key={exam.id}
                href={`/exams/${exam.slug}`}
                className="exam-tile"
                style={{ "--exam-color": palette.solid } as React.CSSProperties}
              >
                <span className="size-2.5 rounded-full" style={{ backgroundColor: palette.solid }} />
                <span className="text-sm font-bold text-[color:var(--foreground)]">{exam.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
