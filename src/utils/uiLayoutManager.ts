/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface UILayoutConfig {
  crosshairStyle: 'dot' | 'cross' | 'circle' | 'dynamic' | 'ring';
  crosshairColor: string;
  crosshairScale: number; // 0.5 to 2.0
  crosshairGap: number; // 2 to 20
  crosshairThickness: number; // 1 to 6
  crosshairOpacity: number; // 0.2 to 1.0

  hudScale: number; // 0.75 to 1.25
  hudPositionPreset: 'default' | 'compact' | 'wide' | 'centered';
  hudOpacity: number; // 0.5 to 1.0

  showCrosshair: boolean;
  showKillFeed: boolean;
  showMinimap: boolean;
  showHealthBar: boolean;
  showStatsBar: boolean;
  showChat: boolean;
  showEventLog: boolean;
  showPings: boolean;
}

export const DEFAULT_UI_LAYOUT_CONFIG: UILayoutConfig = {
  crosshairStyle: 'dynamic',
  crosshairColor: '#f59e0b', // amber-400
  crosshairScale: 1.0,
  crosshairGap: 8,
  crosshairThickness: 2,
  crosshairOpacity: 0.9,

  hudScale: 1.0,
  hudPositionPreset: 'default',
  hudOpacity: 1.0,

  showCrosshair: true,
  showKillFeed: true,
  showMinimap: true,
  showHealthBar: true,
  showStatsBar: true,
  showChat: true,
  showEventLog: true,
  showPings: true,
};

const STORAGE_KEY = 'neon_arena_ui_layout_config_v1';

export function loadUILayoutConfig(): UILayoutConfig {
  if (typeof window === 'undefined') return DEFAULT_UI_LAYOUT_CONFIG;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_UI_LAYOUT_CONFIG, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load UI layout config:', e);
  }
  return DEFAULT_UI_LAYOUT_CONFIG;
}

export function saveUILayoutConfig(config: UILayoutConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save UI layout config:', e);
  }
}

export function resetUILayoutConfig(): UILayoutConfig {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }
  return DEFAULT_UI_LAYOUT_CONFIG;
}

export function exportUILayoutConfigJSON(config: UILayoutConfig): string {
  return JSON.stringify(config, null, 2);
}

export function importUILayoutConfigJSON(jsonStr: string): UILayoutConfig | null {
  try {
    const parsed = JSON.parse(jsonStr);
    if (typeof parsed === 'object' && parsed !== null) {
      const valid = { ...DEFAULT_UI_LAYOUT_CONFIG, ...parsed };
      saveUILayoutConfig(valid);
      return valid;
    }
  } catch (e) {
    console.error('Invalid JSON config import:', e);
  }
  return null;
}
