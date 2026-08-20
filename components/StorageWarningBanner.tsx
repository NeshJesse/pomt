"use client";

import { useEffect, useState } from "react";
import { isIndexedDBAvailable } from "@/lib/db";

export default function StorageWarningBanner() {
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    setUnavailable(!isIndexedDBAvailable());
  }, []);

  if (!unavailable) return null;

  return (
    <div className="bg-ember/15 border-b border-ember/30 text-ember text-sm text-center px-4 py-2">
      Local storage isn't available in this browser context (private/incognito mode can block it) —
      tasks and streaks won't be saved here.
    </div>
  );
}
