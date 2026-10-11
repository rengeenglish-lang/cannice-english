"use client";
import { useEffect } from "react";
import { recordTopicStudyAction } from "@/app/actions/topics";

/** Counting stops this long after the last scroll, key press, click or touch. */
const IDLE_AFTER_MS = 2 * 60_000;
const REPORT_EVERY_S = 30;

/**
 * Counts the seconds a student actively reads a Konu Anlatımı topic (tab visible and some
 * activity in the last two minutes) and reports them every 30 s, when the topic changes and when
 * the tab is hidden. Feeds "Çalıştığım süre" in Beceri Analizi.
 */
export function useStudyTimer(topicId: string | undefined, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !topicId) return;
    let pending = 0;
    let lastActive = Date.now();
    const flush = () => {
      if (pending <= 0) return;
      const seconds = pending;
      pending = 0;
      void recordTopicStudyAction(topicId, seconds).catch(() => {});
    };
    const active = () => { lastActive = Date.now(); };
    const onVisibility = () => { if (document.visibilityState === "hidden") flush(); };
    const tick = window.setInterval(() => {
      if (document.visibilityState !== "visible" || Date.now() - lastActive > IDLE_AFTER_MS) return;
      pending += 1;
      if (pending >= REPORT_EVERY_S) flush();
    }, 1000);
    const events = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart", "wheel"] as const;
    for (const e of events) window.addEventListener(e, active, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(tick);
      for (const e of events) window.removeEventListener(e, active);
      document.removeEventListener("visibilitychange", onVisibility);
      flush();
    };
  }, [topicId, enabled]);
}
