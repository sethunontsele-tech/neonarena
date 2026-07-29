import React, { useState, useMemo } from 'react';
import { 
  Gamepad2, Search, Filter, Sparkles, Trophy, Shield, Rocket, Target, 
  Layers, Users, Compass, Eye, Play, X, ChevronLeft, ChevronRight, Download, 
  Zap, Star, Lock, CheckCircle2, RefreshCw, Flame, Crown, BookOpen
} from 'lucide-react';
import { useEduStore } from './eduStore';

export interface GameConcept {
  id: number;
  title: string;
  series: 'Nova' | 'Echo';
  genre: string;
  description: string;
  worldBiome: string;
  mechanics: string[];
  multiplayerMode: string;
  missionsCount: number;
  secretsCount: number;
  replayabilityScore: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme' | 'Legendary';
  featuredSkill: string;
}

const GENRES = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation',
  'Racing', 'Sports', 'Puzzle', 'Platformer', 'Survival',
  'Horror', 'Stealth', 'Shooter', 'Sandbox', 'City Builder',
  'Tycoon', 'Roguelike', 'Metroidvania', 'Rhythm', 'Party'
];

const BIOMES = [
  'Neon Cybercity', 'Bioluminescent Jungle', 'Quantum Abyss', 'Floating Sky Islands',
  'Steampunk Metropolis', 'Obsidian Volcano Realm', 'Sub-Zero Cryo Citadel',
  'Solar Flare Wasteland', 'Spectral Astral Void', 'Deep Trench Subterranean'
];

const MECHANICS_POOL = [
  'Rewarding Progression Tree', 'Creative Spatial Manipulation', 'Dynamic Gravity Shifts',
  'Elemental Skill Chaining', 'Tactical Stealth Camouflage', 'Procedural Dungeon Generation',
  'Real-time Resource Management', 'Co-op Combo Attacks', 'Time-Dilation Abilities',
  'Vehicle Customization', 'Base Building & Fortification', 'Physics-based Puzzle Mechanics'
];

const MULTIPLAYER_MODES = [
  '4-Player Co-Op Campaign', '1v1 Competitive Arena', '32-Player Battle Royale',
  'Asymmetric Monster Hunt', 'Guild Warfare & Raids', 'Cross-Platform Party Games'
];

const SKILLS_POOL = [
  'Quantum Dash', 'Solar Flare Blast', 'Chrono Freeze', 'Nanite Shield',
  'Aether Beam', 'Telekinetic Wave', 'Plasma Overdrive', 'Shadow Step'
];

// Generate exact 500 concepts as defined in the user prompt
const GENERATED_500_CONCEPTS: GameConcept[] = Array.from({ length: 500 }, (_, index) => {
  const id = index + 1;
  const series: 'Nova' | 'Echo' = id % 2 !== 0 ? 'Nova' : 'Echo';
  const genreIndex = (id - 1) % 20;
  const genre = GENRES[genreIndex];
  const title = `${genre} Concept ${id}: ${series}`;
  const description = `An original ${genre.toLowerCase()} game featuring rewarding progression, memorable worlds, creative mechanics, optional multiplayer, challenging missions, secrets to discover, and replayable gameplay.`;

  const biome = BIOMES[(id * 3) % BIOMES.length];
  const difficultyList: ('Easy' | 'Medium' | 'Hard' | 'Extreme' | 'Legendary')[] = ['Easy', 'Medium', 'Hard', 'Extreme', 'Legendary'];
  const difficulty = difficultyList[(id + genreIndex) % difficultyList.length];

  const mech1 = MECHANICS_POOL[(id * 2) % MECHANICS_POOL.length];
  const mech2 = MECHANICS_POOL[(id * 5 + 1) % MECHANICS_POOL.length];
  const mech3 = MECHANICS_POOL[(id * 7 + 3) % MECHANICS_POOL.length];

  return {
    id,
    title,
    series,
    genre,
    description,
    worldBiome: biome,
    mechanics: Array.from(new Set([mech1, mech2, mech3])),
    multiplayerMode: MULTIPLAYER_MODES[id % MULTIPLAYER_MODES.length],
    missionsCount: 10 + (id % 40),
    secretsCount: 5 + (id % 25),
    replayabilityScore: 85 + (id % 15),
    difficulty,
    featuredSkill: SKILLS_POOL[id % SKILLS_POOL.length]
  };
});

interface GameConceptsHubProps {
  onClose?: () => void;
}

