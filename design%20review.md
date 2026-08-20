# Piece of My Time --- Design Review

**Document:** `design review.md`\
**Product:** Piece of My Time\
**Review focus:** Home experience, navigation, goals, task creation,
active timer, responsiveness, theming, and visual coherence\
**Design perspective:** Senior UX/UI review for a consumer-facing
productivity product\
**Source basis:** Current screenshots plus the uploaded Piece of My Time
PRD/README

------------------------------------------------------------------------

## 1. Executive Design Direction

The current product already has a distinctive emotional idea: **time is
something the user chooses to give to the things that matter**.

The interface should therefore feel less like a conventional task
manager and more like a **quiet personal ritual for deliberately giving
time to a goal**.

The current implementation communicates the concept, but the hierarchy
is not yet strong enough. The page feels like a narrow desktop prototype
placed in the middle of a large canvas rather than a responsive
application designed around the user's available screen.

The redesign should preserve:

-   The "piece of my time" philosophy.
-   The mascot and warm human tone.
-   The dark, intimate visual atmosphere.
-   Ember/orange and gold accents.
-   Serif/display typography for emotional moments.
-   Minimalism and lack of productivity-app clutter.
-   The idea that **showing up and giving time matters**, not merely
    checking tasks off.

The redesign should change:

-   Navigation structure.
-   Responsive layout.
-   Goal presentation.
-   Home-page hierarchy.
-   Task creation.
-   Active-session/timer presentation.
-   Streak placement.
-   Theme switching.
-   Timer implementation and persistence.
-   Information density and interaction clarity.

The guiding principle should be:

> **Make giving a piece of time feel like a small, intentional ritual
> --- not like operating a task-management dashboard.**

------------------------------------------------------------------------

# 2. What the Current Screens Reveal

## 2.1 Home page

The current home page places the application inside a relatively narrow
centered column while a very large amount of horizontal and vertical
screen space remains unused.

On a large desktop display this produces three problems:

1.  The application does not visually adapt to the available viewport.
2.  The user has to scan a small central area rather than being given a
    clear application structure.
3.  The interface feels unfinished because the layout does not appear to
    "own" the screen.

### Current hierarchy

The current structure is approximately:

1.  Greeting + mascot.
2.  History / Settings.
3.  Streak.
4.  Horizontally scrolling goals.
5.  Task cards.
6.  New task card.

The hierarchy should instead be closer to:

1.  Persistent application navigation.
2.  Personal greeting / emotional context.
3.  Primary action: give time.
4.  Current goals and their tasks.
5.  Today's progress / streak as supporting information.
6.  Secondary information such as history and settings.

The user should immediately understand:

**Where am I? → What matters to me? → What can I give time to now? →
What is currently happening?**

------------------------------------------------------------------------

# 3. Replace the Current Top Navigation With a Sidebar

## Problem

The current `History` and `Settings` links sit near the top of the
content area. They behave more like loose links than an actual
application navigation system.

The user explicitly prefers a sidebar.

## Proposed desktop navigation

Create a persistent left sidebar approximately 240--280px wide.

### Sidebar structure

**Brand / identity** - Piece of My Time mark or mascot. - Small product
name. - Optional short phrase such as "Give what matters a piece of your
time."

**Primary navigation** - Home - Goals - History

**Secondary navigation** - Settings

**Bottom area** - Theme switcher. - Small streak/progress indicator if
useful. - Optional local-storage/export status.

Example:

``` text
┌─────────────────────────┐
│  [mascot]               │
│  Piece of My Time       │
│                         │
│  ◉ Home                 │
│  ◇ Goals                │
│  ◷ History              │
│                         │
│                         │
│  ─────────────────────  │
│  ⚙ Settings             │
│  ◐ Appearance            │
└─────────────────────────┘
```

### Why this is better

A sidebar gives the product a stable spatial model.

The user learns:

-   Left = where I navigate.
-   Center = what I am doing.
-   Bottom/secondary controls = configuration.
-   Main action = giving time.

This also creates much more room for the main content to expand on large
displays.

## Mobile behavior

The desktop sidebar should become:

-   A compact top bar, or
-   A bottom navigation bar.

Do not simply shrink the desktop sidebar until it becomes unusable.

Recommended mobile navigation:

