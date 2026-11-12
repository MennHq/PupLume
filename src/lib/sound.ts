import { storage } from './storage';

let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
};

/**
 * PupLume Audio Utility
 * Pure Web Audio API chime - zero external assets, instant playback, cross-platform
 */
export const playNotificationChime = () => {
  if (typeof window === 'undefined') return;

  try {
    const settings = storage.getSettings();
    if (settings && settings.chimeSound === false) {
      return;
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tone 1: Gentle Warm D5 (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.09, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Tone 2: Uplifting A5 (880.00 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.1);
    gain2.gain.setValueAtTime(0.11, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.5);
  } catch {
    // Silently handle browser autoplay policy restriction if user has not interacted
  }
};

/**
 * Uplifting celebratory fanfare for checklist / milestone completion
 */
export const playVictoryFanfare = () => {
  if (typeof window === 'undefined') return;

  try {
    const settings = storage.getSettings();
    if (settings && settings.chimeSound === false) {
      return;
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0.00, dur: 0.15 }, // C5
      { freq: 659.25, time: 0.14, dur: 0.15 }, // E5
      { freq: 783.99, time: 0.28, dur: 0.18 }, // G5
      { freq: 1046.50, time: 0.44, dur: 0.55 }, // C6
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);
      gain.gain.setValueAtTime(0.12, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } catch {
    // Silently handle autoplay restriction
  }
};

