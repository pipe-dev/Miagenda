// Haptic Audio Engine for iOS Safari & Web - Sub-Bass 180Hz Physical Vibration Synthesis
class HapticService {
  private ctx: AudioContext | null = null;

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
   * Main Sub-Bass 180Hz Vibration Thud (Exact AfinApp Specification)
   * Frequency: 180Hz (F#3 low sub-bass tone)
   * Wave: Sine (smooth pure sub resonance that pushes physical air)
   * Envelope: 50ms attack + 200ms exponential decay
   */
  public playPhysicalThud(volume: number = 0.28, duration: number = 0.2) {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.05); // 50ms attack
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration); // 200ms decay

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.01);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator && navigator.vibrate) {
        navigator.vibrate(18);
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Quick light physical tap for tabs, filters and micro-interactions
   */
  public playLightTap(volume: number = 0.22) {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.095);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator && navigator.vibrate) {
        navigator.vibrate(12);
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Double-pulse haptic for task completion / checking items
   */
  public playSuccess() {
    this.playLightTap(0.24);
    setTimeout(() => {
      this.playPhysicalThud(0.30, 0.18);
    }, 75);
  }

  /**
   * Warning / Delete action thud
   */
  public playWarning() {
    this.playPhysicalThud(0.32, 0.25);
  }
}

export const hapticService = new HapticService();
