import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { TaskItem, SharedGroceryItem, MedicationItem, UserProfile } from '../types';
import { getUserDisplayName } from '../services/storageService';
import { hapticService } from '../services/hapticService';
import MedicationTracker from './MedicationTracker';
import CoupleSoftLockGate from './CoupleSoftLockGate';

interface TasksViewProps {
  tasks: TaskItem[];
  sharedGroceries: SharedGroceryItem[];
  medications: MedicationItem[];
  activeProfile: UserProfile;
  onSaveTask: (taskData: Partial<TaskItem> & { title: string; author: UserProfile }) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (task: TaskItem) => void;
  onReorderTasks: (reordered: TaskItem[]) => void;
  onClearCompleted: () => void;
  onSaveSharedGrocery: (itemData: Partial<SharedGroceryItem> & { title: string; addedBy: UserProfile }) => void;
  onToggleSharedGrocery: (id: string) => void;
  onDeleteSharedGrocery: (item: SharedGroceryItem) => void;
  onClearCompletedSharedGroceries: () => void;
  onSaveMedication: (medData: Partial<MedicationItem> & { name: string; author: UserProfile }) => void;
  onDeleteMedication: (id: string) => void;
  onToggleMedicationTaken: (id: string) => void;
}

type TabMode = 'personal' | 'groceries' | 'meds';
type FilterType = 'all' | 'pending' | 'completed';

