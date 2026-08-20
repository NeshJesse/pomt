# Product Requirements Document: Piece of My Time

**Owner:** Nehemiah
**Status:** Draft v1
**Last updated:** August 19, 2026

---

## 1. Overview

Piece of My Time is a personal web app that helps its user allocate focused chunks of time to the goals and dreams that matter to them. Each session opens with a mascot prompt — *"Hi Nehemiah, what are you going to give a piece of your time today?"* — and the user responds by starting a timed task tied to a goal. Every session logged builds a streak, reinforcing consistent action over long-term ambitions.

## 2. Problem Statement

Goals and dreams (growing a business, learning a skill, creative projects) compete with daily distractions. Without a lightweight way to commit small, trackable chunks of time to them, progress stalls. This app turns "I should work on X" into a concrete, logged, streak-building action.

## 3. Goals

- Make starting work on a goal frictionless — one tap from intent to timer.
- Make consistency visible and motivating via streaks and history.
- Keep the app entirely personal, local, and simple — no accounts, no server dependency.

## 4. Non-Goals (Out of Scope for v1)

- Multi-user support or accounts
- Cross-device sync
- Notifications/reminders (may be considered post-v1)
- Team or social features (sharing streaks, leaderboards)

## 5. User

Single user (Nehemiah), accessing via desktop or mobile browser on one device. No login required.

## 6. Core User Flow

1. User opens the app.
2. Mascot displays a time-aware greeting prompt.
3. User sees a grid of existing tasks (grouped/tagged by goal) or creates a new one.
4. User taps a task →
   - A countdown timer starts immediately, persisting across refresh/navigation.
   - A log entry is written instantly with status `in_progress` (this is what counts toward the streak — showing up matters, not just finishing).
5. When the timer ends (or the user marks it complete/cancels early), the log updates to `completed` or `cancelled` with actual time spent.
6. User can view History: streaks, totals per goal, and a calendar heatmap of days where time was given.

## 7. Functional Requirements

### 7.1 Mascot Greeting
- Greeting text changes based on time of day (morning/afternoon/evening).
- Always addresses the user by name.

### 7.2 Goals
- User can create, rename, color-tag, and archive goals (e.g., "Grow my business", "Learn design").
- Each task belongs to exactly one goal.

### 7.3 Tasks
- User can create a task with: name, parent goal, default duration (hours/minutes).
- Tasks can be edited or archived (not hard-deleted, to preserve historical logs).
- Task list/grid shown on home screen, filterable by goal.

### 7.4 Timer & Logging
- Tapping a task starts a live countdown for its default duration (adjustable at start time).
- Timer state persists in the browser (survives refresh/tab close) by storing `{taskId, startedAt, plannedSeconds}` and recomputing elapsed time from wall-clock on reload.
- A log entry is created the instant the timer starts (`status: in_progress`), independent of whether the timer finishes — this is what feeds the streak.
- User can pause, cancel, or mark complete early.
- On natural completion or manual completion, log updates with `actualMinutes` and `status: completed`.
- On cancel, log updates to `status: cancelled` (see Open Question below on whether this still counts toward streak).

### 7.5 Streaks
- A streak day = at least one log created that calendar day (in_progress counts).
- Current streak and longest streak displayed on home screen.
- Per-goal streaks shown in goal detail view (optional stretch).

### 7.6 History
- Calendar heatmap (GitHub-style) of days with logged activity.
- List/summary of total time given per goal (weekly/monthly/all-time).
- Ability to view individual past sessions.

## 8. Data & Storage

**Storage engine:** IndexedDB (browser-native, local to device, no server or account needed).
**Access layer:** Dexie.js recommended — wraps IndexedDB with a cleaner promise-based API and simplifies indexes/queries, works well with React/Next.js client components.

**Important constraint:** IndexedDB is scoped to the browser + device it's created in. Data will **not** sync across devices or browsers, and can be lost if the user clears site data. This is accepted for v1 given single-device use; a note/export-backup feature is recommended (see Section 10).

### Object stores (schema)

