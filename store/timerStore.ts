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
  /** Timestamp the session was paused at, or null if currently running.
   * On resume, startedAt is shifted forward by the paused duration so the
   * wall-clock math stays correct without needing a separate accumulator. */
  pausedAt: number | null;
}

interface TimerState {
  active: ActiveTimer | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  start: (params: { taskId: string; goalId: string; plannedMinutes: number }) => Promise<void>;
  pause: () => void;
  resume: () => void;
  complete: () => Promise<void>;
  cancel: () => Promise<void>;
  remainingSeconds: () => number;
  elapsedSeconds: () => number;
  isPaused: () => boolean;
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
    if (get().hydrated) return; // idempotent — safe to call from multiple mount points
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
      pausedAt: null,
    };
    persistActive(active);
    set({ active });
  },

  pause: () => {
    const { active } = get();
    if (!active || active.pausedAt) return;
    const next: ActiveTimer = { ...active, pausedAt: Date.now() };
    persistActive(next);
    set({ active: next });
  },

  resume: () => {
    const { active } = get();
    if (!active || !active.pausedAt) return;
    const pausedDuration = Date.now() - active.pausedAt;
    const next: ActiveTimer = {
      ...active,
      startedAt: active.startedAt + pausedDuration,
      pausedAt: null,
    };
    persistActive(next);
    set({ active: next });
  },

  complete: async () => {
    await finalize(get, set, "completed");
  },

  cancel: async () => {
    await finalize(get, set, "cancelled");
  },

  isPaused: () => {
    return get().active?.pausedAt != null;
  },

  remainingSeconds: () => {
    const { active } = get();
    if (!active) return 0;
    return Math.max(0, active.plannedSeconds - get().elapsedSeconds());
  },

  elapsedSeconds: () => {
    const { active } = get();
    if (!active) return 0;
    // While paused, freeze the clock at the moment pause() was called
    // instead of continuing to advance against Date.now().
    const referenceNow = active.pausedAt ?? Date.now();
    return Math.floor((referenceNow - active.startedAt) / 1000);
  },
}));

async function finalize(
  get: () => TimerState,
  set: (partial: Partial<TimerState>) => void,
  status: Exclude<LogStatus, "in_progress">
) {
  const { active } = get();
  if (!active) return;
  const elapsedSeconds = get().elapsedSeconds();
  const completedAt = Date.now();
  const actualMinutes = Math.round(elapsedSeconds / 60);

  if (elapsedSeconds < MIN_SESSION_SECONDS) {
    await db.timeLogs.delete(active.logId);
  } else {
    await db.timeLogs.update(active.logId, { status, completedAt, actualMinutes });
  }

  persistActive(null);
  set({ active: null });
}