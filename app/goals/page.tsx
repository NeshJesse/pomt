"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { computeGoalStats } from "@/lib/goalStats";
import GoalCard from "@/components/GoalCard";
import CreateGoalModal from "@/components/CreateGoalModal";
import TaskGrid from "@/components/TaskGrid";
import { PALETTE } from "@/components/GoalEditSheet";

export default function GoalsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const goals = useLiveQuery(() => db.goals.filter((g) => !g.archived).toArray(), []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), []);
  const logs = useLiveQuery(() => db.timeLogs.toArray(), []);

  // Select the first goal once loaded, similar to a default tab.
  useEffect(() => {
    if (goals && goals.length > 0 && !selectedId) setSelectedId(goals[0].id);
  }, [goals, selectedId]);

  const stats = goals && tasks && logs ? computeGoalStats(goals, tasks, logs) : new Map();
  const selected = goals?.find((g) => g.id === selectedId);

  async function rename(id: string, name: string) {
    await db.goals.update(id, { name });
  }
  async function recolor(id: string, color: string) {
    await db.goals.update(id, { color });
  }
  async function archive(id: string, name: string) {
    if (confirm(`Archive "${name}"? Its history stays intact.`)) {
      await db.goals.update(id, { archived: true });
      if (selectedId === id) setSelectedId(undefined);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display italic text-2xl text-ink">Goals</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-full text-sm font-medium bg-ember text-canvas hover:opacity-90 transition-opacity"
        >
          + New goal
        </button>
      </div>

      {goals && goals.length === 0 ? (
        <p className="text-muted text-sm">No goals yet — create one to get started.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 mb-10">
            {(goals ?? []).map((goal) => {
              const s = stats.get(goal.id) ?? { weeklyMinutes: 0, taskCount: 0 };
              return (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  weeklyMinutes={s.weeklyMinutes}
                  taskCount={s.taskCount}
                  selected={selectedId === goal.id}
                  onClick={() => setSelectedId(goal.id)}
                />
              );
            })}
          </div>

          {selected && (
            <section className="space-y-6">
              <div className="bg-surface rounded-card p-4 max-w-lg space-y-3">
                <p className="text-xs text-muted">Edit goal</p>
                <div className="flex items-center gap-2">
                  <input
                    key={selected.id}
                    defaultValue={selected.name}
                    onBlur={(e) => e.target.value.trim() && rename(selected.id, e.target.value.trim())}
                    className="flex-1 bg-surface-raised rounded-lg px-3 py-2 text-ink text-sm outline-none focus:ring-2 focus:ring-ember"
                  />
                  <button
                    onClick={() => archive(selected.id, selected.name)}
                    className="text-xs text-muted hover:text-ember px-2 py-2 shrink-0"
                  >
                    Archive
                  </button>
                </div>
                <div className="flex gap-1.5">
                  {PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() => recolor(selected.id, c)}
                      aria-label={`Set color ${c}`}
                      className="w-6 h-6 rounded-full"
                      style={{
                        backgroundColor: c,
                        outline: selected.color === c ? "2px solid var(--color-ink)" : "none",
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted mb-3">Tasks under {selected.name}</p>
                <TaskGrid goalFilter={selected.id} />
              </div>
            </section>
          )}
        </>
      )}

      <CreateGoalModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}