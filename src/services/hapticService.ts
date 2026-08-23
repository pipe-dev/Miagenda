// Advanced Hybrid Haptic Engine for iOS Safari & Web
// Optimized for Apple Taptic Engine linear resonant frequency (180Hz)
// Combines:
// 1. iOS WebKit Native Switch Taptic Trigger (<input type="checkbox" switch>)
// 2. Dual-Layer Sub-Bass Acoustic Resonance (42Hz deep air displacement + 180Hz crisp mechanical snap)
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
   * Dual-Layer Sub-Bass Vibration (42Hz Deep Air Displacement + 180Hz Crisp Mechanical Snap)
   */
  public playPhysicalThud(volume: number = 0.38, duration: number = 0.16) {
    this.triggerIOSTaptic();

    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Layer 1: Ultra Deep Sub-Bass (42Hz - strong physical air push against palm)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(42, now);
      subOsc.frequency.exponentialRampToValueAtTime(30, now + duration);

      subGain.gain.setValueAtTime(0, now);
      subGain.gain.linearRampToValueAtTime(volume * 1.25, now + 0.012);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + duration + 0.01);

      // Layer 2: 180Hz Resonant Mechanical Snap (Apple Taptic Actuator sweet spot)
      const midOsc = ctx.createOscillator();
      const midGain = ctx.createGain();
      midOsc.type = 'sine';
      midOsc.frequency.setValueAtTime(180, now);
      midOsc.frequency.exponentialRampToValueAtTime(90, now + duration * 0.7);

      midGain.gain.setValueAtTime(0, now);
      midGain.gain.linearRampToValueAtTime(volume * 0.95, now + 0.005);
      midGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.75);

      midOsc.connect(midGain);
      midGain.connect(ctx.destination);
      midOsc.start(now);
      midOsc.stop(now + duration + 0.01);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator && navigator.vibrate) {
        navigator.vibrate(24);
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Quick light physical tap (48Hz pulse + 180Hz tactile click) for buttons, tabs, filters
   */
  public playLightTap(volume: number = 0.28) {
    this.triggerIOSTaptic();

    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Layer 1: Fast Sub Pulse (48Hz)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(48, now);

      subGain.gain.setValueAtTime(0, now);
      subGain.gain.linearRampToValueAtTime(volume * 1.05, now + 0.005);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.08);

      // Layer 2: 180Hz Crisp Tactile Click
      const midOsc = ctx.createOscillator();
      const midGain = ctx.createGain();
      midOsc.type = 'sine';
      midOsc.frequency.setValueAtTime(180, now);

      midGain.gain.setValueAtTime(0, now);
      midGain.gain.linearRampToValueAtTime(volume * 0.85, now + 0.003);
      midGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

      midOsc.connect(midGain);
      midGain.connect(ctx.destination);
      midOsc.start(now);
      midOsc.stop(now + 0.06);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator && navigator.vibrate) {
        navigator.vibrate(16);
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Micro-tick for fine sliders, dates, and wheel pickers (180Hz pure click)
   */
  public playSelectionTick(volume: number = 0.2) {
    this.triggerIOSTaptic();

    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Ignore
    }
  }

  /**
   * Double-pulse haptic for task completion / checking items / saves
   */
  public playSuccess() {
    this.playLightTap(0.3);
    setTimeout(() => {
      this.playPhysicalThud(0.4, 0.15);
    }, 85);
  }

  /**
   * Warning / Delete action thud
   */
  public playWarning() {
    this.playPhysicalThud(0.44, 0.22);
  }
}

export const hapticService = new HapticService();
