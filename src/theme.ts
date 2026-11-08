/** Godot start screen was authored at 1024×576. */
export const SCALE = 1080 / 576;

export const WIDTH = 1920;
export const HEIGHT = 1080;

export const TITLE = 'Are We There Yet? (Galaxy edition)';

export const FONT = '"Open Sans", Verdana, sans-serif';

export function s(n: number): number {
  return Math.round(n * SCALE);
}
