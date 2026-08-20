import type { Goal } from "@/lib/db";

export default function GoalCard({
  goal,
  weeklyMinutes,
  taskCount,
  selected,
  onClick,
}: {
  goal: Goal;
  weeklyMinutes: number;
  taskCount: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  const hours = Math.floor(weeklyMinutes / 60);
  const mins = weeklyMinutes % 60;
  const timeLabel = weeklyMinutes === 0 ? "No time yet this week" : `${hours > 0 ? `${hours}h ` : ""}${mins}m this week`;

  return (
    <button
      onClick={onClick}
      className={`text-left rounded-card p-4 transition-colors ${
        selected ? "bg-surface-raised ring-1 ring-ember/50" : "bg-surface hover:bg-surface-raised"
      }`}
    >
      <span className="w-2.5 h-2.5 rounded-full inline-block mb-2" style={{ backgroundColor: goal.color }} />
      <p className="font-medium text-ink text-sm truncate">{goal.name}</p>
      <p className="text-xs text-muted mt-1">{timeLabel}</p>
      <p className="text-xs text-muted">
        {taskCount} task{taskCount === 1 ? "" : "s"}
      </p>
    </button>
  );
}