``` text
Home       Goals       History       Settings
```

Use icons plus labels where space permits.

------------------------------------------------------------------------

# 4. Redesign the Main Home Layout

The main content should be fluid rather than fixed-width.

## Desktop

Use a layout similar to:

``` text
Sidebar | Main content                         | Optional context
        |                                      |
        | Greeting                             |
        | Primary "Give Time" action            |
        |                                      |
        | Today's goals                         |
        | [goal/task] [goal/task] [goal/task]  |
        |                                      |
        | Today's progress                     |
```

Use a responsive container with a sensible maximum reading width, but
allow the application shell itself to expand.

The content should not remain trapped in a tiny 500--600px column on a
1800px display.

## Large screens

At very wide widths:

-   Increase usable content width.
-   Increase grid columns.
-   Allow task cards to occupy more space.
-   Keep text line lengths controlled.
-   Use whitespace intentionally rather than leaving the majority of the
    screen empty.

## Medium screens

Collapse the number of grid columns rather than forcing horizontal
scrolling.

## Mobile

Everything becomes a single vertical flow.

------------------------------------------------------------------------

# 5. Separate the Mascot From the Primary Action

## Current issue

The mascot and the main prompt currently feel visually combined into one
compact block.

The mascot should be an emotional brand element, while the task action
should be a functional element.

They should support one another without becoming one component.

## Proposed structure

``` text
        [mascot]

Winding down, Nehemiah

What are you going to give
a piece of your time today?

[ + Give some time ]
```

The mascot can sit above the text, beside it on desktop, or become
smaller on mobile.

The important distinction is:

**Mascot = emotional identity.**

**Text = intention.**

**Button = action.**

Do not make the mascot and prompt compete for the same visual role.

------------------------------------------------------------------------

# 6. Replace "New Task" as the Primary Action With "Give Time"

The product's most important action is not technically "creating a
task."

The user's mental model is:

> I want to give some of my time to something that matters.

Therefore, the primary CTA should communicate that intention.

Possible labels:

-   Give some time
-   Give a piece of time
-   Start a session
-   Give time to a goal

Recommended primary label:

**Give some time**

The task itself can still be called a task internally.

This distinction matters because productivity terminology can make the
product feel like another Todo app.

------------------------------------------------------------------------

# 7. Redesign Goal Selection

## Current problem

The goals are presented in a horizontal axis with overflow/scroll
behavior.

This creates a poor interaction model:

-   Important information is hidden off-screen.
-   The user has to drag/scroll horizontally.
-   It looks like the interface is compensating for insufficient layout
    space.
-   Goals become difficult to scan.
-   The scrollbar is visually distracting.

The screenshot shows the goal chips being forced into a horizontally
constrained region.

## New approach

Goals should be presented as a responsive collection.

### Option A --- Goal cards

``` text
┌──────────────────────┐
│ ● Grow my business   │
│   4h 20m this week   │
│   3 tasks             │
└──────────────────────┘

┌──────────────────────┐
│ ● Learn design       │
│   1h 40m this week   │
│   2 tasks             │
└──────────────────────┘
```

Cards should automatically form:

-   4 columns on wide desktop.
-   3 columns on desktop.
-   2 columns on tablet.
-   1 column on mobile.

### Option B --- Goal sidebar within Home

If there are many goals, use a vertical goal list:

``` text
Goals

● Grow my business
● Learn design
● Build Tangaza
● Creative work
+ New goal
```

Selecting a goal filters the task area.

This is preferable to horizontal scrolling.

------------------------------------------------------------------------

# 8. Home Page Task Area

Tasks should become visually subordinate to goals.

Suggested hierarchy:

``` text
Today's focus

Grow my business
────────────────────────────

[ Task ] [ Task ] [ + Add task ]

Learn design
────────────────────────────

[ Task ] [ Task ] [ + Add task ]
```

Each task should clearly show:

-   Task name.
-   Goal.
-   Default duration.
-   Small visual status.
-   Optional recent-use indicator.

Avoid overloading cards with metadata.

The user should be able to answer within one second:

**What is this?**

**How long will it take?**

**What goal does it serve?**

------------------------------------------------------------------------

# 9. Move the Streak

## Current problem

