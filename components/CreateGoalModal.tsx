"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import Sheet from "./Sheet";
import { PALETTE } from "./GoalEditSheet";

export default function CreateGoalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PALETTE[0]);
  const [saving, setSaving] = useState(false);

  function reset() {
    setName("");
    setColor(PALETTE[0]);
  }

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await db.goals.add({
        id: crypto.randomUUID(),
        name: trimmed,
        color,
        archived: false,
        createdAt: Date.now(),
      });
      reset();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="New goal"
    >
      <div className="space-y-4">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="e.g. Grow my business"
          className="w-full bg-surface-raised rounded-lg px-3 py-2 text-ink text-sm outline-none focus:ring-2 focus:ring-ember"
        />
        <div>
          <p className="text-xs text-muted mb-2">Color</p>
          <div className="flex gap-1.5">
            {PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={`Set color ${c}`}
                className="w-7 h-7 rounded-full"
                style={{
                  backgroundColor: c,
                  outline: color === c ? "2px solid var(--color-ink)" : "none",
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={!name.trim() || saving}
          className="w-full py-2.5 rounded-full text-sm font-medium bg-ember text-canvas hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Create goal
        </button>
      </div>
    </Sheet>
  );
}
