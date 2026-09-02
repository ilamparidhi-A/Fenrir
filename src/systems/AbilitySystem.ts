import type { AbilityDef } from '../types';

/**
 * Tracks cooldowns for every ability the player can trigger. Knows nothing about
 * what an ability *does* — BattleScene owns the effects, this owns the timing.
 */
export class AbilitySystem {
  private readonly cooldowns = new Map<string, number>();

  constructor(private readonly defs: readonly AbilityDef[]) {}

  update(dtMs: number): void {
    for (const [id, remaining] of this.cooldowns) {
      if (remaining > 0) this.cooldowns.set(id, Math.max(0, remaining - dtMs));
    }
  }

  remaining(id: string): number {
    return this.cooldowns.get(id) ?? 0;
  }

  /** Cooldown as 0..1, for drawing a sweep over the button. */
  fraction(id: string): number {
    const def = this.defs.find((d) => d.id === id);
    if (!def) return 0;
    return this.remaining(id) / def.cooldown;
  }

  isReady(id: string): boolean {
    return this.remaining(id) <= 0;
  }

  /** Put an ability on cooldown. Call this only once the cast actually happened. */
  trigger(def: AbilityDef): void {
    this.cooldowns.set(def.id, def.cooldown);
  }

  reset(): void {
    this.cooldowns.clear();
  }
}
