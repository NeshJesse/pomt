"use client";

export default function TimerControls({
  paused,
  onPause,
  onResume,
  onFinish,
  onCancel,
}: {
  paused: boolean;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      {paused && <p className="text-sm text-gold">Paused</p>}

      <button
        onClick={paused ? onResume : onPause}
        className="px-8 py-3 rounded-full text-sm font-medium bg-ember text-canvas hover:opacity-90 transition-opacity min-w-[140px]"
      >
        {paused ? "Resume" : "Pause"}
      </button>

      <div className="flex items-center gap-6 text-sm">
        <button onClick={onFinish} className="text-muted hover:text-ink transition-colors">
          Finish early
        </button>
        <span className="text-white/10">·</span>
        <button onClick={onCancel} className="text-muted hover:text-ember transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}