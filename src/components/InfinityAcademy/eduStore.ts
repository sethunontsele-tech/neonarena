import { create } from 'zustand';

export type ActiveDimensionType = 'hub' | 'biology' | 'math' | 'chemistry' | 'history' | 'space' | 'coding' | 'arts';
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
}

export const useEduStore = create<EduState>((set, get) => ({
  activeDimension: 'hub',
  controlPlatform: 'pc',
  xp: 120,
  level: 1,
  discoveredObjects: [],
  unlockedDimensions: ['hub', 'biology', 'math', 'chemistry', 'space'],
  badges: [
    { id: 'first_steps', name: 'Academy Initiate', description: 'Enter the portal system of Infinity Academy', icon: 'Sparkles', unlocked: true },
    { id: 'cell_explorer', name: 'Microscopic Voyager', description: 'Shrink down and locate the Mitochondria in a cell', icon: 'Zap', unlocked: false },
    { id: 'double_helix', name: 'Genetics Cryptographer', description: 'Interact with the DNA Helix nucleotides', icon: 'Dna', unlocked: false },
    { id: 'beating_pulse', name: 'Cardiologist Apprentice', description: 'Perform bio-scanner analysis on the human heart', icon: 'HeartPulse', unlocked: false },
    { id: 'cosmic_traveler', name: 'Astro-Mechanic', description: 'Analyze the gravitational orbit simulator', icon: 'Orbit', unlocked: false },
  ],
  missions: [
    { id: 'enter_portals', title: 'Operational Briefing', description: 'Explore the Portal Room to view connected worlds.', status: 'completed', xp: 50 },
    { id: 'explore_cell', title: 'Cellular Analysis', description: 'Shrink into the Biology Kingdom and locate the cell Mitochondria.', status: 'active', xp: 150 },
    { id: 'scan_heart', title: 'Circulatory Rhythm', description: 'Scan the pulsating human heart to examine blood-flow channels.', status: 'pending', xp: 200 },
    { id: 'bond_atoms', title: 'Molecular Symphony', description: 'Simulate covalent atom bonding in the Chemistry lab.', status: 'pending', xp: 250 },
  ],
  selectedObject: null,
  vrLaserActive: true,
  vrHandTracking: false,

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
}));
