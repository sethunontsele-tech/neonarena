import React, { useEffect } from 'react';
import { useGameStore, MapType } from '../store';
import { Vote, Check, Users, Sparkles } from 'lucide-react';
import { ARENA_MAPS } from '../data/arenaMaps';

interface MapDetails {
  name: string;
  desc: string;
  gradient: string;
  badge: string;
}

const MAP_INFO_DIRECTORY: Record<string, MapDetails> = {
  maze: {
    name: 'Tactical Labyrinth',
    desc: 'Winding corridors and blind corners. Perfect for shotgun ambushes.',
    gradient: 'from-cyan-950 via-zinc-900 to-black border-cyan-500/20',
    badge: 'CQC FOCUS'
  },
  arena: {
    name: 'Gladiator Arena',
    desc: 'Symmetrical open-air arena. Settle scores with raw skill.',
    gradient: 'from-red-950 via-zinc-900 to-black border-red-500/20',
    badge: 'SYMMETRICAL'
  },
  pillars: {
    name: 'Monolith Pillars',
    desc: 'Towering stone pillars. Great verticality and sniper vantage points.',
    gradient: 'from-violet-950 via-zinc-900 to-black border-violet-500/20',
    badge: 'VERTICAL'
  },
  flat: {
    name: 'Infinite Flatlands',
    desc: 'Raw open layout. No barriers, maximum visibility.',
    gradient: 'from-slate-900 via-zinc-950 to-black border-slate-500/20',
    badge: 'RAW AIM'
  },
  void: {
    name: 'Space Rift Void',
    desc: 'Floating platforms over a cosmic abyss. Watch your step!',
    gradient: 'from-indigo-950 via-zinc-900 to-black border-indigo-500/20',
    badge: 'HAZARDOUS'
  },
  cybercity: {
    name: 'Cybercity Grid',
    desc: 'Rain-soaked futuristic alleyways under bright neon holograms.',
    gradient: 'from-fuchsia-950 via-zinc-900 to-black border-fuchsia-500/20',
    badge: 'NEON NIGHT'
  },
  volcano: {
    name: 'Magma Core Volcano',
    desc: 'Bubbling rivers of lava and narrow basalt bridges.',
    gradient: 'from-orange-950 via-zinc-900 to-black border-orange-500/20',
    badge: 'VOLATILE'
  },
  infinite: {
    name: 'Procedural Terrain',
    desc: 'Vast, infinite biome. Perfect for exploration and base-building.',
    gradient: 'from-emerald-950 via-zinc-900 to-black border-emerald-500/20',
    badge: 'OPEN WORLD'
  },
  neon_grid: {
    name: 'Neon Grid Vector',
    desc: 'A retro-futuristic digital matrix with hyper-speed navigation.',
    gradient: 'from-blue-950 via-zinc-900 to-black border-blue-500/20',
    badge: 'VIRTUAL CORE'
  },
  quantum_rift: {
    name: 'Quantum Rift Portal',
    desc: 'Reality-bending gravity fractures and interdimensional tunnels.',
    gradient: 'from-purple-950 via-zinc-900 to-black border-purple-500/20',
    badge: 'GRAVITY WARP'
  },
  custom_scan: {
    name: 'Tactical 3D Scan',
    desc: 'A high-fidelity 3D replicated scan of structural remains.',
    gradient: 'from-amber-950 via-zinc-900 to-black border-amber-500/20',
    badge: '3D SCAN'
  },
  aurum_dominion: {
    name: 'Aurum Citadel',
    desc: 'The golden base of operations. Packed with heavy tactical resources.',
    gradient: 'from-yellow-950 via-zinc-900 to-black border-yellow-500/20',
    badge: 'GOLD DOMINION'
  },
  infinity_academy: {
    name: 'Infinity Academy',
    desc: 'A futuristic virtual combat academy designed for master classes.',
    gradient: 'from-rose-950 via-zinc-900 to-black border-rose-500/20',
    badge: 'SIMULATION'
  }
};

