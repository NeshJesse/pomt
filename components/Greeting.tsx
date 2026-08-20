function greetingForHour(hour: number): string {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Winding down";
}

export default function Greeting({ name }: { name: string }) {
  const hour = new Date().getHours();

  return (
    <div>
      <p className="text-sm text-muted">
        {greetingForHour(hour)}, {name}
      </p>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink leading-tight mt-1">
        What are you going to give a piece of your time today?
      </h1>
    </div>
  );
}