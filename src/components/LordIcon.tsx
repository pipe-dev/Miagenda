import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import lottie from 'lottie-web';
import assignmentData from '../assets/lottie/assignment.json';

export const LORDICON_ICONS = {
  timeline: 'timeline',
  calendar: 'calendar',
  checklist: 'checklist',
  tasks: 'checklist',
  assignment: 'checklist',
  heart: 'heart',
  plus: 'plus',
  sparkle: 'sparkle',
  chat: 'chat',
  link: 'link',
  check: 'check',
  copy: 'copy',
  share: 'share',
  cart: 'cart',
  pill: 'pill',
  gift: 'gift',
  ticket: 'ticket',
  bell: 'bell',
  settings: 'settings',
  cloud: 'cloud',
  battery: 'battery',
  camera: 'camera',
  microphone: 'microphone',
  sun: 'sun',
  alarm: 'alarm'
};

export interface LordIconProps {
  src?: string;
  name?: string;
  trigger?: 'hover' | 'click' | 'loop' | 'loop-on-hover' | 'morph' | 'boomerang' | 'in';
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackKey?: string;
}

// Dedicated Lordicon Assignment Lottie Component
function AssignmentLottie({
  size = 24,
  primaryColor = '#af0a78',
  className = ''
}: {
  size?: number;
  primaryColor?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load exact Lordicon animation from local JSON
    animRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: assignmentData
    });

    return () => {
      animRef.current?.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`assignment-lottie-container ${className}`}
      style={{
        width: size,
        height: size,
        color: primaryColor,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}
    />
  );
}

