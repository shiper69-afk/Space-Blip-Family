import { CAST_ANIMS, STILLS } from '../episode/assets';
import { roomScene, type RoomActor, type RoomData, type RoomLoad } from '../engine/room';
import type { Point } from '../engine/nav';
import type { Scene } from '../engine/types';
import { WIDTH } from '../engine/types';

/** Bridge painting is 1024×576, drawn across the 1920×1080 logical view. */
const S = WIDTH / 1024;

/** Published bridge curve, lifted so a figure at the front matches the cutscene scale of 1.85. */
const CURVE_A = 0.0011538461538461537;
const FRONT_SCALE = 1.646;
const CUTSCENE_SCALE = 1.85;

export function perspectiveScale(logicalY: number): number {
  const bridgeY = logicalY / S;
  const raw = Math.min(1.7, Math.max(1.1, CURVE_A * bridgeY + 1));
  return raw * (CUTSCENE_SCALE / FRONT_SCALE);
}

function pt(x: number, y: number): Point {
  return { x: x * S, y: y * S };
}

function ring(points: readonly (readonly [number, number])[]): Point[] {
  return points.map(([x, y]) => pt(x, y));
}

const FLOOR: readonly (readonly [number, number])[] = [
  [70, 564],
  [50, 470],
  [44, 380],
  [80, 300],
  [130, 250],
  [170, 228],
  [190, 214],
  [252, 214],
  [310, 222],
  [420, 220],
  [470, 208],
  [680, 208],
  [750, 228],
  [820, 255],
  [900, 290],
  [980, 330],
  [1008, 400],
  [1000, 480],
  [950, 564],
];

const HOLES: readonly (readonly (readonly [number, number])[])[] = [
  [
    [790, 250],
    [820, 315],
    [940, 325],
    [998, 280],
    [990, 210],
    [920, 180],
    [800, 190],
  ],
  [
    [16, 248],
    [124, 248],
    [124, 340],
    [16, 340],
  ],
  [
    [148, 384],
    [246, 384],
    [246, 460],
    [148, 460],
  ],
  [
    [298, 484],
    [396, 484],
    [396, 572],
    [298, 572],
  ],
  [
    [598, 490],
    [692, 490],
    [692, 572],
    [598, 572],
  ],
  [
    [776, 390],
    [878, 390],
    [878, 460],
    [776, 460],
  ],
  [
    [900, 248],
    [1012, 248],
    [1012, 340],
    [900, 340],
  ],
  [
    [430, 240],
    [600, 230],
    [640, 310],
    [560, 348],
    [450, 348],
    [410, 290],
  ],
];

type AnimName = keyof typeof CAST_ANIMS;

function frameKeys(name: AnimName, prefix: string): { keys: string[]; urls: Record<string, string>; fps: number } {
  const urls: Record<string, string> = {};
  const keys = CAST_ANIMS[name].urls.map((url, index) => {
    const key = `${prefix}-${index}`;
    urls[key] = url;
    return key;
  });
  return { keys, urls, fps: CAST_ANIMS[name].rate };
}

function actor(id: string, name: string, x: number, y: number, player: boolean | undefined, images: Record<string, string>): RoomActor {
  const idle = frameKeys(`${id}-idle` as AnimName, `${id}-idle`);
  const walk = frameKeys(`${id}-walk` as AnimName, `${id}-walk`);
  Object.assign(images, idle.urls, walk.urls);
  return {
    id,
    name,
    at: pt(x, y),
    player,
    idle: idle.keys,
    walk: walk.keys,
    idleFps: idle.fps,
    walkFps: walk.fps,
  };
}

