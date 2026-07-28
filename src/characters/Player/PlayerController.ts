/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { PlayerStats } from './PlayerStats';

export class PlayerController {
  private stats: PlayerStats;
  private isDashActive: boolean = false;
  private isGrappling: boolean = false;

  constructor(stats: PlayerStats) {
    this.stats = stats;
  }

  public triggerNeonDash(direction: { x: number; y: number; z: number }): boolean {
    const currentStats = this.stats.getStats();
    if (currentStats.energy >= 15 && !this.isDashActive) {
      this.isDashActive = true;
      setTimeout(() => { this.isDashActive = false; }, 350);
      return true;
    }
    return false;
  }

  public triggerHolographicGrapple(targetPoint: { x: number; y: number; z: number }): boolean {
    this.isGrappling = true;
    return true;
  }

  public releaseGrapple(): void {
    this.isGrappling = false;
  }

  public getStatus() {
    return {
      isDashActive: this.isDashActive,
      isGrappling: this.isGrappling,
      stats: this.stats.getStats()
    };
  }
}
