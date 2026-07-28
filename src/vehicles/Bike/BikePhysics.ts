/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface VehiclePhysicsState {
  velocity: number;
  maxVelocity: number;
  hoverHeight: number;
  tiltAngle: number;
  nitroMultiplier: number;
}

export class BikePhysics {
  private state: VehiclePhysicsState;

  constructor() {
    this.state = {
      velocity: 0,
      maxVelocity: 320, // km/h in quantum hover mode
      hoverHeight: 1.2, // meters above magnetic asphalt
      tiltAngle: 0,
      nitroMultiplier: 1.0
    };
  }

  public applyThrottle(deltaSeconds: number): void {
    const accel = 85 * this.state.nitroMultiplier;
    this.state.velocity = Math.min(this.state.maxVelocity * this.state.nitroMultiplier, this.state.velocity + accel * deltaSeconds);
  }

  public applyBrake(deltaSeconds: number): void {
    const decel = 140;
    this.state.velocity = Math.max(0, this.state.velocity - decel * deltaSeconds);
  }

  public setNitroActive(active: boolean): void {
    this.state.nitroMultiplier = active ? 1.6 : 1.0;
  }

  public getState(): Readonly<VehiclePhysicsState> {
    return { ...this.state };
  }
}
