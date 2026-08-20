"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import CreateGoalModal from "./CreateGoalModal";
import GoalEditSheet from "./GoalEditSheet";

export default function GoalManager({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect: (goalId?: string) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const goals = useLiveQuery(() => db.goals.filter((g) => !g.archived).toArray(), []);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-6 px-6">
      <button
        onClick={() => onSelect(undefined)}
        className={`shrink-0 px-3 py-1.5 rounded-full text-sm transition-colors ${
          !selected ? "bg-surface-raised text-ink" : "text-muted hover:text-ink"
        }`}
      >
        All
      </button>
      {(goals ?? []).map((g) => (
        <button
          key={g.id}
          onClick={() => onSelect(g.id)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
            selected === g.id ? "bg-surface-raised text-ink" : "text-muted hover:text-ink"
          }`}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
          {g.name}
        </button>
      ))}
      <button
        onClick={() => setModalOpen(true)}
        className="shrink-0 px-3 py-1.5 rounded-full text-sm text-muted hover:text-ink border border-dashed border-white/15"
      >
        + Goal
      </button>
      <button
        onClick={() => setEditOpen(true)}
        aria-label="Edit goals"
        className="shrink-0 px-2.5 py-1.5 rounded-full text-sm text-muted hover:text-ink"
      >
        ✎
      </button>
      <CreateGoalModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <GoalEditSheet open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  );
}
