"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useTimerStore } from "@/store/timerStore";
import Sheet from "./Sheet";

const DURATION_PRESETS = [5, 10, 15, 25, 45, 60];

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
  const router = useRouter();
  const { start } = useTimerStore();
  const goals = useLiveQuery(() => db.goals.filter((g) => !g.archived).toArray(), []);
  const [name, setName] = useState("");
  const [goalId, setGoalId] = useState<string | undefined>(presetGoalId);
  const [minutes, setMinutes] = useState(25);
  const [customOpen, setCustomOpen] = useState(false);
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
    setCustomOpen(false);
  }

  // Filling this in isn't just adding an item to a list — it's the moment
  // of committing time. So submitting creates the task (for reuse later)
  // and starts the session for it immediately, landing in Focus Session.
  async function handleGiveTime() {
    const trimmed = name.trim();
    if (!trimmed || !goalId || minutes <= 0 || saving) return;
    setSaving(true);
    try {
      const taskId = crypto.randomUUID();
      await db.tasks.add({
        id: taskId,
        goalId,
        name: trimmed,
        defaultMinutes: minutes,
        archived: false,
        createdAt: Date.now(),
      });
      await start({ taskId, goalId, plannedMinutes: minutes });
      reset();
      onClose();
      router.push("/focus");
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
      title="Give some time"
    >
      {noGoals ? (
        <div className="space-y-3 text-center py-4">
          <p className="text-muted text-sm">
            Every piece of time goes toward a goal. Create one first.
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
        <div className="space-y-5">
          <div>
            <p className="text-xs text-muted mb-2">What are you working on?</p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGiveTime()}
              placeholder="e.g. Write landing page copy"
              className="w-full bg-surface-raised rounded-lg px-3 py-2 text-ink text-sm outline-none focus:ring-2 focus:ring-ember"
            />
          </div>

          <div>
            <p className="text-xs text-muted mb-2">For which goal?</p>
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
            <p className="text-xs text-muted mb-2">How much time?</p>
            <div className="flex flex-wrap gap-1.5">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setMinutes(preset);
                    setCustomOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-mono-num transition-colors ${
                    !customOpen && minutes === preset
                      ? "bg-ember text-canvas"
                      : "bg-surface-raised text-muted hover:text-ink"
                  }`}
                >
                  {preset} min
                </button>
              ))}
              <button
                onClick={() => setCustomOpen(true)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  customOpen ? "bg-ember text-canvas" : "bg-surface-raised text-muted hover:text-ink"
                }`}
              >
                Custom
              </button>
            </div>
            {customOpen && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min={1}
                  autoFocus
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="w-24 bg-surface-raised rounded-lg px-3 py-2 text-ink text-sm font-mono-num outline-none focus:ring-2 focus:ring-ember"
                />
                <span className="text-sm text-muted">minutes</span>
              </div>
            )}
          </div>

          <button
            onClick={handleGiveTime}
            disabled={!name.trim() || !goalId || minutes <= 0 || saving}
            className="w-full py-2.5 rounded-full text-sm font-medium bg-ember text-canvas hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Give this time →
          </button>
        </div>
      )}
    </Sheet>
  );
}