export function GameConceptsHub({ onClose }: GameConceptsHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedSeries, setSelectedSeries] = useState<'All' | 'Nova' | 'Echo'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [inspectConcept, setInspectConcept] = useState<GameConcept | null>(null);
  const [playtestConcept, setPlaytestConcept] = useState<GameConcept | null>(null);
  const [playtestProgress, setPlaytestProgress] = useState(0);
  const [playtestLog, setPlaytestLog] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const gainXP = useEduStore(state => state.gainXP);

  // Filtered concepts
  const filteredConcepts = useMemo(() => {
    return GENERATED_500_CONCEPTS.filter(c => {
      const matchesSearch = searchQuery === '' || 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toString().includes(searchQuery);

      const matchesGenre = selectedGenre === 'All' || c.genre === selectedGenre;
      const matchesSeries = selectedSeries === 'All' || c.series === selectedSeries;

      return matchesSearch && matchesGenre && matchesSeries;
    });
  }, [searchQuery, selectedGenre, selectedSeries]);

  const totalPages = Math.ceil(filteredConcepts.length / itemsPerPage);
  const paginatedConcepts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredConcepts.slice(start, start + itemsPerPage);
  }, [filteredConcepts, currentPage]);

  const handleStartPlaytest = (concept: GameConcept) => {
    setPlaytestConcept(concept);
    setPlaytestProgress(0);
    setPlaytestLog([`🎮 Initializing simulation engine for ${concept.title}...`]);
    setIsSimulating(true);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setPlaytestProgress(progress);
      if (progress === 25) {
        setPlaytestLog(prev => [...prev, `🌌 Entering ${concept.worldBiome} biome...`]);
      } else if (progress === 50) {
        setPlaytestLog(prev => [...prev, `⚔️ Executing primary mechanic: ${concept.mechanics[0]}`]);
      } else if (progress === 75) {
        setPlaytestLog(prev => [...prev, `🔑 Unlocked secret artifact & executed ${concept.featuredSkill}!`]);
      } else if (progress >= 100) {
        clearInterval(interval);
        setIsSimulating(false);
        setPlaytestLog(prev => [...prev, `🏆 MISSION COMPLETE! Rewarded 150 XP for playtesting ${concept.title}!`]);
        gainXP(150);
      }
    }, 600);
  };

  const handleExportGDD = (concept: GameConcept) => {
    const gddText = `================================================
GAME DESIGN DOCUMENT: ${concept.title}
================================================
Genre: ${concept.genre}
Series: ${concept.series}
World Biome: ${concept.worldBiome}
Difficulty: ${concept.difficulty}
Missions: ${concept.missionsCount} | Secrets: ${concept.secretsCount}
Replayability Rating: ${concept.replayabilityScore}/100

OVERVIEW:
${concept.description}

CORE MECHANICS:
${concept.mechanics.map(m => `- ${m}`).join('\n')}

MULTIPLAYER INTEGRATION:
${concept.multiplayerMode}

FEATURED HERO ABILITY:
${concept.featuredSkill}

================================================
Generated by Infinity Academy Game Concepts Matrix
================================================`;

    const blob = new Blob([gddText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GDD_${concept.series}_Concept_${concept.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl font-sans select-none overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-zinc-950/95 border border-cyan-500/40 rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Glowing top accent border */}
        <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 w-full" />

        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Gamepad2 className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white uppercase italic tracking-wider">
                  500 GAME CONCEPTS ARCHIVE
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  NOVA & ECHO SERIES
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Explore 500 original game concepts spanning 20 genres with interactive playtests & GDD exports
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-xs font-mono font-bold text-cyan-300">
              {filteredConcepts.length} / 500 CONCEPTS
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-zinc-900/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <div className="flex-1 min-w-[220px] relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID (1-500), genre, or mechanic..."
              className="w-full bg-zinc-950 border border-white/10 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none"
            />
          </div>

          {/* Series selector */}
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-white/10 rounded-xl p-1 text-xs font-black uppercase">
            <button
              onClick={() => { setSelectedSeries('All'); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                selectedSeries === 'All' ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setSelectedSeries('Nova'); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                selectedSeries === 'Nova' ? 'bg-cyan-400 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Nova (Odd)
            </button>
            <button
              onClick={() => { setSelectedSeries('Echo'); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                selectedSeries === 'Echo' ? 'bg-fuchsia-500 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Echo (Even)
            </button>
          </div>

          {/* Genre Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedGenre}
              onChange={(e) => {
                setSelectedGenre(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-cyan-300 outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="All">All 20 Genres</option>
              {GENRES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Concept Grid Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {paginatedConcepts.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-white/5 border border-white/10 rounded-3xl">
              <Search className="w-10 h-10 text-zinc-500 mx-auto" />
              <h3 className="text-sm font-black text-white uppercase">No Game Concepts Match Search</h3>
              <p className="text-xs text-zinc-400">Try adjusting your search query or clear the genre filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenre('All');
                  setSelectedSeries('All');
                }}
                className="px-4 py-2 bg-cyan-500 text-black font-black text-xs uppercase rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedConcepts.map((c) => (
                <div
                  key={c.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    c.series === 'Nova'
                      ? 'bg-cyan-950/20 border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                      : 'bg-fuchsia-950/20 border-fuchsia-500/30 hover:border-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.1)]'
                  }`}
                >
                  <div>
                    {/* Top Concept Metadata Badges */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full border uppercase ${
                        c.series === 'Nova' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' : 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40'
                      }`}>
                        #{c.id} • {c.series}
                      </span>

                      <span className="text-[9px] font-mono font-black bg-zinc-800 text-amber-300 px-2 py-0.5 rounded-full">
                        {c.genre}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-white uppercase tracking-wider">{c.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1.5 font-medium leading-relaxed">{c.description}</p>

                    {/* Features list tags */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      <span className="text-[8px] font-mono bg-white/5 border border-white/10 text-zinc-300 px-1.5 py-0.5 rounded">
                        🌐 {c.worldBiome}
                      </span>
                      <span className="text-[8px] font-mono bg-white/5 border border-white/10 text-emerald-300 px-1.5 py-0.5 rounded">
                        🎮 {c.multiplayerMode}
                      </span>
                      <span className="text-[8px] font-mono bg-white/5 border border-white/10 text-amber-300 px-1.5 py-0.5 rounded">
                        🔥 {c.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setInspectConcept(c)}
                      className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-black uppercase text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> INSPECT
                    </button>

                    <button
                      onClick={() => handleStartPlaytest(c)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        c.series === 'Nova' 
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                          : 'bg-fuchsia-500 hover:bg-fuchsia-400 text-white shadow-[0_0_10px_rgba(217,70,239,0.3)]'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> PLAYTEST
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-zinc-950 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">
              Page {currentPage} of {totalPages} ({filteredConcepts.length} concepts)
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-xs font-black text-white cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> PREV
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-xs font-black text-white cursor-pointer flex items-center gap-1"
              >
                NEXT <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* INSPECT MODAL */}
      {inspectConcept && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-zinc-950 border border-cyan-400/40 rounded-3xl p-6 space-y-4 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative">
            <button
              onClick={() => setInspectConcept(null)}
              className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-2.5 py-0.5 rounded-full">
                CONCEPT #{inspectConcept.id}
              </span>
              <span className="text-xs font-mono font-black bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/40 px-2.5 py-0.5 rounded-full">
                SERIES: {inspectConcept.series}
              </span>
              <span className="text-xs font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full">
                GENRE: {inspectConcept.genre}
              </span>
            </div>

            <h3 className="text-xl font-black text-white uppercase">{inspectConcept.title}</h3>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">{inspectConcept.description}</p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[10px] font-black text-cyan-400 uppercase">World Biome</span>
                <p className="text-xs font-bold text-white mt-0.5">{inspectConcept.worldBiome}</p>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[10px] font-black text-fuchsia-400 uppercase">Multiplayer Mode</span>
                <p className="text-xs font-bold text-white mt-0.5">{inspectConcept.multiplayerMode}</p>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[10px] font-black text-amber-400 uppercase">Missions & Secrets</span>
                <p className="text-xs font-bold text-white mt-0.5">{inspectConcept.missionsCount} Missions / {inspectConcept.secretsCount} Secrets</p>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[10px] font-black text-emerald-400 uppercase">Hero Ability</span>
                <p className="text-xs font-bold text-white mt-0.5">{inspectConcept.featuredSkill}</p>
              </div>
            </div>

            <div className="p-3 bg-zinc-900 border border-white/10 rounded-2xl">
              <span className="text-[10px] font-black text-zinc-400 uppercase block mb-1">Core Gameplay Mechanics</span>
              <ul className="text-xs text-zinc-300 space-y-1">
                {inspectConcept.mechanics.map((m, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleExportGDD(inspectConcept)}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" /> EXPORT GAME DESIGN DOC (GDD)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLAYTEST SIMULATOR MODAL */}
      {playtestConcept && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl bg-zinc-950 border border-fuchsia-500/40 rounded-3xl p-6 space-y-4 shadow-[0_0_60px_rgba(217,70,239,0.3)] relative">
            <button
              onClick={() => setPlaytestConcept(null)}
              className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-fuchsia-400 animate-spin" />
              <h3 className="text-base font-black text-white uppercase">SIMULATING {playtestConcept.title}</h3>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono font-bold text-fuchsia-300 uppercase">
                <span>SIMULATION SYNC</span>
                <span>{playtestProgress}%</span>
              </div>
              <div className="w-full h-3 bg-zinc-900 rounded-full border border-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 transition-all duration-300"
                  style={{ width: `${playtestProgress}%` }}
                />
              </div>
            </div>

            {/* Live Log Window */}
            <div className="p-4 bg-black/90 border border-white/10 rounded-2xl h-48 overflow-y-auto font-mono text-xs space-y-2 text-cyan-300 custom-scrollbar">
              {playtestLog.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>

            <button
              onClick={() => setPlaytestConcept(null)}
              disabled={isSimulating}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white font-black text-xs uppercase cursor-pointer"
            >
              {isSimulating ? 'SIMULATION IN PROGRESS...' : 'CLOSE SIMULATOR'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
