import { GoogleGenAI, Modality } from "@google/genai";

class SoundService {
  private audioContext: AudioContext | null = null;
  private currentMusicSource: AudioBufferSourceNode | null = null;
  private musicGainNode: GainNode | null = null;
  private isMusicPlaying: boolean = false;

  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
  }

  private async getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      
      // Listen for volume changes
      import('../store').then(({ useGameStore }) => {
        useGameStore.subscribe((state) => {
          if (this.musicGainNode) {
            this.musicGainNode.gain.setTargetAtTime(state.musicVolume, this.audioContext!.currentTime, 0.1);
          }
        });
      });
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    return this.audioContext;
  }

  async playMusic(type: 'lobby' | 'battle') {
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    const prompt = type === 'lobby' 
      ? "Generate a 30-second ambient synthwave track for a futuristic game lobby. Chill, neon vibes."
      : "Generate a 30-second high-energy cinematic orchestral and electronic hybrid track for a fast-paced futuristic arena battle. Intense, driving rhythm.";

    try {
      const ai = this.getAI();
      const response = await ai.models.generateContentStream({
        model: "lyria-3-clip-preview",
        contents: prompt,
        config: {
          responseModalities: [Modality.AUDIO],
        }
      });

      let audioBase64 = "";
      let mimeType = "audio/wav";

      for await (const chunk of response) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
        }
      }

      if (audioBase64) {
        const binary = atob(audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        
        const ctx = await this.getAudioContext();
        const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
        
        this.stopMusic();
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true;
        
        const gainNode = ctx.createGain();
        const { useGameStore } = await import('../store');
        gainNode.gain.setValueAtTime(useGameStore.getState().musicVolume, ctx.currentTime);
        
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        source.start();
        this.currentMusicSource = source;
        this.musicGainNode = gainNode;
      }
    } catch (error: any) {
      console.error("Music Generation Error:", error);
      this.isMusicPlaying = false;
      
      // Handle permission errors (403)
      if (error?.message?.includes('403') || error?.message?.includes('PERMISSION_DENIED')) {
        import('../store').then(({ useGameStore }) => {
          useGameStore.getState().setMusicEnabled(false);
          // Optionally notify user
          useGameStore.getState().addEvent("AI Music: Permission Denied. Please check your API key.");
        });
      }
    }
  }

  stopMusic() {
    if (this.currentMusicSource) {
      try {
        this.currentMusicSource.stop();
      } catch (e) {
        // Source might already be stopped
      }
      this.currentMusicSource = null;
      this.musicGainNode = null;
    }
    this.isMusicPlaying = false;
  }

  async speak(text: string, voice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Zephyr') {
    try {
      const { useGameStore } = await import('../store');
      if (useGameStore.getState().sfxVolume <= 0) return;

      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const ctx = await this.getAudioContext();
        
        // Convert base64 to raw bytes
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Gemini TTS returns 16-bit PCM at 24kHz
        const int16Data = new Int16Array(bytes.buffer);
        const float32Data = new Float32Array(int16Data.length);
        for (let i = 0; i < int16Data.length; i++) {
          float32Data[i] = int16Data[i] / 32768.0;
        }

        const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
        audioBuffer.getChannelData(0).set(float32Data);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(useGameStore.getState().sfxVolume, ctx.currentTime);
        
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start();
      }
    } catch (error) {
      console.error("TTS Error:", error);
    }
  }

  announce(message: string) {
    this.speak(`Announcer: ${message}`, 'Zephyr');
  }

  callout(character: string, message: string) {
    const voice = character === 'Amber' ? 'Puck' : 'Kore';
    this.speak(`${character}: ${message}`, voice);
  }

  async playLoreSound(title: string, content: string) {
    this.speak(`Lore Entry: ${title}. ${content}`, 'Zephyr');
  }

  async playReloadSound() {
    this.playSFX('reload');
    this.speak("Reloading weapon", 'Fenrir');
  }

  async playSFX(type: 'shoot' | 'hit' | 'jump' | 'explosion' | 'reload' | 'spell' | 'infection' | 'timewarp' | 'killstreak' | 'ui_click' | 'ui_hover' | 'ui_tab' | 'dash_vijo' | 'achievement' | 'dimension_shift' | 'powerup' | 'quest_complete') {
    try {
      const { useGameStore } = await import('../store');
      const sfxVolume = useGameStore.getState().sfxVolume;
      if (sfxVolume <= 0) return;

      const ctx = await this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      switch(type) {
        case 'powerup':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.linearRampToValueAtTime(880, now + 0.2);
          gain.gain.setValueAtTime(0.1 * sfxVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.001 * sfxVolume, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        case 'quest_complete':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.linearRampToValueAtTime(1046.50, now + 0.3);
          gain.gain.setValueAtTime(0.1 * sfxVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.001 * sfxVolume, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        case 'ui_click':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
          gain.gain.setValueAtTime(0.05 * sfxVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.001 * sfxVolume, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        case 'ui_hover':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.03);
          gain.gain.setValueAtTime(0.02 * sfxVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.001 * sfxVolume, now + 0.03);
          osc.start(now);
          osc.stop(now + 0.03);
          break;
        case 'ui_tab':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.linearRampToValueAtTime(500, now + 0.1);
          gain.gain.setValueAtTime(0.03 * sfxVolume, now);
          gain.gain.linearRampToValueAtTime(0.001 * sfxVolume, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        case 'shoot':
          osc.type = 'square';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
          gain.gain.setValueAtTime(0.1 * sfxVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.01 * sfxVolume, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        case 'hit':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.linearRampToValueAtTime(440, now + 0.05);
          gain.gain.setValueAtTime(0.1 * sfxVolume, now);
          gain.gain.linearRampToValueAtTime(0.01 * sfxVolume, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        case 'jump':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
          gain.gain.setValueAtTime(0.1 * sfxVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.01 * sfxVolume, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        case 'explosion':
          // Noise-like sound
          const bufferSize = ctx.sampleRate * 0.5;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.3 * sfxVolume, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.01 * sfxVolume, now + 0.5);
          noise.connect(noiseGain);
          noiseGain.connect(ctx.destination);
          noise.start(now);
          noise.stop(now + 0.5);
          break;
        case 'reload':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.linearRampToValueAtTime(440, now + 0.2);
          gain.gain.setValueAtTime(0.05 * sfxVolume, now);
          gain.gain.linearRampToValueAtTime(0.01 * sfxVolume, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        case 'spell':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.exponentialRampToValueAtTime(1760, now + 0.3);
          gain.gain.setValueAtTime(0.1 * sfxVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.01 * sfxVolume, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        case 'infection':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(100, now);
          osc.frequency.linearRampToValueAtTime(50, now + 0.5);
          gain.gain.setValueAtTime(0.2 * sfxVolume, now);
          gain.gain.linearRampToValueAtTime(0.01 * sfxVolume, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
          break;
        case 'timewarp':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(55, now + 1.0);
          gain.gain.setValueAtTime(0.15 * sfxVolume, now);
          gain.gain.linearRampToValueAtTime(0.01 * sfxVolume, now + 1.0);
          osc.start(now);
          osc.stop(now + 1.0);
          break;
        case 'killstreak':
          osc.type = 'square';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
          osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
          osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
          gain.gain.setValueAtTime(0.1 * sfxVolume, now);
          gain.gain.linearRampToValueAtTime(0.01 * sfxVolume, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
          break;
        case 'achievement':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.1);
          osc.frequency.setValueAtTime(783.99, now + 0.2);
          osc.frequency.setValueAtTime(1046.50, now + 0.3);
          gain.gain.setValueAtTime(0.08 * sfxVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.001 * sfxVolume, now + 0.6);
          osc.start(now);
          osc.stop(now + 0.6);
          break;
        case 'dimension_shift':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(100, now);
          osc.frequency.exponentialRampToValueAtTime(3000, now + 0.5);
          gain.gain.setValueAtTime(0.05 * sfxVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.001 * sfxVolume, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
          break;
      }
    } catch (e) {
      console.error("SFX Error:", e);
    }
  }
}

export const soundService = new SoundService();
