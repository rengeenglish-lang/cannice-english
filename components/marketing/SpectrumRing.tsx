import { EXAM_META } from "@/lib/exam-types";

const COLORS = Object.values(EXAM_META).map((exam) => exam.solid);
const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 6;
const SEGMENT = CIRCUMFERENCE / COLORS.length - GAP;

export function SpectrumRing({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      {COLORS.map((color, index) => (
        <circle
          key={color}
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${SEGMENT} ${CIRCUMFERENCE - SEGMENT}`}
          strokeDashoffset={-(index * (CIRCUMFERENCE / COLORS.length))}
          transform="rotate(-90 50 50)"
        />
      ))}
    </svg>
  );
}
