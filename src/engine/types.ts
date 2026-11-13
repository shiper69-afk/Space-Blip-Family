export const WIDTH = 1920;
export const HEIGHT = 1080;

export const LAYERS = ['background', 'walkbehind', 'characters', 'foreground', 'ui'] as const;
export type Layer = (typeof LAYERS)[number];

export type Rect = { x: number; y: number; w: number; h: number };

/** Something the renderer draws. Within a layer, higher `depth` (feet Y) is in front. */
export type Node = {
  layer: Layer;
  depth: number;
  visible: boolean;
  draw: (ctx: CanvasRenderingContext2D) => void;
  hit?: Rect | null;
};

export type Manifest = {
  images?: Record<string, string>;
};

export type Game = {
  readonly width: number;
  readonly height: number;
  readonly input: InputState;
  readonly assets: AssetBank;
  readonly camera: { x: number; y: number };
  add(node: Node): void;
  remove(node: Node): void;
  replace(scene: Scene): void;
  push(scene: Scene): void;
  pop(): void;
};

export type Scene = {
  manifest?: Manifest;
  enter(game: Game): void;
  update?(dt: number): void;
  exit?(): void;
};

export type InputState = {
  /** Logical 1920×1080 coordinates. */
  x: number;
  y: number;
  inside: boolean;
  /** True for the frame a button went down. */
  left: boolean;
  right: boolean;
  esc: boolean;
};

export type AssetBank = {
  image(key: string): HTMLImageElement | undefined;
  load(manifest: Manifest, onProgress?: (fraction: number) => void): Promise<void>;
};
