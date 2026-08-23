// Advanced Haptic Engine for iOS Safari & Web
// Combines:
// 1. iOS WebKit Native Switch Taptic Engine Trigger
// 2. Dual-Layer Sub-Bass Vibration (48Hz deep air displacement + 150Hz mechanical thud)
// 3. Navigator.vibrate fallback for Android

class HapticService {
  private ctx: AudioContext | null = null;
  private nativeSwitchEl: HTMLInputElement | null = null;

  constructor() {
    this.setupNativeHapticElement();
  }

  // Set up hidden native switch element for iOS WebKit Taptic Engine trigger
  private setupNativeHapticElement() {
    if (typeof document === 'undefined') return;
    try {
      if (!this.nativeSwitchEl) {
        const el = document.createElement('input');
        el.type = 'checkbox';
        el.setAttribute('switch', '');
        el.setAttribute('aria-hidden', 'true');
        el.tabIndex = -1;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        el.style.top = '-100px';
        el.style.left = '-100px';
        el.style.width = '1px';
        el.style.height = '1px';
        document.body.appendChild(el);
        this.nativeSwitchEl = el;
      }
    } catch {
      // Ignore if document not ready
    }
  }

  // Trigger iOS native WebKit Taptic Engine
  private triggerIOSTaptic() {
    try {
      if (!this.nativeSwitchEl && typeof document !== 'undefined') {
        this.setupNativeHapticElement();
      }
      if (this.nativeSwitchEl) {
        this.nativeSwitchEl.checked = !this.nativeSwitchEl.checked;
        this.nativeSwitchEl.dispatchEvent(new Event('change', { bubbles: false }));
      }
    } catch {
      // Ignore
    }
  }

  private initCtx(): AudioContext | null {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Dual-Layer Sub-Bass Vibration (48Hz Physical Resonance + 150Hz Audible Thud)
   */
  public playPhysicalThud(volume: number = 0.30, duration: number = 0.18) {
    this.triggerIOSTaptic();

    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Layer 1: Ultra Deep Sub-Bass (48Hz - pushes physical speaker air against palm)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(48, now);
      subOsc.frequency.exponentialRampToValueAtTime(36, now + duration);

      subGain.gain.setValueAtTime(0, now);
      subGain.gain.linearRampToValueAtTime(volume * 1.1, now + 0.015);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + duration + 0.01);

      // Layer 2: Mechanical Mid Thud (150Hz - crisp satisfying tactile click)
      const midOsc = ctx.createOscillator();
      const midGain = ctx.createGain();
      midOsc.type = 'sine';
      midOsc.frequency.setValueAtTime(150, now);
      midOsc.frequency.exponentialRampToValueAtTime(80, now + duration * 0.7);

      midGain.gain.setValueAtTime(0, now);
      midGain.gain.linearRampToValueAtTime(volume * 0.75, now + 0.008);
      midGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.8);

      midOsc.connect(midGain);
      midGain.connect(ctx.destination);
      midOsc.start(now);
      midOsc.stop(now + duration + 0.01);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator && navigator.vibrate) {
        navigator.vibrate(20);
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Quick light physical tap for buttons, tabs, filters and micro-interactions
   */
  public playLightTap(volume: number = 0.22) {
    this.triggerIOSTaptic();

    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Layer 1: Fast Sub Pulse (55Hz)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(55, now);

      subGain.gain.setValueAtTime(0, now);
      subGain.gain.linearRampToValueAtTime(volume * 0.9, now + 0.008);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.085);

      // Layer 2: Crisp 150Hz Click
      const midOsc = ctx.createOscillator();
      const midGain = ctx.createGain();
      midOsc.type = 'sine';
      midOsc.frequency.setValueAtTime(150, now);

      midGain.gain.setValueAtTime(0, now);
      midGain.gain.linearRampToValueAtTime(volume * 0.65, now + 0.004);
      midGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      midOsc.connect(midGain);
      midGain.connect(ctx.destination);
      midOsc.start(now);
      midOsc.stop(now + 0.065);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator && navigator.vibrate) {
        navigator.vibrate(12);
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Double-pulse haptic for task completion / checking items / saves
   */
  public playSuccess() {
    this.playLightTap(0.24);
    setTimeout(() => {
      this.playPhysicalThud(0.32, 0.16);
    }, 85);
  }

  /**
   * Warning / Delete action thud
   */
  public playWarning() {
    this.playPhysicalThud(0.35, 0.22);
  }
}

export const hapticService = new HapticService();
