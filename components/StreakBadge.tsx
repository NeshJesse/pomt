export default function StreakBadge({ current, longest }: { current: number; longest: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-ember">🔥</span>
      <span className="font-mono-num text-ink">{current}</span>
      <span className="text-muted text-sm">day streak · longest {longest}</span>
    </div>
  );
}
