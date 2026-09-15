const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreRing({ percent = 78, className = "" }: { percent?: number; className?: string }) {
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r={RADIUS} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="5" />
      <circle
        cx="32"
        cy="32"
        r={RADIUS}
        fill="none"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform="rotate(-90 32 32)"
      />
    </svg>
  );
}
