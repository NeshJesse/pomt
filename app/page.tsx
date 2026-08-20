"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import Mascot from "@/components/Mascot";
import Greeting from "@/components/Greeting";
import PrimaryTimeAction from "@/components/PrimaryTimeAction";
import TodayProgress from "@/components/TodayProgress";
import TaskGrid from "@/components/TaskGrid";
import CreateGoalModal from "@/components/CreateGoalModal";

const USER_NAME = "Nehemiah";

export default function Home() {
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const goals = useLiveQuery(() => db.goals.filter((g) => !g.archived).toArray(), []);

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 py-6 md:py-10">
      {/* Mascot = emotional identity, Greeting = intention, button = action.
          Kept as three distinct elements rather than one combined block. */}
      <div className="flex items-start gap-4">
        <Mascot />
        <Greeting name={USER_NAME} />
      </div>

      <div className="mt-6">
        <PrimaryTimeAction />
      </div>

      <TodayProgress />

      <div className="mt-10 space-y-10">
        {(goals ?? []).map((goal) => (
          <section key={goal.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: goal.color }} />
              <h2 className="font-display italic text-lg text-ink">{goal.name}</h2>
            </div>
            <TaskGrid goalFilter={goal.id} />
          </section>
        ))}

        {goals && goals.length === 0 && (
          <div className="rounded-card border border-dashed border-white/15 p-8 text-center">
            <p className="text-sm text-muted mb-3">
              Nothing to give time to yet. Start with a goal — something you're growing,
              learning, or building.
            </p>
            <button
              onClick={() => setGoalModalOpen(true)}
              className="px-4 py-2 rounded-full text-sm font-medium bg-ember text-canvas hover:opacity-90 transition-opacity"
            >
              Create your first goal
            </button>
          </div>
        )}
      </div>

      <CreateGoalModal open={goalModalOpen} onClose={() => setGoalModalOpen(false)} />
    </div>
  );
}