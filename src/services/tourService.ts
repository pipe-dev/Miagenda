import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { hapticService } from './hapticService';

const TOUR_STORAGE_PREFIX = 'daily_delight_tour_seen_';

export type TourScreen = 'today' | 'calendar' | 'tasks' | 'memories';

class TourService {
  // Check if tour was already shown for this screen
  public hasSeenTour(screen: TourScreen): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(TOUR_STORAGE_PREFIX + screen) === 'true';
  }

  // Mark tour as completed
  public markTourSeen(screen: TourScreen): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOUR_STORAGE_PREFIX + screen, 'true');
    }
  }

  // Reset all tours so user can re-experience them
  public resetAllTours(): void {
    if (typeof localStorage !== 'undefined') {
      ['today', 'calendar', 'tasks', 'memories'].forEach((s) => {
        localStorage.removeItem(TOUR_STORAGE_PREFIX + s);
      });
    }
  }

  // Launch tour for a specific screen
  public startTour(screen: TourScreen, force: boolean = false): void {
    if (!force && this.hasSeenTour(screen)) {
      return;
    }

    const steps = this.getStepsForScreen(screen);
    if (!steps || steps.length === 0) return;

    hapticService.playLightTap();

    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayOpacity: 0.65,
      popoverClass: 'driverjs-candy-theme',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Atrás',
      doneBtnText: '¡Listo! ✨',
      onDestroyStarted: () => {
        this.markTourSeen(screen);
        driverObj.destroy();
      },
      steps
    });

    driverObj.drive();
  }

  // Define steps per screen
  private getStepsForScreen(screen: TourScreen): DriveStep[] {
    switch (screen) {
      case 'today':
        return [
          {
            element: '#tour-header-settings',
            popover: {
              title: '⚙️ Ajustes & Horarios',
              description: 'Configura tu hora de despertar (semana y fin de semana), hora de dormir, notificaciones y conexión en pareja.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '#tour-header-avatar',
            popover: {
              title: '👤 Cambiar de Perfil',
              description: 'Toca tu avatar para alternar de inmediato entre tu espacio y el de tu pareja.',
              side: 'bottom',
              align: 'end'
            }
          },
          {
            element: '#tour-privacy-toggle',
            popover: {
              title: '🔒 Mi Agenda vs Compartido',
              description: 'Alterna entre tus citas personales y los planes que compartes en pareja.',
              side: 'bottom',
              align: 'center'
            }
          },
          {
            element: '#tour-morning-banner',
            popover: {
              title: '☀️ Avance de la Jornada',
              description: 'Mira el progreso exacto de tu día según tu hora configurada de despertar y acostarte.',
              side: 'bottom',
              align: 'center'
            }
          },
          {
            element: '#tour-today-timeline',
            popover: {
              title: '📅 Tus Citas de Hoy',
              description: 'Todas tus citas y recordatorios organizados cronológicamente con alarmas a tu teléfono.',
              side: 'top',
              align: 'center'
            }
          },
          {
            element: '#tour-add-event-btn',
            popover: {
              title: '➕ Añadir Nueva Cita',
              description: 'Crea citas con alarmas, horarios, rutinas repetitivas y notas.',
              side: 'top',
              align: 'center'
            }
          },
          {
            element: '#tour-bottom-nav',
            popover: {
              title: '🧭 Menú de Navegación',
              description: 'Explora el Calendario completo, Tareas & Pastillero, y el Baúl de Recuerdos de Pareja.',
              side: 'top',
              align: 'center'
            }
          }
        ].filter(s => document.querySelector(s.element as string) !== null);

      case 'calendar':
        return [
          {
            element: '#tour-cal-view-selector',
            popover: {
              title: '🗓️ Vista Semana o Mes',
              description: 'Alterna entre una vista semanal detallada por horas o el calendario mensual completo.',
              side: 'bottom',
              align: 'center'
            }
          },
          {
            element: '#tour-cal-grid',
            popover: {
              title: '📆 Cuadrícula de Citas',
              description: 'Toca cualquier día para ver sus eventos programados o planificar una nueva cita.',
              side: 'top',
              align: 'center'
            }
          },
          {
            element: '#tour-privacy-toggle',
            popover: {
              title: '🔒 Filtro de Privacidad',
              description: 'Visualiza únicamente tus eventos privados o el calendario conjunto de ambos.',
              side: 'bottom',
              align: 'center'
            }
          }
        ].filter(s => document.querySelector(s.element as string) !== null);

      case 'tasks':
        return [
          {
            element: '#tour-tasks-tabs',
            popover: {
              title: '📋 3 Pestañas Clave',
              description: 'Gestiona tus Tareas Personales, el Pastillero Compartido y la Lista del Súper.',
              side: 'bottom',
              align: 'center'
            }
          },
          {
            element: '#tour-tasks-content',
            popover: {
              title: '✅ Registro & Check',
              description: 'Marca tareas completadas, tomas de medicamentos diarios y compras de despensa en vivo.',
              side: 'top',
              align: 'center'
            }
          }
        ].filter(s => document.querySelector(s.element as string) !== null);

      case 'memories':
        return [
          {
            element: '#tour-vault-dedications',
            popover: {
              title: '💌 Baúl de Cartitas',
              description: 'Escribe dedicatorias sorpresa con notas de voz y fotos que se abren automáticamente en el celular de tu pareja.',
              side: 'bottom',
              align: 'center'
            }
          },
          {
            element: '#tour-vault-coupons',
            popover: {
              title: '🎟️ Cuponera 3D',
              description: 'Rasca cupones de amor interactivos (masaje, cena, noche de películas) para canjearlos.',
              side: 'top',
              align: 'center'
            }
          },
          {
            element: '#tour-vault-mood',
            popover: {
              title: '💖 Sintonizador de Pareja',
              description: 'Ajusta tu batería emocional en tiempo real y pide apapachos o tiempo a solas.',
              side: 'top',
              align: 'center'
            }
          }
        ].filter(s => document.querySelector(s.element as string) !== null);

      default:
        return [];
    }
  }
}

export const tourService = new TourService();
