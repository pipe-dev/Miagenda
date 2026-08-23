import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import PrivacyToggle from './components/PrivacyToggle';
import NavigationBar from './components/NavigationBar';
import TimelineView from './components/TimelineView';
import CalendarGridView from './components/CalendarGridView';
import TasksView from './components/TasksView';
import MemoriesVault from './components/MemoriesVault';
import EventModal from './components/EventModal';
import EventDetailModal from './components/EventDetailModal';
import DedicationCreator from './components/DedicationCreator';
import SurpriseModal from './components/SurpriseModal';
import SettingsModal from './components/SettingsModal';
import WelcomeScreen from './components/WelcomeScreen';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import CoupleMoodCheckinModal from './components/CoupleMoodCheckinModal';
import MedicationTracker from './components/MedicationTracker';
import ProfileModal from './components/ProfileModal';

import {
  getEvents,
  saveEvent,
  deleteEvent,
  FreeTimeWindow,
  resetAppToCleanSlate,
  reorderEvents,
  getDedications,
  saveDedication,
  deleteDedication,
  markDedicationAsRead,
  getPendingSurprise,
  getTasks,
  saveTask,
  toggleTask,
  deleteTask,
  reorderTasks,
  clearCompletedTasks,
  getSharedGroceries,
  saveSharedGrocery,
  toggleSharedGrocery,
  deleteSharedGrocery,
  clearCompletedSharedGroceries,
  getCoupleMoods,
  saveCoupleMood,
  getMedications,
  saveMedication,
  deleteMedication,
  toggleMedicationTaken,
  checkShouldAutoPromptMood,
  markMoodPromptedForToday,
  getLocalDateStr,
  getActiveProfile,
  setActiveProfile as persistActiveProfile,
  getProfileConfig,
  getUserDisplayName,
  getUserProfileColor
} from './services/storageService';

import {
  EventItem,
  DedicationItem,
  TaskItem,
  SharedGroceryItem,
  CoupleMoodStatus,
  MedicationItem,
  UserProfile,
  PrivacyType,
  NavView
} from './types';

import {
  subscribeToCloudEvents,
  subscribeToCloudTasks,
  subscribeToCloudGroceries,
  subscribeToCloudDedications,
  subscribeToCloudMedications,
  subscribeToCloudMoods,
  subscribeToCloudProfileConfig
} from './services/firestoreSync';
import { getFirebaseServices } from './services/firebase';
import { checkAndRunAutomatedBackup } from './services/backupService';
import { notificationService } from './services/notificationService';
import { notificationScheduler } from './services/notificationScheduler';
import { remotePushService } from './services/remotePushService';
import { tourService } from './services/tourService';

