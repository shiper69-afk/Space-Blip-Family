import { HEIGHT, WIDTH, type InputState } from './types';

export class Input implements InputState {
  x = 0;
  y = 0;
  inside = false;
  left = false;
  right = false;
  esc = false;

  constructor(private canvas: HTMLCanvasElement) {
    canvas.addEventListener('pointerdown', this.onDown);
    canvas.addEventListener('pointermove', this.onMove);
    canvas.addEventListener('pointerleave', this.onLeave);
    window.addEventListener('keydown', this.onKey);
  }

  dispose(): void {
    this.canvas.removeEventListener('pointerdown', this.onDown);
    this.canvas.removeEventListener('pointermove', this.onMove);
    this.canvas.removeEventListener('pointerleave', this.onLeave);
    window.removeEventListener('keydown', this.onKey);
  }

  /** Call at the end of the update so edges only last one tick. */
  endFrame(): void {
    this.left = false;
    this.right = false;
    this.esc = false;
  }

  private toLogical(event: PointerEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    this.x = ((event.clientX - rect.left) / rect.width) * WIDTH;
    this.y = ((event.clientY - rect.top) / rect.height) * HEIGHT;
    this.inside = this.x >= 0 && this.y >= 0 && this.x <= WIDTH && this.y <= HEIGHT;
  }

  private onMove = (event: PointerEvent): void => {
    this.toLogical(event);
  };

  private onLeave = (): void => {
    this.inside = false;
  };

  private onDown = (event: PointerEvent): void => {
    this.toLogical(event);
    if (event.button === 0) this.left = true;
    if (event.button === 2) this.right = true;
  };

  private onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this.esc = true;
  };
}
