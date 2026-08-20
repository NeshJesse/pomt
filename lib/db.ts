import Dexie, { type Table } from "dexie";

export interface Goal {
  id: string;
  name: string;
  color: string;
  archived: boolean;
  createdAt: number;
}

export interface Task {
  id: string;
  goalId: string;
  name: string;
  defaultMinutes: number;
  archived: boolean;
  createdAt: number;
}

export type LogStatus = "in_progress" | "completed" | "cancelled";

export interface TimeLog {
  id: string;
  taskId: string;
  goalId: string;
  startedAt: number;
  plannedMinutes: number;
  actualMinutes: number | null;
  status: LogStatus;
  completedAt: number | null;
}

class PieceOfMyTimeDB extends Dexie {
  goals!: Table<Goal, string>;
  tasks!: Table<Task, string>;
  timeLogs!: Table<TimeLog, string>;

  constructor() {
    super("piece-of-my-time");
    this.version(1).stores({
      goals: "id, archived, createdAt",
      tasks: "id, goalId, archived, createdAt",
      timeLogs: "id, taskId, goalId, startedAt, status",
    });
  }
}

export const db = new PieceOfMyTimeDB();

export function isIndexedDBAvailable(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return "indexedDB" in window && window.indexedDB !== null;
  } catch {
    return false;
  }
}
