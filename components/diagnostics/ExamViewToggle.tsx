import { setExamViewModeAction } from "@/app/actions/exam-view-mode";
import type { ExamViewMode } from "@/lib/diagnostics/exam-view-mode";

export function ExamViewToggle({ attemptId, mode }: { attemptId: string; mode: ExamViewMode }) {
  return (
    <div className="mx-auto flex w-fit gap-2">
      <form action={setExamViewModeAction.bind(null, attemptId, "single")}>
        <button type="submit" className={`pill-tab ${mode === "single" ? "pill-tab-active" : ""}`} disabled={mode === "single"}>
          Soru Soru
        </button>
      </form>
      <form action={setExamViewModeAction.bind(null, attemptId, "booklet")}>
        <button type="submit" className={`pill-tab ${mode === "booklet" ? "pill-tab-active" : ""}`} disabled={mode === "booklet"}>
          Kitapçık Görünümü
        </button>
      </form>
    </div>
  );
}
