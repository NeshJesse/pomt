// components/GoalManager.tsx
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


// components/TaskEditSheet.tsx
"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import Sheet from "./Sheet";

export default function TaskEditSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const tasks = useLiveQuery(() => db.tasks.filter((t) => !t.archived).toArray(), []);
  const goals = useLiveQuery(() => db.goals.toArray(), []);
  const goalMap = new Map((goals ?? []).map((g) => [g.id, g]));

  async function rename(id: string, name: string) {
    await db.tasks.update(id, { name });
  }
  async function redurate(id: string, defaultMinutes: number) {
    if (defaultMinutes > 0) await db.tasks.update(id, { defaultMinutes });
  }
  async function archive(id: string) {
    await db.tasks.update(id, { archived: true });
  }

  return (
    <Sheet open={open} onClose={onClose} title="Edit tasks">
      <div className="space-y-3">
        {(tasks ?? []).map((t) => {
          const goal = goalMap.get(t.goalId);
          return (
            <div key={t.id} className="flex items-center gap-2">
              {goal && (
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: goal.color }} />
              )}
              <input
                defaultValue={t.name}
                onBlur={(e) => e.target.value.trim() && rename(t.id, e.target.value.trim())}
                className="flex-1 min-w-0 bg-surface-raised rounded-lg px-3 py-2 text-ink text-sm outline-none focus:ring-2 focus:ring-ember"
              />
              <input
                type="number"
                min={1}
                defaultValue={t.defaultMinutes}
                onBlur={(e) => redurate(t.id, Number(e.target.value))}
                className="w-16 bg-surface-raised rounded-lg px-2 py-2 text-ink text-sm font-mono-num outline-none focus:ring-2 focus:ring-ember"
              />
              <button
                onClick={() => confirm(`Archive "${t.name}"? Its history stays intact.`) && archive(t.id)}
                className="text-xs text-muted hover:text-ember px-1.5 py-2 shrink-0"
              >
                Archive
              </button>
            </div>
          );
        })}
        {tasks?.length === 0 && <p className="text-muted text-sm">No tasks yet.</p>}
      </div>
    </Sheet>
  );
}

// components/GoalEditSheet.tsx
"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import Sheet from "./Sheet";

const PALETTE = ["#FF7A45", "#F0B429", "#4ADE80", "#38BDF8", "#C084FC", "#F472B6", "#FB923C", "#94A3B8"];

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

// components/TaskGrid.tsx
"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useTimerStore } from "@/store/timerStore";

