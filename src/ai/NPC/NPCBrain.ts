/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type NPCMood = 'NEUTRAL' | 'ALERT' | 'HOSTILE' | 'ALLIED' | 'PANICKED';

export interface MemoryEntry {
  timestamp: number;
  subject: string;
  emotionalWeight: number; // -1.0 to 1.0
  description: string;
}

export class NPCBrain {
  private npcId: string;
  private name: string;
  private mood: NPCMood = 'NEUTRAL';
  private memories: MemoryEntry[] = [];
  private threatLevel: number = 0;

  constructor(npcId: string, name: string) {
    this.npcId = npcId;
    this.name = name;
  }

  public perceivePlayerAction(actionType: 'HELP' | 'ATTACK' | 'TRADE' | 'GREET'): void {
    const now = Date.now();
    if (actionType === 'ATTACK') {
      this.threatLevel = Math.min(100, this.threatLevel + 45);
      this.mood = 'HOSTILE';
      this.memories.push({ timestamp: now, subject: 'PLAYER_ATTACK', emotionalWeight: -0.9, description: 'Player initiated combat unprovoked.' });
    } else if (actionType === 'HELP' || actionType === 'TRADE') {
      this.threatLevel = Math.max(0, this.threatLevel - 20);
      this.mood = 'ALLIED';
      this.memories.push({ timestamp: now, subject: 'PLAYER_COOPERATION', emotionalWeight: 0.8, description: 'Player completed profitable exchange or assistance.' });
    }
  }

  public getCognitiveState() {
    return {
      npcId: this.npcId,
      name: this.name,
      mood: this.mood,
      threatLevel: this.threatLevel,
      memoryCount: this.memories.length,
      recentMemories: this.memories.slice(-3)
    };
  }
}
