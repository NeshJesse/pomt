"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { Flame } from "lucide-react";
import { db } from "@/lib/db";
import { computeStreaks, dayKey } from "@/lib/streaks";

export default function TodayProgress() {
  const logs = useLiveQuery(() => db.timeLogs.toArray(), []);

  if (!logs) return null;

  const today = dayKey(Date.now());
  // Minutes actually given today. In-progress sessions haven't recorded
  // actualMinutes yet, so they contribute once they complete or are cancelled
  // — this stays a simple, honest number rather than a live-ticking guess.
  const minutesToday = logs
    .filter((l) => dayKey(l.startedAt) === today && l.actualMinutes != null)
    .reduce((sum, l) => sum + (l.actualMinutes ?? 0), 0);

  const streak = computeStreaks(logs);

  return (
    <div className="flex items-center gap-6 bg-surface rounded-card px-5 py-4 mt-8">
      <div>
        <p className="text-xs text-muted mb-0.5">Today</p>
        <p className="font-mono-num text-lg text-ink">{minutesToday} min given</p>
      </div>
      <div className="w-px h-8 bg-white/5" />
      <div className="flex items-center gap-1.5 text-sm text-muted">
        <Flame size={15} className="text-ember" strokeWidth={2} />
        <span className="font-mono-num text-ink">{streak.current}</span>
        <span>day streak</span>
      </div>
    </div>
  );
}