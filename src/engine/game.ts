import { Assets } from './assets';
import { Input } from './input';
import { Renderer } from './renderer';
import { HEIGHT, WIDTH, type Game, type Node, type Scene } from './types';

const STEP = 1 / 60;

export class Blip implements Game {
  readonly width = WIDTH;
  readonly height = HEIGHT;
  readonly input: Input;
  readonly assets = new Assets();
  private readonly renderer: Renderer;
  private readonly nodes: Node[] = [];
  private readonly stack: Scene[] = [];
  readonly camera = { x: 0, y: 0 };
  private loading = 0;
  private debugOn = false;
  private acc = 0;
  private last = 0;
  private frames = 0;
  private fps = 0;
  private fpsStamp = 0;
  private raf = 0;

  constructor(parent: HTMLElement) {
    this.renderer = new Renderer(parent);
    this.input = new Input(this.renderer.canvas);
    window.addEventListener('resize', () => this.renderer.resize());
    window.addEventListener('keydown', this.onDebugKey);
    this.renderer.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
    this.last = performance.now();
    this.fpsStamp = this.last;
    this.raf = requestAnimationFrame(this.frame);
  }

  add(node: Node): void {
    this.nodes.push(node);
  }

  remove(node: Node): void {
    const index = this.nodes.indexOf(node);
    if (index >= 0) this.nodes.splice(index, 1);
  }

  replace(scene: Scene): void {
    const previous = this.stack.pop();
    previous?.exit?.();
    this.nodes.length = 0;
    this.stack.push(scene);
    void this.boot(scene);
  }

  push(scene: Scene): void {
    this.stack.push(scene);
    void this.boot(scene);
  }

  pop(): void {
    const top = this.stack.pop();
    top?.exit?.();
  }

  private async boot(scene: Scene): Promise<void> {
    if (scene.manifest?.images && Object.keys(scene.manifest.images).length > 0) {
      this.loading = 0.01;
      try {
        await this.assets.load(scene.manifest, (fraction) => {
          this.loading = fraction;
        });
      } catch (error) {
        console.error(error);
      }
    }
    this.loading = 0;
    if (this.stack[this.stack.length - 1] !== scene) return;
    scene.enter(this);
  }

  private onDebugKey = (event: KeyboardEvent): void => {
    if (event.key === 'F3' || event.key === '`') {
      event.preventDefault();
      this.debugOn = !this.debugOn;
    }
  };

  private frame = (now: number): void => {
    this.raf = requestAnimationFrame(this.frame);
    const elapsed = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.acc += elapsed;
    let steps = 0;
    while (this.acc >= STEP && steps < 5) {
      this.stack[this.stack.length - 1]?.update?.(STEP);
      this.input.endFrame();
      this.acc -= STEP;
      steps += 1;
    }
    this.frames += 1;
    if (now - this.fpsStamp >= 500) {
      this.fps = (this.frames * 1000) / (now - this.fpsStamp);
      this.frames = 0;
      this.fpsStamp = now;
    }
    this.renderer.draw(this.nodes, this.camera, (ctx) => this.drawHud(ctx));
  };

  private drawHud(ctx: CanvasRenderingContext2D): void {
    if (this.loading > 0) {
      ctx.fillStyle = '#04050c';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#ffd35e';
      ctx.font = '28px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Loading ${Math.round(this.loading * 100)}%`, WIDTH / 2, HEIGHT / 2);
      return;
    }
    if (!this.debugOn) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(80, 220, 255, 0.85)';
    ctx.lineWidth = 2;
    for (const node of this.nodes) {
      if (!node.visible || !node.hit) continue;
      ctx.strokeRect(node.hit.x, node.hit.y, node.hit.w, node.hit.h);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.fillRect(16, 16, 420, 92);
    ctx.fillStyle = '#b6ff9a';
    ctx.font = '20px "Space Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`FPS ${this.fps.toFixed(0)}`, 28, 46);
    ctx.fillText(`mouse ${this.input.x.toFixed(0)}, ${this.input.y.toFixed(0)}`, 28, 76);
    ctx.fillText('F3 debug', 250, 46);
    ctx.restore();
  }

  stop(): void {
    cancelAnimationFrame(this.raf);
    this.input.dispose();
    window.removeEventListener('keydown', this.onDebugKey);
  }
}
