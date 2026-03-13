import { GoogleGenAI, Modality } from "@google/genai";

class SoundService {
  private ai: any;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  private async getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  async speak(text: string, voice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Zephyr') {
    try {
      const response = await this.ai.models.generateContent({
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
        const arrayBuffer = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0)).buffer;
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
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
}

export const soundService = new SoundService();
