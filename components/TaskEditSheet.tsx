"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import Sheet from "./Sheet";

export default function TaskEditSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const tasks = useLiveQuery(() => db.tasks.filter((t) => !t.archived).toArray(), []);
  const goals = useLiveQuery(() => db.goals.toArray(), []);
  const goalMap = new Map((goals ?? []).map((g) => [g.id, g]));

  async function rename(id: string, name: string) {
    await db.tasks.update(id, { name });
  }
  async function redurate(id: string, defaultMinutes: number) {
    if (defaultMinutes > 0) await db.tasks.update(id, { defaultMinutes });
  }
  async function archive(id: string) {
    await db.tasks.update(id, { archived: true });
  }

  return (
    <Sheet open={open} onClose={onClose} title="Edit tasks">
      <div className="space-y-3">
        {(tasks ?? []).map((t) => {
          const goal = goalMap.get(t.goalId);
          return (
            <div key={t.id} className="flex items-center gap-2">
              {goal && (
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: goal.color }} />
              )}
              <input
                defaultValue={t.name}
                onBlur={(e) => e.target.value.trim() && rename(t.id, e.target.value.trim())}
                className="flex-1 min-w-0 bg-surface-raised rounded-lg px-3 py-2 text-ink text-sm outline-none focus:ring-2 focus:ring-ember"
              />
              <input
                type="number"
                min={1}
                defaultValue={t.defaultMinutes}
                onBlur={(e) => redurate(t.id, Number(e.target.value))}
                className="w-16 bg-surface-raised rounded-lg px-2 py-2 text-ink text-sm font-mono-num outline-none focus:ring-2 focus:ring-ember"
              />
              <button
                onClick={() => confirm(`Archive "${t.name}"? Its history stays intact.`) && archive(t.id)}
                className="text-xs text-muted hover:text-ember px-1.5 py-2 shrink-0"
              >
                Archive
              </button>
            </div>
          );
        })}
        {tasks?.length === 0 && <p className="text-muted text-sm">No tasks yet.</p>}
      </div>
    </Sheet>
  );
}
