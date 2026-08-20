"use client";

import { Flame } from "lucide-react";

export default function SessionComplete({
  minutes,
  goalName,
  streak,
  onBackHome,
}: {
  minutes: number;
  goalName: string;
  streak: number;
  onBackHome: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-6 py-16">
      <p className="font-display italic text-3xl text-ink">Piece given.</p>
      <p className="text-lg text-ink">
        {minutes} minute{minutes === 1 ? "" : "s"} to
        <br />
        {goalName}.
      </p>
      {streak > 0 && (
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <Flame size={15} className="text-ember" strokeWidth={2} />
          Your {streak} day streak continues.
        </p>
      )}
      <button
        onClick={onBackHome}
        className="mt-2 px-6 py-2.5 rounded-full text-sm font-medium bg-ember text-canvas hover:opacity-90 transition-opacity"
      >
        Back home
      </button>
    </div>
  );
}