**`goals`**
| Field | Type | Notes |
|---|---|---|
| id | string (uuid) | primary key |
| name | string | |
| color | string | hex or tailwind token |
| archived | boolean | |
| createdAt | number (timestamp) | |

**`tasks`**
| Field | Type | Notes |
|---|---|---|
| id | string (uuid) | primary key |
| goalId | string | indexed, foreign key to goals |
| name | string | |
| defaultMinutes | number | |
| archived | boolean | |
| createdAt | number | |

**`timeLogs`**
| Field | Type | Notes |
|---|---|---|
| id | string (uuid) | primary key |
| taskId | string | indexed, foreign key to tasks |
| goalId | string | indexed (denormalized for fast streak/history queries) |
| startedAt | number (timestamp) | indexed, used for streak/date grouping |
| plannedMinutes | number | |
| actualMinutes | number \| null | filled on completion |
| status | 'in_progress' \| 'completed' \| 'cancelled' | |
| completedAt | number \| null | |

Indexes on `taskId`, `goalId`, and `startedAt` in `timeLogs` keep streak and history queries fast without needing a server.

## 9. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS (mobile-first responsive) |
| Animation | Framer Motion (mascot, timer ring, streak feedback) |
| Local storage | IndexedDB via Dexie.js |
| Timer state | Zustand (in-memory) + IndexedDB persistence for recovery on reload |
| Auth | None |
| Hosting | Any static/Vercel deployment — no backend/database service needed since all data is client-side |

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| User clears browser data → loses all history/streaks | Add a manual "Export data (JSON)" / "Import data" feature early, even if backup isn't automatic |
| IndexedDB not available in some private/incognito contexts | Detect and show a warning banner if unsupported |
| Timer drift if laptop sleeps/tab is backgrounded | Always recompute remaining time from `startedAt` + wall-clock `Date.now()`, never rely on `setInterval` counting alone |
| Data tied to one browser/device only | Acceptable for v1 per requirements; document clearly as a known limitation |

## 11. Key UI Components

- `MascotGreeting` — avatar + time-aware prompt
- `TaskGrid` — task chips with duration badge, filter by goal
- `CreateTaskModal` — name, goal picker, duration input
- `ActiveTimerBar` — persistent countdown bar (pause / complete early / cancel)
- `StreakBadge` — current streak, flame icon
- `HistoryView` — calendar heatmap + per-goal totals
- `GoalManager` — CRUD for goal categories
- `ExportImportSettings` — manual backup/restore of IndexedDB data as JSON

## 12. Open Questions

1. **Cancelled sessions and streaks** — should a cancelled (not completed) session still count toward the day's streak, since a log already existed? *Recommendation: yes, count it — the app rewards showing up, not just finishing, per the core philosophy.*
2. Should there be a minimum session length before it counts (e.g., a 10-second accidental tap shouldn't build a streak)?
3. Should archived tasks/goals still show in History, or be hidden while preserving their logged data?

## 13. Success Criteria (v1)

- User can create a goal, create a task under it, start a timer, and see a log created instantly.
- Refreshing mid-timer resumes the correct remaining time.
- Streak count updates correctly across multiple days of use.
- History view accurately reflects total time given per goal.


/* app/globals.css */

@import "tailwindcss";

:root {
  --color-canvas: #15161b;
  --color-surface: #1e2029;
  --color-surface-raised: #262835;
  --color-ink: #f1efe8;
  --color-muted: #8c8e9b;
  --color-ember: #ff7a45;
  --color-gold: #f0b429;

  --ring-track: #2c2e3a;
}

@theme inline {
  --color-canvas: var(--color-canvas);
  --color-surface: var(--color-surface);
  --color-surface-raised: var(--color-surface-raised);
  --color-ink: var(--color-ink);
  --color-muted: var(--color-muted);
  --color-ember: var(--color-ember);
  --color-gold: var(--color-gold);

  --font-display: var(--font-display);
  --font-body: var(--font-body);
  --font-mono: var(--font-mono);

  --radius-card: 1.25rem;
}

body {
  font-family: var(--font-body);
}

.font-display {
  font-family: var(--font-display);
}

.font-mono-num {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}