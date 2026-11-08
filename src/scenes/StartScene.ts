import Phaser from 'phaser';
import { mountStartScreen } from '../start/mount';

export class StartScene extends Phaser.Scene {
  private unmount?: () => void;

  constructor() {
    super('start');
  }

  create(): void {
    this.unmount = mountStartScreen({
      onStart: () => this.scene.start('episode'),
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unmount?.();
      this.unmount = undefined;
    });
  }
}
