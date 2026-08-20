import type { Goal, Task, TimeLog } from "./db";

export interface GoalStats {
  weeklyMinutes: number;
  taskCount: number;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function computeGoalStats(
  goals: Goal[],
  tasks: Task[],
  logs: TimeLog[],
  now: number = Date.now()
): Map<string, GoalStats> {
  const cutoff = now - WEEK_MS;
  const stats = new Map<string, GoalStats>();

  for (const goal of goals) {
    stats.set(goal.id, { weeklyMinutes: 0, taskCount: 0 });
  }

  for (const task of tasks) {
    if (task.archived) continue;
    const s = stats.get(task.goalId);
    if (s) s.taskCount += 1;
  }

  for (const log of logs) {
    if (log.startedAt < cutoff || log.actualMinutes == null) continue;
    const s = stats.get(log.goalId);
    if (s) s.weeklyMinutes += log.actualMinutes;
  }

  return stats;
}