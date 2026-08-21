import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { downloadIcsFile } from '../services/calendarIcsService';
import { EventItem, PrivacyType, RecurrenceType, UserProfile } from '../types';
import { hapticService } from '../services/hapticService';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<EventItem> & { title: string }) => void;
  onDelete?: (event: EventItem) => void;
  activeProfile: UserProfile;
  initialDate?: string | null;
  initialEvent?: EventItem | null;
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  activeProfile,
  initialDate,
  initialEvent
}: EventModalProps) {
  const isEditing = Boolean(initialEvent?.id);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [privacy, setPrivacy] = useState<PrivacyType>('shared');
  const [category, setCategory] = useState<'date' | 'work' | 'reminder' | 'special'>('date');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [repeatDays, setRepeatDays] = useState<number[]>([1, 3, 5]); // Default: Mon, Wed, Fri
  const [enableAlarm, setEnableAlarm] = useState(true);

  // Populate data when editing or opening with initialDate
  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title || '');
      setDescription(initialEvent.description || '');
      setDate(initialEvent.date || new Date().toISOString().split('T')[0]);
      setStartTime(initialEvent.startTime || '10:00');
      setEndTime(initialEvent.endTime || '11:00');
      setPrivacy(initialEvent.privacy || 'shared');
      setCategory(initialEvent.category || 'date');
      setRecurrence(initialEvent.recurrence || 'none');
      setRepeatDays(initialEvent.repeatDays || [new Date(initialEvent.date || date).getDay()]);
      setEnableAlarm(initialEvent.hasAlarm ?? true);
    } else {
      setTitle('');
      setDescription('');
      const defaultDate = initialDate || new Date().toISOString().split('T')[0];
      setDate(defaultDate);
      setStartTime('10:00');
      setEndTime('11:00');
      setPrivacy('shared');
      setCategory('date');
      setRecurrence('none');
      const defaultDay = new Date(defaultDate + 'T00:00:00').getDay();
      setRepeatDays([defaultDay]);
      setEnableAlarm(true);
    }
  }, [initialEvent, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const eventPayload: Partial<EventItem> & { title: string } = {
      ...(initialEvent?.id ? { id: initialEvent.id } : {}),
      title: title.trim(),
      description: description.trim(),
      date,
      startTime,
      endTime,
      privacy,
      category,
      recurrence,
      repeatDays: recurrence === 'custom' ? repeatDays : undefined,
      author: initialEvent?.author || activeProfile,
      hasAlarm: enableAlarm,
      hasVoiceNote: false
    };

    onSave(eventPayload);

    if (enableAlarm) {
      downloadIcsFile({
        ...eventPayload,
        id: initialEvent?.id || 'temp-' + Date.now(),
        createdAt: initialEvent?.createdAt || new Date().toISOString()
      } as EventItem);
    }

    onClose();
  };

  const handleDelete = () => {
    if (initialEvent && onDelete) {
      onDelete(initialEvent);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 140) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/30 backdrop-blur-md cursor-pointer overflow-y-auto"
      >
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          onDragEnd={handleDragEnd}
          initial={{ scale: 0.94, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg my-auto rounded-[32px] p-6 sm:p-7 relative overflow-hidden text-on-surface shadow-[0_24px_60px_rgba(0,0,0,0.22),inset_0_2px_4px_rgba(255,255,255,1)] border-2 border-white cursor-default bg-white/95"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(253,248,252,0.95) 100%)'
          }}
        >
          {/* iOS Swipe Bar */}
          <div className="w-12 h-1.5 bg-outline-variant/60 rounded-full mx-auto mb-4 cursor-grab active:cursor-grabbing" />

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span
                className="text-[10px] font-extrabold uppercase tracking-widest text-primary leading-none block mb-0.5"
                style={{ color: 'var(--primary)' }}
              >
                {isEditing ? 'MODIFICAR EVENTO' : 'NUEVO EVENTO'}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-on-surface select-none">
                {isEditing ? 'Editar Cita' : 'Crear Cita o Tarea'}
              </h2>
            </div>

            <motion.button
              whileTap={{ scale: 0.88 }}
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center text-xs font-bold border border-white hover:bg-surface-container shadow-inner"
            >
              ✕
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Privacy Switch: Mi Agenda vs Compartido */}
            <div className="flex justify-center">
              <div className="bg-surface-container-high/80 p-1 rounded-full flex items-center space-x-1 border border-white shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    hapticService.playLightTap();
                    setPrivacy('mine');
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all relative select-none ${
                    privacy === 'mine' ? 'candy-btn text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    <span>Mi Agenda</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    hapticService.playLightTap();
                    setPrivacy('shared');
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all relative select-none ${
                    privacy === 'shared' ? 'candy-accent-bicolor text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <span className="material-symbols-outlined text-[14px]">group</span>
                    <span>Compartido</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Title Input: Plush Sunken Well */}
            <div className="relative group">
              <label className="block text-[11px] font-extrabold text-on-surface-variant mb-1 ml-1 uppercase tracking-wider">
                Título del evento:
              </label>
              <div className="bg-surface-container-high/90 rounded-2xl p-1 shadow-[inset_3px_3px_8px_rgba(0,0,0,0.08),inset_-2px_-2px_6px_rgba(255,255,255,0.9)] border border-white/60 transition-all focus-within:ring-2 focus-within:ring-primary">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Cena romántica, Gimnasio, Reunión"
                  className="w-full bg-transparent outline-none border-none px-3.5 py-2 font-bold text-sm sm:text-base text-on-surface placeholder:text-outline-variant"
                  required
                />
              </div>
            </div>

            {/* Date & Times Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-1 ml-1">Fecha</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white/90 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold border border-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-1 ml-1">Hora Inicio</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-white/90 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold border border-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-1 ml-1">Hora Fin</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-white/90 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold border border-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Category Selector Chips */}
            <div>
              <label className="block text-[11px] font-extrabold text-on-surface-variant mb-1.5 ml-1 uppercase tracking-wider">
                Categoría:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'date', label: 'Cita Romántica', icon: 'local_cafe' },
                  { id: 'special', label: 'Especial', icon: 'auto_awesome' },
                  { id: 'work', label: 'Trabajo', icon: 'business_center' },
                  { id: 'reminder', label: 'Recordatorio', icon: 'notifications' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      hapticService.playLightTap();
                      setCategory(cat.id as any);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 transition-all ${
                      category === cat.id
                        ? 'candy-btn text-white shadow-md'
                        : 'bg-white/70 text-on-surface-variant border border-white/80 hover:bg-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recurrence Selector (Repetir Evento) */}
            <div>
              <label className="block text-[11px] font-extrabold text-on-surface-variant mb-1.5 ml-1 uppercase tracking-wider">
                Repetir Rutina:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'none', label: 'No repetir', icon: 'event' },
                  { id: 'weekly', label: 'Cada semana', icon: 'repeat' },
                  { id: 'weekdays', label: 'Lunes a Viernes', icon: 'work_history' },
                  { id: 'custom', label: 'Días específicos', icon: 'calendar_view_week' },
                  { id: 'daily', label: 'Todos los días', icon: 'routine' }
                ].map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => {
                      hapticService.playLightTap();
                      setRecurrence(rec.id as RecurrenceType);
                    }}
                    className={`py-1.5 px-3 rounded-full text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-all border ${
                      recurrence === rec.id
                        ? 'candy-btn text-white shadow-sm border-white/60'
                        : 'bg-white/75 text-on-surface-variant border-white hover:bg-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{rec.icon}</span>
                    <span>{rec.label}</span>
                  </button>
                ))}
              </div>

              {/* Specific Days Picker (Lunes a Domingo) */}
              <AnimatePresence>
                {recurrence === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden pt-3"
                  >
                    <div className="bg-white/80 p-3 rounded-2xl border border-white shadow-sm">
                      <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider mb-2 text-center">
                        Selecciona los días en que se repite:
                      </p>
                      <div className="flex items-center justify-center space-x-1.5">
                        {[
                          { id: 1, label: 'L', name: 'Lunes' },
                          { id: 2, label: 'M', name: 'Martes' },
                          { id: 3, label: 'X', name: 'Miércoles' },
                          { id: 4, label: 'J', name: 'Jueves' },
                          { id: 5, label: 'V', name: 'Viernes' },
                          { id: 6, label: 'S', name: 'Sábado' },
                          { id: 0, label: 'D', name: 'Domingo' }
                        ].map((d) => {
                          const isSelected = repeatDays.includes(d.id);
                          return (
                            <motion.button
                              key={d.id}
                              whileTap={{ scale: 0.88 }}
                              type="button"
                              onClick={() => {
                                hapticService.playLightTap();
                                if (isSelected) {
                                  if (repeatDays.length > 1) {
                                    setRepeatDays(repeatDays.filter((day) => day !== d.id));
                                  }
                                } else {
                                  setRepeatDays([...repeatDays, d.id].sort());
                                }
                              }}
                              className={`w-9 h-9 rounded-xl text-xs font-black flex flex-col items-center justify-center transition-all border ${
                                isSelected
                                  ? 'candy-btn text-white shadow-sm border-white/80'
                                  : 'bg-surface-container-high text-on-surface-variant border-white/60 hover:bg-white'
                              }`}
                              title={d.name}
                            >
                              <span>{d.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Description Textarea: Carved into soft surface */}
            <div className="relative group">
              <label className="block text-[11px] font-extrabold text-on-surface-variant mb-1 ml-1 uppercase tracking-wider">
                Notas / Mensaje:
              </label>
              <div className="bg-surface-container-high/90 rounded-2xl p-1.5 shadow-[inset_4px_4px_10px_rgba(87,65,74,0.15),inset_-4px_-4px_10px_rgba(255,255,255,1)] transition-shadow duration-300 group-focus-within:bg-white/50 group-focus-within:ring-2 group-focus-within:ring-primary border border-white/60">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-transparent outline-none border-none resize-none p-3 font-medium text-xs sm:text-sm text-on-surface placeholder:text-outline-variant focus:ring-0"
                  placeholder="Escribe notas, recordatorios o detalles de la cita..."
                />
              </div>
            </div>

            {/* iOS Alarm Toggle Switch Row */}
            <div className="pt-1 flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer bg-white/80 px-3.5 py-2 rounded-2xl border border-white shadow-sm">
                <span className="material-symbols-outlined text-[18px] text-primary" style={{ color: 'var(--primary)' }}>
                  alarm
                </span>
                <span className="text-xs font-extrabold text-on-surface">Alarma en Calendario iOS</span>
                <input
                  type="checkbox"
                  checked={enableAlarm}
                  onChange={(e) => {
                    hapticService.playLightTap();
                    setEnableAlarm(e.target.checked);
                  }}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant cursor-pointer ml-1"
                />
              </label>
            </div>

            {/* Bottom Actions Row: Delete (if editing) & Submit Candy Button */}
            <div className="pt-2 flex items-center gap-3">
              {isEditing && onDelete && (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={() => {
                    hapticService.playWarning();
                    handleDelete();
                  }}
                  className="px-4 py-3.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-sm border border-red-200 select-none"
                  title="Eliminar evento"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  <span>Eliminar</span>
                </motion.button>
              )}

              {/* Submit Candy Button (Bicolor if shared!) */}
              <motion.button
                whileTap={{ scale: 0.96, y: 2 }}
                type="submit"
                onClick={() => hapticService.playPhysicalThud(0.28, 0.18)}
                className={`group relative flex-1 overflow-hidden py-3.5 rounded-full ${
                  privacy === 'shared' ? 'candy-accent-bicolor' : 'candy-btn'
                } text-white shadow-lg active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 select-none border border-white/30`}
              >
                {/* Specular Highlight Arc */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3/4 h-2.5 bg-white/60 rounded-full blur-[1px] pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" />

                <span className="relative z-10 font-bold text-sm sm:text-base text-white tracking-wide drop-shadow-md">
                  {isEditing ? (privacy === 'shared' ? 'Actualizar Cita Compartida' : 'Actualizar Cita') : (privacy === 'shared' ? 'Guardar Cita Compartida' : 'Guardar Cita')}
                </span>
                <span className="material-symbols-outlined relative z-10 text-white text-[20px] drop-shadow-md font-bold">
                  {isEditing ? 'check' : 'send'}
                </span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
