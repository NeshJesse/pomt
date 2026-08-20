"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type TimeLog } from "@/lib/db";
import { dayKey } from "@/lib/streaks";

const WEEKS = 18;
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function intensityClass(count: number) {
  if (count === 0) return "bg-white/5";
  if (count === 1) return "bg-ember/35";
  if (count === 2) return "bg-ember/60";
  return "bg-ember";
}

type Range = "week" | "month" | "all";

export default function HistoryView() {
  const logs = useLiveQuery(() => db.timeLogs.orderBy("startedAt").reverse().toArray(), []);
  const goals = useLiveQuery(() => db.goals.toArray(), []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), []);
  const [range, setRange] = useState<Range>("week");

  const goalMap = new Map((goals ?? []).map((g) => [g.id, g]));
  const taskMap = new Map((tasks ?? []).map((t) => [t.id, t]));

  const heatmapDays = useMemo(() => {
    const today = startOfDay(Date.now());
    const totalDays = WEEKS * 7;
    const countsByDay = new Map<string, number>();
    for (const log of logs ?? []) {
      const key = dayKey(log.startedAt);
      countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
    }
    const days: { key: string; count: number; date: Date }[] = [];
    for (let i = totalDays - 1; i >= 0; i--) {
      const ts = today - i * DAY_MS;
      const key = dayKey(ts);
      days.push({ key, count: countsByDay.get(key) ?? 0, date: new Date(ts) });
    }
    return days;
  }, [logs]);

  // Group into columns of 7 (weeks), Sunday-first.
  const weeks = useMemo(() => {
    const cols: typeof heatmapDays[] = [];
    const firstDow = heatmapDays[0]?.date.getDay() ?? 0;
    const padded = [...Array(firstDow).fill(null), ...heatmapDays];
    for (let i = 0; i < padded.length; i += 7) {
      cols.push(padded.slice(i, i + 7) as typeof heatmapDays);
    }
    return cols;
  }, [heatmapDays]);

  const totalsByGoal = useMemo(() => {
    const cutoff =
      range === "week"
        ? Date.now() - 7 * DAY_MS
        : range === "month"
        ? Date.now() - 30 * DAY_MS
        : 0;
    const totals = new Map<string, number>();
    for (const log of logs ?? []) {
      if (log.startedAt < cutoff) continue;
      if (log.status !== "completed" && log.status !== "cancelled") continue;
      const minutes = log.actualMinutes ?? 0;
      totals.set(log.goalId, (totals.get(log.goalId) ?? 0) + minutes);
    }
    return totals;
  }, [logs, range]);

  if (!logs || !goals || !tasks) {
    return <p className="text-muted text-sm">Loading history…</p>;
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display italic text-lg text-ink mb-3">Days you showed up</h2>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) =>
                day ? (
                  <div
                    key={day.key}
                    title={`${day.key} · ${day.count} session${day.count === 1 ? "" : "s"}`}
                    className={`w-3 h-3 rounded-sm ${intensityClass(day.count)}`}
                  />
                ) : (
                  <div key={di} className="w-3 h-3" />
                )
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display italic text-lg text-ink">Time given per goal</h2>
          <div className="flex gap-1 text-xs">
            {(["week", "month", "all"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  range === r ? "bg-surface-raised text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {r === "week" ? "7 days" : r === "month" ? "30 days" : "All time"}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {goals.length === 0 && <p className="text-muted text-sm">No goals yet.</p>}
          {goals.map((g) => {
            const minutes = totalsByGoal.get(g.id) ?? 0;
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return (
              <div key={g.id} className="flex items-center gap-3 bg-surface rounded-card px-4 py-3">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                <span className="flex-1 text-sm text-ink truncate">{g.name}</span>
                <span className="font-mono-num text-sm text-muted">
                  {hours > 0 ? `${hours}h ` : ""}
                  {mins}m
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-display italic text-lg text-ink mb-3">Sessions</h2>
        <div className="space-y-1">
          {logs.length === 0 && <p className="text-muted text-sm">No sessions logged yet.</p>}
          {logs.slice(0, 100).map((log) => (
            <SessionRow key={log.id} log={log} taskName={taskMap.get(log.taskId)?.name} goal={goalMap.get(log.goalId)} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SessionRow({
  log,
  taskName,
  goal,
}: {
  log: TimeLog;
  taskName?: string;
  goal?: { name: string; color: string };
}) {
  const date = new Date(log.startedAt);
  const dateLabel = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const timeLabel = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  const statusLabel =
    log.status === "in_progress" ? "in progress" : log.status === "completed" ? "completed" : "cancelled";
  const statusColor =
    log.status === "in_progress" ? "text-gold" : log.status === "completed" ? "text-ink" : "text-muted";

  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      {goal && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: goal.color }} />}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink truncate">{taskName ?? "Deleted task"}</p>
        <p className="text-xs text-muted">
          {dateLabel} · {timeLabel}
          {goal ? ` · ${goal.name}` : ""}
        </p>
      </div>
      <span className={`text-xs font-mono-num ${statusColor}`}>
        {log.actualMinutes != null ? `${log.actualMinutes}m` : `${log.plannedMinutes}m planned`}
      </span>
      <span className="text-xs text-muted w-16 text-right">{statusLabel}</span>
    </div>
  );
}
