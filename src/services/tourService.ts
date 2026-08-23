import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { hapticService } from './hapticService';

const TOUR_STORAGE_PREFIX = 'mi_agenda_tour_screen_seen_';

export type TourScreen = 'today' | 'calendar' | 'tasks' | 'memories';

class TourService {
  // Check if tour was already completed for this specific screen
  public hasSeenTour(screen: TourScreen): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(TOUR_STORAGE_PREFIX + screen) === 'true';
  }

  // Mark tour as completed for this specific screen
  public markTourSeen(screen: TourScreen): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOUR_STORAGE_PREFIX + screen, 'true');
    }
  }

  // Reset all screen tours
  public resetAllTours(): void {
    if (typeof localStorage !== 'undefined') {
      ['today', 'calendar', 'tasks', 'memories'].forEach((s) => {
        localStorage.removeItem(TOUR_STORAGE_PREFIX + s);
      });
    }
  }

  // Launch screen-specific tour
  public startTour(screen: TourScreen, force: boolean = false): void {
    if (!force && this.hasSeenTour(screen)) {
      return;
    }

    // Small delay to ensure all DOM elements are mounted
    setTimeout(() => {
      const rawSteps = this.getStepsForScreen(screen);
      const availableSteps = rawSteps.filter((s) => {
        if (!s.element) return true;
        const el = typeof s.element === 'string' ? document.querySelector(s.element) : s.element;
        return el !== null;
      });

      if (availableSteps.length === 0) return;

      try {
        hapticService.playLightTap();

        const driverObj = driver({
          showProgress: true,
          animate: true,
          smoothScroll: true,
          allowClose: false,
          disableActiveInteraction: true,
          overlayClickBehavior: () => {
            // Evita que tocar fuera cierre el tutorial
          },
          skipMissingElement: true,
          waitForElement: 2000,
          overlayOpacity: 0.65,
          popoverClass: 'driverjs-candy-theme',
          nextBtnText: 'Siguiente →',
          prevBtnText: '← Atrás',
          doneBtnText: '¡Entendido! ✨',
          onDestroyStarted: () => {
            this.markTourSeen(screen);
            driverObj.destroy();
          },
          steps: availableSteps
        });

        driverObj.drive();
      } catch (err) {
        console.error('Error starting driver.js tour:', err);
      }
    }, 400);
  }

  // Steps customized specifically per screen
  private getStepsForScreen(screen: TourScreen): DriveStep[] {
    switch (screen) {
      case 'today':
        return [
          {
            element: '#tour-header-settings',
            popover: {
              title: '⚙️ Ajustes & Horarios',
              description: 'Configura tus horas de despertar (semana y fin de semana), hora de acostarte y alarmas.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '#tour-header-avatar',
            popover: {
              title: '👤 Tu Perfil',
              description: 'Toca tu avatar en cualquier momento para alternar rápidamente entre tu espacio y el de tu pareja.',
              side: 'bottom',
              align: 'end'
            }
          },
          {
            element: '#tour-privacy-toggle',
            popover: {
              title: '🔒 Mi Agenda vs Compartido',
              description: 'Alterna entre tus citas personales y los eventos que compartes en pareja.',
              side: 'bottom',
              align: 'center'
            }
          },
          {
            element: '#tour-morning-banner',
            popover: {
              title: '☀️ Avance de la Jornada',
              description: 'Visualiza el progreso de tu día según tu horario programado de levantarte y dormir.',
              side: 'bottom',
              align: 'center'
            }
          },
          {
            element: '#tour-today-timeline',
            popover: {
              title: '📅 Citas de Hoy',
              description: 'Tus compromisos organizados por hora. Puedes arrastrar las tarjetas para reordenarlas.',
              side: 'top',
              align: 'center'
            }
          },
          {
            element: '#tour-add-event-btn',
            popover: {
              title: '➕ Añadir Cita',
              description: 'Toca el botón flotante para programar una nueva cita con alarma y recordatorio.',
              side: 'top',
              align: 'center'
            }
          },
          {
            element: '#tour-bottom-nav',
            popover: {
              title: '🧭 Menú de Pantallas',
              description: 'Usa esta barra inferior para navegar entre Hoy, Calendario, Tareas y Recuerdos.',
              side: 'top',
              align: 'center'
            }
          }
        ];

      case 'calendar':
        return [
          {
            element: '#tour-cal-view-selector',
            popover: {
              title: '🗓️ Balance Semanal',
              description: 'Visualiza tus horas ocupadas y los tiempos libres disponibles durante la semana.',
              side: 'bottom',
              align: 'center'
            }
          },
          {
            element: '#tour-cal-grid',
            popover: {
              title: '📆 Cuadrícula de Días',
              description: 'Toca cualquier día para ver sus eventos o arrastra citas entre días para reprogramarlas.',
              side: 'top',
              align: 'center'
            }
          }
        ];

      case 'tasks':
        return [
          {
            element: '#tour-tasks-tabs',
            popover: {
              title: '📋 3 Secciones Clave',
              description: 'Alterna fácilmente entre tus Pendientes Personales, Compras del Hogar y el Pastillero de Medicamentos.',
              side: 'bottom',
              align: 'center'
            }
          },
          {
            element: '#tour-tasks-content',
            popover: {
              title: '✅ Registro & Progreso',
              description: 'Agrega nuevas tareas o marcas las realizadas para llenar tu barra de progreso diaria.',
              side: 'top',
              align: 'center'
            }
          }
        ];

      case 'memories':
        return [
          {
            element: '#tour-vault-dedications',
            popover: {
              title: '💖 Espacio de Amor en Pareja',
              description: 'Explora tu Batería de Energía, Cupones 3D interactivos y el Baúl de Dedicatorias sorpresa.',
              side: 'bottom',
              align: 'center'
            }
          },
          {
            element: '#tour-vault-mood',
            popover: {
              title: '🔋 Sintonizador de Energía',
              description: 'Indica tu nivel de batería y lo que necesitas (apapacho, charla o espacio) en tiempo real.',
              side: 'top',
              align: 'center'
            }
          }
        ];

      default:
        return [];
    }
  }
}

export const tourService = new TourService();
