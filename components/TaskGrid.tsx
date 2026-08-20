"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useTimerStore } from "@/store/timerStore";
import CreateTaskModal from "./CreateTaskModal";
import CreateGoalModal from "./CreateGoalModal";

export default function TaskGrid({ goalFilter }: { goalFilter?: string }) {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  // NOTE: fixed — Dexie can't reliably index a boolean with .where().equals(),
  // so this now filters client-side like the rest of the app does.
  const tasks = useLiveQuery(() => db.tasks.filter((t) => !t.archived).toArray(), []);
  const goals = useLiveQuery(() => db.goals.toArray(), []);
  const { start, active } = useTimerStore();

  const goalMap = new Map((goals ?? []).map((g) => [g.id, g]));
  const visibleTasks = (tasks ?? []).filter((t) => !goalFilter || t.goalId === goalFilter);

  if (!tasks) return <p className="text-muted text-sm">Loading tasks…</p>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
      {visibleTasks.map((task) => {
        const goal = goalMap.get(task.goalId);
        if (!goal) return null;
        return (
          <button
            key={task.id}
            disabled={!!active}
            onClick={() => start({ taskId: task.id, goalId: goal.id, plannedMinutes: task.defaultMinutes })}
            className="group rounded-card bg-surface hover:bg-surface-raised transition-colors p-4 text-left disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full mb-2"
              style={{ backgroundColor: goal.color }}
            />
            <p className="font-medium text-ink text-sm truncate">{task.name}</p>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-xs text-muted font-mono-num">{task.defaultMinutes} min</p>
              <span className="text-muted opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
          </button>
        );
      })}

      <button
        onClick={() => setTaskModalOpen(true)}
        className="rounded-card border border-dashed border-white/15 p-4 text-left text-muted hover:text-ink hover:border-white/30 transition-colors flex flex-col items-start justify-center min-h-[76px]"
      >
        <span className="text-lg leading-none mb-1">+</span>
        <span className="text-sm">Add task</span>
      </button>

      {visibleTasks.length === 0 && (
        <div className="col-span-2 sm:col-span-3 xl:col-span-4 -mt-3 text-muted text-xs">
          {goalFilter ? "No tasks under this goal yet." : "No tasks yet — give one a piece of your time."}
        </div>
      )}

      <CreateTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onCreateGoalInstead={() => setGoalModalOpen(true)}
        presetGoalId={goalFilter}
      />
      <CreateGoalModal open={goalModalOpen} onClose={() => setGoalModalOpen(false)} />
    </div>
  );
}