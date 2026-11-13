import type { Layer, Node } from './types';

export type Clip = {
  name: string;
  frames: HTMLImageElement[];
  fps: number;
  /** -1 loops. Otherwise the clip plays this many extra times after the first. */
  repeat: number;
  anchors?: FrameAnchor[];
};

/** Per-frame anchor, falling back to the sprite anchor. Talk and idle share 0.5, 1. */
export type FrameAnchor = { x: number; y: number };

export class Sprite implements Node {
  layer: Layer = 'characters';
  x = 0;
  y = 0;
  scale = 1;
  flipX = false;
  visible = true;
  alpha = 1;
  anchorX = 0.5;
  anchorY = 1;
  /** When set, used instead of the feet position for depth. */
  sortAt: number | null = null;
  image: HTMLImageElement | null = null;
  clip: Clip | null = null;
  frame = 0;
  hit = null;
  clipDone: (() => void) | null = null;
  private time = 0;
  private playing = false;
  private playsLeft = 0;

  get depth(): number {
    if (this.sortAt != null) return this.sortAt;
    if (!this.image || this.anchorY === 1) return this.y;
    return this.y + this.image.height * this.scale * (1 - this.anchorY);
  }

  play(clip: Clip, onDone?: () => void): void {
    this.clip = clip;
    this.frame = 0;
    this.time = 0;
    this.playing = clip.frames.length > 0;
    this.playsLeft = clip.repeat < 0 ? Number.POSITIVE_INFINITY : clip.repeat + 1;
    this.clipDone = onDone ?? null;
    this.image = clip.frames[0] ?? null;
  }

  stop(image?: HTMLImageElement): void {
    this.playing = false;
    this.clip = null;
    if (image) this.image = image;
  }

  update(dt: number): void {
    if (!this.playing || !this.clip || this.clip.frames.length === 0) return;
    const step = 1 / this.clip.fps;
    this.time += dt;
    while (this.playing && this.time >= step) {
      this.time -= step;
      this.frame += 1;
      if (this.frame < this.clip.frames.length) continue;
      this.playsLeft -= 1;
      if (this.clip.repeat < 0 || this.playsLeft > 0) {
        this.frame = 0;
      } else {
        this.frame = this.clip.frames.length - 1;
        this.playing = false;
        this.clipDone?.();
        this.clipDone = null;
      }
    }
    this.image = this.clip.frames[Math.min(this.frame, this.clip.frames.length - 1)] ?? null;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.visible || !this.image) return;
    const frameAnchor = this.clip?.anchors?.[this.frame];
    const ax = frameAnchor?.x ?? this.anchorX;
    const ay = frameAnchor?.y ?? this.anchorY;
    const w = this.image.width * this.scale;
    const h = this.image.height * this.scale;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    if (this.flipX) ctx.scale(-1, 1);
    ctx.drawImage(this.image, -w * ax, -h * ay, w, h);
    ctx.restore();
  }
}
