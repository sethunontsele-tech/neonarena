import React, { useState } from 'react';
import { CustomMap } from './types';
import { Search, Star, Heart, Play, TrendingUp, Sparkles, Trophy, Clock, User, ArrowLeft, Filter } from 'lucide-react';

interface FreerunCommunityHubProps {
  onPlayMap: (map: CustomMap) => void;
  onClose: () => void;
}

export const PRESET_COMMUNITY_MAPS: CustomMap[] = [
  {
    id: 'map_skyline_rush',
    title: 'Skyline Rush 2088',
    author: 'TraceurZero',
    category: 'Rooftop Race',
    difficulty: 'Hard',
    description: 'High-speed flow course connecting 14 elevated rooftops via narrow cranes and neon grind pipes.',
    spawnPoint: [-35, 46, -50],
    checkpoints: [
      [-35, 46, -50],
      [0, 66, 0],
      [35, 51, -50],
      [70, 36, 25],
      [0, 41, -85]
    ],
    likes: 3420,
    plays: 18950,
    rating: 4.9,
    createdAt: '2 days ago',
    objects: [
      { id: 'cm_1', type: 'grind_rail', position: [-15, 55, -25], rotation: [0, 0.4, 0], scale: [0.3, 0.4, 30], color: '#06b6d4', isCollidable: true, isVaultable: true },
      { id: 'cm_2', type: 'launch_pad', position: [15, 50, -30], rotation: [0, 0, 0], scale: [3, 0.3, 3], color: '#f59e0b', isCollidable: true, launchPower: 26 },
      { id: 'cm_3', type: 'wall', position: [45, 40, 0], rotation: [0, 0.8, 0], scale: [0.4, 8, 16], color: '#0ea5e9', isCollidable: true, isWallrunnable: true },
    ]
  },
  {
    id: 'map_vertigo_spires',
    title: 'The Vertigo Spires',
    author: 'ApexPhantom',
    category: 'Parkour Tower',
    difficulty: 'Extreme',
    description: 'A 140-meter vertical ascent up needle towers requiring precise wall-climbs and backward eject jumps.',
    spawnPoint: [0, 15, 30],
    checkpoints: [
      [0, 15, 30],
      [0, 45, 10],
      [0, 85, 0],
      [0, 130, 0]
    ],
    likes: 5120,
    plays: 28400,
    rating: 5.0,
    createdAt: '1 week ago',
    objects: [
      { id: 'cm_4', type: 'wall', position: [0, 60, 5], rotation: [0, 0, 0], scale: [0.4, 35, 8], color: '#38bdf8', isCollidable: true, isWallrunnable: true },
      { id: 'cm_5', type: 'platform', position: [0, 95, 0], rotation: [0, 0, 0], scale: [6, 0.5, 6], color: '#facc15', isCollidable: true },
    ]
  },
  {
    id: 'map_trick_colosseum',
    title: 'Neon Trick Colosseum',
    author: 'NovaGlider',
    category: 'Trick Arena',
    difficulty: 'Medium',
    description: 'Huge multi-tiered bowl filled with ramps, vault boxes, and fan vents designed for 100,000+ combo streaks.',
    spawnPoint: [0, 20, 90],
    checkpoints: [],
    likes: 2790,
    plays: 14100,
    rating: 4.8,
    createdAt: '3 days ago',
    objects: [
      { id: 'cm_6', type: 'launch_pad', position: [-10, 21, 90], rotation: [0, 0, 0], scale: [3, 0.3, 3], color: '#ec4899', isCollidable: true, launchPower: 24 },
      { id: 'cm_7', type: 'pipe', position: [0, 26, 90], rotation: [0, 0, 0], scale: [0.2, 0.2, 20], color: '#06b6d4', isCollidable: true },
    ]
  },
  {
    id: 'map_mirrors_edge',
    title: 'City of Glass Legacy',
    author: 'Faith_Traceur',
    category: 'Obstacle Course',
    difficulty: 'Hard',
    description: 'Pristine white and red rooftop gauntlet inspired by classic freerunning with strict momentum pacing.',
    spawnPoint: [-75, 43, -45],
    checkpoints: [
      [-75, 43, -45],
      [-35, 46, -50],
      [0, 66, 0]
    ],
    likes: 8900,
    plays: 49500,
    rating: 4.9,
    createdAt: '2 weeks ago',
    objects: [
      { id: 'cm_8', type: 'ramp', position: [-55, 44, -48], rotation: [0, 0.3, 0], scale: [4, 3, 10], color: '#ef4444', isCollidable: true },
      { id: 'cm_9', type: 'wall', position: [-40, 48, -48], rotation: [0, 0, 0], scale: [0.4, 7, 14], color: '#ef4444', isCollidable: true, isWallrunnable: true },
    ]
  }
];

export function FreerunCommunityHub({
  onPlayMap,
  onClose
}: FreerunCommunityHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const filteredMaps = PRESET_COMMUNITY_MAPS.filter(map => {
    const matchesSearch = map.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          map.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || map.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl z-40 flex flex-col p-4 sm:p-8 overflow-y-auto custom-scrollbar">
      {/* TOP HEADER */}
      <div className="flex flex-wrap items-center justify-between pb-6 border-b border-white/10 max-w-6xl mx-auto w-full gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
              <TrendingUp size={14} /> NEON ARENA COMMUNITY HUB
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic">Explore Player-Created Courses</h2>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 w-full sm:w-80">
          <Search size={18} className="text-white/40 mr-2" />
          <input
            type="text"
            placeholder="Search maps or creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-white/40 outline-none w-full"
          />
        </div>
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div className="flex items-center gap-2 max-w-6xl mx-auto w-full py-6 overflow-x-auto custom-scrollbar">
        {['All', 'Rooftop Race', 'Parkour Tower', 'Trick Arena', 'Obstacle Course', 'Favorites'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* MAPS GRID */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-12">
        {filteredMaps.map((map) => (
          <div
            key={map.id}
            className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Header row with Title and Favorite button */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      {map.category}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-xl ${
                      map.difficulty === 'Extreme' ? 'bg-rose-500/20 text-rose-400' :
                      (map.difficulty === 'Hard' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400')
                    }`}>
                      {map.difficulty}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors">
                    {map.title}
                  </h3>
                </div>

                <button
                  onClick={(e) => toggleFavorite(map.id, e)}
                  className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 text-white/50 hover:text-rose-400 transition-colors"
                >
                  <Heart size={18} fill={favorites.includes(map.id) ? '#f43f5e' : 'none'} className={favorites.includes(map.id) ? 'text-rose-500' : ''} />
                </button>
              </div>

              {/* Creator Info */}
              <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
                <User size={14} />
                <span>Created by <b className="text-white">{map.author}</b></span>
                <span>•</span>
                <span>{map.createdAt}</span>
              </div>

              {/* Description */}
              <p className="text-xs text-white/70 leading-relaxed mb-6">
                {map.description}
              </p>
            </div>

            {/* Bottom Meta & Play Button */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs font-mono text-white/50">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={14} fill="#f59e0b" />
                  <span>{map.rating.toFixed(1)}</span>
                </div>
                <div>{map.plays.toLocaleString()} plays</div>
                <div>{map.likes.toLocaleString()} likes</div>
              </div>

              <button
                onClick={() => onPlayMap(map)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              >
                <Play size={15} fill="black" /> PLAY COURSE
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
