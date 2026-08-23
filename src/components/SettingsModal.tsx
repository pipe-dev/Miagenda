const formatTime12H = (time24?: string): string => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr || '0', 10);
  const m = mStr || '00';
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12.toString().padStart(2, '0')}:${m} ${period}`;
};

import React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { getFirebaseServices } from '../services/firebase';
import { getProfileConfig, getUserSchedule, saveUserSchedule } from '../services/storageService';
import { isFirestoreConfigured, getFirestoreConfig } from '../services/firestoreSync';
import { hapticService } from '../services/hapticService';
import { notificationService } from '../services/notificationService';
import LordIcon, { LORDICON_ICONS } from './LordIcon';

interface SettingsModalProps {
  onClose: () => void;
  onResetData: () => void;
  onOpenProfileSetup?: () => void;
}

export default function SettingsModal({
  onClose,
  onResetData,
  onOpenProfileSetup
}: SettingsModalProps) {
  const { isConfigured } = getFirebaseServices();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState<boolean>(notificationService.isEnabled());
  const [permissionStatus, setPermissionStatus] = React.useState<string>(notificationService.getPermission());
  const [isTestingNotif, setIsTestingNotif] = React.useState<boolean>(false);
  const initialSchedule = getUserSchedule();
  const [wakeTimeWeekdays, setWakeTimeWeekdays] = React.useState<string>(initialSchedule.wakeTimeWeekdays || '07:00');
  const [wakeTimeWeekend, setWakeTimeWeekend] = React.useState<string>(initialSchedule.wakeTimeWeekend || '09:00');
  const [sleepTime, setSleepTime] = React.useState<string>(initialSchedule.sleepTime || '23:00');
  const [briefingTime, setBriefingTime] = React.useState<string>(initialSchedule.briefingTime || '08:00');
  const [enableBedtimeReminder, setEnableBedtimeReminder] = React.useState<boolean>(initialSchedule.enableBedtimeReminder ?? true);
  const [enableWakeAlarm, setEnableWakeAlarm] = React.useState<boolean>(initialSchedule.enableWakeAlarm ?? true);
  const [scheduleSavedFeedback, setScheduleSavedFeedback] = React.useState<boolean>(false);

  // Helper to calculate 1 hour before bedtime
  const getBedtimePrepTime = (timeStr: string) => {
    const [h, m] = (timeStr || '23:00').split(':').map(Number);
    let prepH = (h || 23) - 1;
    if (prepH < 0) prepH += 24;
    return `${prepH.toString().padStart(2, '0')}:${(m || 0).toString().padStart(2, '0')}`;
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
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-inverse-surface/40 backdrop-blur-md cursor-pointer"
      >
        <motion.div
          
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.88, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.88, y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="relative z-10 w-full max-w-lg max-h-[92vh] sm:max-h-[86vh] flex flex-col candy-modal-card rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden cursor-default"
        >
          {/* Sticky Header in Modal */}
          <div className="p-5 sm:p-6 pb-2 shrink-0 border-b border-white/60">
            {/* iOS Drag Handle */}
            <div className="w-12 h-1.5 bg-outline-variant/60 rounded-full mx-auto mb-3 cursor-grab" />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[22px]">settings</span>
                </div>
                <div>
                  <h2 className="font-extrabold text-xl sm:text-2xl text-primary tracking-tight">
                    Ajustes & Preferencias
                  </h2>
                  <p className="text-xs text-on-surface-variant font-medium">
                    Perfiles, sincronización y alarmas
                  </p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/60 hover:bg-white text-on-surface-variant flex items-center justify-center shadow-sm"
              >
                <span className="material-symbols-outlined">close</span>
              </motion.button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto modal-scroll-area p-5 sm:p-6 space-y-4 overscroll-contain">
          <div className="w-12 h-1 bg-outline-variant/60 rounded-full mx-auto mb-3 cursor-grab" />

          {/* Header */}
          
            {/* Sincronización en la Nube */}
            <div className="plush-card rounded-2xl p-4 border border-white flex items-center justify-between shadow-xs bg-white/90">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <span className="material-symbols-outlined text-[20px]">
                    {isConfigured ? 'cloud_done' : 'cloud_sync'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface">Sincronización en Tiempo Real</h4>
                  <p className="text-[10px] text-on-surface-variant">
                    {isConfigured
                      ? 'Conexión activa con tu pareja'
                      : 'Modo autónomo protegido'}
                  </p>
                </div>
              </div>
              <span
                className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                  isConfigured
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {isConfigured ? '🟢 Conectado' : 'Activo'}
              </span>
            </div>

            {/* 🔔 Notificaciones Push & Recordatorios */}
            <div className="plush-card rounded-2xl p-4 border border-white bg-white/95 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-pink-100 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">Notificaciones Push</h4>
                    <p className="text-[10px] text-on-surface-variant">
                      Citas (15 min antes), dedicatorias y pastillero
                    </p>
                  </div>
                </div>
                
                {/* Switch Toggle */}
                <button
                  type="button"
                  onClick={async () => {
                    hapticService.playLightTap();
                    if (!notificationsEnabled || permissionStatus !== 'granted') {
                      const res = await notificationService.requestPermission();
                      setPermissionStatus(res);
                      if (res === 'granted') {
                        setNotificationsEnabled(true);
                      }
                    } else {
                      const next = !notificationsEnabled;
                      notificationService.setEnabled(next);
                      setNotificationsEnabled(next);
                    }
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    notificationsEnabled && permissionStatus === 'granted'
                      ? 'bg-primary justify-end'
                      : 'bg-slate-300 justify-start'
                  }`}
                >
                  <motion.div
                    layout
                    className="w-4 h-4 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>

              {/* Status & Test Button */}
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-on-surface-variant flex items-center space-x-1.5">
                  <span>Estado:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                    permissionStatus === 'granted'
                      ? 'bg-emerald-100 text-emerald-700'
                      : permissionStatus === 'denied'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {permissionStatus === 'granted' ? '✅ Permitidas' : permissionStatus === 'denied' ? '🚫 Bloqueadas en el navegador' : '⚠️ Pendiente de permiso'}
                  </span>
                </span>

                <motion.button
                  whileTap={{ scale: 0.94 }}
                  disabled={isTestingNotif}
                  onClick={async () => {
                    setIsTestingNotif(true);
                    hapticService.playLightTap();
                    const success = await notificationService.sendTestNotification();
                    setPermissionStatus(notificationService.getPermission());
                    setNotificationsEnabled(notificationService.isEnabled());
                    setTimeout(() => setIsTestingNotif(false), 1500);
                  }}
                  className="py-1.5 px-3 rounded-full candy-btn text-white text-[11px] font-bold shadow-sm flex items-center justify-center space-x-1"
                >
                  <span className="material-symbols-outlined text-[14px]">send</span>
                  <span>{isTestingNotif ? 'Enviando...' : 'Probar Notificación'}</span>
                </motion.button>
              </div>
            </div>

            {/* ⏰ Horarios Personales & Resumen Matutino */}
            <div className="plush-card rounded-2xl p-4 border border-white bg-white/95 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">schedule</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">Horarios Personales & Rutina</h4>
                    <p className="text-[10px] text-on-surface-variant">
                      Despertar diferenciado, aviso de descanso y resumen
                    </p>
                  </div>
                </div>
                {scheduleSavedFeedback && (
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                    ✓ Guardado
                  </span>
                )}
              </div>

              {/* Grid de Horarios de Despertar */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-extrabold text-on-surface flex items-center space-x-1.5">
                  <span className="material-symbols-outlined text-[15px] text-amber-600">wb_sunny</span>
                  <span>Hora de Despertar (Inicio de Jornada)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Lunes a Viernes */}
                  <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-on-surface flex items-center space-x-1">
                        <span>💼</span>
                        <span>Lunes a Viernes</span>
                      </label>
                      <span className="text-[9px] font-extrabold text-primary" style={{ color: 'var(--primary)' }}>
                        {formatTime12H(wakeTimeWeekdays)}
                      </span>
                    </div>
                    <input
                      type="time"
                      value={wakeTimeWeekdays}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWakeTimeWeekdays(val);
                        saveUserSchedule({ wakeTimeWeekdays: val, wakeTime: val });
                        hapticService.playLightTap();
                        setScheduleSavedFeedback(true);
                        setTimeout(() => setScheduleSavedFeedback(false), 2000);
                      }}
                      className="w-full bg-white px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-on-surface outline-none focus:border-primary shadow-2xs"
                    />
                  </div>

                  {/* Sábado y Domingo */}
                  <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-on-surface flex items-center space-x-1">
                        <span>🏖️</span>
                        <span>Sábado y Domingo</span>
                      </label>
                      <span className="text-[9px] font-extrabold text-primary" style={{ color: 'var(--primary)' }}>
                        {formatTime12H(wakeTimeWeekend)}
                      </span>
                    </div>
                    <input
                      type="time"
                      value={wakeTimeWeekend}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWakeTimeWeekend(val);
                        saveUserSchedule({ wakeTimeWeekend: val });
                        hapticService.playLightTap();
                        setScheduleSavedFeedback(true);
                        setTimeout(() => setScheduleSavedFeedback(false), 2000);
                      }}
                      className="w-full bg-white px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-on-surface outline-none focus:border-primary shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Grid de Hora de Dormir y Resumen Matutino */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Hora de Acostarse */}
                <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-on-surface flex items-center space-x-1">
                      <span>🌙</span>
                      <span>Hora de Acostarse</span>
                    </label>
                    <span className="text-[9px] font-extrabold text-primary" style={{ color: 'var(--primary)' }}>
                      {formatTime12H(sleepTime)}
                    </span>
                  </div>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSleepTime(val);
                      saveUserSchedule({ sleepTime: val });
                      hapticService.playLightTap();
                      setScheduleSavedFeedback(true);
                      setTimeout(() => setScheduleSavedFeedback(false), 2000);
                    }}
                    className="w-full bg-white px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-on-surface outline-none focus:border-primary shadow-2xs"
                  />
                  <p className="text-[9px] text-on-surface-variant/80">
                    Fin de jornada activa
                  </p>
                </div>

                {/* Resumen Matutino */}
                <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-on-surface flex items-center space-x-1">
                      <span>📬</span>
                      <span>Resumen Matutino</span>
                    </label>
                    <span className="text-[9px] font-extrabold text-primary" style={{ color: 'var(--primary)' }}>
                      {formatTime12H(briefingTime)}
                    </span>
                  </div>
                  <input
                    type="time"
                    value={briefingTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBriefingTime(val);
                      saveUserSchedule({ briefingTime: val });
                      hapticService.playLightTap();
                      setScheduleSavedFeedback(true);
                      setTimeout(() => setScheduleSavedFeedback(false), 2000);
                    }}
                    className="w-full bg-white px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-on-surface outline-none focus:border-primary shadow-2xs"
                  />
                  <p className="text-[9px] text-on-surface-variant/80">
                    Notificación diaria de citas y tareas
                  </p>
                </div>
              </div>

              {/* Toggles de Recordatorios Adicionales */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                {/* 1. Alarma al Despertar */}
                <div className="flex items-center justify-between bg-slate-50/80 p-2.5 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">⏰</span>
                    <div>
                      <h5 className="text-[11px] font-bold text-on-surface">Alarma al Despertar</h5>
                      <p className="text-[9px] text-on-surface-variant">
                        Notificación matutina a la hora de levantarse ({initialSchedule.isWeekend ? formatTime12H(wakeTimeWeekend) : formatTime12H(wakeTimeWeekdays)})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !enableWakeAlarm;
                      setEnableWakeAlarm(next);
                      saveUserSchedule({ enableWakeAlarm: next });
                      hapticService.playLightTap();
                    }}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                      enableWakeAlarm ? 'bg-primary justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-xs" />
                  </button>
                </div>

                {/* 2. Recordatorio 1 hora antes de Dormir */}
                <div className="flex items-center justify-between bg-slate-50/80 p-2.5 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">😴</span>
                    <div>
                      <h5 className="text-[11px] font-bold text-on-surface">Aviso 1h antes de Dormir</h5>
                      <p className="text-[9px] text-on-surface-variant">
                        Recordatorio a las <strong>{formatTime12H(getBedtimePrepTime(sleepTime))}</strong> para ir a descansar
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !enableBedtimeReminder;
                      setEnableBedtimeReminder(next);
                      saveUserSchedule({ enableBedtimeReminder: next });
                      hapticService.playLightTap();
                    }}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                      enableBedtimeReminder ? 'bg-primary justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-xs" />
                  </button>
                </div>
              </div>
            </div>

            {/* Invitar a Pareja / Código de Pareja */}
            <div className="plush-card rounded-2xl p-4 border-2 border-pink-100 bg-pink-50/70 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">💑</span>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">Vincular con tu Pareja</h4>
                    <p className="text-[10px] text-on-surface-variant">
                      Código de espacio: <strong className="text-primary font-mono">{getProfileConfig().coupleId || 'AMOR-1001'}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `¡Hola! Creé nuestra agenda compartida en Mi Agenda 💕. Entra aquí para conectarte conmigo: ${window.location.origin}${window.location.pathname}?pareja=${getProfileConfig().coupleId || 'AMOR-1001'}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => hapticService.playLightTap()}
                  className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-sm flex items-center justify-center space-x-1.5 transition-all"
                >
                  <svg viewBox="0 0 24 24" width={16} height={16} className="fill-current text-white shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-5.705 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.842-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>Invitar por WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={(e) => {
                    const link = `${window.location.origin}${window.location.pathname}?pareja=${getProfileConfig().coupleId || 'AMOR-1001'}`;
                    navigator.clipboard.writeText(link);
                    hapticService.playSuccess();
                    const target = e.currentTarget;
                    const span = target.querySelector('.copy-text');
                    if (span) span.textContent = '¡Copiado!';
                    setTimeout(() => {
                      if (span) span.textContent = 'Copiar Enlace';
                    }, 2400);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-on-surface text-xs font-bold border border-slate-200 shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <LordIcon
                    src={LORDICON_ICONS.link}
                    trigger="hover"
                    size={16}
                    primaryColor="#af0a78"
                    secondaryColor="#007dab"
                  />
                  <span className="copy-text">Copiar Enlace</span>
                </button>
              </div>
            </div>

            {/* Editar Perfiles y Nombres */}
            {onOpenProfileSetup && (
              <div className="bg-white/90 p-4 rounded-2xl border border-white flex items-center justify-between shadow-xs">
                <div>
                  <h4 className="text-xs font-bold text-on-surface">Configuración de Perfiles</h4>
                  <p className="text-[10px] text-on-surface-variant">
                    Personalizar nombres y avatares de la pareja
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    hapticService.playLightTap();
                    onOpenProfileSetup();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-full candy-btn text-white text-xs font-bold shadow-md flex items-center space-x-1"
                >
                  <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                  <span>Editar</span>
                </motion.button>
              </div>
            )}

            {/* iOS Alarm Guide */}
            <div className="plush-card rounded-2xl p-4 border border-white bg-white/80">
              <div className="flex items-center space-x-2 text-primary font-bold text-sm mb-1.5">
                <span className="material-symbols-outlined text-[20px]">alarm</span>
                <span>Alarmas y Avisos en iPhone</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-2">
                Al pulsar <strong>"Programar Alarma en iPhone"</strong> en una cita, se genera una alerta sonora oficial en el Calendario de Apple.
              </p>
              <div className="bg-white/90 p-2.5 rounded-xl text-[11px] text-on-surface space-y-1">
                <p>1. Pulsa <strong>"Añadir a Calendario"</strong> cuando Safari lo solicite.</p>
                <p>2. Sonará automáticamente en tu iPhone y Apple Watch a la hora exacta.</p>
              </div>
            </div>

            {/* Backup & Disaster Recovery Card */}
            <div className="plush-card rounded-2xl p-4 border border-white bg-white/90 shadow-xs flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">shield_with_heart</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface">Copia de Seguridad en la Nube</h4>
                  <p className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-1 mt-0.5">
                    <span>●</span>
                    <span>Respaldo automático activo (Cada 4 días)</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200/60">
                Protegido
              </span>
            </div>

            {/* How to install on iOS as PWA */}
            <div className="plush-card rounded-2xl p-4 border border-white bg-white/80">
              <div className="flex items-center space-x-2 text-secondary font-bold text-sm mb-1.5">
                <span className="material-symbols-outlined text-[20px]">install_mobile</span>
                <span>Instalar como App en tu iPhone</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Para usar la app a pantalla completa sin barras de Safari:
              </p>
              <div className="bg-white/90 p-2.5 rounded-xl text-[11px] text-on-surface mt-2 space-y-1">
                <p>1. Abre el enlace en <strong>Safari</strong>.</p>
                <p>2. Pulsa el botón <strong>Compartir</strong> (icono de cuadro con flecha hacia arriba).</p>
                <p>3. Selecciona <strong>"Añadir a pantalla de inicio"</strong>.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
