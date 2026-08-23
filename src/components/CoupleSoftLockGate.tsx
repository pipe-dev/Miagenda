import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getProfileConfig, isCoupleLinked } from '../services/storageService';
import { hapticService } from '../services/hapticService';
import LordIcon, { LORDICON_ICONS } from './LordIcon';

interface CoupleSoftLockGateProps {
  children: React.ReactNode;
  featureTitle?: string;
  featureDescription?: string;
}

// Icono Oficial de WhatsApp SVG
const OfficialWhatsAppIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`fill-current ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-5.705 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.842-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

export default function CoupleSoftLockGate({
  children,
  featureTitle = 'Espacio Compartido de Pareja',
  featureDescription = 'Para sincronizar citas, compras del hogar y notas de amor en tiempo real, conecta a tu pareja primero.'
}: CoupleSoftLockGateProps) {
  const [isLinked, setIsLinked] = useState<boolean>(() => isCoupleLinked());
  const [copied, setCopied] = useState(false);

  // Escuchar en tiempo real cambios en el perfil (cuando la pareja se une por Firebase)
  useEffect(() => {
    const checkLinkStatus = () => {
      const linked = isCoupleLinked();
      setIsLinked(linked);
      if (linked && !isLinked) {
        hapticService.playSuccess();
        try {
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#007dab', '#af0a78', '#25D366', '#f59e0b']
          });
        } catch (_) {}
      }
    };

    checkLinkStatus();
    const interval = setInterval(checkLinkStatus, 800);
    window.addEventListener('storage', checkLinkStatus);
    window.addEventListener('couple_profile_updated', checkLinkStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkLinkStatus);
      window.removeEventListener('couple_profile_updated', checkLinkStatus);
    };
  }, [isLinked]);

  const config = getProfileConfig();
  const coupleId = config.coupleId || 'AMOR-1001';

  const inviteLink = `${window.location.origin}${window.location.pathname}?pareja=${coupleId}`;
  const whatsappMessage = `¡Hola! Creé nuestra agenda compartida en Mi Agenda 💕. Entra aquí para conectarte conmigo: ${inviteLink}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;

  const handleWhatsAppClick = () => {
    hapticService.playLightTap();
  };

  const handleCopyLink = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(inviteLink);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = inviteLink;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      hapticService.playLightTap();
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (err) {
      console.error('Error copying invite link', err);
    }
  };

  // Si ya están ambas personas registradas y vinculadas, mostramos el contenido directamente
  if (isLinked) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="my-4 plush-card rounded-3xl p-6 border-2 border-white relative overflow-hidden shadow-lg bg-gradient-to-br from-pink-50/95 via-white/98 to-cyan-50/95 text-center"
    >
      {/* Burbujas ambientales de fondo */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-pink-400/20 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-cyan-400/20 blur-2xl pointer-events-none" />

      {/* Hero Icono de Corazón Animado */}
      <div className="relative z-10 mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-md mb-4 border-2 border-white">
        <LordIcon
          src={LORDICON_ICONS.heart}
          fallbackKey="heart"
          trigger="loop"
          size={36}
          primaryColor="#ffffff"
          secondaryColor="#ffffff"
        />
      </div>

      <div className="relative z-10 mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-1">
          SINCRONIZACIÓN DE PAREJA
        </span>
        <h3 className="font-black text-xl sm:text-2xl text-on-surface leading-tight mb-2">
          {featureTitle}
        </h3>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
          {featureDescription}
        </p>
      </div>

      {/* Código de Espacio */}
      <div className="relative z-10 inline-flex items-center space-x-2 bg-white/80 border border-pink-200 px-4 py-2 rounded-2xl shadow-inner mb-5">
        <span className="text-xs font-bold text-on-surface-variant">Código de Espacio:</span>
        <span className="font-mono font-black text-primary text-sm tracking-wider">{coupleId}</span>
      </div>

      {/* Botones de Acción Oficiales */}
      <div className="relative z-10 space-y-3 max-w-sm mx-auto">
        {/* 1. Invitar por WhatsApp (con icono oficial) */}
        <motion.a
          whileTap={{ scale: 0.96 }}
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-black shadow-md flex items-center justify-center space-x-2.5 transition-all select-none border border-white/50"
        >
          <OfficialWhatsAppIcon size={20} className="text-white shrink-0" />
          <span>Invitar por WhatsApp</span>
        </motion.a>

        {/* 2. Copiar Enlace */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={handleCopyLink}
          className={`w-full py-3.5 px-4 rounded-2xl text-sm font-black shadow-sm flex items-center justify-center space-x-2 select-none transition-all border ${
            copied
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-white hover:bg-slate-50 text-on-surface border-slate-200'
          }`}
        >
          <LordIcon
            src={copied ? LORDICON_ICONS.check : LORDICON_ICONS.link}
            fallbackKey={copied ? 'check' : 'link'}
            trigger={copied ? 'in' : 'hover'}
            size={18}
            primaryColor={copied ? '#059669' : '#af0a78'}
            secondaryColor={copied ? '#059669' : '#007dab'}
          />
          <span>{copied ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
        </motion.button>
      </div>

      {/* Indicador de estado de espera */}
      <div className="relative z-10 pt-4 flex items-center justify-center space-x-1.5 text-[11px] font-semibold text-on-surface-variant/70">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>Esperando que tu pareja se una con el enlace para desbloquear...</span>
      </div>
    </motion.div>
  );
}
