import { CAST_ANIMS, STILLS } from '../episode/assets';
import { EPISODE_SCRIPT, type ScriptLine } from '../episode/script';
import { Sprite, type Clip } from '../engine/sprite';
import { Tween } from '../engine/tween';
import { HEIGHT, WIDTH, type Game, type Manifest, type Node, type Scene } from '../engine/types';
import { FONT } from '../theme';

const S = WIDTH / 1024;
const SCREEN_QUAD: readonly [number, number][] = [
  [599, 47],
  [744, 40],
  [744, 129],
  [599, 121],
];
const SCREEN_X = 599 * S;
const SCREEN_Y = 40 * S;
const SCREEN_W = 145 * S;
const SCREEN_H = 89 * S;
const SCREEN_CX = 671.5 * S;
const SCREEN_CY = 84.25 * S;
const DOOR_FEET_X = 209 * S;
const DOOR_FEET_Y = 225 * S;

type Mode = 'banner' | 'script' | 'end';

function manifest(): Manifest {
  const images: Record<string, string> = {
    bridge0: STILLS.bridge0,
    bridge1: STILLS.bridge1,
    grandmaBg: STILLS.grandmaBg,
  };
  for (const [key, anim] of Object.entries(CAST_ANIMS)) {
    anim.urls.forEach((url, index) => {
      images[`${key}-${index}`] = url;
    });
  }
  return { images };
}

function clipOf(game: Game, name: string): Clip {
  const spec = CAST_ANIMS[name as keyof typeof CAST_ANIMS];
  const frames = spec.urls.map((_, index) => game.assets.image(`${name}-${index}`)).filter((frame): frame is HTMLImageElement => !!frame);
  return { name, frames, fps: spec.rate, repeat: spec.repeat };
}

function clipScreen(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.moveTo(SCREEN_QUAD[0][0] * S, SCREEN_QUAD[0][1] * S);
  for (let i = 1; i < SCREEN_QUAD.length; i += 1) ctx.lineTo(SCREEN_QUAD[i][0] * S, SCREEN_QUAD[i][1] * S);
  ctx.closePath();
  ctx.clip();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(' ');
    let line = '';
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > width) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    if (line) lines.push(line);
  }
  return lines;
}

