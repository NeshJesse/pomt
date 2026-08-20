import { db, type Goal, type Task, type TimeLog } from "./db";

const BACKUP_VERSION = 1;

interface BackupFile {
  app: "piece-of-my-time";
  version: number;
  exportedAt: number;
  goals: Goal[];
  tasks: Task[];
  timeLogs: TimeLog[];
}

export async function exportBackup(): Promise<void> {
  const [goals, tasks, timeLogs] = await Promise.all([
    db.goals.toArray(),
    db.tasks.toArray(),
    db.timeLogs.toArray(),
  ]);

  const payload: BackupFile = {
    app: "piece-of-my-time",
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    goals,
    tasks,
    timeLogs,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `piece-of-my-time-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export class BackupImportError extends Error {}

function isBackupFile(value: unknown): value is BackupFile {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.app === "piece-of-my-time" &&
    Array.isArray(v.goals) &&
    Array.isArray(v.tasks) &&
    Array.isArray(v.timeLogs)
  );
}

/**
 * Merges the backup file into local data: rows are upserted by id (a row in
 * the backup with the same id as an existing row overwrites it; anything
 * else already on the device — from this backup or elsewhere — is kept).
 * This means importing is safe to do repeatedly or across partially-
 * overlapping backups without wiping data the device already has.
 */
export async function importBackup(
  file: File
): Promise<{ goals: number; tasks: number; timeLogs: number }> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BackupImportError("That file isn't valid JSON.");
  }
  if (!isBackupFile(parsed)) {
    throw new BackupImportError("That doesn't look like a Piece of My Time backup file.");
  }

  await db.transaction("rw", db.goals, db.tasks, db.timeLogs, async () => {
    // bulkPut = upsert: inserts new rows, overwrites existing rows with the
    // same id, leaves everything else untouched.
    await Promise.all([
      db.goals.bulkPut(parsed.goals),
      db.tasks.bulkPut(parsed.tasks),
      db.timeLogs.bulkPut(parsed.timeLogs),
    ]);
  });

  return { goals: parsed.goals.length, tasks: parsed.tasks.length, timeLogs: parsed.timeLogs.length };
}