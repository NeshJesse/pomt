"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import CreateTaskModal from "./CreateTaskModal";
import CreateGoalModal from "./CreateGoalModal";

export default function PrimaryTimeAction() {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setTaskModalOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium bg-ember text-canvas hover:opacity-90 transition-opacity"
      >
        <Plus size={16} strokeWidth={2.5} />
        Give some time
      </button>

      <CreateTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onCreateGoalInstead={() => setGoalModalOpen(true)}
      />
      <CreateGoalModal open={goalModalOpen} onClose={() => setGoalModalOpen(false)} />
    </>
  );
}