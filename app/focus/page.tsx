"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { computeStreaks } from "@/lib/streaks";
import { useTimerStore, MIN_SESSION_SECONDS } from "@/store/timerStore";
import PieTimer from "@/components/PieTimer";
import TimerControls from "@/components/TimerControls";
import SessionComplete from "@/components/SessionComplete";

interface JustCompleted {
  minutes: number;
  goalName: string;
}

export default function FocusSessionPage() {
  const router = useRouter();
  const {
    active,
    hydrated,
    hydrate,
    pause,
    resume,
    complete,
    cancel,
    remainingSeconds,
    elapsedSeconds,
  } = useTimerStore();
  const paused = useTimerStore((state) => state.active?.pausedAt != null);

  const [, forceTick] = useState(0);
  const [justCompleted, setJustCompleted] = useState<JustCompleted | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Recompute from wall-clock every second — the store derives the actual
  // values from timestamps, this just triggers a re-render to show them.
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // No active session and nothing to celebrate — this route only makes
  // sense while a session is running. Send the user back home.
  useEffect(() => {
    if (hydrated && !active && !justCompleted) {
      router.replace("/");
    }
  }, [hydrated, active, justCompleted, router]);

  const task = useLiveQuery(() => (active ? db.tasks.get(active.taskId) : undefined), [active?.taskId]);
  const goal = useLiveQuery(() => (active ? db.goals.get(active.goalId) : undefined), [active?.goalId]);
  const logs = useLiveQuery(() => db.timeLogs.toArray(), []);
  const streak = logs ? computeStreaks(logs).current : 0;

  async function handleFinish() {
    if (!active || !goal) return;
    const elapsed = elapsedSeconds();
    const minutes = Math.round(elapsed / 60);
    const goalName = goal.name;
    await complete();
    // A tap shorter than the minimum session length is treated as
    // accidental (per store logic) — nothing meaningful to celebrate.
    if (elapsed >= MIN_SESSION_SECONDS) {
      setJustCompleted({ minutes, goalName });
    }
  }

  async function handleCancel() {
    await cancel();
    router.push("/");
  }

  if (justCompleted) {
    return (
      <div className="max-w-md mx-auto px-6 py-10">
        <SessionComplete
          minutes={justCompleted.minutes}
          goalName={justCompleted.goalName}
          streak={streak}
          onBackHome={() => router.push("/")}
        />
      </div>
    );
  }

  if (!hydrated || !active || !task || !goal) return null;

  return (
    <div className="max-w-md mx-auto px-6 py-10 flex flex-col items-center gap-10">
      <PieTimer
        elapsedSeconds={elapsedSeconds()}
        plannedSeconds={active.plannedSeconds}
        color={goal.color}
        size={280}
      />

      <div className="text-center">
        <p className="font-display italic text-2xl text-ink">{task.name}</p>
        <p className="text-sm text-muted mt-1">{goal.name}</p>
      </div>

      <TimerControls
        paused={paused}
        onPause={pause}
        onResume={resume}
        onFinish={handleFinish}
        onCancel={handleCancel}
      />

      {/* Screen-reader announcement for completion, without relying on a
          constant live region that would spam every tick. */}
      <span aria-live="polite" className="sr-only">
        {remainingSeconds() === 0 ? `Time's up for ${task.name}.` : ""}
      </span>
    </div>
  );
}