The streak is placed directly under the greeting, which gives it too
much importance.

The app's philosophy is not:

> Maintain a streak.

It is:

> Give your time to what matters.

The streak is a consequence of the behavior, not the primary behavior.

## Better locations

### Option A --- Sidebar

A compact indicator near the bottom:

``` text
🔥 4 day streak
```

### Option B --- Today's progress card

``` text
Today

32 min given
🔥 4 day streak
```

### Option C --- History

The most detailed streak information belongs in History.

### Recommendation

Use a small streak indicator in the sidebar or today's progress section,
and reserve larger streak visualization for History.

This prevents gamification from overpowering the emotional core of the
product.

------------------------------------------------------------------------

# 10. Redesign Task Creation

## Current problem

The current modal feels like a generic form:

-   Task name.
-   Goal.
-   Duration.
-   Create task.

It is functional, but not emotionally aligned with the product.

The screenshot also shows a very large amount of empty dark space behind
a small modal, making the interaction feel disconnected from the rest of
the application.

## Better concept: "Give a piece of time"

Instead of a generic "New task" modal, use a focused session setup
component.

Example:

``` text
Give some time

What are you working on?

[ Post organic slideshows              ]

For which goal?

[ ● Grow my following                  ]

How much time?

[ 5 min ] [ 15 min ] [ 25 min ] [ 45 min ]

or

[ Custom duration ]

             [ Give this time → ]
```

The interface should make duration selection feel intentional.

## Duration presets

Provide sensible quick choices:

-   5 min
-   10 min
-   15 min
-   25 min
-   45 min
-   60 min

Then allow custom duration.

The user should not have to manually type "01" into a small input to
start a one-minute task.

------------------------------------------------------------------------

# 11. The Active Timer Should Become a Dedicated Experience

This is the most important functional and visual change.

The current active timer appears as a bar at the bottom of the screen.

That makes a focused session feel like a secondary notification rather
than the central activity.

Once the user commits time, the application should enter a **Focus
Session** state.

This can be:

-   A dedicated route/screen, or
-   A full-page focus component inside the same route.

Recommended architecture:

``` text
Home
  ↓
Give Time
  ↓
Focus Session
  ↓
Completion
  ↓
Home / Session Summary
```

------------------------------------------------------------------------

# 12. Focus Session Visual Design

The user specifically wants a pie-like visual representation of the
assigned time.

Use a large circular progress visualization.

Example:

``` text
              ╭────────╮
           ╭──╯        ╰──╮
         ╱                  ╲
        │     25:00          │
        │                     │
         ╲                  ╱
           ╰──╮        ╭──╯
              ╰────────╯

        Post organic slideshows

          Grow my following
```

The circular shape should visually communicate:

**This is the piece of time I am giving.**

The progress arc can represent remaining time.

## Important detail

The user asked for a slice labelled with the time assigned to that task.

Therefore the visual should include:

-   Total assigned duration.
-   Remaining duration.
-   Progress/remaining slice.
-   Task name.
-   Goal.

Example:

``` text
              25 min
          ┌─────────────┐
          │   18:42     │
          │  remaining  │
          └─────────────┘

       Post organic slideshows
         Grow my following
```

The countdown should sit **under or inside the pie/ring**, depending on
which produces the clearest hierarchy.

------------------------------------------------------------------------

# 13. Timer Must Actually Count Down

The PRD explicitly requires a live countdown and persistence across
refresh/navigation.

The implementation should not increment a displayed number using only
`setInterval`.

The timer should derive its state from wall-clock time.

The PRD specifies storing:

``` text
taskId
startedAt
plannedSeconds
```

and recomputing elapsed/remaining time from `Date.now()` after reload.

This is especially important because:

-   Browsers throttle background tabs.
-   Laptops sleep.
-   Users switch tabs.
-   `setInterval` can drift.

The UI may use an interval to refresh the display, but the source of
truth must be timestamps.

The implementation should therefore follow:

``` text
remaining =
plannedSeconds - (Date.now() - startedAt) / 1000
```

with appropriate handling for pause/resume.

------------------------------------------------------------------------

# 14. Timer Controls

Keep controls deliberately minimal.

Primary:

**Pause**

Secondary:

**Finish early**

Tertiary:

**Cancel**

