import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Volume2, Music, Upload, Check, AlertCircle, X,
  ChevronRight, Disc, List, Sliders, Radio, Repeat, Sparkles, Cpu
} from 'lucide-react';

interface MusicTrack {
  id: string;
  title: string;
  composer: string;
  duration: string;
  genre: string;
  notes: string;
  fileUrl: string;
  tempo: number;
  scale: string;
  synthPattern?: {
    tempo: number;
    bass: number[];
    lead: number[];
  };
}

export function MusicLoader({ onClose }: { onClose: () => void }) {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<string>('');

  // Audio nodes and context
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const customBufferRef = useRef<AudioBuffer | null>(null);

  // Synth state scheduling references
  const synthIntervalRef = useRef<number | null>(null);
  const synthIndexRef = useRef<number>(0);
  const synthNodesRef = useRef<AudioNode[]>([]);

  // Canvas visualizer reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load manifest.json
  useEffect(() => {
    fetch('/musics/manifest.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.tracks) {
          setTracks(data.tracks);
        }
      })
      .catch(err => {
        console.error("Failed to load music manifest, using offline fallbacks", err);
        // Fallback local hardcoded tracks
        setTracks([
          {
            id: "neon_gate",
            title: "Neon Gate Overdrive",
            composer: "Neon Arena Synth Team",
            duration: "1:24",
            genre: "Synthwave / Cyberpunk",
            notes: "Classic driving futuristic beat with sawtooth bassline and pulsing retro leads.",
            fileUrl: "/musics/neon_gate.mp3",
            tempo: 120,
            scale: "A minor",
            synthPattern: {
              tempo: 120,
              bass: [55.0, 55.0, 65.4, 65.4, 58.3, 58.3, 49.0, 49.0],
              lead: [220.0, 261.6, 293.7, 329.6, 392.0, 329.6, 293.7, 261.6]
            }
          },
          {
            id: "cyber_rain",
            title: "Cybernetic Rain",
            composer: "A.U.R.A Neural Synth",
            duration: "2:05",
            genre: "Ambient / Chillwave",
            notes: "Deep, evolving soundscape with resonant triangle sweeps and soft digital rain sounds.",
            fileUrl: "/musics/cyber_rain.mp3",
            tempo: 90,
            scale: "E minor",
            synthPattern: {
              tempo: 90,
              bass: [41.2, 41.2, 49.0, 49.0, 43.7, 43.7, 36.7, 36.7],
              lead: [164.8, 196.0, 220.0, 246.9, 293.7, 246.9, 220.0, 196.0]
            }
          }
        ]);
      });

    return () => {
      cleanupAudio();
    };
  }, []);

  // Initialize Audio Context on demand
  const initAudioCtx = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const gain = ctx.createGain();
      const analyser = ctx.createAnalyser();

      analyser.fftSize = 64;
      gain.gain.setValueAtTime(volume, ctx.currentTime);

      analyser.connect(ctx.destination);
      gain.connect(analyser);

      audioCtxRef.current = ctx;
      gainNodeRef.current = gain;
      analyserRef.current = analyser;
    } else if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return {
      ctx: audioCtxRef.current,
      gain: gainNodeRef.current,
      analyser: analyserRef.current
    };
  };

  // Adjust volume dynamically
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.1);
    }
  }, [volume]);

  // Clean up existing play streams
  const cleanupAudio = () => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {}
      currentSourceRef.current = null;
    }
    stopSynthesizer();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsPlaying(false);
  };

  // Stop Web Audio synth loops
  const stopSynthesizer = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    synthNodesRef.current.forEach(node => {
      try {
        if ('stop' in node) {
          (node as any).stop();
        }
      } catch (e) {}
    });
    synthNodesRef.current = [];
    setIsSynthesizing(false);
  };

  // Web Audio dynamic retro-synth live generator
  const playSynthesizer = (track: MusicTrack) => {
    stopSynthesizer();
    const { ctx, gain } = initAudioCtx();
    if (!ctx || !gain) return;

    setIsSynthesizing(true);
    setIsPlaying(true);

    const pattern = track.synthPattern || {
      tempo: 120,
      bass: [55.0, 55.0, 65.4, 65.4, 58.3, 58.3, 49.0, 49.0],
      lead: [220.0, 261.6, 293.7, 329.6, 392.0, 329.6, 293.7, 261.6]
    };

    const stepDuration = 60 / pattern.tempo / 2; // eighth notes
    synthIndexRef.current = 0;

    const playStep = () => {
      const now = ctx.currentTime;
      const idx = synthIndexRef.current % pattern.bass.length;

      // 1. Synth Bass Note
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(pattern.bass[idx], now);

      bassGain.gain.setValueAtTime(0.3, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration - 0.02);

      // Lowpass filter for deep synthwave feeling
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(250, now);

      bassOsc.connect(lowpass);
      lowpass.connect(bassGain);
      bassGain.connect(gain);

      bassOsc.start(now);
      bassOsc.stop(now + stepDuration);
      synthNodesRef.current.push(bassOsc);

      // 2. Lead Arpeggio Melody Note
      if (idx % 2 === 0 || Math.random() > 0.4) {
        const leadOsc = ctx.createOscillator();
        const leadGain = ctx.createGain();
        leadOsc.type = 'triangle';
        leadOsc.frequency.setValueAtTime(pattern.lead[(idx + 2) % pattern.lead.length], now);

        leadGain.gain.setValueAtTime(0.18, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 2);

        // Soft bandpass delay filter
        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(800, now);

        leadOsc.connect(bandpass);
        bandpass.connect(leadGain);
        leadGain.connect(gain);

        leadOsc.start(now);
        leadOsc.stop(now + stepDuration * 2);
        synthNodesRef.current.push(leadOsc);
      }

      // 3. Procedural Drum Noise Snare Beat on alternative steps
      if (idx % 4 === 2) {
        const snareNoise = ctx.createBufferSource();
        const bufferSize = ctx.sampleRate * 0.15; // short pop
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        snareNoise.buffer = buffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1000, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.08, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        snareNoise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(gain);

        snareNoise.start(now);
        synthNodesRef.current.push(snareNoise);
      }

      synthIndexRef.current++;
    };

    // Schedule initial step immediately
    playStep();
    
    // Set up continuous precise ticking
    synthIntervalRef.current = window.setInterval(playStep, stepDuration * 1000);
  };

  // Attempt to play a loaded MP3 file. Fallback to real-time retro synthesis if absent!
  const playTrackIndex = async (index: number) => {
    cleanupAudio();
    if (tracks.length === 0) return;

    setCurrentTrackIndex(index);
    const track = tracks[index];
    const { ctx, gain } = initAudioCtx();
    if (!ctx || !gain) return;

    // If it is a custom uploaded track, play from stored buffer
    if (track.id.startsWith('custom_') && customBufferRef.current) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = customBufferRef.current;
        source.loop = isLooping;
        source.connect(gain);
        source.start(0);
        currentSourceRef.current = source;
        setIsPlaying(true);
        setErrorMessage('');
      } catch (e: any) {
        setErrorMessage(`Playback error: ${e.message}`);
      }
      return;
    }

    // Try fetching the actual file
    try {
      setErrorMessage('');
      const response = await fetch(track.fileUrl);
      if (!response.ok) {
        throw new Error("File not found on server");
      }
      const arrayBuffer = await response.arrayBuffer();
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);

      const source = ctx.createBufferSource();
      source.buffer = decodedBuffer;
      source.loop = isLooping;
      source.connect(gain);
      source.start(0);
      currentSourceRef.current = source;
      setIsPlaying(true);
    } catch (err) {
      console.warn(`Could not load physical audio file (${track.fileUrl}). Booting Neon Real-Time Synthesizer instead!`, err);
      // Fallback: Use procedural synth
      playSynthesizer(track);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      cleanupAudio();
    } else {
      playTrackIndex(currentTrackIndex);
    }
  };

  const handleNext = () => {
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    playTrackIndex(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    playTrackIndex(prevIdx);
  };

  // Handle manual Drag & Drop / File Select loader
  const handleLocalFileLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus(`Reading ${file.name}...`);
    cleanupAudio();

    try {
      const { ctx, gain } = initAudioCtx();
      if (!ctx || !gain) return;

      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          setUploadStatus("Decoding audio streams...");
          const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
          
          customBufferRef.current = decodedBuffer;

          // Register this as a new Custom Track
          const customTrack: MusicTrack = {
            id: `custom_${Date.now()}`,
            title: file.name.replace(/\.[^/.]+$/, ""), // strip extension
            composer: "Local Loaded Media",
            duration: `${Math.floor(decodedBuffer.duration / 60)}:${Math.floor(decodedBuffer.duration % 60).toString().padStart(2, '0')}`,
            genre: "Loaded User File",
            notes: `Loaded directly from browser file handle. Format: ${file.type || 'audio/unknown'}.`,
            fileUrl: '',
            tempo: 120,
            scale: 'Auto Detect'
          };

          const updatedList = [...tracks, customTrack];
          setTracks(updatedList);
          setUploadStatus("Loaded successfully!");
          
          // Play immediately
          setCurrentTrackIndex(updatedList.length - 1);
          setTimeout(() => {
            playTrackIndex(updatedList.length - 1);
          }, 100);
        } catch (decErr: any) {
          setErrorMessage(`Decoder Error: ${decErr.message}`);
          setUploadStatus('');
        }
      };
      fileReader.readAsArrayBuffer(file);
    } catch (err: any) {
      setErrorMessage(`Loader Error: ${err.message}`);
      setUploadStatus('');
    }
  };

  // Animated Oscilloscope Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const bufferLength = analyserRef.current ? analyserRef.current.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    let phase = 0;

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;
      canvasCtx.clearRect(0, 0, width, height);

      // Get real audio frequencies if playing, or use fake simulated waveforms if idle
      if (isPlaying && analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
      } else {
        // Generate simulated dynamic cyber waves
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = 10 + Math.sin(i * 0.4 + phase) * 30 + Math.cos(i * 0.8 - phase) * 10;
        }
        phase += 0.05;
      }

      // Draw Glowing Grid Lines
      canvasCtx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
      canvasCtx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        canvasCtx.beginPath();
        canvasCtx.moveTo(x, 0);
        canvasCtx.lineTo(x, height);
        canvasCtx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, y);
        canvasCtx.lineTo(width, y);
        canvasCtx.stroke();
      }

      // Draw Glowing Futuristic Waves
      const barWidth = (width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height * (isPlaying ? 1.4 : 0.4);
        
        // Beautiful glowing radial gradient for each bar
        const gradient = canvasCtx.createLinearGradient(x, height - barHeight, x + barWidth, height);
        
        if (isSynthesizing) {
          gradient.addColorStop(0, '#f43f5e'); // Rose glow for synthesizers
          gradient.addColorStop(0.5, '#d946ef');
          gradient.addColorStop(1, '#1e1b4b');
        } else {
          gradient.addColorStop(0, '#06b6d4'); // Cyan glow for standard audio
          gradient.addColorStop(0.5, '#3b82f6');
          gradient.addColorStop(1, '#09090b');
        }

        canvasCtx.fillStyle = gradient;
        
        // Shadow glow
        canvasCtx.shadowBlur = isPlaying ? 15 : 4;
        canvasCtx.shadowColor = isSynthesizing ? '#d946ef' : '#06b6d4';

        // Rounded glowing digital EQ node
        canvasCtx.beginPath();
        canvasCtx.roundRect(x, height - barHeight - 4, barWidth - 2, barHeight + 4, 3);
        canvasCtx.fill();
        
        x += barWidth + 1.5;
      }
      
      // Reset shadows
      canvasCtx.shadowBlur = 0;
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isSynthesizing]);

  const activeTrack = tracks[currentTrackIndex];

  return (
    <div className="bg-zinc-950 border border-cyan-500/20 rounded-3xl p-6 space-y-6 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.1)]">
      {/* Decorative top strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-pink-500 to-amber-500" />

      {/* Title block */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-spin-slow">
            <Radio className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <span className="text-[7.5px] font-mono font-black tracking-[0.4em] text-cyan-400 uppercase">Holographic Deck</span>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">NEON MUSIC LOADER & STATION</h3>
          </div>
        </div>

        {/* Closing Control */}
        <button
          onClick={onClose}
          className="p-1.5 bg-zinc-900 border border-white/10 hover:border-cyan-400 rounded-xl text-zinc-400 hover:text-white transition-all text-[10px] uppercase font-bold tracking-wider cursor-pointer"
        >
          ✕ CLOSE
        </button>
      </div>

      {/* Holographic Oscilloscope Visualizer Box */}
      <div className="relative rounded-2xl bg-zinc-900/30 border border-white/5 p-2 h-28 overflow-hidden flex items-end">
        <canvas 
          ref={canvasRef} 
          width={450} 
          height={100} 
          className="w-full h-full block" 
        />
        
        <div className="absolute top-3 left-4 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-cyan-400 animate-ping' : 'bg-zinc-600'}`} />
          <span className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest">
            {isPlaying ? (isSynthesizing ? 'REAL-TIME SYNTHESIS DECK' : 'STREAMING FILE FEED') : 'DECK STANDBY'}
          </span>
        </div>

        {isSynthesizing && (
          <div className="absolute bottom-3 right-4 flex items-center gap-1.5 bg-pink-950/40 border border-pink-500/30 px-2 py-0.5 rounded text-[7.5px] font-black text-pink-400 tracking-wider">
            <Cpu className="w-3 h-3 text-pink-400 animate-pulse" />
            SYNTH ACTIVE
          </div>
        )}
      </div>

      {/* Main Track Detail Dossier */}
      {activeTrack && (
        <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[8px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-zinc-400 font-bold uppercase tracking-widest">
                {activeTrack.genre}
              </span>
              <h4 className="text-base font-black text-white uppercase italic tracking-wider mt-1.5">{activeTrack.title}</h4>
              <p className="text-[10px] text-zinc-400 uppercase font-semibold">Composed by {activeTrack.composer}</p>
            </div>
            
            <div className="text-right font-mono text-[10px] font-bold text-cyan-400">
              <div>TEMPO: {activeTrack.tempo} BPM</div>
              <div className="text-zinc-500 text-[8.5px] mt-0.5">SCALE: {activeTrack.scale}</div>
            </div>
          </div>

          <p className="text-[10px] text-zinc-400 font-medium leading-relaxed leading-normal italic uppercase">
            &ldquo;{activeTrack.notes}&rdquo;
          </p>
        </div>
      )}

      {/* Interactive Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-zinc-950/60 p-4 border border-white/5 rounded-2xl">
        {/* Buttons */}
        <div className="md:col-span-5 flex items-center gap-2.5">
          <button
            onClick={handlePrev}
            className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Previous Track"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>

          <button
            onClick={handlePlayPause}
            className={`flex-1 py-2.5 rounded-2xl text-zinc-950 font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isPlaying 
                ? 'bg-pink-500 hover:bg-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
                : 'bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current text-zinc-950" />
                PAUSE TRACK
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-zinc-950" />
                PLAY SOUNDTRACK
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Next Track"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Volume controls */}
        <div className="md:col-span-4 flex items-center gap-3 font-mono text-[9px] uppercase font-bold text-zinc-500">
          <Volume2 className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
          />
          <span className="w-8 text-right text-zinc-300">{Math.round(volume * 100)}%</span>
        </div>

        {/* Loop setting */}
        <div className="md:col-span-3 flex justify-end">
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
              isLooping 
                ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]' 
                : 'bg-zinc-900 border-white/5 text-zinc-500'
            }`}
          >
            <Repeat className="w-3 h-3" />
            {isLooping ? 'LOOP ON' : 'SINGLE PLAY'}
          </button>
        </div>
      </div>

      {/* Tracks Selection Grid */}
      <div className="space-y-2.5">
        <span className="text-[8.5px] font-mono font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
          <List className="w-3.5 h-3.5 text-zinc-500" />
          SOUNDTRACKS ARCHIVE
        </span>

        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1.5 border border-white/5 rounded-2xl p-2 bg-zinc-950/40">
          {tracks.map((t, idx) => {
            const isCurrent = idx === currentTrackIndex;
            return (
              <button
                key={t.id}
                onClick={() => playTrackIndex(idx)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent 
                    ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-[0_0_8px_rgba(6,182,212,0.1)]' 
                    : 'bg-zinc-900/50 border-white/5 hover:border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Disc className={`w-3.5 h-3.5 shrink-0 ${isCurrent && isPlaying ? 'animate-spin-slow text-cyan-400' : 'text-zinc-600'}`} />
                  <div className="truncate">
                    <span className="text-[10px] font-black uppercase block truncate">{t.title}</span>
                    <span className="text-[8px] text-zinc-500 block truncate">{t.composer}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 font-mono text-[9px] text-zinc-500">
                  <span className="uppercase text-[8px] bg-white/5 px-1.5 py-0.5 rounded">{t.genre}</span>
                  <span>{t.duration}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Drag & Drop Local Loader Input */}
      <div className="border border-dashed border-white/10 hover:border-cyan-500/40 bg-zinc-900/10 p-5 rounded-2xl text-center space-y-3 transition-colors relative cursor-pointer group">
        <input
          type="file"
          accept="audio/*"
          onChange={handleLocalFileLoad}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
        />
        
        <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
          <Upload className="w-5 h-5 text-zinc-500 group-hover:text-cyan-400 transition-colors animate-bounce" />
          <p className="text-[10px] font-black text-white uppercase tracking-wider">Drag &amp; Drop or Upload Custom Track</p>
          <p className="text-[8px] text-zinc-500 uppercase font-semibold">LOADS .MP3 OR .WAV CHANNELS LOCALLY INTO NEON OS ENGINE</p>
        </div>

        {uploadStatus && (
          <div className="text-[9px] font-mono font-bold text-amber-400 animate-pulse">
            {uploadStatus}
          </div>
        )}
      </div>

      {/* Error Output Indicator */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 bg-rose-950/40 border border-rose-500/20 p-3 rounded-xl text-[9px] text-rose-300 font-semibold uppercase">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
