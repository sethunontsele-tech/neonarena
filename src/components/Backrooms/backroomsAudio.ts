/**
 * Procedural Audio Synthesizer for the Backrooms Dimension
 * Uses standard Web Audio API for zero-latency, realistic horror atmosphere.
 */

class BackroomsAudioEngine {
  private ctx: AudioContext | null = null;
  private humGain: GainNode | null = null;
  private humOsc1: OscillatorNode | null = null;
  private humOsc2: OscillatorNode | null = null;
  private isHumming = false;
  private heartbeatInterval: any = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Starts ambient continuous drone tailored to the level theme
   */
  startAmbientHum(levelTheme: string = 'yellow_halls', volume = 0.08) {
    const ctx = this.getContext();
    if (!ctx || this.isHumming) return;

    try {
      this.humGain = ctx.createGain();
      this.humGain.gain.setValueAtTime(0.001, ctx.currentTime);
      this.humGain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), ctx.currentTime + 1.5);
      this.humGain.connect(ctx.destination);

      // Low 60Hz and 120Hz dual oscillator with slight frequency drift (classic fluorescent tube)
      this.humOsc1 = ctx.createOscillator();
      this.humOsc2 = ctx.createOscillator();

      if (levelTheme === 'yellow_halls') {
        this.humOsc1.type = 'sawtooth';
        this.humOsc1.frequency.setValueAtTime(60, ctx.currentTime); // 60Hz mains buzz
        this.humOsc2.type = 'sine';
        this.humOsc2.frequency.setValueAtTime(120, ctx.currentTime); // 120Hz harmonic
      } else if (levelTheme === 'industrial' || levelTheme === 'maintenance') {
        this.humOsc1.type = 'triangle';
        this.humOsc1.frequency.setValueAtTime(45, ctx.currentTime); // Deep engine hum
        this.humOsc2.type = 'sawtooth';
        this.humOsc2.frequency.setValueAtTime(90, ctx.currentTime);
      } else if (levelTheme === 'flooded') {
        this.humOsc1.type = 'sine';
        this.humOsc1.frequency.setValueAtTime(55, ctx.currentTime);
        this.humOsc2.type = 'triangle';
        this.humOsc2.frequency.setValueAtTime(110, ctx.currentTime);
      } else {
        this.humOsc1.type = 'sine';
        this.humOsc1.frequency.setValueAtTime(75, ctx.currentTime);
        this.humOsc2.type = 'triangle';
        this.humOsc2.frequency.setValueAtTime(150, ctx.currentTime);
      }

      this.humOsc1.connect(this.humGain);
      this.humOsc2.connect(this.humGain);
      this.humOsc1.start();
      this.humOsc2.start();
      this.isHumming = true;
    } catch (e) {
      console.warn('Backrooms hum failed to start', e);
    }
  }

  stopAmbientHum() {
    if (!this.isHumming || !this.ctx || !this.humGain) return;
    try {
      this.humGain.gain.setValueAtTime(this.humGain.gain.value, this.ctx.currentTime);
      this.humGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
      setTimeout(() => {
        try {
          this.humOsc1?.stop();
          this.humOsc2?.stop();
          this.humOsc1?.disconnect();
          this.humOsc2?.disconnect();
        } catch (e) {}
        this.isHumming = false;
      }, 500);
    } catch (e) {
      this.isHumming = false;
    }
  }

  /**
   * Fluorescent light flicker crackle
   */
  playFlicker() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // White noise burst for electrical spark
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.setValueAtTime(3.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.07, now);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } catch (e) {}
  }

  /**
   * Flashlight click
   */
  playFlashlightClick(isOn: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isOn ? 1200 : 700, now);
      osc.frequency.exponentialRampToValueAtTime(isOn ? 2400 : 350, now + 0.025);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {}
  }

  /**
   * Almond water drinking gulp & restore
   */
  playDrinkAlmondWater() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [0, 0.15, 0.3].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(250 + idx * 40, now + delay);
        osc.frequency.exponentialRampToValueAtTime(120, now + delay + 0.08);
        gain.gain.setValueAtTime(0.12, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.09);
      });
    } catch (e) {}
  }

  /**
   * Door opening / sliding sound
   */
  playDoorSound(isOpen: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(isOpen ? 120 : 180, now);
      osc.frequency.exponentialRampToValueAtTime(isOpen ? 80 : 90, now + 0.25);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {}
  }

  /**
   * Elevator chime ding
   */
  playElevatorChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);
    } catch (e) {}
  }

  /**
   * Entity screech or alert roar
   */
  playEntityRoar(type: string = 'smiler') {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'smiler') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.2);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.4);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      } else if (type === 'bacteria') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(450, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.5);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {}
  }

  /**
   * Low Sanity Heartbeat Thump
   */
  startHeartbeat(sanity: number) {
    if (sanity > 40) {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
      return;
    }

    if (!this.heartbeatInterval) {
      const intervalMs = sanity < 20 ? 600 : 900;
      this.heartbeatInterval = setInterval(() => {
        const ctx = this.getContext();
        if (!ctx) return;
        try {
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(55, now);
          osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.16);
        } catch (e) {}
      }, intervalMs);
    }
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Boss seismic slam impact
   */
  playBossImpact() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.6);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch (e) {}
  }
}

export const backroomsAudio = new BackroomsAudioEngine();
