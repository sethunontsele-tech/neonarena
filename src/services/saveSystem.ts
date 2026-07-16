import { useGameStore } from '../store';
import { db, auth } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// XOR Secret Encryption Key
const ENCRYPTION_KEY = 'NEON_ARENA_CORE_XOR_SECRET_2026';

/**
 * Encrypts a string using a repeating XOR key and converts it to Base64.
 */
export function encryptData(data: string): string {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result);
}

/**
 * Decrypts a Base64 string and repeats XOR to recover the original string.
 */
export function decryptData(ciphertext: string): string {
  try {
    const raw = atob(ciphertext);
    let result = '';
    for (let i = 0; i < raw.length; i++) {
      const charCode = raw.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (e) {
    console.error('Failed to decrypt save data:', e);
    throw new Error('Save data corrupted or invalid encryption signature.');
  }
}

export interface SaveData {
  gamertag: string;
  score: number;
  kills: number;
  deaths: number;
  marketCredits: number;
  battlePassLevel: number;
  prestigeLevel: number;
  achievements: { id: string; name: string; date: string }[];
  dailyRewards: { day: number; collected: boolean }[];
  unlockedSkins?: string[];
  selectedSkin?: string;
  selectedColor?: string;
  selectedPattern?: string;
  selectedAccessories?: string[];
  selectedGunSkin?: string;
  // Settings
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  musicVolume: number;
  sfxVolume: number;
  vibrationEnabled: boolean;
  fov: number;
  mouseSensitivity: number;
  language: 'en' | 'es' | 'fr' | 'de' | 'ja';
  mobileControlsLayout: 'default' | 'compact' | 'lefthanded' | 'custom';
  customButtonPositions: Record<string, { x: number; y: number; size: number }>;
  updatedAt: number;
}

export const saveSystem = {
  /**
   * Generates the save payload from the current Zustand game store.
   */
  generateSavePayload(): SaveData {
    const state = useGameStore.getState() as any;
    return {
      gamertag: state.gamertag || 'NEON-OPERATOR',
      score: state.score || 0,
      kills: state.kills || 0,
      deaths: state.deaths || 0,
      marketCredits: state.marketCredits || 100,
      battlePassLevel: state.battlePassLevel || 1,
      prestigeLevel: state.prestigeLevel || 0,
      achievements: state.achievements || [],
      dailyRewards: state.dailyRewards || [],
      unlockedSkins: state.unlockedSkins || ['neon'],
      selectedSkin: state.selectedSkin || 'neon',
      selectedColor: state.selectedColor || '#f59e0b',
      selectedPattern: state.selectedPattern || 'solid',
      selectedAccessories: state.selectedAccessories || [],
      selectedGunSkin: state.selectedGunSkin || 'standard',
      graphicsQuality: state.graphicsQuality || 'high',
      musicVolume: state.musicVolume ?? 0.4,
      sfxVolume: state.sfxVolume ?? 0.8,
      vibrationEnabled: state.vibrationEnabled ?? true,
      fov: state.fov || 75,
      mouseSensitivity: state.mouseSensitivity || 1.0,
      language: state.language || 'en',
      mobileControlsLayout: state.mobileControlsLayout || 'default',
      customButtonPositions: state.customButtonPositions || {},
      updatedAt: Date.now(),
    };
  },

  /**
   * Applies the save payload to the game store.
   */
  applySavePayload(data: SaveData) {
    const store = useGameStore.getState() as any;
    
    // Update state fields safely
    useGameStore.setState({
      gamertag: data.gamertag,
      score: data.score,
      kills: data.kills,
      deaths: data.deaths,
      marketCredits: data.marketCredits,
      battlePassLevel: data.battlePassLevel,
      prestigeLevel: data.prestigeLevel,
      achievements: data.achievements,
      dailyRewards: data.dailyRewards,
      graphicsQuality: data.graphicsQuality,
      fov: data.fov,
      mouseSensitivity: data.mouseSensitivity,
    });

    if (data.unlockedSkins) useGameStore.setState({ unlockedSkins: data.unlockedSkins });
    if (data.selectedSkin) useGameStore.setState({ selectedSkin: data.selectedSkin });
    if (data.selectedColor) useGameStore.setState({ selectedColor: data.selectedColor });
    if (data.selectedPattern) useGameStore.setState({ selectedPattern: data.selectedPattern as any });
    if (data.selectedAccessories) useGameStore.setState({ selectedAccessories: data.selectedAccessories as any });
    if (data.selectedGunSkin) useGameStore.setState({ selectedGunSkin: data.selectedGunSkin });
    if (typeof data.vibrationEnabled === 'boolean') useGameStore.setState({ vibrationEnabled: data.vibrationEnabled });
    if (typeof data.musicVolume === 'number') store.setMusicVolume(data.musicVolume);
    if (typeof data.sfxVolume === 'number') store.setSfxVolume(data.sfxVolume);
    
    // Custom android store extension keys
    useGameStore.setState({
      language: data.language || 'en',
      mobileControlsLayout: data.mobileControlsLayout || 'default',
      customButtonPositions: data.customButtonPositions || {},
    });

    store.addEvent(`💾 SAVE LOADED: Welcome back, ${data.gamertag}!`);
  },

  /**
   * Saves the game progress locally (encrypted in LocalStorage).
   */
  saveLocally(): boolean {
    try {
      const payload = this.generateSavePayload();
      const rawString = JSON.stringify(payload);
      const encrypted = encryptData(rawString);
      localStorage.setItem('neon_arena_secure_save', encrypted);
      
      const store = useGameStore.getState() as any;
      if (store.addEvent) {
        store.addEvent('💾 PROGRESS AUTO-SAVED SECURELY');
      }
      return true;
    } catch (e) {
      console.error('Failed to save game locally:', e);
      return false;
    }
  },

  /**
   * Loads the game progress locally (encrypted from LocalStorage).
   */
  loadLocally(): boolean {
    try {
      const encrypted = localStorage.getItem('neon_arena_secure_save');
      if (!encrypted) return false;
      const decrypted = decryptData(encrypted);
      const payload: SaveData = JSON.parse(decrypted);
      this.applySavePayload(payload);
      return true;
    } catch (e) {
      console.error('Failed to load game locally:', e);
      return false;
    }
  },

  /**
   * Exports the encrypted save file for manual file management.
   */
  exportToFile() {
    try {
      const payload = this.generateSavePayload();
      const rawString = JSON.stringify(payload);
      const encrypted = encryptData(rawString);
      
      const blob = new Blob([encrypted], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `neon_arena_backup_${payload.gamertag.toLowerCase().replace(/\s+/g, '_')}.sav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      const store = useGameStore.getState() as any;
      store.addEvent('💾 EXPORTED SAVE FILE BACKUP SUCCESSFUL');
    } catch (e) {
      console.error('File export failed:', e);
      alert('Failed to export save file.');
    }
  },

  /**
   * Imports an encrypted save file.
   */
  importFromFile(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const encryptedText = e.target?.result as string;
          if (!encryptedText) {
            resolve(false);
            return;
          }
          const decrypted = decryptData(encryptedText);
          const payload: SaveData = JSON.parse(decrypted);
          this.applySavePayload(payload);
          this.saveLocally(); // save locally immediately
          resolve(true);
        } catch (error) {
          console.error('File import failed:', error);
          alert('Failed to import save file: corrupt or invalid backup.');
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  },

  /**
   * Saves the game to Firebase Firestore (optional Cloud save support).
   */
  async saveToCloud(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) {
      console.warn('Cloud save bypassed: User not signed in.');
      return false;
    }
    try {
      const payload = this.generateSavePayload();
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        cloudSave: encryptData(JSON.stringify(payload)),
        updatedAt: Date.now(),
      }, { merge: true });
      
      const store = useGameStore.getState() as any;
      store.addEvent('☁️ CLOUD SYNC: Saved state synchronized to secure database.');
      return true;
    } catch (e) {
      console.error('Failed to save to cloud:', e);
      return false;
    }
  },

  /**
   * Loads the game from Firebase Firestore (optional Cloud save support).
   */
  async loadFromCloud(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists() && snap.data()?.cloudSave) {
        const encrypted = snap.data().cloudSave;
        const decrypted = decryptData(encrypted);
        const payload: SaveData = JSON.parse(decrypted);
        this.applySavePayload(payload);
        this.saveLocally(); // store local cache of cloud save
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to load from cloud:', e);
      return false;
    }
  }
};