Avoid presenting five or six equally prominent controls.

Example:

``` text
              18:42

        Post organic slideshows
         Grow my following

             [ Pause ]

        Finish early    Cancel
```

When paused, clearly communicate:

``` text
Paused

18:42 remaining

[ Resume ]
```

------------------------------------------------------------------------

# 15. Completion Experience

When the timer finishes, do not immediately dump the user back into the
task grid.

Give the session a small moment of closure.

Example:

``` text
Piece given.

25 minutes to
Grow my following.

🔥 Your 4 day streak continues.

[ Back home ]
```

This reinforces the product philosophy without excessive gamification.

The user should feel that they completed a meaningful action rather than
merely stopping a timer.

------------------------------------------------------------------------

# 16. Responsive Design Requirements

Responsiveness should be treated as a core architectural requirement,
not a final CSS pass.

The application should adapt to:

-   Mobile phones.
-   Tablets.
-   Small laptops.
-   Standard desktop monitors.
-   Ultrawide/high-resolution displays.

## Layout rules

Use:

-   CSS Grid for major content layouts.
-   Flexbox for local component alignment.
-   Responsive Tailwind breakpoints.
-   `minmax()` for flexible grids.
-   Fluid spacing where appropriate.
-   Maximum content widths for readable text.
-   No fixed-width central application shell.

Avoid:

-   Hard-coded pixel widths for major layout containers.
-   Horizontal scrolling for core navigation.
-   Components whose content overflows at normal desktop widths.
-   Positioning elements based on absolute screen coordinates.

------------------------------------------------------------------------

# 17. Responsive Layout Model

## Mobile

``` text
┌──────────────────────┐
│ ☰  Piece of My Time  │
├──────────────────────┤
│                      │
│ [mascot]             │
│ Winding down...      │
│ What are you going   │
│ to give your time?   │
│                      │
│ [ Give some time ]   │
│                      │
│ Today's focus        │
│                      │
│ Goal                 │
│ [ Task ]             │
│ [ Task ]             │
│                      │
└──────────────────────┘
```

## Desktop

``` text
┌─────────────┬─────────────────────────────────────────┐
│ Sidebar     │ Main                                    │
│             │                                         │
│ Home        │ Greeting                                │
│ Goals       │ Primary action                          │
│ History     │                                         │
│             │ Today's focus                           │
│ Settings    │ Goal cards / task grid                  │
│             │                                         │
│ 🔥 4 days   │ Progress                                │
└─────────────┴─────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 18. Dark Mode and Light Mode

The current palette is strongly suited to dark mode.

The existing design tokens already establish:

-   Canvas: `#15161b`
-   Surface: `#1e2029`
-   Raised surface: `#262835`
-   Ink: `#f1efe8`
-   Muted: `#8c8e9b`
-   Ember: `#ff7a45`
-   Gold: `#f0b429`
-   Ring track: `#2c2e3a`

These should become semantic design tokens rather than hard-coded
assumptions throughout components.

## Theme behavior

The app should support three modes:

-   System
-   Light
-   Dark

Default:

**System preference**

Use `prefers-color-scheme` so the application automatically follows the
device setting on first visit.

Then allow the user to override it manually.

Example:

``` text
Appearance

○ System
○ Light
● Dark
```

Persist the user's explicit selection locally.

------------------------------------------------------------------------

# 19. Light Theme Direction

Do not simply invert the dark theme.

Light mode should retain the product's warmth.

Suggested conceptual palette:

``` text
Canvas       warm off-white
Surface      soft cream/white
Ink          deep charcoal
Muted        warm gray
Ember        same orange accent
Gold         warm golden accent
```

The product should feel like paper, sunlight, and quiet focus rather
than a generic SaaS dashboard.

The emotional identity should survive theme changes.

------------------------------------------------------------------------

# 20. Typography

Typography should create a clear distinction between:

### Emotional/display text

Use the existing display serif treatment for:

-   Greeting.
-   Session completion message.
-   Important time-related statements.

### Functional text

Use the body font for:

-   Navigation.
-   Buttons.
-   Forms.
-   Task names.
-   Goal labels.

### Timer numbers

Use the existing monospace numeric treatment.

Large countdown numbers should be extremely legible.

The timer is not decorative text; it is information that must be read
immediately.

