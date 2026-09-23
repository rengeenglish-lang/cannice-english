import type { ExamCode } from "@/lib/generated/prisma/enums";

export type ExamLandingContent = {
  badge: string;
  headline: string;
  accent: string;
  description: string;
  stats: { value: string; label: string }[];
  steps: { title: string; description: string }[];
};

const sharedSteps = [
  { title: "Sınavını tanı", description: "Bölümleri, soru türlerini ve süre yönetimini netleştir." },
  { title: "Konu eksiğini bul", description: "Konu anlatımları ve örnek sorularla zayıf alanlarını belirle." },
  { title: "Süreli pratik yap", description: "Gerçek sınav temposuna yakın çalışmalarla hızını artır." },
  { title: "İlerlemeni izle", description: "Yanlışlarını incele ve sonraki çalışma hedefini belirle." },
];

export const EXAM_LANDING_CONTENT: Partial<Record<ExamCode, ExamLandingContent>> = {
  IELTS: {
    badge: "IELTS hazırlık merkezi",
    headline: "IELTS hedefinize dört beceride ilerleyin.",
    accent: "#0f9b8e",
    description: "Reading, Listening, Writing ve Speaking bölümlerini tanıyın; konu anlatımları, sınav pratiği ve canlı destekle planlı hazırlanın.",
    stats: [{ value: "4", label: "Beceri alanı" }, { value: "0–9", label: "Band puanı" }, { value: "3", label: "Speaking bölümü" }, { value: "2", label: "Writing görevi" }],
    steps: sharedSteps,
  },
  TOEFL: {
    badge: "2026 TOEFL iBT formatına uygun",
    headline: "TOEFL iBT’ye güvenle hazırlan.",
    accent: "#3b6fed",
    description: "Güncel soru türlerini öğrenin, konuşma pratiği yapın ve akademik İngilizce becerilerinizi planlı bir programla geliştirin.",
    stats: [{ value: "4", label: "Beceri alanı" }, { value: "1–6", label: "Yeni puan ölçeği" }, { value: "11", label: "Speaking sorusu" }, { value: "8 dk", label: "Speaking süresi" }],
    steps: sharedSteps,
  },
  YDS: {
    badge: "YDS odaklı hazırlık merkezi",
    headline: "YDS hedefinize sistemli ilerleyin.",
    accent: "#f5590b",
    description: "Kelime, dil bilgisi, çeviri ve paragraf stratejilerini tek bir sınav sayfasında bir araya getiren hedefli çalışma deneyimi.",
    stats: [{ value: "80", label: "Soru" }, { value: "180 dk", label: "Sınav süresi" }, { value: "5 yıl", label: "Sonuç geçerliliği" }, { value: "100", label: "Puan" }],
    steps: sharedSteps,
  },
  YOKDIL_SOSYAL: branch("Sosyal Bilimler", "#e94a8c", "sosyal bilimler terminolojisi, akademik metinler ve alan odaklı paragraf soruları"),
  YOKDIL_SAGLIK: branch("Sağlık Bilimleri", "#22a55e", "sağlık terminolojisi, bilimsel metinler ve alan odaklı paragraf soruları"),
  YOKDIL_FEN: branch("Fen Bilimleri", "#5b4fe0", "fen bilimleri terminolojisi, teknik metinler ve alan odaklı paragraf soruları"),
};

function branch(name: string, accent: string, focus: string): ExamLandingContent {
  return {
    badge: `YÖKDİL ${name} hazırlık merkezi`,
    headline: `YÖKDİL ${name} hedefinize odaklanın.`,
    accent,
    description: `Genel İngilizce bilgisini ${focus} ile birleştiren, yalnızca bu alana ayrılmış çalışma sayfası.`,
    stats: [{ value: "80", label: "Soru" }, { value: "180 dk", label: "Sınav süresi" }, { value: "3", label: "Temel soru alanı" }, { value: "100", label: "Puan" }],
    steps: sharedSteps,
  };
}
