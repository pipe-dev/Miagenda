# Recurring Events & Morning Briefing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the "Morning Briefing" daily summary card in the Today view and automatic Recurring Events (Weekly, Daily, Weekdays) with dynamic date matching.

**Architecture:** Add `RecurrenceType` to `src/types/index.ts`. Create `src/components/MorningBriefingCard.tsx` analyzing today's events, pending tasks, and next schedule. Update `EventModal.tsx` to include recurrence selection chips, and provide helper `isEventActiveOnDate(evt, dateStr)` in `storageService.ts` used by `TimelineView.tsx` and `CalendarGridView.tsx`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Framer Motion, date-fns, Material Symbols.

---

### Task 1: Update Types and Recurrence Utility in Storage Service
**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/services/storageService.ts`

- [ ] **Step 1: Add `RecurrenceType` and update `EventItem` in `src/types/index.ts`**
- [ ] **Step 2: Implement `isEventActiveOnDate(event: EventItem, dateStr: string): boolean` in `src/services/storageService.ts`**
- [ ] **Step 3: Update `getEventsForDate` helper**

---

### Task 2: Build `MorningBriefingCard.tsx` Component
**Files:**
- Create: `src/components/MorningBriefingCard.tsx`

- [ ] **Step 1: Calculate greeting, event count, task count, next event, and free time**
- [ ] **Step 2: Style with 3D candy frosted glass, sun/moon icon, and animated progress ring/summary**

---

### Task 3: Update `EventModal.tsx`, `TimelineView.tsx`, `CalendarGridView.tsx`, and `App.tsx`
**Files:**
- Modify: `src/components/EventModal.tsx`
- Modify: `src/components/TimelineView.tsx`
- Modify: `src/components/CalendarGridView.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add recurrence selector in `EventModal.tsx`**
- [ ] **Step 2: Integrate `MorningBriefingCard` and `isEventActiveOnDate` in `TimelineView.tsx`**
- [ ] **Step 3: Support `isEventActiveOnDate` and recurrence badge in `CalendarGridView.tsx`**
- [ ] **Step 4: Verify and test build with `npm run build`**
