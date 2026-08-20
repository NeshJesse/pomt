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
          className="pie-slice"
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