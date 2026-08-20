import type { TimeLog } from "./db";

/** Local calendar-day key, e.g. "2026-08-19" — avoids UTC boundary bugs. */
export function dayKey(timestamp: number): string {
  const d = new Date(timestamp);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function uniqueActiveDays(logs: TimeLog[]): Set<string> {
  // Every log counts, including in_progress and cancelled —
  // per PRD philosophy, showing up is what builds the streak.
  return new Set(logs.map((l) => dayKey(l.startedAt)));
}

export interface StreakResult {
  current: number;
  longest: number;
}

export function computeStreaks(logs: TimeLog[], now: number = Date.now()): StreakResult {
  const days = uniqueActiveDays(logs);
  if (days.size === 0) return { current: 0, longest: 0 };

  const sorted = Array.from(days).sort(); // ISO strings sort chronologically
  const dayMs = 24 * 60 * 60 * 1000;

  // Longest streak: walk sorted unique days, break when gap > 1 day.
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00").getTime();
    const cur = new Date(sorted[i] + "T00:00:00").getTime();
    const gapDays = Math.round((cur - prev) / dayMs);
    run = gapDays === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  // Current streak: walk backward from today (or yesterday, if today has no
  // log yet — a streak isn't broken until a full day is missed).
  const todayKey = dayKey(now);
  const yesterdayKey = dayKey(now - dayMs);
  let cursorKey = days.has(todayKey) ? todayKey : yesterdayKey;
  if (!days.has(cursorKey)) return { current: 0, longest };

  let current = 0;
  let cursor = new Date(cursorKey + "T00:00:00").getTime();
  while (days.has(dayKey(cursor))) {
    current += 1;
    cursor -= dayMs;
  }

  return { current, longest };
}
