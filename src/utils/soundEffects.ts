/**
 * Web Audio API synthesizer for tactile UI acoustic feedback & ambient studio sound
 */
class SoundEffectsService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5; // 0 to 1

  constructor() {
    // Restore from localStorage if present
    const savedMuted = localStorage.getItem('zoro_studio_muted');
    if (savedMuted !== null) {
      this.isMuted = savedMuted === 'true';
    }
    const savedVol = localStorage.getItem('zoro_studio_volume');
    if (savedVol !== null) {
      const parsed = parseFloat(savedVol);
      if (!isNaN(parsed)) this.volume = Math.max(0, Math.min(1, parsed));
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.volume === 0) {
      this.isMuted = true;
    } else {
      this.isMuted = false;
    }
    localStorage.setItem('zoro_studio_volume', this.volume.toString());
    localStorage.setItem('zoro_studio_muted', this.isMuted.toString());
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('zoro_studio_muted', this.isMuted.toString());
    if (!this.isMuted && this.volume === 0) {
      this.volume = 0.5;
      localStorage.setItem('zoro_studio_volume', '0.5');
    }
    if (!this.isMuted) {
      this.playBeep(440, 0.08, 'sine');
    }
    return this.isMuted;
  }

  // Camera mechanical shutter click sound
  public playShutter() {
    if (this.isMuted || this.volume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Noise click
      const bufferSize = this.ctx.sampleRate * 0.04;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(3, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.6 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      whiteNoise.start(now);

      // Low frequency mechanical thud
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now + 0.015);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.07);

      oscGain.gain.setValueAtTime(0.5 * this.volume, now + 0.015);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now + 0.015);
      osc.stop(now + 0.07);
    } catch {
      // AudioContext policy
    }
  }

  // Tactile slider / preset tick
  public playTick() {
    if (this.isMuted || this.volume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

      gain.gain.setValueAtTime(0.18 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch {}
  }

  // CapCut Pro Text stamp sound
  public playStamp() {
    if (this.isMuted || this.volume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(520, now);
      osc1.frequency.exponentialRampToValueAtTime(110, now + 0.12);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(260, now);
      osc2.frequency.exponentialRampToValueAtTime(60, now + 0.12);

      gain.gain.setValueAtTime(0.4 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.12);
      osc2.stop(now + 0.12);
    } catch {}
  }

  // Success chime
  public playSuccess() {
    if (this.isMuted || this.volume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.25 * this.volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.18);
      });
    } catch {}
  }

  private playBeep(freq: number, duration: number, type: OscillatorType = 'sine') {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }
}

export const soundEffects = new SoundEffectsService();
