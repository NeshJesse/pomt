"use client";

import { useEffect, useState } from "react";
import { useTimerStore } from "@/store/timerStore";
import PieTimer from "./PieTimer";
import type { Goal, Task } from "@/lib/db";

interface ActiveTimerBarProps {
  task: Task;
  goal: Goal;
}

export default function ActiveTimerBar({ task, goal }: ActiveTimerBarProps) {
  const { active, complete, cancel, elapsedSeconds } = useTimerStore();
  const [, forceTick] = useState(0);

  // Recompute from wall-clock every second, not a naive setInterval counter.
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!active) return null;

  return (
    <div className="fixed bottom-16 md:bottom-0 inset-x-0 z-30 bg-surface-raised border-t border-white/5 px-6 py-4">
      <div className="max-w-xl mx-auto flex items-center gap-5">
        <PieTimer
          elapsedSeconds={elapsedSeconds()}
          plannedSeconds={active.plannedSeconds}
          color={goal.color}
          size={72}
        />
        <div className="flex-1 min-w-0">
          <p className="font-display italic text-lg text-ink truncate">{task.name}</p>
          <p className="text-sm text-muted">{goal.name}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => cancel()}
            className="px-3 py-2 rounded-full text-sm text-muted hover:text-ink hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => complete()}
            className="px-4 py-2 rounded-full text-sm font-medium bg-ember text-canvas hover:opacity-90 transition-opacity"
          >
            Mark complete
          </button>
        </div>
      </div>
    </div>
  );
}