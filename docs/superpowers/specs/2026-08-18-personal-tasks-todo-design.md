# Especificación de Diseño: Sección de Tareas Personales (To-Do)

**Fecha**: 2026-08-18  
**Módulo**: Tareas Personales / Checklist de Pendientes  
**Estado**: Aprobado por el usuario  

---

## 1. Visión General
Esta especificación define la incorporación de una sección dedicada a la gestión de **Tareas Personales (To-Do & Checklist Diario)** para cada perfil individual (*Dani* y *Ella*) dentro de la aplicación de agenda compartida.

Reemplaza la pestaña redundante de *"Ajustes"* en la barra de navegación inferior por una pestaña de **"Tareas"**, manteniendo el acceso a Ajustes en el Header superior.

---

## 2. Requerimientos de Navegación & UI

### 2.1 Barra de Navegación Inferior (Dock)
* **Pestaña reemplazada**: La pestaña "Ajustes" se reemplaza por **"Tareas"** (`id: 'tasks'`).
* **Icono**: `checklist` o `task_alt` de Material Symbols.
* **Comportamiento dinámico**:
  * Perfil Masculino (*Dani*): Resplandor e icono en azul candy (`#007dab`).
  * Perfil Femenino (*Ella*): Resplandor e icono en magenta candy (`#af0a78`).

### 2.2 Pantalla Principal de Tareas (`TasksView.tsx`)
1. **Encabezado y Barra de Progreso**:
   * Título: *"Mis Pendientes de Hoy"*.
   * Indicador numérico de completitud (ej: *"3 de 5 completadas"*).
   * Barra de progreso horizontal con relleno en degradado candy activo y efecto de brillo 3D.
2. **Entrada Rápida (Quick Input Well)**:
   * Caja de texto esculpida (*sunken plush well*) con placeholder: *"Escribe una nueva tarea..."*.
   * Botón circular 3D `(+)` para añadir con 1 toque o pulsando `Enter`.
   * Píldoras de prioridad rápida (*Normal*, *Urgente*, *Casa*, *Trabajo*).
3. **Lista Interactiva de Tareas**:
   * **Checkbox 3D táctil**: Botón circular con relieve que al pulsarlo activa una animación de rebote (*spring*), checkmark blanco y borde brillante.
   * **Texto tachado**: Transición animada de tachado y opacidad al completar.
   * **Drag & Drop vertical**: Reordenamiento con `Reorder.Group` de Framer Motion.
   * **Botón de borrado**: Icono de papelera con confirmación de eliminación permanente.
4. **Filtros de Visualización**:
   * Pestañas tipo píldora: *"Todas"*, *"Pendientes"*, *"Completadas"*.
   * Botón de acción: *"Limpiar completadas"*.

---

## 3. Modelo de Datos & Almacenamiento

### 3.1 Estructura TypeScript (`src/types/index.ts`)
```typescript
export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority?: 'normal' | 'urgent' | 'low';
  category?: 'general' | 'work' | 'home' | 'errand';
  author: UserProfile; // 'dani' | 'ella' (privadas de cada usuario)
  createdAt: string;
  completedAt?: string;
}
```

### 3.2 Servicio de Almacenamiento (`src/services/storageService.ts`)
* Clave en LocalStorage: `daily_delight_tasks_v2`.
* Métodos exportados:
  * `getTasks(profile: UserProfile): TaskItem[]`
  * `saveTask(taskData: Partial<TaskItem> & { title: string; author: UserProfile }): TaskItem[]`
  * `toggleTask(id: string): TaskItem[]`
  * `deleteTask(id: string): TaskItem[]`
  * `reorderTasks(reordered: TaskItem[]): TaskItem[]`
  * `clearCompletedTasks(profile: UserProfile): TaskItem[]`

---

## 4. Criterios de Aceptación
1. Al pulsar la pestaña "Tareas" en la barra inferior, se muestra la vista completa de tareas para el perfil activo.
2. Escribir en el input y pulsar enter o (+) agrega la tarea inmediatamente.
3. Marcar el checkbox 3D actualiza el progreso visual y tacha la tarea con animación.
4. El arrastre vertical reordena la lista de tareas y persiste el orden.
5. Las tareas de Dani y Ella son privadas e independientes según el perfil activo.
6. La pestaña "Ajustes" se conserva en el Header superior sin pérdida de funcionalidad.
