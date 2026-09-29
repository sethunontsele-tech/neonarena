import React, { useState } from 'react';
import { 
  Gamepad2, Play, Download, Trophy, Settings, Sparkles, Activity,
  Sliders, Shield, RefreshCw, CheckCircle2, Film, Camera, Radio
} from 'lucide-react';
import { soundService } from '../../services/soundService';

interface GameEntry {
  id: string;
  title: string;
  category: string;
  sizeGB: string;
  fpsTarget: string;
  rating: string;
  installed: boolean;
  status: string;
  description: string;
}

const GAMES_LIST: GameEntry[] = [
  { id: 'neon_br', title: 'Neon Battle Royale', category: 'Multiplayer Tactical Shooter', sizeGB: '85.5 GB', fpsTarget: '120 FPS', rating: '9.8/10', installed: true, status: 'Ready to Play', description: 'Fast-paced squad survival, unique hero abilities, dynamic zone collapses, and high-velocity neon gunplay.' },
  { id: 'neon_rooftop', title: 'Neon Rooftop Freerun', category: 'Vertical Parkour & Exploration', sizeGB: '45.2 GB', fpsTarget: '144 FPS', rating: '9.6/10', installed: true, status: 'Ready to Play', description: 'Free-flowing momentum parkour, wall-runs, slide-combos, and rooftop competitions across a towering cyberpunk metropolis.' },
  { id: 'neon_extreme', title: 'Neon Extreme Sports', category: 'Open-World Extreme Sports', sizeGB: '52.8 GB', fpsTarget: '120 FPS', rating: '9.5/10', installed: true, status: 'Ready to Play', description: 'Downhill mountain biking, snowboarding down glowing peaks, urban skateboarding, and wingsuit aerial courses.' },
  { id: 'neon_warzone', title: 'Combined-Arms Warzone', category: 'Massive Combined Warfare', sizeGB: '64.0 GB', fpsTarget: '90 FPS', rating: '9.9/10', installed: true, status: 'Ready to Play', description: 'Heavy tanks, supersonic stealth fighter jets, attack gunships, and missile corvettes clashing in all-out total war.' },
  { id: 'cyber_poker', title: 'Cyberpunk High-Stakes Poker', category: 'Casino & Social Strategy', sizeGB: '12.4 GB', fpsTarget: '60 FPS', rating: '9.4/10', installed: true, status: 'Ready to Play', description: 'Holographic cards, chip tricks, multi-table tournaments, and high-stakes social gaming.' },
  { id: 'board_mode', title: 'Board Fantasy Strategy', category: 'Turn-Based Tactics', sizeGB: '18.0 GB', fpsTarget: '60 FPS', rating: '9.3/10', installed: true, status: 'Ready to Play', description: 'Grid-based fantasy tactics, hero class synergies, and elemental spellcraft.' }
];

export const GamingSystemView: React.FC<{ onLaunchGame?: (gameId: string) => void }> = ({ onLaunchGame }) => {
  const [selectedGame, setSelectedGame] = useState<GameEntry>(GAMES_LIST[0]);
  const [perfProfile, setPerfProfile] = useState<'ultra' | 'balanced' | 'competitive'>('competitive');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    soundService.playSFX('achievement');
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-white font-mono select-none overflow-hidden">
      {/* Top Header */}
      <div className="bg-zinc-900 border-b border-indigo-500/30 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/40 rounded-xl text-indigo-400">
            <Gamepad2 size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-indigo-400 uppercase tracking-tight">NEON GAMING SYSTEM & HUB</h2>
              <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/40">
                PRO GAMING ENGINE
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Universal Game Launcher • Cloud Saves • Ray Tracing Profiles • VR & Haptic Calibration
            </p>
          </div>
        </div>

        {/* Performance Mode Selector */}
        <div className="flex bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => { setPerfProfile('competitive'); soundService.playSFX('ui_tab'); }}
            className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all ${
              perfProfile === 'competitive' ? 'bg-indigo-500 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            144 FPS Competitive
          </button>
          <button
            onClick={() => { setPerfProfile('ultra'); soundService.playSFX('ui_tab'); }}
            className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all ${
              perfProfile === 'ultra' ? 'bg-indigo-500 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            4K Ray Tracing
          </button>
          <button
            onClick={() => { setPerfProfile('balanced'); soundService.playSFX('ui_tab'); }}
            className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all ${
              perfProfile === 'balanced' ? 'bg-indigo-500 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Balanced Battery
          </button>
        </div>
      </div>

      {toast && (
        <div className="bg-indigo-400 text-black px-4 py-1.5 text-xs font-black tracking-wide text-center uppercase">
          ✓ {toast}
        </div>
      )}

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Column: Game Library */}
        <div className="col-span-5 border-r border-white/10 p-6 space-y-3 overflow-y-auto">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            INSTALLED EXPERIENCES & EXPANSIONS
          </span>

          {GAMES_LIST.map(game => {
            const isSelected = selectedGame.id === game.id;
            return (
              <div
                key={game.id}
                onClick={() => { setSelectedGame(game); soundService.playSFX('ui_click'); }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-500/15 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                    : 'bg-white/5 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-black text-white uppercase">{game.title}</h4>
                  <span className="text-[10px] font-bold text-indigo-400">{game.fpsTarget}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mt-2">
                  <span>{game.category}</span>
                  <span className="text-white font-bold">{game.sizeGB}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Game Details & Launch */}
        <div className="col-span-7 p-6 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                TITLE PROFILE // {selectedGame.category}
              </span>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
                {selectedGame.title}
              </h3>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                {selectedGame.description}
              </p>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-3 gap-3 bg-zinc-900 border border-white/10 rounded-2xl p-4 text-xs">
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">Install Size</span>
                <span className="text-white font-black">{selectedGame.sizeGB}</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">Target FPS</span>
                <span className="text-cyan-400 font-black">{selectedGame.fpsTarget}</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">Cloud Sync</span>
                <span className="text-emerald-400 font-black">Online & Synced</span>
              </div>
            </div>

            {/* Features Enabled */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Multiplayer Server Matchmaking & Cross-Play Ready</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>VR & Passthrough Spatial Computing Enabled</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Unified Cloud Saves & Achievement Progression</span>
              </div>
            </div>
          </div>

          {/* Launch Buttons */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Saved instant 4K high-res screenshot to Gallery.')}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-300"
                title="Capture Screenshot"
              >
                <Camera size={18} />
              </button>
              <button
                onClick={() => showToast('DVR Replay Recording buffer armed.')}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-300"
                title="Record Clip"
              >
                <Film size={18} />
              </button>
            </div>

            <button
              onClick={() => {
                showToast(`Launching ${selectedGame.title}!`);
                if (onLaunchGame) onLaunchGame(selectedGame.id);
              }}
              className="px-8 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-black font-black uppercase text-sm rounded-xl tracking-wider flex items-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all"
            >
              <Play size={18} fill="currentColor" />
              <span>LAUNCH GAME</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
