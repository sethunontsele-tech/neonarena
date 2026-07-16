import { create } from 'zustand';

export type ActiveDimensionType = 
  | 'hub' 
  | 'biology' 
  | 'math' 
  | 'physics' 
  | 'chemistry' 
  | 'history' 
  | 'geography' 
  | 'space' 
  | 'coding' 
  | 'language' 
  | 'arts'
  | 'anatomy'
  | 'piano'
  | 'chemistry_lab'
  | 'solar_system'
  | 'dinosaur'
  | 'ocean'
  | 'spaceship'
  | 'alien_zoo'
  | 'city_builder'
  | 'castle_defense'
  | 'painting_studio'
  | 'aura_hologram'
  | 'classroom'
  | 'microscope'
  | 'natural_disaster'
  | 'racing'
  | 'room_scanner'
  | 'escape_room'
  | 'weather_machine'
  | 'time_machine'
  | 'white_void';
export type ControlPlatformType = 'pc' | 'vr' | 'mobile' | 'console';

export interface EduBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface ScienceDiscovery {
  id: string;
  name: string;
  category: string;
  description: string;
  funFact: string;
}

export interface EduMission {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  xp: number;
}

interface EduState {
  activeDimension: ActiveDimensionType;
  controlPlatform: ControlPlatformType;
  xp: number;
  level: number;
  discoveredObjects: string[]; // ids of discovered elements
  unlockedDimensions: ActiveDimensionType[];
  badges: EduBadge[];
  missions: EduMission[];
  selectedObject: { id: string; name: string; description: string; funFact: string; category: string } | null;
  vrLaserActive: boolean;
  vrHandTracking: boolean;
  showMRCameras: boolean;
  showCreatorStudio: boolean;
  
  // Actions
  setDimension: (dim: ActiveDimensionType) => void;
  setControlPlatform: (platform: ControlPlatformType) => void;
  gainXP: (amount: number) => void;
  discoverObject: (id: string) => void;
  unlockDimension: (dim: ActiveDimensionType) => void;
  completeMission: (id: string) => void;
  setSelectedObject: (obj: any | null) => void;
  setVrLaserActive: (active: boolean) => void;
  setVrHandTracking: (active: boolean) => void;
  setMRCamerasActive: (active: boolean) => void;
  setCreatorStudioActive: (active: boolean) => void;
}

