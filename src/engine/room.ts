import { findPath, nearestWalkable, pointInPolygon, type Point, type Walkable } from './nav';
import { Sprite, type Clip } from './sprite';
import { HEIGHT, WIDTH, type Game, type Manifest, type Node, type Scene } from './types';
import { FONT } from '../theme';

export type Hotspot = {
  id: string;
  name: string;
  polygon: Point[];
  look: string;
  use: string;
  walkTo: Point;
  /** When set, a left click walks here and then loads that room if it exists. */
  exitTo?: string;
  entry?: string;
};

export type Exit = {
  id: string;
  to: string;
  entry: string;
  polygon: Point[];
  walkTo: Point;
};

export type Entry = {
  id: string;
  at: Point;
};

/** A painted object. `clip` redraws the background so characters can stand behind it. */
export type RoomProp = {
  id: string;
  baseline: number;
  clip?: Point[];
  image?: string;
  x?: number;
  y?: number;
};

export type RoomActor = {
  id: string;
  name: string;
  at: Point;
  player?: boolean;
  idle: string[];
  walk: string[];
  idleFps: number;
  walkFps: number;
};

export type RoomData = {
  id: string;
  /** Asset keys, first frame is shown and later frames blink if more than one. */
  background: string[];
  walkable: Walkable;
  hotspots: Hotspot[];
  exits: Exit[];
  entries: Entry[];
  props: RoomProp[];
  actors: RoomActor[];
  /** Feet Y to sprite scale. Defaults to 1. */
  scaleAt?: (feetY: number) => number;
  onEnter?: (game: Game) => void;
  onExit?: (game: Game) => void;
};

export type RoomLoad = (id: string, entry: string) => Scene | undefined;

const SPEED = 520;

function polygonArea(poly: Point[]): number {
  let sum = 0;
  for (let i = 0; i < poly.length; i++) {
    const next = poly[(i + 1) % poly.length];
    sum += poly[i].x * next.y - next.x * poly[i].y;
  }
  return Math.abs(sum) / 2;
}

function clipPath(ctx: CanvasRenderingContext2D, poly: Point[]): void {
  ctx.beginPath();
  ctx.moveTo(poly[0].x, poly[0].y);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
  ctx.closePath();
}