export default function LordIcon({
  src = '',
  name,
  size = 24,
  primaryColor = '#af0a78',
  secondaryColor = '#007dab',
  className = '',
  style = {}
}: LordIconProps) {
  const iconKey = (name || src || 'heart').toLowerCase();

  return (
    <span
      className={`inline-flex items-center justify-center select-none relative shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, ...style }}
    >
      {/* 1. 💖 HEART / AMOR (Latido orgánico suave y pausado) */}
      {iconKey.includes('heart') && (
        <motion.svg
          viewBox="0 0 24 24"
          className="w-full h-full"
          animate={{
            scale: [1, 1.12, 0.98, 1.08, 1, 1]
          }}
          whileTap={{ scale: 0.8 }}
          transition={{
            repeat: Infinity,
            duration: 3.2,
            times: [0, 0.14, 0.26, 0.40, 0.55, 1],
            ease: 'easeInOut'
          }}
        >
          <path fill={primaryColor} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </motion.svg>
      )}

      {/* 2. 📅 CALENDAR / AGENDA (Flotación suave y destello de fechas) */}
      {iconKey.includes('calendar') && (
        <motion.svg
          viewBox="0 0 24 24"
          className="w-full h-full"
          animate={{
            y: [0, -2, 0]
          }}
          whileTap={{ scale: 0.82 }}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            ease: 'easeInOut'
          }}
        >
          <rect x="3" y="4" width="18" height="18" rx="4.5" fill="none" stroke={primaryColor} strokeWidth="2.2" />
          <path d="M16 2v4M8 2v4M3 10h18" stroke={primaryColor} strokeWidth="2.2" strokeLinecap="round" />
          <motion.circle
            cx="8"
            cy="14.5"
            r="1.8"
            fill={secondaryColor}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
          />
          <motion.circle
            cx="12"
            cy="14.5"
            r="1.8"
            fill={primaryColor}
            animate={{ opacity: [1, 0.3, 1], scale: [1.2, 0.8, 1.2] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
          />
          <motion.circle
            cx="16"
            cy="14.5"
            r="1.8"
            fill={secondaryColor}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.6, delay: 0.3 }}
          />
        </motion.svg>
      )}

      {/* 3. ⏱️ TIMELINE / HOY (Escaneo continuo de actividades) */}
      {iconKey.includes('timeline') && (
        <motion.svg
          viewBox="0 0 24 24"
          className="w-full h-full"
          animate={{
            scale: [1, 1.05, 1]
          }}
          whileTap={{ scale: 0.82 }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'easeInOut'
          }}
        >
          <rect x="3" y="3" width="18" height="18" rx="4.5" fill="none" stroke={primaryColor} strokeWidth="2.2" />
          <motion.path
            d="M7 8h6"
            stroke={secondaryColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{ x: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          />
          <motion.path
            d="M7 12h10"
            stroke={primaryColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
          />
          <motion.path
            d="M7 16h8"
            stroke={secondaryColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{ x: [0, 2, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, delay: 0.3, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="17"
            cy="8"
            r="1.6"
            fill={primaryColor}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
        </motion.svg>
      )}

      {/* 4. 📋 ÍCONO DE TAREAS / FORMULARIO (Escala 1.9x extra grande, gruesa y prominente) */}
      {(iconKey.includes('checklist') || iconKey.includes('tasks') || iconKey.includes('task') || iconKey.includes('assignment') || iconKey.includes('form')) && (
        <motion.svg
          viewBox="0 0 24 24"
          className="w-full h-full"
          style={{ transform: 'scale(1.18)', transformOrigin: 'center center' }}
          animate={{
            y: [0, -1.8, 0]
          }}
          whileTap={{ scale: 0.82 }}
          transition={{
            repeat: Infinity,
            duration: 2.4,
            ease: 'easeInOut'
          }}
        >
          {/* Hoja / Portapapeles de gran formato */}
          <rect
            x="2.4"
            y="2.8"
            width="19.2"
            height="19"
            rx="4.2"
            fill="none"
            stroke={primaryColor}
            strokeWidth="2.4"
          />

          {/* Clip Superior Centrado Grande */}
          <rect
            x="7.5"
            y="1"
            width="9"
            height="3.8"
            rx="1.9"
            fill={primaryColor}
          />

          {/* Fila 1: Casilla grande con Checkmark animado + Línea gruesa */}
          <rect
            x="5.2"
            y="6.8"
            width="4.5"
            height="4.5"
            rx="1.2"
            fill={secondaryColor}
          />
          <motion.path
            d="M6 9l1.4 1.4 2.2-2.2"
            stroke="#ffffff"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          />
          <path
            d="M12 9h7"
            stroke={primaryColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Fila 2: Casilla activa + Línea gruesa */}
          <rect
            x="5.2"
            y="12.8"
            width="4.5"
            height="4.5"
            rx="1.2"
            fill="none"
            stroke={secondaryColor}
            strokeWidth="1.7"
          />
          <motion.path
            d="M12 15h5.8"
            stroke={secondaryColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.8, delay: 0.2 }}
          />

          {/* Fila 3: Casilla suave + Línea */}
          <rect
            x="5.2"
            y="18.5"
            width="4.5"
            height="2.5"
            rx="1.2"
            fill="none"
            stroke={primaryColor}
            strokeWidth="1.5"
            opacity="0.5"
          />
          <path
            d="M12 19.8h6.5"
            stroke={primaryColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        </motion.svg>
      )}

      {/* 5. ➕ PLUS / BOTÓN CENTRAL (Respiración sutil y giro reactivo al toque) */}
      {(iconKey.includes('plus') || iconKey.includes('add')) && (
        <motion.svg
          viewBox="0 0 24 24"
          className="w-full h-full"
          animate={{
            scale: [1, 1.08, 1]
          }}
          whileTap={{ scale: 0.8, rotate: 90 }}
          transition={{
            repeat: Infinity,
            duration: 2.5,
            ease: 'easeInOut'
          }}
        >
          <path
            d="M12 4v16m-8-8h16"
            stroke={primaryColor}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      )}

      {/* 6. ⚙️ SETTINGS / MENÚ (Rotación continua ultra fluida) */}
      {iconKey.includes('settings') && (
        <motion.svg
          viewBox="0 0 24 24"
          className="w-full h-full"
          fill="none"
          stroke={primaryColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: 360 }}
          whileTap={{ scale: 0.82 }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: 'linear'
          }}
        >
          <circle cx="12" cy="12" r="3.2" fill={secondaryColor} stroke="none" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </motion.svg>
      )}

      {/* 7. ☀️ SUN / RESUMEN (Giro solar continuo y pulsante) */}
      {iconKey.includes('sun') && (
        <motion.svg
          viewBox="0 0 24 24"
          className="w-full h-full"
          fill="none"
          stroke={primaryColor}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: 360, scale: [1, 1.08, 1] }}
          whileTap={{ scale: 0.85 }}
          transition={{
            rotate: { repeat: Infinity, duration: 12, ease: 'linear' },
            scale: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
          }}
        >
          <circle cx="12" cy="12" r="4.5" fill={primaryColor} />
          <path d="M12 2v2.5M12 19.5v2.5M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M6.7 17.3l-1.77 1.77M19.07 4.93l-1.77 1.77" />
        </motion.svg>
      )}

      {/* 8. ✨ SPARKLE / TIEMPO LIBRE (Centelleo continuo) */}
      {iconKey.includes('sparkle') && (
        <motion.svg
          viewBox="0 0 24 24"
          className="w-full h-full fill-current"
          style={{ color: primaryColor }}
          animate={{
            scale: [1, 1.22, 0.95, 1.15, 1],
            rotate: [0, 12, -12, 0]
          }}
          whileTap={{ scale: 0.8 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <path d="M12 0l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-3.01L12 0z" />
        </motion.svg>
      )}

      {/* 9. 📷 CAMERA / FOTOS (Respiración de obturador) */}
      {iconKey.includes('camera') && (
        <motion.svg
          viewBox="0 0 24 24"
          className="w-full h-full"
          fill="none"
          stroke={primaryColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ scale: [1, 1.06, 1] }}
          whileTap={{ scale: 0.85 }}
          transition={{ repeat: Infinity, duration: 2.2 }}
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <motion.circle
            cx="12"
            cy="13"
            r="4"
            fill={secondaryColor}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          />
        </motion.svg>
      )}

      {/* 10. 🎙️ MICROPHONE / VOZ (Ondas sonoras vivas continuas) */}
      {iconKey.includes('microphone') && (
        <motion.svg
          viewBox="0 0 24 24"
          className="w-full h-full"
          fill="none"
          stroke={primaryColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ scale: [1, 1.08, 1] }}
          whileTap={{ scale: 0.85 }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill={secondaryColor} stroke="none" />
          <motion.path
            d="M19 10v2a7 7 0 0 1-14 0v-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
          <path d="M12 19v4M8 23h8" />
        </motion.svg>
      )}

      {/* 11. 🎁 GIFT / CUPONES (Rebote suave) */}
      {iconKey.includes('gift') && (
        <motion.svg
          viewBox="0 0 24 24"
          className="w-full h-full"
          fill="none"
          stroke={primaryColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            y: [0, -3, 0],
            rotate: [0, -3, 3, 0]
          }}
          whileTap={{ scale: 0.82 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" rx="1" fill={secondaryColor} />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </motion.svg>
      )}

      {/* 12. 💊 PILL / SALUD (Giro flotante continuo) */}
      {iconKey.includes('pill') && (
        <motion.svg
          viewBox="0 0 24 24"
          className="w-full h-full"
          fill="none"
          stroke={primaryColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            rotate: [0, 15, -15, 0],
            y: [0, -2, 0]
          }}
          whileTap={{ scale: 0.82 }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        >
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
          <path d="m8.5 8.5 7 7" stroke={secondaryColor} strokeWidth="2.4" />
        </motion.svg>
      )}

      {/* 13. ✔️ CHECK / ÉXITO */}
      {iconKey.includes('check') && (
        <motion.svg
          viewBox="0 0 24 24"
          className="w-full h-full"
          fill="none"
          stroke={primaryColor}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <polyline points="20 6 9 17 4 12" />
        </motion.svg>
      )}

      {/* 14. 🔗 LINK / ENLACE */}
      {iconKey.includes('link') && (
        <motion.svg
          viewBox="0 0 24 24"
          className="w-full h-full"
          fill="none"
          stroke={primaryColor}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </motion.svg>
      )}
    </span>
  );
}
