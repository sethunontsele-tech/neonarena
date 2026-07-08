import React, { useState } from 'react';
import { 
  Sparkles, Bot, Dna, Compass, Award, CheckCircle2, Camera,
  HelpCircle, Volume2, Gamepad2, Laptop, Monitor, Smartphone, 
  Tv, Eye, ChevronRight, Search, Trophy, Users, ShieldAlert, Zap, Layers 
} from 'lucide-react';
import { useEduStore, ControlPlatformType, ActiveDimensionType } from './eduStore';

const vrAppsCatalog = [
  {
    category: '3D Art & Modeling',
    apps: [
      {
        id: 'open_brush',
        name: 'Open Brush',
        desc: 'Paint freely in 3D space with 48 creative brush effects including fire, smoke, and light inside ambient VR canvases.',
        relation: 'Arts District',
        funFact: 'Open Brush is the community successor to Tilt Brush, letting artists sculpt with glowing volumetric strokes.'
      },
      {
        id: 'open_blocks',
        name: 'Open Blocks',
        desc: 'An open-source, block-based 3D modeling application (forked from Google Blocks) for simple geometric structures.',
        relation: 'Math Mountains',
        funFact: 'Swapping complex mouse tools for gestural VR controller tracking makes CAD construction incredibly fun and intuitive.'
      },
      {
        id: 'gravity_sketch',
        name: 'Gravity Sketch',
        desc: 'Professional-grade automotive and industrial design CAD in VR. Supports NURBS, subdivision surfaces, and real-time team reviews.',
        relation: 'Math Mountains',
        funFact: 'Designers can sketch at full physical scale and export their meshes directly to standard OBJ, FBX, or IGES CAD formats.'
      },
      {
        id: 'shapes_xr',
        name: 'ShapesXR',
        desc: 'Rapid mixed-reality UI/UX prototyping and product modeling. Features real-time co-authoring, animations, and Figma/Unity links.',
        relation: 'Coding Island',
        funFact: 'ShapesXR allows cross-device reviews where spatial interfaces can be modified instantly by a whole team of avatars.'
      },
      {
        id: 'sketchup_viewer',
        name: 'SketchUp Viewer',
        desc: 'Allows architecture students and engineering teams to walk through massive SketchUp building plans at a 1-to-1 scale in VR.',
        relation: 'Geography Planet',
        funFact: 'Walking through a blueprint at full scale gives architects an unparalleled intuition of spatial relationships.'
      }
    ]
  },
  {
    category: 'Anatomy & Biology',
    apps: [
      {
        id: 'human_anatomy_vr',
        name: 'Human Anatomy VR',
        desc: 'Interactive human atlas by Visible Body. Explore 15 complete body systems, 13,000 anatomical structures, and 500+ animated movements.',
        relation: 'Biology Kingdom',
        funFact: 'Using "Ant Mode", you can shrink down to a 1:1 scale of organs, dissecting chambers and navigating inside bloodstreams.'
      },
      {
        id: 'organon_3d',
        name: '3D Organon',
        desc: 'Hyper-realistic medical anatomy system. Features virtual body dissection, real-time quiz feedback, and Medverse multiplayer study sessions.',
        relation: 'Biology Kingdom',
        funFact: 'Organon provides hyper-detailed models where parts can be grabbed, rotated, and isolated with high-performance medical accuracy.'
      }
    ]
  },
  {
    category: 'Physics & Engineering Labs',
    apps: [
      {
        id: 'newtons_room',
        name: "Newton's Room",
        desc: "Mixed-reality physical puzzle lab using passthrough cameras. Solve Newtonian mechanics puzzles by interacting with force vectors in your actual room.",
        relation: 'Physics Labs',
        funFact: 'Anchoring vector force blocks on real physical furniture bridges theoretical physics equations with tactile scenarios.'
      },
      {
        id: 'gravity_lab',
        name: 'Gravity Lab',
        desc: 'Physics and electronic puzzle lab set on an abandoned lunar outpost. Bending gravity beams, completing circuits, and designing custom levels.',
        relation: 'Physics Labs',
        funFact: 'An integrated custom Level Editor allows student-created physics tests to be played and assessed locally or shared.'
      },
      {
        id: 'energy_encyclopedia',
        name: 'Energy Encyclopedia VR',
        desc: 'Assemble and operate nuclear reactors (fission, SMR, fusion) and renewable systems (solar towers, hydro turbines, windmills).',
        relation: 'Chemistry Center',
        funFact: 'Includes 30+ interactive power generation models, transforming abstract thermodynamics into a hands-on learning experience.'
      }
    ]
  },
  {
    category: 'Geography & Field Trips',
    apps: [
      {
        id: 'wander',
        name: 'Wander',
        desc: 'Teleport anywhere on Earth using Google Street View data. Features voice search and full Wikipedia reference integration.',
        relation: 'Geography Planet',
        funFact: 'Walking actual city streets in VR supports instant geographic inquiry and historical travel using past imagery logs.'
      },
      {
        id: 'brink_traveler',
        name: 'BRINK Traveler',
        desc: 'Visually stunning geography field trips utilizing photogrammetric 3D scans of actual national parks, canyons, and day/night cycles.',
        relation: 'Geography Planet',
        funFact: 'Canyons and trails are reconstructed with millimeter-level precision, giving an absolute sensation of presence.'
      },
      {
        id: 'natgeo_explore',
        name: 'NatGeo Explore VR',
        desc: 'Documentary expeditions. Kayak through Antarctic icebergs to spot penguins, or explore Machu Picchu Incan ruins with photo matching.',
        relation: 'Geography Planet',
        funFact: 'Includes voice narrated archaeological guides while matching historic photos to exact landscape targets.'
      }
    ]
  },
  {
    category: 'Astronomy & Space Science',
    apps: [
      {
        id: 'titans_of_space',
        name: 'Titans of Space PLUS',
        desc: 'Shrink the entire cosmos to arm-reach size, tour holographic planets, take zero-g moon walks, and listen to a 2-hour audio guide.',
        relation: 'Space Dimension',
        funFact: 'Venture beyond our solar system to stand next to giant red stars, directly comparing their sizes to our yellow sun.'
      }
    ]
  },
  {
    category: 'Languages & Culture',
    apps: [
      {
        id: 'noun_town',
        name: 'Noun Town',
        desc: 'Gamified vocabulary simulator. Master 1,000+ words in Spanish, Spanish, or Japanese by interacting with NPCs via speech recognition.',
        relation: 'Language City',
        funFact: 'The virtual town restores its bright colors as you successfully pronounce words and solve language puzzles.'
      },
      {
        id: 'immerse',
        name: 'IMMERSE',
        desc: 'AI-driven conversation training. Practice realistic situations like restaurant ordering or job interviews with conversational AI avatars.',
        relation: 'Language City',
        funFact: 'IMMERSE targets conversational confidence, preparing students for real-world speech without any social anxiety.'
      }
    ]
  }
];

