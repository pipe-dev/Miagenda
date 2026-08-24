// iPhone Native Sound Synthesis & Audio Manager for iOS / Web Audio API
import { hapticService } from './hapticService';

export type IosSoundId = 'tritone' | 'aurora' | 'bamboo' | 'chimes' | 'harp' | 'pop' | 'apex';

export interface IosSoundOption {
  id: IosSoundId;
  name: string;
  category: string;
  icon: string;
  description: string;
  attachUri: string;
}

export const IOS_SOUND_OPTIONS: IosSoundOption[] = [
  {
    id: 'tritone',
    name: 'Tri-tono',
    category: 'Clásico Apple',
    icon: 'notifications_active',
    description: 'El tono icónico e inconfundible de notificación de iPhone',
    attachUri: 'Tri-tone'
  },
  {
    id: 'aurora',
    name: 'Aurora',
    category: 'Moderno iOS',
    icon: 'auto_awesome',
    description: 'Acorde cristalino y brillante de última generación iOS',
    attachUri: 'Aurora'
  },
  {
    id: 'bamboo',
    name: 'Bambú',
    category: 'Relajante',
    icon: 'spa',
    description: 'Percusión de madera resonante y orgánica',
    attachUri: 'Bamboo'
  },
  {
    id: 'chimes',
    name: 'Campanadas',
    category: 'Cristal',
    icon: 'alarm',
    description: 'Campanillas en cascada luminosas',
    attachUri: 'Chimes'
  },
  {
    id: 'harp',
    name: 'Arpa',
    category: 'Armónico',
    icon: 'music_note',
    description: 'Arpegio suave de arpa clásica',
    attachUri: 'Harp'
  },
  {
    id: 'pop',
    name: 'Gota / Pop',
    category: 'Micro',
    icon: 'water_drop',
    description: 'Gota de agua con rebote táctil',
    attachUri: 'Pop'
  },
  {
    id: 'apex',
    name: 'Apex',
    category: 'iOS 17/18',
    icon: 'bolt',
    description: 'Tono dinámico y futurista',
    attachUri: 'Apex'
  }
];

const STORAGE_KEY = 'mi_agenda_ios_sound_v1';

class SoundService {
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public getSelectedSound(): IosSoundId {
    if (typeof localStorage === 'undefined') return 'tritone';
    const saved = localStorage.getItem(STORAGE_KEY) as IosSoundId | null;
    if (saved && IOS_SOUND_OPTIONS.some((o) => o.id === saved)) {
      return saved;
    }
    return 'tritone';
  }

