import { BookOpen, GraduationCap, Headphones, Languages } from "lucide-react";

export const PLATFORM_EXAMS = [
  { slug: "ielts", name: "IELTS", description: "Reading, Listening, Writing ve Speaking", color: "#0f9b8e", soft: "#e2f7f5", icon: Headphones },
  { slug: "toefl", name: "TOEFL", description: "Akademik İngilizce ve güncel iBT formatı", color: "#3b6fed", soft: "#e8eefe", icon: GraduationCap },
  { slug: "yds", name: "YDS", description: "Kelime, gramer, çeviri ve paragraf", color: "#f5590b", soft: "#feece1", icon: BookOpen },
  { slug: "yokdil", name: "YÖKDİL", description: "Sosyal, Sağlık ve Fen Bilimleri", color: "#5b4fe0", soft: "#eceafd", icon: Languages },
] as const;

/**
 * "yokdil" is an umbrella card, not a real ExamType slug (YÖKDİL is split into 3 branch exam
 * types with their own slugs) — /konu-anlatim and /packages have no umbrella entry to filter by,
 * so route those two through the branch picker instead of a query string that silently matches
 * nothing. /group-lessons genuinely supports "yokdil" as a filter value, so it's left as-is.
 */
export function examLearningHref(slug: string) { return slug === "yokdil" ? "/exams/yokdil#exam-sections" : `/konu-anlatim?exam=${slug}`; }
export function examGroupHref(slug: string) { return `/group-lessons?exam=${slug}`; }
export function examMaterialHref(slug: string) { return slug === "yokdil" ? "/exams/yokdil#exam-sections" : `/packages?exam=${slug}`; }
