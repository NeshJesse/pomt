import { create } from "zustand";
import { db } from "@/lib/db";
import type { LogStatus, TimeLog } from "@/lib/db";

/** A session shorter than this is treated as an accidental tap: the log is
 * deleted rather than marked completed/cancelled, and it does not count
 * toward the streak. */
export const MIN_SESSION_SECONDS = 10;

interface ActiveTimer {
  logId: string;
  taskId: string;
  goalId: string;
  startedAt: number;
  plannedSeconds: number;
}

interface TimerState {
  active: ActiveTimer | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  start: (params: { taskId: string; goalId: string; plannedMinutes: number }) => Promise<void>;
  complete: () => Promise<void>;
  cancel: () => Promise<void>;
  remainingSeconds: () => number;
  elapsedSeconds: () => number;
}

const STORAGE_KEY = "piece-of-my-time:active-timer";

function persistActive(active: ActiveTimer | null) {
  if (typeof window === "undefined") return;
  if (active) localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
  else localStorage.removeItem(STORAGE_KEY);
}

export const useTimerStore = create<TimerState>((set, get) => ({
  active: null,
  hydrated: false,

  hydrate: async () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const active: ActiveTimer = JSON.parse(raw);
        const log = await db.timeLogs.get(active.logId);
        if (log && log.status === "in_progress") {
          set({ active, hydrated: true });
          return;
        }
      } catch {
        /* fall through to clear */
      }
      persistActive(null);
    }
    set({ active: null, hydrated: true });
  },

  start: async ({ taskId, goalId, plannedMinutes }) => {
    const startedAt = Date.now();
    const logId = crypto.randomUUID();
    const log: TimeLog = {
      id: logId,
      taskId,
      goalId,
      startedAt,
      plannedMinutes,
      actualMinutes: null,
      status: "in_progress",
      completedAt: null,
    };
    await db.timeLogs.add(log);
    const active: ActiveTimer = {
      logId,
      taskId,
      goalId,
      startedAt,
      plannedSeconds: plannedMinutes * 60,
    };
    persistActive(active);
    set({ active });
  },

  complete: async () => {
    await finalize(get, set, "completed");
  },

  cancel: async () => {
    await finalize(get, set, "cancelled");
  },

  remainingSeconds: () => {
    const { active } = get();
    if (!active) return 0;
    const elapsed = Math.floor((Date.now() - active.startedAt) / 1000);
    return Math.max(0, active.plannedSeconds - elapsed);
  },

  elapsedSeconds: () => {
    const { active } = get();
    if (!active) return 0;
    return Math.floor((Date.now() - active.startedAt) / 1000);
  },
}));

async function finalize(
  get: () => TimerState,
  set: (partial: Partial<TimerState>) => void,
  status: Exclude<LogStatus, "in_progress">
) {
  const { active } = get();
  if (!active) return;
  const completedAt = Date.now();
  const elapsedSeconds = Math.floor((completedAt - active.startedAt) / 1000);
  const actualMinutes = Math.round(elapsedSeconds / 60);

  if (elapsedSeconds < MIN_SESSION_SECONDS) {
    await db.timeLogs.delete(active.logId);
  } else {
    await db.timeLogs.update(active.logId, { status, completedAt, actualMinutes });
  }

  persistActive(null);
  set({ active: null });
}
