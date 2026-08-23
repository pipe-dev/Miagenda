// Advanced Hybrid Haptic Engine for iOS Safari & Web
// Combines:
// 1. iOS WebKit Native Switch Taptic Trigger (<input type="checkbox" switch>)
// 2. Dual-Layer Sub-Bass Acoustic Resonance (45Hz air displacement + 140Hz tactile snap)
// 3. AudioContext warm-up on initial touch for 0ms latency

class HapticService {
  private ctx: AudioContext | null = null;
  private nativeSwitchEl: HTMLInputElement | null = null;
  private isWarmedUp: boolean = false;

  constructor() {
    this.setupNativeHapticElement();
    this.setupTouchWarmup();
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
        el.style.opacity = '0.001';
        el.style.pointerEvents = 'none';
        el.style.top = '-999px';
        el.style.left = '-999px';
        el.style.width = '1px';
        el.style.height = '1px';
        document.body.appendChild(el);
        this.nativeSwitchEl = el;
      }
    } catch {
      // Ignore if document not ready
    }
  }

  // Pre-warm AudioContext on first user interaction to guarantee instant 0ms latency
  private setupTouchWarmup() {
    if (typeof window === 'undefined') return;
    const warmup = () => {
      if (!this.isWarmedUp) {
        this.initCtx();
        this.isWarmedUp = true;
      }
      window.removeEventListener('touchstart', warmup);
      window.removeEventListener('pointerdown', warmup);
    };
    window.addEventListener('touchstart', warmup, { passive: true, once: true });
    window.addEventListener('pointerdown', warmup, { passive: true, once: true });
  }

  // Trigger iOS native WebKit Taptic Engine via switch attribute
  private triggerIOSTaptic() {
    try {
      if (!this.nativeSwitchEl && typeof document !== 'undefined') {
        this.setupNativeHapticElement();
      }
      if (this.nativeSwitchEl) {
        this.nativeSwitchEl.checked = !this.nativeSwitchEl.checked;
        this.nativeSwitchEl.dispatchEvent(new Event('change', { bubbles: true }));
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
   * Dual-Layer Sub-Bass Vibration (45Hz Physical Air Resonance + 140Hz Mechanical Thud)
   */
  public playPhysicalThud(volume: number = 0.32, duration: number = 0.16) {
    this.triggerIOSTaptic();

    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Layer 1: Ultra Deep Sub-Bass (45Hz - pushes speaker air against palm)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(45, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + duration);

      subGain.gain.setValueAtTime(0, now);
      subGain.gain.linearRampToValueAtTime(volume * 1.15, now + 0.012);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + duration + 0.01);

      // Layer 2: Mechanical Mid Thud (140Hz - crisp tactile click)
      const midOsc = ctx.createOscillator();
      const midGain = ctx.createGain();
      midOsc.type = 'sine';
      midOsc.frequency.setValueAtTime(140, now);
      midOsc.frequency.exponentialRampToValueAtTime(75, now + duration * 0.7);

      midGain.gain.setValueAtTime(0, now);
      midGain.gain.linearRampToValueAtTime(volume * 0.8, now + 0.006);
      midGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.75);

      midOsc.connect(midGain);
      midGain.connect(ctx.destination);
      midOsc.start(now);
      midOsc.stop(now + duration + 0.01);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator && navigator.vibrate) {
        navigator.vibrate(22);
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Quick light physical tap for buttons, tabs, filters and micro-interactions
   */
  public playLightTap(volume: number = 0.24) {
    this.triggerIOSTaptic();

    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Layer 1: Fast Sub Pulse (52Hz)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(52, now);

      subGain.gain.setValueAtTime(0, now);
      subGain.gain.linearRampToValueAtTime(volume * 0.95, now + 0.006);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.08);

      // Layer 2: Crisp 145Hz Tactile Click
      const midOsc = ctx.createOscillator();
      const midGain = ctx.createGain();
      midOsc.type = 'sine';
      midOsc.frequency.setValueAtTime(145, now);

      midGain.gain.setValueAtTime(0, now);
      midGain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.003);
      midGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

      midOsc.connect(midGain);
      midGain.connect(ctx.destination);
      midOsc.start(now);
      midOsc.stop(now + 0.06);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator && navigator.vibrate) {
        navigator.vibrate(14);
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Double-pulse haptic for task completion / checking items / saves
   */
  public playSuccess() {
    this.playLightTap(0.26);
    setTimeout(() => {
      this.playPhysicalThud(0.34, 0.15);
    }, 85);
  }

  /**
   * Warning / Delete action thud
   */
  public playWarning() {
    this.playPhysicalThud(0.36, 0.22);
  }
}

export const hapticService = new HapticService();
