import { HEIGHT, WIDTH, type Layer, type Node } from './types';

const LAYER_INDEX: Record<Layer, number> = {
  background: 0,
  walkbehind: 1,
  characters: 2,
  foreground: 3,
  ui: 4,
};

/** 1920×1080 logical canvas, letterboxed into the window. Backing store uses device pixels. */
export class Renderer {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  private dpr = 1;

  constructor(parent: HTMLElement) {
    const canvas = document.createElement('canvas');
    canvas.id = 'blip-view';
    parent.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas is not available');
    this.canvas = canvas;
    this.ctx = ctx;
    this.resize();
  }

  resize(): void {
    const parent = this.canvas.parentElement;
    const cssW = parent?.clientWidth || window.innerWidth;
    const cssH = parent?.clientHeight || window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const scale = Math.min(cssW / WIDTH, cssH / HEIGHT);
    const viewW = WIDTH * scale;
    const viewH = HEIGHT * scale;
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = `${(cssW - viewW) / 2}px`;
    this.canvas.style.top = `${(cssH - viewH) / 2}px`;
    this.canvas.style.width = `${viewW}px`;
    this.canvas.style.height = `${viewH}px`;
    this.canvas.width = Math.round(WIDTH * this.dpr);
    this.canvas.height = Math.round(HEIGHT * this.dpr);
  }

  draw(nodes: Node[], debug: (ctx: CanvasRenderingContext2D) => void): void {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;

    const visible = nodes.filter((node) => node.visible);
    visible.sort((a, b) => {
      const layer = LAYER_INDEX[a.layer] - LAYER_INDEX[b.layer];
      if (layer !== 0) return layer;
      return a.depth - b.depth;
    });
    for (const node of visible) node.draw(ctx);
    debug(ctx);
  }
}
