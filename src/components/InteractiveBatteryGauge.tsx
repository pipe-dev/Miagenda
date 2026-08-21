import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface InteractiveBatteryGaugeProps {
  value: number; // 0 to 100
  onChange?: (val: number) => void;
  isInteractive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const getBatteryColor = (val: number) => {
  if (val <= 0) {
    return {
      gradient: 'from-slate-300 via-slate-400 to-slate-500',
      fillHex: '#94a3b8',
      glow: 'rgba(148, 163, 184, 0.2)',
      border: 'border-slate-300',
      badgeBg: 'bg-slate-100 text-slate-600 border-slate-200',
      statusText: '⚪ Sin configurar - Toca para ajustar tu energía',
      icon: '⚪'
    };
  }
  if (val <= 25) {
    return {
      gradient: 'from-rose-500 to-red-600',
      fillHex: '#f43f5e',
      glow: 'rgba(244, 63, 94, 0.4)',
      border: 'border-rose-300',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      statusText: '🪫 Batería baja - Necesito recargar',
      icon: '🪫'
    };
  }
  if (val <= 50) {
    return {
      gradient: 'from-amber-400 to-orange-500',
      fillHex: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.4)',
      border: 'border-amber-300',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      statusText: '⚡ Batería media - Día pesado',
      icon: '⚡'
    };
  }
  if (val <= 75) {
    return {
      gradient: 'from-sky-400 to-blue-600',
      fillHex: '#0284c7',
      glow: 'rgba(2, 132, 199, 0.4)',
      border: 'border-sky-300',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
      statusText: '⚡ Buena energía - Día tranquilo',
      icon: '⚡'
    };
  }
  return {
    gradient: 'from-emerald-400 to-teal-600',
    fillHex: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    border: 'border-emerald-300',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    statusText: '🔋 100% Recargado - Con toda la energía',
    icon: '🔋'
  };
};

export default function InteractiveBatteryGauge({
  value,
  onChange,
  isInteractive = true,
  size = 'lg'
}: InteractiveBatteryGaugeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startYRef = useRef<number>(0);
  const startValRef = useRef<number>(value);
  const isDraggingRef = useRef<boolean>(false);
  const lastVibrateRef = useRef<number>(0);

  const clampedValue = Math.min(100, Math.max(0, Math.round(value)));
  const colorInfo = getBatteryColor(clampedValue);

  // Shared single AudioContext for iOS high-frequency ticks
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  };

  const playTactileTick = (val: number) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // 1. CAPA SUB-BASS (Zumbido grave de 180Hz estilo AfinApp para sensación de vibración física)
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(180, now);
      
      bassGain.gain.setValueAtTime(0.28, now); // Volumen aumentado (4x / +300%)
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.050); // Decaimiento en 50ms (+108.3%)

      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);

      bassOsc.start(now);
      bassOsc.stop(now + 0.052);

      // 2. CAPA DE TICK LÍQUIDO (Tono dinámico ascendente de 340Hz a 860Hz)
      const tickOsc = ctx.createOscillator();
      const tickGain = ctx.createGain();
      const baseFreq = 340 + (val / 100) * 520;

      tickOsc.type = 'triangle';
      tickOsc.frequency.setValueAtTime(baseFreq, now);
      tickOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, now + 0.012);

      tickGain.gain.setValueAtTime(0.035, now);
      tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

      tickOsc.connect(tickGain);
      tickGain.connect(ctx.destination);

      tickOsc.start(now);
      tickOsc.stop(now + 0.014);
    } catch {
      // Ignore audio policy errors
    }
  };

  // Pointer dragging handlers (Vertical drag filling)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isInteractive || !onChange) return;
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startValRef.current = clampedValue;
    playTactileTick(clampedValue);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !onChange) return;
    const deltaY = startYRef.current - e.clientY; // Dragging up increases, dragging down decreases
    const sensitivity = 0.6; // pixels per 1%
    const newVal = Math.min(100, Math.max(0, Math.round(startValRef.current + deltaY * sensitivity)));

    if (newVal !== clampedValue) {
      onChange(newVal);
      // Play sound on EVERY 1% change
      playTactileTick(newVal);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(6);
      }
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Dimensions based on size
  const heightClass = size === 'lg' ? 'h-48 w-24' : size === 'md' ? 'h-32 w-16' : 'h-16 w-8';

  return (
    <div className="flex flex-col items-center select-none">
      {/* 3D Battery Shell */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none' }}
        className={`relative flex flex-col items-center cursor-ns-resize group ${
          isInteractive ? 'active:scale-98 transition-transform' : 'cursor-default'
        }`}
      >
        {/* Battery Top Terminal (Cap) */}
        <div
          className={`w-8 h-2.5 rounded-t-md bg-gradient-to-b from-slate-200 to-slate-400 border border-white/80 shadow-xs mb-[-1px] z-20 ${
            size === 'sm' ? 'w-4 h-1.5' : size === 'md' ? 'w-6 h-2' : 'w-8 h-2.5'
          }`}
        />

        {/* Battery Glass Body */}
        <div
          className={`${heightClass} rounded-2xl p-1.5 bg-slate-900/10 backdrop-blur-md border-2 border-white shadow-xl relative overflow-hidden flex flex-col justify-end`}
          style={{
            boxShadow: `inset 0 2px 4px rgba(255,255,255,0.8), 0 8px 24px ${colorInfo.glow}`
          }}
        >
          {/* Inner Liquid Fill */}
          <motion.div
            initial={false}
            animate={{
              height: `${clampedValue}%`
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`w-full rounded-xl bg-gradient-to-t ${colorInfo.gradient} relative overflow-hidden shadow-md`}
          >
            {/* Liquid Surface Wave Glow */}
            <div className="absolute top-0 inset-x-0 h-2.5 bg-white/60 rounded-full blur-[1px]" />
            
            {/* Glossy vertical reflection strip */}
            <div className="absolute top-0 bottom-0 left-1 w-1.5 bg-white/30 rounded-full blur-[0.5px]" />
          </motion.div>

          {/* Centered Percentage Number Inside Body */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
            <span
              className={`font-black tracking-tight drop-shadow-sm ${
                size === 'lg' ? 'text-2xl text-on-surface' : size === 'md' ? 'text-lg text-on-surface' : 'text-xs text-on-surface'
              }`}
            >
              {clampedValue}%
            </span>
          </div>

          {/* Gloss Glass Overlay */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-white/40 pointer-events-none border border-white/40" />
        </div>
      </div>

      {/* Interactive Controls & Hints */}
      {isInteractive && onChange && (
        <div className="mt-3 flex flex-col items-center space-y-2">
          {/* Hint */}
          <span className="text-[11px] font-bold text-on-surface-variant flex items-center space-x-1 animate-pulse">
            <span className="material-symbols-outlined text-[14px]">unfold_more</span>
            <span>Desliza ↑ o ↓ sobre la batería</span>
          </span>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 pt-1">
            {[
              { label: '20% 🪫', val: 20 },
              { label: '50% ⚡', val: 50 },
              { label: '80% ✨', val: 80 },
              { label: '100% 🔋', val: 100 }
            ].map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() => onChange(preset.val)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition-all ${
                  clampedValue === preset.val
                    ? 'candy-btn text-white border-white shadow-xs scale-105'
                    : 'bg-white/80 text-on-surface border-white hover:bg-white shadow-2xs'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
