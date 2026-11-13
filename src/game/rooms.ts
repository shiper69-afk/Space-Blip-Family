import type { Scene } from '../engine/types';
import { cockpitScene } from './cockpit';

/** Scene manager. Rooms enter through here so exits can load the next one. */
export function loadRoom(id: string, entry: string, leave: () => void): Scene | undefined {
  if (id !== 'cockpit') return undefined;
  return cockpitScene(entry, leave, (next, nextEntry) => loadRoom(next, nextEntry, leave));
}
