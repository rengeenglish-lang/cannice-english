import { BookOpen, GraduationCap, Headphones, Languages } from "lucide-react";

export const PLATFORM_EXAMS = [
  { slug: "ielts", name: "IELTS", description: "Reading, Listening, Writing ve Speaking", color: "#0f9b8e", soft: "#e2f7f5", icon: Headphones },
  { slug: "toefl", name: "TOEFL", description: "Akademik İngilizce ve güncel iBT formatı", color: "#3b6fed", soft: "#e8eefe", icon: GraduationCap },
  { slug: "yds", name: "YDS", description: "Kelime, gramer, çeviri ve paragraf", color: "#f5590b", soft: "#feece1", icon: BookOpen },
  { slug: "yokdil", name: "YÖKDİL", description: "Sosyal, Sağlık ve Fen Bilimleri", color: "#5b4fe0", soft: "#eceafd", icon: Languages },
] as const;

export function examLearningHref(slug: string) { return `/konu-anlatim?exam=${slug}`; }
export function examGroupHref(slug: string) { return `/group-lessons?exam=${slug}`; }
export function examMaterialHref(slug: string) { return `/packages?exam=${slug}`; }