export default function TasksView({
  tasks,
  sharedGroceries,
  medications,
  activeProfile,
  onSaveTask,
  onToggleTask,
  onDeleteTask,
  onReorderTasks,
  onClearCompleted,
  onSaveSharedGrocery,
  onToggleSharedGrocery,
  onDeleteSharedGrocery,
  onClearCompletedSharedGroceries,
  onSaveMedication,
  onDeleteMedication,
  onToggleMedicationTaken
}: TasksViewProps) {
  const [tabMode, setTabMode] = useState<TabMode>('personal');

  // Personal Tasks form state
  const [newTitle, setNewTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'normal' | 'urgent' | 'low'>('normal');
  const [selectedCategory, setSelectedCategory] = useState<'general' | 'work' | 'home' | 'errand'>('general');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showTagOptions, setShowTagOptions] = useState(false);

  // Shared Groceries form state
  const [newGroceryTitle, setNewGroceryTitle] = useState('');
  const [selectedGroceryCategory, setSelectedGroceryCategory] = useState<'groceries' | 'pharmacy' | 'home' | 'bills'>('groceries');

  // Personal Task metrics
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  // Shared Grocery metrics
  const completedGroceriesCount = sharedGroceries.filter((g) => g.completed).length;
  const totalGroceriesCount = sharedGroceries.length;
  const groceryProgressPercent =
    totalGroceriesCount === 0 ? 0 : Math.round((completedGroceriesCount / totalGroceriesCount) * 100);

  const filteredGroceries = sharedGroceries.filter((g) => {
    if (filter === 'pending') return !g.completed;
    if (filter === 'completed') return g.completed;
    return true;
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    hapticService.playPhysicalThud(0.28, 0.18);
    onSaveTask({
      title: newTitle.trim(),
      priority: selectedPriority,
      category: selectedCategory,
      author: activeProfile
    });

    setNewTitle('');
    setShowTagOptions(false);
  };

  const handleAddGrocery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroceryTitle.trim()) return;

    hapticService.playPhysicalThud(0.28, 0.18);
    onSaveSharedGrocery({
      title: newGroceryTitle.trim(),
      category: selectedGroceryCategory,
      addedBy: activeProfile
    });

    setNewGroceryTitle('');
  };

  const handleToggleTaskWithHaptic = (id: string) => {
    hapticService.playSuccess();
    onToggleTask(id);
  };

  const handleToggleGroceryWithHaptic = (id: string) => {
    hapticService.playSuccess();
    onToggleSharedGrocery(id);
  };

  const handleDeleteTaskWithHaptic = (task: TaskItem) => {
    hapticService.playWarning();
    onDeleteTask(task);
  };

  const handleDeleteGroceryWithHaptic = (item: SharedGroceryItem) => {
    hapticService.playWarning();
    onDeleteSharedGrocery(item);
  };

  const getPriorityBadge = (priority?: string) => {
    if (priority === 'urgent') {
      return (
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>Urgente</span>
        </span>
      );
    }
    if (priority === 'low') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          Baja
        </span>
      );
    }
    return null;
  };

  const getCategoryBadge = (category?: string) => {
    if (category === 'work') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
          Trabajo
        </span>
      );
    }
    if (category === 'home') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
          Casa
        </span>
      );
    }
    if (category === 'errand') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          Diligencia
        </span>
      );
    }
    return null;
  };

  const getGroceryCategoryBadge = (category: string) => {
    switch (category) {
      case 'groceries':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Supermercado
          </span>
        );
      case 'pharmacy':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            Farmacia
          </span>
        );
      case 'home':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
            Hogar
          </span>
        );
      case 'bills':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Cuentas
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-32 pt-2">
      {/* 🌟 Segmented Switch: Mis Pendientes vs Compras & Hogar vs Pastillero */}
      <div id="tour-tasks-tabs" className="flex justify-center items-center mb-6">
        <div className="sunken-well bg-white/75 p-1.5 rounded-full flex items-center space-x-1 border border-white/60 shadow-inner">
          {/* 1. Mis Pendientes */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              hapticService.playLightTap();
              setTabMode('personal');
              setFilter('all');
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-colors relative select-none flex items-center space-x-1 ${
              tabMode === 'personal' ? 'text-white' : 'text-on-surface-variant active:text-primary'
            }`}
          >
            {tabMode === 'personal' && (
              <motion.div
                layoutId="tasks-mode-pill"
                className="absolute inset-0 rounded-full candy-btn"
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />
            )}
            <span className="material-symbols-outlined text-[15px] relative z-10">person</span>
            <span className="relative z-10">Mis Pendientes</span>
          </motion.button>

          {/* 2. Compras & Hogar */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              hapticService.playLightTap();
              setTabMode('groceries');
              setFilter('all');
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-colors relative select-none flex items-center space-x-1 ${
              tabMode === 'groceries' ? 'text-white' : 'text-on-surface-variant active:text-primary'
            }`}
          >
            {tabMode === 'groceries' && (
              <motion.div
                layoutId="tasks-mode-pill"
                className="absolute inset-0 rounded-full candy-accent-bicolor"
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />
            )}
            <span className="material-symbols-outlined text-[15px] relative z-10">shopping_cart</span>
            <span className="relative z-10">Compras & Hogar</span>
          </motion.button>

          {/* 3. Salud / Pastillero */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              hapticService.playLightTap();
              setTabMode('meds');
              setFilter('all');
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-colors relative select-none flex items-center space-x-1 ${
              tabMode === 'meds' ? 'text-white' : 'text-on-surface-variant active:text-primary'
            }`}
          >
            {tabMode === 'meds' && (
              <motion.div
                layoutId="tasks-mode-pill"
                className="absolute inset-0 rounded-full candy-btn"
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />
            )}
            <span className="material-symbols-outlined text-[15px] relative z-10">pill</span>
            <span className="relative z-10">Salud</span>
          </motion.button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 👤 VIEW 1: MIS PENDIENTES (INDIVIDUAL)                   */}
      {/* ========================================================= */}
      {tabMode === 'personal' && (
        <>
          {/* Header & Progress Card */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span
                  className="text-[11px] font-extrabold uppercase tracking-widest text-primary transition-colors"
                  style={{ color: 'var(--primary)' }}
                >
                  Agenda Individual
                </span>
                <h2 className="font-extrabold text-2xl text-on-surface tracking-tight select-none">
                  Mis Tareas del Día
                </h2>
              </div>

              <div
                className="px-3 py-1 rounded-full text-xs font-black tracking-wide text-white shadow-sm"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {completedCount} / {totalCount} Hechas
              </div>
            </div>

            {/* 3D Candy Progress Bar Card */}
            <div id="tour-tasks-content" className="plush-card rounded-2xl p-4 border border-white shadow-sm">
              <div className="flex justify-between items-center text-xs font-extrabold text-on-surface mb-2">
                <span>Progreso Personal</span>
                <span className="text-primary font-black" style={{ color: 'var(--primary)' }}>
                  {progressPercent}%
                </span>
              </div>

              {/* Track Well */}
              <div className="w-full h-3.5 bg-surface-container-high rounded-full overflow-hidden p-0.5 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_3px_rgba(255,255,255,0.8)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  className="h-full rounded-full candy-btn relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/50 rounded-full blur-[0.5px]" />
                </motion.div>
              </div>

              {progressPercent === 100 && totalCount > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-xs font-bold text-emerald-600 mt-2 flex items-center justify-center space-x-1"
                >
                  <span className="material-symbols-outlined text-[16px]">celebration</span>
                  <span>¡Felicidades! Has completado todos tus pendientes personales de hoy.</span>
                </motion.p>
              )}
            </div>
          </div>

          {/* Quick Task Input: Sunken Plush Well */}
          <form onSubmit={handleAddTask} className="mb-6">
            <div className="plush-card rounded-2xl p-2.5 border-2 border-white shadow-md transition-all focus-within:ring-2 focus-within:ring-primary">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="¿Qué tienes pendiente por hacer? (Ej: Pagar recibo)..."
                  className="flex-1 bg-transparent outline-none border-none px-3 py-2 text-sm sm:text-base font-bold text-on-surface placeholder:text-outline-variant"
                />

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  type="button"
                  onClick={() => setShowTagOptions(!showTagOptions)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border border-white shadow-sm ${
                    showTagOptions || selectedPriority === 'urgent'
                      ? 'bg-primary text-white'
                      : 'bg-white/80 text-on-surface-variant'
                  }`}
                  title="Etiquetas y prioridad"
                  style={showTagOptions ? { backgroundColor: 'var(--primary)' } : undefined}
                >
                  <span className="material-symbols-outlined text-[20px]">sell</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.92 }}
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-2.5 rounded-full candy-btn text-white text-xs sm:text-sm font-extrabold shadow-md flex items-center space-x-1 disabled:opacity-50 select-none"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Añadir</span>
                </motion.button>
              </div>

              {/* Optional Tags & Priority drawer */}
              <AnimatePresence>
                {showTagOptions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pt-3 border-t border-surface-variant/40 mt-2 space-y-2"
                  >
                    {/* Priority */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider min-w-[72px] shrink-0">
                        Prioridad:
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          { id: 'normal', label: 'Normal' },
                          { id: 'urgent', label: 'Urgente' },
                          { id: 'low', label: 'Baja' }
                        ].map((p) => {
                          const isSelected = selectedPriority === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                hapticService.playLightTap();
                                setSelectedPriority(p.id as any);
                              }}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 select-none ${
                                isSelected
                                  ? 'candy-btn text-white shadow-sm'
                                  : 'bg-white/85 text-on-surface-variant border border-white hover:bg-white'
                              }`}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider min-w-[72px] shrink-0">
                        Categoría:
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          { id: 'general', label: 'General' },
                          { id: 'work', label: 'Trabajo' },
                          { id: 'home', label: 'Casa' },
                          { id: 'errand', label: 'Diligencia' }
                        ].map((c) => {
                          const isSelected = selectedCategory === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                hapticService.playLightTap();
                                setSelectedCategory(c.id as any);
                              }}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 select-none ${
                                isSelected
                                  ? 'candy-btn text-white shadow-sm'
                                  : 'bg-white/85 text-on-surface-variant border border-white hover:bg-white'
                              }`}
                            >
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>

          {/* Filter Tabs & Clear Action */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1 bg-white/70 p-1 rounded-full border border-white shadow-inner">
              {(['all', 'pending', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all relative select-none ${
                    filter === f ? 'text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  style={filter === f ? { backgroundColor: 'var(--primary)' } : undefined}
                >
                  {f === 'all' ? `Todas (${totalCount})` : f === 'pending' ? `Pendientes (${totalCount - completedCount})` : `Hechas (${completedCount})`}
                </button>
              ))}
            </div>

            {completedCount > 0 && (
              <button
                onClick={onClearCompleted}
                className="text-[11px] font-bold text-on-surface-variant/70 hover:text-red-600 transition-colors"
              >
                Limpiar hechas
              </button>
            )}
          </div>

          {/* Tasks List with Drag and Drop */}
          {filteredTasks.length === 0 ? (
            <div className="plush-card rounded-3xl p-8 text-center my-6 border border-white shadow-sm">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[28px]">task_alt</span>
              </div>
              <h3 className="font-extrabold text-base text-on-surface mb-1">
                {filter === 'completed'
                  ? 'No hay tareas completadas todavía'
                  : filter === 'pending'
                  ? '¡No tienes tareas pendientes!'
                  : 'Tu lista de pendientes está vacía'}
              </h3>
              <p className="text-xs text-on-surface-variant">
                Añade recordatorios y tareas rápidas para organizar tu día.
              </p>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={filteredTasks}
              onReorder={(newOrder) => {
                const otherTasks = tasks.filter((t) => !filteredTasks.some((ft) => ft.id === t.id));
                onReorderTasks([...newOrder, ...otherTasks]);
              }}
              className="space-y-2.5"
            >
              <AnimatePresence>
                {filteredTasks.map((task) => (
                  <Reorder.Item
                    key={task.id}
                    value={task}
                    className="select-none"
                    whileDrag={{ scale: 1.02, zIndex: 40, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
                  >
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`plush-card rounded-2xl p-3.5 sm:p-4 border border-white flex items-center justify-between transition-all duration-200 ${
                        task.completed ? 'opacity-65 bg-white/50' : 'bg-white shadow-sm'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 pr-2 min-w-0">
                        {/* Tactile 3D Checkbox */}
                        <motion.button
                          whileTap={{ scale: 0.82 }}
                          type="button"
                          onClick={() => handleToggleTaskWithHaptic(task.id)}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all border ${
                            task.completed
                              ? 'candy-btn text-white shadow-sm border-white/60'
                              : 'bg-surface-container-high text-transparent shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_3px_rgba(255,255,255,0.9)] border-white/80'
                          }`}
                        >
                          <motion.span
                            initial={false}
                            animate={{ scale: task.completed ? 1 : 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            className="material-symbols-outlined text-[18px] font-black leading-none"
                          >
                            check
                          </motion.span>
                        </motion.button>

                        {/* Task Content */}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm sm:text-base font-bold text-on-surface leading-snug transition-all truncate ${
                              task.completed ? 'line-through text-on-surface-variant' : ''
                            }`}
                          >
                            {task.title}
                          </p>

                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {getPriorityBadge(task.priority)}
                            {getCategoryBadge(task.category)}
                          </div>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center space-x-1 shrink-0">
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          type="button"
                          onClick={() => handleDeleteTaskWithHaptic(task)}
                          className="w-7 h-7 rounded-full bg-white/60 hover:bg-red-50 text-on-surface-variant hover:text-red-500 flex items-center justify-center transition-colors shadow-sm"
                          title="Eliminar tarea"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </motion.button>

                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant/40 cursor-grab active:cursor-grabbing hover:text-on-surface"
                          title="Arrastrar para ordenar"
                        >
                          <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                        </div>
                      </div>
                    </motion.div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* 🛒 VIEW 2: COMPRAS & HOGAR (COMPARTIDO DE PAREJA)         */}
      {/* ========================================================= */}
      {tabMode === 'groceries' && (
        <CoupleSoftLockGate
          featureTitle="Lista de Compras del Hogar"
          featureDescription="Sincroniza la lista de compras del súper con tu pareja para que cualquiera de los dos pueda anotar o marcar productos desde su teléfono."
        >
          {/* Header & Shared Progress Card */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-secondary">
                  Compras de Pareja
                </span>
                <h2 className="font-extrabold text-2xl text-on-surface tracking-tight select-none">
                  Súper & Cosas del Hogar
                </h2>
              </div>

              <div className="px-3 py-1 rounded-full text-xs font-black tracking-wide text-white shadow-sm candy-accent-bicolor">
                {completedGroceriesCount} / {totalGroceriesCount} Comprados
              </div>
            </div>

            {/* 3D Progress Bar Card */}
            <div className="plush-card rounded-2xl p-4 border border-white shadow-sm">
              <div className="flex justify-between items-center text-xs font-extrabold text-on-surface mb-2">
                <span>Lista del Hogar</span>
                <span className="text-secondary font-black">{groceryProgressPercent}%</span>
              </div>

              <div className="w-full h-3.5 bg-surface-container-high rounded-full overflow-hidden p-0.5 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_3px_rgba(255,255,255,0.8)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${groceryProgressPercent}%` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  className="h-full rounded-full candy-accent-bicolor relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/50 rounded-full blur-[0.5px]" />
                </motion.div>
              </div>

              {groceryProgressPercent === 100 && totalGroceriesCount > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-xs font-bold text-emerald-600 mt-2 flex items-center justify-center space-x-1"
                >
                  <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                  <span>¡Carrito completado! Ya compraron todo lo que necesitaban.</span>
                </motion.p>
              )}
            </div>
          </div>

          {/* Quick Grocery Input */}
          <form onSubmit={handleAddGrocery} className="mb-6">
            <div className="plush-card rounded-2xl p-3 border-2 border-white shadow-md space-y-2.5">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newGroceryTitle}
                  onChange={(e) => setNewGroceryTitle(e.target.value)}
                  placeholder="¿Qué falta en casa? (Ej: Huevos, Café, Papel)..."
                  className="flex-1 bg-transparent outline-none border-none px-3 py-2 text-sm sm:text-base font-bold text-on-surface placeholder:text-outline-variant"
                />

                <motion.button
                  whileTap={{ scale: 0.92 }}
                  type="submit"
                  disabled={!newGroceryTitle.trim()}
                  className="px-4 py-2.5 rounded-full candy-accent-bicolor text-white text-xs sm:text-sm font-extrabold shadow-md flex items-center space-x-1 disabled:opacity-50 select-none shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                  <span>Anotar</span>
                </motion.button>
              </div>

              {/* Grocery Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-surface-variant/40">
                <span className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider shrink-0 min-w-[50px]">
                  Tipo:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'groceries', label: 'Súper' },
                    { id: 'pharmacy', label: 'Farmacia' },
                    { id: 'home', label: 'Hogar' },
                    { id: 'bills', label: 'Cuentas' }
                  ].map((cat) => {
                    const isSelected = selectedGroceryCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          hapticService.playLightTap();
                          setSelectedGroceryCategory(cat.id as any);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 select-none ${
                          isSelected
                            ? 'candy-accent-bicolor text-white shadow-sm'
                            : 'bg-white/85 text-on-surface-variant border border-white hover:bg-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </form>

          {/* Filter Tabs & Clear Action */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1 bg-white/70 p-1 rounded-full border border-white shadow-inner">
              {(['all', 'pending', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all relative select-none ${
                    filter === f ? 'text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  style={
                    filter === f
                      ? { background: 'linear-gradient(135deg, #007dab 0%, #af0a78 100%)' }
                      : undefined
                  }
                >
                  {f === 'all'
                    ? `Todos (${totalGroceriesCount})`
                    : f === 'pending'
                    ? `Por comprar (${totalGroceriesCount - completedGroceriesCount})`
                    : `Comprados (${completedGroceriesCount})`}
                </button>
              ))}
            </div>

            {completedGroceriesCount > 0 && (
              <button
                onClick={onClearCompletedSharedGroceries}
                className="text-[11px] font-bold text-on-surface-variant/70 hover:text-red-600 transition-colors"
              >
                Vaciar comprados
              </button>
            )}
          </div>

          {/* Groceries List */}
          {filteredGroceries.length === 0 ? (
            <div className="plush-card rounded-3xl p-8 text-center my-6 border border-white shadow-sm">
              <div className="w-14 h-14 rounded-full bg-secondary/10 text-secondary mx-auto flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[28px]">shopping_bag</span>
              </div>
              <h3 className="font-extrabold text-base text-on-surface mb-1">
                {filter === 'completed'
                  ? 'No hay productos comprados aún'
                  : filter === 'pending'
                  ? '¡No falta nada por comprar!'
                  : 'La lista de compras compartida está vacía'}
              </h3>
              <p className="text-xs text-on-surface-variant">
                Cualquiera de los dos puede anotar cosas para la casa desde su teléfono.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence>
                {filteredGroceries.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`plush-card rounded-2xl p-3.5 sm:p-4 border border-white flex items-center justify-between transition-all duration-200 ${
                      item.completed ? 'opacity-65 bg-white/50' : 'bg-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1 pr-2 min-w-0">
                      {/* Tactile 3D Checkbox */}
                      <motion.button
                        whileTap={{ scale: 0.82 }}
                        type="button"
                        onClick={() => handleToggleGroceryWithHaptic(item.id)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all border ${
                          item.completed
                            ? 'candy-accent-bicolor text-white shadow-sm border-white/60'
                            : 'bg-surface-container-high text-transparent shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_3px_rgba(255,255,255,0.9)] border-white/80'
                        }`}
                      >
                        <motion.span
                          initial={false}
                          animate={{ scale: item.completed ? 1 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          className="material-symbols-outlined text-[18px] font-black leading-none"
                        >
                          check
                        </motion.span>
                      </motion.button>

                      {/* Grocery Content */}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm sm:text-base font-bold text-on-surface leading-snug transition-all truncate ${
                            item.completed ? 'line-through text-on-surface-variant' : ''
                          }`}
                        >
                          {item.title}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {getGroceryCategoryBadge(item.category)}
                          <span className="text-[10px] font-bold text-on-surface-variant/80 bg-white/80 px-2 py-0.5 rounded-full border border-white">
                            Añadido por {getUserDisplayName(item.addedBy)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    <div className="shrink-0">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        type="button"
                        onClick={() => handleDeleteGroceryWithHaptic(item)}
                        className="w-7 h-7 rounded-full bg-white/60 hover:bg-red-50 text-on-surface-variant hover:text-red-500 flex items-center justify-center transition-colors shadow-sm"
                        title="Eliminar artículo"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CoupleSoftLockGate>
      )}

      {/* ========================================================= */}
      {/* 💊 VIEW 3: PASTILLERO & SALUD COMPARTIDA                 */}
      {/* ========================================================= */}
      {tabMode === 'meds' && (
        <CoupleSoftLockGate
          featureTitle="Pastillero & Salud Compartida"
          featureDescription="Para recordar y compartir medicamentos, vitaminas y cuidados mutuos, conecta a tu pareja primero."
        >
          <MedicationTracker
            medications={medications}
            activeProfile={activeProfile}
            onSaveMedication={onSaveMedication}
            onDeleteMedication={onDeleteMedication}
            onToggleTaken={onToggleMedicationTaken}
          />
        </CoupleSoftLockGate>
      )}
    </div>
  );
}
