"use client";

import { useRef, useState } from "react";
import { exportBackup, importBackup, BackupImportError } from "@/lib/backup";

export default function ExportImportSettings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setError(null);
    setStatus(null);
    setBusy(true);
    try {
      await exportBackup();
      setStatus("Backup downloaded.");
    } catch {
      setError("Couldn't create the backup file.");
    } finally {
      setBusy(false);
    }
  }

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    const confirmed = confirm(
      "Importing replaces everything currently stored on this device with the contents of this backup. Continue?"
    );
    if (!confirmed) return;

    setError(null);
    setStatus(null);
    setBusy(true);
    try {
      const result = await importBackup(file);
      setStatus(`Restored ${result.goals} goals, ${result.tasks} tasks, ${result.timeLogs} sessions.`);
    } catch (err) {
      setError(err instanceof BackupImportError ? err.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface rounded-card p-4">
        <p className="text-sm text-ink font-medium mb-1">Export data</p>
        <p className="text-xs text-muted mb-3">
          Everything is stored only in this browser. Download a backup regularly, especially before
          clearing site data or switching browsers.
        </p>
        <button
          onClick={handleExport}
          disabled={busy}
          className="px-4 py-2 rounded-full text-sm font-medium bg-ember text-canvas hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Download backup (.json)
        </button>
      </div>

      <div className="bg-surface rounded-card p-4">
        <p className="text-sm text-ink font-medium mb-1">Import data</p>
        <p className="text-xs text-muted mb-3">
          Restoring a backup replaces all goals, tasks, and sessions currently on this device.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileChosen}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="px-4 py-2 rounded-full text-sm font-medium text-ink border border-white/15 hover:border-white/30 transition-colors disabled:opacity-40"
        >
          Choose backup file…
        </button>
      </div>

      {status && <p className="text-xs text-gold">{status}</p>}
      {error && <p className="text-xs text-ember">{error}</p>}
    </div>
  );
}
