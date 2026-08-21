import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { MedicationItem, UserProfile } from '../types';
import { getUserDisplayName } from '../services/storageService';
import { hapticService } from '../services/hapticService';

interface MedicationModalProps {
  isOpen: boolean;
  activeProfile: UserProfile;
  initialMedication?: MedicationItem | null;
  onClose: () => void;
  onSave: (medData: Partial<MedicationItem> & { name: string; author: UserProfile }) => void;
  onDelete?: (id: string) => void;
}

export default function MedicationModal({
  isOpen,
  activeProfile,
  initialMedication,
  onClose,
  onSave,
  onDelete
}: MedicationModalProps) {
  const [name, setName] = useState(initialMedication?.name || '');
  const [dosage, setDosage] = useState(initialMedication?.dosage || '1 tableta');
  const [forUser, setForUser] = useState<UserProfile | 'both'>(initialMedication?.forUser || activeProfile);
  const [frequency, setFrequency] = useState<'daily' | 'interval' | 'as_needed' | 'specific_days'>(
    initialMedication?.frequency || 'daily'
  );
  const [time1, setTime1] = useState(initialMedication?.times?.[0] || '08:00');
  const [time2, setTime2] = useState(initialMedication?.times?.[1] || '');
  const [time3, setTime3] = useState(initialMedication?.times?.[2] || '');
  const [instructions, setInstructions] = useState(initialMedication?.instructions || '');
  const [isContinuous, setIsContinuous] = useState(initialMedication?.isContinuous ?? true);
  const [hasAlarm, setHasAlarm] = useState(initialMedication?.hasAlarm ?? true);
  const [color, setColor] = useState<'blue' | 'pink' | 'emerald' | 'purple' | 'amber'>(
    initialMedication?.color || (forUser === 'partner2' ? 'pink' : forUser === 'partner1' ? 'blue' : 'emerald')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    hapticService.playSuccess();
    const times = [time1, time2, time3].filter(Boolean);

    onSave({
      id: initialMedication?.id,
      name: name.trim(),
      dosage: dosage.trim(),
      forUser,
      frequency,
      times: times.length > 0 ? times : ['08:00'],
      instructions: instructions.trim() || undefined,
      isContinuous,
      hasAlarm,
      color,
      author: activeProfile
    });
    onClose();
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 140) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            {/* iOS Drag Handle */}
            <div className="w-12 h-1 bg-outline-variant/60 rounded-full mx-auto mb-3 cursor-grab" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[24px]">pill</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-primary tracking-tight">
                    {initialMedication ? 'Editar Medicamento' : 'Nuevo Medicamento'}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium">
                    Horarios, dosis y recordatorios compartidos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/60 hover:bg-white text-on-surface-variant flex items-center justify-center shadow-xs"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Destinatario: Partner 1 / Partner 2 / Ambos */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                  ¿Para quién es este medicamento?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForUser('partner1');
                      setColor('blue');
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border select-none ${
                      forUser === 'partner1'
                        ? 'candy-btn-blue text-white'
                        : 'bg-blue-50/70 text-blue-900 border-blue-200/70 hover:bg-blue-100/80'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    <span>{getUserDisplayName('partner1')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForUser('partner2');
                      setColor('pink');
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border select-none ${
                      forUser === 'partner2'
                        ? 'candy-btn-pink text-white'
                        : 'bg-pink-50/70 text-pink-900 border-pink-200/70 hover:bg-pink-100/80'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    <span>{getUserDisplayName('partner2')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForUser('both');
                      setColor('emerald');
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border select-none ${
                      forUser === 'both'
                        ? 'candy-btn-emerald text-white'
                        : 'bg-emerald-50/70 text-emerald-900 border-emerald-200/70 hover:bg-emerald-100/80'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">medical_services</span>
                    <span>Botiquín</span>
                  </button>
                </div>
              </div>

            {/* Nombre y Dosis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  Nombre del Medicamento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ibuprofeno, Vitamina D3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-slate-200 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary shadow-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  Dosis / Presentación
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1 tableta (400mg), 5ml"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-slate-200 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary shadow-xs font-medium"
                />
              </div>
            </div>

            {/* Horarios de toma */}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                Horarios de toma al día
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-on-surface-variant font-semibold block mb-0.5">Toma 1</span>
                  <input
                    type="time"
                    required
                    value={time1}
                    onChange={(e) => setTime1(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-on-surface focus:outline-none focus:border-primary text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant font-semibold block mb-0.5">Toma 2 (Opcional)</span>
                  <input
                    type="time"
                    value={time2}
                    onChange={(e) => setTime2(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-on-surface focus:outline-none focus:border-primary text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant font-semibold block mb-0.5">Toma 3 (Opcional)</span>
                  <input
                    type="time"
                    value={time3}
                    onChange={(e) => setTime3(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-on-surface focus:outline-none focus:border-primary text-center"
                  />
                </div>
              </div>
            </div>

            {/* Indicaciones médicas / Instrucciones */}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">
                Instrucciones / Recomendaciones
              </label>
              <input
                type="text"
                placeholder="Ej: Tomar con comida, no mezclar con lácteos, abundante agua"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-slate-200 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary shadow-xs font-medium"
              />
            </div>

            {/* Opciones adicionales: Recordatorio y Continuidad */}
            <div className="bg-white/70 p-3 rounded-2xl border border-slate-200/60 space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">alarm</span>
                  <span className="text-xs font-bold text-on-surface">Activar aviso y alarma sonora</span>
                </div>
                <input
                  type="checkbox"
                  checked={hasAlarm}
                  onChange={(e) => setHasAlarm(e.target.checked)}
                  className="w-4 h-4 text-primary rounded-md border-slate-300 focus:ring-primary cursor-pointer accent-primary"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-1 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">all_inclusive</span>
                  <span className="text-xs font-bold text-on-surface">Tratamiento continuo / diario</span>
                </div>
                <input
                  type="checkbox"
                  checked={isContinuous}
                  onChange={(e) => setIsContinuous(e.target.checked)}
                  className="w-4 h-4 text-primary rounded-md border-slate-300 focus:ring-primary cursor-pointer accent-primary"
                />
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              {initialMedication && onDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Deseas eliminar este medicamento del pastillero?')) {
                      onDelete(initialMedication.id);
                      onClose();
                    }
                  }}
                  className="text-xs text-red-500 hover:text-red-700 font-bold px-3 py-2"
                >
                  Eliminar
                </button>
              ) : <div />}

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-full bg-slate-100 text-on-surface-variant font-bold text-xs"
                >
                  Cancelar
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className={`px-6 py-2.5 rounded-full text-white font-bold text-xs shadow-md select-none ${
                    forUser === 'partner1'
                      ? 'candy-btn-blue'
                      : forUser === 'partner2'
                      ? 'candy-btn-pink'
                      : 'candy-btn-emerald'
                  }`}
                >
                  {initialMedication ? 'Guardar Cambios' : 'Guardar en Pastillero'}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