export const useEduStore = create<EduState>((set, get) => ({
  activeDimension: 'hub',
  controlPlatform: 'pc',
  xp: 120,
  level: 1,
  discoveredObjects: [],
  unlockedDimensions: [
    'hub', 'biology', 'math', 'physics', 'chemistry', 'history', 'geography', 'space', 'coding', 'language', 'arts',
    'anatomy', 'piano', 'chemistry_lab', 'solar_system', 'dinosaur', 'ocean', 'spaceship', 'alien_zoo', 'city_builder',
    'castle_defense', 'painting_studio', 'aura_hologram', 'classroom', 'microscope', 'natural_disaster', 'racing',
    'room_scanner', 'escape_room', 'weather_machine', 'time_machine', 'white_void'
  ],
  badges: [
    { id: 'first_steps', name: 'Academy Initiate', description: 'Enter the portal system of Infinity Academy', icon: 'Sparkles', unlocked: true },
    { id: 'cell_explorer', name: 'Microscopic Voyager', description: 'Shrink down and locate the Mitochondria in a cell', icon: 'Zap', unlocked: false },
    { id: 'double_helix', name: 'Genetics Cryptographer', description: 'Interact with the DNA Helix nucleotides', icon: 'Dna', unlocked: false },
    { id: 'beating_pulse', name: 'Cardiologist Apprentice', description: 'Perform bio-scanner analysis on the human heart', icon: 'HeartPulse', unlocked: false },
    { id: 'cosmic_traveler', name: 'Astro-Mechanic', description: 'Analyze the gravitational orbit simulator', icon: 'Orbit', unlocked: false },
    { id: 'gravity_defier', name: 'Galileo Heirs', description: 'Calibrate the mass and gravity accelerator drop system', icon: 'Activity', unlocked: false },
    { id: 'code_island_chief', name: 'Binary Architect', description: 'Assemble logic-gate loops to automate the mini-bot', icon: 'Code', unlocked: false },
    { id: 'time_traveler', name: 'Egyptologist', description: 'Decrypt the Hieroglyphic Rosetta Stone slab', icon: 'BookOpen', unlocked: false }
  ],
  missions: [
    { id: 'enter_portals', title: 'Operational Briefing', description: 'Explore the Portal Room to view connected worlds.', status: 'completed', xp: 50 },
    { id: 'explore_cell', title: 'Cellular Analysis', description: 'Shrink into the Biology Kingdom and locate the cell Mitochondria.', status: 'active', xp: 150 },
    { id: 'scan_heart', title: 'Circulatory Rhythm', description: 'Scan the pulsating human heart to examine blood-flow channels.', status: 'pending', xp: 200 },
    { id: 'bond_atoms', title: 'Molecular Symphony', description: 'Simulate covalent atom bonding in the Chemistry lab.', status: 'pending', xp: 250 },
    { id: 'test_gravity', title: 'Gravity Lab Drop', description: 'Examine gravitational pull on various planet masses.', status: 'pending', xp: 180 },
    { id: 'egyptian_history', title: 'Rosetta Cipher', description: 'Scan Ancient Hieroglyphs in the History Portal.', status: 'pending', xp: 300 }
  ],
  selectedObject: null,
  vrLaserActive: true,
  vrHandTracking: false,
  showMRCameras: false,
  showCreatorStudio: false,

  setDimension: (dim) => {
    set({ activeDimension: dim });
    // Sound playback or feedback if needed
  },
  setControlPlatform: (platform) => {
    set({ controlPlatform: platform });
  },
  gainXP: (amount) => {
    const { xp, level } = get();
    let newXp = xp + amount;
    let newLevel = level;
    
    // Level up thresholds: 300, 600, 1000...
    const threshold = level * 300;
    if (newXp >= threshold) {
      newXp -= threshold;
      newLevel += 1;
    }
    set({ xp: newXp, level: newLevel });
  },
  discoverObject: (id) => {
    const { discoveredObjects, badges } = get();
    if (discoveredObjects.includes(id)) return;

    const updated = [...discoveredObjects, id];
    set({ discoveredObjects: updated });

    // Check specific discovery unlocks
    const updatedBadges = [...badges];
    if (id === 'mitochondria') {
      const idx = updatedBadges.findIndex(b => b.id === 'cell_explorer');
      if (idx !== -1 && !updatedBadges[idx].unlocked) {
        updatedBadges[idx].unlocked = true;
        updatedBadges[idx].unlockedAt = new Date().toLocaleTimeString();
        get().gainXP(150);
        get().completeMission('explore_cell');
      }
    } else if (id === 'dna') {
      const idx = updatedBadges.findIndex(b => b.id === 'double_helix');
      if (idx !== -1 && !updatedBadges[idx].unlocked) {
        updatedBadges[idx].unlocked = true;
        updatedBadges[idx].unlockedAt = new Date().toLocaleTimeString();
        get().gainXP(150);
      }
    } else if (id === 'heart') {
      const idx = updatedBadges.findIndex(b => b.id === 'beating_pulse');
      if (idx !== -1 && !updatedBadges[idx].unlocked) {
        updatedBadges[idx].unlocked = true;
        updatedBadges[idx].unlockedAt = new Date().toLocaleTimeString();
        get().gainXP(200);
        get().completeMission('scan_heart');
      }
    } else if (id === 'gravity_simulation') {
      const idx = updatedBadges.findIndex(b => b.id === 'gravity_defier');
      if (idx !== -1 && !updatedBadges[idx].unlocked) {
        updatedBadges[idx].unlocked = true;
        updatedBadges[idx].unlockedAt = new Date().toLocaleTimeString();
        get().gainXP(180);
        get().completeMission('test_gravity');
      }
    } else if (id === 'rosetta_stone') {
      const idx = updatedBadges.findIndex(b => b.id === 'time_traveler');
      if (idx !== -1 && !updatedBadges[idx].unlocked) {
        updatedBadges[idx].unlocked = true;
        updatedBadges[idx].unlockedAt = new Date().toLocaleTimeString();
        get().gainXP(300);
        get().completeMission('egyptian_history');
      }
    } else if (id === 'compiler_loop') {
      const idx = updatedBadges.findIndex(b => b.id === 'code_island_chief');
      if (idx !== -1 && !updatedBadges[idx].unlocked) {
        updatedBadges[idx].unlocked = true;
        updatedBadges[idx].unlockedAt = new Date().toLocaleTimeString();
        get().gainXP(250);
      }
    }
    set({ badges: updatedBadges });
  },
  unlockDimension: (dim) => {
    const { unlockedDimensions } = get();
    if (unlockedDimensions.includes(dim)) return;
    set({ unlockedDimensions: [...unlockedDimensions, dim] });
  },
  completeMission: (id) => {
    const { missions } = get();
    const updatedMissions = missions.map(m => {
      if (m.id === id) {
        if (m.status !== 'completed') {
          get().gainXP(m.xp);
        }
        return { ...m, status: 'completed' as const };
      }
      return m;
    });

    // Cascade next mission activation
    if (id === 'explore_cell') {
      const heartMission = updatedMissions.find(m => m.id === 'scan_heart');
      if (heartMission && heartMission.status === 'pending') {
        heartMission.status = 'active';
      }
    }
    set({ missions: updatedMissions });
  },
  setSelectedObject: (obj) => {
    set({ selectedObject: obj });
    if (obj && obj.id) {
      get().discoverObject(obj.id);
    }
  },
  setVrLaserActive: (active) => set({ vrLaserActive: active }),
  setVrHandTracking: (active) => set({ vrHandTracking: active }),
  setMRCamerasActive: (active) => set({ showMRCameras: active }),
  setCreatorStudioActive: (active) => set({ showCreatorStudio: active }),
}));
