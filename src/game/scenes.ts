import type { Scene } from '../engine/types';
import { loadRoom } from './rooms';
import { episodeScene } from './episode';
import { mountStartScreen } from '../start/mount';

/** Start screen and intro stay the existing DOM/canvas flow, hosted by a scene. */
export function startScene(): Scene {
  let stop: (() => void) | undefined;
  return {
    enter(game) {
      stop = mountStartScreen({
        onStart: () =>
          game.replace(
            episodeScene(
              () => game.replace(startScene()),
              () => {
                const room = loadRoom('cockpit', 'after-call', () => game.replace(startScene()));
                if (room) game.replace(room);
              },
            ),
          ),
      });
    },
    exit() {
      stop?.();
      stop = undefined;
    },
  };
}
