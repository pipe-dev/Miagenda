import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfileConfig } from '../services/storageService';
import { hapticService } from '../services/hapticService';
import LordIcon, { LORDICON_ICONS } from './LordIcon';

interface CoupleShareBannerProps {
  title?: string;
  subtitle?: string;
  variant?: 'card' | 'compact';
  className?: string;
}

export default function CoupleShareBanner({
  title = 'Conecta a tu Pareja',
  subtitle = 'Comparte este enlace para que tu pareja se sincronice en tiempo real con este espacio.',
  variant = 'card',
  className = ''
}: CoupleShareBannerProps) {
  const [copied, setCopied] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const config = getProfileConfig();
  const coupleId = config.coupleId || 'AMOR-1001';
  
  const inviteLink = `${window.location.origin}${window.location.pathname}?pareja=${coupleId}`;
  const whatsappMessage = `¡Hola! Creé nuestra agenda compartida en Mi Agenda 💕. Entra aquí para conectarte conmigo: ${inviteLink}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;

  const handleCopy = () => {
    hapticService.playSuccess();
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2600);
    } catch (err) {
      console.error('Error al copiar enlace:', err);
    }
  };

  if (isDismissed) return null;

  if (variant === 'compact') {
    return (
      <div className={`w-full bg-gradient-to-r from-pink-50/90 via-white to-cyan-50/90 border border-pink-200/80 rounded-2xl p-2 sm:p-2.5 shadow-xs flex items-center justify-between gap-2 ${className}`}>
        <div className="flex items-center space-x-2 min-w-0">
          <LordIcon
            src={LORDICON_ICONS.heart}
            fallbackKey="heart"
            trigger="hover"
            size={20}
            primaryColor="#af0a78"
            secondaryColor="#007dab"
          />
          <div className="truncate">
            <span className="text-[11px] font-extrabold text-on-surface block truncate">
              Pareja: <span className="font-mono text-primary font-black">{coupleId}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Opción 1: WhatsApp con animación */}
          <motion.a
            whileTap={{ scale: 0.92 }}
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => hapticService.playLightTap()}
            className="px-2.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold shadow-xs flex items-center space-x-1 transition-all group"
            title="Compartir por WhatsApp"
          >
            <LordIcon
              src={LORDICON_ICONS.chat}
              fallbackKey="chat"
              trigger="hover"
              size={15}
              primaryColor="#ffffff"
              secondaryColor="#ffffff"
            />
            <span>WhatsApp</span>
          </motion.a>

          {/* Opción 2: Copiar Enlace con LordIcon animado */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={handleCopy}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold shadow-xs flex items-center space-x-1 transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-on-surface border border-slate-200 hover:bg-slate-50'
            }`}
            title="Copiar enlace de invitación"
          >
            <LordIcon
              src={copied ? LORDICON_ICONS.check : LORDICON_ICONS.link}
              fallbackKey={copied ? 'check' : 'link'}
              trigger={copied ? 'in' : 'hover'}
              size={15}
              primaryColor={copied ? '#ffffff' : '#af0a78'}
              secondaryColor={copied ? '#ffffff' : '#007dab'}
            />
            <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
          </motion.button>
        </div>
      </div>
    );
  }

  // Variant: Card (Featured)
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-4 plush-card rounded-3xl p-4 border-2 border-white relative overflow-hidden shadow-sm bg-gradient-to-br from-pink-50/90 via-white/95 to-cyan-50/90 ${className}`}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-pink-400/15 blur-xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-cyan-400/15 blur-xl pointer-events-none" />

      <div className="flex items-start justify-between relative z-10 mb-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-300 text-white flex items-center justify-center shadow-sm shrink-0 border border-white">
            <LordIcon
              src={LORDICON_ICONS.heart}
              fallbackKey="heart"
              trigger="loop"
              size={20}
              primaryColor="#ffffff"
              secondaryColor="#ffffff"
            />
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                ESPACIO DE PAREJA
              </span>
              <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-mono font-bold border border-pink-200">
                {coupleId}
              </span>
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-on-surface leading-tight">
              {title}
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            hapticService.playLightTap();
            setIsDismissed(true);
          }}
          className="w-6 h-6 rounded-full bg-white/70 text-on-surface-variant/60 hover:text-on-surface flex items-center justify-center text-xs transition-colors"
          title="Ocultar sugerencia"
        >
          <span className="material-symbols-outlined text-[14px]">close</span>
        </button>
      </div>

      <p className="text-[11px] text-on-surface-variant mb-3 leading-relaxed relative z-10">
        {subtitle}
      </p>

      {/* Two Action Buttons: WhatsApp vs Copiar Enlace con LordIcon Animados */}
      <div className="grid grid-cols-2 gap-2 relative z-10">
        {/* Opción 1: WhatsApp */}
        <motion.a
          whileTap={{ scale: 0.95 }}
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => hapticService.playLightTap()}
          className="py-2.5 px-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black shadow-md flex items-center justify-center space-x-1.5 transition-all select-none border border-white/40 group"
        >
          <LordIcon
            src={LORDICON_ICONS.chat}
            fallbackKey="chat"
            trigger="hover"
            size={18}
            primaryColor="#ffffff"
            secondaryColor="#ffffff"
          />
          <span className="truncate">WhatsApp</span>
        </motion.a>

        {/* Opción 2: Copiar Enlace */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleCopy}
          className={`py-2.5 px-3 rounded-2xl text-xs font-black shadow-sm flex items-center justify-center space-x-1.5 transition-all select-none border ${
            copied
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white hover:bg-slate-50 text-on-surface border-slate-200'
          }`}
        >
          <LordIcon
            src={copied ? LORDICON_ICONS.check : LORDICON_ICONS.link}
            fallbackKey={copied ? 'check' : 'link'}
            trigger={copied ? 'in' : 'hover'}
            size={18}
            primaryColor={copied ? '#ffffff' : '#af0a78'}
            secondaryColor={copied ? '#ffffff' : '#007dab'}
          />
          <span className="truncate">{copied ? '¡Copiado!' : 'Copiar Enlace'}</span>
        </motion.button>
      </div>

      {/* Floating feedback toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 text-center text-[10px] font-bold text-emerald-700 bg-emerald-50 py-1 px-2 rounded-xl border border-emerald-200"
          >
            ✅ ¡Enlace con código copiado! Puedes pegarlo directamente en cualquier chat.
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
