"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import Sheet from "./Sheet";

export const PALETTE = ["#FF7A45", "#F0B429", "#4ADE80", "#38BDF8", "#C084FC", "#F472B6", "#FB923C", "#94A3B8"];

export default function GoalEditSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const goals = useLiveQuery(() => db.goals.filter((g) => !g.archived).toArray(), []);

  async function rename(id: string, name: string) {
    await db.goals.update(id, { name });
  }
  async function recolor(id: string, color: string) {
    await db.goals.update(id, { color });
  }
  async function archive(id: string) {
    await db.goals.update(id, { archived: true });
  }

  return (
    <Sheet open={open} onClose={onClose} title="Edit goals">
      <div className="space-y-5">
        {(goals ?? []).map((g) => (
          <div key={g.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                defaultValue={g.name}
                onBlur={(e) => e.target.value.trim() && rename(g.id, e.target.value.trim())}
                className="flex-1 bg-surface-raised rounded-lg px-3 py-2 text-ink text-sm outline-none focus:ring-2 focus:ring-ember"
              />
              <button
                onClick={() => confirm(`Archive "${g.name}"? Its history stays intact.`) && archive(g.id)}
                className="text-xs text-muted hover:text-ember px-2 py-2"
              >
                Archive
              </button>
            </div>
            <div className="flex gap-1.5">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => recolor(g.id, c)}
                  aria-label={`Set color ${c}`}
                  className="w-6 h-6 rounded-full"
                  style={{
                    backgroundColor: c,
                    outline: g.color === c ? "2px solid var(--color-ink)" : "none",
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
        {goals?.length === 0 && <p className="text-muted text-sm">No goals yet.</p>}
      </div>
    </Sheet>
  );
}
