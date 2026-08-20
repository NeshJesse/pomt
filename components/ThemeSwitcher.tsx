"use client";

import { Monitor, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import type { Theme } from "@/lib/theme";

const OPTIONS: { value: Theme; label: string; icon: typeof Monitor }[] = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export default function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Appearance"
      className={`flex items-center gap-1 bg-surface-raised rounded-full p-1 ${compact ? "" : "w-fit"}`}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={`flex items-center justify-center rounded-full transition-colors ${
              compact ? "w-8 h-8" : "px-3 py-1.5 gap-1.5"
            } ${active ? "bg-ember text-canvas" : "text-muted hover:text-ink"}`}
          >
            <Icon size={15} strokeWidth={2} />
            {!compact && <span className="text-xs">{label}</span>}
          </button>
        );
      })}
    </div>
  );
}