export function episodeScene(backToStart: () => void): Scene {
  const clips = new Map<string, Clip>();
  const tweens: Tween[] = [];
  const actors: Record<string, Sprite> = {};
  let game: Game;
  let mode: Mode = 'banner';
  let armed = false;
  let leaving = false;
  let line = 0;
  let alanAwake = false;
  let bridgeFrame = 0;
  let bridgeTime = 0;
  let alarm = 0;
  let light = 0;
  let laundryOn = true;

  const bridge = new Sprite();
  const alanSleep = new Sprite();
  const alan = new Sprite();
  const naomi = new Sprite();
  const joe = new Sprite();
  const dandan = new Sprite();
  const eithan = new Sprite();
  const davdav = new Sprite();
  const chayaBg = new Sprite();
  const chaya = new Sprite();
  const door = new Sprite();
  const zzz = new Sprite();

  const tween = (
    target: Record<string, number>,
    to: Record<string, number>,
    duration: number,
    opts?: { yoyo?: boolean; repeat?: number; onUpdate?: () => void; onComplete?: () => void },
  ) => {
    tweens.push(new Tween(target, to, duration, opts));
  };

  const pose = (sprite: Sprite, id: string) => {
    const idle = clips.get(`${id}-idle`);
    sprite.stop(idle?.frames[0]);
    sprite.flipX = false;
  };

  const standTalkers = () => {
    for (const [id, sprite] of Object.entries(actors)) {
      if (!sprite.visible || !sprite.clip?.name.includes('talk')) continue;
      pose(sprite, id);
    }
    if (chaya.visible && chaya.clip?.name === 'chaya-talk') {
      const idle = clips.get('chaya-idle');
      if (idle) chaya.play(idle);
    }
  };

  const talk = (speaker?: string) => {
    const name = speaker?.split(' ')[0];
    if (name === 'Chaya' && chaya.visible) {
      const next = clips.get('chaya-talk');
      if (next) chaya.play(next);
      return;
    }
    if (chaya.visible && chaya.clip?.name === 'chaya-talk') {
      const idle = clips.get('chaya-idle');
      if (idle) chaya.play(idle);
    }
    const ids: Record<string, Sprite | undefined> = {
      Alan: alanAwake ? alan : undefined,
      Naomi: naomi,
      Joe: joe,
      DanDan: dandan,
      Eithan: eithan,
      DavDav: davdav,
    };
    const id = name ? { Alan: 'alan', Naomi: 'naomi', Joe: 'joe', DanDan: 'dandan', Eithan: 'eithan', DavDav: 'davdav' }[name] : undefined;
    const sprite = name ? ids[name] : undefined;
    const clip = id ? clips.get(`${id}-talk-down`) : undefined;
    if (sprite?.visible && clip) {
      sprite.flipX = false;
      sprite.play(clip);
    }
  };

  const openDoor = () => {
    const clip = clips.get('door-open');
    if (clip) door.play(clip);
    door.visible = true;
  };

  const enter = (id: string, sprite: Sprite, x: number, y: number, walk: string) => {
    openDoor();
    sprite.visible = true;
    sprite.x = DOOR_FEET_X;
    sprite.y = DOOR_FEET_Y;
    sprite.scale = S;
    sprite.flipX = x < DOOR_FEET_X;
    const walking = clips.get(walk);
    if (walking) sprite.play(walking);
    tween(sprite as unknown as Record<string, number>, { x, y, scale: 1.85 }, 0.9, {
      onUpdate: () => undefined,
      onComplete: () => poseActor(sprite, id),
    });
  };

  const poseActor = (sprite: Sprite, id: string) => pose(sprite, id);

  let boxText = '';
  let boxSpeaker = '';
  let boxKind: 'dialogue' | 'narrator' | 'computer' = 'dialogue';
  let boxOn = false;
  let bannerOn = true;
  let endOn = false;
  let incomingOn = false;
  let endedOn = false;
  let sockOn = false;
  let sandwichOn = false;
  let laundryOnScreen = false;
  let alarmAlpha = 0;

  const showFrom = (index: number) => {
    let i = index;
    while (i < EPISODE_SCRIPT.length) {
      const step = EPISODE_SCRIPT[i];
      if (step.action === 'end') {
        line = i;
        endOn = true;
        boxOn = false;
        mode = 'end';
        return;
      }
      if (step.action) run(step.action);
      if (step.text && step.speaker && step.speaker !== 'CAPTION') {
        line = i;
        showLine(step);
        return;
      }
      i += 1;
    }
    line = i;
    endOn = true;
    boxOn = false;
    mode = 'end';
  };

  const showLine = (step: ScriptLine) => {
    boxOn = true;
    boxText = step.text ?? '';
    boxSpeaker = step.speaker ?? '';
    boxKind = step.speaker === 'Narrator' ? 'narrator' : step.speaker === 'Ship Computer' ? 'computer' : 'dialogue';
    talk(step.speaker);
  };

  const run = (action: string) => {
    switch (action) {
      case 'opening':
        joe.visible = false;
        dandan.visible = false;
        eithan.visible = false;
        naomi.visible = false;
        alan.visible = false;
        alanSleep.visible = true;
        alanSleep.play(clips.get('alan-sleep')!);
        zzz.visible = true;
        zzz.play(clips.get('zzz')!);
        davdav.visible = true;
        davdav.x = 1040;
        davdav.y = 780;
        davdav.scale = 1.85;
        pose(davdav, 'davdav');
        break;
      case 'davdav-run':
        davdav.flipX = false;
        davdav.play(clips.get('davdav-walk')!);
        tween(davdav as unknown as Record<string, number>, { x: 1280, y: 560, scale: 1.7 }, 0.7, {
          onComplete: () => pose(davdav, 'davdav'),
        });
        break;
      case 'davdav-wave':
        davdav.play(clips.get('davdav-wave')!);
        break;
      case 'incoming-call':
        incomingOn = true;
        break;
      case 'press-console':
        tween(davdav as unknown as Record<string, number>, { y: davdav.y - 18 }, 0.09, { yoyo: true });
        incomingOn = false;
        chayaBg.visible = true;
        chaya.visible = true;
        chaya.x = SCREEN_X;
        chaya.y = SCREEN_Y;
        chaya.play(clips.get('chaya-talk')!);
        break;
      case 'grandma-lean':
        chaya.play(clips.get('chaya-idle')!);
        tween(chaya as unknown as Record<string, number>, { y: SCREEN_Y + 12 }, 0.4);
        break;
      case 'grandma-chin':
        tween(chaya as unknown as Record<string, number>, { y: SCREEN_Y + SCREEN_H * 0.42 }, 0.5);
        break;
      case 'grandma-reset':
        chaya.play(clips.get('chaya-talk')!);
        tween(chaya as unknown as Record<string, number>, { y: SCREEN_Y }, 0.4);
        break;
      case 'chaya-sigh':
      case 'chaya-jab':
        chaya.play(clips.get('chaya-judge')!);
        break;
      case 'alan-jolt':
        alanAwake = true;
        zzz.visible = false;
        alanSleep.play(clips.get('alan-jolt')!, () => {
          alanSleep.visible = false;
          alan.visible = true;
          alan.x = 820;
          alan.y = 900;
          alan.scale = 1.85;
          pose(alan, 'alan');
        });
        break;
      case 'alan-call':
        tween(alan as unknown as Record<string, number>, { scale: alan.scale * 1.06 }, 0.14, { yoyo: true });
        break;
      case 'footsteps':
        openDoor();
        alarm = 0;
        game.camera.x = 0;
        shake(0.42, 6);
        break;
      case 'naomi-enter':
        enter('naomi', naomi, 1420, 880, 'naomi-walk');
        break;
      case 'joe-enter':
        enter('joe', joe, 520, 880, 'joe-walk');
        break;
      case 'dandan-enter':
        enter('dandan', dandan, 1120, 920, 'dandan-walk');
        break;
      case 'eithan-enter':
        enter('eithan', eithan, 1720, 880, 'eithan-walk');
        window.setTimeout(() => {
          const closing = clips.get('door-close');
          if (closing && door.clip?.name !== 'door-open') door.play(closing);
          else if (closing) door.play(closing);
        }, 700);
        break;
      case 'show-mess':
        sockOn = true;
        sandwichOn = true;
        laundryOnScreen = true;
        break;
      case 'naomi-elbow':
        tween(naomi as unknown as Record<string, number>, { x: naomi.x - 36 }, 0.18, { yoyo: true });
        break;
      case 'call-ended':
        chaya.stop(clips.get('chaya-idle')?.frames[0]);
        endedOn = true;
        break;
      case 'alarms':
        alarm = 1.3;
        for (const sprite of [joe, dandan, naomi, eithan, alan]) {
          if (!sprite.visible) continue;
          const toward = Math.sign(davdav.x - sprite.x) * 20;
          tween(sprite as unknown as Record<string, number>, { x: sprite.x + toward }, 0.5);
        }
        break;
      case 'alan-hero': {
        const hero = clips.get('alan-hero');
        if (hero) alan.play(hero);
        tween(alan as unknown as Record<string, number>, { x: 820, y: 860 }, 0.5);
        break;
      }
      case 'alan-trip': {
        const fall = clips.get('alan-fall');
        if (fall) alan.play(fall);
        tween(alan as unknown as Record<string, number>, { x: 900, y: 940 }, 0.38);
        shake(0.32, 18);
        break;
      }
      default:
        break;
    }
  };

  const shake = (seconds: number, magnitude: number) => {
    alarm = Math.max(alarm, 0);
    shakeLeft = seconds;
    shakeMag = magnitude;
  };
  let shakeLeft = 0;
  let shakeMag = 0;

  const ui: Node = {
    layer: 'ui',
    depth: 0,
    visible: true,
    draw(ctx) {
      ctx.save();
      ctx.setTransform(ctx.getTransform());
      if (bannerOn) {
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(10,13,26,0.94)';
        ctx.strokeStyle = '#d9b338';
        ctx.lineWidth = 4;
        ctx.fillRect(410, 440, 1100, 200);
        ctx.strokeRect(410, 440, 1100, 200);
        ctx.fillStyle = '#ffdb47';
        ctx.font = '52px "Open Sans", Verdana, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Episode 1: Grandma is calling', WIDTH / 2, HEIGHT / 2);
      }
      if (mode === 'script') {
        ctx.fillStyle = '#ffd35e';
        ctx.font = `28px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('INT. COCKPIT', WIDTH / 2, 36);
      }
      if (boxOn) drawBox(ctx);
      if (endOn) {
        ctx.fillStyle = 'rgba(10,13,26,0.94)';
        ctx.strokeStyle = '#d9b338';
        ctx.lineWidth = 4;
        ctx.fillRect(580, 460, 760, 160);
        ctx.strokeRect(580, 460, 760, 160);
        ctx.fillStyle = '#ffdb47';
        ctx.font = '48px "Open Sans", Verdana, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('To be continued...', WIDTH / 2, 540);
      }
      if (alarmAlpha > 0) {
        ctx.fillStyle = `rgba(255, 138, 0, ${alarmAlpha})`;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
      }
      ctx.restore();
    },
  };

  const drawBox = (ctx: CanvasRenderingContext2D) => {
    ctx.font = `28px ${FONT}`;
    const width = boxKind === 'dialogue' ? 1620 : 1500;
    const lines = wrap(ctx, boxText, width);
    const lineH = 34;
    const textH = lines.length * lineH;
    const top = HEIGHT - 36 - textH - (boxKind === 'dialogue' ? 42 : 16);
    const boxH = textH + (boxKind === 'dialogue' ? 64 : 36);
    ctx.fillStyle = boxKind === 'computer' ? 'rgba(6,32,24,0.9)' : boxKind === 'narrator' ? 'rgba(16,24,46,0.9)' : 'rgba(7,11,24,0.9)';
    ctx.strokeStyle = boxKind === 'computer' ? '#3dff9a' : boxKind === 'narrator' ? '#8eb4ff' : '#d9b338';
    ctx.lineWidth = 3;
    ctx.fillRect((WIDTH - 1760) / 2, top, 1760, boxH);
    ctx.strokeRect((WIDTH - 1760) / 2, top, 1760, boxH);
    ctx.textBaseline = 'top';
    if (boxKind === 'dialogue') {
      ctx.fillStyle = '#ffd35e';
      ctx.font = `26px ${FONT}`;
      ctx.textAlign = 'left';
      ctx.fillText(boxSpeaker, 150, top + 6);
    }
    ctx.font = `28px ${FONT}`;
    ctx.fillStyle = boxKind === 'computer' ? '#d9ffe8' : boxKind === 'narrator' ? '#d7e6ff' : '#f4f7ff';
    ctx.textAlign = boxKind === 'dialogue' ? 'left' : 'center';
    lines.forEach((row, index) => {
      const x = boxKind === 'dialogue' ? 150 : WIDTH / 2;
      ctx.fillText(row, x, top + (boxKind === 'dialogue' ? 40 : 12) + index * lineH);
    });
  };

  const decor: Node = {
    layer: 'foreground',
    depth: 0,
    visible: true,
    draw(ctx) {
      if (sockOn) {
        ctx.save();
        ctx.translate(1140, 892);
        ctx.rotate(-0.35);
        ctx.fillStyle = '#6b4a32';
        ctx.beginPath();
        ctx.ellipse(0, 0, 27, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#f0d2b0';
        ctx.font = `16px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.fillText('SOCK', 1140, 922);
      }
      if (sandwichOn) {
        ctx.fillStyle = '#e2c48a';
        ctx.fillRect(1195, 64, 90, 28);
        ctx.fillStyle = '#6aaa3a';
        ctx.fillRect(1201, 73, 78, 10);
        ctx.fillStyle = '#f3e2b0';
        ctx.font = `16px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.fillText('SANDWICH', 1240, 110);
      }
      if (laundryOnScreen) {
        ctx.fillStyle = '#3d4d88';
        ctx.strokeStyle = '#ffd35e';
        ctx.lineWidth = 2;
        ctx.fillRect(1260, 833, 120, 54);
        ctx.strokeRect(1260, 833, 120, 54);
        ctx.fillStyle = laundryOn ? '#ffb000' : 'rgba(255,176,0,0.2)';
        ctx.beginPath();
        ctx.arc(1348, 848, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d5e2ff';
        ctx.font = `16px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.fillText('LAUNDRY', 1320, 866);
      }
    },
  };

  const screen: Node = {
    layer: 'walkbehind',
    depth: 0,
    visible: true,
    draw(ctx) {
      ctx.save();
      clipScreen(ctx);
      if (chayaBg.visible && chayaBg.image) {
        ctx.drawImage(chayaBg.image, SCREEN_X, SCREEN_Y, SCREEN_W, SCREEN_H);
      }
      if (chaya.visible && chaya.image) {
        ctx.drawImage(chaya.image, chaya.x, chaya.y, SCREEN_W, SCREEN_H);
      }
      if (incomingOn) {
        ctx.fillStyle = 'rgba(18, 8, 24, 0.96)';
        ctx.fillRect(SCREEN_X, SCREEN_Y, SCREEN_W, SCREEN_H);
        ctx.fillStyle = '#ffd0e6';
        ctx.font = `18px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('INCOMING CALL:', SCREEN_CX, SCREEN_CY - 14);
        ctx.fillText('GRANDMA ❤️ ❤️ ❤️', SCREEN_CX, SCREEN_CY + 14);
      }
      if (endedOn) {
        ctx.fillStyle = 'rgba(18, 8, 24, 0.55)';
        ctx.fillRect(SCREEN_X, SCREEN_Y, SCREEN_W, SCREEN_H);
        ctx.fillStyle = '#ff5a5a';
        ctx.font = `22px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('CALL ENDED', SCREEN_CX, SCREEN_CY);
      }
      ctx.restore();
    },
  };

  return {
    manifest: manifest(),
    enter(active) {
      game = active;
      for (const name of Object.keys(CAST_ANIMS)) clips.set(name, clipOf(active, name));
      const place = (sprite: Sprite, id: string) => {
        actors[id] = sprite;
        sprite.visible = false;
        sprite.anchorX = 0.5;
        sprite.anchorY = 1;
        sprite.scale = 1.85;
        pose(sprite, id);
        active.add(sprite);
      };
      bridge.layer = 'background';
      bridge.anchorX = 0;
      bridge.anchorY = 0;
      bridge.scale = S;
      bridge.image = active.assets.image('bridge0') ?? null;
      active.add(bridge);

      for (const [id, sprite] of [
        ['joe', joe],
        ['dandan', dandan],
        ['eithan', eithan],
        ['naomi', naomi],
        ['alan', alan],
        ['davdav', davdav],
      ] as const) place(sprite, id);

      alanSleep.anchorX = 0;
      alanSleep.anchorY = 0;
      alanSleep.scale = S;
      alanSleep.x = 462 * S;
      alanSleep.y = 70 * S;
      alanSleep.visible = false;
      active.add(alanSleep);

      door.layer = 'walkbehind';
      door.anchorX = 0;
      door.anchorY = 0;
      door.scale = S;
      door.x = 180 * S;
      door.y = 48 * S;
      door.visible = true;
      door.stop(clips.get('door-open')?.frames[0]);
      active.add(door);

      chayaBg.layer = 'walkbehind';
      chaya.layer = 'walkbehind';
      chayaBg.visible = false;
      chaya.visible = false;
      chayaBg.image = active.assets.image('grandmaBg') ?? null;
      // Drawn by the clipped screen node; keep them out of the main list.
      zzz.anchorX = 0;
      zzz.anchorY = 0;
      zzz.scale = S;
      zzz.x = 540 * S;
      zzz.y = 66 * S;
      zzz.visible = false;
      zzz.sortAt = 500;
      active.add(zzz);
      active.add(screen);
      active.add(decor);
      active.add(ui);
      mode = 'banner';
      window.setTimeout(() => {
        armed = true;
      }, 280);
    },
    update(dt) {
      if (game.input.esc) {
        backToStart();
        return;
      }
      if (game.input.left) {
        if (!armed || leaving) return;
        if (mode === 'banner') {
          mode = 'script';
          bannerOn = false;
          showFrom(0);
          return;
        }
        if (mode === 'end') {
          leaving = true;
          backToStart();
          return;
        }
        if (!boxOn) return;
        standTalkers();
        boxOn = false;
        showFrom(line + 1);
      }
      bridgeTime += dt;
      if (bridgeTime >= 0.65) {
        bridgeTime = 0;
        bridgeFrame = 1 - bridgeFrame;
        bridge.image = game.assets.image(bridgeFrame === 0 ? 'bridge0' : 'bridge1') ?? bridge.image;
      }
      for (const sprite of [alanSleep, alan, naomi, joe, dandan, eithan, davdav, chaya, door, zzz]) sprite.update(dt);
      for (const item of tweens) item.update(dt);
      if (alarm > 0) {
        alarm -= dt;
        alarmAlpha = 0.38 * Math.abs(Math.sin(alarm * 34));
      } else alarmAlpha = 0;
      if (shakeLeft > 0) {
        shakeLeft -= dt;
        game.camera.x = (Math.random() - 0.5) * shakeMag;
        game.camera.y = (Math.random() - 0.5) * shakeMag;
      } else {
        game.camera.x = 0;
        game.camera.y = 0;
      }
      light += dt;
      if (light > 0.28) {
        light = 0;
        laundryOn = !laundryOn;
      }
    },
    exit() {
      leaving = true;
      game.camera.x = 0;
      game.camera.y = 0;
    },
  };
}
