/** Deployment resource. Regenerates continuously; every unit costs some to field. */
export class ManaSystem {
  private value: number;

  constructor(
    start: number,
    public readonly max: number,
    private readonly regenPerSecond: number
  ) {
    this.value = start;
  }

  get current(): number {
    return this.value;
  }

  get ratio(): number {
    return this.value / this.max;
  }

  update(dtMs: number): void {
    this.value = Math.min(this.max, this.value + this.regenPerSecond * (dtMs / 1000));
  }

  canAfford(cost: number): boolean {
    return this.value >= cost;
  }

  spend(cost: number): boolean {
    if (!this.canAfford(cost)) return false;
    this.value -= cost;
    return true;
  }
}