export function MapVotingPanel() {
  const mapVotingOptions = useGameStore(state => state.mapVotingOptions);
  const mapVotes = useGameStore(state => state.mapVotes);
  const playerVotedMap = useGameStore(state => state.playerVotedMap);
  const generateMapVotingOptions = useGameStore(state => state.generateMapVotingOptions);
  const voteForMap = useGameStore(state => state.voteForMap);
  const setMap = useGameStore(state => state.setMap);

  // Fallback map data in case options are empty (e.g., entered lobby directly)
  useEffect(() => {
    if (!mapVotingOptions || mapVotingOptions.length === 0) {
      generateMapVotingOptions();
    }
  }, [mapVotingOptions, generateMapVotingOptions]);

  // Simulate passive vote updates from other players to make the lobby feel active!
  useEffect(() => {
    const interval = setInterval(() => {
      if (!mapVotingOptions || mapVotingOptions.length === 0) return;

      // 15% chance another squadmate updates their vote
      if (Math.random() < 0.25) {
        const randomMap = mapVotingOptions[Math.floor(Math.random() * mapVotingOptions.length)];
        const currentVotes = useGameStore.getState().mapVotes;
        
        // Update the vote count in the store directly
        const updatedVotes = { ...currentVotes };
        updatedVotes[randomMap] = (updatedVotes[randomMap] || 0) + 1;
        
        useGameStore.setState({ mapVotes: updatedVotes });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [mapVotingOptions]);

  // Synchronize the selectedMap in store with the winning map vote
  useEffect(() => {
    if (!mapVotingOptions || mapVotingOptions.length === 0) return;

    // Find map with highest votes
    let winningMap = mapVotingOptions[0];
    let maxVotes = -1;

    mapVotingOptions.forEach(map => {
      const votes = mapVotes[map] || 0;
      if (votes > maxVotes) {
        maxVotes = votes;
        winningMap = map;
      }
    });

    // Quietly update selectedMap in the background so that launch uses it
    setMap(winningMap);
  }, [mapVotes, mapVotingOptions, setMap]);

  if (!mapVotingOptions || mapVotingOptions.length === 0) return null;

  // Calculate total votes for percentage progress
  const totalVotes = mapVotingOptions.reduce((acc, curr) => acc + (mapVotes[curr] || 0), 0);

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden flex flex-col gap-4">
      {/* Background glow lines */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 blur-[40px] rounded-full" />
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Vote className="w-4 h-4 text-amber-400 animate-bounce" />
          <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase font-sans">
            ARENA DECISION INTERFACE
          </span>
        </div>
        <div className="flex items-center gap-1 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
          <span className="text-[8px] font-mono text-amber-300 font-bold uppercase">NEXT MISSION ARENA</span>
        </div>
      </div>

      <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider -mt-1">
        Cast your vote below. The arena with the highest consensus is automatically selected for deployment.
      </p>

      {/* Map Choice List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {mapVotingOptions.map((map) => {
          const customMap = ARENA_MAPS.find(m => m.id === map);
          const info = customMap ? {
            name: `${customMap.name} (${customMap.year})`,
            desc: customMap.desc,
            gradient: customMap.gradient,
            badge: customMap.badge.toUpperCase()
          } : MAP_INFO_DIRECTORY[map] || {
            name: map.toUpperCase().replace('_', ' '),
            desc: 'Classified combat tactical environment.',
            gradient: 'from-zinc-900 to-black border-white/10',
            badge: 'CLASSIFIED'
          };

          const votes = mapVotes[map] || 0;
          const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          const isSelected = playerVotedMap === map;

          return (
            <button
              key={map}
              onClick={() => voteForMap(map)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-500/15 via-zinc-950 to-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)] scale-[1.01]'
                  : 'bg-gradient-to-b ' + info.gradient + ' hover:border-white/20 hover:bg-white/5 hover:scale-[1.005]'
              }`}
            >
              {/* Card Accent Top border highlight */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-300" />
              )}

              <div className="flex flex-col gap-1 w-full mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black tracking-widest text-white/30 uppercase font-mono">
                    {info.badge}
                  </span>
                  
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[8px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-black uppercase font-mono">
                      <Check className="w-2.5 h-2.5 stroke-[3]" /> Voted
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-black text-white uppercase italic tracking-tight group-hover:text-amber-400 transition-colors">
                  {info.name}
                </h3>
                
                <p className="text-[9px] text-white/50 leading-relaxed font-semibold">
                  {info.desc}
                </p>

                {customMap && (
                  <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1 text-[8px] text-white/40 uppercase font-mono tracking-wider">
                    <div className="flex justify-between">
                      <span>Creator: <strong className="text-white/60">{customMap.creator}</strong></span>
                      <span>Platform: <strong className="text-white/60">{customMap.platform}</strong></span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rating: <strong className="text-white/60">{customMap.rating}</strong></span>
                      <span>Award: <strong className="text-white/60">{customMap.award}</strong></span>
                    </div>
                    <div className="flex justify-between">
                      <span>Players: <strong className="text-white/60">{customMap.players}</strong></span>
                      <span>Diff: <strong className="text-white/60">{customMap.difficulty}</strong></span>
                    </div>
                    <div className="mt-1 truncate">
                      Servers: <span className="text-amber-400/80">{customMap.servers.join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Vote Count & Progress Bar Section */}
              <div className="w-full mt-2">
                <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                  <span className="text-white/40 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {votes} {votes === 1 ? 'operator' : 'operators'}
                  </span>
                  <span className={isSelected ? 'text-amber-400 font-bold' : 'text-white/60 font-semibold'}>
                    {percentage}%
                  </span>
                </div>
                
                {/* Horizontal Progress Bar */}
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-300' 
                        : 'bg-white/20'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
