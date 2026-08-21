import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { EventItem, DedicationItem, TaskItem, SharedGroceryItem } from '../types';
import { downloadCancelIcsFile } from '../services/calendarIcsService';
import { hapticService } from '../services/hapticService';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  item:
    | { type: 'event'; data: EventItem }
    | { type: 'dedication'; data: DedicationItem }
    | { type: 'task'; data: TaskItem }
    | { type: 'grocery'; data: SharedGroceryItem }
    | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  item,
  onClose,
  onConfirm
}: ConfirmDeleteModalProps) {
  const [cancelIosAlarm, setCancelIosAlarm] = useState(true);

  if (!isOpen || !item) return null;

  const isEvent = item.type === 'event';
  const isTask = item.type === 'task';
  const isGrocery = item.type === 'grocery';
  const eventData = isEvent ? (item.data as EventItem) : null;
  const taskData = isTask ? (item.data as TaskItem) : null;
  const groceryData = isGrocery ? (item.data as SharedGroceryItem) : null;
  const dedicationData = item.type === 'dedication' ? (item.data as DedicationItem) : null;

  const title = isEvent
    ? eventData?.title
    : isTask
    ? taskData?.title
    : isGrocery
    ? groceryData?.title
    : (dedicationData?.note || 'Dedicatoria');

  const handleConfirmDelete = () => {
    hapticService.playWarning();
    // If it's an event and user wants to cancel the iOS alarm
    if (isEvent && eventData && cancelIosAlarm && eventData.hasAlarm) {
      try {
        downloadCancelIcsFile(eventData);
      } catch (err) {
        console.error('Error downloading cancel ICS file', err);
      }
    }

    onConfirm();
    onClose();
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-md cursor-pointer"
      >
        <motion.div
          
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.88, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.88, y: 30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="relative z-10 w-full max-w-md my-auto candy-modal-card rounded-[28px] p-6 shadow-2xl overflow-hidden cursor-default border-2 border-white/90"
        >
          {/* iOS Handle */}
          <div className="w-12 h-1 bg-outline-variant/60 rounded-full mx-auto mb-4 cursor-grab" />

          {/* Warning Icon Badge */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-inner shrink-0 border border-red-200">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-600">
                ADVERTENCIA
              </span>
              <h3 className="font-extrabold text-xl text-on-surface leading-tight">
                {isEvent
                  ? '¿Eliminar esta Cita?'
                  : isTask
                  ? '¿Eliminar esta Tarea?'
                  : isGrocery
                  ? '¿Eliminar este Artículo?'
                  : '¿Eliminar este Recuerdo?'}
              </h3>
            </div>
          </div>

          {/* Item Preview Box */}
          <div className="bg-white/80 p-3.5 rounded-2xl border border-white mb-4 shadow-sm">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">
              {isEvent
                ? 'Cita seleccionada:'
                : isTask
                ? 'Tarea seleccionada:'
                : isGrocery
                ? 'Artículo de compras seleccionado:'
                : 'Recuerdo seleccionado:'}
            </p>
            <p className="font-extrabold text-sm sm:text-base text-on-surface line-clamp-2">
              "{title}"
            </p>
            {isEvent && eventData && (
              <p className="text-xs text-on-surface-variant mt-1">
                📅 {eventData.date} | ⏰ {eventData.startTime}
              </p>
            )}
          </div>

          {/* Critical Warning Alert Box */}
          <div className="bg-red-50/90 border border-red-200/80 rounded-2xl p-3.5 mb-4 text-xs text-red-800 leading-relaxed space-y-1.5 shadow-sm">
            <div className="flex items-center space-x-1.5 font-black text-red-700">
              <span className="material-symbols-outlined text-[18px]">lock_reset</span>
              <span>Esta acción es definitiva</span>
            </div>
            <p className="text-red-700/90 font-medium">
              Si borras {isEvent ? 'este evento' : isTask ? 'esta tarea' : isGrocery ? 'este artículo de compras' : 'este recuerdo'}, <strong>no se podrá volver a reestablecer ni recuperar</strong>.
            </p>
          </div>

          {/* Alarm Removal Option for Events */}
          {isEvent && eventData && eventData.hasAlarm && (
            <div className="bg-primary/5 rounded-2xl p-3 border border-primary/20 mb-5 flex items-start space-x-3">
              <input
                type="checkbox"
                id="cancel-alarm-check"
                checked={cancelIosAlarm}
                onChange={(e) => setCancelIosAlarm(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant cursor-pointer"
              />
              <label htmlFor="cancel-alarm-check" className="cursor-pointer">
                <p className="text-xs font-extrabold text-on-surface leading-tight">
                  Remover y apagar alarma en iPhone
                </p>
                <p className="text-[11px] text-on-surface-variant leading-normal mt-0.5">
                  Genera la cancelación oficial de Apple Calendar para que la alarma no vuelva a sonar ni notificar.
                </p>
              </label>
            </div>
          )}

          {/* Actions: Cancel & Delete */}
          <div className="flex items-center gap-2.5 pt-1">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="flex-1 py-3.5 rounded-full bg-white/80 active:bg-white text-on-surface-variant font-bold text-xs sm:text-sm border border-white shadow-sm"
            >
              Cancelar
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleConfirmDelete}
              className="flex-1 py-3.5 rounded-full bg-gradient-to-b from-red-500 to-red-600 active:from-red-600 active:to-red-700 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center space-x-1.5 border border-red-400 select-none"
            >
              <span className="material-symbols-outlined text-[18px]">delete_forever</span>
              <span>Eliminar</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