export default function TaskGrid({ goalFilter }: { goalFilter?: string }) {
  const tasks = useLiveQuery(
    () => db.tasks.where("archived").equals(0 as unknown as boolean).toArray(),
    []
  );
  const goals = useLiveQuery(() => db.goals.toArray(), []);
  const { start, active } = useTimerStore();

  const goalMap = new Map((goals ?? []).map((g) => [g.id, g]));
  const visibleTasks = (tasks ?? []).filter((t) => !goalFilter || t.goalId === goalFilter);

  if (!tasks) return <p className="text-muted text-sm">Loading tasks…</p>;

  if (visibleTasks.length === 0) {
    return (
      <div className="rounded-card bg-surface p-8 text-center text-muted text-sm">
        No tasks yet. Create one to give it a piece of your time.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {visibleTasks.map((task) => {
        const goal = goalMap.get(task.goalId);
        if (!goal) return null;
        return (
          <button
            key={task.id}
            disabled={!!active}
            onClick={() => start({ taskId: task.id, goalId: goal.id, plannedMinutes: task.defaultMinutes })}
            className="rounded-card bg-surface hover:bg-surface-raised transition-colors p-4 text-left disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full mb-2"
              style={{ backgroundColor: goal.color }}
            />
            <p className="font-medium text-ink text-sm truncate">{task.name}</p>
            <p className="text-xs text-muted mt-0.5">{task.defaultMinutes} min</p>
          </button>
        );
      })}
    </div>
  );
}

// components/Sheet.tsx
"use client";

export default function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface rounded-t-card sm:rounded-card w-full sm:max-w-sm max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-display italic text-xl text-ink">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-ink text-sm">
            Done
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

// components/PieTimer.tsx
"use client";

import { useEffect, useState } from "react";

interface PieTimerProps {
  elapsedSeconds: number;
  plannedSeconds: number;
  color: string; // goal color, hex
  size?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

/** SVG path for a pie slice from 0deg to `angleDeg` (clockwise from top). */
function slicePath(cx: number, cy: number, r: number, angleDeg: number) {
  if (angleDeg >= 359.999) {
    // full circle — draw as two arcs, a single arc command can't close 360°
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
  }
  const start = polarToCartesian(cx, cy, r, 0);
  const end = polarToCartesian(cx, cy, r, angleDeg);
  const largeArc = angleDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function formatTime(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function PieTimer({ elapsedSeconds, plannedSeconds, color, size = 220 }: PieTimerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  const rawProgress = plannedSeconds > 0 ? elapsedSeconds / plannedSeconds : 0;
  const isOvertime = rawProgress > 1;
  const progress = Math.min(1, rawProgress);
  const angle = mounted ? progress * 360 : 0;

  const remaining = plannedSeconds - elapsedSeconds;
  const centerLabel = isOvertime ? `+${formatTime(elapsedSeconds - plannedSeconds)}` : formatTime(remaining);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Session progress">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ring-track)" strokeWidth={2} />
        <path
          d={slicePath(cx, cy, r, angle)}
          fill={color}
          fillOpacity={isOvertime ? 0.45 : 0.9}
          style={{ transition: "d 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
        <circle cx={cx} cy={cy} r={r * 0.62} fill="var(--color-canvas)" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-mono-num text-3xl ${isOvertime ? "text-ember" : "text-ink"}`}>
          {centerLabel}
        </span>
        <span className="text-xs text-muted mt-1">{isOvertime ? "over" : "left"}</span>
      </div>
    </div>
  );
}

// components/MascotGreeting.tsx
"use client";

function greetingForHour(hour: number): string {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Winding down";
}

export default function MascotGreeting({ name }: { name: string }) {
  const hour = new Date().getHours();

  return (
    <div className="flex items-center gap-4 py-8">
      <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center text-2xl shrink-0">
        🥧
      </div>
      <div>
        <p className="text-sm text-muted">{greetingForHour(hour)}, {name}</p>
        <h1 className="font-display italic text-2xl text-ink leading-tight">
          What are you going to give a piece of your time today?
        </h1>
      </div>
    </div>
  );
}

// components/ActiveTimerBar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useTimerStore } from "@/store/timerStore";
import PieTimer from "./PieTimer";
import type { Goal, Task } from "@/lib/db";

interface ActiveTimerBarProps {
  task: Task;
  goal: Goal;
}

export default function ActiveTimerBar({ task, goal }: ActiveTimerBarProps) {
  const { active, complete, cancel, elapsedSeconds } = useTimerStore();
  const [, forceTick] = useState(0);
  const raf = useRef<number>();

  // Recompute from wall-clock every second, not a naive setInterval counter.
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!active) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-surface-raised border-t border-white/5 px-6 py-4">
      <div className="max-w-xl mx-auto flex items-center gap-5">
        <PieTimer
          elapsedSeconds={elapsedSeconds()}
          plannedSeconds={active.plannedSeconds}
          color={goal.color}
          size={72}
        />
        <div className="flex-1 min-w-0">
          <p className="font-display italic text-lg text-ink truncate">{task.name}</p>
          <p className="text-sm text-muted">{goal.name}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => cancel()}
            className="px-3 py-2 rounded-full text-sm text-muted hover:text-ink hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => complete()}
            className="px-4 py-2 rounded-full text-sm font-medium bg-ember text-canvas hover:opacity-90 transition-opacity"
          >
            Mark complete
          </button>
        </div>
      </div>
    </div>
  );
}

// lib/streaks.ts
import type { TimeLog } from "./db";

/** Local calendar-day key, e.g. "2026-08-19" — avoids UTC boundary bugs. */
export function dayKey(timestamp: number): string {
  const d = new Date(timestamp);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function uniqueActiveDays(logs: TimeLog[]): Set<string> {
  // Every log counts, including in_progress and cancelled —
  // per PRD philosophy, showing up is what builds the streak.
  return new Set(logs.map((l) => dayKey(l.startedAt)));
}

export interface StreakResult {
  current: number;
  longest: number;
}

export function computeStreaks(logs: TimeLog[], now: number = Date.now()): StreakResult {
  const days = uniqueActiveDays(logs);
  if (days.size === 0) return { current: 0, longest: 0 };

  const sorted = Array.from(days).sort(); // ISO strings sort chronologically
  const dayMs = 24 * 60 * 60 * 1000;

  // Longest streak: walk sorted unique days, break when gap > 1 day.
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00").getTime();
    const cur = new Date(sorted[i] + "T00:00:00").getTime();
    const gapDays = Math.round((cur - prev) / dayMs);
    run = gapDays === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  // Current streak: walk backward from today (or yesterday, if today has no
  // log yet — a streak isn't broken until a full day is missed).
  const todayKey = dayKey(now);
  const yesterdayKey = dayKey(now - dayMs);
  let cursorKey = days.has(todayKey) ? todayKey : yesterdayKey;
  if (!days.has(cursorKey)) return { current: 0, longest };

  let current = 0;
  let cursor = new Date(cursorKey + "T00:00:00").getTime();
  while (days.has(dayKey(cursor))) {
    current += 1;
    cursor -= dayMs;
  }

  return { current, longest };
}

// lib/db.ts
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

// store/timerStore.ts
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

// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { computeStreaks } from "@/lib/streak";
import { useTimerStore } from "@/store/timerStore";
import MascotGreeting from "@/components/MascotGreeting";
import TaskGrid from "@/components/TaskGrid";
import ActiveTimerBar from "@/components/ActiveTimerBar";
import TaskEditSheet from "@/components/TaskEditSheet";

const USER_NAME = "Nehemiah";

export default function Home() {
  const { active, hydrate, hydrated } = useTimerStore();
  const [taskEditOpen, setTaskEditOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const logs = useLiveQuery(() => db.timeLogs.toArray(), []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), []);
  const goals = useLiveQuery(() => db.goals.toArray(), []);

  const streak = logs ? computeStreaks(logs) : { current: 0, longest: 0 };
  const activeTask = active && tasks?.find((t) => t.id === active.taskId);
  const activeGoal = active && goals?.find((g) => g.id === active.goalId);

  if (!hydrated) return null; // avoid a flash before we know if a timer is running

  return (
    <main className="max-w-xl mx-auto px-6 pb-32">
      <MascotGreeting name={USER_NAME} />

      <div className="flex items-center gap-2 mb-6">
        <span className="text-ember">🔥</span>
        <span className="font-mono-num text-ink">{streak.current}</span>
        <span className="text-muted text-sm">day streak · longest {streak.longest}</span>
      </div>

      <TaskGrid />

      {active && activeTask && activeGoal && (
        <ActiveTimerBar task={activeTask} goal={activeGoal} />
      )}
    </main>
  );
}

// lib/db.ts
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