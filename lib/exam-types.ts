import type { ExamCode } from "@/lib/generated/prisma/enums";

type ExamPalette = {
  shortLabel: string;
  from: string;
  to: string;
  solid: string;
  soft: string;
};

export const EXAM_META: Record<ExamCode, ExamPalette> = {
  IELTS: { shortLabel: "IELTS", from: "#14b8ac", to: "#0a7d75", solid: "#0f9b8e", soft: "#e2f7f5" },
  TOEFL: { shortLabel: "TOEFL", from: "#4d7cf7", to: "#2450b8", solid: "#3b6fed", soft: "#e8eefe" },
  PTE: { shortLabel: "PTE", from: "#9a6bf5", to: "#6d3fd1", solid: "#8b5cf6", soft: "#f0e9fe" },
  YDS: { shortLabel: "YDS", from: "#ff7a3d", to: "#d1470a", solid: "#f5590b", soft: "#feece1" },
  YOKDIL_SOSYAL: { shortLabel: "YÖKDİL Sosyal", from: "#f2569a", to: "#b52d68", solid: "#e94a8c", soft: "#fce8f0" },
  YOKDIL_SAGLIK: { shortLabel: "YÖKDİL Sağlık", from: "#34c17b", to: "#16803f", solid: "#22a55e", soft: "#e4f7ec" },
  YOKDIL_FEN: { shortLabel: "YÖKDİL Fen", from: "#7069ee", to: "#4038ad", solid: "#5b4fe0", soft: "#eceafd" },
};
