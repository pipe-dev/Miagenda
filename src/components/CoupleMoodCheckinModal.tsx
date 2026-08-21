import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoupleMoodStatus, CoupleMoodNeed, UserProfile } from '../types';
import InteractiveBatteryGauge, { getBatteryColor } from './InteractiveBatteryGauge';
import { hapticService } from '../services/hapticService';

interface CoupleMoodCheckinModalProps {
  isOpen: boolean;
  currentStatus?: CoupleMoodStatus;
  activeProfile: UserProfile;
  onClose: () => void;
  onSave: (status: CoupleMoodStatus) => void;
}

const NEED_OPTIONS: { id: CoupleMoodNeed; label: string; icon: string; desc: string }[] = [
  { id: 'intimacy', label: 'Intimidad & Pasión', icon: '🔥', desc: 'Con muchas ganas de ti hoy' },
  { id: 'cuddle', label: 'Ternura & Apapacho', icon: '🧸', desc: 'Mimos y cariño suave en el sofá' },
  { id: 'touch', label: 'Contacto & Abrazos', icon: '🫂', desc: 'Necesito un abrazo largo y sentirte cerca' },
  { id: 'talk', label: 'Charla & Desahogo', icon: '💬', desc: 'Contarte mi día y que nos escuchemos' },
  { id: 'space', label: 'Espacio & Calma', icon: '🌿', desc: 'Un ratito de silencio para desconectar' },
  { id: 'chill', label: 'Plan chill & Pelis', icon: '🍿', desc: 'Cero esfuerzo, solo descansar juntos' },
  { id: 'hangout', label: 'Salir y despejarnos', icon: '🎉', desc: 'Cenar afuera, caminar o tomar algo' }
];

export default function CoupleMoodCheckinModal({
  isOpen,
  currentStatus,
  activeProfile,
  onClose,
  onSave
}: CoupleMoodCheckinModalProps) {
  const [battery, setBattery] = useState<number>(
    typeof currentStatus?.battery === 'number' ? currentStatus.battery : 75
  );
  const [need, setNeed] = useState<CoupleMoodNeed>(currentStatus?.need || 'cuddle');
  const [note, setNote] = useState<string>(currentStatus?.note || '');

  if (!isOpen) return null;

  const colorInfo = getBatteryColor(battery);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      profile: activeProfile,
      battery,
      need,
      note: note.trim() || undefined,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.9, y: 25, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 25, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        className="relative z-10 w-full max-w-lg candy-modal-card rounded-[32px] p-5 sm:p-6 shadow-2xl overflow-hidden border-2 border-white max-h-[92vh] flex flex-col"
      >
        {/* Top iOS handle */}
        <div className="w-12 h-1 bg-outline-variant/60 rounded-full mx-auto mb-3 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-300 text-white flex items-center justify-center shadow-md border border-white">
              <span className="material-symbols-outlined text-[22px]">battery_charging_full</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary leading-none block mb-0.5">
                ENERGÍA & CONEXIÓN
              </span>
              <h3 className="font-extrabold text-xl text-on-surface leading-tight">
                ¿Cómo está tu batería hoy?
              </h3>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 text-on-surface-variant flex items-center justify-center border border-white shadow-sm hover:bg-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </motion.button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSave} className="space-y-5 overflow-y-auto flex-1 pr-1 pb-2">
          {/* Section 1: Dynamic Fluid Interactive Battery */}
          <div className="plush-card rounded-3xl p-4 border border-white shadow-sm flex flex-col items-center bg-white/80">
            <label className="text-xs font-black text-on-surface uppercase tracking-wider block mb-3 text-center">
              1. Nivel de Batería Exacto ({battery}%)
            </label>

            {/* Interactive Gauge */}
            <InteractiveBatteryGauge
              value={battery}
              onChange={setBattery}
              size="lg"
            />

            {/* Status description pill */}
            <div className="mt-3">
              <span className={`text-xs font-extrabold px-3 py-1.5 rounded-full border shadow-2xs flex items-center space-x-1.5 ${colorInfo.badgeBg}`}>
                <span>{colorInfo.icon}</span>
                <span>{colorInfo.statusText}</span>
              </span>
            </div>
          </div>

          {/* Section 2: ¿Qué me apetece hoy? */}
          <div>
            <label className="text-xs font-extrabold text-on-surface uppercase tracking-wider block mb-2">
              2. ¿Qué me vendría bien o me apetece hoy?
            </label>
            <div className="space-y-1.5">
              {NEED_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    hapticService.playLightTap();
                    setNeed(opt.id);
                  }}
                  className={`w-full p-2.5 rounded-2xl border transition-all flex items-center justify-between text-left ${
                    need === opt.id
                      ? 'candy-accent-bicolor text-white border-white/60 shadow-md scale-[1.01]'
                      : 'bg-white/80 text-on-surface border-white hover:bg-white shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-xl shrink-0">{opt.icon}</span>
                    <div className="min-w-0">
                      <p className="font-extrabold text-xs sm:text-sm leading-snug truncate">
                        {opt.label}
                      </p>
                      <p className={`text-[10px] leading-tight ${need === opt.id ? 'text-white/85' : 'text-on-surface-variant'}`}>
                        {opt.desc}
                      </p>
                    </div>
                  </div>

                  {need === opt.id && (
                    <span className="material-symbols-outlined text-[20px] text-white shrink-0 ml-2">
                      check_circle
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Notita privada opcional */}
          <div>
            <label className="text-xs font-extrabold text-on-surface uppercase tracking-wider block mb-1.5">
              3. Mensajito para tu pareja (opcional)
            </label>
            <div className="plush-card rounded-2xl p-2 border border-white shadow-inner bg-white/70">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej: Día pesado en la oficina, con ganas de verte..."
                className="w-full bg-transparent outline-none border-none px-2 py-1.5 text-xs sm:text-sm font-bold text-on-surface placeholder:text-outline-variant"
              />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 flex items-center space-x-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                hapticService.playLightTap();
                onClose();
              }}
              className="flex-1 py-3 rounded-full text-xs font-bold text-on-surface-variant bg-white/80 border border-white hover:bg-white transition-colors"
            >
              Cancelar
            </button>

            <motion.button
              whileTap={{ scale: 0.94 }}
              type="submit"
              onClick={() => hapticService.playPhysicalThud(0.28, 0.18)}
              className="flex-1 py-3 rounded-full candy-accent-bicolor text-white text-xs sm:text-sm font-black shadow-md flex items-center justify-center space-x-1.5 select-none"
            >
              <span className="material-symbols-outlined text-[18px]">done</span>
              <span>Guardar mi Estado</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