------------------------------------------------------------------------

# 21. Spacing and Visual Rhythm

The current page has large empty areas but does not necessarily feel
spacious because the content itself is compressed.

This distinction matters:

**Whitespace is intentional space between meaningful elements.**

**Unused viewport area caused by a constrained layout is not necessarily
good whitespace.**

Use a consistent spacing system.

Recommended hierarchy:

-   Small: 4--8px
-   Component spacing: 12--20px
-   Section spacing: 24--40px
-   Major page sections: 48--72px

Use whitespace to group concepts rather than simply pushing the entire
interface toward the center.

------------------------------------------------------------------------

# 22. Task Cards

Task cards should become slightly more expressive.

Suggested structure:

``` text
┌──────────────────────────────┐
│ ●                            │
│                              │
│ Post organic slideshows      │
│ Grow my following            │
│                              │
│ 25 min                 →     │
└──────────────────────────────┘
```

Hover:

-   Slight elevation.
-   Subtle border/ember response.
-   Small movement.

Active:

-   Clear focus state.
-   Timer begins immediately after confirmation/start.

Avoid excessive shadows and glossy effects.

The product should feel calm and tactile.

------------------------------------------------------------------------

# 23. Accessibility

The redesign should meet basic accessibility expectations.

### Requirements

-   Keyboard navigable sidebar.
-   Visible focus states.
-   Sufficient contrast in both themes.
-   Buttons with meaningful labels.
-   Do not communicate state through color alone.
-   Timer controls accessible by keyboard.
-   Respect `prefers-reduced-motion`.
-   Large enough touch targets on mobile.
-   Do not rely on tiny icons for essential actions.
-   Announce timer completion appropriately for assistive technologies.

The PRD already specifies reduced-motion handling, so this should remain
part of the implementation.

------------------------------------------------------------------------

# 24. Motion Design

Motion should reinforce the concept of time.

Good uses:

-   Mascot entrance.
-   Goal selection.
-   Timer ring movement.
-   Completion transition.
-   Small streak celebration.
-   Modal/sheet transitions.

Avoid:

-   Constant decorative animation.
-   Bouncy task cards.
-   Excessive page transitions.
-   Animation that delays a user's action.

Motion should feel like **breathing**, not gamification.

------------------------------------------------------------------------

# 25. Recommended Information Architecture

``` text
Piece of My Time
│
├── Home
│   ├── Greeting
│   ├── Give Time
│   ├── Today's Goals
│   ├── Tasks
│   └── Today's Progress
│
├── Goals
│   ├── Goal list
│   ├── Goal detail
│   └── Tasks belonging to goal
│
├── Focus Session
│   ├── Circular time visualization
│   ├── Countdown
│   ├── Pause
│   ├── Finish
│   └── Cancel
│
├── History
│   ├── Calendar heatmap
│   ├── Total time
│   ├── Goal totals
│   └── Past sessions
│
└── Settings
    ├── Appearance
    ├── Data export/import
    └── Preferences
```

This aligns closely with the PRD's existing functional structure while
improving the experience layer.

------------------------------------------------------------------------

# 26. Component Changes

The existing component architecture can evolve rather than being
discarded.

### Keep

-   `MascotGreeting`
-   `TaskGrid`
-   `HistoryView`
-   `GoalManager`
-   `ExportImportSettings`

### Redesign

`MascotGreeting`

Split visual responsibilities into:

-   `Mascot`
-   `Greeting`
-   `PrimaryTimeAction`

`TaskGrid`

Replace horizontal goal filtering with responsive goal sections/cards.

`CreateTaskModal`

Redesign as:

-   `GiveTimeSheet` on mobile.
-   `GiveTimeDialog` on desktop.

`ActiveTimerBar`

Replace as the primary timer experience with:

-   `FocusSession`
-   `TimerRing`
-   `TimerControls`

A small persistent timer indicator can still exist when navigating away
from the focus screen.

`StreakBadge`

Reduce visual prominence and move into:

-   Sidebar.
-   Today's progress.
-   History.

### Add

-   `AppSidebar`
-   `MobileNavigation`
-   `ThemeSwitcher`
-   `GoalCard`
-   `TodayProgress`
-   `FocusSession`
-   `TimerRing`
-   `SessionComplete`
-   `GiveTimeForm`