export function EduOverlay() {
  const activeDimension = useEduStore(state => state.activeDimension);
  const setDimension = useEduStore(state => state.setDimension);
  const controlPlatform = useEduStore(state => state.controlPlatform);
  const setControlPlatform = useEduStore(state => state.setControlPlatform);
  const xp = useEduStore(state => state.xp);
  const level = useEduStore(state => state.level);
  const badges = useEduStore(state => state.badges);
  const missions = useEduStore(state => state.missions);
  const selectedObject = useEduStore(state => state.selectedObject);
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const vrLaserActive = useEduStore(state => state.vrLaserActive);
  const setVrLaserActive = useEduStore(state => state.setVrLaserActive);
  const vrHandTracking = useEduStore(state => state.vrHandTracking);
  const setVrHandTracking = useEduStore(state => state.setVrHandTracking);
  const setMRCamerasActive = useEduStore(state => state.setMRCamerasActive);

  const [activeTab, setActiveTab] = useState<'missions' | 'badges' | 'vrApps' | 'multiplayer' | 'settings'>('missions');

  const getPlatformIcon = (platform: ControlPlatformType) => {
    switch (platform) {
      case 'pc': return <Laptop className="w-4.5 h-4.5 text-cyan-400" />;
      case 'vr': return <Monitor className="w-4.5 h-4.5 text-fuchsia-400" />;
      case 'mobile': return <Smartphone className="w-4.5 h-4.5 text-emerald-400" />;
      case 'console': return <Gamepad2 className="w-4.5 h-4.5 text-amber-400" />;
    }
  };

  const getPlatformLabel = (platform: ControlPlatformType) => {
    switch (platform) {
      case 'pc': return 'PC Keyboard & Mouse';
      case 'vr': return 'VR Quest Headset (Laser)';
      case 'mobile': return 'Mobile Touchscreen';
      case 'console': return 'Console Gamepad';
    }
  };

  // Simulated multiplayer class list
  const activeClassmates = [
    { name: 'Dr. Evelyn (Teacher)', status: 'Lecturing', isTeacher: true, avatarColor: 'bg-indigo-500' },
    { name: 'Sora_Astro', status: 'In Space Orbit', isTeacher: false, avatarColor: 'bg-sky-500' },
    { name: 'X_BioCoder_X', status: 'Scanning DNA helix', isTeacher: false, avatarColor: 'bg-rose-500' },
    { name: 'ChemLady', status: 'In Chemistry Lab', isTeacher: false, avatarColor: 'bg-emerald-500' }
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 select-none font-sans">
      
      {/* 1. TOP STATS BAR (Curved VR Visor HUD feel) */}
      <div className="flex items-start justify-between w-full pointer-events-auto">
        {/* Profile Card & Level progression */}
        <div className="flex items-center gap-4 bg-zinc-950/90 border border-cyan-500/30 px-5 py-3.5 rounded-3xl backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.1)]">
          <div className="relative">
            <div className="w-11 h-11 bg-cyan-500/10 border border-cyan-400 flex items-center justify-center rounded-2xl">
              <Compass className="w-5.5 h-5.5 text-cyan-400 animate-spin" style={{ animationDuration: '20s' }} />
            </div>
            <div className="absolute -top-1.5 -right-1.5 bg-cyan-400 text-zinc-950 text-[10px] font-black px-1.5 py-0.5 rounded-lg border-2 border-zinc-950">
              Lvl {level}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-white tracking-widest uppercase italic">SCIENCE EXPLORER</h3>
              <span className="text-[9px] font-bold bg-white/10 text-white/70 px-2 py-0.5 rounded-md uppercase">PROTOTYPE 1.0</span>
            </div>
            <div className="flex items-center gap-3.5 mt-1.5">
              <div className="w-32 bg-white/5 h-2 rounded-full overflow-hidden border border-white/5 relative">
                <div 
                  className="bg-cyan-400 h-full transition-all duration-500 rounded-full" 
                  style={{ width: `${(xp / (level * 300)) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-black text-cyan-400">
                {xp} / {level * 300} XP
              </span>
            </div>
          </div>
        </div>

        {/* Current Active Dimension Panel */}
        <div className="flex items-center gap-5 bg-zinc-950/90 border border-white/10 px-5 py-3.5 rounded-3xl backdrop-blur-xl">
          <div className="text-right">
            <span className="text-[8px] font-black text-zinc-500 tracking-[0.2em] uppercase">ACTIVE META-WORLD</span>
            <h4 className="text-xs font-black text-white uppercase italic tracking-wider mt-0.5">
              {activeDimension === 'hub' ? '🎓 ACADEMY LOBBY' : `🌌 ${activeDimension.toUpperCase()} KINGDOM`}
            </h4>
          </div>
          <div className="h-7 w-[1px] bg-white/10" />
          {/* Platform controls indicator */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/5 rounded-xl border border-white/10">
              {getPlatformIcon(controlPlatform)}
            </div>
            <div>
              <span className="text-[8px] font-black text-zinc-500 tracking-[0.2em] uppercase">ACTIVE CONTROLLER</span>
              <p className="text-[9px] font-bold text-white/90 uppercase tracking-wider mt-0.5">
                {getPlatformLabel(controlPlatform)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE PANELS: Left is Stats/Quests, Right is the interactive Object Dossier */}
      <div className="flex-1 my-6 flex justify-between gap-6 items-center w-full min-h-0">
        
        {/* LEFT TABBED CONSOLE (Quests, Badges, Online Lab) */}
        <div className="w-80 h-full bg-zinc-950/90 border border-white/10 rounded-3xl pointer-events-auto backdrop-blur-xl flex flex-col overflow-hidden shadow-2xl">
          {/* Tab Navigation header */}
          <div className="grid grid-cols-5 border-b border-white/10 text-[8px] font-black uppercase tracking-wider text-center shrink-0">
            <button 
              onClick={() => setActiveTab('missions')}
              className={`py-3 transition-all cursor-pointer ${
                activeTab === 'missions' ? 'bg-white/5 text-cyan-400 border-b border-cyan-400' : 'text-zinc-500 hover:text-white'
              }`}
            >
              Missions
            </button>
            <button 
              onClick={() => setActiveTab('badges')}
              className={`py-3 transition-all cursor-pointer ${
                activeTab === 'badges' ? 'bg-white/5 text-cyan-400 border-b border-cyan-400' : 'text-zinc-500 hover:text-white'
              }`}
            >
              Badges
            </button>
            <button 
              onClick={() => setActiveTab('vrApps')}
              className={`py-3 transition-all cursor-pointer ${
                activeTab === 'vrApps' ? 'bg-white/5 text-cyan-400 border-b border-cyan-400' : 'text-zinc-500 hover:text-white'
              }`}
            >
              VR Lib
            </button>
            <button 
              onClick={() => setActiveTab('multiplayer')}
              className={`py-3 transition-all cursor-pointer ${
                activeTab === 'multiplayer' ? 'bg-white/5 text-cyan-400 border-b border-cyan-400' : 'text-zinc-500 hover:text-white'
              }`}
            >
              Class
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`py-3 transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-white/5 text-cyan-400 border-b border-cyan-400' : 'text-zinc-500 hover:text-white'
              }`}
            >
              System
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            
            {/* Missions List */}
            {activeTab === 'missions' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Educational Objectives</span>
                  <span className="text-[9px] font-mono font-bold text-cyan-400">{missions.filter(m => m.status === 'completed').length}/{missions.length} Done</span>
                </div>
                {missions.map((mission) => (
                  <div 
                    key={mission.id} 
                    className={`p-3.5 rounded-2xl border transition-all ${
                      mission.status === 'completed' 
                        ? 'bg-emerald-950/10 border-emerald-500/20 text-zinc-400' 
                        : mission.status === 'active'
                        ? 'bg-cyan-500/5 border-cyan-500/30 text-white shadow-[0_0_15px_rgba(6,182,212,0.05)]'
                        : 'bg-zinc-900/40 border-white/5 text-zinc-500'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${
                        mission.status === 'completed' ? 'text-emerald-500' : 'text-zinc-700'
                      }`} />
                      <div className="flex-1">
                        <h5 className="text-[10px] font-black tracking-wide uppercase">{mission.title}</h5>
                        <p className="text-[9px] mt-1 leading-relaxed font-medium">{mission.description}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[8px] font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase font-mono text-cyan-400">+{mission.xp} XP</span>
                          {mission.status === 'active' && (
                            <span className="text-[7px] font-black bg-cyan-400 text-zinc-950 px-1.5 py-0.5 rounded-full uppercase tracking-widest animate-pulse">In Progress</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Badges Grid */}
            {activeTab === 'badges' && (
              <div className="space-y-3.5">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block pb-2 border-b border-white/5">Science Achievements</span>
                <div className="grid grid-cols-1 gap-2.5">
                  {badges.map((badge) => (
                    <div 
                      key={badge.id} 
                      className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all ${
                        badge.unlocked 
                          ? 'bg-fuchsia-950/15 border-fuchsia-500/30 text-white' 
                          : 'bg-zinc-900/20 border-white/5 text-zinc-500 grayscale'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        badge.unlocked ? 'bg-fuchsia-500/15 border-fuchsia-400/50' : 'bg-white/5 border-white/10'
                      }`}>
                        <Award className={`w-5 h-5 ${badge.unlocked ? 'text-fuchsia-400' : 'text-zinc-600'}`} />
                      </div>
                      <div>
                        <h6 className="text-[10px] font-black uppercase tracking-wide">{badge.name}</h6>
                        <p className="text-[9px] text-zinc-400 font-medium leading-normal mt-0.5">{badge.description}</p>
                        {badge.unlocked && badge.unlockedAt && (
                          <span className="text-[7px] font-mono text-fuchsia-400 mt-1 block uppercase">Unlocked {badge.unlockedAt}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VR Library / Quest Apps Catalog */}
            {activeTab === 'vrApps' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-white/5">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">VR Quest Apps Catalog</span>
                  <span className="text-[8px] font-mono font-bold text-cyan-400">14 Apps Simulated</span>
                </div>
                
                <p className="text-[9px] font-medium leading-relaxed text-zinc-500 uppercase">
                  Explore top real-world educational VR software. Click an app to load its full 3D telemetry specs in the right dossier!
                </p>

                {vrAppsCatalog.map((cat, cIdx) => (
                  <div key={cIdx} className="space-y-2">
                    <span className="text-[8px] font-black text-cyan-500 uppercase tracking-wider block bg-cyan-950/25 px-2 py-1 rounded-md border border-cyan-500/10">
                      {cat.category}
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {cat.apps.map((app) => {
                        const isSelected = selectedObject?.id === app.id;
                        return (
                          <button
                            key={app.id}
                            onClick={() => {
                              setSelectedObject({
                                id: app.id,
                                name: app.name,
                                category: cat.category,
                                description: app.desc,
                                funFact: app.funFact
                              });
                            }}
                            className={`w-full text-left p-2.5 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)] animate-pulse'
                                : 'bg-white/5 border-white/5 text-zinc-400 hover:border-white/15'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <h6 className="text-[9px] font-black uppercase tracking-wide text-white">
                                {app.name}
                              </h6>
                              <span className="text-[7px] font-black bg-white/5 text-zinc-500 px-1.5 py-0.5 rounded uppercase border border-white/5">
                                {app.relation}
                              </span>
                            </div>
                            <p className="text-[9px] text-zinc-400 font-medium leading-relaxed mt-1 line-clamp-2">
                              {app.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Simulated Multiplayer / Classroom */}
            {activeTab === 'multiplayer' && (
              <div className="space-y-3.5">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block pb-2 border-b border-white/5">Virtual Classroom (Simulated)</span>
                <div className="space-y-2.5">
                  {activeClassmates.map((student, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${student.avatarColor}`} />
                        <div>
                          <h6 className="text-[10px] font-black text-white">{student.name}</h6>
                          <span className="text-[8px] text-zinc-400 uppercase">{student.status}</span>
                        </div>
                      </div>
                      {student.isTeacher ? (
                        <span className="text-[7px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-md uppercase">FACULTY</span>
                      ) : (
                        <span className="text-[7px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-md uppercase">ONLINE</span>
                      )}
                    </div>
                  ))}
                </div>
                {/* Classroom tools panel */}
                <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-2xl text-[9px] text-zinc-400 uppercase tracking-wider leading-relaxed">
                  📢 **Next Event:** Space Exploration Class starting in **12 mins**. Team experiments unlocked!
                </div>
              </div>
            )}

            {/* System settings and Control Options */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block pb-2 border-b border-white/5">Platform Configuration</span>
                
                {/* Platform select options */}
                <div className="space-y-2">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-wider">Device Input Matrix</span>
                  {(['vr', 'pc', 'mobile', 'console'] as ControlPlatformType[]).map((plat) => (
                    <button
                      key={plat}
                      onClick={() => setControlPlatform(plat)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                        controlPlatform === plat 
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' 
                          : 'bg-white/5 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(plat)}
                        <span>{plat === 'vr' ? 'VR Oculus/Quest Headset' : plat === 'pc' ? 'PC Keyboard/Mouse' : plat === 'mobile' ? 'Mobile Touchscreen' : 'Console Gamepad'}</span>
                      </div>
                      {controlPlatform === plat && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  ))}
                </div>

                {/* VR specific toggles */}
                <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-2xl space-y-3">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-wider block">Quest VR Hardware Settings</span>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-zinc-300 uppercase">VR Controller Laser Guide</span>
                    <button 
                      onClick={() => setVrLaserActive(!vrLaserActive)}
                      className={`w-9 h-5 rounded-full transition-all relative border p-0.5 cursor-pointer ${
                        vrLaserActive ? 'bg-cyan-500 border-cyan-400' : 'bg-zinc-800 border-zinc-700'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full bg-white transition-all transform ${
                        vrLaserActive ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-zinc-300 uppercase">Hand Tracking (Camera)</span>
                    <button 
                      onClick={() => setVrHandTracking(!vrHandTracking)}
                      className={`w-9 h-5 rounded-full transition-all relative border p-0.5 cursor-pointer ${
                        vrHandTracking ? 'bg-cyan-500 border-cyan-400' : 'bg-zinc-800 border-zinc-700'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full bg-white transition-all transform ${
                        vrHandTracking ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <button
                      onClick={() => {
                        setMRCamerasActive(true);
                      }}
                      className="w-full py-2.5 bg-fuchsia-500/10 hover:bg-fuchsia-500 hover:text-black border border-fuchsia-500/30 text-fuchsia-400 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Quest 3S MR Camera Feed
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT ANALYSIS DOSSIER (Spits out cellular scan results, atomic bonding facts, etc. on click!) */}
        <div className="w-80 h-full pointer-events-auto flex flex-col justify-center">
          {selectedObject ? (
            <div className="bg-zinc-950/95 border border-cyan-400/40 rounded-3xl p-5 shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-xl relative flex flex-col max-h-[360px]">
              {/* Glowing header banner */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-t-3xl" />
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-[7px] font-black bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 px-2 py-0.5 rounded-md uppercase tracking-widest">{selectedObject.category}</span>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider italic mt-1.5">{selectedObject.name}</h4>
                </div>
                <button 
                  onClick={() => setSelectedObject(null)}
                  className="p-1 text-zinc-500 hover:text-white transition-all text-xs cursor-pointer bg-white/5 rounded-lg hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              {/* Dossier scroll body */}
              <div className="flex-1 overflow-y-auto my-3.5 space-y-3.5 custom-scrollbar text-xs">
                <div>
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Holographic scan analysis</span>
                  <p className="text-zinc-300 leading-relaxed font-medium">{selectedObject.description}</p>
                </div>

                <div className="bg-cyan-500/5 border border-cyan-400/10 p-3 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1.5 opacity-10">
                    <Sparkles className="w-12 h-12 text-cyan-400" />
                  </div>
                  <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <Bot className="w-3.5 h-3.5 animate-pulse" />
                    A.U.R.A Educational Fun Fact
                  </span>
                  <p className="text-cyan-200/90 leading-relaxed font-medium text-[11px] italic">"{selectedObject.funFact}"</p>
                </div>
              </div>

              {/* Action footer */}
              <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                <button className="flex-1 bg-cyan-500 text-zinc-950 font-black text-[10px] uppercase tracking-widest py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:scale-[1.02] active:scale-95 cursor-pointer">
                  🔬 Analyze DNA sequence
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-white/15 rounded-3xl p-6 text-center text-zinc-500/80 uppercase tracking-wider font-bold text-[9px] flex flex-col items-center justify-center gap-3 py-16">
              <div className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center text-zinc-600 animate-pulse">
                <Search className="w-4 h-4" />
              </div>
              <span>Click on any 3D organelle, DNA nucleus, or star system to display holographic details</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM VISOR PANEL: Direction keys instructions and return buttons */}
      <div className="flex justify-between items-end w-full pointer-events-auto">
        {/* Navigation advice */}
        <div className="bg-zinc-950/80 border border-white/5 px-4 py-2.5 rounded-2xl text-[9px] font-black text-zinc-500 uppercase tracking-widest backdrop-blur">
          ⌨️ **Controls:** WASD / Arrow Keys to walk | Mouse drag to look | Click to scan structures
        </div>

        {/* Dynamic Teleport Shortcuts */}
        <div className="flex gap-2.5">
          <button 
            onClick={() => setDimension('hub')}
            className={`px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              activeDimension === 'hub'
                ? 'bg-cyan-500 text-zinc-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'bg-zinc-950/90 border border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            Lobby Portal
          </button>
          <button 
            onClick={() => setDimension('biology')}
            className={`px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              activeDimension === 'biology'
                ? 'bg-pink-500 text-zinc-950 shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                : 'bg-zinc-950/90 border border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            Biology
          </button>
          <button 
            onClick={() => setDimension('math')}
            className={`px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              activeDimension === 'math'
                ? 'bg-amber-500 text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'bg-zinc-950/90 border border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            Math
          </button>
        </div>
      </div>
    </div>
  );
}
export default EduOverlay;
