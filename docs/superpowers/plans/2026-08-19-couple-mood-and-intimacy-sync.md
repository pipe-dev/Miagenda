# Plan de Implementación: Sintonizador de Pareja (Batería, Deseos & Intimidad)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar el Sintonizador de Pareja en la pestaña de Recuerdos para sincronizar niveles de batería, estado de ánimo y deseos íntimos de ambos.

**Architecture:** Almacenamiento local aislado por perfil (`CoupleMoodStatus`), modal interactivo con selección táctil 3D para actualizar el estado personal, y tarjetas de estado mutuo integradas en la cabecera de `MemoriesVault.tsx`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Framer Motion, LocalStorage.

---

### Task 1: Definir tipos y métodos de almacenamiento
**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/services/storageService.ts`

- [ ] **Step 1: Añadir `CoupleMoodStatus`, `CoupleMoodNeed`, `BatteryLevel` a `src/types/index.ts`**
- [ ] **Step 2: Añadir métodos CRUD `getCoupleMoods` y `saveCoupleMood` en `src/services/storageService.ts`**

---

### Task 2: Crear el modal de Check-in (`CoupleMoodCheckinModal.tsx`)
**Files:**
- Create: `src/components/CoupleMoodCheckinModal.tsx`

- [ ] **Step 1: Crear componente con selector de batería (100%, 60%, 20%), píldoras táctiles con iconos (Intimidad, Ternura, Contacto, Charla, Espacio, Pelis, Salir) y campo de texto corto.**

---

### Task 3: Integrar tarjeta de Sintonizador en `MemoriesVault.tsx`
**Files:**
- Modify: `src/components/MemoriesVault.tsx`

- [ ] **Step 1: Mostrar tarjeta doble candy: estado personal y estado de la pareja en tiempo real.**
- [ ] **Step 2: Botón *"Actualizar mi estado"* que abre `CoupleMoodCheckinModal`.**

---

### Task 4: Conectar estado en `App.tsx` y verificación
**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Gestionar `coupleMoods` state y handlers en `App.tsx`.**
- [ ] **Step 2: Probar compilación con `npm run build`.**