  public setSelectedSound(soundId: IosSoundId): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, soundId);
    }
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ios_sound_changed', { detail: soundId }));
      }
    } catch {}
  }

  // Play realistic iPhone acoustic tones
  public playIosSound(soundId?: IosSoundId, triggerHaptic = true): void {
    const sound = soundId || this.getSelectedSound();
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (triggerHaptic) {
      hapticService.playPhysicalThud(0.25, 0.18);
    }

    switch (sound) {
      case 'tritone':
        // 🔔 Tri-tone: G#5 (830.6Hz) -> B5 (987.77Hz) -> E6 (1318.5Hz)
        this.playToneSequence(ctx, now, [
          { freq: 830.6, start: 0, duration: 0.18, gain: 0.22, type: 'triangle' },
          { freq: 1661.2, start: 0, duration: 0.18, gain: 0.08, type: 'sine' },
          { freq: 987.77, start: 0.12, duration: 0.20, gain: 0.24, type: 'triangle' },
          { freq: 1975.5, start: 0.12, duration: 0.20, gain: 0.09, type: 'sine' },
          { freq: 1318.5, start: 0.26, duration: 0.65, gain: 0.28, type: 'triangle' },
          { freq: 2637.0, start: 0.26, duration: 0.65, gain: 0.11, type: 'sine' }
        ]);
        break;

      case 'aurora':
        // 🌊 Aurora: E5 (659Hz) -> G#5 (830Hz) -> B5 (987Hz) -> E6 (1318Hz) ambient glass chime
        this.playToneSequence(ctx, now, [
          { freq: 659.25, start: 0, duration: 0.45, gain: 0.18, type: 'sine' },
          { freq: 830.61, start: 0.08, duration: 0.55, gain: 0.20, type: 'sine' },
          { freq: 987.77, start: 0.16, duration: 0.65, gain: 0.22, type: 'sine' },
          { freq: 1318.51, start: 0.24, duration: 0.85, gain: 0.24, type: 'sine' },
          { freq: 2637.0, start: 0.24, duration: 0.50, gain: 0.06, type: 'triangle' }
        ]);
        break;

      case 'bamboo':
        // 🎋 Bamboo: 520Hz + 840Hz wooden click with resonant body
        this.playBambooTone(ctx, now);
        break;

      case 'chimes':
        // 🔔 Chimes: 4-note cascading glass bells
        this.playToneSequence(ctx, now, [
          { freq: 1046.5, start: 0, duration: 0.35, gain: 0.20, type: 'sine' },
          { freq: 1318.5, start: 0.10, duration: 0.40, gain: 0.22, type: 'sine' },
          { freq: 1567.9, start: 0.20, duration: 0.45, gain: 0.24, type: 'sine' },
          { freq: 2093.0, start: 0.30, duration: 0.70, gain: 0.26, type: 'sine' }
        ]);
        break;

      case 'harp':
        // 🎻 Harp: fast glissando C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz), E6 (1318Hz)
        this.playToneSequence(ctx, now, [
          { freq: 523.25, start: 0, duration: 0.4, gain: 0.16, type: 'triangle' },
          { freq: 659.25, start: 0.06, duration: 0.45, gain: 0.18, type: 'triangle' },
          { freq: 783.99, start: 0.12, duration: 0.5, gain: 0.20, type: 'triangle' },
          { freq: 1046.5, start: 0.18, duration: 0.6, gain: 0.22, type: 'triangle' },
          { freq: 1318.5, start: 0.24, duration: 0.75, gain: 0.24, type: 'triangle' }
        ]);
        break;

      case 'pop':
        // 💧 Pop: rapid pitch slide 420Hz -> 1400Hz -> 650Hz in 90ms
        this.playPopTone(ctx, now);
        break;

      case 'apex':
        // ⚡ Apex: dual crisp modern pulses (880Hz -> 1760Hz)
        this.playToneSequence(ctx, now, [
          { freq: 880.0, start: 0, duration: 0.12, gain: 0.22, type: 'triangle' },
          { freq: 1760.0, start: 0.08, duration: 0.35, gain: 0.26, type: 'sine' }
        ]);
        break;

      default:
        this.playToneSequence(ctx, now, [
          { freq: 830.6, start: 0, duration: 0.18, gain: 0.22, type: 'triangle' },
          { freq: 987.77, start: 0.12, duration: 0.20, gain: 0.24, type: 'triangle' },
          { freq: 1318.5, start: 0.26, duration: 0.65, gain: 0.28, type: 'triangle' }
        ]);
    }
  }

  private playToneSequence(
    ctx: AudioContext,
    now: number,
    notes: Array<{ freq: number; start: number; duration: number; gain: number; type: OscillatorType }>
  ) {
    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = note.type;
      osc.frequency.setValueAtTime(note.freq, now + note.start);

      const startTime = now + note.start;
      const endTime = startTime + note.duration;

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(note.gain, startTime + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(endTime);
    });
  }

  private playBambooTone(ctx: AudioContext, now: number) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(540, now);
    osc1.frequency.exponentialRampToValueAtTime(320, now + 0.08);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(440, now + 0.08);

    gainNode.gain.setValueAtTime(0.35, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.18);
    osc2.start(now);
    osc2.stop(now + 0.18);
  }

  private playPopTone(ctx: AudioContext, now: number) {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(1450, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.09);

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }
}

export const soundService = new SoundService();
