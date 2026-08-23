import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MedicationItem, UserProfile } from '../types';
import { getUserDisplayName, getUserProfileColor, isMedicationTakenOnDate, getLocalDateStr } from '../services/storageService';
import { hapticService } from '../services/hapticService';
import { downloadMedicationIcs } from '../services/calendarIcsService';
import LordIcon, { LORDICON_ICONS } from './LordIcon';
import MedicationModal from './MedicationModal';

interface MedicationTrackerProps {
  medications: MedicationItem[];
  activeProfile: UserProfile;
  onSaveMedication: (medData: Partial<MedicationItem> & { name: string; author: UserProfile }) => void;
  onDeleteMedication: (id: string) => void;
  onToggleTaken: (id: string) => void;
}

export default function MedicationTracker({
  medications,
  activeProfile,
  onSaveMedication,
  onDeleteMedication,
  onToggleTaken
}: MedicationTrackerProps) {
  const partnerProfile: UserProfile = activeProfile === 'partner1' ? 'partner2' : 'partner1';
  const myColor = getUserProfileColor(activeProfile);
  const partnerColor = getUserProfileColor(partnerProfile);

  // Selected Tab Filter: activeProfile | partnerProfile | 'both'
  const [selectedTab, setSelectedTab] = useState<UserProfile | 'both'>(activeProfile);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<MedicationItem | null>(null);
  const [alarmFeedback, setAlarmFeedback] = useState<string | null>(null);

  const todayStr = getLocalDateStr();

  // Filtered medications according to selected tab
  const filteredMeds = medications.filter((m) => {
    if (selectedTab === 'both') return m.forUser === 'both';
    return m.forUser === selectedTab;
  });

  // Calculate statistics for the active tab
  const totalCount = filteredMeds.length;
  const takenCount = filteredMeds.filter((m) => isMedicationTakenOnDate(m, todayStr)).length;
  const progressPercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  // Counts for badge indicators
  const p1Count = medications.filter((m) => m.forUser === 'partner1' || m.forUser === ('dani' as any)).length;
  const p2Count = medications.filter((m) => m.forUser === 'partner2' || m.forUser === ('ella' as any)).length;
  const myCount = activeProfile === 'partner1' ? p1Count : p2Count;
  const partnerCount = partnerProfile === 'partner1' ? p1Count : p2Count;
  const sharedCount = medications.filter((m) => m.forUser === 'both').length;

  const handleDownloadAlarm = (med: MedicationItem) => {
    hapticService.playPhysicalThud(0.28, 0.18);
    downloadMedicationIcs(med);
    setAlarmFeedback(`Alarma de ${med.name} lista para tu iPhone`);
    setTimeout(() => {
      setAlarmFeedback(null);
    }, 3500);
  };

  const handleOpenNewMed = () => {
    hapticService.playLightTap();
    setEditingMed(null);
    setIsModalOpen(true);
  };

  const handleEditMed = (med: MedicationItem) => {
    hapticService.playLightTap();
    setEditingMed(med);
    setIsModalOpen(true);
  };

  const handleSaveModal = (medData: Partial<MedicationItem> & { name: string; author: UserProfile }) => {
    hapticService.playSuccess();
    onSaveMedication(medData);
    setIsModalOpen(false);
  };

  const handleDeleteFromModal = (id: string) => {
    hapticService.playWarning();
    onDeleteMedication(id);
    setIsModalOpen(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight flex items-center space-x-2">
            <span>💊 Pastillero & Salud</span>
          </h2>
          <p className="text-xs text-on-surface-variant font-medium">
            Control de medicamentos, tomas y botiquín
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={handleOpenNewMed}
          className="px-4 py-2 rounded-full candy-btn text-white text-xs sm:text-sm font-extrabold shadow-md flex items-center space-x-1 select-none"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Añadir</span>
        </motion.button>
      </div>

      {/* iPhone Alarm Feedback Toast Banner */}
      <AnimatePresence>
        {alarmFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="p-3 rounded-2xl bg-amber-500 text-white text-xs font-bold shadow-lg flex items-center justify-between border border-white/40"
          >
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-[18px]">alarm_on</span>
              <span>{alarmFeedback}</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
              iOS ICS
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Segmented Filter Tabs con estilo Candy 3D y colores dinamicos e invertidos */}
      <div className="sunken-well bg-white/75 p-1.5 rounded-full flex items-center space-x-1.5 border border-white/60 shadow-inner">
        {/* Tab 1: Mi Perfil (Color propio activo: Azul o Rosa) */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          type="button"
          onClick={() => {
            hapticService.playLightTap();
            setSelectedTab(activeProfile);
          }}
          className={`flex-1 py-2 px-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-1.5 select-none relative ${
            selectedTab === activeProfile
              ? (myColor === 'blue' ? 'candy-btn-blue text-white shadow-md' : 'candy-btn-pink text-white shadow-md')
              : (myColor === 'blue' ? 'bg-blue-50/70 text-blue-900 hover:bg-blue-100/80 border border-blue-200/70' : 'bg-pink-50/70 text-pink-900 hover:bg-pink-100/80 border border-pink-200/70')
          }`}
        >
          <span className="material-symbols-outlined text-[16px] relative z-10">person</span>
          <span className="relative z-10">{getUserDisplayName(activeProfile)}</span>
          {myCount > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold relative z-10 ${
              selectedTab === activeProfile
                ? 'bg-white/25 text-white'
                : (myColor === 'blue' ? 'bg-blue-200/80 text-blue-900' : 'bg-pink-200/80 text-pink-900')
            }`}>
              {myCount}
            </span>
          )}
        </motion.button>

        {/* Tab 2: Pareja / Invitado (Color invertido de la pareja: Rosa o Azul) */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          type="button"
          onClick={() => {
            hapticService.playLightTap();
            setSelectedTab(partnerProfile);
          }}
          className={`flex-1 py-2 px-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-1.5 select-none relative ${
            selectedTab === partnerProfile
              ? (partnerColor === 'blue' ? 'candy-btn-blue text-white shadow-md' : 'candy-btn-pink text-white shadow-md')
              : (partnerColor === 'blue' ? 'bg-blue-50/70 text-blue-900 hover:bg-blue-100/80 border border-blue-200/70' : 'bg-pink-50/70 text-pink-900 hover:bg-pink-100/80 border border-pink-200/70')
          }`}
        >
          <span className="material-symbols-outlined text-[16px] relative z-10">person</span>
          <span className="relative z-10">{getUserDisplayName(partnerProfile)}</span>
          {partnerCount > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold relative z-10 ${
              selectedTab === partnerProfile
                ? 'bg-white/25 text-white'
                : (partnerColor === 'blue' ? 'bg-blue-200/80 text-blue-900' : 'bg-pink-200/80 text-pink-900')
            }`}>
              {partnerCount}
            </span>
          )}
        </motion.button>

        {/* Tab 3: Botiquín / Compartido (Verde Esmeralda Candy 3D) */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          type="button"
          onClick={() => {
            hapticService.playLightTap();
            setSelectedTab('both');
          }}
          className={`flex-1 py-2 px-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-1.5 select-none relative ${
            selectedTab === 'both'
              ? 'candy-btn-emerald text-white shadow-md'
              : 'bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100/80 border border-emerald-200/70'
          }`}
        >
          <span className="material-symbols-outlined text-[16px] relative z-10">medical_services</span>
          <span className="relative z-10">Botiquín</span>
          {sharedCount > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold relative z-10 ${selectedTab === 'both' ? 'bg-white/25 text-white' : 'bg-emerald-200/80 text-emerald-900'}`}>
              {sharedCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Progress Bar Card */}
      {totalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="plush-card rounded-2xl p-4 bg-white/80 border border-white/90 shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-on-surface flex items-center space-x-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">done_all</span>
              <span>Progreso de hoy:</span>
            </span>
            <span className="font-extrabold text-primary">
              {takenCount} de {totalCount} tomadas ({progressPercent}%)
            </span>
          </div>

          {/* Bar */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full ${
                progressPercent === 100
                  ? 'bg-emerald-500'
                  : selectedTab === 'partner2'
                  ? 'candy-btn'
                  : 'bg-blue-500'
              }`}
            />
          </div>
        </motion.div>
      )}

      {/* Medication List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredMeds.length > 0 ? (
            filteredMeds.map((med) => {
              const isTaken = isMedicationTakenOnDate(med, todayStr);
              return (
                <motion.div
                  key={med.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  className={`plush-card rounded-2xl p-4 border transition-all ${
                    isTaken
                      ? 'bg-emerald-50/70 border-emerald-200/80 shadow-xs'
                      : 'bg-white/90 border-white shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {/* Pill Icon badge */}
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs shrink-0 ${
                          isTaken
                            ? 'bg-emerald-500 text-white'
                            : med.forUser === 'partner2'
                            ? 'candy-btn text-white'
                            : med.forUser === 'partner1'
                            ? 'bg-blue-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[22px]">
                          {isTaken ? 'check_circle' : 'medication'}
                        </span>
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className={`text-sm font-extrabold ${isTaken ? 'line-through text-slate-500' : 'text-on-surface'}`}>
                            {med.name}
                          </h4>
                          {isTaken && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                              Tomada hoy ✅
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                          Dosis: <strong className="text-on-surface">{med.dosage}</strong>
                        </p>

                        {/* Times / Horarios */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {med.times.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-bold bg-surface-variant/70 text-on-surface px-2 py-0.5 rounded-lg flex items-center space-x-1"
                            >
                              <span className="material-symbols-outlined text-[13px] text-primary">schedule</span>
                              <span>{t}</span>
                            </span>
                          ))}
                        </div>

                        {/* Instructions */}
                        {med.instructions && (
                          <p className="text-[11px] text-on-surface-variant/80 italic mt-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100 flex items-start space-x-1">
                            <span className="material-symbols-outlined text-[14px] text-slate-400 shrink-0 mt-0.5">info</span>
                            <span>{med.instructions}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleDownloadAlarm(med)}
                        title="Programar Alarma en iPhone en 1 toque"
                        className="w-7 h-7 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center shadow-2xs border border-red-200/60"
                      >
                        <span className="material-symbols-outlined text-[16px]">alarm</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          hapticService.playLightTap();
                          setEditingMed(med);
                          setIsModalOpen(true);
                        }}
                        className="w-7 h-7 rounded-full bg-surface-variant/40 hover:bg-surface-variant text-on-surface-variant flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Bar: Action Button (Tomar / Desmarcar) */}
                  <div className="mt-3.5 pt-2.5 border-t border-slate-100/80 flex items-center justify-between">
                    <div className="text-[10px] text-on-surface-variant flex items-center space-x-1 font-medium">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                      <span>
                        Para {med.forUser === 'both' ? 'Botiquín Común' : getUserDisplayName(med.forUser)}
                      </span>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => {
                        hapticService.playPhysicalThud(0.25, 0.15);
                        onToggleTaken(med.id);
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center space-x-1.5 transition-all shadow-xs ${
                        isTaken
                          ? 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                          : 'candy-accent-bicolor text-white hover:opacity-90'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isTaken ? 'check' : 'check_circle'}
                      </span>
                      <span>{isTaken ? 'Tomada (Desmarcar)' : 'Tomar Ahora'}</span>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="plush-card rounded-3xl p-8 text-center bg-white/70 border border-white space-y-3"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-pink-100/70 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px]">medication</span>
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-on-surface">No hay medicamentos registrados</h4>
                <p className="text-xs text-on-surface-variant mt-1 max-w-xs mx-auto leading-relaxed">
                  Añade vitaminas, tratamientos o medicamentos de uso diario para llevar el control en pareja.
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  hapticService.playLightTap();
                  setEditingMed(null);
                  setIsModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-full candy-btn text-white text-xs font-bold shadow-md inline-flex items-center space-x-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Registrar Primer Medicamento</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL: Medication Creator & Editor Modal */}
      {isModalOpen && (
        <MedicationModal
          isOpen={isModalOpen}
          activeProfile={activeProfile}
          initialMedication={editingMed}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMed(null);
          }}
          onSave={onSaveMedication}
          onDelete={onDeleteMedication}
        />
      )}
    </div>
  );
}