------------------------------------------------------------------------

# 27. Interaction Principles

Every important interaction should answer three questions:

### 1. What am I doing?

The UI should use human language.

Prefer:

**Give some time**

over:

**Create task**

### 2. What will happen?

Before starting a session, clearly show:

-   Task.
-   Goal.
-   Duration.

### 3. What is happening now?

During a session, the timer should become the dominant element.

The interface should never make the user search for the active
countdown.

------------------------------------------------------------------------

# 28. Home Page Target Hierarchy

The redesigned home screen should approximately follow this hierarchy:

``` text
1. Navigation
2. Personal greeting
3. Primary "Give Time" action
4. Current goals
5. Tasks
6. Today's progress
7. Streak/history context
```

The current design effectively gives the streak and goal scrolling area
too much prominence while giving the actual time-giving action too
little.

------------------------------------------------------------------------

# 29. Visual Character to Preserve

Do not redesign Piece of My Time into a generic productivity SaaS
product.

Avoid:

-   Corporate blue dashboards.
-   Excessive cards.
-   Dense analytics.
-   Gamified badges everywhere.
-   Generic checkboxes as the central interaction.
-   Overly bright gradients.
-   Excessive glassmorphism.
-   Dashboard-style charts on the home screen.

Preserve:

-   Dark intimate atmosphere.
-   Warm orange/ember accent.
-   Gold warmth.
-   Serif emotional typography.
-   Mascot.
-   Quiet language.
-   Generous intentional whitespace.
-   Human-centered copy.
-   Focus on time rather than task completion.

The product should feel closer to a **personal time journal + focus
ritual** than a Todoist clone.

------------------------------------------------------------------------

# 30. Functional Priority: Fix Timer Before Visual Polish

The static countdown shown in the current screenshots is a critical
functional problem.

A beautiful timer that does not count down correctly undermines the
central promise of the product.

Implementation priority should therefore be:

1.  Correct timestamp-based timer state.
2.  Persistence across refresh.
3.  Pause/resume correctness.
4.  Completion/cancellation logging.
5.  Circular progress visualization.
6.  Session transition.
7.  Visual polish.

The PRD explicitly requires timer persistence and timestamp-based
recalculation, so this is not merely a design preference; it is a core
product requirement.

------------------------------------------------------------------------

# 31. Suggested Redesign Sequence

Do not redesign the entire application in one pass.

Work component by component.

## Phase 1 --- Application shell

Build:

-   Responsive layout.
-   Desktop sidebar.
-   Mobile navigation.
-   Fluid main content.
-   Theme system.

## Phase 2 --- Home hierarchy

Redesign:

-   Mascot.
-   Greeting.
-   Primary CTA.
-   Today's progress.
-   Goal sections.
-   Task grid.

## Phase 3 --- Goals

Replace:

-   Horizontal goal scrolling.

With:

-   Responsive goal cards/list.
-   Goal filtering.
-   New goal interaction.

## Phase 4 --- Give Time

Replace:

-   Generic New Task modal.

With:

-   Intentional Give Time component.
-   Duration presets.
-   Custom duration.
-   Clear task/goal relationship.

## Phase 5 --- Focus Session

Build:

-   Dedicated focus view.
-   Timer ring/pie.
-   Live countdown.
-   Pause.
-   Finish.
-   Cancel.
-   Session completion state.

## Phase 6 --- History and streaks

Move detailed:

-   Streaks.
-   Calendar.
-   Time totals.

Into History.

Keep only lightweight progress context on Home.

------------------------------------------------------------------------

# 32. Final UX Criterion

The redesigned interface should pass this test:

> A new user should be able to open Piece of My Time, understand what
> the product is asking of them, choose something meaningful, assign a
> duration, start the timer, and understand how much time remains
> without needing instructions.

And after the session:

> The user should understand that they deliberately gave a piece of
> their time to something that matters.

That is the product's differentiator.

The interface should make that idea visible in every major interaction.

------------------------------------------------------------------------

# 33. Design North Star

**Piece of My Time should not ask:**

> "What tasks do you have?"

It should ask:

> **"What is worth a piece of your time right now?"**

The UI should make answering that question effortless.
