"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import Sheet from "./Sheet";

export default function CreateTaskModal({
  open,
  onClose,
  onCreateGoalInstead,
  presetGoalId,
}: {
  open: boolean;
  onClose: () => void;
  onCreateGoalInstead: () => void;
  presetGoalId?: string;
}) {
  const goals = useLiveQuery(() => db.goals.filter((g) => !g.archived).toArray(), []);
  const [name, setName] = useState("");
  const [goalId, setGoalId] = useState<string | undefined>(presetGoalId);
  const [minutes, setMinutes] = useState(25);
  const [saving, setSaving] = useState(false);

  // Default to the preset goal if given, otherwise the first goal once
  // goals load. Re-sync whenever the modal opens for a new preset.
  useEffect(() => {
    if (!open) return;
    if (presetGoalId) {
      setGoalId(presetGoalId);
    } else if (goals && goals.length > 0 && !goalId) {
      setGoalId(goals[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, presetGoalId, goals]);

  function reset() {
    setName("");
    setMinutes(25);
  }

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed || !goalId || minutes <= 0 || saving) return;
    setSaving(true);
    try {
      await db.tasks.add({
        id: crypto.randomUUID(),
        goalId,
        name: trimmed,
        defaultMinutes: minutes,
        archived: false,
        createdAt: Date.now(),
      });
      reset();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const noGoals = goals && goals.length === 0;

  return (
    <Sheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="New task"
    >
      {noGoals ? (
        <div className="space-y-3 text-center py-4">
          <p className="text-muted text-sm">
            Every task needs a goal it belongs to. Create one first.
          </p>
          <button
            onClick={() => {
              onClose();
              onCreateGoalInstead();
            }}
            className="px-4 py-2 rounded-full text-sm font-medium bg-ember text-canvas hover:opacity-90 transition-opacity"
          >
            Create a goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="e.g. Write landing page copy"
            className="w-full bg-surface-raised rounded-lg px-3 py-2 text-ink text-sm outline-none focus:ring-2 focus:ring-ember"
          />

          <div>
            <p className="text-xs text-muted mb-2">Goal</p>
            <div className="flex flex-wrap gap-1.5">
              {(goals ?? []).map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoalId(g.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    goalId === g.id ? "bg-surface-raised text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted mb-2">Default duration (minutes)</p>
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-24 bg-surface-raised rounded-lg px-3 py-2 text-ink text-sm font-mono-num outline-none focus:ring-2 focus:ring-ember"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={!name.trim() || !goalId || minutes <= 0 || saving}
            className="w-full py-2.5 rounded-full text-sm font-medium bg-ember text-canvas hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create task
          </button>
        </div>
      )}
    </Sheet>
  );
}