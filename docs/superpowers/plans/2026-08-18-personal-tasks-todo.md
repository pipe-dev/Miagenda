# Personal Tasks (To-Do) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a dedicated, tactile personal To-Do and Checklist section ("Mis Tareas") for individual users (*Dani* and *Ella*), replacing the redundant "Ajustes" tab in the bottom navigation dock.

**Architecture:** A new `TasksView.tsx` component with 3D tactile checkboxes, completion progress indicator, quick text input well with priority tags, and Framer Motion `Reorder.Group` for vertical drag-and-drop. State is persisted in `storageService.ts` per user profile and seamlessly wired in `App.tsx` and `NavigationBar.tsx`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide/Material Symbols, Vite.

## Global Constraints
- Profile independence: Tasks created by Dani belong to Dani; tasks created by Ella belong to Ella.
- Dynamic theming: Active accents, buttons and checkboxes must match the user's active theme (Blue candy for Dani, Pink/Magenta candy for Ella).
- Permanent delete warning: Deleting a task uses the unified `ConfirmDeleteModal` or inline confirmation.
- Build must always pass with 0 errors via `npm run build`.

---

### Task 1: Data Model and Storage Service for Tasks
**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/services/storageService.ts`

- [ ] **Step 1: Add `TaskItem` interface and update `NavView` in `src/types/index.ts`**
- [ ] **Step 2: Add `getTasks`, `saveTask`, `toggleTask`, `deleteTask`, `reorderTasks`, and `clearCompletedTasks` to `src/services/storageService.ts`**
- [ ] **Step 3: Seed initial demo tasks for Dani and Ella**

---

### Task 2: Build the `TasksView.tsx` Component
**Files:**
- Create: `src/components/TasksView.tsx`

- [ ] **Step 1: Implement progress bar with animated completion count**
- [ ] **Step 2: Implement quick sunken plush input well with category/priority pills and Enter/Button submit**
- [ ] **Step 3: Implement tactile 3D checkboxes with spring bounce, strikethrough animation, and delete button**
- [ ] **Step 4: Implement Framer Motion `Reorder.Group` for vertical drag & drop**
- [ ] **Step 5: Implement filter pills ("Todas", "Pendientes", "Completadas") and "Limpiar completadas"**

---

### Task 3: Update `NavigationBar.tsx` & Wire in `App.tsx`
**Files:**
- Modify: `src/components/NavigationBar.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace "settings" tab with "tasks" ("Tareas") in `NavigationBar.tsx` using `checklist` icon**
- [ ] **Step 2: Connect `currentView === 'tasks'` in `App.tsx` with `TasksView`**
- [ ] **Step 3: Test and verify complete build with `npm run build`**
