import { useEffect, useRef } from 'react';
import { useGameStore } from '../store';

export function Soundscape() {
  const instability = useGameStore(state => state.instability);
  const gameState = useGameStore(state => state.gameState);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const droneNode1Ref = useRef<OscillatorNode | null>(null);
  const droneNode2Ref = useRef<OscillatorNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // Only run soundscape while playing
    if (gameState !== 'playing') {
      cleanup();
      return;
    }

    const initAudio = async () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        // Gain node to control volumes
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNodeRef.current = masterGain;

        // Bandpass Filter to make it sound deeply ambient and hollow
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(100, ctx.currentTime);
        filter.Q.setValueAtTime(1.0, ctx.currentTime);
        filterNodeRef.current = filter;

        // Drone Oscillator 1: Very deep sinewave (e.g., 55 Hz, A1)
        const osc1 = ctx.createOscillator();
        osc1.type = 'sawtooth'; // Sawtooth has rich harmonics for filtering
        osc1.frequency.setValueAtTime(55, ctx.currentTime);
        droneNode1Ref.current = osc1;

        // Drone Oscillator 2: Slightly detuned side drone for thick choral beat frequency
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(55.4, ctx.currentTime); // 0.4Hz detune for organic beating
        droneNode2Ref.current = osc2;

        // LFO (Low-Frequency Oscillator) to modulate the filter cutoff for scary swelling surges
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.3, ctx.currentTime); // 0.3 Hz (very slow swell)
        lfoRef.current = lfo;

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(35, ctx.currentTime);
        lfoGainRef.current = lfoGain;

        // Connect LFO to filter frequency
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        // Connect audio graph
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(masterGain);
        masterGain.connect(ctx.destination);

        // Start oscillators
        osc1.start();
        osc2.start();
        lfo.start();

        const resumeOnInteract = async () => {
          if (ctx.state === 'suspended') {
            await ctx.resume();
          }
          window.removeEventListener('click', resumeOnInteract);
          window.removeEventListener('keydown', resumeOnInteract);
          window.removeEventListener('mousedown', resumeOnInteract);
        };
        window.addEventListener('click', resumeOnInteract);
        window.addEventListener('keydown', resumeOnInteract);
        window.addEventListener('mousedown', resumeOnInteract);
      } catch (err) {
        console.error('Failed to initialize ambient soundscape synthesizer:', err);
      }
    };

    initAudio();

    return () => {
      cleanup();
    };
  }, [gameState]);

  // Adjust volume, pitch, and LFO rate based on instability level to raise tension dynamically
  useEffect(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'suspended') return;
    const ctx = audioContextRef.current;
    const curTime = ctx.currentTime;

    const tensionRatio = instability / 100; // 0.0 to 1.0

    // Raise master volume slightly with instability (from ambient 0.08 up to intense 0.25)
    if (gainNodeRef.current) {
      const targetGain = 0.08 + tensionRatio * 0.17;
      gainNodeRef.current.gain.setTargetAtTime(targetGain, curTime, 0.4);
    }

    // Pitch: Modulate the base frequency upwards (+25Hz tension shift)
    if (droneNode1Ref.current) {
      const baseFreq = 55 + tensionRatio * 25;
      droneNode1Ref.current.frequency.setTargetAtTime(baseFreq, curTime, 0.5);
    }
    if (droneNode2Ref.current) {
      const baseFreqOffset = 55.4 + tensionRatio * 25.5;
      droneNode2Ref.current.frequency.setTargetAtTime(baseFreqOffset, curTime, 0.5);
    }

    // LFO Swelling Rate: speed up the volume/filter oscillation as instability rises (from 0.3Hz to 4.5Hz!)
    if (lfoRef.current) {
      const lfoFreq = 0.3 + tensionRatio * 4.2;
      lfoRef.current.frequency.setTargetAtTime(lfoFreq, curTime, 0.5);
    }

    // Modulate Filter Bandpass center frequency higher as tension increases to sound screechier
    if (filterNodeRef.current) {
      const centerCutoff = 100 + tensionRatio * 180;
      filterNodeRef.current.frequency.setTargetAtTime(centerCutoff, curTime, 0.4);
    }
  }, [instability]);

  const cleanup = () => {
    try {
      if (droneNode1Ref.current) droneNode1Ref.current.stop();
      if (droneNode2Ref.current) droneNode2Ref.current.stop();
      if (lfoRef.current) lfoRef.current.stop();
    } catch (e) {}

    droneNode1Ref.current = null;
    droneNode2Ref.current = null;
    lfoRef.current = null;

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  return null;
}
