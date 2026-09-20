"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { autoSubmitMockExamAction } from "@/app/actions/diagnostic-attempt";

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

/** Countdown for a timed mock exam. Auto-submits the attempt server-side the moment time runs out. */
export function ExamTimer({
  attemptId,
  startedAt,
  timeLimitMinutes,
}: {
  attemptId: string;
  startedAt: string;
  timeLimitMinutes: number;
}) {
  const deadline = useMemo(() => new Date(startedAt).getTime() + timeLimitMinutes * 60_000, [startedAt, timeLimitMinutes]);
  const [remaining, setRemaining] = useState(() => deadline - Date.now());
  const submittedRef = useRef(false);

  useEffect(() => {
    const tick = () => setRemaining(deadline - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  useEffect(() => {
    if (remaining <= 0 && !submittedRef.current) {
      submittedRef.current = true;
      void autoSubmitMockExamAction(attemptId);
    }
  }, [remaining, attemptId]);

  const urgent = remaining < 5 * 60_000;

  return (
    <p
      role="timer"
      aria-live="polite"
      className={`text-center text-sm font-black tracking-wide ${urgent ? "text-rose-600" : "text-slate-600"}`}
    >
      Kalan süre: {formatRemaining(remaining)}
    </p>
  );
}
