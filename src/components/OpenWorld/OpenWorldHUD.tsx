import React, { useState } from 'react';
import { 
  Compass, 
  Car, 
  Flame, 
  Shield, 
  MapPin, 
  Sparkles, 
  Zap, 
  Droplets, 
  Radio, 
  Users, 
  PenTool, 
  X, 
  ChevronRight, 
  RotateCcw,
  Plus,
  Play,
  Share2,
  Wind,
  Layers,
  Sword,
  Crosshair,
  Volume2
} from 'lucide-react';
import { BIOME_ZONES, MEGA_VEHICLES, TITAN_TRANSFORMATIONS, CLAN_TERRITORIES } from './configs';
import { BiomeId, MegaVehicleType, TransformationId } from './types';
import { useGameStore } from '../../store';
import { soundService } from '../../services/soundService';

interface OpenWorldHUDProps {
  onSpawnVehicle: (type: MegaVehicleType) => void;
  onActivateTransformation: (id: TransformationId) => void;
  onDeactivateTransformation: () => void;
  activeTransformation: TransformationId | null;
  isFloodActive: boolean;
  onToggleFlood: () => void;
  onAddMapObject: (name: string, category: any) => void;
}

export const OpenWorldHUD: React.FC<OpenWorldHUDProps> = ({
  onSpawnVehicle,
  onActivateTransformation,
  onDeactivateTransformation,
  activeTransformation,
  isFloodActive,
  onToggleFlood,
  onAddMapObject
}) => {
  const [activeModal, setActiveModal] = useState<
    'map' | 'vehicles' | 'titans' | 'powers' | 'creatures' | 'clans' | 'creator' | 'events' | null
  >(null);

  const [vehicleCategory, setVehicleCategory] = useState<'all' | 'land' | 'air' | 'water' | 'futuristic'>('all');
  const playerPos = useGameStore(state => state.playerPosition);
  const currentVehicleId = useGameStore(state => state.currentVehicleId);
  const exitVehicle = useGameStore(state => state.exitVehicle);

  // Determine current biome based on player coordinates
  const currentBiome = BIOME_ZONES.reduce((closest, zone) => {
    const distToZone = Math.hypot(playerPos[0] - zone.coordinates[0], playerPos[2] - zone.coordinates[2]);
    const distToClosest = Math.hypot(playerPos[0] - closest.coordinates[0], playerPos[2] - closest.coordinates[2]);
    return distToZone < distToClosest ? zone : closest;
  }, BIOME_ZONES[0]);

  // Fast Travel handler
  const handleFastTravel = (coords: [number, number, number], name: string) => {
    soundService.playSFX('dimension_shift');
    useGameStore.getState().setPlayerPosition([coords[0], coords[1] + 2, coords[2]]);
    useGameStore.getState().addEvent(`🌀 FAST TRAVELED TO ${name.toUpperCase()}`);
    setActiveModal(null);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-3 sm:p-5 select-none font-sans">
      {/* 1. TOP HEADER: COMPASS, BIOME GPS & STATS */}
      <div className="flex justify-between items-start w-full">
        {/* Current Biome & Coordinates Banner */}
        <div className="pointer-events-auto bg-black/85 backdrop-blur-md border border-cyan-500/40 rounded-2xl px-4 py-2.5 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <Compass size={16} className="text-cyan-400" />
              <span className="text-cyan-300 font-black text-sm uppercase tracking-wider">
                {currentBiome.name}
              </span>
            </div>
            <div className="text-xs text-white/60 font-mono flex gap-2">
              <span>X: {Math.round(playerPos[0])}</span>
              <span>Y: {Math.round(playerPos[1])}</span>
              <span>Z: {Math.round(playerPos[2])}</span>
            </div>
          </div>
        </div>

        {/* Flood Alert Status if Active */}
        {isFloodActive && (
          <div className="pointer-events-auto bg-red-950/90 border border-red-500 rounded-2xl px-4 py-2 animate-bounce flex items-center gap-3 shadow-[0_0_25px_rgba(239,68,68,0.5)]">
            <Droplets className="text-red-400 animate-pulse" size={20} />
            <div>
              <div className="text-red-300 font-black text-xs uppercase tracking-widest">
                WARNING: THE GREAT FLOOD ACTIVE
              </div>
              <div className="text-white text-xs">
                CLIMB TO SKYSCRAPERS OR MOUNTAINS!
              </div>
            </div>
          </div>
        )}

        {/* Active Titan / Vehicle Status Bar */}
        <div className="flex gap-2">
          {activeTransformation && (
            <button
              onClick={onDeactivateTransformation}
              className="pointer-events-auto bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-black px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
            >
              <Flame size={16} />
              Revert Titan Form
            </button>
          )}

          {currentVehicleId && (
            <button
              onClick={exitVehicle}
              className="pointer-events-auto bg-red-600 hover:bg-red-500 text-white text-xs font-black px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
            >
              <Car size={16} />
              Exit Vehicle [E]
            </button>
          )}
        </div>
      </div>

      {/* 2. RIGHT-SIDE FLOATING SANDBOX QUICK LAUNCHER DOCK */}
      <div className="pointer-events-auto self-end flex flex-col gap-2.5 bg-black/85 backdrop-blur-xl border border-white/15 p-2 rounded-2xl shadow-2xl">
        <button
          onClick={() => { soundService.playSFX('ui_tab'); setActiveModal('map'); }}
          title="World Map & Fast Travel"
          className="p-3 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded-xl transition-all hover:scale-105"
        >
          <MapPin size={22} />
        </button>

        <button
          onClick={() => { soundService.playSFX('ui_tab'); setActiveModal('vehicles'); }}
          title="Vehicle Garage & Spawner"
          className="p-3 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 rounded-xl transition-all hover:scale-105"
        >
          <Car size={22} />
        </button>

        <button
          onClick={() => { soundService.playSFX('ui_tab'); setActiveModal('titans'); }}
          title="Titan & Anime Transformations"
          className="p-3 bg-orange-500/20 hover:bg-orange-500/40 text-orange-300 rounded-xl transition-all hover:scale-105"
        >
          <Flame size={22} />
        </button>

        <button
          onClick={() => { soundService.playSFX('ui_tab'); setActiveModal('powers'); }}
          title="Magic Spells & Super Powers"
          className="p-3 bg-fuchsia-500/20 hover:bg-fuchsia-500/40 text-fuchsia-300 rounded-xl transition-all hover:scale-105"
        >
          <Zap size={22} />
        </button>

        <button
          onClick={() => { soundService.playSFX('ui_tab'); setActiveModal('creatures'); }}
          title="Dino & Dragon Mounts"
          className="p-3 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 rounded-xl transition-all hover:scale-105"
        >
          <Sparkles size={22} />
        </button>

        <button
          onClick={() => { soundService.playSFX('ui_tab'); setActiveModal('events'); }}
          title="Dynamic World Events"
          className="p-3 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-xl transition-all hover:scale-105"
        >
          <Radio size={22} />
        </button>

        <button
          onClick={() => { soundService.playSFX('ui_tab'); setActiveModal('clans'); }}
          title="Clan Territory Battles"
          className="p-3 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded-xl transition-all hover:scale-105"
        >
          <Users size={22} />
        </button>

        <button
          onClick={() => { soundService.playSFX('ui_tab'); setActiveModal('creator'); }}
          title="Custom Map Creator Studio"
          className="p-3 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-xl transition-all hover:scale-105"
        >
          <PenTool size={22} />
        </button>

        <button
          onClick={() => {
            soundService.playSFX('ui_click');
            onToggleFlood();
          }}
          title="Toggle The Great Flood Mode"
          className={`p-3 rounded-xl transition-all hover:scale-105 ${
            isFloodActive 
              ? 'bg-red-600 text-white animate-pulse' 
              : 'bg-sky-500/20 hover:bg-sky-500/40 text-sky-300'
          }`}
        >
          <Droplets size={22} />
        </button>
      </div>

      {/* 3. MODAL POPUPS FOR EACH SANDBOX TOOL */}
      {activeModal && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-950 border border-white/20 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-y-auto p-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-white uppercase tracking-wider">
                  {activeModal === 'map' && '🌎 WORLD MAP & BIOME FAST-TRAVEL'}
                  {activeModal === 'vehicles' && '🚗 MEGA VEHICLE GARAGE & SPAWNER'}
                  {activeModal === 'titans' && '👹 TITAN & ANIME TRANSFORMATIONS'}
                  {activeModal === 'powers' && '✨ SUPER POWERS & ELEMENTAL MAGIC'}
                  {activeModal === 'creatures' && '🦖 CREATURES & DINOSAUR MOUNTS'}
                  {activeModal === 'events' && '⚡ DYNAMIC WORLD EVENTS CONTROLLER'}
                  {activeModal === 'clans' && '🏴 CLAN TERRITORY CONQUEST'}
                  {activeModal === 'creator' && '🗺️ NEON ARENA MAP CREATOR STUDIO'}
                </span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* MODAL 1: WORLD MAP & BIOMES */}
            {activeModal === 'map' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {BIOME_ZONES.map((zone) => (
                  <div
                    key={zone.id}
                    style={{ borderColor: zone.color }}
                    className="border rounded-2xl p-4 bg-zinc-900/60 hover:bg-zinc-900 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 style={{ color: zone.color }} className="font-black text-lg">
                          {zone.name}
                        </h4>
                      </div>
                      <p className="text-xs text-white/70 mb-3">{zone.subtitle}</p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {zone.features.map((f, i) => (
                          <span key={i} className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded-md">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleFastTravel(zone.coordinates, zone.name)}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      <MapPin size={14} />
                      Fast Travel Teleport
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* MODAL 2: VEHICLE GARAGE */}
            {activeModal === 'vehicles' && (
              <div>
                {/* Category Filters */}
                <div className="flex gap-2 mb-4">
                  {(['all', 'land', 'air', 'water', 'futuristic'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setVehicleCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                        vehicleCategory === cat
                          ? 'bg-cyan-500 text-black'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MEGA_VEHICLES
                    .filter(v => vehicleCategory === 'all' || v.category === vehicleCategory)
                    .map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="border border-white/15 rounded-2xl p-4 bg-zinc-900/60 hover:border-cyan-500 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-black text-base text-white">{vehicle.name}</span>
                            <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded">
                              {vehicle.category}
                            </span>
                          </div>
                          <p className="text-xs text-white/60 mb-3">{vehicle.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-white/80 font-mono mb-4">
                            <div>Speed: <span className="text-cyan-400">{vehicle.topSpeedKmH} km/h</span></div>
                            <div>Armor: <span className="text-emerald-400">{vehicle.armor} HP</span></div>
                            <div>Weapon: <span className="text-yellow-400 uppercase">{vehicle.weaponType}</span></div>
                            <div>Accel: <span className="text-purple-400">{vehicle.acceleration}/10</span></div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            soundService.playSFX('powerup');
                            onSpawnVehicle(vehicle.id);
                            useGameStore.getState().addEvent(`🚗 SPAWNED ${vehicle.name.toUpperCase()}!`);
                            setActiveModal(null);
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 transition-all"
                        >
                          <Play size={14} />
                          Spawn & Drive
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* MODAL 3: TITAN TRANSFORMATIONS */}
            {activeModal === 'titans' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TITAN_TRANSFORMATIONS.map((titan) => (
                  <div
                    key={titan.id}
                    style={{ borderColor: titan.auraColor }}
                    className="border rounded-2xl p-5 bg-zinc-900/60 hover:bg-zinc-900 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 style={{ color: titan.auraColor }} className="font-black text-xl">
                          {titan.name}
                        </h4>
                        <span className="text-xs text-white/50">{titan.source}</span>
                      </div>
                      <p className="text-xs text-white/70 mb-3">{titan.description}</p>
                      <div className="bg-black/40 rounded-xl p-3 mb-4 space-y-1 text-xs">
                        <div className="text-amber-400 font-bold">
                          Primary: <span className="text-white font-normal">{titan.primaryAttack}</span>
                        </div>
                        <div className="text-red-400 font-bold">
                          Ultimate: <span className="text-white font-normal">{titan.ultimateAttack}</span>
                        </div>
                        <div className="text-cyan-400 font-bold">
                          Scale: <span className="text-white font-normal">{titan.heightMultiplier}x Normal Size</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        soundService.playSFX('explosion');
                        onActivateTransformation(titan.id);
                        useGameStore.getState().addEvent(`👹 TRANSFORMED INTO ${titan.name.toUpperCase()}!`);
                        setActiveModal(null);
                      }}
                      style={{ backgroundColor: titan.auraColor }}
                      className="w-full text-black font-black text-xs py-2.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                    >
                      <Flame size={16} />
                      Awaken Titan Transformation
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* MODAL 4: SUPER POWERS & MAGIC */}
            {activeModal === 'powers' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'Fireball Inferno', icon: Flame, color: 'text-orange-400', desc: 'Hurl cascading explosive fireballs shattering terrain.' },
                  { name: 'Subzero Ice Wall', icon: Droplets, color: 'text-cyan-400', desc: 'Erect frozen crystal shields blocking enemy fire.' },
                  { name: 'Lightning Thunderstrike', icon: Zap, color: 'text-yellow-400', desc: 'Call down targeted orbital lightning strikes.' },
                  { name: 'Sonic Super Speed', icon: Wind, color: 'text-emerald-400', desc: 'Gain 400% sprint velocity with sonic dash trail.' },
                  { name: 'Levitation Flight', icon: Layers, color: 'text-purple-400', desc: 'Fly freely above skyscrapers and mountains.' },
                  { name: 'Kinetic Teleport', icon: MapPin, color: 'text-fuchsia-400', desc: 'Instantly warp 40 meters forward in eye direction.' }
                ].map((power, idx) => {
                  const Icon = power.icon;
                  return (
                    <div key={idx} className="border border-white/15 rounded-2xl p-4 bg-zinc-900/60 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon size={20} className={power.color} />
                          <span className="font-bold text-white text-base">{power.name}</span>
                        </div>
                        <p className="text-xs text-white/70 mb-4">{power.desc}</p>
                      </div>
                      <button
                        onClick={() => {
                          soundService.playSFX('spell');
                          useGameStore.getState().addEvent(`✨ CAST ${power.name.toUpperCase()}!`);
                          setActiveModal(null);
                        }}
                        className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2 rounded-xl transition-all"
                      >
                        Equip Power
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* MODAL 5: CREATURES & DINOS */}
            {activeModal === 'creatures' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Apex Tyrannosaurus Rex', type: 't_rex', desc: 'Colossal apex dinosaur. Ground-shaking stomps and bite attacks.', coords: [-240, 2, 120] },
                  { name: 'Swiftclaw Velociraptor', type: 'velociraptor', desc: 'Agile prehistoric pack hunter. Fast mount for cross-country exploration.', coords: [-270, 2, 90] },
                  { name: 'Ignis Prime Fire Wyvern', type: 'fire_dragon', desc: 'Legendary winged dragon capable of high-altitude flight and fire breath.', coords: [260, 22, 220] },
                  { name: 'Shadowfang Dire Wolf', type: 'dire_wolf', desc: 'Fierce canine companion following you into combat.', coords: [200, 2, 180] }
                ].map((creature, idx) => (
                  <div key={idx} className="border border-white/15 rounded-2xl p-4 bg-zinc-900/60 flex flex-col justify-between">
                    <div>
                      <h4 className="text-amber-400 font-black text-lg mb-1">{creature.name}</h4>
                      <p className="text-xs text-white/70 mb-4">{creature.desc}</p>
                    </div>
                    <button
                      onClick={() => handleFastTravel(creature.coords as [number, number, number], creature.name)}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs py-2 rounded-xl transition-all"
                    >
                      Teleport to {creature.name}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* MODAL 6: MAP CREATOR STUDIO */}
            {activeModal === 'creator' && (
              <div>
                <div className="text-sm text-white/70 mb-4">
                  Place 3D assets directly into the sandbox world to craft custom cities, arenas, stunt ramps, and battle tracks!
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                  {[
                    { name: 'Skyscraper Tower', cat: 'building' },
                    { name: 'Military Bunker', cat: 'military' },
                    { name: 'Mega Jump Ramp', cat: 'interactive' },
                    { name: 'Stunt Loop Track', cat: 'interactive' },
                    { name: 'Pine Tree', cat: 'nature' },
                    { name: 'Neon Jump Pad', cat: 'interactive' },
                    { name: 'Energy Shield Turret', cat: 'military' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        soundService.playSFX('ui_click');
                        onAddMapObject(item.name, item.cat);
                        useGameStore.getState().addEvent(`🔨 PLACED ${item.name.toUpperCase()}!`);
                      }}
                      className="border border-white/15 hover:border-cyan-400 rounded-xl p-3 bg-zinc-900 text-left hover:scale-105 transition-all"
                    >
                      <span className="font-bold text-xs text-white block">{item.name}</span>
                      <span className="text-[10px] text-cyan-400 uppercase">{item.cat}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* MODAL 7: CLAN TERRITORIES */}
            {activeModal === 'clans' && (
              <div className="space-y-3">
                {CLAN_TERRITORIES.map((territory) => (
                  <div key={territory.id} className="border border-white/15 rounded-2xl p-4 bg-zinc-900 flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-bold text-base">{territory.name}</h4>
                      <p className="text-xs text-white/60">
                        Capture Radius: {territory.radius}m | Income: +{territory.incomePerMinute} Gold/min
                      </p>
                    </div>
                    <button
                      onClick={() => handleFastTravel(territory.position, territory.name)}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                    >
                      Travel to Territory
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* MODAL 8: DYNAMIC EVENTS */}
            {activeModal === 'events' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Golden Supply Airdrop', desc: 'Military jet parachutes a legendary weapon crate.' },
                  { name: 'Food Rain From The Sky', desc: 'Giant burgers, pizzas and potions shower down.' },
                  { name: 'Colossal Titan World Boss', desc: 'Gigas the Destroyer awakens in the Colosseum.' },
                  { name: 'Cosmic Meteor Shower', desc: 'Glowing meteorites crash into the desert.' }
                ].map((ev, idx) => (
                  <div key={idx} className="border border-white/15 rounded-2xl p-4 bg-zinc-900 flex flex-col justify-between">
                    <div>
                      <h4 className="text-purple-400 font-bold text-base mb-1">{ev.name}</h4>
                      <p className="text-xs text-white/70 mb-4">{ev.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        soundService.playSFX('achievement');
                        useGameStore.getState().addEvent(`⚡ TRIGGERED EVENT: ${ev.name.toUpperCase()}!`);
                        setActiveModal(null);
                      }}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 rounded-xl transition-all"
                    >
                      Trigger Event Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
