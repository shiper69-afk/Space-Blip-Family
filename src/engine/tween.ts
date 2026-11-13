type Fields = Record<string, number>;

export class Tween {
  done = false;
  private t = 0;
  private from: Fields;
  private to: Fields;
  private returning = false;
  private repeats: number;

  constructor(
    private target: Fields,
    to: Fields,
    private duration: number,
    private opts: { yoyo?: boolean; repeat?: number; onUpdate?: () => void; onComplete?: () => void } = {},
  ) {
    this.from = {};
    this.to = { ...to };
    for (const key of Object.keys(to)) this.from[key] = target[key] ?? 0;
    this.repeats = opts.repeat ?? 0;
  }

  update(dt: number): void {
    if (this.done) return;
    this.t += dt;
    const u = Math.min(1, this.duration <= 0 ? 1 : this.t / this.duration);
    for (const key of Object.keys(this.to)) {
      this.target[key] = this.from[key] + (this.to[key] - this.from[key]) * u;
    }
    this.opts.onUpdate?.();
    if (u < 1) return;
    if (this.opts.yoyo && !this.returning) {
      this.returning = true;
      this.t = 0;
      const next = this.from;
      this.from = this.to;
      this.to = next;
      return;
    }
    if (this.repeats > 0) {
      this.repeats -= 1;
      this.returning = false;
      this.t = 0;
      const next = this.from;
      this.from = this.to;
      this.to = next;
      return;
    }
    this.done = true;
    this.opts.onComplete?.();
  }
}
