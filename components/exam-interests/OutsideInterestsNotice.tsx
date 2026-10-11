import Link from "next/link";
import { Lock } from "lucide-react";
import { interestExam, type InterestCode } from "@/lib/exam-interests";

/** Shown instead of study material for an exam the learner hasn't chosen. */
export function OutsideInterestsNotice({ interests, examName }: { interests: InterestCode[]; examName?: string }) {
  return (
    <div className="panel mx-auto mt-8 max-w-xl text-center">
      <Lock size={28} aria-hidden="true" className="mx-auto text-[color:var(--muted)]" />
      <p className="mt-3 font-bold">{examName ? `${examName} içerikleri` : "Bu içerik"} seçtiğin sınavların dışında.</p>
      <p className="mt-2 text-sm text-[color:var(--muted)]">
        Hazırlandığın sınavlar: {interests.map((c) => interestExam(c).label).join(", ")}. Bu sınava da çalışmak istersen sınavlarını düzenleyebilirsin (en fazla 2).
      </p>
      <Link href="/dashboard/sinavlarim" className="primary-button mt-5">Sınavlarımı düzenle</Link>
    </div>
  );
}
