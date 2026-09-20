/**
 * High-performance Web Audio Synthesizer for Freerun City.
 * Generates responsive procedural sound effects and dynamic adaptive breakbeat music
 * that reacts to player momentum, combo multipliers, and parkour interactions.
 */

class FreerunAudioEngine {
  private ctx: AudioContext | null = null;
  private musicMasterGain: GainNode | null = null;
  private sfxMasterGain: GainNode | null = null;
  private isMusicPlaying = false;
  private currentBpm = 128;
  private musicInterval: any = null;
  private beatStep = 0;
  private volume = 0.8;
  private musicVolume = 0.6;
  private pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.musicMasterGain = this.ctx.createGain();
      this.musicMasterGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicMasterGain.connect(this.ctx.destination);

      this.sfxMasterGain = this.ctx.createGain();
      this.sfxMasterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.sfxMasterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(sfx: number, music: number) {
    this.volume = sfx;
    this.musicVolume = music;
    if (this.ctx) {
      if (this.sfxMasterGain) this.sfxMasterGain.gain.setTargetAtTime(sfx, this.ctx.currentTime, 0.05);
      if (this.musicMasterGain) this.musicMasterGain.gain.setTargetAtTime(music, this.ctx.currentTime, 0.05);
    }
  }

  // --- SOUND EFFECTS ---

  public playFootstep(isSprinting: boolean = false) {
    this.initCtx();
    if (!this.ctx || !this.sfxMasterGain || this.volume <= 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    const pitch = isSprinting ? 120 + Math.random() * 20 : 90 + Math.random() * 15;
    osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.06);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);

    gain.gain.setValueAtTime(isSprinting ? 0.2 : 0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.07);
  }

  public playJump() {
    this.initCtx();
    if (!this.ctx || !this.sfxMasterGain || this.volume <= 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(380, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.19);
  }

  public playVault() {
    this.initCtx();
    if (!this.ctx || !this.sfxMasterGain || this.volume <= 0) return;

    // Air swoosh + wood/metal hand slap
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start();
    osc.stop(now + 0.15);
  }

  public playWallrun() {
    this.initCtx();
    if (!this.ctx || !this.sfxMasterGain || this.volume <= 0) return;

    const now = this.ctx.currentTime;
    // Friction buffer
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.5));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.setValueAtTime(3, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxMasterGain);

    noise.start();
  }

  public playLanding(isHard: boolean = false, isRoll: boolean = false) {
    this.initCtx();
    if (!this.ctx || !this.sfxMasterGain || this.volume <= 0) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const startFreq = isHard ? 120 : (isRoll ? 90 : 75);
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.15);

    const initialGain = isHard ? 0.45 : (isRoll ? 0.22 : 0.3);
    gain.gain.setValueAtTime(initialGain, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start();
    osc.stop(now + 0.22);
  }

  public playAirDash() {
    this.initCtx();
    if (!this.ctx || !this.sfxMasterGain || this.volume <= 0) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.25);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start();
    osc.stop(now + 0.3);
  }

  public playSuperJump() {
    this.initCtx();
    if (!this.ctx || !this.sfxMasterGain || this.volume <= 0) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start();
    osc.stop(now + 0.36);
  }

  public playTrickChime(multiplier: number = 1.0) {
    this.initCtx();
    if (!this.ctx || !this.sfxMasterGain || this.volume <= 0) return;

    const now = this.ctx.currentTime;
    const noteIndex = Math.min(this.pentatonicScale.length - 1, Math.floor((multiplier - 1) * 2));
    const freq = this.pentatonicScale[Math.max(0, noteIndex)] || 440;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    // Harmonic shimmer
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);
    gain2.gain.setValueAtTime(0.12, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(this.sfxMasterGain);
    gain2.connect(this.sfxMasterGain);

    osc.start();
    osc2.start();
    osc.stop(now + 0.5);
    osc2.stop(now + 0.35);
  }

  public playBail() {
    this.initCtx();
    if (!this.ctx || !this.sfxMasterGain || this.volume <= 0) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start();
    osc.stop(now + 0.42);
  }

  public playCollectible() {
    this.initCtx();
    if (!this.ctx || !this.sfxMasterGain || this.volume <= 0) return;

    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.18, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxMasterGain!);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.26);
    });
  }

  // --- DYNAMIC ADAPTIVE MUSIC ENGINE ---

  public startDynamicMusic() {
    if (this.isMusicPlaying) return;
    this.initCtx();
    this.isMusicPlaying = true;
    this.beatStep = 0;

    const stepDuration = 60 / this.currentBpm / 4; // 16th notes
    this.musicInterval = setInterval(() => {
      this.playSynthStep(this.beatStep);
      this.beatStep = (this.beatStep + 1) % 32;
    }, stepDuration * 1000);
  }

  public stopDynamicMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }

  public updateFlowState(flowPercent: number) {
    // Accelerate BPM from 120 up to 142 as flow builds
    const targetBpm = 120 + (flowPercent / 100) * 22;
    this.currentBpm = Math.round(targetBpm);
  }

  private playSynthStep(step: number) {
    if (!this.ctx || !this.musicMasterGain || this.musicVolume <= 0) return;
    const now = this.ctx.currentTime;

    // Kick on beats 0, 4, 8, 12, 16, 20, 24, 28
    if (step % 4 === 0) {
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(140, now);
      kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.08);

      kickGain.gain.setValueAtTime(0.35, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      kickOsc.connect(kickGain);
      kickGain.connect(this.musicMasterGain);
      kickOsc.start(now);
      kickOsc.stop(now + 0.14);
    }

    // Snare / Clap on beats 4, 12, 20, 28
    if (step % 8 === 4) {
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
      noise.connect(noiseGain);
      noiseGain.connect(this.musicMasterGain);
      noise.start(now);
    }

    // Hi-hat on off-beats
    if (step % 2 === 1) {
      const hihatBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.02, this.ctx.sampleRate);
      const data = hihatBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
      const hihat = this.ctx.createBufferSource();
      hihat.buffer = hihatBuffer;
      const hihatFilter = this.ctx.createBiquadFilter();
      hihatFilter.type = 'highpass';
      hihatFilter.frequency.setValueAtTime(8000, now);
      const hihatGain = this.ctx.createGain();
      hihatGain.gain.setValueAtTime(0.05, now);
      hihatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      hihat.connect(hihatFilter);
      hihatFilter.connect(hihatGain);
      hihatGain.connect(this.musicMasterGain);
      hihat.start(now);
    }

    // Synth Bassline
    if (step % 4 === 2) {
      const bassNotes = [55, 65.41, 73.42, 82.41]; // A1, C2, D2, E2
      const note = bassNotes[Math.floor(step / 8) % bassNotes.length];
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(note, now);

      const bassFilter = this.ctx.createBiquadFilter();
      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(320, now);

      bassGain.gain.setValueAtTime(0.18, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.musicMasterGain);

      bassOsc.start(now);
      bassOsc.stop(now + 0.18);
    }
  }
}

export const freerunAudio = new FreerunAudioEngine();
