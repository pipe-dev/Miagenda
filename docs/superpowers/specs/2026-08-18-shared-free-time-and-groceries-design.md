# Especificación de Diseño: Detector de Tiempo Libre en Pareja & Lista de Compras Compartida

**Fecha**: 2026-08-18  
**Módulos**: Free Time Matcher & Shared Grocery / Home List  
**Estado**: Aprobado por el usuario  

---

## 1. Visión General
Esta especificación define dos herramientas de alta utilidad para la agenda compartida de pareja:
1. **Detector de "Tiempo Libre para los Dos"**: Algoritmo que cruza los eventos de ambos perfiles y muestra las ventanas horarias libres compartidas con agendado en 1 toque.
2. **Lista de Compras del Súper & Hogar Compartida**: Lista sincronizada accesible desde la sección de Tareas para que ambos agreguen y tachen artículos del hogar en tiempo real.

---

## 2. Especificación de Componentes & UI

### 2.1 Detector de Tiempo Libre (`FreeTimeMatcherCard.tsx`)
* **Ubicación**: En la vista de Hoy (`TimelineView.tsx`) cuando está activa la pestaña *"Compartido"* y como componente reutilizable en el Calendario.
* **Algoritmo de Cálculo**:
  * Intervalo base de día: 08:00 a 22:00 (14 horas activas).
  * Recopila todos los eventos activos en la fecha objetivo (eventos de Dani, eventos de Ella, eventos compartidos y eventos recurrentes).
  * Combina los intervalos ocupados `[startTime, endTime]`.
  * Calcula las ventanas libres continuas de $\ge 45$ minutos.
* **UI**: Tarjeta candy dorada / bicolor con icono de reloj estelar `hourglass_top` o `schedule`, resumen legible (*"Ventana libre de 01:00 PM a 03:30 PM"*) y botón *"Planear Cita Juntos"*.
* **Acción de 1 Toque**: Abre `EventModal` con `privacy: 'shared'` y los horarios de inicio y fin preseleccionados.

### 2.2 Lista de Compras y Hogar Compartida (`TasksView.tsx` & `storageService.ts`)
* **Segmented Control Superior en Tareas**:
  * `👤 Mis Pendientes` (Tareas privadas del usuario activo).
  * `🛒 Compras & Hogar` (Checklist compartida para ambos).
* **Campos del Modelo**:
  * `id`, `title`, `completed`, `category` ('groceries' | 'pharmacy' | 'home' | 'bills'), `addedBy` ('dani' | 'ella'), `createdAt`, `completedAt`.
* **Persistencia**: Clave `daily_delight_shared_groceries_v1`.
* **Interacciones**:
  * Entrada rápida con selector de categoría (🥑 Súper, 💊 Farmacia, 🏠 Hogar, 💡 Cuentas).
  * Checkboxes 3D táctiles que tachan el artículo para ambos.
  * Botón para limpiar artículos ya comprados.

---

## 3. Criterios de Aceptación
1. Al seleccionar la pestaña "Compartido" en Hoy, aparece la tarjeta con los horarios libres comunes.
2. Al presionar "Planear Cita Juntos", se abre el modal con la hora libre configurada automáticamente.
3. En la sección de Tareas, el usuario puede alternar entre "Mis Pendientes" y "Compras & Hogar".
4. Los artículos en "Compras & Hogar" son visibles y modificables desde ambos perfiles (Dani y Ella).
5. `npm run build` compila con 0 errores.
