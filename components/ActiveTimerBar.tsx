"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { useTimerStore } from "@/store/timerStore";
import PieTimer from "./PieTimer";

/** Small persistent indicator shown across the app while a session is
 * running, so it's never more than a tap away — without the full timer
 * controls competing for attention outside the actual Focus Session. */
export default function ActiveTimerBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { active, hydrate, elapsedSeconds, resume } = useTimerStore();
  const paused = useTimerStore((state) => state.active?.pausedAt != null);
  const [, forceTick] = useState(0);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const task = useLiveQuery(() => (active ? db.tasks.get(active.taskId) : undefined), [active?.taskId]);
  const goal = useLiveQuery(() => (active ? db.goals.get(active.goalId) : undefined), [active?.goalId]);

  if (!active || !task || !goal) return null;
  if (pathname === "/focus") return null; // the focus screen itself is the full experience

  return (
    <button
      onClick={() => {
        if (paused) {
          resume();
          return;
        }
        router.push("/focus");
      }}
      className="fixed bottom-16 md:bottom-0 inset-x-0 z-30 bg-surface-raised border-t border-white/5 px-6 py-3 flex items-center gap-4 text-left hover:bg-surface transition-colors"
    >
      <PieTimer elapsedSeconds={elapsedSeconds()} plannedSeconds={active.plannedSeconds} color={goal.color} size={44} />
      <div className="flex-1 min-w-0 max-w-xl mx-auto flex items-center gap-4">
        <div className="min-w-0">
          <p className="font-display italic text-sm text-ink truncate">{task.name}</p>
          <p className="text-xs text-muted truncate">{goal.name}</p>
        </div>
      </div>
      <span className="text-xs text-muted flex items-center gap-0.5 shrink-0">
        {paused ? "Resume" : "Resume focus"}
        <ChevronRight size={14} />
      </span>
    </button>
  );
}