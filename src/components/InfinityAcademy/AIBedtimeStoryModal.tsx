import React, { useState, useEffect, useRef } from 'react';
import { 
  Moon, Sun, Sparkles, Volume2, VolumeX, Play, Pause, Clock, 
  BookOpen, Star, Feather, RefreshCw, X, Shield, Heart, Zap, Bed, Music
} from 'lucide-react';

interface AIBedtimeStoryModalProps {
  onClose: () => void;
}

export function AIBedtimeStoryModal({ onClose }: AIBedtimeStoryModalProps) {
  const [theme, setTheme] = useState('Space Exploration');
  const [ageGroup, setAgeGroup] = useState('Preschool (Ages 3-5)');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [language, setLanguage] = useState('English');
  const [story, setStory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Audio & Timer states
  const [ambientSound, setAmbientSound] = useState<'space' | 'rain' | 'ocean' | 'river' | 'none'>('space');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [sleepTimerSeconds, setSleepTimerSeconds] = useState<number | null>(null);
  const [nightModeOpacity, setNightModeOpacity] = useState(0.85);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const themes = [
    { id: 'Space Exploration', title: '🌌 Space Exploration', desc: 'Floating through sleepy nebula clouds and stardust' },
    { id: 'Dino Safari', title: '🦕 Sleepy Dino Safari', desc: 'Gentle giant herbivores in prehistoric rainforests' },
    { id: 'Magic Chemistry', title: '🧪 Magic Chemistry', desc: 'Glowing peaceful potion bubbles and friendly elements' },
    { id: 'Cyber Knight', title: '🛡️ Cyber Knight', desc: 'Guarding the glowing neon citadel in quiet peace' },
    { id: 'Enchanted Ocean', title: '🌊 Enchanted Ocean', desc: 'Deep ocean whales humming calm low underwater tunes' },
    { id: 'Quantum Time Travel', title: '⏳ Quantum Time Travel', desc: 'Visiting ancient starry libraries with time guardians' },
  ];

  const ageGroups = [
    'Preschool (Ages 3-5)',
    'Grade RRR–R (Ages 4-6)',
    'Grade 1–3 (Ages 6-9)',
    'Grade 4–7 (Ages 9-13)',
    'Teens & Adult Calming'
  ];

  const languages = [
    'English', 'isiZulu', 'isiXhosa', 'Afrikaans', 'Sepedi', 'Setswana', 'Spanish', 'French', 'Mandarin'
  ];

  // Initialize web audio ambient sound synthesizer
  const startAmbientSound = (type: string) => {
    stopAmbientSound();
    if (type === 'none') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Pink / Brown noise for relaxing sleep background
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.04; // low volume
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter for ambient sound type
      const filter = ctx.createBiquadFilter();
      if (type === 'space') {
        filter.type = 'lowpass';
        filter.frequency.value = 180;
      } else if (type === 'rain') {
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 1.0;
      } else if (type === 'ocean') {
        filter.type = 'lowpass';
        filter.frequency.value = 350;
      } else {
        filter.type = 'lowpass';
        filter.frequency.value = 450;
      }

      const gain = ctx.createGain();
      gain.gain.value = 0.2;
      gainNodeRef.current = gain;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;
      setIsPlayingAudio(true);
    } catch (e) {
      console.error('Failed to initialize Web Audio ambient generator:', e);
    }
  };

  const stopAmbientSound = () => {
    if (noiseNodeRef.current) {
      try {
        (noiseNodeRef.current as any).stop();
      } catch (e) {}
      noiseNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  // Sleep timer ticker
  useEffect(() => {
    let interval: any = null;
    if (sleepTimerSeconds !== null && sleepTimerSeconds > 0) {
      interval = setInterval(() => {
        setSleepTimerSeconds(prev => {
          if (prev === null || prev <= 1) {
            stopAmbientSound();
            window.speechSynthesis?.cancel();
            setIsNarrating(false);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sleepTimerSeconds]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const generateBedtimeStory = async () => {
    setLoading(true);
    setStory(null);
    try {
      const res = await fetch('/api/academy/ai-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          ageGroup,
          lengthMinutes: durationMinutes,
          language
        })
      });
      const data = await res.json();
      if (data.success && data.story) {
        setStory(data.story);
        // Start ambient sound
        startAmbientSound(ambientSound);
      }
    } catch (e) {
      setStory(`🌌 **The Sleepy Star's Goodnight Journey** 🌌\n\nClose your eyes and take a deep breath... *in... and out...*\n\nThe starry night sky over Neon Arena glows softly with warm lavender light. High up in the tranquil space clouds, A.U.R.A whispers a soothing lullaby. All the friendly creatures are tucked into bed, dreaming under the quiet stars.\n\nGoodnight young explorer. Sweet dreams.`);
    } finally {
      setLoading(false);
    }
  };

  const toggleNarration = () => {
    if (!window.speechSynthesis || !story) return;

    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = story.replace(/[*_#🌌🦕🧪🛡️🌊⏳🌠]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.75; // Slower soothing speed
      utterance.pitch = 0.85; // Calming lower pitch
      utterance.onend = () => setIsNarrating(false);
      utterance.onerror = () => setIsNarrating(false);
      window.speechSynthesis.speak(utterance);
      setIsNarrating(true);
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl select-none font-sans overflow-y-auto">
      {/* Dynamic Night Dimming Overlay */}
      <div 
        className="fixed inset-0 bg-indigo-950/40 pointer-events-none transition-opacity duration-1000" 
        style={{ opacity: nightModeOpacity }} 
      />

      <div className="relative w-full max-w-4xl bg-zinc-950/95 border border-indigo-500/40 rounded-3xl shadow-[0_0_80px_rgba(99,102,241,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glowing top line */}
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 w-full" />

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] animate-pulse">
              <Moon className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-wide uppercase italic">A.U.R.A BEDTIME STORYTELLER</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  RELAX & SLEEP
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">AI-generated educational sleep stories, ambient lullaby soundscapes & sleep timer</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {!story ? (
            /* Setup Story Generator View */
            <div className="space-y-6">
              {/* Theme Selector */}
              <div>
                <label className="text-xs font-black text-indigo-300 uppercase tracking-widest block mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Select Bedtime Adventure Theme
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        theme === t.id
                          ? 'bg-indigo-500/15 border-indigo-400 text-white shadow-[0_0_25px_rgba(99,102,241,0.2)]'
                          : 'bg-white/5 border-white/5 text-zinc-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <h4 className="text-sm font-black uppercase tracking-wide">{t.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Age & Language & Duration options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Target Age Group</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-400"
                  >
                    {ageGroups.map(ag => <option key={ag} value={ag}>{ag}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-400"
                  >
                    {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Story Duration</label>
                  <div className="flex gap-1.5">
                    {[5, 15, 30, 60].map(mins => (
                      <button
                        key={mins}
                        onClick={() => setDurationMinutes(mins)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          durationMinutes === mins
                            ? 'bg-indigo-500 text-white'
                            : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ambient Sound Selection */}
              <div>
                <label className="text-xs font-black text-indigo-300 uppercase tracking-widest block mb-3 flex items-center gap-2">
                  <Music className="w-4 h-4 text-indigo-400" />
                  Relaxing Background Soundscape
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: 'space', label: '🌌 Cosmic Wind' },
                    { id: 'rain', label: '🌧️ City Rain' },
                    { id: 'ocean', label: '🌊 Deep Waves' },
                    { id: 'river', label: '🍃 Forest Stream' },
                    { id: 'none', label: '🔇 Silent' },
                  ].map(snd => (
                    <button
                      key={snd.id}
                      onClick={() => {
                        setAmbientSound(snd.id as any);
                        if (isPlayingAudio) startAmbientSound(snd.id);
                      }}
                      className={`py-2.5 px-3 rounded-2xl border text-xs font-black uppercase transition-all cursor-pointer ${
                        ambientSound === snd.id
                          ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-200'
                          : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {snd.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={generateBedtimeStory}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 text-white font-black text-sm uppercase tracking-widest shadow-[0_0_35px_rgba(99,102,241,0.4)] hover:scale-[1.01] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>A.U.R.A IS WEAVING YOUR BEDTIME STORY...</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5 fill-current" />
                    <span>BEGIN BEDTIME STORY & RELAX</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Story Reading / Listening View */
            <div className="space-y-6">
              {/* Controls bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center gap-3">
                  {/* Narration Toggle */}
                  <button
                    onClick={toggleNarration}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                      isNarrating
                        ? 'bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)] animate-pulse'
                        : 'bg-indigo-500 hover:bg-indigo-400 text-white'
                    }`}
                  >
                    {isNarrating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    {isNarrating ? 'PAUSE AI VOICE' : 'READ ALOUD (AI VOICE)'}
                  </button>

                  {/* Ambient Toggle */}
                  <button
                    onClick={() => {
                      if (isPlayingAudio) stopAmbientSound();
                      else startAmbientSound(ambientSound);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      isPlayingAudio
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {isPlayingAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    {isPlayingAudio ? 'SOUND ACTIVE' : 'PLAY SOUND'}
                  </button>
                </div>

                {/* Sleep Timer & Dimmer */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-xl">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono font-bold text-white">
                      {sleepTimerSeconds !== null ? formatTimer(sleepTimerSeconds) : 'SLEEP TIMER'}
                    </span>
                    {[15, 30, 45].map(mins => (
                      <button
                        key={mins}
                        onClick={() => setSleepTimerSeconds(mins * 60)}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-indigo-500 text-[10px] font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setNightModeOpacity(prev => prev === 0.95 ? 0.4 : 0.95)}
                    className="p-2 bg-zinc-900 border border-white/10 hover:border-indigo-400 rounded-xl text-indigo-300 transition-all cursor-pointer"
                    title="Toggle Deep Night Dimmer"
                  >
                    <Bed className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Story Display Card */}
              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 space-y-4 text-zinc-200 leading-relaxed font-medium text-sm sm:text-base shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20 text-xs font-black uppercase tracking-widest text-indigo-400">
                  <span>{theme} • {ageGroup}</span>
                  <span>{language}</span>
                </div>
                <div className="whitespace-pre-line font-serif text-zinc-100 leading-loose">
                  {story}
                </div>
              </div>

              {/* Reset / New Story button */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setStory(null)}
                  className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-wider text-zinc-300 transition-all cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 text-indigo-400" />
                  CHOOSE DIFFERENT STORY
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  DONE & SLEEP 💤
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