export function cockpitScene(entryId: string, leave: () => void, load?: RoomLoad): Scene {
  const images: Record<string, string> = {
    bridge0: STILLS.bridge0,
    bridge1: STILLS.bridge1,
  };
  const room: RoomData = {
    id: 'cockpit',
    background: ['bridge0', 'bridge1'],
    walkable: { polygon: ring(FLOOR), holes: HOLES.map((hole) => ring(hole)) },
    hotspots: [
      {
        id: 'main-console',
        name: 'Main console',
        polygon: ring([
          [280, 130],
          [470, 100],
          [700, 100],
          [820, 160],
          [760, 214],
          [470, 206],
          [300, 190],
        ]),
        walkTo: pt(360, 240),
        look: 'The main console. DavDav already pressed the only button that mattered.',
        use: "It's quiet. Grandma hung up, and I'm not poking it again.",
      },
      {
        id: 'viewscreen',
        name: 'Viewscreen',
        polygon: ring([
          [599, 47],
          [744, 40],
          [744, 129],
          [599, 121],
        ]),
        walkTo: pt(700, 250),
        look: "Chaya hung up mid-SIMON. The screen is still frozen on her face. That's worse.",
        use: 'If I poke the call it will only get closer. Emotionally.',
      },
      {
        id: 'chair',
        name: "Alan's chair",
        polygon: ring([
          [450, 155],
          [610, 155],
          [650, 250],
          [600, 350],
          [430, 350],
          [400, 250],
        ]),
        walkTo: pt(512, 385),
        look: 'The DAD chair. Still warm. Still lumpy. Still mine.',
        use: 'If I sit down now, Grandma wins on posture alone.',
      },
      {
        id: 'door',
        name: 'Aft hatch',
        polygon: ring([
          [180, 48],
          [239, 48],
          [239, 211],
          [180, 211],
        ]),
        walkTo: pt(229, 259),
        look: "Aft hatch. Joe's still up here, so the hallway can wait.",
        use: 'It stays shut. The corridor is not on this ship yet.',
        exitTo: 'corridor',
        entry: 'from-cockpit',
      },
    ],
    exits: [
      {
        id: 'aft-hatch',
        to: 'corridor',
        entry: 'from-cockpit',
        polygon: ring([
          [180, 48],
          [239, 48],
          [239, 211],
          [180, 211],
        ]),
        walkTo: pt(229, 259),
      },
    ],
    entries: [
      { id: 'after-call', at: pt(460, 520) },
      { id: 'door', at: pt(229, 259) },
    ],
    props: [
      {
        id: 'chair',
        baseline: pt(0, 362).y,
        clip: ring([
          [470, 150],
          [590, 148],
          [645, 210],
          [655, 290],
          [600, 355],
          [470, 362],
          [405, 320],
          [400, 230],
          [440, 175],
        ]),
      },
      {
        id: 'operations',
        baseline: pt(0, 450).y,
        clip: ring([
          [153, 420],
          [165, 366],
          [228, 366],
          [240, 420],
          [228, 441],
          [156, 447],
        ]),
      },
      {
        id: 'cartoons',
        baseline: pt(0, 564).y,
        clip: ring([
          [306, 489],
          [318, 471],
          [372, 471],
          [384, 555],
          [318, 564],
        ]),
      },
      {
        id: 'nav',
        baseline: pt(0, 564).y,
        clip: ring([
          [606, 498],
          [624, 480],
          [663, 480],
          [681, 549],
          [618, 564],
        ]),
      },
      {
        id: 'snacks',
        baseline: pt(0, 450).y,
        clip: ring([
          [783, 387],
          [807, 366],
          [846, 366],
          [870, 417],
          [867, 438],
          [798, 450],
        ]),
      },
    ],
    actors: [
      actor('eithan', 'Eithan', 240, 360, undefined, images),
      actor('davdav', 'DavDav', 620, 420, undefined, images),
      actor('joe', 'Joe', 740, 360, undefined, images),
      actor('naomi', 'Naomi', 250, 500, undefined, images),
      actor('alan', 'Alan', 460, 520, true, images),
      actor('dandan', 'DanDan', 900, 430, undefined, images),
    ],
    scaleAt: perspectiveScale,
    onEnter() {},
    onExit() {},
  };
  return roomScene(room, entryId, leave, images, load);
}
