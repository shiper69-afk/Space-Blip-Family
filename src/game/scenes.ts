import type { Scene } from '../engine/types';
import { episodeScene } from './episode';
import { mountStartScreen } from '../start/mount';

/** Start screen and intro stay the existing DOM/canvas flow, hosted by a scene. */
export function startScene(): Scene {
  let stop: (() => void) | undefined;
  return {
    enter(game) {
      stop = mountStartScreen({
        onStart: () => game.replace(episodeScene(() => game.replace(startScene()))),
      });
    },
    exit() {
      stop?.();
      stop = undefined;
    },
  };
}
