/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface PlayerStatsData {
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  energy: number;
  maxEnergy: number;
  cyberwareSyncRate: number;
}

export class PlayerStats {
  private stats: PlayerStatsData;

  constructor(initial?: Partial<PlayerStatsData>) {
    this.stats = {
      health: 100,
      maxHealth: 100,
      shield: 50,
      maxShield: 50,
      energy: 100,
      maxEnergy: 100,
      cyberwareSyncRate: 98.5,
      ...initial
    };
  }

  public getStats(): Readonly<PlayerStatsData> {
    return { ...this.stats };
  }

  public takeDamage(amount: number): void {
    let remaining = amount;
    if (this.stats.shield > 0) {
      if (this.stats.shield >= remaining) {
        this.stats.shield -= remaining;
        remaining = 0;
      } else {
        remaining -= this.stats.shield;
        this.stats.shield = 0;
      }
    }
    this.stats.health = Math.max(0, this.stats.health - remaining);
  }

  public rechargeShield(amount: number): void {
    this.stats.shield = Math.min(this.stats.maxShield, this.stats.shield + amount);
  }
}