export default function App() {
  // Navigation & Privacy (Siempre entra en Mi Agenda / Privada por defecto)
  const [currentView, setCurrentView] = useState<NavView>('today');
  const [activePrivacyTab, setActivePrivacyTab] = useState<PrivacyType>('mine');
  
  // Check if URL has invite parameter (?pareja=... or ?join=...)
  const urlParams = new URLSearchParams(window.location.search);
  const hasInviteParam = Boolean(urlParams.get('pareja') || urlParams.get('join') || urlParams.get('codigo'));

  // Profile Setup & Active Profile
  const profileConfig = getProfileConfig();
  const [activeProfile, setActiveProfileState] = useState<UserProfile>(getActiveProfile());
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(!profileConfig.isSetupComplete || hasInviteParam);
  
  // Data State
  const [events, setEvents] = useState<EventItem[]>([]);
  const [dedications, setDedications] = useState<DedicationItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [sharedGroceries, setSharedGroceries] = useState<SharedGroceryItem[]>([]);
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [coupleMoods, setCoupleMoods] = useState<Record<UserProfile, CoupleMoodStatus>>(getCoupleMoods());
  
  // Modals & Selection
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isDedicationModalOpen, setIsDedicationModalOpen] = useState(false);
  const [isMoodCheckinOpen, setIsMoodCheckinOpen] = useState(false);
  const [activeSurprise, setActiveSurprise] = useState<DedicationItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileVersion, setProfileVersion] = useState(0);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const [newEventDefaultDate, setNewEventDefaultDate] = useState<string | null>(null);

  // Delete Confirmation Target Modal State
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: 'event'; data: EventItem }
    | { type: 'dedication'; data: DedicationItem }
    | { type: 'task'; data: TaskItem }
    | { type: 'grocery'; data: SharedGroceryItem }
    | null
  >(null);

  // Detect PWA Standalone Mode (Home Screen on iPhone / Android)
  useEffect(() => {
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');

      if (isStandalone) {
        document.documentElement.classList.add('pwa-standalone');
      } else {
        document.documentElement.classList.remove('pwa-standalone');
      }
    };

    checkStandalone();
    window.addEventListener('resize', checkStandalone);
    return () => window.removeEventListener('resize', checkStandalone);
  }, []);

  // Start background notification monitor (citas, pastillero, briefing)
  useEffect(() => {
    notificationScheduler.start();
    return () => {
      notificationScheduler.stop();
    };
  }, []);

  // Deep Link navigation from Notification Click (?view=today|calendar|tasks|memories)
  useEffect(() => {
    const handleUrlView = () => {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') as NavView;
      if (viewParam && ['today', 'calendar', 'tasks', 'memories'].includes(viewParam)) {
        setCurrentView(viewParam);
      }
    };
    handleUrlView();
    window.addEventListener('popstate', handleUrlView);
    return () => window.removeEventListener('popstate', handleUrlView);
  }, []);

  // Track notified IDs in session to avoid repeat notifications on initial mount sync
  const knownEventIdsRef = React.useRef<Set<string>>(new Set());
  const knownDedicationIdsRef = React.useRef<Set<string>>(new Set());
  const knownGroceryIdsRef = React.useRef<Set<string>>(new Set());
  const isInitialCloudSyncRef = React.useRef<boolean>(true);

  // Load initial data
  useEffect(() => {
    const loadedEvents = getEvents();
    const loadedDedications = getDedications();
    const loadedTasks = getTasks(activeProfile);
    const loadedGroceries = getSharedGroceries();
    const loadedMeds = getMedications();
    const loadedMoods = getCoupleMoods();
    setEvents(loadedEvents);
    setDedications(loadedDedications);
    setTasks(loadedTasks);
    setSharedGroceries(loadedGroceries);
    setMedications(loadedMeds);
    setCoupleMoods(loadedMoods);

    // Silent background auto-backup every 4 days
    checkAndRunAutomatedBackup().catch(() => {});
  }, []);

  // Real-time Cloud Subscriptions (Firestore WebSockets)
  useEffect(() => {
    const currentConfig = getProfileConfig();
    if (!currentConfig.isSetupComplete || isWelcomeOpen) return;

    const { isConfigured } = getFirebaseServices();
    if (!isConfigured) return;

    const partnerProfile: UserProfile = activeProfile === 'partner1' ? 'partner2' : 'partner1';

    const unsubEvents = subscribeToCloudEvents((cloudEvents) => {
      if (!isInitialCloudSyncRef.current) {
        // Detect new shared events added by partner
        const newShared = cloudEvents.filter(e => 
          e.privacy === 'shared' && 
          e.author === partnerProfile && 
          !knownEventIdsRef.current.has(e.id)
        );
        if (newShared.length > 0) {
          const evt = newShared[0];
          notificationService.sendNotification({
            title: '✨ Nueva cita compartida',
            body: `${getUserDisplayName(partnerProfile)} agregó: "${evt.title}" a las ${evt.startTime || '10:00'}`,
            url: '/?view=today',
            tag: 'partner-evt-' + evt.id
          });
        }
      }
      cloudEvents.forEach(e => knownEventIdsRef.current.add(e.id));
      setEvents(cloudEvents);
      localStorage.setItem('daily_delight_events_v2', JSON.stringify(cloudEvents));
    });

    const unsubTasks = subscribeToCloudTasks((cloudTasks) => {
      setTasks(cloudTasks.filter(t => t.author === activeProfile));
      localStorage.setItem('daily_delight_tasks_v2', JSON.stringify(cloudTasks));
    });

    const unsubGroceries = subscribeToCloudGroceries((cloudGroceries) => {
      if (!isInitialCloudSyncRef.current) {
        // Detect new groceries added by partner
        const newGroceries = cloudGroceries.filter(g => 
          g.addedBy === partnerProfile && 
          !g.completed && 
          !knownGroceryIdsRef.current.has(g.id)
        );
        if (newGroceries.length > 0) {
          const item = newGroceries[0];
          notificationService.sendNotification({
            title: '🛒 Lista del Súper actualizada',
            body: `${getUserDisplayName(partnerProfile)} agregó "${item.title}" a las compras.`,
            url: '/?view=tasks',
            tag: 'partner-groc-' + item.id
          });
        }
      }
      cloudGroceries.forEach(g => knownGroceryIdsRef.current.add(g.id));
      setSharedGroceries(cloudGroceries);
      localStorage.setItem('daily_delight_shared_groceries_v2', JSON.stringify(cloudGroceries));
    });

    const unsubDedications = subscribeToCloudDedications((cloudDedications) => {
      if (!isInitialCloudSyncRef.current) {
        // Detect new surprise dedications from partner
        const newDeds = cloudDedications.filter(d => 
          d.author === partnerProfile && 
          !d.isRead && 
          !knownDedicationIdsRef.current.has(d.id)
        );
        if (newDeds.length > 0) {
          const ded = newDeds[0];
          notificationService.sendNotification({
            title: '💌 ¡Dedicatoria sorpresa de amor!',
            body: `${getUserDisplayName(partnerProfile)} te ha enviado una cartita de amor.`,
            url: '/?view=memories',
            tag: 'partner-ded-' + ded.id
          });
        }
      }
      cloudDedications.forEach(d => knownDedicationIdsRef.current.add(d.id));
      setDedications(cloudDedications);
      localStorage.setItem('daily_delight_dedications_v2', JSON.stringify(cloudDedications));
      
      // Initial sync completed after first snapshot
      isInitialCloudSyncRef.current = false;
    });

    const unsubMeds = subscribeToCloudMedications((cloudMeds) => {
      setMedications(cloudMeds);
      localStorage.setItem('daily_delight_medications_v2', JSON.stringify(cloudMeds));
    });

    const unsubMoods = subscribeToCloudMoods((cloudMoods: any) => {
      if (cloudMoods && (cloudMoods.partner1 || cloudMoods.partner2 || cloudMoods.dani || cloudMoods.ella)) {
        const p1 = cloudMoods.partner1 || cloudMoods.dani;
        const p2 = cloudMoods.partner2 || cloudMoods.ella;
        setCoupleMoods(prev => {
          const merged: Record<UserProfile, CoupleMoodStatus> = {
            partner1: p1 ? { ...p1, profile: 'partner1' } : prev.partner1,
            partner2: p2 ? { ...p2, profile: 'partner2' } : prev.partner2,
          };
          localStorage.setItem('daily_delight_couple_moods_v2', JSON.stringify(merged));
          return merged;
        });
      }
    });

    const unsubProfile = subscribeToCloudProfileConfig((cloudConfig) => {
      localStorage.setItem('daily_delight_profile_config_v1', JSON.stringify(cloudConfig));
      setProfileVersion((v) => v + 1);
    });

    return () => {
      if (unsubEvents) unsubEvents();
      if (unsubTasks) unsubTasks();
      if (unsubGroceries) unsubGroceries();
      if (unsubDedications) unsubDedications();
      if (unsubMeds) unsubMeds();
      if (unsubMoods) unsubMoods();
      if (unsubProfile) unsubProfile();
    };
  }, [activeProfile, isWelcomeOpen]);

  // Auto launch screen tour when user enters a specific screen (first time per screen)
  useEffect(() => {
    if (!isWelcomeOpen && !isEventModalOpen && !isSettingsOpen && !isDedicationModalOpen) {
      const timer = setTimeout(() => {
        tourService.startTour(currentView, false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentView, isWelcomeOpen]);

  // Update tasks when active profile changes
  useEffect(() => {
    setTasks(getTasks(activeProfile));
  }, [activeProfile]);

  // Check for surprise dedications on load or profile switch
  useEffect(() => {
    const pending = getPendingSurprise(activeProfile);
    if (pending) {
      const timer = setTimeout(() => {
        setActiveSurprise(pending);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [activeProfile, dedications]);

  // Auto-prompt Energy & Mood Check-in 30 minutes after today's agenda finishes
  useEffect(() => {
    let timer: any = null;
    const evaluateAutoPrompt = () => {
      if (checkShouldAutoPromptMood(events, activeProfile)) {
        // Wait a gentle delay so initial render settles
        timer = setTimeout(() => {
          setIsMoodCheckinOpen(true);
          markMoodPromptedForToday(activeProfile);
        }, 1200);
      }
    };

    evaluateAutoPrompt();

    // Check periodically every 60 seconds if the app remains open
    const interval = setInterval(evaluateAutoPrompt, 60000);
    return () => {
      if (timer) clearTimeout(timer);
      clearInterval(interval);
    };
  }, [events, activeProfile]);

  // Dynamic theme class & iOS Status bar / Dynamic Island color sync
  useEffect(() => {
    const isMale = activeProfile === 'partner1';
    if (isMale) {
      document.documentElement.classList.remove('theme-female');
      document.documentElement.classList.add('theme-male');
    } else {
      document.documentElement.classList.remove('theme-male');
      document.documentElement.classList.add('theme-female');
    }

    // Dynamic Island & iOS Status Bar header tinting
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute('content', '#ffffff');
  }, [activeProfile]);

  // ==========================================
  // PWA NATIVE BACK BUTTON & NAVIGATION HISTORY
  // ==========================================
  const isAnyModalOpen =
    isEventModalOpen ||
    isDedicationModalOpen ||
    isMoodCheckinOpen ||
    isSettingsOpen ||
    isExitConfirmOpen ||
    Boolean(selectedEvent) ||
    Boolean(editingEvent) ||
    Boolean(activeSurprise) ||
    Boolean(deleteTarget);

  const closeAllModals = () => {
    setIsEventModalOpen(false);
    setIsDedicationModalOpen(false);
    setIsMoodCheckinOpen(false);
    setIsSettingsOpen(false);
    setIsExitConfirmOpen(false);
    setSelectedEvent(null);
    setEditingEvent(null);
    setActiveSurprise(null);
    setDeleteTarget(null);
  };

  // Push history state whenever a modal opens or view changes from 'today'
  useEffect(() => {
    const currentState = window.history.state || {};
    if (isAnyModalOpen) {
      window.history.pushState({ isModal: true, view: currentView }, '');
    } else if (currentView !== 'today' && currentState.view !== currentView) {
      window.history.pushState({ isModal: false, view: currentView }, '');
    } else if (currentView === 'today' && !currentState.isRoot) {
      window.history.pushState({ isRoot: true, view: 'today' }, '');
    }
  }, [isAnyModalOpen, currentView]);

  // Listen to popstate (Hardware / Browser Back button / Swipe-back gesture)
  useEffect(() => {
    const handlePopState = () => {
      if (isExitConfirmOpen) {
        setIsExitConfirmOpen(false);
      } else if (isAnyModalOpen) {
        closeAllModals();
      } else if (currentView !== 'today') {
        setCurrentView('today');
      } else {
        // We are at root screen (Hoy) -> Show exit confirmation dialog!
        setIsExitConfirmOpen(true);
        // Push state again so user remains inside until confirmation
        window.history.pushState({ isRoot: true, view: 'today' }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAnyModalOpen, currentView, isExitConfirmOpen]);

  // Profile switch handler
  const handleProfileChange = (newProfile: UserProfile) => {
    persistActiveProfile(newProfile);
    setActiveProfileState(newProfile);
  };

  // Event handlers: Save / Edit / Delete / Reorder / Move Date
  const handleSaveEvent = (eventData: Partial<EventItem> & { title: string }) => {
    const updated = saveEvent(eventData);
    setEvents(updated);
    setEditingEvent(null);
    setNewEventDefaultDate(null);
    setIsEventModalOpen(false);

    // Dispatch Apple APNs / Google Push if shared event
    if (eventData.privacy === 'shared') {
      const myName = getUserDisplayName(activeProfile);
      remotePushService.sendPushToPartner({
        title: '✨ Nueva cita compartida',
        body: `${myName} programó: "${eventData.title}" a las ${eventData.startTime || '10:00'}`,
        url: '/?view=today',
        tag: 'remote-event-' + Date.now()
      });
    }
  };

  const handleRequestDeleteEvent = (event: EventItem) => {
    setDeleteTarget({ type: 'event', data: event });
  };

  const handleRequestDeleteDedication = (dedication: DedicationItem) => {
    setDeleteTarget({ type: 'dedication', data: dedication });
  };

  const handleRequestDeleteTask = (task: TaskItem) => {
    setDeleteTarget({ type: 'task', data: task });
  };

  const handleRequestDeleteSharedGrocery = (grocery: SharedGroceryItem) => {
    setDeleteTarget({ type: 'grocery', data: grocery });
  };

  const handleExecuteDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'event') {
      const eventId = deleteTarget.data.id;
      const updated = deleteEvent(eventId);
      setEvents(updated);
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(null);
      }
      if (editingEvent?.id === eventId) {
        setEditingEvent(null);
      }
      setIsEventModalOpen(false);
    } else if (deleteTarget.type === 'dedication') {
      const dedicationId = deleteTarget.data.id;
      const updated = deleteDedication(dedicationId);
      setDedications(updated);
      if (activeSurprise?.id === dedicationId) {
        setActiveSurprise(null);
      }
    } else if (deleteTarget.type === 'task') {
      const taskId = deleteTarget.data.id;
      const updated = deleteTask(taskId, activeProfile);
      setTasks(updated);
    } else if (deleteTarget.type === 'grocery') {
      const groceryId = deleteTarget.data.id;
      const updated = deleteSharedGrocery(groceryId);
      setSharedGroceries(updated);
    }

    setDeleteTarget(null);
  };

  const handleEditEvent = (event: EventItem) => {
    setEditingEvent(event);
    setNewEventDefaultDate(null);
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  const handleOpenNewEventForDate = (dateStr: string) => {
    setEditingEvent(null);
    setNewEventDefaultDate(dateStr);
    setIsEventModalOpen(true);
  };

  const handlePlanSharedDate = (timeWindow: FreeTimeWindow) => {
    const todayStr = getLocalDateStr();
    setNewEventDefaultDate(todayStr);
    setEditingEvent({
      id: '',
      title: 'Cita en pareja',
      date: todayStr,
      startTime: timeWindow.start,
      endTime: timeWindow.end,
      privacy: 'shared',
      category: 'date',
      author: activeProfile,
      createdAt: new Date().toISOString()
    });
    setIsEventModalOpen(true);
  };

  const handleMoveEventDate = (eventId: string, targetDateStr: string) => {
    const targetEvent = events.find(e => e.id === eventId);
    if (targetEvent) {
      const updated = saveEvent({ ...targetEvent, date: targetDateStr });
      setEvents(updated);
    }
  };

  const handleReorderEvents = (reorderedEvents: EventItem[]) => {
    const updated = reorderEvents(reorderedEvents);
    setEvents(updated);
  };

  // Personal Task Handlers
  const handleSaveTask = (taskData: Partial<TaskItem> & { title: string; author: UserProfile }) => {
    const updated = saveTask(taskData);
    setTasks(updated);
  };

  const handleToggleTask = (id: string) => {
    const updated = toggleTask(id, activeProfile);
    setTasks(updated);
  };

  const handleReorderTasks = (reordered: TaskItem[]) => {
    const updated = reorderTasks(reordered, activeProfile);
    setTasks(updated);
  };

  const handleClearCompletedTasks = () => {
    const updated = clearCompletedTasks(activeProfile);
    setTasks(updated);
  };

  // Shared Groceries Handlers
  const handleSaveSharedGrocery = (
    itemData: Partial<SharedGroceryItem> & { title: string; addedBy: UserProfile }
  ) => {
    const updated = saveSharedGrocery(itemData);
    setSharedGroceries(updated);
  };

  const handleToggleSharedGrocery = (id: string) => {
    const updated = toggleSharedGrocery(id);
    setSharedGroceries(updated);
  };

  const handleClearCompletedSharedGroceries = () => {
    const updated = clearCompletedSharedGroceries();
    setSharedGroceries(updated);
  };

  // Couple Mood / Sintonizador Handlers
  const handleSaveCoupleMood = (status: CoupleMoodStatus) => {
    const updated = saveCoupleMood(status);
    setCoupleMoods(updated);
    markMoodPromptedForToday(activeProfile);

    const myName = getUserDisplayName(activeProfile);
    remotePushService.sendPushToPartner({
      title: '💖 Sintonizador de Pareja',
      body: `${myName} ha compartido su estado de ánimo hoy.`,
      url: '/?view=memories',
      tag: 'remote-mood-' + Date.now()
    });
  };

  // Dedications / Surprise handlers
  const handleSaveDedication = (dedicationData: Omit<DedicationItem, 'id' | 'createdAt' | 'readBy'>) => {
    const updated = saveDedication(dedicationData);
    setDedications(updated);
    setIsDedicationModalOpen(false);

    // Dispatch Apple APNs / Google Push for love dedication
    const myName = getUserDisplayName(activeProfile);
    remotePushService.sendPushToPartner({
      title: '💌 ¡Dedicatoria sorpresa de amor!',
      body: `${myName} te ha enviado una cartita de amor.`,
      url: '/?view=memories',
      tag: 'remote-dedication-' + Date.now()
    });
  };

  const handleAcknowledgeSurprise = (id: string) => {
    const updated = markDedicationAsRead(id, activeProfile);
    setDedications(updated);
    setActiveSurprise(null);
  };

  const handleReplayDedication = (dedication: DedicationItem) => {
    setActiveSurprise(dedication);
  };

  // Medication Handlers
  const handleSaveMedication = (medData: Partial<MedicationItem> & { name: string; author: UserProfile }) => {
    const updated = saveMedication(medData);
    setMedications(updated);
  };

  const handleDeleteMedication = (id: string) => {
    const updated = deleteMedication(id);
    setMedications(updated);
  };

  const handleToggleMedicationTaken = (id: string) => {
    const updated = toggleMedicationTaken(id);
    setMedications(updated);
  };

  const handleResetData = () => {
    resetAppToCleanSlate();
    setEvents([]);
    setDedications([]);
    setTasks([]);
    setSharedGroceries([]);
    setMedications([]);
    setCoupleMoods(getCoupleMoods());
    setIsWelcomeOpen(true);
  };

  const currentProfileColor = getUserProfileColor(activeProfile);
  const themeClass = currentProfileColor === 'blue' ? 'theme-male' : 'theme-female';
  const hasUnread = Boolean(getPendingSurprise(activeProfile));

  return (
    <div
      key={`app-root-${profileVersion}`}
      className={`min-h-screen flex flex-col relative text-on-surface transition-colors duration-300 ${themeClass}`}
      style={{ backgroundColor: 'var(--app-bg, #d6cddb)' }}
    >
      {/* Top Header */}
      <Header
        activeProfile={activeProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onStartTour={() => tourService.startTour(currentView, true)}
        hasUnreadDedication={hasUnread}
        partnerMood={coupleMoods[activeProfile === 'partner1' ? 'partner2' : 'partner1']}
        todayEvents={events.filter((e) => e.date === getLocalDateStr())}
        onOpenSurprise={() => {
          const s = getPendingSurprise(activeProfile);
          if (s) setActiveSurprise(s);
        }}
        onOpenMoodCheckin={() => setIsMoodCheckinOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto pt-2 px-3 sm:px-4">
        {/* Privacy Selector Toggle para vista de calendario */}
        {currentView === 'calendar' && (
          <PrivacyToggle
            activeTab={activePrivacyTab}
            onTabChange={setActivePrivacyTab}
          />
        )}

        {/* View 1: Timeline / Flujo de Hoy */}
        {currentView === 'today' && (
          <TimelineView
            events={events}
            tasks={tasks}
            activeProfile={activeProfile}
            userName={getUserDisplayName(activeProfile)}
            activeTab={activePrivacyTab}
            onTabChange={setActivePrivacyTab}
            onSelectEvent={setSelectedEvent}
            onNewEvent={() => {
              setEditingEvent(null);
              setNewEventDefaultDate(null);
              setIsEventModalOpen(true);
            }}
            onReorderEvents={handleReorderEvents}
            onEditEvent={handleEditEvent}
            onPlanSharedDate={handlePlanSharedDate}
          />
        )}

        {/* View 2: Calendario Semanal / Mensual */}
        {currentView === 'calendar' && (
          <CalendarGridView
            events={events}
            activeTab={activePrivacyTab}
            onSelectEvent={setSelectedEvent}
            onNewEvent={handleOpenNewEventForDate}
            onMoveEventDate={handleMoveEventDate}
            onEditEvent={handleEditEvent}
          />
        )}

        {/* View 3: Tareas & Hogar (Mis Pendientes + Compras + Pastillero) */}
        {currentView === 'tasks' && (
          <TasksView
            tasks={tasks}
            sharedGroceries={sharedGroceries}
            medications={medications}
            activeProfile={activeProfile}
            onSaveTask={handleSaveTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleRequestDeleteTask}
            onReorderTasks={handleReorderTasks}
            onClearCompleted={handleClearCompletedTasks}
            onSaveSharedGrocery={handleSaveSharedGrocery}
            onToggleSharedGrocery={handleToggleSharedGrocery}
            onDeleteSharedGrocery={handleRequestDeleteSharedGrocery}
            onClearCompletedSharedGroceries={handleClearCompletedSharedGroceries}
            onSaveMedication={handleSaveMedication}
            onDeleteMedication={handleDeleteMedication}
            onToggleMedicationTaken={handleToggleMedicationTaken}
          />
        )}

        {/* View 4: Baúl de Recuerdos & Sintonizador de Pareja */}
        {currentView === 'memories' && (
          <MemoriesVault
            dedications={dedications}
            coupleMoods={coupleMoods}
            activeProfile={activeProfile}
            onNewDedication={() => setIsDedicationModalOpen(true)}
            onOpenMoodCheckin={() => setIsMoodCheckinOpen(true)}
            onReplayDedication={handleReplayDedication}
            onDeleteDedication={handleRequestDeleteDedication}
          />
        )}
      </main>

      {/* Bottom Floating Navigation Dock */}
      <NavigationBar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setActivePrivacyTab('mine');
        }}
        onOpenNewEvent={() => {
          setEditingEvent(null);
          setNewEventDefaultDate(null);
          setIsEventModalOpen(true);
        }}
        hasUnreadDedication={hasUnread}
      />

      {/* MODAL 0: Welcome / Initial Profile Screen */}
      <AnimatePresence>
        {isWelcomeOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <WelcomeScreen
              onComplete={(newProfile) => {
                setActiveProfileState(newProfile);
                setIsWelcomeOpen(false);
              }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 1: Surprise Dedication Pop-up */}
      <AnimatePresence>
        {activeSurprise && (
          <SurpriseModal
            dedication={activeSurprise}
            onClose={() => setActiveSurprise(null)}
            onAcknowledge={handleAcknowledgeSurprise}
          />
        )}
      </AnimatePresence>

      {/* MODAL 2: Dedication Creator */}
      <AnimatePresence>
        {isDedicationModalOpen && (
          <DedicationCreator
            activeProfile={activeProfile}
            onClose={() => setIsDedicationModalOpen(false)}
            onSave={handleSaveDedication}
          />
        )}
      </AnimatePresence>

      {/* MODAL 3: Unified Event Modal (Crear y Editar Citas) */}
      <AnimatePresence>
        {isEventModalOpen && (
          <EventModal
            isOpen={isEventModalOpen}
            initialDate={newEventDefaultDate}
            initialEvent={editingEvent}
            activeProfile={activeProfile}
            onClose={() => {
              setIsEventModalOpen(false);
              setEditingEvent(null);
              setNewEventDefaultDate(null);
            }}
            onSave={handleSaveEvent}
            onDelete={handleRequestDeleteEvent}
          />
        )}
      </AnimatePresence>

      {/* MODAL 4: Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onDelete={handleRequestDeleteEvent}
            onEdit={handleEditEvent}
          />
        )}
      </AnimatePresence>

      {/* MODAL 5: Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal
            onClose={() => setIsSettingsOpen(false)}
            onResetData={handleResetData}
            onOpenProfileSetup={() => setIsWelcomeOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* MODAL 6: Confirm Delete Warning Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDeleteModal
            isOpen={Boolean(deleteTarget)}
            item={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleExecuteDelete}
          />
        )}
      </AnimatePresence>

      {/* MODAL 7: Sintonizador de Pareja Check-in Modal */}
      <AnimatePresence>
        {isMoodCheckinOpen && (
          <CoupleMoodCheckinModal
            isOpen={isMoodCheckinOpen}
            currentStatus={coupleMoods[activeProfile]}
            activeProfile={activeProfile}
            onClose={() => setIsMoodCheckinOpen(false)}
            onSave={handleSaveCoupleMood}
          />
        )}
      </AnimatePresence>

      {/* MODAL 8: Profile Modal (Foto de ImgBB, Color de Tema y Nombre) */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <ProfileModal
            isOpen={isProfileModalOpen}
            activeProfile={activeProfile}
            onClose={() => setIsProfileModalOpen(false)}
            onProfileUpdated={() => setProfileVersion((v) => v + 1)}
          />
        )}
      </AnimatePresence>

      {/* MODAL 8: Exit App Confirmation Modal */}
      <AnimatePresence>
        {isExitConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm plush-card p-6 bg-white/95 rounded-3xl border border-white shadow-2xl text-center space-y-4"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-pink-100 text-primary flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[30px]">waving_hand</span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-on-surface">¿Deseas salir de Mi Agenda?</h3>
                <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                  Tus citas, dedicatorias y recuerdos están sincronizados y seguros en la nube.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsExitConfirmOpen(false)}
                  className="py-2.5 px-4 rounded-full candy-btn text-white font-bold text-xs shadow-md"
                >
                  Quedarme
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsExitConfirmOpen(false);
                    if (window.history.length > 1) {
                      window.history.go(-2);
                    } else {
                      window.close();
                    }
                  }}
                  className="py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-on-surface-variant font-bold text-xs transition-colors border border-slate-200"
                >
                  Salir
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
