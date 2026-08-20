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
