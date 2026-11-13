import type { Game, Node, Scene } from '../engine/types';
import { HEIGHT, WIDTH } from '../engine/types';
import { mountStartScreen } from '../start/mount';

/** Start screen and intro stay the existing DOM/canvas flow, hosted by a scene. */
export function startScene(): Scene {
  let stop: (() => void) | undefined;
  return {
    enter(game) {
      stop = mountStartScreen({
        onStart: () => game.replace(episodeCard(game)),
      });
    },
    exit() {
      stop?.();
      stop = undefined;
    },
  };
}

/** Phase 0 stand-in. Phase 1 replaces this with the Grandma cutscene. */
export function episodeCard(game: Game): Scene {
  let card: Node | undefined;
  let gone = false;
  const leave = () => {
    if (gone) return;
    gone = true;
    game.replace(startScene());
  };
  return {
    enter(active) {
      card = {
        layer: 'ui',
        depth: 0,
        visible: true,
        hit: { x: 410, y: 440, w: 1100, h: 200 },
        draw(ctx) {
          ctx.fillStyle = 'rgba(10, 13, 26, 0.94)';
          ctx.strokeStyle = '#d9b338';
          ctx.lineWidth = 4;
          ctx.fillRect(410, 440, 1100, 200);
          ctx.strokeRect(410, 440, 1100, 200);
          ctx.fillStyle = '#ffdb47';
          ctx.font = '52px "Open Sans", Verdana, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Episode 1: Grandma is calling', WIDTH / 2, HEIGHT / 2);
        },
      };
      active.add(card);
    },
    update() {
      if (game.input.left || game.input.esc) leave();
    },
    exit() {
      if (card) game.remove(card);
    },
  };
}
