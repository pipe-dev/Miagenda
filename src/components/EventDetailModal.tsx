import React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { downloadIcsFile } from '../services/calendarIcsService';
import { EventItem } from '../types';
import { getUserDisplayName } from '../services/storageService';
import { hapticService } from '../services/hapticService';

interface EventDetailModalProps {
  event: EventItem | null;
  onClose: () => void;
  onDelete: (event: EventItem) => void;
  onEdit?: (event: EventItem) => void;
}

// 12-hour format parser
const formatTo12H = (time24?: string) => {
  if (!time24) return '';
  const parts = time24.split(':');
  const h24 = parseInt(parts[0] || '12', 10);
  const minute = parts[1] || '00';
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;
  return `${h12.toString().padStart(2, '0')}:${minute} ${period}`;
};

export default function EventDetailModal({ event, onClose, onDelete, onEdit }: EventDetailModalProps) {
  if (!event) return null;

  const isShared = event.privacy === 'shared';

  const handleSyncAlarm = () => {
    hapticService.playLightTap();
    downloadIcsFile(event);
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto modal-scroll-area bg-inverse-surface/40 backdrop-blur-md cursor-pointer"
      >
        <motion.div
          
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.88, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.88, y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="relative z-10 w-full max-w-lg my-auto candy-modal-card rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden cursor-default"
        >
          {/* iOS Handle */}
          <div className="w-12 h-1 bg-outline-variant/60 rounded-full mx-auto mb-3 cursor-grab" />

          {/* Header & Close (Único botón de cerrar X) */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shadow-md ${
                  isShared ? '' : 'bg-secondary'
                }`}
                style={
                  isShared
                    ? { background: 'linear-gradient(135deg, #007dab 0%, #af0a78 100%)' }
                    : undefined
                }
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isShared ? 'group' : 'person'}
                </span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {isShared ? 'Evento Compartido' : 'Evento Privado (Mi Agenda)'}
              </span>
            </div>

            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/60 active:bg-white text-on-surface-variant flex items-center justify-center shadow-sm"
              title="Cerrar"
            >
              <span className="material-symbols-outlined">close</span>
            </motion.button>
          </div>

          {/* Event Card Content */}
          <div className="plush-card rounded-3xl p-5 mb-5 border-2 border-white">
            <h2 className="font-extrabold text-2xl text-on-surface mb-2 leading-snug">
              {event.title}
            </h2>

            {/* Time & Date Badges (12 Hour format) */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="glass-bead px-3 py-1 rounded-full flex items-center space-x-1.5 text-xs font-bold text-primary" style={{ color: 'var(--primary)' }}>
                <span className="material-symbols-outlined text-[15px]">calendar_month</span>
                <span>{event.date}</span>
              </div>

              <div className="glass-bead px-3 py-1 rounded-full flex items-center space-x-1.5 text-xs font-bold text-secondary">
                <span className="material-symbols-outlined text-[15px]">schedule</span>
                <span>
                  {formatTo12H(event.startTime)} {event.endTime ? `- ${formatTo12H(event.endTime)}` : ''}
                </span>
              </div>
            </div>

            {/* Description */}
            {event.description ? (
              <div className="bg-white/80 rounded-2xl p-4 border border-white mb-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Notas y Detalles:
                </h4>
                <p className="text-sm font-medium text-on-surface leading-relaxed">
                  {event.description}
                </p>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant italic mb-3">
                Sin notas adicionales.
              </p>
            )}

            {/* Created by */}
            <div className="flex justify-between items-center text-[11px] font-semibold text-on-surface-variant pt-2 border-t border-surface-variant/40">
              <span>Creado por: {getUserDisplayName(event.author)}</span>
              <span className="text-primary font-bold" style={{ color: 'var(--primary)' }}>Mi Agenda</span>
            </div>
          </div>

          {/* Golden Candy Action Button: Sync to iPhone */}
          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSyncAlarm}
              className="w-full py-4 rounded-full btn-golden-candy text-on-surface font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-lg select-none"
            >
              <span className="material-symbols-outlined text-[22px]">alarm</span>
              <span>Programar Alarma en Calendario iOS</span>
            </motion.button>

            {/* Actions: Edit & Delete */}
            <div className="flex items-center justify-between pt-1 gap-2">
              {onEdit && (
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => {
                    hapticService.playLightTap();
                    onEdit(event);
                    onClose();
                  }}
                  className={`flex-1 py-2.5 rounded-full ${
                    isShared ? 'candy-accent-bicolor' : 'candy-btn'
                  } text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md select-none`}
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>{isShared ? 'Editar Cita Compartida' : 'Editar Cita'}</span>
                </motion.button>
              )}

              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => {
                  hapticService.playWarning();
                  onDelete(event);
                }}
                className="px-4 py-2.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center space-x-1 border border-red-200 select-none"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Eliminar</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
