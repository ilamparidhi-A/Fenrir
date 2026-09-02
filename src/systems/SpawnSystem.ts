import type { WaveEntry } from '../config/Balance';

/**
 * Plays a timed list of enemy spawns. Stages will eventually load these lists
 * from JSON so designing a level never means touching code.
 */
export class WaveScheduler {
  private elapsed = 0;
  private index = 0;

  constructor(private readonly waves: readonly WaveEntry[]) {}

  get isExhausted(): boolean {
    return this.index >= this.waves.length;
  }

  update(dtMs: number, spawn: (unitId: string) => void): void {
    this.elapsed += dtMs;
    while (this.index < this.waves.length && this.waves[this.index]!.atMs <= this.elapsed) {
      spawn(this.waves[this.index]!.unitId);
      this.index += 1;
    }
  }
}
