# Especificación de Diseño: Sintonizador de Pareja (Batería, Deseos & Intimidad)

**Fecha**: 2026-08-19  
**Ubicación**: Pestaña **"Recuerdos"** (`MemoriesVault.tsx`)

---

## 1. Propósito y Valor para la Pareja
Permitir que ambos miembros de la pareja compartan y sincronicen su nivel de energía, estado emocional y deseos íntimos del día a día sin necesidad de dar explicaciones largas o generar roces por falta de comunicación.

---

## 2. Estructura de Datos (`src/types/index.ts`)

```typescript
export type CoupleMoodNeed =
  | 'intimacy'      // 🔥 Intimidad & Pasión
  | 'cuddle'        // 🧸 Ternura & Apapacho
  | 'touch'         // 🫂 Contacto físico & Abrazos
  | 'talk'          // 💬 Charla & Desahogo
  | 'space'         // 🌿 Espacio & Calma
  | 'chill'         // 🍿 Plan chill & Pelis
  | 'hangout';      // 🎉 Salir y despejarnos

export type BatteryLevel = 'high' | 'normal' | 'low'; // 🔋 100%, ⚡ 60%, 🪫 20%

export interface CoupleMoodStatus {
  profile: UserProfile; // 'dani' | 'ella'
  battery: BatteryLevel;
  need: CoupleMoodNeed;
  note?: string;
  updatedAt: string;
}
```

---

## 3. Experiencia de Usuario en la Pestaña "Recuerdos"

### A. Tarjeta de Estado Mutuo en la Cabecera de Recuerdos
* Muestra dos tarjetas candy conectadas:
  * **Tu Estado Actual**: Con tu batería, lo que te apetece hoy y botón para actualizar.
  * **El Estado de Tu Pareja**: Te muestra en tiempo real cómo está él/ella y qué necesita de ti hoy (ej. *"Ella hoy está al 30% 🪫 y necesita: 🧸 Ternura & Apapacho"*).

### B. Modal Interactivo de Check-in Rápido (5 segundos)
* **Paso 1: Nivel de Batería**:
  * 🔋 **100%** (Con toda la energía)
  * ⚡ **60%** (Normal / Día tranquilo)
  * 🪫 **20%** (Agotado / Cansado)
* **Paso 2: ¿Qué me apetece hoy?**:
  * 🔥 *Intimidad & Pasión*
  * 🧸 *Ternura & Apapacho*
  * 🫂 *Contacto físico & Abrazos*
  * 💬 *Charla & Desahogo*
  * 🌿 *Espacio & Calma*
  * 🍿 *Plan chill & Pelis*
  * 🎉 *Salir y despejarnos*
* **Paso 3: Notita opcional** (ej: *"Día largo en la oficina, con ganas de llegar a verte"*).
* **Guardar**: Actualiza de inmediato el estado en almacenamiento local para ambos.

---

## 4. Componentes y Archivos Afectados

1. `src/types/index.ts`: Definición de `CoupleMoodStatus`, `CoupleMoodNeed`, `BatteryLevel`.
2. `src/services/storageService.ts`:
   * Clave `STORAGE_KEYS.COUPLE_MOODS`.
   * Métodos `getCoupleMoods()`, `saveCoupleMood()`.
3. `src/components/CoupleMoodCheckinModal.tsx`: Modal para seleccionar batería, deseo y notita con botones candy 3D.
4. `src/components/MemoriesVault.tsx`: Integración del widget de Sintonizador en la parte superior de Recuerdos.
5. `src/App.tsx`: Conectar el estado global y modales.
