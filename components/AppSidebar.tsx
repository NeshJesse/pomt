"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Home, Target, History, Settings, Flame } from "lucide-react";
import { db } from "@/lib/db";
import { computeStreaks } from "@/lib/streaks";
import ThemeSwitcher from "./ThemeSwitcher";

const PRIMARY_NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/history", label: "History", icon: History },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const logs = useLiveQuery(() => db.timeLogs.toArray(), []);
  const streak = logs ? computeStreaks(logs) : { current: 0, longest: 0 };

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col border-r border-white/5 px-4 py-6">
      <Link href="/" className="flex items-center gap-2.5 px-2 mb-8">
        <span className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-lg shrink-0">
          🥧
        </span>
        <div className="min-w-0">
          <p className="font-display italic text-ink leading-tight truncate">Piece of My Time</p>
          <p className="text-[11px] text-muted truncate">Give what matters a piece of your time.</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {PRIMARY_NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? "bg-surface-raised text-ink" : "text-muted hover:text-ink hover:bg-white/5"
              }`}
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 pt-6">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname.startsWith("/settings")
              ? "bg-surface-raised text-ink"
              : "text-muted hover:text-ink hover:bg-white/5"
          }`}
        >
          <Settings size={17} strokeWidth={2} />
          Settings
        </Link>

        <div className="border-t border-white/5 pt-4 px-3 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Flame size={15} className="text-ember" strokeWidth={2} />
            <span className="font-mono-num text-ink">{streak.current}</span>
            <span>day streak</span>
          </div>
          <ThemeSwitcher compact />
        </div>
      </div>
    </aside>
  );
}