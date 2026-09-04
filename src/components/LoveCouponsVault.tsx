import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { LoveCoupon, CouponTier, UserProfile } from '../types';
import {
  getLoveCoupons,
  saveLoveCoupon,
  redeemLoveCoupon,
  unredeemLoveCoupon,
  deleteLoveCoupon,
  getUserDisplayName
} from '../services/storageService';
import { subscribeToCloudCoupons } from '../services/firestoreSync';
import { hapticService } from '../services/hapticService';
import { notificationService } from '../services/notificationService';
import { remotePushService } from '../services/remotePushService';
import { audioService } from '../services/audioService';
import LordIcon, { LORDICON_ICONS } from './LordIcon';
import styles from './LoveCouponsVault.module.css';

interface LoveCouponsVaultProps {
  activeProfile: UserProfile;
}

const TIER_NAMES: Record<CouponTier, { label: string; bg: string }> = {
  dorada: { label: 'Edición Dorada', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
  platino: { label: 'Edición Platino', bg: 'bg-slate-100 text-slate-800 border-slate-300' },
  suprema: { label: 'Experiencia Suprema', bg: 'bg-yellow-100 text-yellow-950 border-yellow-400' },
  rosa: { label: 'Ternura Rosa', bg: 'bg-pink-100 text-pink-900 border-pink-300' },
  bicolor: { label: 'Especial Pareja', bg: 'bg-gradient-to-r from-cyan-100 to-pink-100 text-slate-800 border-primary/30' }
};

export default function LoveCouponsVault({ activeProfile }: LoveCouponsVaultProps) {
  const [coupons, setCoupons] = useState<LoveCoupon[]>(() => getLoveCoupons());
  const [selectedId, setSelectedId] = useState<string>(() => coupons[0]?.id || '');
  const [isCreating, setIsCreating] = useState(false);
  const isInitialSyncRef = useRef(true);
  const prevCouponsRef = useRef<LoveCoupon[]>(coupons);

  // Escucha cambios de cupones en la nube en tiempo real y despierta al receptor
  useEffect(() => {
    const unsub = subscribeToCloudCoupons((cloudCoupons) => {
      if (cloudCoupons && cloudCoupons.length > 0) {
        if (!isInitialSyncRef.current) {
          // 1. Detectar si la pareja canjeó un vale
          const newlyRedeemed = cloudCoupons.find((c) => {
            const prev = prevCouponsRef.current.find((p) => p.id === c.id);
            return c.redeemed && prev && !prev.redeemed;
          });

          if (newlyRedeemed) {
            hapticService.playSuccess();
            audioService.playCompletionChime();
            try {
              confetti({
                particleCount: 80,
                spread: 80,
                origin: { y: 0.5 },
                colors: ['#007dab', '#af0a78', '#f59e0b', '#ec4899', '#10b981']
              });
            } catch (_) {}

            notificationService.sendNotification({
              title: '🎟️ ¡Vale Canjeado por tu pareja!',
              body: `Tu pareja ha canjeado el vale: "${newlyRedeemed.title}". ¡A disfrutarlo juntos! 🎉`,
              url: '/?view=memories',
              tag: 'coupon-redeemed-' + newlyRedeemed.id
            });
          }

          // 2. Detectar si la pareja creó un nuevo vale de regalo
          const newlyAdded = cloudCoupons.find((c) => {
            const prev = prevCouponsRef.current.find((p) => p.id === c.id);
            return !prev && c.from !== activeProfile;
          });

          if (newlyAdded) {
            hapticService.playSuccess();
            audioService.playCompletionChime();
            notificationService.sendNotification({
              title: '🎁 ¡Nuevo Vale 3D de Regalo!',
              body: `Tu pareja te ha regalado un vale de amor: "${newlyAdded.title}". ¡Entra a canjearlo!`,
              url: '/?view=memories',
              tag: 'coupon-new-' + newlyAdded.id
            });
          }
        }

        isInitialSyncRef.current = false;
        prevCouponsRef.current = cloudCoupons;
        setCoupons(cloudCoupons);
        localStorage.setItem('daily_delight_love_coupons_v2', JSON.stringify(cloudCoupons));
      }
    });
    return () => {
      if (unsub) unsub();
    };
  }, [activeProfile]);

  // Custom coupon form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('🎁');
  const [newTier, setNewTier] = useState<CouponTier>('dorada');
  const [newNote, setNewNote] = useState('');

  const cardRef = useRef<HTMLDivElement>(null);

  // =========================================================================
  // 3D Parallax Tilt Physics with Framer Motion Springs (Top-level hooks only)
  // =========================================================================
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 260, damping: 24 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-10, 10]);

  const shadowX = useTransform(mouseXSpring, [-0.5, 0.5], [10, -10]);
  const shadowY = useTransform(mouseYSpring, [-0.5, 0.5], [12, -6]);

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareOpacity = useTransform(mouseXSpring, [-0.5, 0, 0.5], [0.35, 0.08, 0.35]);

  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255, 255, 255, 0.45) 0%, transparent 60%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || !e.touches[0]) return;
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    x.set(touchX / rect.width - 0.5);
    y.set(touchY / rect.height - 0.5);
  };

  const handleResetTilt = () => {
    x.set(0);
    y.set(0);
  };

  // Safe selected coupon resolution
  const selectedCoupon = coupons.find((c) => c.id === selectedId) || coupons[0] || null;

  // Redeem Coupon Action with Tactile Sub-Bass & Confetti
  const handleRedeem = (coupon: LoveCoupon) => {
    hapticService.playSuccess();
    audioService.playCompletionChime();
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#007dab', '#af0a78', '#f59e0b', '#ec4899', '#10b981']
      });
    } catch (_) {}

    const updated = redeemLoveCoupon(coupon.id);
    setCoupons(updated);
    prevCouponsRef.current = updated;

    // Despierta el teléfono de la pareja con Push de alta prioridad
    const myName = getUserDisplayName(activeProfile);
    remotePushService.sendPushToPartner({
      title: '🎟️ ¡Vale 3D Canjeado!',
      body: `${myName} ha canjeado el vale: "${coupon.title}". ¡A disfrutarlo juntos! 🎉`,
      url: '/?view=memories',
      tag: 'remote-coupon-redeem-' + Date.now()
    });

    // Alerta local Dynamic Island para quien lo canjeó
    notificationService.sendNotification({
      title: '🎉 ¡Vale Canjeado con Éxito!',
      body: `Has canjeado "${coupon.title}". Tu pareja ha recibido la notificación.`,
      url: '/?view=memories',
      tag: 'local-coupon-redeemed'
    });
  };

  const handleUnredeem = (coupon: LoveCoupon) => {
    hapticService.playLightTap();
    const updated = unredeemLoveCoupon(coupon.id);
    setCoupons(updated);
    prevCouponsRef.current = updated;

    const myName = getUserDisplayName(activeProfile);
    remotePushService.sendPushToPartner({
      title: '🎟️ Vale Reactivado',
      body: `${myName} reactivó el vale: "${coupon.title}".`,
      url: '/?view=memories',
      tag: 'remote-coupon-unredeem-' + Date.now()
    });
  };

  const handleDelete = (coupon: LoveCoupon) => {
    hapticService.playWarning();
    const updated = deleteLoveCoupon(coupon.id);
    setCoupons(updated);
    prevCouponsRef.current = updated;
    if (updated.length > 0) {
      setSelectedId(updated[0].id);
    } else {
      setSelectedId('');
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    hapticService.playPhysicalThud(0.28, 0.18);
    audioService.playCompletionChime();
    const otherProfile: UserProfile = activeProfile === 'partner1' ? 'partner2' : 'partner1';

    const updated = saveLoveCoupon({
      title: newTitle.trim(),
      description: newDesc.trim() || 'Válido para canjear en cualquier momento especial.',
      icon: newIcon,
      from: activeProfile,
      to: otherProfile,
      tier: newTier,
      customNote: newNote.trim() || undefined
    });

    setCoupons(updated);
    prevCouponsRef.current = updated;
    if (updated.length > 0) {
      setSelectedId(updated[0].id);
    }
    setIsCreating(false);

    // Despierta el teléfono de la pareja con Push de alta prioridad
    const myName = getUserDisplayName(activeProfile);
    remotePushService.sendPushToPartner({
      title: '🎁 ¡Nuevo Vale 3D de Regalo!',
      body: `${myName} te ha regalado un nuevo vale de amor: "${newTitle.trim()}". ¡Entra a canjearlo! ✨`,
      url: '/?view=memories',
      tag: 'remote-coupon-new-' + Date.now()
    });

    // Alerta local Dynamic Island para el creador
    notificationService.sendNotification({
      title: '✨ Vale 3D Creado',
      body: `Le has regalado "${newTitle.trim()}" a tu pareja.`,
      url: '/?view=memories',
      tag: 'local-coupon-created'
    });

    setNewTitle('');
    setNewDesc('');
    setNewNote('');
  };

  const safeTier: CouponTier = selectedCoupon?.tier && TIER_NAMES[selectedCoupon.tier] ? selectedCoupon.tier : 'dorada';
  const tierClass = {
    dorada: styles.tierDorada,
    platino: styles.tierPlatino,
    suprema: styles.tierSuprema,
    rosa: styles.tierRosa,
    bicolor: styles.tierBicolor
  }[safeTier] || styles.tierDorada;

  return (
    <div className="space-y-6">
      {/* Header & Subtitle */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-0.5">
            EXPERIENCIAS & DETALLES
          </span>
          <h3 className="font-extrabold text-xl sm:text-2xl text-on-surface leading-tight">
            Vales & Cupones de Amor
          </h3>
        </div>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            hapticService.playPhysicalThud(0.28, 0.18);
            setIsCreating(true);
          }}
          className="px-3.5 py-2 rounded-full candy-accent-bicolor text-white text-xs font-bold flex items-center space-x-1.5 shadow-md select-none"
        >
          <LordIcon
            src={LORDICON_ICONS.plus}
            trigger="hover"
            size={16}
            primaryColor="#ffffff"
            secondaryColor="#ffffff"
          />
          <span>Crear Cupón</span>
        </motion.button>
      </div>

      {/* 3D SKEUOMORPHIC PRESENTATION CASING & CARD PREVIEW */}
      {selectedCoupon ? (
        <div
          className={styles.customizerWrapper}
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleResetTilt}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleResetTilt}
        >
          <div className={styles.recessedSlotCasing}>
            <div className={styles.slotInteriorBed}>
              {/* Dynamic Soft Shadow Cast */}
              <motion.div
                className={styles.cardCastShadow}
                style={{
                  x: shadowX,
                  y: shadowY
                }}
              />

              {/* The Physical 3D Skeuomorphic Card */}
              <motion.div
                className={`${styles.metallicCard} ${tierClass}`}
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: 'preserve-3d'
                }}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              >
                {/* 3D Chamfered Bevel Edge */}
                <div className={styles.cardBevelEdge} />

                {/* Tactile Satin Surface Overlay */}
                <div className={styles.cardSurfaceTexture} />

                {/* Dynamic Specular Glare */}
                <motion.div
                  className={styles.dynamicGlare}
                  style={{
                    background: glareBackground,
                    opacity: glareOpacity
                  }}
                />

                {/* Ambient Shimmer Sweep */}
                <div className={styles.cardShimmer} />

                {/* Security Guilloché Watermark */}
                <div className={styles.securityWatermark} />

                {/* 3D Redeemed Seal Stamp (if redeemed) */}
                {selectedCoupon.redeemed && (
                  <motion.div
                    initial={{ scale: 2, opacity: 0, rotate: -25 }}
                    animate={{ scale: 1, opacity: 1, rotate: -12 }}
                    className={styles.redeemedSeal}
                  >
                    <span>✓ CANJEADO</span>
                    <span className={styles.redeemedSealDate}>
                      {selectedCoupon.redeemedAt
                        ? new Date(selectedCoupon.redeemedAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short'
                          })
                        : 'HOY'}
                    </span>
                  </motion.div>
                )}

                {/* Card Header Row */}
                <div className={styles.cardHeaderRow} style={{ transform: 'translateZ(12px)' }}>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-base">{selectedCoupon.icon}</span>
                    <span className={styles.brandName}>VALE DE AMOR EXCLUSIVO</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 shadow-2xs border border-white/80">
                    {TIER_NAMES[safeTier]?.label || 'Edición Especial'}
                  </span>
                </div>

                {/* Card Center: Hot-Stamped Benefit Title & Description */}
                <div className={styles.cardCenterBlock} style={{ transform: 'translateZ(20px)' }}>
                  <h4 className={styles.couponBenefitTitle}>
                    {selectedCoupon.title}
                  </h4>
                  <p className={styles.couponBenefitDesc}>
                    {selectedCoupon.description}
                  </p>
                  {selectedCoupon.customNote && (
                    <p className="text-[10px] italic font-semibold mt-1.5 text-on-surface/80 flex items-center space-x-1">
                      <span>💌</span>
                      <span>"{selectedCoupon.customNote}"</span>
                    </p>
                  )}
                </div>

                {/* Card Details Block: Names */}
                <div className={styles.cardDetailsBlock} style={{ transform: 'translateZ(14px)' }}>
                  <div className={styles.namesBlock}>
                    <div className={styles.nameRow}>
                      <span className={styles.nameLabel}>Para:</span>
                      <span className={styles.nameValue}>
                        {getUserDisplayName(selectedCoupon.to)}
                      </span>
                    </div>
                    <div className={styles.nameRow}>
                      <span className={styles.nameLabel}>De:</span>
                      <span className={styles.nameValue}>
                        {getUserDisplayName(selectedCoupon.from)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest block opacity-70">
                      ESTADO
                    </span>
                    <span
                      className={`text-xs font-black uppercase ${
                        selectedCoupon.redeemed ? 'text-red-600' : 'text-emerald-700'
                      }`}
                    >
                      {selectedCoupon.redeemed ? 'Canjeado' : 'Disponible'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="plush-card rounded-3xl p-8 text-center border-2 border-white shadow-sm bg-white/80 my-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[28px]">confirmation_number</span>
          </div>
          <h4 className="font-extrabold text-base text-on-surface mb-1">
            No tienes cupones disponibles
          </h4>
          <p className="text-xs text-on-surface-variant max-w-xs mx-auto mb-4">
            Crea tu primer vale de amor para consentir a tu pareja.
          </p>
          <div className="flex justify-center">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setIsCreating(true)}
              className="px-5 py-2.5 rounded-full candy-accent-bicolor text-white text-xs font-bold shadow-md select-none"
            >
              + Crear Cupón
            </motion.button>
          </div>
        </div>
      )}

      {/* Action Buttons for Selected Coupon */}
      {selectedCoupon && (
        <div className="flex items-center gap-2.5">
          {!selectedCoupon.redeemed ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRedeem(selectedCoupon)}
              className="flex-1 py-3.5 rounded-full btn-golden-candy text-on-surface font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg select-none"
            >
              <span className="material-symbols-outlined text-[20px]">celebration</span>
              <span>¡Canjear este Cupón Ahora!</span>
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleUnredeem(selectedCoupon)}
              className="flex-1 py-3 rounded-full bg-white/80 active:bg-white text-on-surface-variant font-bold text-xs border border-white shadow-sm flex items-center justify-center space-x-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reactivar Cupón</span>
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDelete(selectedCoupon)}
            className="w-11 h-11 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center border border-red-200 shadow-sm shrink-0"
            title="Eliminar este cupón"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </motion.button>
        </div>
      )}

      {/* Empty State when no coupons exist */}
      {coupons.length === 0 && (
        <div className="plush-card rounded-3xl p-8 border-2 border-white shadow-md text-center bg-white/80 space-y-4 my-4">
          <div className="w-16 h-16 rounded-3xl candy-accent-bicolor text-white flex items-center justify-center mx-auto shadow-md">
            <span className="material-symbols-outlined text-[32px]">confirmation_number</span>
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="font-black text-lg text-on-surface">Bóveda de Cupones Limpia</h4>
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
              Aún no has creado vales de amor. Puedes crear experiencias como <i>"Cena sorpresa"</i>, <i>"Masaje relajante"</i> o <i>"Noche de películas"</i> para regalarle a tu pareja.
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              hapticService.playPhysicalThud(0.28, 0.18);
              setIsCreating(true);
            }}
            className="px-5 py-3 rounded-full candy-btn text-white text-xs font-black shadow-md inline-flex items-center space-x-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Crear Primer Cupón</span>
          </motion.button>
        </div>
      )}

      {/* Coupon Selector Grid / Carousel */}
      {coupons.length > 0 && (
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-on-surface-variant block">
            Colección de Cupones ({coupons.length})
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {coupons.map((coupon) => {
              const isSelected = coupon.id === selectedId;
              return (
                <motion.button
                  key={coupon.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    hapticService.playLightTap();
                    setSelectedId(coupon.id);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between select-none ${
                    isSelected
                      ? 'candy-accent-bicolor text-white border-white shadow-md scale-[1.01]'
                      : coupon.redeemed
                      ? 'bg-white/50 text-on-surface-variant/70 border-white/60 line-through'
                      : 'bg-white/80 text-on-surface border-white hover:bg-white shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    <span className="text-xl shrink-0">{coupon.icon}</span>
                    <div className="min-w-0">
                      <p className="font-extrabold text-xs sm:text-sm leading-snug truncate">
                        {coupon.title}
                      </p>
                      <p
                        className={`text-[10px] leading-tight truncate ${
                          isSelected ? 'text-white/85' : 'text-on-surface-variant'
                        }`}
                      >
                        {coupon.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center space-x-1">
                    {coupon.redeemed ? (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">
                        Canjeado
                      </span>
                    ) : (
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        Activo
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE CUSTOM COUPON MODAL */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, y: 25, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 25, opacity: 0 }}
              className="relative z-10 w-full max-w-lg candy-modal-card rounded-[32px] p-5 sm:p-6 shadow-2xl overflow-hidden border-2 border-white max-h-[92vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-2xl candy-accent-bicolor text-white flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-[22px]">confirmation_number</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary block leading-none mb-0.5">
                      NUEVO VALE
                    </span>
                    <h3 className="font-extrabold text-xl text-on-surface leading-tight">
                      Crear Cupón Personalizado
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    hapticService.playLightTap();
                    setIsCreating(false);
                  }}
                  className="w-8 h-8 rounded-full bg-white/80 text-on-surface-variant flex items-center justify-center shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateCoupon} className="space-y-4 overflow-y-auto flex-1 pr-1 pb-2">
                {/* Title */}
                <div>
                  <label className="text-xs font-black text-on-surface uppercase tracking-wider block mb-1">
                    1. Título del Vale o Favor *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ej: Vale por una tarde de videojuegos sin prisa"
                    className="w-full bg-white/80 rounded-2xl p-3 border border-white text-xs sm:text-sm font-bold text-on-surface shadow-inner outline-none focus:border-primary"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-black text-on-surface uppercase tracking-wider block mb-1">
                    2. Descripción o Condiciones
                  </label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Ej: Válido para el domingo con botana y bebidas incluidas."
                    className="w-full bg-white/80 rounded-2xl p-3 border border-white text-xs sm:text-sm font-medium text-on-surface shadow-inner outline-none focus:border-primary"
                  />
                </div>

                {/* Tier & Style Selection */}
                <div>
                  <label className="text-xs font-black text-on-surface uppercase tracking-wider block mb-1.5">
                    3. Estilo de Tarjeta 3D
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['dorada', 'platino', 'suprema', 'rosa', 'bicolor'] as CouponTier[]).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => {
                          hapticService.playLightTap();
                          setNewTier(tier);
                        }}
                        className={`p-2 rounded-2xl border text-xs font-black transition-all ${
                          newTier === tier
                            ? 'candy-accent-bicolor text-white border-white shadow-md'
                            : 'bg-white/80 text-on-surface-variant border-white'
                        }`}
                      >
                        {TIER_NAMES[tier].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon selection */}
                <div>
                  <label className="text-xs font-black text-on-surface uppercase tracking-wider block mb-1.5">
                    4. Icono
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['🎁', '💆‍♂️', '🎬', '🍽️', '🧼', '☕', '🌿', '💖', '🥂', '🍿', '🚗', '🎮'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          hapticService.playLightTap();
                          setNewIcon(emoji);
                        }}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition-all ${
                          newIcon === emoji
                            ? 'bg-primary text-white scale-110 shadow-md'
                            : 'bg-white/80 border border-white hover:bg-white shadow-xs'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personal Sweet Note */}
                <div>
                  <label className="text-xs font-black text-on-surface uppercase tracking-wider block mb-1">
                    5. Mensaje o Dedicatoria Especial
                  </label>
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Ej: Te lo mereces por ser tan increíble."
                    className="w-full bg-white/80 rounded-2xl p-3 border border-white text-xs sm:text-sm font-medium text-on-surface shadow-inner outline-none focus:border-primary"
                  />
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center space-x-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-3 rounded-full text-xs font-bold text-on-surface-variant bg-white/80 border border-white hover:bg-white"
                  >
                    Cancelar
                  </button>

                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    type="submit"
                    className="flex-1 py-3 rounded-full candy-accent-bicolor text-white text-xs sm:text-sm font-black shadow-md flex items-center justify-center space-x-1.5 select-none"
                  >
                    <span className="material-symbols-outlined text-[18px]">done</span>
                    <span>Crear Cupón</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
