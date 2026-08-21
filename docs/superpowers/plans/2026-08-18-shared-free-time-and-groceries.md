# Shared Free Time Matcher & Shared Groceries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the "Free Time for Us" couple availability matcher card and the "Shared Groceries & Home Checklist" in the Tasks view.

**Architecture:**
1. In `src/services/storageService.ts`: Add shared grocery types and CRUD functions (`getSharedGroceries`, `saveSharedGrocery`, `toggleSharedGrocery`, `deleteSharedGrocery`, `clearCompletedSharedGroceries`), plus free time window calculation utility `findSharedFreeWindows(events, dateStr)`.
2. Create `src/components/FreeTimeMatcherCard.tsx` displaying common free windows with 1-tap booking.
3. Update `src/components/TimelineView.tsx` to display `FreeTimeMatcherCard` when "Compartido" tab is selected.
4. Update `src/components/TasksView.tsx` with a top segmented switch (Mis Pendientes vs Compras & Hogar) and shared checklist items.
5. Wire everything in `src/App.tsx`.

---

### Task 1: Add Shared Grocery Types & Storage Methods + Free Time Finder
**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/services/storageService.ts`

- [ ] **Step 1: Add `SharedGroceryItem` interface in `src/types/index.ts`**
- [ ] **Step 2: Add `findSharedFreeWindows(events, dateStr)` in `src/services/storageService.ts`**
- [ ] **Step 3: Add Shared Groceries CRUD methods in `src/services/storageService.ts`**

---

### Task 2: Create `FreeTimeMatcherCard.tsx` Component
**Files:**
- Create: `src/components/FreeTimeMatcherCard.tsx`

- [ ] **Step 1: Calculate free blocks and format nicely in 12H format**
- [ ] **Step 2: Golden candy card styling with 1-tap "Planear Cita Juntos" button**

---

### Task 3: Enhance `TasksView.tsx` with Shared Grocery & Home Tab
**Files:**
- Modify: `src/components/TasksView.tsx`

- [ ] **Step 1: Add segmented tab switch between "Mis Pendientes" and "Compras & Hogar"**
- [ ] **Step 2: Add Quick Add bar for groceries with categories (Súper, Farmacia, Hogar, Cuentas)**
- [ ] **Step 3: Render shared items with "Añadido por Dani/Ella" badge and 3D checkboxes**

---

### Task 4: Integrate in `TimelineView.tsx` and `App.tsx` & Verify
**Files:**
- Modify: `src/components/TimelineView.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Render `FreeTimeMatcherCard` in `TimelineView.tsx` when `activeTab === 'shared'`**
- [ ] **Step 2: Pass shared grocery state and handlers to `TasksView` in `App.tsx`**
- [ ] **Step 3: Support prefilling `startTime` and `endTime` from free time booking in `EventModal.tsx` / `App.tsx`**
- [ ] **Step 4: Verify with `npm run build`**