function strokePoly(ctx: CanvasRenderingContext2D, poly: Point[]): void {
  clipPath(ctx, poly);
  ctx.stroke();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Plays a room. `images` maps asset keys (background, frames, props) to URLs. */
export function roomScene(room: RoomData, entryId: string, leave: () => void, images: Record<string, string>, load?: RoomLoad): Scene {
  const manifest: Manifest = { images };
  let game: Game;
  let bgFrame = 0;
  let bgTime = 0;
  let bg: HTMLImageElement | null = null;
  const actors = new Map<string, Sprite>();
  let player: Sprite | undefined;
  let playerId = '';
  let path: Point[] = [];
  let pathAt = 0;
  let gait = '';
  let line: { speaker: string; text: string } | null = null;
  let pending: (() => void) | null = null;
  const idleClip = new Map<string, Clip>();
  const walkClip = new Map<string, Clip>();

  const scaleOf = (y: number) => room.scaleAt?.(y) ?? 1;

  const say = (speaker: string, text: string) => {
    line = { speaker, text };
  };

  const poseIdle = (sprite: Sprite, id: string) => {
    const clip = idleClip.get(id);
    sprite.flipX = false;
    sprite.stop(clip?.frames[0]);
    gait = id === playerId ? 'idle' : gait;
  };

  const setGait = (id: string, sprite: Sprite, dx: number, dy: number) => {
    const side = Math.abs(dx) >= Math.abs(dy);
    const walk = walkClip.get(id);
    const next = side && walk && walk.frames.length > 0 ? (dx < 0 ? 'left' : 'right') : 'idle';
    if (gait === next) {
      sprite.flipX = next === 'left';
      return;
    }
    gait = next;
    if (next === 'idle') {
      const clip = idleClip.get(id);
      if (clip && clip.frames.length > 1) sprite.play(clip);
      else sprite.stop(clip?.frames[0]);
      sprite.flipX = false;
      return;
    }
    if (walk) sprite.play(walk);
    sprite.flipX = next === 'left';
  };

  const arrive = () => {
    if (player) poseIdle(player, playerId);
    path = [];
    const done = pending;
    pending = null;
    done?.();
  };

  const walkTo = (goal: Point, then?: () => void) => {
    if (!player) return;
    pending = then ?? null;
    const from = { x: player.x, y: player.y };
    path = findPath(room.walkable, from, goal);
    pathAt = 0;
    if (path.length <= 1 || (path.length === 2 && Math.hypot(path[1].x - from.x, path[1].y - from.y) < 6)) {
      path = [];
      arrive();
    }
  };

  const hotspotAt = (x: number, y: number): Hotspot | undefined => {
    const hit = room.hotspots.filter((spot) => pointInPolygon({ x, y }, spot.polygon));
    hit.sort((a, b) => polygonArea(a.polygon) - polygonArea(b.polygon));
    return hit[0];
  };

  const scene: Scene = {
    manifest,
    enter(active) {
      game = active;
      room.onEnter?.(active);
      bg = active.assets.image(room.background[0]) ?? null;
      const background: Node = {
        layer: 'background',
        depth: 0,
        visible: true,
        draw(ctx) {
          if (!bg) return;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(bg, 0, 0, WIDTH, HEIGHT);
        },
      };
      active.add(background);

      for (const prop of room.props) {
        const image = prop.image ? active.assets.image(prop.image) : undefined;
        const node: Node = {
          layer: 'characters',
          depth: prop.baseline,
          visible: true,
          draw(ctx) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            if (prop.clip && prop.clip.length > 2 && bg) {
              clipPath(ctx, prop.clip);
              ctx.clip();
              ctx.drawImage(bg, 0, 0, WIDTH, HEIGHT);
            } else if (image && prop.x != null && prop.y != null) {
              ctx.drawImage(image, prop.x, prop.y);
            }
            ctx.restore();
          },
        };
        active.add(node);
      }

      for (const spec of room.actors) {
        const idleFrames = spec.idle.map((key) => active.assets.image(key)).filter((frame): frame is HTMLImageElement => !!frame);
        const walkFrames = spec.walk.map((key) => active.assets.image(key)).filter((frame): frame is HTMLImageElement => !!frame);
        idleClip.set(spec.id, { name: `${spec.id}-idle`, frames: idleFrames, fps: spec.idleFps, repeat: -1 });
        walkClip.set(spec.id, { name: `${spec.id}-walk`, frames: walkFrames, fps: spec.walkFps, repeat: -1 });
        const sprite = new Sprite();
        sprite.x = spec.at.x;
        sprite.y = spec.at.y;
        sprite.scale = scaleOf(spec.at.y);
        sprite.stop(idleFrames[0]);
        actors.set(spec.id, sprite);
        active.add(sprite);
        if (spec.player) {
          player = sprite;
          playerId = spec.id;
        }
      }

      const entry = room.entries.find((item) => item.id === entryId) ?? room.entries[0];
      if (player && entry) {
        const at = nearestWalkable(entry.at, room.walkable);
        player.x = at.x;
        player.y = at.y;
        player.scale = scaleOf(at.y);
      }

      const ui: Node = {
        layer: 'ui',
        depth: 0,
        visible: true,
        draw(ctx) {
          if (!line) return;
          ctx.font = `28px ${FONT}`;
          const rows = wrap(ctx, line.text, 1620);
          const lineH = 34;
          const textH = rows.length * lineH;
          const top = HEIGHT - 36 - textH - 42;
          const boxH = textH + 64;
          ctx.fillStyle = 'rgba(7,11,24,0.9)';
          ctx.strokeStyle = '#d9b338';
          ctx.lineWidth = 3;
          ctx.fillRect((WIDTH - 1760) / 2, top, 1760, boxH);
          ctx.strokeRect((WIDTH - 1760) / 2, top, 1760, boxH);
          ctx.fillStyle = '#ffd35e';
          ctx.font = `26px ${FONT}`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(line.speaker, 150, top + 6);
          ctx.font = `28px ${FONT}`;
          ctx.fillStyle = '#f4f7ff';
          rows.forEach((row, index) => ctx.fillText(row, 150, top + 40 + index * lineH));
        },
      };
      active.add(ui);
    },
    update(dt) {
      if (game.input.esc) {
        leave();
        return;
      }
      if (game.input.inside && (game.input.left || game.input.right)) {
        if (line) {
          line = null;
        } else if (game.input.right) {
          const spot = hotspotAt(game.input.x, game.input.y);
          if (spot && player) {
            path = [];
            pending = null;
            poseIdle(player, playerId);
            say(room.actors.find((actor) => actor.player)?.name ?? 'Alan', spot.look);
          }
        } else {
          const spot = hotspotAt(game.input.x, game.input.y);
          if (spot) {
            walkTo(spot.walkTo, () => {
              const actor = room.actors.find((item) => item.player);
              if (spot.exitTo) {
                const next = load?.(spot.exitTo, spot.entry ?? '');
                if (next) {
                  game.replace(next);
                  return;
                }
              }
              say(actor?.name ?? spot.name, spot.use);
            });
          } else {
            walkTo({ x: game.input.x, y: game.input.y });
          }
        }
      }

      if (player && path.length > 0) {
        let left = SPEED * dt;
        let dx = 0;
        let dy = 0;
        while (left > 0 && pathAt < path.length) {
          const target = path[pathAt];
          const stepX = target.x - player.x;
          const stepY = target.y - player.y;
          const step = Math.hypot(stepX, stepY);
          if (step < 0.5) {
            pathAt += 1;
            continue;
          }
          dx = stepX;
          dy = stepY;
          if (step <= left) {
            player.x = target.x;
            player.y = target.y;
            left -= step;
            pathAt += 1;
          } else {
            player.x += (stepX / step) * left;
            player.y += (stepY / step) * left;
            left = 0;
          }
        }
        player.scale = scaleOf(player.y);
        if (pathAt >= path.length) arrive();
        else setGait(playerId, player, dx, dy);
      }

      for (const sprite of actors.values()) {
        sprite.scale = scaleOf(sprite.y);
        sprite.update(dt);
      }
      if (room.background.length > 1) {
        bgTime += dt;
        if (bgTime >= 0.65) {
          bgTime = 0;
          bgFrame = (bgFrame + 1) % room.background.length;
          bg = game.assets.image(room.background[bgFrame]) ?? bg;
        }
      }
    },
    exit() {
      room.onExit?.(game);
    },
    debug(ctx) {
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(80, 220, 120, 0.95)';
      ctx.fillStyle = 'rgba(80, 220, 120, 0.12)';
      clipPath(ctx, room.walkable.polygon);
      ctx.fill();
      strokePoly(ctx, room.walkable.polygon);
      ctx.strokeStyle = 'rgba(255, 80, 80, 0.95)';
      ctx.fillStyle = 'rgba(255, 80, 80, 0.18)';
      for (const hole of room.walkable.holes) {
        clipPath(ctx, hole);
        ctx.fill();
        strokePoly(ctx, hole);
      }
      ctx.strokeStyle = 'rgba(255, 80, 220, 0.9)';
      ctx.fillStyle = 'rgba(255, 80, 220, 0.7)';
      ctx.font = '18px "Space Mono", monospace';
      ctx.textAlign = 'left';
      for (const spot of room.hotspots) {
        strokePoly(ctx, spot.polygon);
        ctx.fillText(spot.name, spot.walkTo.x, spot.walkTo.y);
      }
      ctx.strokeStyle = 'rgba(255, 220, 60, 0.95)';
      for (const prop of room.props) {
        const xs = prop.clip?.map((point) => point.x) ?? [prop.x ?? 0];
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        ctx.beginPath();
        ctx.moveTo(minX, prop.baseline);
        ctx.lineTo(maxX, prop.baseline);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 220, 60, 0.95)';
        ctx.fillText(`${prop.id} y${prop.baseline.toFixed(0)}`, minX, prop.baseline - 8);
      }
      if (path.length > 1) {
        ctx.strokeStyle = 'rgba(80, 200, 255, 0.95)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
        ctx.stroke();
      }
      ctx.restore();
    },
  };
  return scene;
}
