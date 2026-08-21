# Especificación de Diseño: Eventos Recurrentes y Resumen Inteligente del Día

**Fecha**: 2026-08-18  
**Módulos**: Rutinas Recurrentes & Morning Briefing Card  
**Estado**: Aprobado por el usuario  

---

## 1. Visión General
Esta especificación define dos funcionalidades clave de productividad y organización:
1. **Resumen Inteligente del Día ("Morning Briefing")**: Una tarjeta analítica al inicio del día que saluda al usuario, sintetiza sus citas y tareas, identifica el próximo evento y calcula cuándo queda libre su agenda.
2. **Eventos y Rutinas Recurrentes**: Capacidad de programar eventos que se repiten automáticamente cada semana, días laborables o a diario sin duplicación manual de datos.

---

## 2. Especificación de Componentes & UI

### 2.1 Resumen Inteligente del Día (`MorningBriefingCard.tsx`)
* **Ubicación**: En la parte superior de `TimelineView.tsx` (vista "Hoy").
* **Saludo**:
  * 05:00 - 11:59: *"Buenos días, [Nombre]"*
  * 12:00 - 18:59: *"Buenas tardes, [Nombre]"*
  * 19:00 - 04:59: *"Buenas noches, [Nombre]"*
* **Lógica de Síntesis**:
  * Conteo de citas hoy (`eventCount`) y tareas pendientes (`pendingTasksCount`).
  * Próxima cita inmediata según la hora actual (`nextEvent`).
  * Hora de finalización del último evento (`freeTimeStart`).
  * Mensaje positivo y dinámico.
* **Diseño Candy**: Tarjeta traslúcida con borde brillante blanco, icono de sol/luna 3D y diseño colapsable.

### 2.2 Eventos Recurrentes (`EventModal.tsx` & `CalendarGridView.tsx`)
* **Opciones de Recurrencia**:
  * `none`: Sin repetición (evento único).
  * `weekly`: Se repite cada semana el mismo día de la semana.
  * `weekdays`: Se repite de Lunes a Viernes.
  * `daily`: Se repite todos los días.
* **Cálculo de Ocurrencias**:
  * Función `getEventsForDate(events, targetDateStr)` que resuelve tanto eventos puntuales con fecha exacta como eventos recurrentes cuyo inicio sea `<= targetDateStr` y coincida con el patrón de repetición.
* **Visualización**: Insignia con icono `repeat` en las tarjetas de eventos recurrentes.

---

## 3. Modelo de Datos (`src/types/index.ts`)
```typescript
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'weekdays';

export interface EventItem {
  // ... campos existentes
  recurrence?: RecurrenceType;
}
```

---

## 4. Criterios de Aceptación
1. En la vista de Hoy, la tarjeta Morning Briefing muestra el saludo con el nombre del usuario activo, número de citas, tareas pendientes y horario libre.
2. Al crear un evento y marcar "Cada semana", el evento aparece automáticamente en todos los días correspondientes de las semanas siguientes en el Calendario y en Hoy.
3. Las tarjetas de eventos recurrentes muestran la insignia `repeat`.
4. El build compila con 0 errores.
